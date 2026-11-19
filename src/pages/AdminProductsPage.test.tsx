/**
 * @vitest-environment jsdom
 */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { Product } from '../types/product'

const {
  useAuthMock,
  getAdminProductsMock,
  createProductMock,
  updateProductMock,
  deleteProductMock,
  uploadProductImageMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getAdminProductsMock: vi.fn(),
  createProductMock: vi.fn(),
  updateProductMock: vi.fn(),
  deleteProductMock: vi.fn(),
  uploadProductImageMock: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: useAuthMock,
}))

vi.mock('../services/productService', () => ({
  getAdminProducts: getAdminProductsMock,
  createProduct: createProductMock,
  updateProduct: updateProductMock,
  deleteProduct: deleteProductMock,
}))

vi.mock(
  '../services/productImageUploadService',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('../services/productImageUploadService')
      >()

    return {
      ...actual,
      uploadProductImage: uploadProductImageMock,
    }
  },
)

import { AdminProductsPage } from './AdminProductsPage'

const admin = { uid: 'admin-test' }

const key =
  'products/11111111-1111-4111-8111-111111111111.jpg'

const previousKey =
  'products/22222222-2222-4222-8222-222222222222.webp'

const existingProduct: Product = {
  id: 'producto-001',
  name: 'Cuaderno premium',
  description: 'Cuaderno de prueba',
  category: 'stationery',
  brand: 'Papel Corp',
  price: 25,
  stock: 10,
  published: true,
}

function imageFile(
  type = 'image/jpeg',
  size = 1024,
): File {
  const result = new File(['imagen'], 'producto.jpg', { type })

  Object.defineProperty(result, 'size', {
    value: size,
  })

  return result
}

function imageInput(): HTMLInputElement {
  return screen.getByLabelText(
    'Seleccionar imagen',
  ) as HTMLInputElement
}

function uploadButton(): HTMLButtonElement {
  return screen.getByRole('button', {
    name: 'Subir imagen a S3',
  }) as HTMLButtonElement
}

function selectFile(file: File) {
  fireEvent.change(imageInput(), {
    target: { files: [file] },
  })
}

function openCreateForm() {
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Nuevo producto',
    }),
  )
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Nombre'), {
    target: { value: 'Cuaderno de prueba' },
  })

  fireEvent.change(screen.getByLabelText('Marca'), {
    target: { value: 'Papel Corp' },
  })

  fireEvent.change(screen.getByLabelText('Precio (S/)'), {
    target: { value: '25.50' },
  })

  fireEvent.change(screen.getByLabelText('Stock'), {
    target: { value: '10' },
  })

  fireEvent.change(screen.getByLabelText('Descripción'), {
    target: { value: 'Cuaderno con imagen S3' },
  })
}

async function uploadSelectedImage() {
  selectFile(imageFile())
  fireEvent.click(uploadButton())

  await screen.findByText(`Clave S3: ${key}`)
}

async function openExistingProduct() {
  render(<AdminProductsPage />)

  await screen.findByText('Cuaderno premium')

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Editar',
    }),
  )
}

beforeEach(() => {
  vi.clearAllMocks()

  useAuthMock.mockReturnValue({ user: admin })

  getAdminProductsMock.mockResolvedValue([])
  createProductMock.mockResolvedValue('nuevo-id')
  updateProductMock.mockResolvedValue(undefined)
  deleteProductMock.mockResolvedValue(undefined)

  uploadProductImageMock.mockResolvedValue({ key })
})

afterEach(() => {
  cleanup()
})

