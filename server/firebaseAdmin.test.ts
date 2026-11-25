import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  certMock,
  getAppMock,
  getAppsMock,
  getAuthMock,
  initializeAppMock,
} = vi.hoisted(() => ({
  certMock: vi.fn(() => ({ serviceAccount: true })),
  getAppMock: vi.fn(),
  getAppsMock: vi.fn(() => []),
  getAuthMock: vi.fn(() => ({ verified: true })),
  initializeAppMock: vi.fn((options, name) => ({
    name,
    options,
  })),
}))

vi.mock('firebase-admin/app', () => ({
  cert: certMock,
  getApp: getAppMock,
  getApps: getAppsMock,
  initializeApp: initializeAppMock,
}))

vi.mock('firebase-admin/auth', () => ({
  getAuth: getAuthMock,
}))

import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminAuth,
  resolveFirebaseAdminConfiguration,
} from './firebaseAdmin.js'

const localEmulatorEnvironment = {
  PAPELCORPSAC_USE_AUTH_EMULATOR: 'true',
  FIREBASE_PROJECT_ID: 'demo-papelcorpsac',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
}

const productionEnvironment = {
  VERCEL: '1',
  VERCEL_ENV: 'production',
  NODE_ENV: 'production',
  FIREBASE_PROJECT_ID: 'papelcorpsac',
}

const serviceAccountEnvironment = {
  ...productionEnvironment,
  FIREBASE_CLIENT_EMAIL:
    'papelcorpsac-admin@papelcorpsac.iam.gserviceaccount.com',
  FIREBASE_PRIVATE_KEY:
    '-----BEGIN PRIVATE KEY-----\\ntest-key\\n-----END PRIVATE KEY-----\\n',
}

beforeEach(() => {
  vi.clearAllMocks()
  getAppsMock.mockReturnValue([])
  certMock.mockReturnValue({ serviceAccount: true })
})

describe('resolveFirebaseAdminConfiguration', () => {
  it('accepts explicit local Authentication Emulator configuration', () => {
    expect(
      resolveFirebaseAdminConfiguration(localEmulatorEnvironment),
    ).toEqual({
      projectId: 'demo-papelcorpsac',
      emulatorEnabled: true,
    })
  })

  it('allows the explicit Vercel development environment', () => {
    expect(
      resolveFirebaseAdminConfiguration({
        ...localEmulatorEnvironment,
        VERCEL: '1',
        VERCEL_ENV: 'development',
      }).emulatorEnabled,
    ).toBe(true)
  })

  it.each([
    ['Vercel Preview', { VERCEL: '1', VERCEL_ENV: 'preview' }],
    ['Vercel Production', { VERCEL: '1', VERCEL_ENV: 'production' }],
    ['NODE_ENV production', { NODE_ENV: 'production' }],
    ['Vercel markers without an identified environment', { VERCEL: '1' }],
    [
      'Vercel URL marker without an identified environment',
      { VERCEL_URL: 'example.vercel.app' },
    ],
    [
      'Vercel environment without an explicit Vercel marker',
      { VERCEL_ENV: 'preview' },
    ],
    [
      'contradictory production and development indicators',
      { VERCEL: '1', VERCEL_ENV: 'development', NODE_ENV: 'production' },
    ],
    ['an unknown Vercel environment', { VERCEL: '1', VERCEL_ENV: 'local' }],
  ])('rejects %s when emulator mode is requested', (_description, markers) => {
    expect(() =>
      resolveFirebaseAdminConfiguration({
        ...localEmulatorEnvironment,
        ...markers,
      }),
    ).toThrow()
  })

  it.each([
    [
      'missing opt-in',
      {
        FIREBASE_PROJECT_ID: 'demo-papelcorpsac',
        FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
      },
    ],
    [
      'invalid opt-in',
      {
        ...localEmulatorEnvironment,
        PAPELCORPSAC_USE_AUTH_EMULATOR: 'yes',
      },
    ],
    [
      'wrong demo project',
      {
        ...localEmulatorEnvironment,
        FIREBASE_PROJECT_ID: 'other-demo-project',
      },
    ],
    [
      'wrong emulator host',
      {
        ...localEmulatorEnvironment,
        FIREBASE_AUTH_EMULATOR_HOST: 'localhost:9099',
      },
    ],
    [
      'a real project with emulator mode active',
      {
        ...localEmulatorEnvironment,
        FIREBASE_PROJECT_ID: 'papelcorpsac',
      },
    ],
    [
      'an emulator host when opt-in is false',
      {
        ...localEmulatorEnvironment,
        PAPELCORPSAC_USE_AUTH_EMULATOR: 'false',
      },
    ],
    [
      'an emulator opt-in without its required host',
      {
        PAPELCORPSAC_USE_AUTH_EMULATOR: 'true',
        FIREBASE_PROJECT_ID: 'demo-papelcorpsac',
      },
    ],
  ])('rejects %s', (_description, environment) => {
    expect(() =>
      resolveFirebaseAdminConfiguration(environment),
    ).toThrow()
  })

  it('requires an explicit project ID outside emulator mode', () => {
    expect(() => resolveFirebaseAdminConfiguration({})).toThrow()
    expect(() =>
      resolveFirebaseAdminConfiguration({
        FIREBASE_PROJECT_ID: 'papelcorpsac',
      }),
    ).not.toThrow()
  })
})

