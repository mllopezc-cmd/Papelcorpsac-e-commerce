# Papelcorpsac — Proyecto Integrador 5

## 1. Descripción y objetivo

**Nombre del proyecto:** Papelcorpsac

**Identidad visual:** PAPEL CORP

**Rubro:** Papelería, instrumentos de escritura y artículos de oficina.

**Tipo:** Single Page Application (SPA) de comercio electrónico.

**Ubicación de desarrollo:** D:/Papelcorpsac

**Moneda:** Soles peruanos (PEN).

Papelcorpsac es un proyecto académico que busca desarrollar, testear y desplegar una aplicación de comercio electrónico funcional, responsive y segura.

La aplicación contará con dos roles:

- **Customer:** podrá explorar productos, gestionar el carrito, simular compras y consultar sus órdenes.
- **Admin:** podrá administrar productos, imágenes y órdenes mediante un panel protegido.

El objetivo es cumplir los requisitos del Proyecto Integrador 5 con una solución sencilla, mantenible y fácil de explicar durante su presentación.

## 2. Fuentes de referencia

El desarrollo seguirá este orden de prioridad:

1. **Consigna oficial del Proyecto Integrador 5:** establece los requisitos funcionales, técnicos y de evaluación.
2. **Guía de desarrollo del Proyecto Integrador 5:** orienta las etapas, buenas prácticas y criterios de verificación.
3. **Repositorio del docente:** proporciona ejemplos y explicaciones de los conceptos trabajados. https://github.com/HX-ARomero/m5-front-demo
4. **Documentación oficial de las tecnologías:** se utilizará para comprobar instalaciones, compatibilidad y prácticas técnicas vigentes.

Los materiales del docente serán referencias de aprendizaje, no código que deba copiarse automáticamente.

Las mejoras propias se incorporarán cuando aporten valor sin sustituir requisitos obligatorios ni generar complejidad innecesaria.

## 3. Tecnologías y versiones

### Frontend

- React 19 y React DOM.
- TypeScript.
- Vite.
- React Router.
- Tailwind CSS 4.
- Context API y useReducer.

### Backend y servicios

- Firebase Authentication.
- Cloud Firestore.
- Firebase Admin SDK.
- AWS S3.
- Vercel Serverless Functions.

### Testing

- Vitest.
- React Testing Library.
- jsdom.
- Firebase Emulator Suite.

### Control de versiones y despliegue

- Git y GitHub.
- Integración continua pendiente.
- Vercel.

### Política de versiones

Por decisión del desarrollador, se utiliza React 19 y versiones estables actuales de las demás herramientas, siempre que sean compatibles entre sí.

La consigna original menciona React 18. Esta diferencia deberá validarse con el docente antes de la entrega.

No se instalarán versiones experimentales ni dependencias adicionales sin una necesidad justificada.

Las versiones exactas se mantienen en package.json y package-lock.json.

## 4. Identidad visual y experiencia de usuario

Papelcorpsac adopta una identidad corporativa premium, inspirada en la referencia visual proporcionada por el desarrollador.

### Estilo visual

- Elegante, sobrio y profesional.
- Diseño limpio y organizado.
- Fotografías de productos de buena calidad.
- Navegación clara y accesible.
- Componentes visualmente consistentes.

### Paleta corporativa

Colores principales:

- Grafito oscuro: #1e2229
- Crema: #f8f6f2
- Oro atenuado: #c5a059
- Azul profundo: #16243d

Se utilizan variantes adecuadas para los modos claro y oscuro.

### Tipografías

- **Cinzel:** identidad y títulos destacados.
- **Plus Jakarta Sans:** contenido, navegación y formularios.

### Principios de UX/UI

- Diseño mobile-first y responsive.
- Estados de carga visibles.
- Mensajes claros de error y ausencia de resultados.
- Formularios accesibles y validados.
- Botones con estados de interacción reconocibles.
- Contraste adecuado y textos legibles.

Tailwind CSS 4 se integra mediante Vite.

La implementación visual prioriza la reutilización y evita efectos decorativos innecesarios.

## 5. Catálogo y funcionalidades

### Catálogo

El catálogo contempla 60 productos demostrativos distribuidos en cuatro categorías:

- Instrumentos de escritura.
- Papelería.
- Artículos de oficina.
- Accesorios de escritorio.

Distribución:

- Doce productos principales.
- 48 productos demostrativos.
- Quince productos por categoría.

Los doce productos principales conservan sus imágenes reales; los 48 adicionales utilizan una imagen demostrativa SVG local.

El código local contiene los datos de seed.

El seguimiento del proyecto reporta los 60 productos publicados en Firestore. Su estado remoto no se considera verificado mediante la lectura del repositorio.

### Autenticación

- Registro con correo y contraseña o Google.
- Inicio y cierre de sesión.
- Persistencia de sesión.
- Diferenciación de roles customer y admin.
- Protección de rutas según autenticación y rol.

### Catálogo

- Listado de productos desde Firestore.
- Filtro por categoría.
- Búsqueda por nombre con debounce de 300 ms.
- Detalle individual del producto.
- Favoritos para usuarios autenticados.
- Paginación local de doce productos por página.
- Navegación compacta en móviles.
- Diseño responsive consistente con la identidad visual de PAPEL CORP.

### Carrito

- Agregar productos.
- Eliminar productos.
- Actualizar cantidades.
- Calcular el total automáticamente.
- Compartir el estado mediante Context API y useReducer.
- Persistencia local aprobada.
- Notificaciones de adición de productos.
- Validación de cantidades y disponibilidad.

El carrito utiliza un reducer para mantener las operaciones de forma predecible.

### Checkout y órdenes

- Revisar el carrito.
- Simular el pago sin pasarela real.
- Confirmar la compra.
- Registrar órdenes en Firestore.
- Mostrar confirmación y errores.
- Descontar existencias de forma transaccional.
- Aplicar idempotencia para evitar órdenes duplicadas.
- Limpiar el carrito después de confirmar la orden.
- Consultar el historial y el detalle de las órdenes del cliente autenticado (T08).

No se realizan cobros reales ni se solicitan datos bancarios.

Estados de orden:

- pending
- processing
- completed
- cancelled

**Estado de implementación de T07:** checkout funcional implementado y verificado localmente mediante pruebas automatizadas y recorrido HTTP integrado con Firebase Emulators.

**Estado de implementación de T08:** funcionalidad implementada y verificada localmente. El desarrollador confirmó la publicación de las reglas de Firestore en Firebase Console. El código está publicado en GitHub mediante el commit `b3107e1`. Esta actualización documental registra el cierre formal de T08.

### Almacenamiento de imágenes en AWS S3 — T09

**Estado de T09:** configuración de infraestructura completada y verificada el 11 de noviembre de 2026.

Papelcorpsac utiliza Amazon S3 en la región `us-east-1` para almacenar las imágenes de productos. Por decisión del desarrollador, el bucket permanece completamente privado.

#### Arquitectura aprobada

- El catálogo continúa siendo público y accesible sin autenticación.
- El bucket mantiene activadas sus cuatro protecciones de bloqueo de acceso público.
- La propiedad de objetos utiliza `Bucket owner enforced`, con ACL deshabilitadas.
- El cifrado predeterminado utiliza SSE-S3.
- Las imágenes de productos se almacenarán bajo el prefijo `products/`.
- La subida utilizará URLs prefirmadas PUT generadas por el backend.
- La visualización utilizará URLs prefirmadas GET temporales.
- El backend comprobará que el producto esté publicado antes de generar una URL GET para el catálogo público.
- La eliminación de imágenes será una operación administrativa protegida del backend.
- Firestore conservará una referencia estable al objeto S3, no una URL prefirmada que pueda caducar.
- Las credenciales AWS permanecerán exclusivamente en el servidor.

Las URLs prefirmadas permiten acceder temporalmente a objetos concretos sin hacer público el bucket. Quien disponga de una URL válida podrá utilizarla durante su vigencia; por ello, no deben registrarse ni almacenarse como identificadores permanentes.

#### Seguridad AWS

Se creó el usuario IAM `papelcorpsac-s3-uploader`, sin acceso a la consola AWS.

La política personalizada `PapelcorpsacS3ObjectAccess` permite exclusivamente:

- `s3:PutObject`.
- `s3:GetObject`.
- `s3:DeleteObject`.

Los permisos están limitados a los objetos del prefijo `products/*` del bucket de Papelcorpsac.

La versión 2 de la política fue guardada y establecida como predeterminada. Se comprobó que el usuario tiene asociada directamente esa política y no pertenece a grupos IAM.

El bloqueo de acceso público a nivel de cuenta AWS se encontró desactivado. Se decidió no modificarlo para evitar efectos sobre otros proyectos. El bloqueo individual del bucket de Papelcorpsac permanece activado.

#### CORS y variables de entorno

S3 tiene configurado CORS para los métodos GET y PUT y los orígenes locales de desarrollo aprobados.

El archivo `.env` contiene las variables privadas:

- `AWS_ACCESS_KEY_ID`.
- `AWS_SECRET_ACCESS_KEY`.
- `AWS_REGION`.
- `S3_BUCKET`.

Las mismas cuatro variables se registraron en el entorno Development del proyecto Vercel `looney-ai-chat/papelcorpsac`.

Las credenciales AWS no utilizan el prefijo `VITE_` y no forman parte del repositorio. `.env.example` contiene únicamente los nombres de las variables y valores no sensibles.

#### Evidencia de verificación

El desarrollador confirmó mediante capturas de AWS Console:

