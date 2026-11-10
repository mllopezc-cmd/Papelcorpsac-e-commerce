import { describe, expect, it } from 'vitest'
import { resolveFirebaseAdminConfiguration } from './firebaseAdmin.js'

const localEmulatorEnvironment = {
  PAPELCORPSAC_USE_AUTH_EMULATOR: 'true',
  FIREBASE_PROJECT_ID: 'demo-papelcorpsac',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
}

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
