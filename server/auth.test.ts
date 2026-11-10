import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getAppMock, getAppsMock, getAuthMock, verifyIdTokenMock } = vi.hoisted(() => {
  const verifyIdTokenMock = vi.fn()
  const getAppMock = vi.fn(() => ({
    name: 'papelcorpsac-api',
    options: { projectId: process.env.FIREBASE_PROJECT_ID },
  }))
  return {
    getAppMock,
    getAppsMock: vi.fn(() => [
      {
        name: 'papelcorpsac-api',
        options: { projectId: process.env.FIREBASE_PROJECT_ID },
      },
    ]),
    getAuthMock: vi.fn(() => ({ verifyIdToken: verifyIdTokenMock })),
    verifyIdTokenMock,
  }
})

vi.mock('firebase-admin/app', () => ({
  getApp: getAppMock,
  getApps: getAppsMock,
  initializeApp: vi.fn(),
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: getAuthMock,
}))

import { verifyBearerRequest } from './auth.js'

const signedToken = 'header.payload.signature'
const unsignedToken = 'header.payload.'
const environmentKeys = [
  'FIREBASE_PROJECT_ID',
  'PAPELCORPSAC_USE_AUTH_EMULATOR',
  'FIREBASE_AUTH_EMULATOR_HOST',
  'NODE_ENV',
] as const

let originalEnvironment = new Map<string, string | undefined>()

function createRequest(
  authorization?: string,
  rawAuthorizationHeaders: string[] = authorization ? [authorization] : [],
) {
  const rawHeaders = rawAuthorizationHeaders.flatMap((value) => [
    'authorization',
    value,
  ])
  return {
    headers: authorization ? { authorization } : {},
    rawHeaders,
  } as never
}

function setEmulatorEnvironment(): void {
  process.env.PAPELCORPSAC_USE_AUTH_EMULATOR = 'true'
  process.env.FIREBASE_PROJECT_ID = 'demo-papelcorpsac'
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
}

beforeEach(() => {
  vi.clearAllMocks()
  originalEnvironment = new Map()

  const vercelKeys = Object.keys(process.env).filter(
    (name) => name === 'VERCEL' || name.startsWith('VERCEL_'),
  )

  for (const name of [...environmentKeys, ...vercelKeys]) {
    if (!originalEnvironment.has(name)) {
      originalEnvironment.set(name, process.env[name])
    }
    delete process.env[name]
  }

  process.env.NODE_ENV = 'test'
  setEmulatorEnvironment()
  verifyIdTokenMock.mockResolvedValue({
    uid: 'verified-user',
    email: 'private@example.test',
  })
})

afterEach(() => {
  for (const [name, value] of originalEnvironment) {
    if (value === undefined) {
      delete process.env[name]
    } else {
      process.env[name] = value
    }
  }
})

