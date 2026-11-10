import type { Product } from '../types/product.ts'

export type ProductSeed = Product & {
  brand: string
  stock: number
  sourceUrl: string
  imageUrl: string
}

export const PRODUCT_SEED_EXPECTATIONS = [
  {
    id: 'uniball-zento-x4',
    name: 'Uni-ball Zento retráctil X4',
    brand: 'Uni-ball',
    description: 'Bolígrafo de gel retráctil Uni-ball Zento en presentación X4.',
    category: 'writing-instruments',
    price: 29.9,
    stock: 25,
    sourceUrl:
      'https://www.verquiperu.com/collections/boligrafos/products/boligrafo-gel-zento-retractil-uniball-copia',
  },
  {
    id: 'sabonis-8051',
    name: 'Pluma Fuente con Caja 8051',
    brand: 'Sabonis',
    description: 'Pluma fuente Sabonis 8051 presentada en caja.',
    category: 'writing-instruments',
    price: 42.9,
    stock: 12,
    sourceUrl:
      'https://www.verquiperu.com/collections/boligrafos/products/pluma-fuente-con-caja-8051-sabonis',
  },
  {
    id: 'donga-my-metal-07x7',
    name: 'Bolígrafo My Metal 0.7X7',
    brand: 'Donga',
    description: 'Bolígrafo Donga de la línea My Metal, modelo 0.7X7.',
    category: 'writing-instruments',
    price: 18.9,
    stock: 30,
    sourceUrl:
      'https://www.verquiperu.com/collections/boligrafos/products/boligrafo-my-metal-0-7x7-donga',
  },
  {
    id: 'iris-color-a4-negro-160h',
    name: 'Cuaderno Iris Color A4 negro, 160 hojas',
    brand: 'Iris Color',
    description:
      'Cuaderno anillado cuadriculado A4, negro, con tapa dura y 160 hojas.',
    category: 'stationery',
    price: 23.9,
    stock: 35,
    sourceUrl:
      'https://www.tailoy.com.pe/cuaderno-anillado-iris-color-a4-cuadriculado-negro-tapa-dura-160-hojas-79691004.html',
  },
  {
    id: 'agenda-2027-a5-cafe',
    name: 'Agenda 2027 18M semanal A5 café',
    brand: 'Graphique de France',
    description: 'Agenda 2027 de 18 meses, semanal, en formato A5 y color café.',
    category: 'stationery',
    price: 94.9,
    stock: 15,
    sourceUrl:
      'https://lapapelaria.pe/collections/agendas-2027/products/agenda-2027-18m-semanal-a5-cafe',
  },
  {
    id: 'notas-alpha-neon-2x2',
    name: 'Notas adhesivas Alpha 2x2 neón, 25 hojas',
    brand: 'Alpha',
    description: 'Notas adhesivas Alpha neón de 2x2 pulgadas, presentación de 25 hojas.',
    category: 'stationery',
    price: 4.5,
    stock: 80,
    sourceUrl:
      'https://www.verquiperu.com/products/notas-adh-2x2-neon-x25h-alpha',
  },
  {
    id: 'engrapadora-ove-25h',
    name: 'Engrapadora OVE 25 hojas con sacagrapas',
    brand: 'OVE',
    description: 'Engrapadora OVE con sacagrapas para engrapar hasta 25 hojas.',
    category: 'office-supplies',
    price: 12.9,
    stock: 25,
    sourceUrl:
      'https://clip.com.pe/producto/engrapador-ove-25-hojas-con-sacagrapas-23473',
  },
  {
    id: 'perforador-vinifan-mh15',
    name: 'Perforador Vinifan M-H15, 15 hojas',
    brand: 'Vinifan',
    description: 'Perforador Vinifan M-H15 negro, con capacidad para 15 hojas.',
    category: 'office-supplies',
    price: 8.9,
    stock: 30,
    sourceUrl:
      'https://www.tailoy.com.pe/perforador-vinifan-15h-m-h15-negro-11022-29153002.html',
  },
  {
    id: 'tijera-vinifan-oficina',
    name: 'Tijera Vinifan para oficina',
    brand: 'Vinifan',
    description: 'Tijera Vinifan de 7 pulgadas para oficina.',
    category: 'office-supplies',
    price: 7.9,
    stock: 40,
    sourceUrl: 'https://www.tailoy.com.pe/tijera-7-pulgadas-para-oficina-10120.html',
  },
  {
    id: 'soporte-roadtrip-abh070',
    name: 'Soporte Roadtrip 360° negro',
    brand: 'Roadtrip',
    description:
      'Soporte Roadtrip negro para celular, con giro de 360° y uso de escritorio.',
    category: 'desk-accessories',
    price: 22.9,
    stock: 20,
    sourceUrl:
      'https://www.coolbox.pe/soporte-celular-360-de-escritorio-plastico-aluminio-negro-abh-070/p',
  },
  {
    id: 'organizador-ove-8810',
    name: 'Organizador OVE para clips y lápices',
    brand: 'OVE',
    description: 'Organizador OVE tipo rejilla para clips y lápices, en color negro.',
    category: 'desk-accessories',
    price: 13.9,
    stock: 25,
    sourceUrl:
      'https://www.tailoy.com.pe/organizador-porta-clips-y-lapices-negro-8810.html',
  },
  {
    id: 'portalapices-ove-cuadrado',
    name: 'Portalápices OVE cuadrangular negro',
    brand: 'OVE',
    description:
      'Portalápices OVE cuadrangular tipo rejilla, en color negro.',
    category: 'desk-accessories',
    price: 6.5,
    stock: 50,
    sourceUrl:
      'https://www.tailoy.com.pe/porta-lapiz-cuadrado-negro-tipo-rejilla-16579001.html',
  },
] as const