- La creación del bucket.
- Las cuatro protecciones individuales de acceso público activadas.
- Las ACL deshabilitadas mediante `Bucket owner enforced`.
- La configuración de cifrado SSE-S3.
- La configuración CORS guardada.
- La política IAM restringida a `products/*`.
- La versión 2 de la política establecida como predeterminada.
- La asociación de la política al usuario IAM.
- La ausencia de grupos IAM asociados.
- El registro de las cuatro variables en Vercel Development.

El 11 de noviembre de 2026 se ejecutó una solicitud firmada a AWS STS `GetCallerIdentity` utilizando las variables privadas locales.

Resultado:

- HTTP 200.
- Identidad IAM verificada.
- Usuario confirmado: `papelcorpsac-s3-uploader`.

No se instalaron dependencias ni se modificaron objetos S3 durante esta prueba.

**Alcance:** esta verificación confirma la identidad AWS, pero no constituye una prueba efectiva de `GetObject`, `PutObject` o `DeleteObject`.

La implementación de URLs prefirmadas, el CRUD administrativo, la carga y visualización real de imágenes, las pruebas de permisos efectivos y la integración con Firestore corresponden a T10.

La configuración de infraestructura de T09 se considera completada sin afirmar que la integración funcional de T10 ya esté implementada.

### Panel administrativo

- Acceso protegido para admin.
- Layout diferenciado del cliente.
- CRUD completo de productos.
- Subida de imágenes a AWS S3.
- Consulta de todas las órdenes.
- Filtro por estado.
- Actualización autorizada de estados.

#### T10.1 — Revisión técnica de la base existente

**Estado:** completada el 11 de noviembre de 2026.

Se realizó una revisión de solo lectura del repositorio Papelcorpsac en la rama `main`, después del cierre de T09 publicado mediante el commit `42aa9bf`.

La revisión confirmó que las dependencias T04, T05 y T09 estaban completadas y que podían reutilizarse los componentes y servicios existentes.

Archivos y elementos revisados:

- `src/App.tsx`: rutas públicas y administrativas.
- `src/components/ProtectedRoute.tsx`: protección por autenticación y rol.
- `src/contexts/AuthContext.tsx` y `src/hooks/useAuth.ts`: gestión de sesión y perfiles.
- `src/pages/AdminReservedPage.tsx`: página administrativa inicialmente reservada.
- `src/types/product.ts`: modelo de productos.
- `src/services/productService.ts` y `src/hooks/useProducts.ts`: consultas del catálogo.
- `src/components/ProductCard.tsx`: presentación de productos.
- `firestore.rules`: reglas de acceso a productos y usuarios.
- `package.json`: dependencias existentes.

Se contrastó la arquitectura con `docs/PROJECT.md`, `docs/TASKS.md`, las instrucciones del repositorio, la Skill `complete-feature` y las guías de administración y AWS S3 del docente.

Hallazgos:

- La ruta `/admin/*` ya disponía de protección mediante `ProtectedRoute requireAdmin`.
- No existía un layout administrativo diferenciado.
- El Header no mostraba enlaces visibles de Login, Registro ni Administración.
- El servicio de productos solamente consultaba productos publicados.
- Las reglas de Firestore no permitían operaciones CRUD administrativas desde el cliente.
- El modelo de productos todavía no incluía referencias persistentes a objetos privados S3.
- La infraestructura AWS estaba preparada, pero su integración funcional permanecía pendiente.

Se acordó comenzar por el layout y la navegación administrativa, conservando la protección existente y evitando dependencias o componentes innecesarios.

**Alcance:** T10.1 fue exclusivamente una revisión técnica. No se modificaron archivos, dependencias, reglas, credenciales ni recursos externos. Tampoco se ejecutaron pruebas durante esta subtarea.

#### T10.2 — Layout y navegación administrativa

**Estado:** completada, verificada y publicada en GitHub mediante el commit `ea95c91` de `main`.

Se incorporó un layout administrativo independiente del layout público de la tienda.

Archivos principales:

- `src/layouts/AdminLayout.tsx`: cabecera, navegación y estructura administrativa.
- `src/App.tsx`: separación de las rutas administrativas y públicas.
- `src/pages/AdminReservedPage.tsx`: página inicial del panel administrativo.
- `src/components/Header.tsx`: navegación diferenciada según autenticación y rol.
- `src/components/Header.test.tsx`: pruebas de navegación por rol.
- `src/layouts/AdminLayout.test.tsx`: prueba del layout administrativo.

La ruta `/admin` continúa protegida mediante `ProtectedRoute requireAdmin`.

La navegación pública distingue tres estados:

- Visitante: Inicio, Catálogo, Carrito, Iniciar sesión y Registrarse.
- Customer autenticado: navegación de la tienda, Favoritos, Mis órdenes y Cerrar sesión.
- Admin autenticado: navegación de la tienda, acceso a Administración y Cerrar sesión.

El panel administrativo presenta su propia identidad visual y permite regresar al catálogo público.

Las herramientas CRUD se incorporaron posteriormente en T10.3. La integración de imágenes privadas S3 corresponde a T10.4.

**Verificaciones reportadas por el desarrollador:**

- Seis pruebas específicas de T10.2 aprobadas.
- Suite general: 290 pruebas aprobadas y ocho pruebas de integración omitidas.
- ESLint satisfactorio.
- Build TypeScript y Vite satisfactorio.
- `git diff --check` sin errores.
- Navegación de visitante, Customer y Admin comprobada mediante capturas.
- Acceso de Customer a `/admin` rechazado correctamente.
- Diseño responsive comprobado en escritorio y anchos móviles de 320 y 375 píxeles.

Durante la comprobación se identificó que los emuladores de Firebase estaban activados sin estar ejecutándose. Para validar las cuentas existentes se inició temporalmente Vite con Firebase real mediante variables de entorno del proceso, sin modificar los archivos de configuración.

La comprobación visual no equivale a un despliegue público ni sustituye las pruebas de autorización de las futuras operaciones administrativas.

La funcionalidad CRUD quedó reservada para T10.3 y la integración de imágenes privadas mediante AWS S3 para T10.4.

#### T10.3 — CRUD administrativo de productos

**Estado:** completada y verificada localmente el 17 de noviembre de 2026; código y documentación publicados en la rama `main` mediante el commit `cac3b48`.

La ruta `/admin/productos` está protegida por `ProtectedRoute requireAdmin`. `AdminProductsPage.tsx` consume `productService.ts`, que utiliza el SDK cliente de Firestore. Las reglas de Firestore constituyen la autorización efectiva y exigen un perfil `admin` para crear, editar y eliminar productos.

El panel permite consultar productos publicados y no publicados, crearlos, editar sus datos comerciales, publicarlos, despublicarlos y eliminarlos con confirmación. El formulario valida los datos antes de guardar. Cuando un producto histórico no tiene marca o stock, el administrador debe completar esos campos; no se inventan valores.

Las escrituras validan campos permitidos, categorías, límites, existencias y precios con dos decimales. La lectura del catálogo público sigue limitada a productos publicados. Los permisos de usuarios, favoritos y órdenes permanecen restrictivos. `sourceUrl` se conserva cuando se proporciona y puede retirarse de una actualización mediante `deleteField()`.

Las imágenes existentes se conservan y los productos nuevos emplean provisionalmente `/images/product-placeholder.svg`. La subida, visualización y eliminación de imágenes privadas mediante AWS S3 se realizarán en T10.4, sin exponer credenciales en React.

No se incorporaron contextos, hooks administrativos, servicios ni dependencias adicionales.

**Evidencia reportada por el desarrollador:** 13 pruebas de `productService` aprobadas; suite general con 303 aprobadas, 8 omitidas y cero fallidas; ESLint, build y `git diff --check` correctos. En el proyecto ficticio `demo-papelcorpsac`, 15 pruebas de permisos y 4 de precios aprobaron. El navegador permitió completar creación, edición, publicación, despublicación y eliminación de un producto temporal; Customer recibió «Acceso restringido» al acceder a `/admin` y `/admin/productos`.

Las reglas modificadas se validaron únicamente en Firestore Emulator. No se publicaron en Firebase real durante esta subtarea. T10.3 no comprende la administración de órdenes T11 ni el despliegue público.

#### T10.4-A — Backend para URLs PUT prefirmadas de AWS S3

**Estado:** implementada, verificada localmente y publicada en `main` mediante el commit `40f15ed`, el 18 de noviembre de 2026.

Se implementó `POST /api/product-image-upload-url` en `api/product-image-upload-url.ts` para solicitar una URL PUT prefirmada de AWS S3. La función reutiliza `verifyBearerRequest` de `server/auth.ts` con comprobación de revocación y consulta el rol `admin` del perfil `users/{uid}` mediante Firebase Admin en el servidor. Rechaza métodos no admitidos, tokens inválidos, usuarios sin rol Admin y metadatos de imagen no válidos.

`server/s3Upload.ts` valida que la solicitud contenga exactamente `contentType` y `size`; acepta JPEG, PNG y WebP, con tamaño declarado entero positivo y máximo de 5 MiB. Genera una clave aleatoria `products/<uuid>.<extensión>` y una URL PUT de 60 segundos usando `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner`, ambos en versión exacta `3.1170.0`. El SDK y las credenciales AWS permanecen en el backend; no se incorporan al bundle React.

La firma vincula `content-type` y `content-length` junto con `host`. El desarrollador verificó su presencia con el SDK real y credenciales ficticias, sin conexión a AWS, junto con `X-Amz-Expires=60` y `X-Amz-Signature`. Esta prueba confirma los parámetros de firma generados, pero no equivale a comprobar el rechazo de tamaños diferentes por S3 ni verifica los bytes del archivo.