describe('Firebase Admin credentials for Vercel', () => {
  it('initializes Admin with service account credentials in Production', () => {
    getFirebaseAdminAuth(serviceAccountEnvironment)

    expect(certMock).toHaveBeenCalledWith({
      projectId: 'papelcorpsac',
      clientEmail:
        'papelcorpsac-admin@papelcorpsac.iam.gserviceaccount.com',
      privateKey:
        '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----',
    })

    expect(initializeAppMock).toHaveBeenCalledWith(
      {
        projectId: 'papelcorpsac',
        credential: { serviceAccount: true },
      },
      'papelcorpsac-api',
    )
    expect(getAuthMock).toHaveBeenCalledTimes(1)
  })

  it('requires credentials for Vercel Preview', () => {
    expect(() =>
      getFirebaseAdminAuth({
        ...productionEnvironment,
        VERCEL_ENV: 'preview',
      }),
    ).toThrow(FirebaseAdminConfigurationError)

    expect(initializeAppMock).not.toHaveBeenCalled()
  })

  it('requires credentials for Vercel Production', () => {
    expect(() =>
      getFirebaseAdminAuth(productionEnvironment),
    ).toThrow(FirebaseAdminConfigurationError)

    expect(initializeAppMock).not.toHaveBeenCalled()
  })
  it('rejects a missing client email', () => {
    expect(() =>
      getFirebaseAdminAuth({
        ...productionEnvironment,
        FIREBASE_PRIVATE_KEY:
          serviceAccountEnvironment.FIREBASE_PRIVATE_KEY,
      }),
    ).toThrow(FirebaseAdminConfigurationError)

    expect(initializeAppMock).not.toHaveBeenCalled()
  })

  it('rejects a missing private key', () => {
    expect(() =>
      getFirebaseAdminAuth({
        ...productionEnvironment,
        FIREBASE_CLIENT_EMAIL:
          serviceAccountEnvironment.FIREBASE_CLIENT_EMAIL,
      }),
    ).toThrow(FirebaseAdminConfigurationError)

    expect(initializeAppMock).not.toHaveBeenCalled()
  })

  it('rejects invalid service account data without leaking details', () => {
    certMock.mockImplementationOnce(() => {
      throw new Error('Private credential validation failed')
    })

    expect(() =>
      getFirebaseAdminAuth(serviceAccountEnvironment),
    ).toThrow(FirebaseAdminConfigurationError)

    expect(() =>
      getFirebaseAdminAuth({
        ...productionEnvironment,
        FIREBASE_CLIENT_EMAIL: 'invalid@example.test',
        FIREBASE_PRIVATE_KEY: '',
      }),
    ).toThrow('Firebase Admin server configuration is invalid.')
  })

  it('preserves local initialization without explicit credentials', () => {
    getFirebaseAdminAuth({
      FIREBASE_PROJECT_ID: 'papelcorpsac',
    })

    expect(initializeAppMock).toHaveBeenCalledWith(
      { projectId: 'papelcorpsac' },
      'papelcorpsac-api',
    )
    expect(certMock).not.toHaveBeenCalled()
  })

  it('preserves local emulator initialization without credentials', () => {
    getFirebaseAdminAuth(localEmulatorEnvironment)

    expect(initializeAppMock).toHaveBeenCalledWith(
      { projectId: 'demo-papelcorpsac' },
      'papelcorpsac-api',
    )
    expect(certMock).not.toHaveBeenCalled()
  })

  it('does not allow partial credentials in local mode', () => {
    expect(() =>
      getFirebaseAdminAuth({
        FIREBASE_PROJECT_ID: 'papelcorpsac',
        FIREBASE_CLIENT_EMAIL: 'admin@example.test',
      }),
    ).toThrow(FirebaseAdminConfigurationError)
  })
})