describe('verifyBearerRequest', () => {
  it.each([
    ['missing', createRequest()],
    ['wrong scheme', createRequest(`Basic ${signedToken}`)],
    ['empty Bearer', createRequest('Bearer ')],
    ['malformed token', createRequest('Bearer not-a-jwt')],
    ['empty header segment', createRequest('Bearer .payload.signature')],
    ['empty payload segment', createRequest('Bearer header..signature')],
    [
      'duplicate headers',
      createRequest(`Bearer ${signedToken}`, [
        `Bearer ${signedToken}`,
        `Bearer ${signedToken}`,
      ]),
    ],
  ])('rejects %s Authorization headers', async (_description, request) => {
    await expect(verifyBearerRequest(request)).rejects.toMatchObject({
      kind: 'unauthorized',
    })
    expect(getAppsMock).not.toHaveBeenCalled()
  })

  it('passes an unsigned JWT to Firebase Admin only with valid emulator configuration', async () => {
    const identity = await verifyBearerRequest(
      createRequest(`Bearer ${unsignedToken}`),
    )

    expect(verifyIdTokenMock).toHaveBeenCalledWith(unsignedToken)
    expect(identity).toEqual({ uid: 'verified-user' })
  })

  it('rejects an unsigned JWT outside emulator mode without initializing Admin', async () => {
    delete process.env.PAPELCORPSAC_USE_AUTH_EMULATOR
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST
    process.env.FIREBASE_PROJECT_ID = 'papelcorpsac'

    await expect(
      verifyBearerRequest(createRequest(`Bearer ${unsignedToken}`)),
    ).rejects.toMatchObject({
      kind: 'unauthorized',
      message: 'unauthorized',
    })
    expect(getAppsMock).not.toHaveBeenCalled()
  })

  it('classifies invalid emulator configuration as a server configuration failure', async () => {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'

    await expect(
      verifyBearerRequest(createRequest(`Bearer ${unsignedToken}`)),
    ).rejects.toMatchObject({
      kind: 'configuration',
      message: 'configuration',
    })
    expect(getAppsMock).not.toHaveBeenCalled()
  })

  it('rejects a signed JWT when emulator configuration is invalid', async () => {
    process.env.PAPELCORPSAC_USE_AUTH_EMULATOR = 'invalid'

    await expect(
      verifyBearerRequest(createRequest(`Bearer ${signedToken}`)),
    ).rejects.toMatchObject({
      kind: 'configuration',
      message: 'configuration',
    })
  })

  it('preserves verification of a signed JWT in normal mode', async () => {
    delete process.env.PAPELCORPSAC_USE_AUTH_EMULATOR
    delete process.env.FIREBASE_AUTH_EMULATOR_HOST
    process.env.FIREBASE_PROJECT_ID = 'papelcorpsac'

    const identity = await verifyBearerRequest(
      createRequest(`Bearer ${signedToken}`),
    )

    expect(verifyIdTokenMock).toHaveBeenCalledWith(signedToken)
    expect(identity).toEqual({ uid: 'verified-user' })
  })

  it('returns only the UID from Firebase Admin verification', async () => {
    const identity = await verifyBearerRequest(
      createRequest(`Bearer ${signedToken}`),
    )

    expect(identity).toEqual({ uid: 'verified-user' })
    expect(identity).not.toHaveProperty('email')
    expect(verifyIdTokenMock).toHaveBeenCalledWith(signedToken)
  })

  it.each([
    'auth/argument-error',
    'auth/invalid-id-token',
    'auth/id-token-expired',
  ])('maps %s to a generic authentication failure', async (code) => {
    verifyIdTokenMock.mockRejectedValue({ code, message: signedToken })

    await expect(
      verifyBearerRequest(createRequest(`Bearer ${signedToken}`)),
    ).rejects.toMatchObject({
      kind: 'unauthorized',
      message: 'unauthorized',
    })
  })

  it.each([
    ['missing UID', {}],
    ['empty UID', { uid: '' }],
  ])('rejects Firebase Admin result with %s', async (_description, result) => {
    verifyIdTokenMock.mockResolvedValue(result)

    await expect(
      verifyBearerRequest(createRequest(`Bearer ${signedToken}`)),
    ).rejects.toMatchObject({
      kind: 'internal',
      message: 'internal',
    })
  })

  it('maps unexpected SDK failures to an internal failure without details', async () => {
    verifyIdTokenMock.mockRejectedValue({
      code: 'unexpected-sdk-error',
      message: `sensitive ${signedToken}`,
    })

    await expect(
      verifyBearerRequest(createRequest(`Bearer ${signedToken}`)),
    ).rejects.toMatchObject({
      kind: 'internal',
      message: 'internal',
    })
  })

  it('uses verifyIdToken without the revocation flag by default', async () => {
    await verifyBearerRequest(createRequest(`Bearer ${signedToken}`))

    expect(verifyIdTokenMock).toHaveBeenCalledWith(signedToken)
  })

  it('supports explicit revocation checking for future sensitive operations', async () => {
    await verifyBearerRequest(createRequest(`Bearer ${signedToken}`), {
      checkRevoked: true,
    })

    expect(verifyIdTokenMock).toHaveBeenCalledWith(signedToken, true)
  })

  it('maps configuration errors to a generic configuration failure', async () => {
    process.env.FIREBASE_PROJECT_ID = ''

    await expect(
      verifyBearerRequest(createRequest(`Bearer ${signedToken}`)),
    ).rejects.toMatchObject({
      kind: 'configuration',
      message: 'configuration',
    })
  })

  it('maps known transient verification failures to service unavailable', async () => {
    verifyIdTokenMock.mockRejectedValue({
      code: 'ETIMEDOUT',
      message: signedToken,
    })

    await expect(
      verifyBearerRequest(createRequest(`Bearer ${signedToken}`)),
    ).rejects.toMatchObject({
      kind: 'unavailable',
      message: 'unavailable',
    })
  })
})