Archivos de implementación y prueba: `api/product-image-upload-url.ts`, `api/product-image-upload-url.test.ts`, `server/s3Upload.ts` y `server/s3Upload.test.ts`. También se actualizaron `package.json` y `package-lock.json` para incorporar las dos dependencias AWS. No se modificaron las reglas Firestore, el frontend ni los recursos AWS.

**Evidencia aportada:** 20 pruebas del servicio y ocho del endpoint aprobadas (28/28); suite general de Vitest con 331 pruebas aprobadas, ocho omitidas y cero fallidas; `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run typecheck:api` y `git diff --check` satisfactorios. Las ocho omitidas son las pruebas de checkout con Firestore Emulator que se aprobaron previamente en una ejecución separada de T07. Vite mantiene una advertencia no bloqueante por un chunk JavaScript de 580,46 kB.

**Límites y pasos posteriores:** no se realizó un PUT real ni un despliegue. La integración del formulario de subida corresponde a T10.4-B; la referencia estable `imageKey` y las URLs GET privadas corresponden a T10.4-C; la eliminación de objetos pertenece a T10.4-D. La validación de funcionamiento real con S3, incluido el comportamiento de encabezados firmados, queda pendiente de una prueba controlada autorizada. La aceptación del hallazgo de dependencias se registra en el apartado 7.9 y no significa que la auditoría general esté limpia.

#### T10.4-B — Interfaz administrativa de subida de imágenes a AWS S3

**Estado:** implementada, verificada localmente y publicada en `main` mediante el commit `8c55a95`, el 19 de noviembre de 2026. La integración efectiva con AWS S3 y Firebase Admin permanece pendiente para la integración final de T10.4.

Se amplió `src/pages/AdminProductsPage.tsx` con una sección independiente que permite seleccionar una imagen y solicitar su subida a AWS S3. La implementación conserva el CRUD administrativo de productos y no añade dependencias nuevas.

El servicio `src/services/productImageUploadService.ts` valida que el archivo seleccionado corresponda a JPEG, PNG o WebP y no supere 5 MiB. Obtiene el Firebase ID token del usuario autenticado y realiza una solicitud autenticada a `POST /api/product-image-upload-url` para obtener los datos de una subida PUT prefirmada. Valida la respuesta y utiliza `fetch` para enviar el archivo directamente a la URL HTTPS proporcionada por el servidor.

El formulario mantiene estados de selección, operación en curso, error y resultado. Cuando el servicio devuelve una clave S3, puede mostrarse en la interfaz; esta referencia se mantiene únicamente en el estado local del componente en T10.4-B.

**Archivos implementados:**

- `src/pages/AdminProductsPage.tsx`.
- `src/pages/AdminProductsPage.test.tsx`.
- `src/services/productImageUploadService.ts`.
- `src/services/productImageUploadService.test.ts`.

**Evidencia automatizada aportada por el desarrollador:**

- 14 pruebas del servicio de subida aprobadas.
- Nueve pruebas del componente administrativo aprobadas.
- 23 pruebas específicas aprobadas en total.
- Suite general: 354 pruebas aprobadas, ocho omitidas y cero fallidas.
- `npm.cmd run lint`: satisfactorio.
- `npm.cmd run build`: satisfactorio.
- `npm.cmd run typecheck:api`: satisfactorio.
- `git diff --check`: sin errores.
- Advertencia histórica no bloqueante de Vite por un chunk de aproximadamente 580,46 kB.

**Verificación visual y diagnóstico local:** el desarrollador comprobó la presentación de la sección de subida en escritorio y móvil. La primera solicitud al endpoint desde Vite devolvió HTTP 404 porque `npm.cmd run dev` no ejecuta las funciones de Vercel. Al iniciar `vercel dev`, la ruta API quedó accesible y una solicitud GET devolvió HTTP 405 con el mensaje `Method Not Allowed`, respuesta esperada para un endpoint que admite POST.

Inicialmente, el frontend mostró un error de configuración por incompatibilidad entre el indicador de emuladores y el proyecto Firebase. La interfaz volvió a cargar mediante `vercel dev` y las variables temporales de proceso `VITE_USE_FIREBASE_EMULATORS=false` y `VITE_FIREBASE_PROJECT_ID=papelcorpsac`, sin modificar los archivos de configuración.

**Limitaciones verificadas:** no se completó una solicitud POST autenticada de generación de URL prefirmada ni una transferencia PUT real contra AWS S3. Tampoco se confirmó la configuración efectiva de Firebase Admin para ese recorrido. Las pruebas automatizadas utilizaron mocks y no sustituyen la verificación de credenciales, autorización, permisos y funcionamiento real.

T10.4-B no guarda `imageKey` en Firestore, no proporciona URLs GET privadas para visualizar las imágenes del catálogo y no elimina objetos de S3. La persistencia y visualización corresponden a T10.4-C; la eliminación autorizada corresponde a T10.4-D.

**Decisión del desarrollador:** posponer las comprobaciones reales de Firebase Admin y AWS S3 hasta la integración final de T10.4, una vez completadas las subtareas de persistencia, visualización y eliminación. Se mantiene la obligación de comprobar los encabezados firmados, la autorización administrativa, las operaciones efectivas con S3 y la seguridad de las reglas antes de considerar T10 cerrada.

Las reglas de Firestore ampliadas durante T10.3 todavía no se han publicado en Firebase real. Su publicación requerirá comparar las reglas locales con las activas en Firebase Console y obtener autorización independiente.

No se instalaron nuevas dependencias, no se modificaron credenciales ni se realizaron operaciones reales sobre objetos S3 durante T10.4-B.

#### T10.4-C — Persistencia de `imageKey` y visualización mediante URLs GET privadas

**Estado:** implementada, verificada localmente y publicada en GitHub el 19 de noviembre de 2026 mediante el commit `8fd8716`. La integración operativa con AWS S3 y Firebase real corresponde a la verificación final de T10.

Se incorporó el campo opcional `imageKey` al modelo de productos. Firestore almacena una referencia estable con formato `products/<uuid>.<jpg|png|webp>`, sin persistir URLs prefirmadas ni credenciales AWS.

El servicio de productos valida, lee y conserva `imageKey` durante el CRUD. En el formulario administrativo, la referencia obtenida mediante una subida se incorpora al producto al guardar. Si no se sube otra imagen, se conserva la referencia existente; si Firestore rechaza el guardado, la clave subida permanece disponible para reintentar sin repetir la transferencia. La selección de un archivo, sin efectuar la subida, no crea una referencia S3.

Se amplió `server/s3Upload.ts` con `GetObjectCommand` y generación de URLs GET prefirmadas de 60 segundos. El nuevo endpoint `GET /api/product-image-url?productId=...` consulta el documento en Firestore mediante Firebase Admin y valida la clave S3. Permite obtener URLs temporales para productos publicados. Cuando el producto no está publicado, exige un Firebase ID token válido, con comprobación de revocación, y rol Admin. Rechaza solicitudes inválidas, evita exponer detalles internos en errores y establece `Cache-Control: no-store`.

El servicio frontend `src/services/productImageService.ts` solicita y valida la URL temporal. `ProductImage`, integrado en `src/components/ProductCard.tsx` y reutilizado por `ProductDetailPage.tsx`, gestiona carga, compatibilidad con imágenes tradicionales, fallback y cancelación de solicitudes. Las pruebas adicionales comprueban también el fallo de carga del elemento `img` y el cambio de producto mientras una solicitud anterior continúa pendiente.

**Archivos de implementación:**

- `api/product-image-url.ts`.
- `server/s3Upload.ts`.
- `src/components/ProductCard.tsx`.
- `src/pages/AdminProductsPage.tsx`.
- `src/services/productImageService.ts`.
- `src/services/productService.ts`.
- `src/types/product.ts`.
- `firestore.rules`.

**Archivos de pruebas:**

- `api/product-image-url.test.ts`.
- `src/components/ProductImage.test.tsx`.
- `src/pages/AdminProductsPage.test.tsx`.
- `src/services/productImageRules.integration.test.ts`.
- `src/services/productImageService.test.ts`.
- `src/services/productService.test.ts`.

**Evidencia proporcionada por el desarrollador:**

- Suite general final de T10.4-C: 408 pruebas aprobadas, 18 omitidas y ninguna fallida; 22 archivos de pruebas aprobados y dos omitidos.
- Endpoint GET: 13 pruebas aprobadas.
- Servicio frontend GET: 15 pruebas aprobadas.
- `ProductImage`: nueve pruebas aprobadas, incluyendo las dos adicionales de robustez.
- Formulario administrativo: 14 pruebas aprobadas, incluyendo cinco específicas de vinculación de imágenes.
- Servicio de productos: 25 pruebas aprobadas.
- Firestore Rules: diez pruebas de integración aprobadas por separado con Authentication Emulator y Firestore Emulator, mediante `demo-papelcorpsac`.
- `npm.cmd run typecheck:api`: correcto.
- `npm.cmd run lint`: correcto.
- `npm.cmd run build`: correcto, con la advertencia histórica no bloqueante del chunk de aproximadamente 580,46 kB.
- `git diff --check` y `git diff --cached --check`: sin errores según las ejecuciones compartidas.

Las diez pruebas de reglas verificaron la creación con claves válidas, el rechazo de referencias incorrectas, la restricción de escrituras administrativas, la lectura pública de productos publicados, la denegación de productos no publicados a visitantes y la compatibilidad con productos históricos sin `imageKey`.

**Limitaciones:**

