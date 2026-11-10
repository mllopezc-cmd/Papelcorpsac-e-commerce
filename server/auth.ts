import type { IncomingMessage } from 'node:http'
import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminAuth,
  resolveFirebaseAdminConfiguration,
} from './firebaseAdmin.js'

export type AuthFailureKind =
  | 'unauthorized'
  | 'configuration'
  | 'unavailable'
  | 'internal'

export class AuthRequestError extends Error {
  constructor(readonly kind: AuthFailureKind) {
    super(kind)
    this.name = 'AuthRequestError'
  }
}

export type VerifiedIdentity = {
  uid: string
}

type VerifyOptions = {
  checkRevoked?: boolean
}

function unauthorized(): never {
  throw new AuthRequestError('unauthorized')
}

function getBearerToken(request: IncomingMessage): {
  token: string
  hasSignature: boolean
} {
  const rawAuthorizationHeaders: string[] = []

  for (let index = 0; index < request.rawHeaders.length; index += 2) {
    if (request.rawHeaders[index].toLowerCase() === 'authorization') {
      rawAuthorizationHeaders.push(request.rawHeaders[index + 1])
    }
  }

  if (rawAuthorizationHeaders.length > 1) {
    return unauthorized()
  }

  const authorization =
    rawAuthorizationHeaders[0] ?? request.headers.authorization

  if (
    typeof authorization !== 'string' ||
    authorization.includes(',')
  ) {
    return unauthorized()
  }

  const match =
    /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.([A-Za-z0-9_-]*))$/i.exec(
      authorization,
    )

  if (!match) {
    return unauthorized()
  }

  return { token: match[1], hasSignature: match[2].length > 0 }
}

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code
  }

  return undefined
}

function isInvalidTokenError(code: string | undefined): boolean {
  return (
    code === 'auth/argument-error' ||
    code === 'auth/id-token-expired' ||
    code === 'auth/id-token-revoked' ||
    code === 'auth/invalid-id-token' ||
    code === 'auth/user-disabled'
  )
}

function isTransientError(code: string | undefined): boolean {
  return (
    code === 'app/network-error' ||
    code === 'auth/network-request-failed' ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'EAI_AGAIN' ||
    code === 'ENOTFOUND'
  )
}

function isVerifiedToken(value: unknown): value is { uid: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'uid' in value &&
    typeof value.uid === 'string' &&
    value.uid.length > 0
  )
}

export async function verifyBearerRequest(
  request: IncomingMessage,
  options: VerifyOptions = {},
): Promise<VerifiedIdentity> {
  const { token, hasSignature } = getBearerToken(request)

  if (!hasSignature) {
    let emulatorEnabled: boolean
    try {
      emulatorEnabled = resolveFirebaseAdminConfiguration().emulatorEnabled
    } catch (error: unknown) {
      if (error instanceof FirebaseAdminConfigurationError) {
        throw new AuthRequestError('configuration')
      }

      throw new AuthRequestError('internal')
    }

    if (!emulatorEnabled) {
      unauthorized()
    }
  }

  let auth: ReturnType<typeof getFirebaseAdminAuth>
  try {
    auth = getFirebaseAdminAuth()
  } catch (error: unknown) {
    if (error instanceof FirebaseAdminConfigurationError) {
      throw new AuthRequestError('configuration')
    }

    throw new AuthRequestError('internal')
  }

  let decodedToken: unknown
  try {
    decodedToken = options.checkRevoked
      ? await auth.verifyIdToken(token, true)
      : await auth.verifyIdToken(token)
  } catch (error: unknown) {
    const code = getErrorCode(error)

    if (isInvalidTokenError(code)) {
      throw new AuthRequestError('unauthorized')
    }

    if (isTransientError(code)) {
      throw new AuthRequestError('unavailable')
    }

    throw new AuthRequestError('internal')
  }

  if (!isVerifiedToken(decodedToken)) {
    throw new AuthRequestError('internal')
  }

  return { uid: decodedToken.uid }
}
