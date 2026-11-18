import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getFirebaseAdminFirestore } from './firebaseAdmin.js'
import {
  createPresignedUpload,
  MAX_IMAGE_SIZE_BYTES,
  parseUploadImageInput,
  S3UploadConfigurationError,
  UPLOAD_URL_EXPIRES_IN,
  userIsAdmin,
} from './s3Upload.js'

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn(),
}))

vi.mock('./firebaseAdmin.js', () => ({
  getFirebaseAdminFirestore: vi.fn(),
}))

const mockSignedUrl = vi.mocked(getSignedUrl)
const mockFirestore = vi.mocked(getFirebaseAdminFirestore)

beforeEach(() => {
  vi.stubEnv('AWS_REGION', 'us-east-1')
  vi.stubEnv('S3_BUCKET', 'papelcorpsac-test')
  vi.stubEnv('AWS_ACCESS_KEY_ID', 'test-access-key')
  vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test-secret-key')

  mockSignedUrl.mockResolvedValue(
    'https://example.com/presigned-put',
  )
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.clearAllMocks()
})

describe('parseUploadImageInput', () => {
  it.each([
    ['image/jpeg', 1000],
    ['image/png', 2000],
    ['image/webp', MAX_IMAGE_SIZE_BYTES],
  ])('accepts %s with a valid size', (contentType, size) => {
    expect(
      parseUploadImageInput({ contentType, size }),
    ).toEqual({ contentType, size })
  })

  it.each([
    { contentType: 'image/svg+xml', size: 1000 },
    { contentType: 'text/html', size: 1000 },
    { contentType: 'image/jpeg', size: 0 },
    { contentType: 'image/jpeg', size: -1 },
    { contentType: 'image/jpeg', size: 1.5 },
    { contentType: 'image/jpeg', size: MAX_IMAGE_SIZE_BYTES + 1 },
    { contentType: 'image/jpeg', size: '1000' },
    {
      contentType: 'image/jpeg',
      size: 1000,
      key: 'products/custom.jpg',
    },
  ])('rejects invalid input %#', (input) => {
    expect(parseUploadImageInput(input)).toBeNull()
  })

  it('rejects malformed values', () => {
    expect(parseUploadImageInput(null)).toBeNull()
    expect(parseUploadImageInput([])).toBeNull()
    expect(parseUploadImageInput('image/jpeg')).toBeNull()
  })
})

describe('userIsAdmin', () => {
  function mockUser(role: string | null) {
    const get = vi.fn().mockResolvedValue({
      exists: role !== null,
      data: () => (role ? { role } : undefined),
    })

    mockFirestore.mockReturnValue({
      collection: () => ({
        doc: () => ({ get }),
      }),
    } as never)

    return get
  }

  it('allows an administrator', async () => {
    const get = mockUser('admin')

    await expect(userIsAdmin('admin-uid')).resolves.toBe(true)
    expect(get).toHaveBeenCalledOnce()
  })

  it('rejects a customer', async () => {
    mockUser('customer')

    await expect(userIsAdmin('customer-uid')).resolves.toBe(false)
  })

  it('rejects a missing profile', async () => {
    mockUser(null)

    await expect(userIsAdmin('missing-uid')).resolves.toBe(false)
  })

  it('rejects an empty UID without accessing Firestore', async () => {
    await expect(userIsAdmin('')).resolves.toBe(false)

    expect(mockFirestore).not.toHaveBeenCalled()
  })
})

describe('createPresignedUpload', () => {
  it('generates a short-lived signed PUT request', async () => {
    const result = await createPresignedUpload({
      contentType: 'image/png',
      size: 2048,
    })

    expect(result).toEqual({
      url: 'https://example.com/presigned-put',
      key: expect.stringMatching(
        /^products\/[0-9a-f-]{36}\.png$/,
      ),
      contentType: 'image/png',
      expiresIn: UPLOAD_URL_EXPIRES_IN,
    })

    expect(mockSignedUrl).toHaveBeenCalledOnce()

    const [, command, options] = mockSignedUrl.mock.calls[0]

    expect(command).toBeInstanceOf(PutObjectCommand)

    if (!(command instanceof PutObjectCommand)) {
      throw new Error('Expected PutObjectCommand')
    }

    expect(command.input).toMatchObject({
      Bucket: 'papelcorpsac-test',
      Key: result.key,
      ContentType: 'image/png',
      ContentLength: 2048,
    })

    expect(options).toMatchObject({
      expiresIn: 60,
    })

    expect(options?.signableHeaders).toEqual(
      new Set(['content-type', 'content-length']),
    )
  })

  it('generates a different key for each image', async () => {
    const first = await createPresignedUpload({
      contentType: 'image/jpeg',
      size: 100,
    })

    const second = await createPresignedUpload({
      contentType: 'image/jpeg',
      size: 100,
    })

    expect(first.key).not.toBe(second.key)
    expect(first.key.endsWith('.jpg')).toBe(true)
  })

  it('rejects missing AWS credentials before signing', async () => {
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', '')

    await expect(
      createPresignedUpload({
        contentType: 'image/jpeg',
        size: 100,
      }),
    ).rejects.toBeInstanceOf(S3UploadConfigurationError)

    expect(mockSignedUrl).not.toHaveBeenCalled()
  })

  it('rejects an unexpected AWS region', async () => {
    vi.stubEnv('AWS_REGION', 'eu-west-1')

    await expect(
      createPresignedUpload({
        contentType: 'image/webp',
        size: 100,
      }),
    ).rejects.toBeInstanceOf(S3UploadConfigurationError)
  })
})