- No se ha realizado una transferencia PUT o GET real contra AWS S3 para esta funcionalidad.
- No se ha comprobado el funcionamiento efectivo del nuevo endpoint en el entorno real ni se ha desplegado.
- Las reglas modificadas se probaron en emuladores, pero no se publicaron en Firebase Console.
- El servicio frontend público no envía un token Admin para visualizar productos no publicados. La vista previa administrativa autenticada no forma parte de T10.4-C.
- La sustitución de referencias no elimina automáticamente los objetos S3 anteriores. T10.4-D incorpora una eliminación explícita de imágenes no referenciadas.
- La integración real y las comprobaciones funcionales y visuales integrales de toda T10 permanecen pendientes.

La implementación conserva el bucket privado, el CRUD existente, la protección por roles y la compatibilidad con los productos anteriores. No se instalaron dependencias nuevas durante T10.4-C.

#### T10.4-D — Eliminación autorizada de imágenes privadas AWS S3

**Estado:** implementación completada y verificada localmente en su alcance automatizado el 20 de noviembre de 2026. Actualización documental y publicación Git pendientes.

Se implementó la eliminación explícita de imágenes privadas S3 que no estén referenciadas por ningún producto de Firestore. La operación está protegida mediante Firebase Admin y requiere un usuario autenticado con rol `admin`.

El servicio existente `server/s3Upload.ts` incorpora `DeleteObjectCommand` del SDK oficial de AWS. Antes de ejecutar la eliminación, valida la clave S3 y consulta la colección `products`, buscando documentos cuyo campo `imageKey` coincida con la referencia solicitada.

Si encuentra un producto que utiliza la imagen, rechaza la operación mediante `ProductImageReferencedError`. El endpoint responde HTTP 409 y no solicita la eliminación a S3.

Si no encuentra referencias, valida la configuración AWS del servidor y ejecuta `DeleteObjectCommand` exclusivamente sobre la clave válida del prefijo `products/`.

El nuevo endpoint `DELETE /api/product-image-delete` verifica el Firebase ID token con comprobación de revocación, consulta el rol administrativo mediante Firebase Admin y valida el cuerpo JSON. Rechaza métodos, credenciales, roles, contenidos y claves inválidos. Los errores internos de Firebase o AWS no se exponen al cliente.

El servicio frontend `src/services/productImageDeleteService.ts` obtiene el ID token del usuario autenticado y realiza la solicitud HTTP DELETE. Valida la respuesta y presenta mensajes diferenciados para sesión caducada, permisos insuficientes, imagen en uso, errores de conexión y fallos del servidor.

En `AdminProductsPage` se incorpora una acción explícita de eliminación para la imagen recién subida que todavía está pendiente de asociarse al producto. La operación exige confirmación del administrador. Mientras se ejecuta, los controles del formulario permanecen bloqueados.

Cuando la eliminación se confirma correctamente, se limpia la referencia pendiente y se habilita nuevamente la selección de imágenes. Si se cancela o falla, la referencia permanece disponible. Las imágenes ya asociadas a productos no se eliminan automáticamente al editar o eliminar productos.

Se incorporaron dos ajustes adicionales de robustez:

- El cierre del formulario después de guardar correctamente no depende de liberar anticipadamente el estado `busy`; el bloque `finally` mantiene la responsabilidad de restablecerlo.
- Una imagen subida y todavía pendiente de guardar no puede sustituirse por otra selección o subida. El administrador debe guardar el producto o eliminar explícitamente la imagen pendiente.

**Archivos de implementación:**

- `server/s3Upload.ts`: incorporación de `DeleteObjectCommand`, comprobación de referencias y eliminación de objetos.
- `api/product-image-delete.ts`: endpoint DELETE protegido.
- `src/services/productImageDeleteService.ts`: servicio HTTP autenticado.
- `src/pages/AdminProductsPage.tsx`: confirmación, eliminación y protección de imágenes pendientes.

**Archivos de pruebas:**

- `server/s3Delete.test.ts`.
- `api/product-image-delete.test.ts`.
- `src/services/productImageDeleteService.test.ts`.
- `src/pages/AdminProductsPage.test.tsx`.
- `server/s3Upload.test.ts`.

**Evidencia automatizada proporcionada por el desarrollador:**

- Servicio de eliminación S3: diez pruebas aprobadas.
- Endpoint DELETE: 16 pruebas aprobadas.
- Servicio frontend DELETE: 16 pruebas aprobadas.
- Componente administrativo: 24 pruebas aprobadas, diez relacionadas con T10.4-D.
- Servicio S3 existente: 20 pruebas aprobadas.
- Suite general final: 460 pruebas aprobadas, 18 omitidas y ninguna fallida.
- Archivos de pruebas: 25 aprobados y dos omitidos.
- `npm.cmd run typecheck:api`: satisfactorio.
- `npm.cmd run lint`: satisfactorio.
- `npm.cmd run build`: satisfactorio.
- `git diff --check`: sin errores.

El build transformó 149 módulos. Se mantiene la advertencia no bloqueante de Vite por un chunk JavaScript de aproximadamente 580,46 kB.

**Seguridad y limitaciones:**

- La operación exige autenticación válida y rol Admin.
- Las claves se limitan al formato UUID bajo `products/` y a extensiones JPEG, PNG o WebP.
- La consulta de referencias utiliza `products.imageKey` y limita el resultado a un documento.
- Si Firestore no está disponible, no se solicita la eliminación S3.
- Si AWS no está configurado, la operación falla sin informar éxito.
- El bucket continúa privado y no se modificaron políticas IAM, credenciales ni reglas de Firestore.
- La consulta de referencias en Firestore y la eliminación en S3 no constituyen una transacción atómica. Un cambio concurrente podría asociar una imagen después de la comprobación y antes de su eliminación. Esta limitación permanece documentada.
- Cerrar el formulario o abandonar la sesión después de subir una imagen puede dejar un objeto huérfano. No se implementó una limpieza automática ni un listado general de objetos.
- Las imágenes asociadas a productos no se eliminan automáticamente.
- No se efectuaron operaciones DELETE reales contra AWS S3 ni se verificó el endpoint en un entorno Firebase real.

**Alcance pendiente:** la integración efectiva con AWS S3 y Firebase Admin, la comparación y publicación autorizada de reglas Firestore y las pruebas visuales y funcionales integrales se realizarán antes del cierre de toda T10.

La implementación no incorporó dependencias nuevas ni modificó funcionalidades ajenas a la administración de imágenes.

#### T10 — Verificación real AWS/Firebase y mejoras UX administrativas

**Actualización al 20 de noviembre de 2026.** Este apartado registra los resultados posteriores a las subtareas T10.4-A/B/C/D. Las limitaciones históricas descritas en esas subtareas corresponden al momento en que se ejecutaron y no deben confundirse con el estado actual.

**Integración controlada con servicios reales:** el desarrollador ejecutó Vercel Dev con Firebase real y el bucket privado AWS S3 de Papelcorpsac en `us-east-1`. Se creó exclusivamente un producto temporal no publicado, `PRUEBA T10 - Imagen AWS S3`, asociado a la clave `products/db53e3f9-e534-449e-993d-398238907c53.jpg`.

- Subida real mediante URL PUT prefirmada, con persistencia del `imageKey` en Firestore.
- Solicitud administrativa de URL GET: HTTP 200; descarga del JPEG desde S3: HTTP 200 y `Content-Type: image/jpeg`.
- Solicitud anónima de la imagen del producto no publicado: HTTP 404, conforme a la protección implementada.
- Eliminación del documento de prueba desde `/admin/productos`, con confirmación de la interfaz y retorno a los 60 productos originales.
- Eliminación de la imagen temporal desde `DELETE /api/product-image-delete` con autenticación administrativa: HTTP 200 y `{ "deleted": true }`.
- Comprobación posterior mediante AWS Console: el bucket mostró **0 objetos actuales**. La captura verifica la ausencia en el listado actual, no la inexistencia de versiones históricas si se hubiese habilitado el versionado.

Las reglas de productos de T10.3 y la validación de `imageKey` de T10.4-C se publicaron en Firebase Console según la confirmación previa del desarrollador, tras sus pruebas con los emuladores. No se modificaron las reglas para las mejoras UX.

**Mejoras UX autorizadas:** únicamente se actualizaron `src/pages/AdminProductsPage.tsx` y `src/pages/AdminProductsPage.test.tsx`. El panel admite búsqueda por nombre o marca (sin distinguir mayúsculas), filtros combinables por categoría y publicación, resultados vacíos, paginación local de doce productos y retorno a la primera página al cambiar filtros. Se conserva el orden alfabético original. Al pulsar «Editar», el formulario se abre y se solicita desplazamiento automático. Las tarjetas móviles muestran los botones debajo del contenido; el desarrollador comprobó visualmente la corrección a **320 px**. Se descartó el filtro cronológico porque los productos históricos no disponen de `createdAt` fiable. No se alteraron los 60 productos originales ni se incorporaron dependencias o archivos nuevos.

**Evidencia técnica del desarrollador:** 30 pruebas de `AdminProductsPage.test.tsx` aprobadas; suite general repetida después del ajuste responsive con **466 aprobadas, 18 omitidas y 0 fallidas** (25 archivos aprobados y dos omitidos); TypeScript API, ESLint, build y `git diff --check` satisfactorios según las ejecuciones compartidas. Las diez pruebas de reglas de productos omitidas en la suite general se habían aprobado por separado con emuladores; las otras ocho pertenecen a la integración de checkout previamente verificada. La advertencia no bloqueante de Vite por un chunk de unos 580,46 kB continúa documentada.

