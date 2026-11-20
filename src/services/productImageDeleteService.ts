import { getIdToken, type User } from 'firebase/auth'

const PRODUCT_IMAGE_KEY_PATTERN =
  /^products\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|webp)$/

function isValidProductImageKey(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    PRODUCT_IMAGE_KEY_PATTERN.test(value)
  )
}

function isDeleteResponse(
  value: unknown,
): value is { deleted: true } {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'deleted' in value &&
    value.deleted === true &&
    Object.keys(value).length === 1
  )
}

export async function deleteProductImage(
  user: User,
  key: string,
): Promise<void> {
  if (!isValidProductImageKey(key)) {
    throw new Error('La referencia de la imagen no es válida.')
  }

  let token: string

  try {
    token = await getIdToken(user)
  } catch {
    throw new Error(
      'La sesión no es válida. Inicia sesión nuevamente.',
    )
  }

  let response: Response

  try {
    response = await fetch('/api/product-image-delete', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key }),
      cache: 'no-store',
    })
  } catch {
    throw new Error(
      'No se pudo conectar con el servicio de imágenes.',
    )
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('La sesión ha caducado.')
    }

    if (response.status === 403) {
      throw new Error(
        'No tienes permiso para eliminar imágenes.',
      )
    }

    if (response.status === 409) {
      throw new Error(
        'La imagen está asociada a un producto y no puede eliminarse.',
      )
    }

    throw new Error(
      'No se pudo eliminar la imagen de AWS S3.',
    )
  }

  if (
    response.status !== 200 ||
    !response.headers
      .get('content-type')
      ?.toLowerCase()
      .includes('application/json')
  ) {
    throw new Error(
      'La respuesta del servidor no es válida.',
    )
  }

  let data: unknown

  try {
    data = await response.json()
  } catch {
    throw new Error(
      'La respuesta del servidor no es válida.',
    )
  }

  if (!isDeleteResponse(data)) {
    throw new Error(
      'La respuesta del servidor no es válida.',
    )
  }
}
