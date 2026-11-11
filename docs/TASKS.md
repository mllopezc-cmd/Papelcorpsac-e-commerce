# Papelcorpsac — Plan de trabajo

## 1. Propósito

Organizar el desarrollo del Proyecto Integrador 5 mediante tareas pequeñas, ordenadas y verificables.

Los requisitos y las decisiones generales están definidos en `docs/PROJECT.md`.

Este documento registra qué debemos hacer, quién lo realizará y cómo comprobaremos su finalización.

## 2. Reglas de trabajo

Estados:

- [ ] Pendiente.
- [x] Completada y verificada.

Responsables:

- MANUAL: desarrollador.
- COPILOT: implementación asistida utilizada en tareas anteriores.
- MIXTO: colaboración con intervención manual.
- REVIEWER: revisión de solo lectura utilizada en etapas anteriores; desde T08, la revisión se realiza exclusivamente en este chat.

A partir de T07.2-B, por agotamiento de los créditos gratuitos de Copilot, el desarrollo continúa manualmente en VS Code, con asistencia técnica desde este chat. Desde T08, todas las revisiones de código y seguridad se realizan exclusivamente en este chat; no se utiliza Copilot Reviewer ni otro agente externo.

Los archivos de código se entregarán completos en el chat cuando el desarrollador comparta los archivos correspondientes. No se utilizarán ZIP ni documentos descargables para entregar código.

Reglas:

- Una tarea activa a la vez.
- Revisar dependencias antes de comenzar.
- No modificar áreas ajenas a la tarea.
- No avanzar automáticamente a la siguiente.
- No marcar tareas como completas sin evidencia.
- Registrar problemas y decisiones importantes.
- Solicitar autorización antes de implementar nuevas tareas.
- Explicar qué se hará, por qué y qué archivos se modificarán.
- El desarrollador ejecuta manualmente los comandos y comparte sus resultados.
- Verificar los cambios antes de commit y push.

## 3. Preparación

### T00 — Documentación inicial

Responsable: MANUAL

- [x] Guardar PROJECT.md.
- [x] Guardar TASKS.md.
- [x] Guardar copilot-instructions.md.
- [x] Guardar reviewer.agent.md.
- [x] Guardar complete-feature/SKILL.md.
- [x] Verificar que Copilot aplica las instrucciones generales.
- [x] Comprobar que Reviewer está disponible.
- [x] Comprobar que la Skill complete-feature es reconocida.

Aceptación:

Los cinco documentos existen y Copilot reconoce correctamente las instrucciones generales, el agente Reviewer y la Skill complete-feature.

## 4. Base técnica

### T01 — Inicializar React, TypeScript y Vite

Responsable: MANUAL

Dependencia: T00

- [ ] Comprobar Node.js y npm.
- [x] Inicializar React + TypeScript con Vite.
- [x] Verificar React 19 y React DOM compatibles.
- [ ] Revisar versiones estables de las dependencias.
- [ ] Instalar dependencias.
- [x] Conservar package-lock.json.
- [ ] Ejecutar npm run dev.
- [x] Ejecutar npm run build.
- [x] Ejecutar npm audit.
- [x] Revisar vulnerabilidades moderadas, altas y críticas.

Aceptación:

La aplicación base funciona, las versiones son compatibles y los hallazgos de seguridad han sido evaluados.

No copiar overrides anteriores preventivamente.

No utilizar actualizaciones forzadas sin justificación.

Evidencia y seguimiento:

- La inicialización, las versiones declaradas, el lockfile y el build se respaldan con los archivos del proyecto y el registro de avances.
- El registro inicial de T01 reportó una auditoría sin vulnerabilidades.
- Las auditorías posteriores identificaron cinco hallazgos moderados relacionados con dependencias transitivas de Firestore. Estos hallazgos fueron tratados posteriormente durante T07 mediante la actualización compatible del árbol de dependencias.
- El commit `c8ea255` registra la corrección de las vulnerabilidades de Firestore.
- Las últimas auditorías ejecutadas por el desarrollador reportaron cero vulnerabilidades tanto en `npm audit` como en `npm audit --omit=dev`.
- No hay evidencia suficiente en el registro para marcar la comprobación inicial de Node/npm, la instalación de dependencias ni la ejecución inicial de `npm run dev`.

### T02 — Tailwind CSS, componentes y navegación

Responsable: COPILOT

Dependencia: T01

- [x] Instalar y configurar Tailwind CSS compatible con Vite.
- [x] Incorporar la identidad visual de Papelcorpsac.
- [x] Configurar colores, tipografías y estilos globales mínimos.
- [x] Aplicar diseño mobile-first.
- [x] Configurar React Router.
- [x] Implementar navegación pública.
- [x] Reservar la ruta /admin para protección posterior.
- [x] Preparar componentes reutilizables necesarios.
- [x] Comprobar la visualización en modos claro y oscuro.