**Verificación final de Tailwind:** el desarrollador sustituyó manualmente `break-words` por `wrap-break-word` conforme a Tailwind CSS IntelliSense después de esas verificaciones; posteriormente se ejecutaron satisfactoriamente las 466 pruebas, ESLint, build y TypeScript API. El código UX y la documentación de cierre todavía no cuentan con commit y push confirmados. La ausencia de despliegue público, la falta de limpieza automática de objetos huérfanos y el carácter no atómico de la consulta Firestore y el borrado S3 siguen siendo limitaciones conocidas. T11 no está autorizada.

## 6. Arquitectura y reutilización

Se utiliza una arquitectura sencilla con separación clara de responsabilidades.

Principios generales:

- Componentes reutilizables con props tipadas.
- Composición mediante children cuando corresponda.
- Navegación SPA con React Router.
- Layouts diferenciados para cliente y administrador.
- Contextos separados para autenticación y carrito.
- useReducer para gestionar las acciones del carrito.
- Hooks para lógica React reutilizable.
- Servicios para interactuar con Firebase y AWS.
- Firebase Admin SDK exclusivamente en el entorno de servidor.
- Vercel Serverless Functions para operaciones HTTP protegidas.

La estructura sigue un enfoque por capas, como el explicado en el repositorio del docente.

No se crearán componentes, abstracciones ni directorios innecesarios.

### Gestión de imágenes privadas AWS S3 (T10.4)

Backend:

- `api/product-image-upload-url.ts`: generación protegida de URLs PUT prefirmadas.
- `api/product-image-url.ts`: generación de URLs GET temporales para productos.
- `api/product-image-delete.ts`: eliminación protegida de imágenes no referenciadas.
- `server/s3Upload.ts`: validación de claves, generación de URLs prefirmadas y operaciones de objetos S3.

Frontend:

- `src/services/productImageUploadService.ts`: subida de archivos mediante URL PUT.
- `src/services/productImageService.ts`: obtención de URLs GET temporales.
- `src/services/productImageDeleteService.ts`: solicitud autenticada de eliminación.
- `src/components/ProductCard.tsx`: integración de la visualización de imágenes.
- `src/pages/AdminProductsPage.tsx`: gestión administrativa de productos e imágenes.

Las operaciones AWS permanecen en el servidor. El frontend no contiene credenciales AWS y utiliza Firebase ID tokens para las operaciones administrativas.

### Estructura funcional del checkout

Frontend:

- `src/pages/CheckoutPage.tsx`: interfaz de confirmación.
- `src/services/checkoutService.ts`: comunicación HTTP con el backend.
- `src/pages/CheckoutPage.test.tsx`: pruebas del componente.
- `src/services/checkoutService.test.ts`: pruebas del servicio HTTP.

Carrito:

- `src/contexts/CartContext.tsx`.
- `src/hooks/useCart.ts`.
- `src/reducers/cartReducer.ts`.
- `src/reducers/cartReducer.test.ts`.
- `src/types/cart.ts`.

Backend:

- `api/health.ts`: comprobación de disponibilidad.
- `api/auth-check.ts`: verificación de autenticación.
- `api/checkout.ts`: endpoint protegido de checkout.
- `server/firebaseAdmin.ts`: inicialización y configuración de Firebase Admin.
- `server/auth.ts`: verificación de Bearer tokens.
- `server/checkoutValidation.ts`: validación de solicitudes.
- `server/checkoutService.ts`: lógica transaccional de órdenes.

Historial y detalle de órdenes (T08):

- `src/types/order.ts`: tipos de orden, artículos y estados permitidos.
- `src/services/orderService.ts`: consulta del historial filtrado por UID, ordenamiento por fecha y consulta individual con validación del propietario y de los datos recibidos.
- `src/pages/OrdersPage.tsx`: historial del cliente con carga, estado vacío, errores y reintentos.
- `src/pages/OrderDetailPage.tsx`: detalle de una orden con artículos, importes, estado, carga, error, no encontrada y reintentos.
- `src/pages/OrdersPage.test.tsx` y `src/pages/OrderDetailPage.test.tsx`: pruebas de las páginas.
- `src/services/orderService.test.ts`: pruebas del servicio.
- `src/App.tsx`: rutas protegidas `/mis-ordenes` y `/mis-ordenes/:orderId`.
- `src/components/Header.tsx`: enlace «Mis órdenes» para usuarios autenticados.

Pruebas de checkout y autenticación:

- `api/auth-check.test.ts`.
- `api/checkout.test.ts`.
- `server/auth.test.ts`.
- `server/firebaseAdmin.test.ts`.
- `server/checkoutValidation.test.ts`.
- `server/checkoutService.test.ts`.
- `server/checkoutService.integration.test.ts`.
- Pruebas del cliente y componentes de checkout.

## 7. Seguridad y dependencias

### Seguridad de la aplicación

- Proteger credenciales y variables de entorno.
- Utilizar .env.example sin valores sensibles.
- Evitar publicar secretos en GitHub.
- Mantener credenciales AWS únicamente en servidor.
- Aplicar reglas de seguridad de Firestore.
- Validar permisos según rol y propietario.
- Proteger las operaciones administrativas.
- Verificar datos comerciales antes de crear órdenes.
- Utilizar URLs prefirmadas para cargas autorizadas a S3.
- No confiar en identificadores, precios o importes enviados por el navegador.

### 7.1 Autenticación de servidor

Se utiliza Firebase Admin SDK para verificar los Firebase ID tokens.

La implementación contempla:

- Extracción del Bearer token.
- Verificación mediante Firebase Admin.
- Comprobación de revocación para operaciones sensibles.
- Obtención del UID exclusivamente a partir del token verificado.
- Clasificación de errores de autenticación.
- Rechazo de solicitudes sin credenciales válidas.

El endpoint diagnóstico es:

`GET /api/auth-check`

El checkout utiliza:

`POST /api/checkout`

El endpoint de diagnóstico no sustituye la autorización de las operaciones comerciales.

### 7.2 Configuración de Firebase Admin

Archivo principal:

`server/firebaseAdmin.ts`

Configuración de demostración:

- `FIREBASE_PROJECT_ID=demo-papelcorpsac`
- `PAPELCORPSAC_USE_AUTH_EMULATOR=true`
- `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`
- `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`
- `PAPELCORPSAC_ENABLE_CHECKOUT_EMULATOR=true`

La variable `PAPELCORPSAC_ENABLE_CHECKOUT_EMULATOR` habilita expresamente el endpoint de checkout para pruebas con Firestore Emulator. Si no está configurada en `true`, el endpoint rechaza las operaciones de checkout con HTTP 503.

La configuración del emulador exige el proyecto ficticio y los hosts exactos.

Restricciones:

- Rechazar el modo emulador cuando `NODE_ENV=production`.
- Rechazarlo cuando `VERCEL_ENV` sea distinto de `development`.
- Rechazar marcadores Vercel sin identificar el entorno como `development`.
- No utilizar el proyecto ficticio en operaciones reales.
- Mantener las credenciales privadas fuera del frontend y del repositorio.
- No incluir secretos en variables `VITE_*`.

La integración local con Vercel requiere establecer explícitamente el entorno de desarrollo y las variables de los emuladores antes de iniciar el proceso.

La configuración de Preview y Production deberá excluir las variables de emulador.

Las pruebas locales no equivalen a una validación de despliegue público.

### 7.3 Decisiones de seguridad del checkout

Las operaciones comerciales se ejecutan en el servidor.

El cliente envía únicamente:

- Identificador del producto.
- Cantidad solicitada.
- Clave de idempotencia.

El cliente no determina:

- UID propietario de la orden.
- Precio unitario definitivo.
- Subtotales.
- Importe total.
- Existencias disponibles.

El servidor obtiene el UID del token verificado y consulta los productos directamente en Firestore.

La validación comprueba:

- Estructura del cuerpo.
- Tipo de contenido.
- Clave UUID v4.
- Identificadores de productos.
- Cantidades enteras válidas.
- Ausencia de propiedades adicionales.
- Productos publicados.
- Precios válidos.
- Existencias suficientes.

### 7.4 Transacciones de checkout

La lógica comercial está implementada en:

`server/checkoutService.ts`

La operación:

1. Valida la solicitud.
2. Normaliza y ordena los artículos.
3. Calcula una huella del pedido.
4. Genera un identificador determinista de orden a partir del UID y la clave de idempotencia.
5. Comprueba si ya existe una orden para ese intento.
6. Obtiene los productos y sus precios desde Firestore.
7. Comprueba publicación y disponibilidad.
8. Calcula importes en céntimos.
9. Crea la orden.
10. Descuenta el stock dentro de la misma transacción.

La orden contiene:

- `userId`
- `status`
- `currency`
- `items`
- `totalCents`
- `idempotencyKey`
- `requestFingerprint`
- `createdAt`

Los artículos conservan:

- `productId`
- `name`
- `quantity`
- `unitPriceCents`
- `subtotalCents`

La orden se crea inicialmente con:

- `status: pending`
- `currency: PEN`

No se implementa una pasarela de pago real.

### 7.5 Idempotencia

La idempotencia evita que un mismo intento de compra cree varias órdenes o descuente stock nuevamente.

Comportamiento:

- Misma clave y mismo contenido: devuelve la orden existente.
- Misma clave y contenido diferente: rechaza la solicitud con HTTP 409.
- Nueva clave: representa un nuevo intento de compra.

El identificador de orden se deriva de una función hash del UID autenticado y de la clave de idempotencia.

En el frontend:

- Se conserva la clave del intento asociado al usuario y al contenido del pedido.
- Se utiliza sessionStorage para conservar el intento durante la sesión.
- Se valida la estructura de los datos almacenados.
- Se descartan registros corruptos o incompatibles.
- Se genera una clave nueva cuando corresponde.

