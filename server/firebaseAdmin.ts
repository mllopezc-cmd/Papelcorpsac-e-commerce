import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type AppOptions,
} from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const ADMIN_APP_NAME = 'papelcorpsac-api'
const DEMO_PROJECT_ID = 'demo-papelcorpsac'
const AUTH_EMULATOR_HOST = '127.0.0.1:9099'
const FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'

export class FirebaseAdminConfigurationError extends Error {
  constructor() {
    super('Firebase Admin server configuration is invalid.')
    this.name = 'FirebaseAdminConfigurationError'
  }
}

type FirebaseAdminConfiguration = {
  projectId: string
  emulatorEnabled: boolean
}

function hasVercelMarkers(env: NodeJS.ProcessEnv): boolean {
  return Object.entries(env).some(
    ([name, value]) =>
      (name === 'VERCEL' || name.startsWith('VERCEL_')) &&
      value !== undefined,
  )
}

export function resolveFirebaseAdminConfiguration(
  env: NodeJS.ProcessEnv = process.env,
): FirebaseAdminConfiguration {
  const projectId = env.FIREBASE_PROJECT_ID?.trim()
  const emulatorFlag = env.PAPELCORPSAC_USE_AUTH_EMULATOR
  const emulatorHost = env.FIREBASE_AUTH_EMULATOR_HOST

  if (
    !projectId ||
    (emulatorFlag !== undefined &&
      emulatorFlag !== 'true' &&
      emulatorFlag !== 'false')
  ) {
    throw new FirebaseAdminConfigurationError()
  }

  const emulatorEnabled = emulatorFlag === 'true'

  if (emulatorHost !== undefined && !emulatorEnabled) {
    throw new FirebaseAdminConfigurationError()
  }

  if (!emulatorEnabled) {
    if (projectId === DEMO_PROJECT_ID) {
      throw new FirebaseAdminConfigurationError()
    }

    return { projectId, emulatorEnabled: false }
  }

  const vercelEnvironment = env.VERCEL_ENV
  const vercelMarkersPresent = hasVercelMarkers(env)
  const vercelEnvironmentIsInvalid =
    vercelEnvironment !== undefined && vercelEnvironment !== 'development'
  const vercelMarkersLackDevelopmentEnvironment =
    vercelMarkersPresent && vercelEnvironment !== 'development'

  if (
    projectId !== DEMO_PROJECT_ID ||
    emulatorHost !== AUTH_EMULATOR_HOST ||
    env.NODE_ENV === 'production' ||
    vercelEnvironmentIsInvalid ||
    vercelMarkersLackDevelopmentEnvironment
  ) {
    throw new FirebaseAdminConfigurationError()
  }

  return { projectId, emulatorEnabled: true }
}

function getAdminOptions(
  env: NodeJS.ProcessEnv,
  configuration: FirebaseAdminConfiguration,
): AppOptions {
  const { projectId, emulatorEnabled } = configuration

  if (emulatorEnabled) {
    return { projectId }
  }

  const clientEmail = env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').trim()

  const isVercelDeployment =
    env.VERCEL_ENV === 'preview' ||
    env.VERCEL_ENV === 'production'

  if (!clientEmail && !privateKey) {
    if (isVercelDeployment) {
      throw new FirebaseAdminConfigurationError()
    }

    return { projectId }
  }

  if (!clientEmail || !privateKey) {
    throw new FirebaseAdminConfigurationError()
  }

  try {
    return {
      projectId,
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    }
  } catch {
    throw new FirebaseAdminConfigurationError()
  }
}

function getFirebaseAdminApp(
  env: NodeJS.ProcessEnv = process.env,
) {
  const configuration = resolveFirebaseAdminConfiguration(env)
  const options = getAdminOptions(env, configuration)
  const appExists = getApps().some(
    (app) => app.name === ADMIN_APP_NAME,
  )

  const app = appExists
    ? getApp(ADMIN_APP_NAME)
    : initializeApp(options, ADMIN_APP_NAME)

  if (app.options.projectId !== configuration.projectId) {
    throw new FirebaseAdminConfigurationError()
  }

  return app
}

export function getFirebaseAdminAuth(
  env: NodeJS.ProcessEnv = process.env,
) {
  return getAuth(getFirebaseAdminApp(env))
}

export function getFirebaseAdminFirestore() {
  const { emulatorEnabled } = resolveFirebaseAdminConfiguration()
  const firestoreEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST

  if (emulatorEnabled) {
    if (firestoreEmulatorHost !== FIRESTORE_EMULATOR_HOST) {
      throw new FirebaseAdminConfigurationError()
    }
  } else if (firestoreEmulatorHost !== undefined) {
    throw new FirebaseAdminConfigurationError()
  }

  return getFirestore(getFirebaseAdminApp())
}
