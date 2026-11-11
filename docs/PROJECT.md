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
- Consultar historial y detalle de órdenes en una etapa posterior.

No se realizan cobros reales ni se solicitan datos bancarios.

Estados de orden:

- pending
- processing
- completed
- cancelled

**Estado de implementación de T07:** checkout funcional implementado y verificado localmente mediante pruebas automatizadas y recorrido HTTP integrado con Firebase Emulators.

El historial y detalle de órdenes corresponden a T08 y todavía no están implementados.

### Panel administrativo

- Acceso protegido para admin.
- Layout diferenciado del cliente.
- CRUD completo de productos.
- Subida de imágenes a AWS S3.
- Consulta de todas las órdenes.
- Filtro por estado.
- Actualización autorizada de estados.

Estas funcionalidades administrativas pendientes se desarrollarán en sus respectivas etapas.

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

Pruebas:

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

Las reglas permanecen restrictivas.

Las operaciones comerciales se realizan mediante Firebase Admin SDK en el servidor.

La lectura directa de órdenes mediante REST puede responder HTTP 403 por las reglas de seguridad.

Esto es esperado: los clientes no deben tener acceso indiscriminado a la colección de órdenes.

La consulta administrativa o del propietario deberá realizarse mediante los mecanismos autorizados de servidor y las reglas correspondientes.

No se habilitarán escrituras públicas para facilitar pruebas.

### 7.8 Auditoría de dependencias

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

### 7.9 Advertencia de compilación

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

Las pruebas realizadas demuestran el comportamiento de las funciones de servidor y de los servicios mediante emuladores.

No equivalen a:

- Despliegue de funciones en Vercel Production.
- Prueba comercial con Firebase real.
- Integración con una pasarela de pagos.
- Implementación del historial de órdenes.
- Pruebas completas de navegación de todos los roles.
- Revisión integral de calidad de T12.

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

GitHub Copilot se utilizó durante las etapas anteriores. A partir de T07.2-B, por agotamiento de los créditos gratuitos, el desarrollo continúa manualmente en VS Code con asistencia desde este chat.

No se utilizarán ZIP ni documentos descargables para entregar código.

**Revisión técnica:**

- Revisar código y requisitos.
- Detectar errores y riesgos.
- Identificar sobreingeniería.
- Informar resultados sin modificar archivos durante una revisión de solo lectura.
- Distinguir la evidencia aportada por el desarrollador de las comprobaciones todavía pendientes.

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