La persistencia no sustituye la idempotencia del servidor; esta última es la protección definitiva contra órdenes duplicadas.

### 7.6 Protección del carrito

La limpieza del carrito utiliza una comparación con el snapshot de los artículos enviados.

El carrito solamente se vacía cuando sus productos y cantidades continúan coincidiendo con el pedido confirmado.

Si el usuario modifica el carrito durante una solicitud pendiente, los artículos nuevos o modificados se conservan.

Esta protección está implementada mediante:

- `CartSnapshotItem`.
- `CLEAR_CART_IF_UNCHANGED`.
- `clearCartIfUnchanged`.
- Pruebas del reducer y del componente.

No se realizan operaciones de limpieza incondicional después de cualquier respuesta HTTP exitosa.

### 7.7 Reglas de Firestore

Las reglas de Firestore mantienen las órdenes protegidas por propietario y reservan las escrituras comerciales al backend.

La regla publicada durante T08 para `orders` era:

```javascript
match /orders/{orderId} {
  allow get: if isSignedIn()
    && (
      resource == null
      || isOwner(resource.data.userId)
    );

  allow list: if isOwner(resource.data.userId);

  allow create, update, delete: if false;
}
```

Comportamiento:

- `get`: requiere autenticación. Si el documento existe, solo su propietario puede leerlo. Si no existe, un usuario autenticado recibe el resultado de documento inexistente, sin datos de orden.
- `list`: solo permite consultar documentos cuyo `userId` coincida con el UID autenticado. El cliente consulta el historial con `where('userId', '==', uid)`; las reglas no sustituyen ese filtro de consulta.
- `create`, `update` y `delete`: permanecen denegados a clientes.
- No se incorpora permiso administrativo para leer o modificar órdenes en esta etapa. La administración global de órdenes corresponde a T11 y deberá autorizarse expresamente.

La condición `resource == null` permite distinguir una orden inexistente (HTTP 404 en la comprobación REST) de una orden existente que pertenece a otra cuenta (HTTP 403). Un usuario anónimo no puede consultar ni siquiera un identificador inexistente (HTTP 403). La existencia de un identificador puede inferirse por esa diferencia de respuesta; esta decisión se acepta para proporcionar el estado «orden no encontrada», mientras que el contenido de órdenes ajenas sigue protegido. Los identificadores de órdenes de producción se generan en el backend mediante un hash determinista del UID y la clave de idempotencia.

Las operaciones de creación de órdenes y descuento de stock continúan ejecutándose mediante Firebase Admin SDK en el servidor T07; el SDK administrativo no está sujeto a las reglas de cliente. No se habilitan escrituras públicas para facilitar pruebas.

**Estado de publicación:** el desarrollador confirmó la publicación de las reglas actualizadas en Firestore Console el 11 de noviembre de 2026. La validación de comportamiento se realizó previamente en Firestore Emulator con el proyecto ficticio `demo-papelcorpsac`.

Durante T10.3 se ampliaron las reglas de `products` para permitir operaciones CRUD únicamente al rol Admin, validar datos comerciales y admitir precios con dos decimales. El catálogo público conserva lecturas únicamente de productos publicados, y las restricciones de usuarios, favoritos y órdenes se mantienen. Las 15 verificaciones de permisos y cuatro de precios se realizaron en Firestore Emulator; estas reglas nuevas no se publicaron en Firebase real.

En T10.4-C se añadió la validación opcional de `imageKey` bajo el prefijo `products/`, con UUID y extensiones `jpg`, `png` o `webp`. Diez pruebas de integración con Authentication Emulator y Firestore Emulator aprobaron. Se comprobó la conservación de los permisos de productos publicados, no publicados y escrituras administrativas. Estas reglas tampoco se han publicado en Firebase real.

T10.4-D no modifica las reglas de Firestore. La comprobación de referencias a `imageKey` se realiza mediante Firebase Admin en el backend, antes de solicitar la eliminación del objeto S3.

Actualización posterior de T10 (20/11/2026): el desarrollador confirmó que las reglas de productos de T10.3 y la validación opcional de `imageKey` de T10.4-C se publicaron en Firebase Console después de su verificación en emuladores. La integración real posterior corroboró la lectura administrativa y la protección de imágenes no publicadas. La publicación no fue parte de las subtareas históricas anteriores. Las mejoras UX no modificaron `firestore.rules`.

#### Actualización T11.2 — Permisos administrativos de órdenes

**Actualización del 20 de noviembre de 2026.** La regla histórica de T08 mostrada anteriormente se amplió localmente durante T11.2, sin alterar la creación de órdenes mediante Firebase Admin en el backend.

La nueva versión local de `firestore.rules` permite al rol Admin consultar todas las órdenes y modificar únicamente el campo `status`, restringido a `pending`, `processing`, `completed` y `cancelled`. El SDK cliente continúa sin permisos para crear o eliminar órdenes. Los clientes conservan la lectura limitada a sus propias órdenes y no pueden modificarlas. No se habilitaron modificaciones de artículos, propietario, importes ni otros campos.

Se añadieron `getAdminOrders` y `updateAdminOrderStatus` a `src/services/orderService.ts`, reutilizando las validaciones y los tipos existentes. Estas funciones todavía no están conectadas a una nueva interfaz administrativa, que corresponde a una subtarea posterior.

**Evidencia aportada:** suite general con 479 pruebas aprobadas, 33 omitidas y ninguna fallida; 24 pruebas del servicio de órdenes aprobadas. Las 15 pruebas nuevas de permisos administrativos se ejecutaron y aprobaron por separado con Firebase Authentication Emulator y Firestore Emulator mediante `demo-papelcorpsac`. La ejecución inicial tuvo un fallo de preparación de datos debido al uso de un Timestamp de Firebase Admin con el SDK cliente; la prueba se corrigió y posteriormente aprobaron los 15 casos. ESLint, build, TypeScript API y `git diff --check` resultaron satisfactorios.

**Estado:** T11.2 implementada y verificada localmente. Las reglas nuevas no están publicadas en Firebase Console; faltan revisión final del diff, comparación con las reglas activas, autorización independiente para publicarlas y commit/push. No se implementó la interfaz de T11.3.

### 7.8 Configuración de emuladores en el frontend (T08)

El cliente utiliza `VITE_USE_FIREBASE_EMULATORS` para conectar Firebase Authentication y Firestore Emulator únicamente durante desarrollo local.

- `.env.example` mantiene `VITE_USE_FIREBASE_EMULATORS=false` por defecto.
- La activación requiere `import.meta.env.DEV` y el proyecto ficticio `demo-papelcorpsac`.
- Authentication Emulator utiliza `127.0.0.1:9099`.
- Firestore Emulator utiliza `127.0.0.1:8080`.
- `.env.development.local` está excluido de Git mediante `.gitignore` y se utiliza para las pruebas locales.
- No se deben habilitar emuladores en Preview ni Production.

Durante el diagnóstico de T10.4-B, `vercel dev` mostró un error de configuración al cargar la interfaz con emuladores. La página volvió a funcionar cuando se inició Vercel Dev con el indicador de emuladores desactivado y el proyecto Firebase real mediante variables temporales de proceso. Esto confirmó la carga visual del frontend, pero no la autenticación efectiva de Firebase Admin ni una subida real a S3.

### 7.9 Auditoría de dependencias

Se utilizan versiones compatibles y estables.

Durante T07 se identificaron cinco alertas moderadas relacionadas con dependencias transitivas de Firestore, principalmente en la cadena de paquetes de Google Cloud.

El problema fue investigado y tratado mediante una actualización compatible del árbol de dependencias.

Evidencia:

- Commit `c8ea255`.
- Mensaje: `fix: resolve Firestore vulnerabilities and Tailwind warning`.
- Actualización de `package-lock.json`.
- El desarrollador ejecutó posteriormente `npm.cmd audit`.
- El desarrollador ejecutó `npm.cmd audit --omit=dev`.
- Ambas auditorías reportaron cero vulnerabilidades.

Los resultados sin vulnerabilidades corresponden a aquella corrección histórica de T07; no representan la situación actual de T10.4-A.

**Seguimiento de seguridad de T10.4-A (18 de noviembre de 2026):** tras instalar las dependencias oficiales AWS SDK v3, `npm.cmd audit` reportó **12 alertas altas** derivadas de un único aviso sobre `picomatch@4.0.7`, `GHSA-fc5q-39xc-vjpf`, utilizado en el árbol de herramientas de desarrollo por Vite 8.3.6, Vitest 5.1.0, `tinyglobby`, `fdir` y dependencias asociadas a TypeScript ESLint. El conteo de 12 se refiere a paquetes afectados en esa cadena y no a 12 fallos independientes confirmados. `npm.cmd audit --omit=dev` reportó **cero vulnerabilidades**.

Se reprodujo la alerta con `--prefer-online` y una caché nueva. El 18 de noviembre de 2026, GitHub Advisory Database marcó retirado el aviso `GHSA-fc5q-39xc-vjpf`, pero el servicio de auditoría del registro npm continuó reportándolo. Esto constituye una discrepancia entre fuentes de seguridad; no se presenta como auditoría general limpia ni como garantía de ausencia de riesgos.

Se evaluaron la versión oficial, overrides, forks y la recomendación de `npm audit fix --force`. No se acreditó una versión oficial corregida compatible; forzar la instalación proponía degradar Vite o Vitest y podía romper el proyecto. No se introdujo un fork no verificado ni un override ficticio. Permanecen los overrides históricos `minimatch: 11.0.3` y `@firebase/firestore@4.19.1` → `@grpc/grpc-js: 1.13.7`.

