export type ProductImageUrlResult = {
  url: string
  expiresIn: number
}

function isValidSignedImageUrl(
  value: unknown,
): value is string {
  if (typeof value !== 'string') {
    return false
  }

  try {
    const url = new URL(value)

    return (
      url.protocol === 'https:' &&
      url.username === '' &&
      url.password === '' &&
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

function isValidResponse(
  value: unknown,
): value is ProductImageUrlResult {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return false
  }

  const result = value as Record<string, unknown>

  return (
    isValidSignedImageUrl(result.url) &&
    result.expiresIn === 60
  )
}

function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  )
}

export async function getProductImageUrl(
  productId: string,
  signal?: AbortSignal,
): Promise<ProductImageUrlResult> {
  if (
    !productId ||
    productId.trim() !== productId ||
    productId.includes('/')
  ) {
    throw new Error(
      'El identificador del producto no es válido.',
    )
  }

  let response: Response

  try {
    response = await fetch(
      `/api/product-image-url?productId=${encodeURIComponent(productId)}`,
      {
        method: 'GET',
        cache: 'no-store',
        signal,
      },
    )
  } catch (error: unknown) {
    if (
      signal?.aborted ||
      isAbortError(error)
    ) {
      throw error
    }

    throw new Error(
      'No se pudo conectar con el servicio de imágenes.',
      { cause: error },
    )
  }

  if (!response.ok) {
    throw new Error(
      'No se pudo obtener la imagen del producto.',
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
      'La respuesta del servicio de imágenes no es válida.',
    )
  }

  let data: unknown

  try {
    data = await response.json()
  } catch (error: unknown) {
    throw new Error(
      'La respuesta del servicio de imágenes no es válida.',
      { cause: error },
    )
  }

  if (!isValidResponse(data)) {
    throw new Error(
      'La respuesta del servicio de imágenes no es válida.',
    )
  }

  return data
}