export const EXPECTED_PRODUCT_SEED_COUNT = 12
export const EXPECTED_PRODUCT_SEED_STOCK = 387

export const productsSeed = [
  {
    id: 'uniball-zento-x4',
    name: 'Uni-ball Zento retráctil X4',
    brand: 'Uni-ball',
    description: 'Bolígrafo de gel retráctil Uni-ball Zento en presentación X4.',
    category: 'writing-instruments',
    price: 29.9,
    stock: 25,
    sourceUrl:
      'https://www.verquiperu.com/collections/boligrafos/products/boligrafo-gel-zento-retractil-uniball-copia',
    imageUrl:
      'https://www.verquiperu.com/cdn/shop/files/71zXzkGPEiL._AC_SL1500_1800x1800.jpg?v=1762991137',
    published: false,
  },
  {
    id: 'sabonis-8051',
    name: 'Pluma Fuente con Caja 8051',
    brand: 'Sabonis',
    description: 'Pluma fuente Sabonis 8051 presentada en caja.',
    category: 'writing-instruments',
    price: 42.9,
    stock: 12,
    sourceUrl:
      'https://www.verquiperu.com/collections/boligrafos/products/pluma-fuente-con-caja-8051-sabonis',
    imageUrl: 'https://www.verquiperu.com/cdn/shop/files/BOLI054_720x.jpg?v=1751058368',
    published: false,
  },
  {
    id: 'donga-my-metal-07x7',
    name: 'Bolígrafo My Metal 0.7X7',
    brand: 'Donga',
    description: 'Bolígrafo Donga de la línea My Metal, modelo 0.7X7.',
    category: 'writing-instruments',
    price: 18.9,
    stock: 30,
    sourceUrl:
      'https://www.verquiperu.com/collections/boligrafos/products/boligrafo-my-metal-0-7x7-donga',
    imageUrl: 'https://www.verquiperu.com/cdn/shop/files/BOLI031_720x.jpg?v=1693497511',
    published: false,
  },
  {
    id: 'iris-color-a4-negro-160h',
    name: 'Cuaderno Iris Color A4 negro, 160 hojas',
    brand: 'Iris Color',
    description:
      'Cuaderno anillado cuadriculado A4, negro, con tapa dura y 160 hojas.',
    category: 'stationery',
    price: 23.9,
    stock: 35,
    sourceUrl:
      'https://www.tailoy.com.pe/cuaderno-anillado-iris-color-a4-cuadriculado-negro-tapa-dura-160-hojas-79691004.html',
    imageUrl:
      'https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/c/u/cuaderno-anillado-iris-color-a4-cuadriculado-negro-tapa-dura-160-hojas-79691004-default-1.jpg',
    published: false,
  },
  {
    id: 'agenda-2027-a5-cafe',
    name: 'Agenda 2027 18M semanal A5 café',
    brand: 'Graphique de France',
    description: 'Agenda 2027 de 18 meses, semanal, en formato A5 y color café.',
    category: 'stationery',
    price: 94.9,
    stock: 15,
    sourceUrl:
      'https://lapapelaria.pe/collections/agendas-2027/products/agenda-2027-18m-semanal-a5-cafe',
    imageUrl: 'https://lapapelaria.pe/cdn/shop/files/PU601427.webp?v=1784672335&width=925',
    published: false,
  },
  {
    id: 'notas-alpha-neon-2x2',
    name: 'Notas adhesivas Alpha 2x2 neón, 25 hojas',
    brand: 'Alpha',
    description: 'Notas adhesivas Alpha neón de 2x2 pulgadas, presentación de 25 hojas.',
    category: 'stationery',
    price: 4.5,
    stock: 80,
    sourceUrl:
      'https://www.verquiperu.com/products/notas-adh-2x2-neon-x25h-alpha',
    imageUrl: 'https://www.verquiperu.com/cdn/shop/files/POST012_540x.jpg?v=1725307768',
    published: false,
  },
  {
    id: 'engrapadora-ove-25h',
    name: 'Engrapadora OVE 25 hojas con sacagrapas',
    brand: 'OVE',
    description: 'Engrapadora OVE con sacagrapas para engrapar hasta 25 hojas.',
    category: 'office-supplies',
    price: 12.9,
    stock: 25,
    sourceUrl:
      'https://clip.com.pe/producto/engrapador-ove-25-hojas-con-sacagrapas-23473',
    imageUrl:
      'https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/e/n/engrapador-25-hojas-con-sacagrapas-ove-23473-default-1.png',
    published: false,
  },
  {
    id: 'perforador-vinifan-mh15',
    name: 'Perforador Vinifan M-H15, 15 hojas',
    brand: 'Vinifan',
    description: 'Perforador Vinifan M-H15 negro, con capacidad para 15 hojas.',
    category: 'office-supplies',
    price: 8.9,
    stock: 30,
    sourceUrl:
      'https://www.tailoy.com.pe/perforador-vinifan-15h-m-h15-negro-11022-29153002.html',
    imageUrl:
      'https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/p/e/perforador-m-h15-negro-vinifan-29153002-default-1.jpg',
    published: false,
  },
  {
    id: 'tijera-vinifan-oficina',
    name: 'Tijera Vinifan para oficina',
    brand: 'Vinifan',
    description: 'Tijera Vinifan de 7 pulgadas para oficina.',
    category: 'office-supplies',
    price: 7.9,
    stock: 40,
    sourceUrl: 'https://www.tailoy.com.pe/tijera-7-pulgadas-para-oficina-10120.html',
    imageUrl:
      'https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/t/i/tijera-7-pulgadas-para-oficina-10120-default-1.jpg',
    published: false,
  },
  {
    id: 'soporte-roadtrip-abh070',
    name: 'Soporte Roadtrip 360° negro',
    brand: 'Roadtrip',
    description:
      'Soporte Roadtrip negro para celular, con giro de 360° y uso de escritorio.',
    category: 'desk-accessories',
    price: 22.9,
    stock: 20,
    sourceUrl:
      'https://www.coolbox.pe/soporte-celular-360-de-escritorio-plastico-aluminio-negro-abh-070/p',
    imageUrl:
      'https://coolboxpe.vtexassets.com/arquivos/ids/329823/ABH-070_1.jpg?v=638362617412930000',
    published: false,
  },
  {
    id: 'organizador-ove-8810',
    name: 'Organizador OVE para clips y lápices',
    brand: 'OVE',
    description: 'Organizador OVE tipo rejilla para clips y lápices, en color negro.',
    category: 'desk-accessories',
    price: 13.9,
    stock: 25,
    sourceUrl:
      'https://www.tailoy.com.pe/organizador-porta-clips-y-lapices-negro-8810.html',
    imageUrl:
      'https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/o/r/organizador-de-escritorio-ove-negro-tipo-rejilla-8810-default-1.jpg',
    published: false,
  },
  {
    id: 'portalapices-ove-cuadrado',
    name: 'Portalápices OVE cuadrangular negro',
    brand: 'OVE',
    description:
      'Portalápices OVE cuadrangular tipo rejilla, en color negro.',
    category: 'desk-accessories',
    price: 6.5,
    stock: 50,
    sourceUrl:
      'https://www.tailoy.com.pe/porta-lapiz-cuadrado-negro-tipo-rejilla-16579001.html',
    imageUrl:
      'https://production-tailoy-repo-magento-statics.s3.amazonaws.com/imagenes/872x872/productos/i/p/o/porta-lapiz-cuadrangular-ove-negro-tipo-rejilla-16579001-default-1.jpg',
    published: false,
  },
] satisfies readonly ProductSeed[]