**Decisión autorizada:** el desarrollador acepta provisionalmente este hallazgo residual del entorno de desarrollo, documentado de forma explícita, para el cierre de T10.4-A. Las pruebas funcionales, el build y el análisis de tipos fueron satisfactorios; la auditoría de producción permanece en cero según los resultados aportados. Se realizará seguimiento de fuentes oficiales para aplicar una corrección compatible cuando exista, previa evaluación, autorización y nuevas pruebas. Esta excepción no autoriza publicar secretos, desactivar controles ni desplegar sin una revisión de seguridad posterior.

**Seguimiento posterior del 20 de noviembre de 2026:** el desarrollador volvió a ejecutar `npm.cmd audit` y `npm.cmd audit --omit=dev`. Ambos comandos reportaron **cero vulnerabilidades**. `npm.cmd ls picomatch` confirmó que continúa instalado `picomatch@4.0.7` como dependencia transitiva de las herramientas de desarrollo. No se modificaron dependencias ni se aplicaron overrides o actualizaciones forzadas para obtener este resultado. Las 12 alertas de T10.4-A quedan conservadas como evidencia histórica, pero ya no corresponden a la última auditoría reportada. La excepción provisional asociada al aviso retirado no presenta alertas vigentes en esa ejecución; deberán mantenerse las auditorías periódicas.

Las auditorías deberán repetirse cuando cambien las dependencias y antes del despliegue. No se utilizarán overrides ni actualizaciones forzadas sin justificación y autorización.

### 7.10 Advertencia de compilación

Vite continúa mostrando una advertencia no bloqueante relacionada con el tamaño de un chunk JavaScript superior a 500 kB minificados.

El build termina correctamente.

La optimización se pospone para una revisión posterior, sin introducir división de código innecesaria durante T07.

## 8. Estado de implementación y testing

### 8.1 Estado de T07

**T07 — Implementar checkout: COMPLETADA Y VERIFICADA LOCALMENTE.**

Subtareas:

| Subtarea | Resultado |
|---|---|
| T07.1 — Infraestructura Vercel | Implementada y publicada; despliegue público pendiente |
| T07.2-A — Authentication Emulator | Completada |
| T07.2-B — Autenticación de servidor | Completada |
| T07.3-A — Validación | Completada |
| T07.3-B — Servicio transaccional | Completada |
| T07.3-C — Endpoint protegido | Completada |
| T07.3-D — Integración Firestore | Completada |
| T07.4-A — Interfaz React | Completada |
| T07.4-B — Pruebas de cliente y componente | Completada |
| T07.4-C — Protección del carrito e idempotencia | Completada |

Commits principales:

- `5c83725`: infraestructura Vercel.
- `1a1b713`: configuración Firebase Authentication Emulator.
- `65eafcd`: verificación de ID tokens en servidor.
- `beb8f51`: ajustes de TypeScript API.
- `c8ea255`: corrección de dependencias transitivas.
- `e578af2`: validación de solicitudes.
- `58d0c39`: servicio transaccional de checkout.
- `1d61f22`: endpoint HTTP protegido.
- `43bd2e7`: pruebas de integración Firestore.
- `86fe9ca`: interfaz y navegación de checkout.
- `fce557c`: pruebas del cliente HTTP.
- `0aeddfb`: pruebas del componente React.
- `ee29994`: protección del carrito e idempotencia.

### 8.2 Pruebas automatizadas

Últimos resultados generales reportados por el desarrollador el 20 de noviembre de 2026, después de las mejoras UX y la corrección responsive de T10:

| Verificación | Resultado |
|---|---|
| Build TypeScript y Vite | Correcto |
| ESLint | Correcto |
| Vitest, suite general posterior a UX | 466 pruebas aprobadas |
| Pruebas fallidas | 0 |
| Pruebas omitidas en la suite general | 18 |
| Archivos de pruebas | 25 aprobados y dos omitidos |
| Panel administrativo `AdminProductsPage.test.tsx` | 30 pruebas aprobadas |
| Endpoint DELETE de imágenes | 16 pruebas aprobadas |
| Servicio frontend DELETE | 16 pruebas aprobadas |
| Servicio de eliminación S3 | 10 pruebas aprobadas |
| Servicio S3 existente | 20 pruebas aprobadas |
| Reglas Firestore de T10.4-C | 10 pruebas de integración aprobadas por separado |
| TypeScript API | Correcto |
| `npm audit` | Última ejecución reportada, 20/11/2026: cero vulnerabilidades; antecedente de 12 alertas documentado en 7.9 |
| `npm audit --omit=dev` | Última ejecución reportada, 20/11/2026: cero vulnerabilidades |
| `git diff --check` | Sin errores de formato |

Históricamente, T10.4-D terminó con 460 pruebas aprobadas, 18 omitidas y ninguna fallida. Después se añadieron cinco casos UX y se realizó la corrección responsive; la última suite general compartida terminó con 466 pruebas aprobadas, 18 omitidas y ninguna fallida. El cambio manual posterior de `break-words` a `wrap-break-word` quedó verificado posteriormente mediante lint y build satisfactorios.

Las 18 omitidas corresponden a las diez pruebas de reglas de productos y las ocho de integración transaccional de checkout. Las diez pruebas de reglas fueron ejecutadas y aprobadas por separado mediante Firebase Emulator durante T10.4-C.

Las pruebas de T10.4-D utilizan mocks para las operaciones AWS y Firebase correspondientes. No demuestran la eliminación efectiva de objetos reales en S3.

Evidencia histórica de T07:

- Suite general: 264 pruebas aprobadas y ocho omitidas.
- Suite de integración independiente: ocho pruebas aprobadas.
- Total histórico considerando ambas ejecuciones: 272 aprobadas.

Las auditorías históricas de T07 habían reportado cero vulnerabilidades; durante T10.4-A se detectó y documentó el aviso `picomatch`, con 12 alertas generales y cero de producción. Estas pruebas no sustituyen la revisión integral de T12.

**Verificación incremental T11.2:** el desarrollador reportó 479 pruebas aprobadas, 33 omitidas y cero fallidas en la suite general. De las 33 omitidas, 15 corresponden a las pruebas nuevas de reglas administrativas, que posteriormente aprobaron en una ejecución independiente con emuladores locales (15/15). Las otras 18 son las suites de integración conocidas de checkout y reglas de productos. Las comprobaciones de lint, build y TypeScript API fueron satisfactorias. Las cifras anteriores de T10 se conservan como historial.

### 8.3 Pruebas de integración HTTP

Se verificó manualmente el recorrido mediante Vercel local y Firebase Emulators.

Configuración de demostración:

- Proyecto: `demo-papelcorpsac`.
- Authentication Emulator: `127.0.0.1:9099`.
- Firestore Emulator: `127.0.0.1:8080`.
- Vercel local: puerto 3000.

Resultados:

| Escenario | Respuesta |
|---|---|
| Health endpoint | HTTP 200 |
| Auth-check sin token | HTTP 401 |
| JWT ficticio | HTTP 401 |
| ID token válido | HTTP 200 |
| Checkout sin token | HTTP 401 |
| Primera compra | HTTP 201 |
| Reintento idempotente | HTTP 200 |
| Misma clave y contenido diferente | HTTP 409 |
| Stock insuficiente | HTTP 409 |

Se comprobó una compra demostrativa con:

- Producto: `checkout-test-product`.
- Precio unitario: S/ 12.50.
- Stock inicial: cinco unidades.
- Cantidad comprada: una unidad.
- Total: 1250 céntimos.
- Estado de la orden: `pending`.
- Stock restante: cuatro unidades.

La orden se consultó mediante Firebase Admin SDK.

La repetición de la misma solicitud devolvió la misma orden con `replayed: true`, sin descontar stock nuevamente.

Las solicitudes conflictivas y de stock insuficiente no modificaron las existencias.

Todas estas operaciones se realizaron en emuladores locales. No se utilizaron servicios comerciales reales.

### 8.4 Alcance de la verificación

Las pruebas realizadas demuestran el comportamiento de las funciones de servidor, los servicios y el historial/detalle de órdenes mediante emuladores.

No equivalen a:

- Despliegue de funciones en Vercel Production.
- Prueba comercial de checkout con Firebase real.
- Integración con una pasarela de pagos.
- Implementación del panel de administración de órdenes (T11).
- Revisión integral de calidad de T12.

T10.4-A, T10.4-B y T10.4-C incorporaron pruebas automatizadas de generación PUT, subida desde el frontend, persistencia de referencias, generación GET y visualización de imágenes privadas.

T10.4-D incorporó el endpoint DELETE protegido, la comprobación de referencias en Firestore, la eliminación mediante AWS SDK y su integración en el panel administrativo. Las pruebas automatizadas verifican la autorización, la validación de claves, el rechazo de imágenes referenciadas, el manejo de errores y la confirmación del administrador. Las operaciones AWS y Firebase se probaron mediante mocks; no se realizaron eliminaciones reales de objetos.

La consulta de referencias en Firestore y la eliminación en S3 no son atómicas. Un cambio concurrente podría asociar una imagen después de la comprobación y antes de su eliminación. Tampoco existe una limpieza automática de objetos huérfanos.

Actualización de T10 del 20/11/2026: posteriormente se verificaron PUT, GET y DELETE efectivos contra S3 desde el entorno local con Firebase real. También se confirmó la publicación de las reglas de productos por el desarrollador y se revisaron visualmente las mejoras UX en escritorio y en móvil a 320 px. La ausencia del objeto de prueba se corroboró en el listado actual de AWS Console (cero objetos). Esta evidencia no supone un despliegue público ni elimina el riesgo de concurrencia o de versiones históricas.

