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
  deleteProductImageMock,
} = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getAdminProductsMock: vi.fn(),
  createProductMock: vi.fn(),
  updateProductMock: vi.fn(),
  deleteProductMock: vi.fn(),
  uploadProductImageMock: vi.fn(),
  deleteProductImageMock: vi.fn(),
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

vi.mock('../services/productImageDeleteService', () => ({
  deleteProductImage: deleteProductImageMock,
}))

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

function deleteImageButton(): HTMLButtonElement {
  return screen.getByRole('button', {
    name: 'Eliminar imagen no asociada',
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
      name: 'Editar Cuaderno premium',
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
  deleteProductImageMock.mockResolvedValue(undefined)

  vi.stubGlobal(
    'confirm',
    vi.fn().mockReturnValue(true),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
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
        name: 'Editar Cuaderno premium',
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

describe('AdminProductsPage — T10.4-D', () => {
  it('no ofrece eliminar una imagen ya asociada', async () => {
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

    expect(
      screen.queryByRole('button', {
        name: 'Eliminar imagen no asociada',
      }),
    ).toBeNull()

    expect(deleteProductImageMock).not.toHaveBeenCalled()
  })

  it('muestra el botón únicamente después de subir', async () => {
    render(<AdminProductsPage />)

    openCreateForm()

    expect(
      screen.queryByRole('button', {
        name: 'Eliminar imagen no asociada',
      }),
    ).toBeNull()

    await uploadSelectedImage()

    expect(deleteImageButton()).toBeTruthy()
    expect(deleteProductImageMock).not.toHaveBeenCalled()
  })

  it('no reemplaza una subida pendiente al seleccionar otro archivo', async () => {
    render(<AdminProductsPage />)

    openCreateForm()
    await uploadSelectedImage()

    expect(imageInput().disabled).toBe(true)
    expect(uploadButton().disabled).toBe(true)

    selectFile(imageFile('image/png'))

    expect(
      screen.getByText(`Clave S3: ${key}`),
    ).toBeTruthy()

    expect(uploadProductImageMock).toHaveBeenCalledTimes(1)
    expect(deleteProductImageMock).not.toHaveBeenCalled()
  })

  it('habilita nuevamente la selección tras eliminar la subida pendiente', async () => {
    render(<AdminProductsPage />)

    openCreateForm()
    await uploadSelectedImage()
    fireEvent.click(deleteImageButton())

    await screen.findByText(
      'Imagen no asociada eliminada correctamente.',
    )

    expect(imageInput().disabled).toBe(false)
    expect(uploadButton().disabled).toBe(true)

    selectFile(imageFile('image/png'))

    expect(uploadButton().disabled).toBe(false)
  })

  it('permite volver a seleccionar el mismo archivo después de eliminarlo', async () => {
    render(<AdminProductsPage />)

    openCreateForm()

    const file = imageFile()

    selectFile(file)

    expect(imageInput().value).toBe('')
    expect(uploadButton().disabled).toBe(false)

    fireEvent.click(uploadButton())

    await screen.findByText(`Clave S3: ${key}`)

    expect(uploadProductImageMock).toHaveBeenCalledWith(
      admin,
      file,
    )

    fireEvent.click(deleteImageButton())

    await screen.findByText(
      'Imagen no asociada eliminada correctamente.',
    )

    expect(deleteProductImageMock).toHaveBeenCalledWith(
      admin,
      key,
    )

    expect(imageInput().disabled).toBe(false)

    selectFile(file)

    expect(imageInput().value).toBe('')
    expect(uploadButton().disabled).toBe(false)

    fireEvent.click(uploadButton())

    await waitFor(() => {
      expect(uploadProductImageMock).toHaveBeenCalledTimes(2)
    })

    expect(uploadProductImageMock).toHaveBeenLastCalledWith(
      admin,
      file,
    )
  })

  it('no elimina si el administrador cancela', async () => {
    vi.mocked(window.confirm).mockReturnValue(false)

    render(<AdminProductsPage />)

    openCreateForm()
    await uploadSelectedImage()

    fireEvent.click(deleteImageButton())

    expect(deleteProductImageMock).not.toHaveBeenCalled()

    expect(
      screen.getByText(`Clave S3: ${key}`),
    ).toBeTruthy()
  })

  it('elimina la imagen confirmada y limpia su referencia', async () => {
    render(<AdminProductsPage />)

    openCreateForm()
    await uploadSelectedImage()

    fireEvent.click(deleteImageButton())

    await waitFor(() => {
      expect(deleteProductImageMock).toHaveBeenCalledWith(
        admin,
        key,
      )
    })

    expect(
      await screen.findByText(
        'Imagen no asociada eliminada correctamente.',
      ),
    ).toBeTruthy()

    expect(
      screen.queryByText(`Clave S3: ${key}`),
    ).toBeNull()

    expect(
      screen.queryByRole('button', {
        name: 'Eliminar imagen no asociada',
      }),
    ).toBeNull()

    expect(createProductMock).not.toHaveBeenCalled()
    expect(updateProductMock).not.toHaveBeenCalled()
  })

  it('mantiene la referencia cuando falla la eliminación', async () => {
    deleteProductImageMock.mockRejectedValue(
      new Error('La imagen sigue en uso.'),
    )

    render(<AdminProductsPage />)

    openCreateForm()
    await uploadSelectedImage()

    fireEvent.click(deleteImageButton())

    await waitFor(() => {
      expect(
        screen.getByRole('alert').textContent,
      ).toMatch(/sigue en uso/)
    })

    expect(
      screen.getByText(`Clave S3: ${key}`),
    ).toBeTruthy()

    expect(deleteImageButton()).toBeTruthy()
  })

  it('bloquea el formulario mientras se elimina', async () => {
    let finishDelete: () => void = () => {
      throw new Error('La eliminación simulada no comenzó.')
    }

    deleteProductImageMock.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishDelete = resolve
        }),
    )

    render(<AdminProductsPage />)

    openCreateForm()
    await uploadSelectedImage()

    fireEvent.click(deleteImageButton())

    expect(
      await screen.findByRole('button', {
        name: 'Eliminando imagen…',
      }),
    ).toBeTruthy()

    expect(
      (
        screen.getByRole('button', {
          name: 'Cancelar',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)

    expect(
      (
        screen.getByRole('button', {
          name: 'Crear producto',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true)

    expect(uploadButton().disabled).toBe(true)
    expect(deleteProductImageMock).toHaveBeenCalledTimes(1)

    finishDelete()

    expect(
      await screen.findByText(
        'Imagen no asociada eliminada correctamente.',
      ),
    ).toBeTruthy()
  })

  it('conserva la imagen asociada anterior después de borrar una nueva', async () => {
    getAdminProductsMock.mockResolvedValue([
      {
        ...existingProduct,
        imageKey: previousKey,
      },
    ])

    await openExistingProduct()
    await uploadSelectedImage()

    fireEvent.click(deleteImageButton())

    expect(
      await screen.findByText(
        'Imagen no asociada eliminada correctamente.',
      ),
    ).toBeTruthy()

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
  })

  it('no ofrece eliminar la imagen después de guardar el producto', async () => {
    render(<AdminProductsPage />)

    openCreateForm()
    fillRequiredFields()
    await uploadSelectedImage()

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Crear producto',
      }),
    )

    expect(
      await screen.findByText(
        'Producto creado correctamente.',
      ),
    ).toBeTruthy()

    expect(
      screen.queryByRole('button', {
        name: 'Eliminar imagen no asociada',
      }),
    ).toBeNull()

    expect(deleteProductImageMock).not.toHaveBeenCalled()
  })
})

const adminList: Product[] = Array.from({ length: 25 }, (_, index) => ({
  ...existingProduct,
  id: `producto-${String(index + 1).padStart(2, '0')}`,
  name: `Artículo ${String(index + 1).padStart(2, '0')}`,
  brand: index % 2 === 0 ? 'Papel Corp' : 'Marca Azul',
  category: index % 2 === 0 ? 'stationery' : 'office-supplies',
  published: index % 2 === 0,
}))

describe('AdminProductsPage — mejoras UX de T10', () => {
  it('pagina doce productos y conserva el orden alfabético existente', async () => {
    getAdminProductsMock.mockResolvedValue(adminList)
    render(<AdminProductsPage />)

    await screen.findByText('Artículo 01')

    expect(
      screen.getAllByRole('button', { name: /^Editar / }),
    ).toHaveLength(12)

    expect(screen.queryByText('Artículo 13')).toBeNull()
    expect(screen.getByText(/25 resultados/)).toBeTruthy()

    fireEvent.click(
      screen.getByRole('button', { name: 'Página 2' }),
    )

    expect(screen.getByText('Artículo 13')).toBeTruthy()

    expect(
      screen.getAllByRole('button', { name: /^Editar / }),
    ).toHaveLength(12)

    fireEvent.click(
      screen.getByRole('button', { name: 'Siguiente' }),
    )

    expect(screen.getByText('Artículo 25')).toBeTruthy()

    expect(
      screen.getAllByRole('button', { name: /^Editar / }),
    ).toHaveLength(1)

    expect(
      (screen.getByRole('button', {
        name: 'Siguiente',
      }) as HTMLButtonElement).disabled,
    ).toBe(true)
  })

  it('busca por nombre y marca sin distinguir mayúsculas', async () => {
    getAdminProductsMock.mockResolvedValue(adminList)
    render(<AdminProductsPage />)

    await screen.findByText('Artículo 01')

    const search = screen.getByRole('searchbox', {
      name: 'Buscar por nombre o marca',
    })

    fireEvent.change(search, {
      target: { value: 'artículo 03' },
    })

    expect(screen.getByText('Artículo 03')).toBeTruthy()
    expect(screen.queryByText('Artículo 01')).toBeNull()

    fireEvent.change(search, {
      target: { value: 'MARCA AZUL' },
    })

    expect(screen.getByText('Artículo 02')).toBeTruthy()
    expect(screen.queryByText('Artículo 01')).toBeNull()
    expect(screen.getByText(/12 resultados/)).toBeTruthy()
  })

  it('combina categoría y publicación y muestra el estado sin resultados', async () => {
    getAdminProductsMock.mockResolvedValue(adminList)
    render(<AdminProductsPage />)

    await screen.findByText('Artículo 01')

    fireEvent.change(
      screen.getByLabelText('Filtrar por categoría'),
      {
        target: { value: 'office-supplies' },
      },
    )

    expect(screen.getByText('Artículo 02')).toBeTruthy()
    expect(screen.queryByText('Artículo 01')).toBeNull()

    fireEvent.change(
      screen.getByLabelText('Filtrar por publicación'),
      {
        target: { value: 'published' },
      },
    )

    expect(
      screen.getByText(
        'No se encontraron productos con estos filtros.',
      ),
    ).toBeTruthy()

    expect(screen.getByText(/0 resultados/)).toBeTruthy()
  })

  it('restablece la primera página cuando cambian los filtros', async () => {
    getAdminProductsMock.mockResolvedValue(adminList)
    render(<AdminProductsPage />)

    await screen.findByText('Artículo 01')

    fireEvent.click(
      screen.getByRole('button', { name: 'Página 2' }),
    )

    expect(screen.getByText('Artículo 13')).toBeTruthy()

    fireEvent.change(
      screen.getByLabelText('Filtrar por publicación'),
      {
        target: { value: 'published' },
      },
    )

    expect(screen.getByText('Artículo 01')).toBeTruthy()
    expect(screen.queryByText('Artículo 25')).toBeNull()
    expect(screen.getByText(/Mostrando 1–12/)).toBeTruthy()
  })

  it('desplaza al formulario al editar sin alterar el producto', async () => {
    const scroll = vi.fn()
    const original = HTMLElement.prototype.scrollIntoView

    HTMLElement.prototype.scrollIntoView = scroll

    try {
      getAdminProductsMock.mockResolvedValue([existingProduct])
      render(<AdminProductsPage />)

      await screen.findByText('Cuaderno premium')

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Editar Cuaderno premium',
        }),
      )

      expect(screen.getByText('Editar producto')).toBeTruthy()

      expect(
        (screen.getByLabelText('Nombre') as HTMLInputElement).value,
      ).toBe('Cuaderno premium')

      expect(scroll).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      })

      expect(updateProductMock).not.toHaveBeenCalled()
    } finally {
      HTMLElement.prototype.scrollIntoView = original
    }
  })

  it('respeta movimiento reducido al abrir el formulario', async () => {
    const scroll = vi.fn()
    const original = HTMLElement.prototype.scrollIntoView

    HTMLElement.prototype.scrollIntoView = scroll

    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
      matches: true,
    }))

    try {
      getAdminProductsMock.mockResolvedValue([existingProduct])
      render(<AdminProductsPage />)

      await screen.findByText('Cuaderno premium')

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Editar Cuaderno premium',
        }),
      )

      expect(scroll).toHaveBeenCalledWith({
        behavior: 'auto',
        block: 'start',
      })
    } finally {
      HTMLElement.prototype.scrollIntoView = original
    }
  })

  it('identifica las acciones administrativas por producto', async () => {
    getAdminProductsMock.mockResolvedValue([existingProduct])
    render(<AdminProductsPage />)

    await screen.findByText('Cuaderno premium')

    const editButton = screen.getByRole('button', {
      name: 'Editar Cuaderno premium',
    })

    const deleteButton = screen.getByRole('button', {
      name: 'Eliminar Cuaderno premium',
    })

    expect(editButton.textContent).toBe('Editar')
    expect(deleteButton.textContent).toBe('Eliminar')
  })
})