Aceptación:

Tailwind CSS funciona correctamente, la navegación pública está operativa y las primeras vistas respetan la identidad visual aprobada, con diseño responsive.

La protección efectiva de /admin se implementó en T04.

El layout administrativo completo se desarrollará en T10.

No crear componentes o estilos innecesarios.

## 5. Autenticación

### T03 — Configurar Firebase

Responsable: MANUAL

Dependencia: T01

- [x] Crear un nuevo proyecto Firebase.
- [x] Habilitar Authentication.
- [x] Configurar correo/contraseña y Google.
- [x] Crear Firestore.
- [x] Preparar reglas restrictivas iniciales.
- [x] Configurar variables de entorno locales.
- [x] Preparar .env.example.
- [x] Verificar .gitignore.

Aceptación:

Firebase está configurado y las credenciales privadas no forman parte del código público ni del repositorio.

### T04 — Implementar autenticación y roles

Responsable: MIXTO

Dependencias: T02, T03

COPILOT:

- [x] Implementar registro y login.
- [x] Implementar logout.
- [x] Mantener persistencia de sesión.
- [x] Implementar AuthContext y useAuth.
- [x] Proteger rutas autenticadas.
- [x] Restringir rutas administrativas.
- [x] Gestionar carga del rol y errores.

MANUAL:

- [x] Configurar el primer usuario administrador.

Aceptación:

Ambos métodos de autenticación funcionan.

Customer y admin tienen permisos diferenciados.

No existe autoasignación de privilegios.

Las reglas de Firestore respaldan las restricciones.

## 6. Catálogo y carrito

### T05 — Implementar catálogo

Responsable: COPILOT

Dependencias: T02, T03

- [x] Consultar productos desde Firestore.
- [x] Mostrar listado y tarjetas reutilizables.
- [x] Filtrar por categoría.
- [x] Buscar por nombre con debounce.
- [x] Mostrar detalle de producto.
- [x] Gestionar estados de carga, vacío y error.
- [x] Verificar diseño responsive.

Aceptación:

El catálogo funciona correctamente en móvil y escritorio y respeta la identidad visual de Papelcorpsac.

La carga de datos demostrativos en Firestore requiere autorización del desarrollador.

Ampliaciones aprobadas e implementadas:

- El alcance inicial de doce productos se amplió a 60: doce principales y 48 demostrativos, distribuidos en cuatro categorías con 15 productos por categoría.
- Los doce productos principales conservan sus imágenes reales; los 48 adicionales utilizan una imagen demostrativa SVG local.
- Paginación local de doce productos por página, con controles compactos y accesibles para móviles.
- Favoritos disponibles para usuarios autenticados.
- Reglas restrictivas de Firestore para el catálogo y los favoritos.
- Seeder administrativo principal conservado y deshabilitado por defecto.
- Se eliminaron los dos scripts administrativos temporales utilizados para cargar y publicar los 48 productos adicionales.

Evidencia de T05:

- Comprobación manual del catálogo, filtros, búsqueda, favoritos y navegación.
- Verificaciones responsive en escritorio y móvil.
- `npm.cmd run lint` satisfactorio.
- `npm.cmd run build` satisfactorio.
- `git diff --cached --check` sin errores reportados.
- Commit `51244e6` publicado en GitHub.
- No se registran pruebas automatizadas como ejecutadas en el cierre original de T05.

Seguimiento posterior:

- Los cinco hallazgos moderados relacionados con `glob` y dependencias transitivas de Firestore fueron tratados en T07 mediante el commit `c8ea255`.
- Las últimas auditorías general y de producción reportaron cero vulnerabilidades.
- Vite continúa mostrando una advertencia no bloqueante por un chunk JavaScript de aproximadamente 580,46 kB minificados. Su optimización se pospone.

### T06 — Implementar carrito

Responsable: COPILOT

Dependencia: T05

- [x] Implementar CartContext.
- [x] Implementar cartReducer.
- [x] Implementar useCart.
- [x] Agregar y eliminar productos.
- [x] Actualizar cantidades.
- [x] Calcular totales.
- [x] Mantener el carrito durante la navegación.
- [x] Incorporar persistencia local aprobada.
- [x] Probar las acciones del reducer.

Aceptación:

El carrito funciona, comparte estado mediante Context y utiliza useReducer sin mezclar autenticación.

Evidencia:

- Commit `20366a5` publicado.
- 42 pruebas iniciales del reducer aprobadas.
- Durante T07 se ampliaron las pruebas del reducer a 49 casos, incluyendo la limpieza condicional del carrito.
- Reviewer: revisión de solo lectura aprobada con observaciones no bloqueantes.

## 7. Checkout y órdenes

### T07 — Implementar checkout

Responsable: MIXTO

