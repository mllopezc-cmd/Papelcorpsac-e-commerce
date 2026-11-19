import { getIdToken, type User } from 'firebase/auth'

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export type UploadedProductImage = {
  key: string
}

export function validateProductImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Selecciona una imagen JPEG, PNG o WebP.'
  }

  if (
    !Number.isSafeInteger(file.size) ||
    file.size < 1 ||
    file.size > MAX_IMAGE_SIZE
  ) {
    return 'La imagen debe tener un tamaño máximo de 5 MiB.'
  }

  return null
}

function isSignedUpload(
  value: unknown,
  file: File,
): value is { url: string; key: string } {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('url' in value) ||
    !('key' in value) ||
    !('contentType' in value) ||
    !('expiresIn' in value) ||
    typeof value.url !== 'string' ||
    typeof value.key !== 'string' ||
    value.contentType !== file.type ||
    value.expiresIn !== 60 ||
    !/^products\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(value.key)
  ) {
    return false
  }

  try {
    const url = new URL(value.url)

    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (
        url.hostname === 's3.us-east-1.amazonaws.com' ||
        url.hostname.endsWith('.s3.us-east-1.amazonaws.com')
      ) &&
      url.searchParams.has('X-Amz-Signature')
    )
  } catch {
    return false
  }
}

export async function uploadProductImage(
  user: User,
  file: File,
): Promise<UploadedProductImage> {
  const validationError = validateProductImage(file)

  if (validationError) {
    throw new Error(validationError)
  }

  let token: string

  try {
    token = await getIdToken(user)
  } catch {
    throw new Error('La sesión no es válida. Inicia sesión nuevamente.')
  }

  let response: Response

  try {
    response = await fetch('/api/product-image-upload-url', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: file.type,
        size: file.size,
      }),
      cache: 'no-store',
    })
  } catch {
    throw new Error('No se pudo conectar con el servicio de imágenes.')
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('La sesión ha caducado.')
    }

    if (response.status === 403) {
      throw new Error('No tienes permiso para subir imágenes.')
    }

    throw new Error('No se pudo solicitar la URL de subida.')
  }

  if (
    response.status !== 200 ||
    !response.headers
      .get('content-type')
      ?.toLowerCase()
      .includes('application/json')
  ) {
    throw new Error('La respuesta del servidor no es válida.')
  }

  let data: unknown

  try {
    data = await response.json()
  } catch {
    throw new Error('La respuesta del servidor no es válida.')
  }

  if (!isSignedUpload(data, file)) {
    throw new Error('La respuesta del servidor no es válida.')
  }

  let uploadResponse: Response

  try {
    uploadResponse = await fetch(data.url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    })
  } catch {
    throw new Error('No se pudo conectar con AWS S3.')
  }

  if (!uploadResponse.ok) {
    throw new Error('AWS S3 rechazó la subida de la imagen.')
  }

  return { key: data.key }
}