### 8.5 T08 — Historial y detalle de órdenes

**Estado de implementación de T08:** funcionalidad implementada y verificada localmente. El desarrollador confirmó la publicación de las reglas de Firestore en Firebase Console. El código está publicado en GitHub mediante el commit `b3107e1`. Esta actualización documental registra el cierre formal de T08.

Archivos principales:

- `src/types/order.ts`.
- `src/services/orderService.ts` y `src/services/orderService.test.ts`.
- `src/pages/OrdersPage.tsx` y `src/pages/OrdersPage.test.tsx`.
- `src/pages/OrderDetailPage.tsx` y `src/pages/OrderDetailPage.test.tsx`.
- Integración de rutas protegidas en `src/App.tsx` y navegación en `src/components/Header.tsx`.
- Reglas de propietario para `/orders/{orderId}` en `firestore.rules`.
- Configuración del cliente y emuladores en `src/lib/firebase.ts` y `.env.example`.

Cobertura automatizada específica de T08:

- `orderService.test.ts`: 11 pruebas aprobadas.
- `OrdersPage.test.tsx`: 4 pruebas aprobadas.
- `OrderDetailPage.test.tsx`: 5 pruebas aprobadas.
- Total: 20 pruebas específicas de T08 aprobadas.

Verificación manual con Firebase Emulator Suite:

- Se registraron dos usuarios de prueba independientes en `demo-papelcorpsac`, con perfiles `customer` asociados a sus UID.
- Se crearon mediante Firebase Admin dos órdenes de demostración: `t08-demo-order-a` (S/ 25.00) y `t08-demo-order-b` (S/ 37.50), cada una asociada al UID correcto.
- Cada usuario consultó una sola orden propia en el historial y pudo abrir su detalle.
- Los intentos de consultar la orden del otro usuario fueron rechazados (HTTP 403).
- Lectura de una orden propia: HTTP 200.
- Consulta autenticada de una orden inexistente: HTTP 404.
- Consulta anónima de una orden inexistente: HTTP 403.
- Dos intentos de creación y dos de actualización directa de órdenes fueron rechazados (HTTP 403). Estas pruebas se ejecutaron antes del ajuste final de la condición `get`; las reglas `create`, `update` y `delete` no cambiaron en la versión final.
- La prueba de eliminación directa de un documento temporal fue rechazada (HTTP 403); se verificó que el documento seguía existiendo y después se eliminó mediante Firebase Admin.
- Las verificaciones se realizaron con Authentication Emulator (`127.0.0.1:9099`), Firestore Emulator (`127.0.0.1:8080`) y Vite (`127.0.0.1:5173`). Los datos de prueba pertenecen al proyecto ficticio y no al Firebase real.

Verificación final reportada por el desarrollador el 11 de noviembre de 2026:

- `npm.cmd run build`: satisfactorio; Vite transformó 144 módulos. Se mantuvo la advertencia no bloqueante de un chunk superior a 500 kB (archivo `index.esm` de aproximadamente 580,46 kB minificados).
- `npm.cmd run lint`: satisfactorio.
- `npm.cmd run test`: 12 archivos aprobados, 1 archivo omitido; 284 pruebas aprobadas y 8 omitidas (292 en total). El archivo omitido corresponde a las pruebas de integración de checkout que requieren Firestore Emulator; esas ocho pruebas habían sido aprobadas separadamente durante T07.
- `git diff --check`: sin errores de whitespace. Git mostró una advertencia no bloqueante de conversión LF/CRLF para `src/App.tsx`.

La publicación de reglas en Firestore Console fue confirmada por el desarrollador. No se desplegó la aplicación ni el backend en Vercel Production. T08 no sustituye la revisión integral pendiente de T12 ni habilita la administración de órdenes de T11.

## 9. Despliegue

### Infraestructura local

- Vercel CLI instalada y disponible.
- Proyecto Vercel `looney-ai-chat/papelcorpsac` vinculado localmente.
- Funciones API reconocidas por Vercel.
- Endpoint `/api/health` verificado localmente.
- Endpoint `/api/auth-check` verificado localmente.
- Endpoint `/api/checkout` verificado localmente.
- Endpoint `/api/product-image-upload-url` reconocido localmente mediante Vercel Dev; respuesta GET HTTP 405 esperada.
- Rutas SPA verificadas en el entorno local.

### Estado de producción

La aplicación Papelcorpsac no está desplegada en producción.

No se activó integración automática con GitHub.

No se realizó un despliegue público del backend.

Antes de desplegar:

- Revisar el árbol efectivo de dependencias.
- Comprobar el artefacto de producción.
- Verificar la configuración de credenciales y permisos.
- Mantener los emuladores deshabilitados en Preview y Production.
- Configurar variables por entorno.
- Comprobar autenticación y endpoints.
- Obtener autorización expresa del desarrollador.

La verificación local no constituye autorización de despliegue.

## 10. Testing y revisión integral

La revisión integral corresponde a T12.

Requisitos pendientes:

- Preparar renderWithProviders.
- Probar useAuth mediante renderHook.
- Probar useCart mediante renderHook.
- Completar pruebas de componentes importantes.
- Completar pruebas automatizadas de integración del carrito y checkout.
- Mockear Firebase y AWS en los escenarios correspondientes.
- Evaluar casos límite.
- Revisar responsive y accesibilidad.
- Ejecutar tests, lint y build como revisión integral.
- Mantener auditorías de dependencias actualizadas.

Las pruebas de reducer, servicio, componente y Firestore Emulator implementadas durante T07 forman parte de la cobertura incremental del proyecto.

Las pruebas de subida, persistencia, visualización y eliminación de imágenes de T10.4-A/B/C/D ampliaron esta cobertura. La integración real con Firebase y AWS S3 y las revisiones visuales administrativas posteriores se registran en el cierre de T10; la comprobación final del ajuste canónico de Tailwind fue satisfactoria; permanecen pendientes la publicación Git y su confirmación. Estas verificaciones no sustituyen T12.

No deben presentarse como sustituto de todos los requisitos de T12.

## 11. Uso de IA y responsabilidades

### Uso de inteligencia artificial

Se utilizará IA para:

- Analizar decisiones técnicas.
- Planificar funcionalidades.
- Revisar código.
- Proponer casos de prueba.
- Identificar errores.
- Comparar alternativas de implementación.

El README incluirá una bitácora con al menos cinco entradas reales sobre el uso de IA.

Cada entrada documentará la consulta realizada, lo aprendido y la decisión tomada.

No se inventarán evidencias ni reflexiones personales.

### Responsabilidades

**Desarrollador:**

- Inicializar el proyecto.
- Aprobar dependencias y versiones.
- Configurar Firebase, AWS y Vercel.
- Gestionar credenciales y permisos.
- Autorizar cambios sensibles y despliegues.
- Documentar el aprendizaje con IA.
- Tomar las decisiones finales.
- Ejecutar manualmente los comandos y comprobar sus resultados.

**Implementación asistida con IA:**

- Desarrollar únicamente funcionalidades autorizadas.
- Entregar archivos completos cuando se soliciten modificaciones.
- Reutilizar componentes y servicios existentes.
- Proponer pruebas pertinentes.
- Explicar los cambios, riesgos y verificaciones necesarias.
- No afirmar que se ejecutaron comandos o pruebas sin evidencia del desarrollador.

GitHub Copilot se utilizó durante las etapas anteriores. Por agotamiento de los créditos gratuitos, el desarrollo continúa manualmente en VS Code con asistencia desde este chat.

**Regla de revisión aprobada durante T08:** todas las revisiones técnicas, análisis de código y verificaciones de solo lectura se realizan exclusivamente desde este chat. No se utilizará GitHub Copilot Reviewer ni otro agente externo para revisar el proyecto. Las modificaciones siguen requiriendo autorización expresa del desarrollador.

No se utilizarán ZIP ni documentos descargables para entregar código.

**Revisión técnica desde este chat:**

- Revisar código y requisitos.
- Detectar errores y riesgos.
- Identificar sobreingeniería.
- Informar resultados sin modificar archivos durante una revisión de solo lectura.
- Distinguir la evidencia aportada por el desarrollador de las comprobaciones todavía pendientes.
- No utilizar Copilot Reviewer; la revisión queda centralizada en este chat.

El desarrollador conserva la responsabilidad de autorizar los cambios y ejecutarlos.

## 12. Alcance y criterios de finalización

### Alcance

La prioridad será completar los requisitos funcionales, técnicos y de evaluación del Proyecto Integrador 5.

No se incorporarán inicialmente:

- Pasarelas de pago reales.
- Facturación electrónica.
- Gestión de múltiples almacenes.
- Variantes complejas.
- Dashboards analíticos.
- Sistemas de reseñas.
- Funcionalidades comerciales no solicitadas.

Las ampliaciones requerirán justificación y aprobación.

### Criterios de finalización

Papelcorpsac se considerará terminado cuando:

- Los recorridos customer y admin funcionen.
- Las funcionalidades obligatorias estén implementadas.
- La interfaz sea responsive y accesible.
- Las integraciones externas estén verificadas.
- Las pruebas relevantes sean satisfactorias.
- Las dependencias hayan sido revisadas y sus riesgos tratados conforme a las decisiones de seguridad.
- La aplicación esté desplegada y accesible.
- El README contenga la documentación técnica y la bitácora de IA requerida.

El desarrollo seguirá el principio de cumplir la consigna con la menor complejidad razonable, sin sacrificar funcionalidad, calidad ni seguridad.