Dependencias: T04, T06

- [x] Mostrar resumen de la compra.
- [x] Validar datos necesarios.
- [x] Simular pago sin pasarela real.
- [x] Validar productos e importes de forma confiable.
- [x] Crear orden en Firestore.
- [x] Mostrar confirmación o error.
- [x] Limpiar el carrito después de confirmar.

Aceptación:

Una compra simulada crea una orden válida.

Los errores no generan confirmaciones falsas.

La escritura no permite manipular importes o propietarios.

El desarrollador aprueba la operación de servidor necesaria para proteger las órdenes.

**Resultado:** funcionalidad implementada y verificada localmente mediante pruebas automatizadas, pruebas de integración con Firestore Emulator y recorrido HTTP completo mediante Vercel local.

La finalización funcional de T07 no equivale a un despliegue público. El despliegue del backend de T07.1 permanece pendiente.

### T07.1 — Infraestructura mínima de Vercel

Responsable: MANUAL

- [x] Preparar `api/health.ts`.
- [x] Configurar TypeScript aislado para API.
- [x] Validar localmente el endpoint y las rutas SPA.
- [x] Publicar el commit de infraestructura.
- [ ] Desplegar el backend público.

Evidencia:

- Commit `5c83725`.
- `GET /api/health`: HTTP 200.
- `POST /api/health`: HTTP 405.
- Rutas `/`, `/carrito` y `/catalogo`: HTTP 200.
- Vercel CLI local disponible y funciones API reconocidas.
- No se realizó despliegue público.

Estado: infraestructura local implementada y publicada; despliegue público pendiente de autorización y verificaciones de seguridad.

### T07.2-A — Firebase Authentication Emulator

Responsable: MANUAL

- [x] Configurar el emulador para el proyecto ficticio.
- [x] Validar su funcionamiento local.
- [x] Publicar el commit de configuración.

Evidencia:

- Proyecto de demostración: `demo-papelcorpsac`.
- Authentication Emulator: `127.0.0.1:9099`.
- Commit `1a1b713`.

Estado: completada y publicada.

### T07.2-B — Verificación de ID tokens en servidor

Responsable: MIXTO

- [x] Implementar inicialización reutilizable de Firebase Admin.
- [x] Implementar verificador de Bearer tokens y UID confiable.
- [x] Crear endpoint diagnóstico `GET /api/auth-check`.
- [x] Implementar pruebas unitarias.
- [x] Verificar TypeScript API, Vitest, ESLint y build.
- [x] Verificar token válido del Authentication Emulator.
- [x] Verificar rechazo de solicitud sin token y JWT ficticio.
- [x] Verificar rechazo de token emitido por otro proyecto demo.
- [x] Sincronizar el lockfile.
- [x] Investigar y corregir las alertas moderadas de dependencias.
- [x] Ejecutar auditorías generales y de producción.
- [x] Completar revisión documental y verificaciones finales.
- [x] Publicar los cambios en GitHub.

Archivos implementados:

- `server/firebaseAdmin.ts`.
- `server/auth.ts`.
- `api/auth-check.ts`.
- Pruebas unitarias correspondientes.

Evidencia:

- Commit `65eafcd`: autenticación de servidor.
- Commit `beb8f51`: ajuste de TypeScript API.
- Commit `c8ea255`: actualización compatible del árbol de dependencias de Firestore.
- Typecheck API, lint y build satisfactorios.
- 89 pruebas aprobadas durante la verificación inicial de esta subtarea.
- Solicitud sin token: HTTP 401.
- Token válido de demostración: HTTP 200.
- JWT ficticio: HTTP 401.
- Token emitido por otro proyecto demo: HTTP 401.
- Auditorías posteriores: cero vulnerabilidades.

Estado: completada, verificada y publicada.

### T07.3 — Backend de checkout y operaciones transaccionales

Responsable: MIXTO

#### T07.3-A — Validación de solicitudes de checkout

- [x] Validar estructura de solicitudes.
- [x] Validar claves de idempotencia UUID v4.
- [x] Validar identificadores y cantidades.
- [x] Rechazar propiedades no permitidas.
- [x] Implementar pruebas de validación.

Evidencia:

- `server/checkoutValidation.ts`.
- Pruebas correspondientes.
- Commit `e578af2`.
- 51 pruebas de validación aprobadas.

Estado: completada y publicada.

#### T07.3-B — Servicio transaccional de checkout

- [x] Obtener los productos directamente desde Firestore.
- [x] Validar publicación, precio y stock.
- [x] Calcular importes en el servidor.
- [x] Crear órdenes con estado inicial `pending`.
- [x] Descontar existencias dentro de una transacción.
- [x] Implementar idempotencia.
- [x] Rechazar conflictos y stock insuficiente.
- [x] Implementar pruebas unitarias del servicio.

