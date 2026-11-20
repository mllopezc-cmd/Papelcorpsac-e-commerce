import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getFirebaseAdminFirestore } from './firebaseAdmin.js'
import {
  deleteUnreferencedProductImage,
  ProductImageReferencedError,
  S3UploadConfigurationError,
} from './s3Upload.js'

vi.mock('./firebaseAdmin.js', () => ({
  getFirebaseAdminFirestore: vi.fn(),
}))

const mockFirestore = vi.mocked(getFirebaseAdminFirestore)

const imageKey =
  'products/11111111-1111-4111-8111-111111111111.jpg'

let sendSpy: ReturnType<typeof vi.spyOn>
let destroySpy: ReturnType<typeof vi.spyOn>

function mockImageReferences(referenced: boolean) {
  const get = vi.fn().mockResolvedValue({
    empty: !referenced,
  })

  const limit = vi.fn().mockReturnValue({ get })
  const where = vi.fn().mockReturnValue({ limit })
  const collection = vi.fn().mockReturnValue({ where })

  mockFirestore.mockReturnValue({
    collection,
  } as never)

  return { collection, where, limit, get }
}

beforeEach(() => {
  vi.stubEnv('AWS_REGION', 'us-east-1')
  vi.stubEnv('S3_BUCKET', 'papelcorpsac-test')
  vi.stubEnv('AWS_ACCESS_KEY_ID', 'test-access-key')
  vi.stubEnv('AWS_SECRET_ACCESS_KEY', 'test-secret-key')

  sendSpy = vi
    .spyOn(S3Client.prototype, 'send')
    .mockResolvedValue({} as never)

  destroySpy = vi
    .spyOn(S3Client.prototype, 'destroy')
    .mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  mockFirestore.mockReset()
})

describe('deleteUnreferencedProductImage', () => {
  it('deletes a valid orphan image', async () => {
    const query = mockImageReferences(false)

    await deleteUnreferencedProductImage(imageKey)

    expect(query.collection).toHaveBeenCalledWith('products')
    expect(query.where).toHaveBeenCalledWith(
      'imageKey',
      '==',
      imageKey,
    )
    expect(query.limit).toHaveBeenCalledWith(1)
    expect(query.get).toHaveBeenCalledOnce()

    expect(sendSpy).toHaveBeenCalledOnce()

    const [command] = sendSpy.mock.calls[0]

    expect(command).toBeInstanceOf(DeleteObjectCommand)

    if (!(command instanceof DeleteObjectCommand)) {
      throw new Error('Expected DeleteObjectCommand')
    }

    expect(command.input).toEqual({
      Bucket: 'papelcorpsac-test',
      Key: imageKey,
    })

    expect(destroySpy).toHaveBeenCalledOnce()
  })

  it('blocks deletion when a product references the image', async () => {
    mockImageReferences(true)

    await expect(
      deleteUnreferencedProductImage(imageKey),
    ).rejects.toBeInstanceOf(ProductImageReferencedError)

    expect(sendSpy).not.toHaveBeenCalled()
  })

  it.each([
    '',
    'products/imagen.jpg',
    '../imagen.jpg',
    'other/11111111-1111-4111-8111-111111111111.jpg',
    'products/11111111-1111-4111-8111-111111111111.svg',
  ])('rejects an invalid key: %s', async (key) => {
    await expect(
      deleteUnreferencedProductImage(key),
    ).rejects.toThrow('Invalid product image key')

    expect(mockFirestore).not.toHaveBeenCalled()
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('does not delete if the Firestore query fails', async () => {
    const query = mockImageReferences(false)

    query.get.mockRejectedValue(
      new Error('Firestore unavailable'),
    )

    await expect(
      deleteUnreferencedProductImage(imageKey),
    ).rejects.toThrow('Firestore unavailable')

    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('does not delete if AWS configuration is missing', async () => {
    mockImageReferences(false)
    vi.stubEnv('AWS_SECRET_ACCESS_KEY', '')

    await expect(
      deleteUnreferencedProductImage(imageKey),
    ).rejects.toBeInstanceOf(S3UploadConfigurationError)

    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('propagates S3 failures without reporting success', async () => {
    mockImageReferences(false)

    sendSpy.mockRejectedValueOnce(
      new Error('S3 unavailable'),
    )

    await expect(
      deleteUnreferencedProductImage(imageKey),
    ).rejects.toThrow('S3 unavailable')

    expect(destroySpy).toHaveBeenCalledOnce()
  })
})
