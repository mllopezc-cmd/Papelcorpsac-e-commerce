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

**Estado:** implementada y verificada localmente el 11 de noviembre de 2026.

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

Las herramientas de CRUD de productos y la integración de imágenes privadas S3 permanecen pendientes para las siguientes subtareas de T10.

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

Las funcionalidades administrativas restantes, incluido el CRUD de productos y la integración de imágenes privadas mediante AWS S3, se implementarán y verificarán en las siguientes subtareas de T10.

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
8. Calcula los importes en céntimos.
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

La regla publicada para `orders` es:

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

### 7.8 Configuración de emuladores en el frontend (T08)

El cliente utiliza `VITE_USE_FIREBASE_EMULATORS` para conectar Firebase Authentication y Firestore Emulator únicamente durante desarrollo local.

- `.env.example` mantiene `VITE_USE_FIREBASE_EMULATORS=false` por defecto.
- La activación requiere `import.meta.env.DEV` y el proyecto ficticio `demo-papelcorpsac`.
- Authentication Emulator utiliza `127.0.0.1:9099`.
- Firestore Emulator utiliza `127.0.0.1:8080`.
- `.env.development.local` está excluido de Git mediante `.gitignore` y se utiliza para las pruebas locales.
- No se deben habilitar emuladores en Preview ni Production.

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

Estado actual:

No se reportan vulnerabilidades conocidas en las últimas auditorías aportadas.

Las auditorías deberán repetirse cuando se actualicen dependencias y antes del despliegue.

No se utilizarán overrides ni actualizaciones forzadas sin justificación y autorización.

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
- `43bd2e7`: pruebas de integración con Firestore Emulator.
- `86fe9ca`: interfaz y navegación de checkout.
- `fce557c`: pruebas del cliente HTTP.
- `0aeddfb`: pruebas del componente React.
- `ee29994`: protección del carrito e idempotencia.

### 8.2 Pruebas automatizadas

Últimos resultados reportados por el desarrollador:

| Verificación | Resultado |
|---|---|
| TypeScript API | Correcto |
| Build | Correcto |
| ESLint | Correcto |
| Vitest | 264 aprobadas |
| Pruebas omitidas en suite general | 8 |
| Auditoría general | 0 vulnerabilidades |
| Auditoría de producción | 0 vulnerabilidades |
| git diff --check | Sin errores |

Las ocho pruebas omitidas corresponden a las pruebas de integración que requieren Firestore Emulator.

Ejecución independiente:

`PAPELCORPSAC_RUN_FIRESTORE_INTEGRATION=true firebase emulators:exec --only firestore --project demo-papelcorpsac "npm.cmd run test -- server/checkoutService.integration.test.ts"`

Resultado reportado:

- Ocho pruebas aprobadas.
- Cero fallidas.

Total de casos aprobados considerando ambas ejecuciones: 272.

Este resultado no sustituye la revisión integral de T12.

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