Evidencia:

- `server/checkoutService.ts`.
- `server/checkoutService.test.ts`.
- Commit `58d0c39`.
- 33 pruebas unitarias del servicio aprobadas.

Estado: completada y publicada.

#### T07.3-C — Endpoint HTTP protegido

- [x] Implementar `POST /api/checkout`.
- [x] Verificar ID token mediante Firebase Admin.
- [x] Comprobar revocación del token.
- [x] Obtener el UID del token verificado.
- [x] Validar Content-Type y cuerpo.
- [x] Traducir errores comerciales a respuestas HTTP.
- [x] Ocultar detalles internos de errores inesperados.
- [x] Implementar pruebas del endpoint.

Evidencia:

- `api/checkout.ts`.
- `api/checkout.test.ts`.
- `src/types/checkout.ts`.
- Commit `1d61f22`.
- 30 pruebas del endpoint aprobadas.

Estado: completada y publicada.

#### T07.3-D — Integración transaccional con Firestore Emulator

- [x] Configurar Firestore Emulator local.
- [x] Configurar reglas de Firestore para las pruebas.
- [x] Verificar creación de órdenes.
- [x] Verificar descuento de stock.
- [x] Verificar idempotencia.
- [x] Verificar conflictos.
- [x] Verificar productos no publicados y stock inválido.
- [x] Verificar ausencia de escrituras parciales.
- [x] Verificar concurrencia sobre la última unidad disponible.

Evidencia:

- `server/checkoutService.integration.test.ts`.
- `firebase.json`.
- Commit `43bd2e7`.
- Ocho pruebas de integración aprobadas mediante Firestore Emulator.

Estado: completada y publicada.

### T07.4 — Integración del checkout en React

Responsable: MIXTO

#### T07.4-A — Interfaz y navegación

- [x] Implementar `CheckoutPage`.
- [x] Mostrar resumen del pedido.
- [x] Integrar el servicio HTTP de checkout.
- [x] Enviar únicamente identificadores y cantidades.
- [x] Gestionar estados de envío, error y confirmación.
- [x] Evitar confirmaciones falsas.
- [x] Integrar navegación desde el carrito.
- [x] Mantener la advertencia de que no existen cobros reales.

Evidencia:

- `src/pages/CheckoutPage.tsx`.
- `src/services/checkoutService.ts`.
- `src/App.tsx`.
- `src/pages/CartPage.tsx`.
- Commit `86fe9ca`.

Estado: completada y publicada.

#### T07.4-B — Pruebas del cliente y componente

- [x] Probar el servicio HTTP de checkout.
- [x] Probar obtención del ID token.
- [x] Probar solicitudes y respuestas HTTP.
- [x] Probar validación de respuestas.
- [x] Probar estados de la interfaz.
- [x] Probar confirmación y limpieza del carrito.
- [x] Probar errores y reintentos.
- [x] Incorporar React Testing Library y jsdom.

Evidencia:

- `src/services/checkoutService.test.ts`.
- `src/pages/CheckoutPage.test.tsx`.
- Commit `fce557c`: pruebas del servicio HTTP.
- Commit `0aeddfb`: pruebas del componente React.
- 36 pruebas del servicio y 18 pruebas del componente aprobadas.

Estado: completada y publicada.

#### T07.4-C — Protección del carrito e idempotencia

- [x] Incorporar snapshot de artículos del carrito.
- [x] Vaciar el carrito únicamente si coincide con el pedido confirmado.
- [x] Evitar eliminar artículos agregados durante una solicitud pendiente.
- [x] Conservar la clave de idempotencia al volver al checkout.
- [x] Asociar el intento al usuario y a la huella del pedido.
- [x] Validar registros de almacenamiento y UUID.
- [x] Descartar intentos corruptos.
- [x] Probar los casos límite correspondientes.

Evidencia:

- `src/types/cart.ts`.
- `src/reducers/cartReducer.ts`.
- `src/reducers/cartReducer.test.ts`.
- `src/contexts/CartContext.tsx`.
- `src/hooks/useCart.ts`.
- `src/pages/CheckoutPage.tsx`.
- `src/pages/CheckoutPage.test.tsx`.
- Commit `ee29994`.
- 49 pruebas del reducer y 18 pruebas del componente aprobadas.

Estado: completada y publicada.

### T07 — Verificación integral del recorrido de compra

Evidencia adicional ejecutada manualmente por el desarrollador el 11 de noviembre de 2026:

