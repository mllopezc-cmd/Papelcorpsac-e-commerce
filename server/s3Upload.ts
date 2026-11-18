import { randomUUID } from 'node:crypto'
import {
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getFirebaseAdminFirestore } from './firebaseAdmin.js'

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
export const UPLOAD_URL_EXPIRES_IN = 60

const IMAGE_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const

export type ImageContentType = keyof typeof IMAGE_EXTENSIONS

export type UploadImageInput = {
  contentType: ImageContentType
  size: number
}

export type UploadImageResult = {
  url: string
  key: string
  contentType: ImageContentType
  expiresIn: number
}

export class S3UploadConfigurationError extends Error {
  constructor() {
    super('Invalid S3 upload configuration')
    this.name = 'S3UploadConfigurationError'
  }
}

export function parseUploadImageInput(
  value: unknown,
): UploadImageInput | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return null
  }

  const input = value as Record<string, unknown>
  const keys = Object.keys(input)

  if (
    keys.length !== 2 ||
    !keys.includes('contentType') ||
    !keys.includes('size')
  ) {
    return null
  }

  if (
    typeof input.contentType !== 'string' ||
    !Object.prototype.hasOwnProperty.call(
      IMAGE_EXTENSIONS,
      input.contentType,
    ) ||
    typeof input.size !== 'number' ||
    !Number.isSafeInteger(input.size) ||
    input.size <= 0 ||
    input.size > MAX_IMAGE_SIZE_BYTES
  ) {
    return null
  }

  return {
    contentType: input.contentType as ImageContentType,
    size: input.size,
  }
}

export async function userIsAdmin(uid: string): Promise<boolean> {
  if (!uid) {
    return false
  }

  const snapshot = await getFirebaseAdminFirestore()
    .collection('users')
    .doc(uid)
    .get()

  return snapshot.exists && snapshot.data()?.role === 'admin'
}

function getS3Configuration(): {
  client: S3Client
  bucket: string
} {
  const region = process.env.AWS_REGION?.trim()
  const bucket = process.env.S3_BUCKET?.trim()
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim()
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim()

  if (
    region !== 'us-east-1' ||
    !bucket ||
    !accessKeyId ||
    !secretAccessKey
  ) {
    throw new S3UploadConfigurationError()
  }

  return {
    client: new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
    }),
    bucket,
  }
}

export async function createPresignedUpload(
  input: UploadImageInput,
): Promise<UploadImageResult> {
  const validated = parseUploadImageInput(input)

  if (!validated) {
    throw new Error('Invalid image upload request')
  }

  const { client, bucket } = getS3Configuration()
  const extension = IMAGE_EXTENSIONS[validated.contentType]
  const key = `products/${randomUUID()}.${extension}`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: validated.contentType,
    ContentLength: validated.size,
  })

  const url = await getSignedUrl(client, command, {
    expiresIn: UPLOAD_URL_EXPIRES_IN,
    signableHeaders: new Set([
      'content-type',
      'content-length',
    ]),
  })

  return {
    url,
    key,
    contentType: validated.contentType,
    expiresIn: UPLOAD_URL_EXPIRES_IN,
  }
}