describe('AdminProductsPage — T10.4-B', () => {
  it('muestra el selector sin iniciar subidas', () => {
    render(<AdminProductsPage />)

    openCreateForm()

    expect(imageInput()).toBeTruthy()
    expect(uploadButton().disabled).toBe(true)
    expect(uploadProductImageMock).not.toHaveBeenCalled()
  })

  it('permite seleccionar sin subir automáticamente', () => {
    render(<AdminProductsPage />)

    openCreateForm()
    selectFile(imageFile())

    expect(uploadButton().disabled).toBe(false)
    expect(uploadProductImageMock).not.toHaveBeenCalled()
  })

  it('rechaza imágenes inválidas', () => {
    render(<AdminProductsPage />)

    openCreateForm()
    selectFile(imageFile('image/svg+xml'))

    expect(
      screen.getByRole('alert').textContent,
    ).toMatch(/JPEG, PNG o WebP/)

    expect(uploadButton().disabled).toBe(true)
  })

  it('sube al pulsar el botón y muestra la clave', async () => {
    render(<AdminProductsPage />)

    openCreateForm()

    const file = imageFile()

    selectFile(file)
    fireEvent.click(uploadButton())

    await waitFor(() => {
      expect(uploadProductImageMock).toHaveBeenCalledWith(
        admin,
        file,
      )
    })

    expect(
      await screen.findByText(
        'Imagen subida correctamente a S3.',
      ),
    ).toBeTruthy()

    expect(
      screen.getByText(`Clave S3: ${key}`),
    ).toBeTruthy()

    expect(createProductMock).not.toHaveBeenCalled()
    expect(updateProductMock).not.toHaveBeenCalled()
  })

  it('bloquea el formulario mientras se sube', async () => {
    let finishUpload:
      (result: { key: string }) => void = () => {
        throw new Error('La subida simulada no comenzó.')
      }

    uploadProductImageMock.mockImplementation(
      () =>
        new Promise<{ key: string }>((resolve) => {
          finishUpload = resolve
        }),
    )

    render(<AdminProductsPage />)

    openCreateForm()
    selectFile(imageFile())
    fireEvent.click(uploadButton())

    expect(
      await screen.findByText(
        'Subiendo imagen a AWS S3…',
      ),
    ).toBeTruthy()

    const cancelButton = screen.getByRole(
      'button',
      { name: 'Cancelar' },
    ) as HTMLButtonElement

    const saveButton = screen.getByRole(
      'button',
      { name: 'Crear producto' },
    ) as HTMLButtonElement

    expect(cancelButton.disabled).toBe(true)
    expect(saveButton.disabled).toBe(true)

    expect(uploadProductImageMock).toHaveBeenCalledTimes(1)

    finishUpload({ key })

    expect(
      await screen.findByText(`Clave S3: ${key}`),
    ).toBeTruthy()
  })

  it('muestra errores de subida sin cerrar el formulario', async () => {
    uploadProductImageMock.mockRejectedValue(
      new Error('AWS S3 rechazó la subida de la imagen.'),
    )

    render(<AdminProductsPage />)

    openCreateForm()
    selectFile(imageFile())
    fireEvent.click(uploadButton())

    await waitFor(() => {
      expect(
        screen.getByRole('alert').textContent,
      ).toMatch(/AWS S3 rechazó/)
    })

    expect(imageInput()).toBeTruthy()
  })

  it('no permite subir sin usuario autenticado', () => {
    useAuthMock.mockReturnValue({ user: null })

    render(<AdminProductsPage />)

    openCreateForm()
    selectFile(imageFile())

    expect(uploadButton().disabled).toBe(true)
    expect(uploadProductImageMock).not.toHaveBeenCalled()
  })

  it('conserva la edición de productos existentes', async () => {
    getAdminProductsMock.mockResolvedValue([existingProduct])

    render(<AdminProductsPage />)

    expect(
      await screen.findByText('Cuaderno premium'),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Editar',
      }),
    )

    expect(imageInput()).toBeTruthy()

    expect(
      screen.getByRole('button', {
        name: 'Guardar cambios',
      }),
    ).toBeTruthy()
  })

  it('limpia la referencia al cerrar y volver a abrir', async () => {
    render(<AdminProductsPage />)

    openCreateForm()
    selectFile(imageFile())
    fireEvent.click(uploadButton())

    expect(
      await screen.findByText(`Clave S3: ${key}`),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Cancelar',
      }),
    )

    openCreateForm()

    expect(
      screen.queryByText(`Clave S3: ${key}`),
    ).toBeNull()

    expect(uploadButton().disabled).toBe(true)
  })
})

describe('AdminProductsPage — T10.4-C', () => {
  it('guarda uploadedKey al crear un producto', async () => {
    render(<AdminProductsPage />)

    openCreateForm()
    fillRequiredFields()
    await uploadSelectedImage()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Crear producto',
      }),
    )

    await waitFor(() => {
      expect(createProductMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Cuaderno de prueba',
          imageKey: key,
        }),
      )
    })

    expect(
      await screen.findByText(
        'Producto creado correctamente.',
      ),
    ).toBeTruthy()
  })

  it('conserva la referencia existente al editar sin subir otra imagen', async () => {
    getAdminProductsMock.mockResolvedValue([
      {
        ...existingProduct,
        imageKey: previousKey,
      },
    ])

    await openExistingProduct()

    expect(
      screen.getByText(`Clave S3: ${previousKey}`),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Guardar cambios',
      }),
    )

    await waitFor(() => {
      expect(updateProductMock).toHaveBeenCalledWith(
        'producto-001',
        expect.objectContaining({
          imageKey: previousKey,
        }),
      )
    })

    expect(uploadProductImageMock).not.toHaveBeenCalled()
  })

  it('reemplaza la referencia al guardar una imagen nueva', async () => {
    getAdminProductsMock.mockResolvedValue([
      {
        ...existingProduct,
        imageKey: previousKey,
      },
    ])

    await openExistingProduct()
    await uploadSelectedImage()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Guardar cambios',
      }),
    )

    await waitFor(() => {
      expect(updateProductMock).toHaveBeenCalledWith(
        'producto-001',
        expect.objectContaining({
          imageKey: key,
        }),
      )
    })
  })

  it('mantiene uploadedKey si Firestore rechaza el guardado', async () => {
    createProductMock.mockRejectedValueOnce(
      new Error('Firestore no disponible'),
    )

    render(<AdminProductsPage />)

    openCreateForm()
    fillRequiredFields()
    await uploadSelectedImage()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Crear producto',
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByRole('alert').textContent,
      ).toMatch(/Firestore no disponible/)
    })

    expect(
      screen.getByText(`Clave S3: ${key}`),
    ).toBeTruthy()

    expect(
      screen.getByRole('button', {
        name: 'Crear producto',
      }),
    ).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Crear producto',
      }),
    )

    await waitFor(() => {
      expect(createProductMock).toHaveBeenCalledTimes(2)
    })

    expect(createProductMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        imageKey: key,
      }),
    )

    expect(uploadProductImageMock).toHaveBeenCalledTimes(1)
  })

  it('no vincula una imagen si solamente se selecciona el archivo', async () => {
    render(<AdminProductsPage />)

    openCreateForm()
    fillRequiredFields()
    selectFile(imageFile())

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Crear producto',
      }),
    )

    await waitFor(() => {
      expect(createProductMock).toHaveBeenCalledTimes(1)
    })

    const [input] = createProductMock.mock.calls[0]

    expect(input).not.toHaveProperty('imageKey')
    expect(uploadProductImageMock).not.toHaveBeenCalled()
  })
})