- Authentication Emulator y Firestore Emulator iniciados con `demo-papelcorpsac`.
- Vercel CLI 65.14.0 ejecutando funciones localmente.
- `GET /api/health`: HTTP 200.
- `GET /api/auth-check` sin token: HTTP 401.
- JWT ficticio en autenticación y checkout: HTTP 401.
- Usuario de demostración creado mediante Authentication Emulator.
- ID token válido: `GET /api/auth-check` respondió HTTP 200.
- Producto de prueba creado mediante Firebase Admin en Firestore Emulator.
- Primera solicitud de checkout: HTTP 201.
- Orden persistida con estado `pending`, moneda PEN y total de 1250 céntimos.
- Stock inicial de cinco unidades reducido a cuatro.
- Reintento con la misma clave y los mismos artículos: HTTP 200 y `replayed: true`.
- Reutilización de la misma clave con una cantidad diferente: HTTP 409.
- Solicitud de cinco unidades con solo cuatro disponibles: HTTP 409.
- Consulta final del producto: stock conservado en cuatro unidades.
- Consulta administrativa de la orden: datos y artículos coincidentes con la compra.
- Las reglas de Firestore rechazaron correctamente la lectura REST directa de `orders`; la lectura administrativa mediante Firebase Admin funcionó.
- Todas las operaciones se realizaron con emuladores y Vercel local. No se utilizaron servicios comerciales reales.

### Resultado y aceptación de T07

La implementación de checkout satisface los criterios funcionales de T07:

- Una compra simulada crea una orden válida.
- Los errores no generan confirmaciones falsas.
- El UID y los importes proceden del servidor.
- La orden y el descuento de stock son transaccionales.
- Los reintentos no crean órdenes duplicadas.
- El carrito solo se limpia cuando corresponde al pedido confirmado.
- Las reglas de seguridad de Firestore permanecen restrictivas.

El despliegue público del backend permanece pendiente dentro de T07.1. La verificación local no equivale a una validación de producción.

### T08 — Historial y detalle de órdenes

Responsable: MIXTO

Dependencia: T07

- [x] Definir tipos de órdenes y estados permitidos.
- [x] Implementar el servicio de consulta de órdenes del usuario autenticado.
- [x] Filtrar el historial por el UID autenticado.
- [x] Ordenar el historial por fecha de creación descendente.
- [x] Mostrar el historial de órdenes.
- [x] Mostrar el detalle de una orden.
- [x] Mostrar los estados de orden permitidos.
- [x] Proteger las consultas por propietario mediante Firestore Rules.
- [x] Gestionar carga, estado vacío, orden inexistente, errores y reintentos.
- [x] Integrar rutas protegidas y navegación para usuarios autenticados.
- [x] Implementar pruebas del servicio y de ambas páginas.
- [x] Validar las reglas con dos usuarios en Firebase Emulator Suite.
- [x] Publicar las reglas actualizadas en Firestore Console (confirmación del desarrollador).
- [x] Ejecutar build, lint y suite general de pruebas.

Aceptación:

Cada cliente puede consultar únicamente sus órdenes y el detalle de compras anteriores. Las escrituras directas de órdenes permanecen denegadas para clientes; la creación comercial continúa bajo el backend protegido de T07.

Archivos principales:

- `src/types/order.ts`.
- `src/services/orderService.ts`.
- `src/services/orderService.test.ts`.
- `src/pages/OrdersPage.tsx`.
- `src/pages/OrdersPage.test.tsx`.
- `src/pages/OrderDetailPage.tsx`.
- `src/pages/OrderDetailPage.test.tsx`.
- Integración de rutas en `src/App.tsx` y enlace en `src/components/Header.tsx`.
- Reglas en `firestore.rules`.
- Configuración del cliente en `src/lib/firebase.ts` y `.env.example`.

Evidencia automatizada:

- Servicio: 11 pruebas aprobadas.
- Historial: 4 pruebas aprobadas.
- Detalle: 5 pruebas aprobadas.
- Total específico de T08: 20 pruebas aprobadas.

Evidencia manual con Firebase Emulator Suite, proyecto ficticio `demo-papelcorpsac`:

- Dos usuarios independientes, con perfiles `customer` asociados a sus UID.
- Orden A: `t08-demo-order-a`, S/ 25.00.
- Orden B: `t08-demo-order-b`, S/ 37.50.
- Cada usuario obtuvo únicamente su orden en el historial.
- Lectura propia: HTTP 200.
- Acceso cruzado entre órdenes: HTTP 403.
- Lectura autenticada de orden inexistente: HTTP 404.
- Lectura anónima de orden inexistente: HTTP 403.
- Creación y actualización directa: cuatro intentos rechazados con HTTP 403.
- Eliminación directa de un documento temporal: HTTP 403; el documento permaneció hasta su limpieza administrativa mediante Firebase Admin.
- La regla final permite `get` a usuarios autenticados cuando el documento no existe o cuando son propietarios; `list` exige coincidencia del propietario; `create`, `update` y `delete` permanecen denegados.
- El desarrollador confirmó la publicación de las reglas en Firestore Console el 11 de noviembre de 2026.

Verificación final reportada el 11 de noviembre de 2026:

- `npm.cmd run build`: satisfactorio; advertencia no bloqueante de chunk JavaScript superior a 500 kB.
- `npm.cmd run lint`: satisfactorio.
- `npm.cmd run test`: 284 pruebas aprobadas y 8 omitidas; 12 archivos aprobados y 1 omitido. Las ocho omitidas corresponden a integración de checkout; se habían ejecutado y aprobado separadamente durante T07.
- `git diff --check`: sin errores; advertencia LF/CRLF no bloqueante para `src/App.tsx`.

Estado: T08 implementada y verificada; reglas de Firestore publicadas según confirmación del desarrollador; código publicado en GitHub en la rama `main` mediante el commit `b3107e1`. El cierre documental se registra en esta actualización.

## 8. Administración

### T09 — Configurar AWS S3

Responsable: MANUAL

- [ ] Crear bucket.
- [ ] Configurar permisos mínimos.
- [ ] Configurar CORS necesario.
- [ ] Preparar variables privadas del servidor.
- [ ] Definir cómo se mostrarán las imágenes.

Aceptación:

S3 está preparado sin exponer credenciales en el frontend ni habilitar permisos innecesarios.

### T10 — CRUD administrativo e imágenes

Responsable: MIXTO

Dependencias: T04, T05, T09

COPILOT:

- [ ] Implementar layout administrativo diferenciado.
- [ ] Implementar navegación administrativa.
- [ ] Crear, consultar, editar y eliminar productos.
- [ ] Validar formularios administrativos.
- [ ] Confirmar eliminaciones de productos.
- [ ] Integrar subida de imágenes mediante URLs prefirmadas.

MANUAL:

- [ ] Verificar y autorizar configuración externa.

Aceptación:

El CRUD completo y la carga de imágenes funcionan.

Las operaciones administrativas están protegidas.

Las órdenes históricas conservan sus detalles.

### T11 — Administrar órdenes

Responsable: MIXTO

Dependencias: T08, T10

- [ ] Consultar todas las órdenes como admin.
- [ ] Filtrar por estado.
- [ ] Actualizar estados autorizados.
- [ ] Mostrar carga y errores.
- [ ] Verificar restricciones de permisos.

Aceptación:

El administrador puede consultar todas las órdenes como admin, filtrarlas por estado y actualizar sus estados.

Los clientes no pueden realizar estas operaciones.

## 9. Calidad y despliegue

### T12 — Testing y revisión integral

Responsables:

- MIXTO: implementación y ejecución progresiva de verificaciones.
- Revisión técnica: desde T08 se realiza en este chat, en modo de solo lectura; no se utiliza Copilot Reviewer.

- [ ] Preparar renderWithProviders.
- [ ] Probar useAuth mediante renderHook.
- [ ] Probar useCart mediante renderHook.
- [x] Probar todas las acciones de cartReducer.
- [ ] Completar pruebas de todos los componentes importantes.
- [ ] Completar pruebas automatizadas de integración de carrito y checkout.
- [ ] Mockear Firebase y AWS en los casos correspondientes.
- [ ] Evaluar casos límite con ayuda de IA.
- [ ] Ejecutar tests, lint y build.
- [ ] Revisar responsive y accesibilidad.
- [x] Revisar vulnerabilidades de dependencias durante T07.

Aceptación:

Las pruebas obligatorias están implementadas y ejecutadas con resultados satisfactorios.

Los tests se crean progresivamente durante las tareas anteriores; esta fase corresponde a la revisión integral.

Evidencia acumulada:

- 264 pruebas aprobadas y ocho pruebas de integración omitidas en la ejecución general durante la verificación de T07.
- En la ejecución general posterior a T08, el desarrollador reportó 284 pruebas aprobadas y ocho omitidas (12 archivos aprobados y uno omitido); las ocho omitidas corresponden a la suite de integración de checkout.
- Las ocho pruebas de integración omitidas fueron ejecutadas separadamente con Firestore Emulator y aprobaron.
- 272 casos aprobados al considerar ambas ejecuciones.
- `npm.cmd run typecheck:api`: satisfactorio.
- `npm.cmd run build`: satisfactorio.
- `npm.cmd run lint`: satisfactorio.
- `npm.cmd audit`: cero vulnerabilidades.
- `npm.cmd audit --omit=dev`: cero vulnerabilidades.

La revisión integral de T12 continúa pendiente y no se considera sustituida por las pruebas incrementales de T07.

### T13 — GitHub e integración continua

Responsable: MIXTO

- [x] Crear repositorio del proyecto.
- [x] Revisar .gitignore.
- [ ] Verificar que no existan secretos versionados en todo el historial.
- [ ] Configurar GitHub Actions.
- [ ] Ejecutar npm ci en CI.
- [ ] Automatizar tests, lint y build.
- [ ] Incluir revisión de seguridad de dependencias.
- [ ] Comprobar resultados del workflow.

Aceptación:

La integración continua funciona y señala fallos de pruebas, build, lint y vulnerabilidades que superen el umbral de seguridad configurado.

### T14 — Desplegar en Vercel

Responsable: MANUAL

Dependencia: T13

- [ ] Conectar repositorio GitHub.
- [ ] Configurar variables por entorno.
- [ ] Comprobar rutas SPA.
- [ ] Publicar aplicación.
- [ ] Verificar autenticación.
- [ ] Verificar catálogo y carrito.
- [ ] Verificar checkout e historial.
- [ ] Verificar administración y S3.
- [ ] Comprobar experiencia móvil.

Aceptación:

La URL pública funciona y ambos roles pueden completar sus recorridos.

Estado:

- El proyecto Vercel `looney-ai-chat/papelcorpsac` fue creado y vinculado localmente durante T07.1.
- Vercel CLI local se utilizó para verificar las funciones serverless.
- La aplicación no está desplegada en producción.
- No se activó integración automática con GitHub.
- El proyecto existente podrá reutilizarse durante el despliegue formal.

El despliegue permanece pendiente de revisión del artefacto efectivo de producción, configuración segura de credenciales y autorización expresa.

### T15 — README, bitácora y presentación

Responsable: MANUAL

- [ ] Documentar instalación y configuración.
- [ ] Explicar las tecnologías utilizadas.
- [ ] Documentar ejecución de tests.
- [ ] Explicar integración con AWS S3.
- [ ] Incluir bitácora de IA en README.
- [ ] Registrar al menos cinco entradas reales.
- [ ] Justificar decisiones técnicas.
- [ ] Preparar demostración de ambos roles.

Aceptación:

La documentación permite reproducir el proyecto, la bitácora contiene al menos cinco entradas reales con aprendizajes y decisiones, y la demostración de ambos roles está preparada.

Registrar evidencias de IA durante el desarrollo, no solamente al finalizar.

Observación:

README.md continúa siendo la plantilla genérica de Vite. Su documentación del proyecto, bitácora y presentación permanecen pendientes.

## 10. Seguimiento

**Última tarea funcional implementada y verificada:** T08 — Historial y detalle de órdenes.

**Intervención actual:** publicación de la actualización documental final de T08; el código funcional ya está publicado en `main` mediante `b3107e1`.

T00 — Documentación inicial: COMPLETADA.

T01 — Inicializar React, TypeScript y Vite: COMPLETADA, con comprobaciones históricas pendientes de evidencia señaladas en su apartado.

T02 — Tailwind CSS, componentes y navegación: COMPLETADA.

T03 — Configurar Firebase: COMPLETADA.

T04 — Implementar autenticación y roles: COMPLETADA.

T05 — Implementar catálogo: COMPLETADA.

T06 — Implementar carrito: COMPLETADA.

T07 — Implementar checkout: COMPLETADA Y VERIFICADA LOCALMENTE.

T08 — Historial y detalle de órdenes: IMPLEMENTADA Y VERIFICADA LOCALMENTE; reglas de Firestore publicadas según confirmación del desarrollador. Cierre documental y Git pendientes.

T07.1 — Infraestructura mínima de Vercel: IMPLEMENTADA, VALIDADA LOCALMENTE Y PUBLICADA; despliegue público pendiente.

T07.2-A — Firebase Authentication Emulator: COMPLETADA Y PUBLICADA. Commit `1a1b713`.

T07.2-B — Verificación de tokens en servidor: COMPLETADA Y PUBLICADA. Commit `65eafcd`, con ajustes posteriores `beb8f51` y `c8ea255`.

T07.3-A — Validación de solicitudes: COMPLETADA. Commit `e578af2`.

T07.3-B — Servicio transaccional: COMPLETADA. Commit `58d0c39`.

T07.3-C — Endpoint HTTP protegido: COMPLETADA. Commit `1d61f22`.

T07.3-D — Integración con Firestore Emulator: COMPLETADA. Commit `43bd2e7`.

T07.4-A — Interfaz y navegación: COMPLETADA. Commit `86fe9ca`.

T07.4-B — Pruebas del cliente y componente: COMPLETADA. Commits `fce557c` y `0aeddfb`.

T07.4-C — Protección del carrito e idempotencia: COMPLETADA. Commit `ee29994`.

T08 — Historial y detalle de órdenes: COMPLETADA, VERIFICADA Y PUBLICADA EN GITHUB. Reglas de Firestore publicadas según confirmación del desarrollador. Commit de implementación: `b3107e1`. Cierre documental incluido en esta actualización.

### Registro de avances

| Fecha | Tarea | Evidencia | Resultado | Pendiente |
|---|---|---|---|---|
| 2026-11-05 | T00 | Documentación inicial; Reviewer y Skill reconocidos. | Completada | Ninguno |
| 2026-11-05 | T01 | React 19, TypeScript y Vite inicializados; build y auditoría inicial satisfactorios. | Completada | Algunas comprobaciones iniciales sin evidencia registrada. |
| 2026-11-05 | T02 | Tailwind CSS 4, React Router, identidad PAPEL CORP, responsive, modos claro/oscuro, lint y build satisfactorios. | Completada | Ninguno |
| 2026-11-05 | T03 | Firebase, Authentication, Firestore, variables locales, .env.example y .gitignore. | Completada | Ninguno |
| 2026-11-06 | T04 | Registro, login, Google, perfiles customer/admin, persistencia y protección de rutas. | Completada | Ninguno |
| 2026-11-10 | T05 | Catálogo de 60 productos, filtros, búsqueda, favoritos y paginación responsive. Commit `51244e6`. | Completada | Optimización del chunk Vite. |
| No indicada | T06 | CartContext, reducer, hook, persistencia, notificaciones y 42 pruebas iniciales. Commit `20366a5`. | Completada | Ninguno funcional. |
| 2026-11-10 | T07.1 | `api/health.ts`, TypeScript API aislado y Vercel local. Commit `5c83725`. | Implementada y publicada | Despliegue público. |
| 2026-11-10 | T07.2-A | Authentication Emulator `demo-papelcorpsac`, HTTP 200 en comprobación local. Commit `1a1b713`. | Completada | Ninguno local. |
| 2026-11-10 | T07.2-B | Firebase Admin, verificación de ID tokens, auth-check y pruebas. Commit `65eafcd`. | Completada | Ninguno funcional. |
| 2026-11-10 | Seguridad | Actualización compatible del árbol Firestore. Commit `c8ea255`; auditorías posteriores sin vulnerabilidades. | Corregida | Mantener auditorías en futuras actualizaciones. |
| 2026-11-10 | T07.3-A | Validación estricta de solicitudes y 51 pruebas. Commit `e578af2`. | Completada | Ninguno. |
| 2026-11-10 | T07.3-B | Servicio transaccional y 33 pruebas. Commit `58d0c39`. | Completada | Ninguno. |
| 2026-11-11 | T07.3-C | Endpoint HTTP protegido y 30 pruebas. Commit `1d61f22`. | Completada | Ninguno. |
| 2026-11-11 | T07.3-D | Ocho pruebas de integración con Firestore Emulator. Commit `43bd2e7`. | Completada | Ninguno. |
| 2026-11-11 | T07.4-A | Checkout React, servicio HTTP y navegación. Commit `86fe9ca`. | Completada | Ninguno funcional. |
| 2026-11-11 | T07.4-B | 36 pruebas de servicio y 18 de componente. Commits `fce557c` y `0aeddfb`. | Completada | Ninguno. |
| 2026-11-11 | T07.4-C | Protección de carrito, persistencia de idempotencia y pruebas adicionales. Commit `ee29994`. | Completada | Ninguno funcional. |
| 2026-11-11 | T07 integral | 264 pruebas aprobadas, ocho omitidas en la ejecución general; ocho de integración aprobadas por separado. Vercel local, Authentication Emulator y Firestore Emulator. | Verificada localmente | Despliegue público pendiente. |
| 2026-11-11 | T08 | 20 pruebas específicas aprobadas (11 de servicio, 4 de historial y 5 de detalle); suite general posterior: 284 aprobadas y 8 omitidas; build y lint satisfactorios. Dos usuarios de prueba con órdenes independientes; historial propio, detalle, acceso cruzado, orden inexistente y escrituras directas comprobadas en Firebase Emulator. Reglas actualizadas publicadas en Firestore Console según confirmación del desarrollador. | Completada y verificada localmente; reglas publicadas en Firestore Console; código publicado en GitHub mediante b3107e1; cierre documental incluido en esta actualización. | Ninguno. |

### Condiciones para continuar

Antes de T09:

- Confirmar que el cierre documental de T08 está versionado y publicado en `main`.
- Verificar que el árbol de trabajo esté limpio.
- Confirmar que `main` y `origin/main` estén sincronizadas.
- Obtener autorización expresa para iniciar T09.
- Mantener una sola tarea activa y respetar sus dependencias.

Antes del despliegue público en Vercel:

- Verificar el árbol y el artefacto efectivo de producción.
- Confirmar que no existan vulnerabilidades conocidas sin tratamiento.
- Configurar credenciales y permisos mínimos.
- Confirmar que los emuladores no puedan activarse en Preview o Production.
- Obtener autorización expresa del desarrollador.

No registrar pruebas, despliegues o configuraciones inexistentes. La publicación de reglas de Firestore no equivale al despliegue público de la aplicación o del backend.
