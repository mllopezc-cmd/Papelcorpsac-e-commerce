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

- [x] Comprobar Node.js y npm (funcionamiento corroborado posteriormente).
- [x] Inicializar React + TypeScript con Vite.
- [x] Verificar React 19 y React DOM compatibles.
- [ ] Revisar versiones estables de las dependencias.
- [x] Instalar dependencias (corroborado por ejecuciones locales y `npm ci` en CI).
- [x] Conservar package-lock.json.
- [x] Ejecutar npm run dev (uso de Vite documentado en T10 y T11).
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
- Las auditorías posteriores a la corrección de T07 reportaron cero vulnerabilidades tanto en `npm audit` como en `npm audit --omit=dev`; durante T10.4-A se identificó un nuevo hallazgo de desarrollo, documentado en su apartado.
- **Regularización retrospectiva (27/11/2026):** la comprobación operativa de Node.js y npm queda corroborada por los comandos locales de lint, tipos, tests y build; la instalación de dependencias por esos comandos y `npm ci` en GitHub Actions; y el servidor de desarrollo por los recorridos Vite documentados durante T10/T11. No se afirma que estas comprobaciones se registraran el día inicial de T01.
- **Pendiente de evidencia específica:** una revisión formal actualizada de las versiones estables de todas las dependencias (`package.json` y `package-lock.json`), incluyendo la diferencia entre React 19 y React 18 indicada por la consigna. Las auditorías de seguridad y el build no son una verificación completa de que cada dependencia sea la última versión estable compatible.

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
- Las auditorías posteriores a T07 reportaron cero vulnerabilidades; durante T10.4-A se identificó un aviso adicional de desarrollo, documentado en la subtarea correspondiente.
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

El cierre histórico de T07 fue local. El despliegue de la aplicación y sus funciones se realizó posteriormente en T14; eso no equivale por sí solo a haber probado el checkout real extremo a extremo en Production.

### T07.1 — Infraestructura mínima de Vercel

Responsable: MANUAL

- [x] Preparar `api/health.ts`.
- [x] Configurar TypeScript aislado para API.
- [x] Validar localmente el endpoint y las rutas SPA.
- [x] Publicar el commit de infraestructura.
- [x] Publicar en Vercel Production la aplicación que incluye las funciones API (despliegue T14).
- [ ] Comprobar mediante respuestas HTTP públicas los endpoints API críticos de Production; no basta que el despliegue esté en estado `Ready`.

Evidencia:

- Commit `5c83725`.
- `GET /api/health`: HTTP 200.
- `POST /api/health`: HTTP 405.
- Rutas `/`, `/carrito` y `/catalogo`: HTTP 200.
- Vercel CLI local disponible y funciones API reconocidas.
- Durante **T07.1** no se realizó despliegue público. Posteriormente, durante **T14**, Vercel publicó el proyecto en Production conectado a `main`, con estado `Ready` para el commit `7f8878a`.

Estado actualizado: infraestructura implementada y publicada; el despliegue público de la aplicación está acreditado. Continúa sin evidencia suficiente la ejecución HTTP pública de cada endpoint API (incluidos checkout y administración de S3), que requiere pruebas independientes.

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

- [x] Crear bucket.
- [x] Configurar permisos mínimos.
- [x] Configurar CORS necesario.
- [x] Preparar variables privadas del servidor.
- [x] Definir cómo se mostrarán las imágenes.

Aceptación:

S3 está preparado sin exponer credenciales en el frontend ni habilitar permisos innecesarios.

**Resultado: T09 COMPLETADA Y VERIFICADA EN SU ALCANCE DE INFRAESTRUCTURA.**

#### Configuración realizada

- Bucket de imágenes creado en AWS S3, región `us-east-1`.
- Bloqueo de acceso público del bucket completamente activado.
- ACL deshabilitadas mediante `Bucket owner enforced`.
- Cifrado predeterminado SSE-S3.
- CORS configurado para GET y PUT y los orígenes locales aprobados.
- Usuario IAM `papelcorpsac-s3-uploader` creado sin acceso a la consola.
- Política personalizada `PapelcorpsacS3ObjectAccess` asociada directamente al usuario.
- Versión 2 de la política establecida como predeterminada.
- Permisos `s3:PutObject`, `s3:GetObject` y `s3:DeleteObject` limitados a `products/*`.
- Ausencia de grupos IAM asociados al usuario.
- Variables AWS configuradas en `.env` y excluidas de Git.
- Variables AWS registradas exclusivamente en Vercel Development.
- `.env.example` actualizado sin credenciales reales.

#### Decisión arquitectónica

Se adopta la alternativa A: bucket completamente privado.

El catálogo continuará siendo público. Las imágenes de productos publicados se visualizarán mediante URLs GET prefirmadas temporales, generadas por el backend.

Las subidas administrativas utilizarán URLs PUT prefirmadas. La eliminación de imágenes se realizará desde el backend con autorización administrativa.

Firestore conservará referencias estables a los objetos S3, evitando almacenar URLs prefirmadas temporales.

Esta arquitectura cumple la consigna académica y utiliza el procedimiento de URLs prefirmadas explicado por el docente, con una política de lectura más restrictiva.

#### Verificaciones realizadas

El desarrollador comprobó mediante AWS Console:

- Configuración pública de cuenta revisada, sin modificarla.
- Bloqueo público individual del bucket activado.
- Propiedad de objetos y ACL verificadas.
- Cifrado SSE-S3 verificado.
- Política IAM limitada a `products/*`.
- Versión 2 de IAM predeterminada.
- Usuario IAM con una sola política asociada.
- Usuario IAM sin pertenencia a grupos.
- Credenciales declaradas localmente y protegidas por `.gitignore`.
- Variables Development registradas en Vercel.

El 11 de noviembre de 2026 se verificó la identidad IAM mediante una solicitud firmada a AWS STS `GetCallerIdentity`.

Resultado:

- HTTP 200.
- Usuario IAM `papelcorpsac-s3-uploader` confirmado.
- Sin operaciones de escritura.
- Sin instalaciones ni modificaciones del repositorio.

#### Alcance de la aceptación

T09 comprende la preparación y verificación de la infraestructura AWS.

La prueba STS confirma la autenticación, pero no demuestra todavía el funcionamiento de las operaciones S3.

Las siguientes actividades pertenecen a T10 y no forman parte del cierre de T09:

- Implementación de funciones serverless para generar URLs prefirmadas.
- Pruebas reales de subida, lectura y eliminación de objetos.
- Integración de imágenes privadas con el catálogo.
- Implementación del CRUD administrativo.
- Pruebas de autorización y permisos efectivos.
- Verificación del funcionamiento completo en el navegador.

**Estado final:** configuración de T09 completada y verificada conforme a la evidencia aportada. Las implementaciones funcionales de T10 se realizarán en su etapa correspondiente.

### T10 — CRUD administrativo e imágenes

Responsable: MIXTO

Dependencias: T04, T05, T09

IMPLEMENTACIÓN (asistencia desde este chat y edición manual en VS Code):

- [x] Implementar layout administrativo diferenciado.
- [x] Implementar navegación administrativa.
- [x] Crear, consultar, editar y eliminar productos.
- [x] Validar formularios administrativos.
- [x] Confirmar eliminaciones de productos.
- [x] Integrar subida de imágenes mediante URLs prefirmadas.

MANUAL:

- [x] Verificar y autorizar configuración externa para el alcance de T10 (Firebase real, IAM/S3 privado y pruebas controladas documentadas en T10.5).

Aceptación:

El CRUD completo y la carga de imágenes funcionan.

Las operaciones administrativas están protegidas.

Las órdenes históricas conservan sus detalles.

Las subtareas T10.4-A/B/C/D quedaron verificadas y publicadas. Posteriormente se comprobaron la integración real con Firebase y AWS S3, la publicación de reglas de productos confirmada por el desarrollador y las mejoras UX de T10.5. La verificación final de Tailwind y la revisión documental fueron satisfactorias. El cierre de T10.5 se publicó posteriormente en GitHub mediante `edd3669`; las limitaciones de concurrencia y limpieza de objetos huérfanos permanecen documentadas.

#### T10.1 — Revisión técnica de la base existente

Responsable: MIXTO

Dependencias: T04, T05, T09.

- [x] Confirmar el estado del repositorio y la rama `main`.
- [x] Revisar las rutas públicas y administrativas existentes.
- [x] Revisar la autenticación y la protección por roles.
- [x] Identificar los componentes y layouts reutilizables.
- [x] Revisar el modelo y los servicios de productos.
- [x] Revisar las reglas actuales de Firestore.
- [x] Revisar las dependencias declaradas.
- [x] Contrastar la arquitectura con PROJECT.md y TASKS.md.
- [x] Consultar las guías pertinentes del repositorio docente.
- [x] Identificar los cambios mínimos necesarios para T10.2.
- [x] Presentar y obtener autorización para la propuesta de implementación.

**Resultado: T10.1 COMPLETADA.**

Evidencia:

- Revisión de solo lectura del repositorio publicado en `main`.
- Dependencias T04, T05 y T09 verificadas.
- Componentes reutilizables identificados.
- Protección administrativa existente comprobada en código.
- Ausencia de layout administrativo diferenciado identificada.
- Limitaciones actuales del CRUD y de Firestore documentadas.
- Arquitectura privada S3 conservada conforme a T09.
- Propuesta de T10.2 presentada y autorizada.

Durante T10.1 no se modificaron archivos, instalaron dependencias ni ejecutaron pruebas.

La implementación funcional comenzó posteriormente en T10.2.

#### T10.2 — Layout y navegación administrativa

Responsable: MIXTO

Dependencias: T04, T05, T09, T10.1.

- [x] Separar el layout administrativo del público.
- [x] Conservar la protección de rutas administrativas.
- [x] Crear la navegación administrativa inicial.
- [x] Incorporar enlaces de Login y Registro para visitantes.
- [x] Mostrar navegación de Customer según autenticación.
- [x] Mostrar acceso a Administración únicamente para admin.
- [x] Mantener el cierre de sesión existente.
- [x] Verificar diseño responsive y modos claro y oscuro.
- [x] Implementar pruebas de navegación y layout.
- [x] Ejecutar lint, build y suite general.
- [x] Verificar manualmente los recorridos de visitante, Customer y Admin.

**Resultado:** T10.2 COMPLETADA, VERIFICADA Y PUBLICADA EN GITHUB.

Commit `ea95c91` publicado en la rama `main` con código y documentación de T10.2.

Archivos:

- `src/App.tsx`.
- `src/components/Header.tsx`.
- `src/pages/AdminReservedPage.tsx`.
- `src/layouts/AdminLayout.tsx`.
- `src/components/Header.test.tsx`.
- `src/layouts/AdminLayout.test.tsx`.

Evidencia:

- Seis pruebas específicas aprobadas.
- Suite general: 290 pruebas aprobadas y ocho omitidas.
- ESLint satisfactorio.
- Build satisfactorio.
- `git diff --check` sin errores.
- Verificaciones visuales satisfactorias para visitante, Customer y Admin.
- Acceso administrativo restringido correctamente.
- Navegación responsive comprobada en móvil y escritorio.

La página administrativa inicial quedó preparada para el CRUD incorporado posteriormente en T10.3. La integración de imágenes privadas AWS S3 corresponde a T10.4.

No se instalaron dependencias ni se modificaron reglas de Firestore, credenciales o recursos AWS.

#### T10.3 — CRUD administrativo de productos

Responsable: MIXTO

Dependencias: T04, T05, T09, T10.1 y T10.2.

- [x] Revisar requisitos, dependencias y arquitectura del CRUD.
- [x] Obtener autorización para implementar T10.3.
- [x] Consultar productos publicados y no publicados como Admin.
- [x] Crear productos desde el panel.
- [x] Editar productos y conservar campos opcionales válidos.
- [x] Eliminar productos con confirmación.
- [x] Validar datos de los formularios administrativos.
- [x] Publicar y despublicar productos.
- [x] Incorporar la ruta protegida `/admin/productos`.
- [x] Proteger escrituras y lecturas con Firestore Rules.
- [x] Verificar los permisos con cuentas Admin y Customer del emulador.
- [x] Comprobar precios con centavos y rechazo de importes inválidos.
- [x] Probar conservación y eliminación del campo opcional `sourceUrl`.
- [x] Ejecutar pruebas unitarias, lint y build.
- [x] Probar el CRUD completo en el navegador con Firestore Emulator.
- [x] Revisar el diff y preparar la documentación del cierre.

**Resultado:** T10.3 COMPLETADA, VERIFICADA LOCALMENTE Y PUBLICADA EN `main`, commit `cac3b48`.

**Implementación y arquitectura**

Se mantiene el flujo `AdminProductsPage` → `productService` → SDK cliente de Firestore → Firestore Rules. No se añadieron contextos, hooks administrativos, servicios ni dependencias adicionales. La gestión de imágenes privadas S3 corresponde a T10.4.

Archivos implicados:

- `src/App.tsx`: ruta `/admin/productos`.
- `src/layouts/AdminLayout.tsx`: navegación administrativa.
- `src/pages/AdminReservedPage.tsx`: acceso desde el panel.
- `src/pages/AdminProductsPage.tsx`: formulario y listado CRUD.
- `src/services/productService.ts`: consulta, creación, actualización y eliminación.
- `src/services/productService.test.ts`: pruebas del servicio.
- `src/types/product.ts`: tipo `ProductInput`.
- `firestore.rules`: autorización y validación de productos.

Los productos nuevos utilizan la imagen local `/images/product-placeholder.svg`. Las imágenes existentes se conservan durante la edición. El campo opcional `sourceUrl` puede conservarse o eliminarse mediante `deleteField()`.

**Seguridad**

El permiso para crear, editar y eliminar productos exige rol `admin` en `users/{uid}`. Admin puede consultar productos publicados y no publicados; el catálogo público solo consulta publicados. Las reglas validan campos, tipos, categorías, longitudes, precios, existencias e imagen. Se conservan las restricciones de usuarios, favoritos y órdenes.

Las pruebas locales no publicaron las reglas modificadas en Firebase real. Su despliegue requiere autorización independiente.

**Evidencia automatizada**

- `productService.test.ts`: 13 pruebas aprobadas.
- Suite general: 303 pruebas aprobadas y 8 omitidas, sin fallos.
- Ocho omitidas: integración de checkout, ejecutada y aprobada por separado durante T07.
- ESLint y build TypeScript/Vite satisfactorios.
- `git diff --check` sin errores de formato; advertencia LF/CRLF no bloqueante.
- Vite mantiene la advertencia no bloqueante de un chunk de aproximadamente 580,46 kB.

**Pruebas de Firebase Emulator**

Proyecto ficticio `demo-papelcorpsac`; Authentication Emulator en `127.0.0.1:9099` y Firestore Emulator en `127.0.0.1:8080`. Se configuraron perfiles separados de Customer y Admin.

- 15 de 15 comprobaciones de permisos correctas: lectura pública y administrativa, bloqueo de accesos Customer, creación, edición, eliminación y rechazo de datos inválidos.
- 4 de 4 verificaciones de precios: `0.07`, `19.99` y `29.90` aceptados; `12.345` rechazado.
- Interfaz `/admin/productos`: creación, consulta, edición, publicación, despublicación y eliminación con confirmación de un mismo producto temporal, seguida de su ausencia en Firestore Emulator.
- La imagen local provisional se visualizó en el catálogo al publicar el producto.
- Customer recibió «Acceso restringido» al intentar acceder a `/admin` y `/admin/productos`.
- No se modificaron los productos reales ni los recursos AWS.

**Alcance:** T10.3 no incluye subida de imágenes S3 (T10.4) ni administración de órdenes (T11). La etapa T10 general continúa pendiente hasta completar la integración real y las comprobaciones finales. T10.3 fue publicada en la rama `main` mediante el commit `cac3b48`.

#### T10.4 — Imágenes privadas AWS S3

Dependencias: T09 y T10.3. La ejecución se divide en subtareas independientes con verificación, documentación, commit y push propios.

**T10.4-A — Generación protegida de URLs PUT prefirmadas**

Responsable: MIXTO.

- [x] Obtener autorización para implementar únicamente el backend PUT.
- [x] Incorporar `@aws-sdk/client-s3` y `@aws-sdk/s3-request-presigner` en versión exacta `3.1170.0`.
- [x] Implementar `server/s3Upload.ts` y la validación de metadatos.
- [x] Crear el endpoint `POST /api/product-image-upload-url`.
- [x] Verificar el Firebase ID token y su revocación.
- [x] Consultar el rol Admin en Firestore mediante Firebase Admin.
- [x] Restringir formato declarado a JPEG, PNG o WebP y tamaño declarado a 5 MiB.
- [x] Generar claves UUID bajo `products/` y URLs PUT con vigencia de 60 segundos.
- [x] Probar validaciones, autorización, configuración y generación prefirmada mediante mocks.
- [x] Verificar con el SDK real y credenciales ficticias los encabezados incluidos en la firma.
- [x] Ejecutar TypeScript API, lint, build, pruebas y comprobación de formato Git.
- [x] Investigar las 12 alertas altas de `picomatch` y registrar la excepción de seguridad autorizada.
- [x] Revisar y aplicar documentación del cierre en el repositorio.
- [x] Revisar los archivos preparados, autorizar y realizar commit y push propios de T10.4-A.

**Evidencia y alcance:** el desarrollador reportó 20 pruebas de `server/s3Upload.test.ts` y ocho de `api/product-image-upload-url.test.ts` aprobadas; suite general con 331 aprobadas, ocho omitidas y cero fallidas; `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run typecheck:api` y `git diff --check` correctos. La firma del SDK real produjo `content-length;content-type;host`, `X-Amz-Expires=60` y el parámetro de firma, sin usar credenciales reales ni solicitudes AWS.

**Hallazgo de dependencias:** `npm.cmd audit` continuó informando 12 alertas altas asociadas a `picomatch@4.0.7` y `GHSA-fc5q-39xc-vjpf`, incluso con `--prefer-online` y caché nueva; `npm.cmd audit --omit=dev` informó cero vulnerabilidades. El aviso fue retirado por GitHub el 18 de noviembre de 2026, pero el servicio de auditoría del registro npm continuó reportándolo. Se investigaron versiones, overrides, forks y `npm audit fix --force`; se decidió no degradar Vite o Vitest ni incorporar un fork no verificado. **El desarrollador autorizó una excepción técnica provisional documentada**, con revisión futura; la auditoría general no se declara limpia.

**Límites:** no hubo cargas reales, despliegue del backend, modificaciones del frontend o Firestore ni operaciones sobre objetos S3 durante T10.4-A. El comportamiento efectivo del tamaño en S3 y del archivo binario permanece pendiente de comprobación en integración.

**Estado:** T10.4-A implementada, verificada localmente y publicada en la rama `main` mediante el commit `40f15ed`.

**T10.4-B — Interfaz administrativa de carga de imágenes S3**

Responsable: MIXTO.

Dependencia: T10.4-A completada y publicada.

- [x] Obtener autorización para implementar T10.4-B.
- [x] Incorporar selección de imágenes en el panel administrativo.
- [x] Validar archivos JPEG, PNG y WebP con tamaño máximo de 5 MiB.
- [x] Obtener el Firebase ID token del administrador autenticado.
- [x] Implementar la solicitud POST de URL PUT prefirmada.
- [x] Implementar la transferencia PUT directa desde el navegador a S3.
- [x] Gestionar selección, carga, errores y resultado de la subida.
- [x] Conservar el CRUD administrativo previamente implementado.
- [x] Crear pruebas automatizadas del servicio HTTP y del componente React.
- [x] Ejecutar las pruebas específicas y la suite general.
- [x] Verificar ESLint, build, TypeScript API y formato Git.
- [x] Revisar visualmente el formulario en escritorio y móvil.
- [x] Completar revisión documental y del diff.
- [x] Autorizar y ejecutar commit y push de T10.4-B.

**Archivos implementados:**

- `src/pages/AdminProductsPage.tsx`.
- `src/pages/AdminProductsPage.test.tsx`.
- `src/services/productImageUploadService.ts`.
- `src/services/productImageUploadService.test.ts`.

**Evidencia automatizada reportada:**

- Servicio de subida: 14 pruebas aprobadas.
- Componente administrativo: nueve pruebas aprobadas.
- Total específico: 23 pruebas aprobadas.
- Suite general: 354 aprobadas, ocho omitidas y cero fallidas.
- ESLint satisfactorio.
- Build TypeScript y Vite satisfactorio.
- TypeScript API satisfactorio.
- `git diff --check` sin errores.
- Advertencia histórica no bloqueante del chunk Vite de aproximadamente 580,46 kB.

**Verificación visual e integración parcial:** el desarrollador comprobó el formulario de subida en escritorio y móvil, manteniendo el CRUD existente. Con `npm.cmd run dev`, la llamada a `/api/product-image-upload-url` devolvió HTTP 404 porque Vite por sí solo no ejecuta las funciones de Vercel. Posteriormente, `vercel dev` reconoció la función: una solicitud GET recibió HTTP 405 y `{"error":"Method Not Allowed"}`, comportamiento esperado para el endpoint POST. La interfaz volvió a cargar al iniciar Vercel Dev con las variables temporales `VITE_USE_FIREBASE_EMULATORS=false` y `VITE_FIREBASE_PROJECT_ID=papelcorpsac`.

**Límites históricos de T10.4-B:** durante esa subtarea no se completó una solicitud POST autenticada de generación de URL prefirmada ni una transferencia PUT real a S3. La clave S3 devuelta se conservaba solamente en el estado del componente. La persistencia de `imageKey` y las URLs GET privadas se implementaron posteriormente en T10.4-C; la eliminación autorizada corresponde a T10.4-D.

**Decisión del desarrollador:** posponer las comprobaciones reales de Firebase Admin y AWS S3 hasta la integración final de T10.4, una vez completadas las subtareas de persistencia, visualización y eliminación. Se mantiene la obligación de comprobar los encabezados firmados, la autorización administrativa, las operaciones efectivas con S3 y la seguridad de las reglas antes de considerar T10 cerrada.

Las reglas de Firestore ampliadas durante T10.3 todavía no se han publicado en Firebase real. Su publicación requerirá comparar las reglas locales con las activas en Firebase Console y obtener autorización independiente.

No se instalaron nuevas dependencias, no se modificaron credenciales ni se realizaron operaciones reales sobre objetos S3 durante T10.4-B.

**Estado:** T10.4-B implementada, verificada localmente y publicada en GitHub en `main`, commit `8c55a95`. Integración real AWS/Firebase diferida.

**T10.4-C — Referencia persistente `imageKey` y visualización con URLs GET privadas**

Responsable: MIXTO.

Dependencias: T10.4-A y T10.4-B.

- [x] Obtener autorización para implementar T10.4-C.
- [x] Incorporar `imageKey` opcional al modelo de productos.
- [x] Validar el formato de las claves S3 en el servicio y en Firestore Rules.
- [x] Persistir la referencia `imageKey` al crear y editar productos.
- [x] Conservar la clave existente cuando no se sube otra imagen.
- [x] Mantener la referencia subida ante fallos de guardado para permitir reintentos.
- [x] Implementar la generación de URLs GET prefirmadas de 60 segundos.
- [x] Crear el endpoint protegido `GET /api/product-image-url`.
- [x] Exigir rol Admin para solicitar imágenes de productos no publicados.
- [x] Incorporar el servicio frontend de solicitud de URLs GET.
- [x] Mostrar imágenes privadas en el componente reutilizado por catálogo y detalle.
- [x] Mantener compatibilidad con `imageUrl` y productos históricos.
- [x] Incorporar estados de carga, fallback y cancelación de solicitudes.
- [x] Probar el error de carga del elemento `img` y las respuestas atrasadas.
- [x] Ampliar pruebas del servicio de productos y del formulario administrativo.
- [x] Verificar las reglas mediante Authentication Emulator y Firestore Emulator.
- [x] Ejecutar la suite general, TypeScript API, ESLint, build y formato Git.
- [x] Revisar el diff de los archivos modificados y las pruebas principales del código nuevo.
- [x] Repetir la suite general tras incorporar las dos pruebas adicionales.
- [x] Verificar la documentación del cierre.
- [x] Revisar los archivos preparados, autorizar y realizar commit y push de T10.4-C.

**Archivos de implementación:** `api/product-image-url.ts`, `server/s3Upload.ts`, `src/components/ProductCard.tsx`, `src/pages/AdminProductsPage.tsx`, `src/services/productImageService.ts`, `src/services/productService.ts`, `src/types/product.ts` y `firestore.rules`.

**Archivos de pruebas:** `api/product-image-url.test.ts`, `src/components/ProductImage.test.tsx`, `src/pages/AdminProductsPage.test.tsx`, `src/services/productImageRules.integration.test.ts`, `src/services/productImageService.test.ts` y `src/services/productService.test.ts`.

**Evidencia reportada:**

- Suite general final: 408 pruebas aprobadas, 18 omitidas y ninguna fallida.
- Archivos de pruebas: 22 aprobados y dos omitidos.
- Endpoint GET: 13 pruebas aprobadas.
- Servicio frontend GET: 15 pruebas aprobadas.
- Componente `ProductImage`: nueve pruebas aprobadas.
- Componente administrativo: 14 pruebas aprobadas.
- Servicio de productos: 25 pruebas aprobadas.
- Reglas Firestore: diez pruebas de integración aprobadas con `firebase emulators:exec` sobre `demo-papelcorpsac`.
- TypeScript API, ESLint, build y `git diff --check`: correctos.
- Dos nuevas pruebas de robustez aprobadas, también incluidas en la suite general final.
- Advertencia no bloqueante de Vite por un chunk JavaScript de aproximadamente 580,46 kB.

**Seguridad:** las URLs GET se generan en el backend. Para un producto no publicado se verifica el Firebase ID token, incluida su revocación, y se exige rol Admin. Firestore Rules restringe escrituras administrativas y conserva la lectura pública únicamente para productos publicados. Las claves S3 se validan antes de utilizarlas.

**Límites:** no se efectuaron operaciones reales GET/PUT contra AWS S3 ni se publicaron reglas en Firebase Console. La integración real con Firebase Admin y AWS S3 está reservada para la fase final de T10. La sustitución de referencias no elimina automáticamente los objetos S3 anteriores; T10.4-D incorpora una eliminación explícita de imágenes no referenciadas. Las comprobaciones visuales y funcionales integrales se realizarán antes de finalizar T10.

**Estado:** T10.4-C implementada, verificada localmente y publicada en la rama `main` mediante el commit `8fd8716`, el 19 de noviembre de 2026. La integración operativa con AWS S3 y Firebase real permanece reservada para la verificación final de T10.

**T10.4-D — Eliminación autorizada de imágenes privadas S3**

Responsable: MIXTO.

Dependencias: T10.4-A, T10.4-B y T10.4-C.

- [x] Obtener autorización para implementar T10.4-D.
- [x] Revisar el material docente y contrastar el alcance con PROJECT.md y la arquitectura existente.
- [x] Incorporar `DeleteObjectCommand` en `server/s3Upload.ts`.
- [x] Validar las claves S3 mediante el patrón UUID y el prefijo `products/`.
- [x] Consultar Firestore para comprobar si algún producto utiliza la clave solicitada.
- [x] Rechazar la eliminación cuando existe una referencia mediante `ProductImageReferencedError`.
- [x] Implementar `DELETE /api/product-image-delete`.
- [x] Verificar Firebase ID token y revocación.
- [x] Exigir rol Admin mediante Firebase Admin.
- [x] Validar método HTTP, Content-Type y estructura exacta del cuerpo.
- [x] Responder HTTP 409 cuando la imagen continúa referenciada.
- [x] Evitar exponer detalles internos de errores AWS o Firebase.
- [x] Incorporar el servicio frontend `productImageDeleteService.ts`.
- [x] Integrar confirmación explícita de eliminación en `AdminProductsPage`.
- [x] Limitar la acción del formulario a imágenes recién subidas y todavía no asociadas.
- [x] Conservar la referencia pendiente cuando la eliminación falla o se cancela.
- [x] Bloquear controles durante la eliminación.
- [x] Evitar sustituir una imagen pendiente mediante otra selección o subida.
- [x] Simplificar el cierre del formulario después de guardar correctamente.
- [x] Mantener la posibilidad de reintentar el guardado cuando Firestore falla.
- [x] Implementar pruebas del servicio S3 y del endpoint DELETE.
- [x] Implementar pruebas del servicio HTTP frontend.
- [x] Ampliar las pruebas del componente administrativo.
- [x] Ejecutar pruebas específicas de la subtarea.
- [x] Ejecutar la suite general de Vitest.
- [x] Ejecutar TypeScript API, ESLint y build.
- [x] Verificar `git diff --check`.
- [x] Revisar los ajustes de robustez y sus pruebas de regresión.
- [x] Incorporar y verificar la actualización documental de T10.4-D.
- [x] Revisar el área de preparación de Git correspondiente a T10.4-D.
- [x] Autorizar y ejecutar commit y push de T10.4-D.

**Archivos de implementación:**

- `server/s3Upload.ts`.
- `api/product-image-delete.ts`.
- `src/services/productImageDeleteService.ts`.
- `src/pages/AdminProductsPage.tsx`.

**Archivos de pruebas:**

- `server/s3Delete.test.ts`.
- `api/product-image-delete.test.ts`.
- `src/services/productImageDeleteService.test.ts`.
- `src/pages/AdminProductsPage.test.tsx`.
- `server/s3Upload.test.ts`.

**Evidencia automatizada:**

- `server/s3Delete.test.ts`: diez pruebas aprobadas.
- `api/product-image-delete.test.ts`: 16 pruebas aprobadas.
- `src/services/productImageDeleteService.test.ts`: 16 pruebas aprobadas.
- `src/pages/AdminProductsPage.test.tsx`: 24 pruebas aprobadas, diez relacionadas con T10.4-D.
- `server/s3Upload.test.ts`: 20 pruebas aprobadas.
- Suite general: 460 pruebas aprobadas, 18 omitidas y ninguna fallida.
- 25 archivos de pruebas aprobados y dos omitidos.
- `npm.cmd run typecheck:api`: satisfactorio.
- `npm.cmd run lint`: satisfactorio.
- `npm.cmd run build`: satisfactorio.
- `git diff --check`: sin errores.

La suite general omitió ocho pruebas de integración de checkout y diez de Firestore Rules. Las diez pruebas de reglas habían sido ejecutadas y aprobadas separadamente durante T10.4-C.

**Seguridad y limitaciones:**

La eliminación requiere un usuario Admin autenticado. El backend valida la clave y consulta `products.imageKey` antes de llamar a AWS S3. Si encuentra una referencia o falla la consulta Firestore, no ejecuta `DeleteObject`.

La consulta y el borrado no son atómicos. Existe un riesgo residual de asociación concurrente entre ambas operaciones.

Cerrar el formulario o abandonar la sesión después de subir una imagen puede dejar un objeto huérfano. No se implementó un sistema de limpieza automática.

No se eliminan automáticamente imágenes asociadas a productos ni al editar o borrar documentos de productos.

No se modificaron reglas Firestore, políticas IAM, credenciales ni dependencias.

**Límites de verificación:** todas las pruebas AWS y Firebase de esta subtarea utilizan mocks. No se realizaron operaciones DELETE reales contra AWS S3, ni se desplegó el endpoint. La integración efectiva con Firebase Admin y AWS S3 se realizará en la verificación final de T10.

**Estado histórico de T10.4-D:** implementada, verificada localmente y publicada en `main`, commit `f68bba6`. La integración real y las mejoras UX se registran posteriormente en T10.5.

**Nota de seguimiento:** la integración real de T10.4 se realizó posteriormente y está documentada en T10.5. Las pruebas unitarias originales de T10.4-D no se presentan como operaciones AWS reales.

**Publicación posterior de Firestore Rules:** el desarrollador confirmó su publicación en Firebase Console durante la integración real, después de las pruebas en emuladores. No se modificaron las restricciones de órdenes, usuarios y favoritos para las mejoras UX. Véase T10.5.

#### T10.5 — Integración real y mejoras UX administrativas

Responsable: MIXTO. Dependencias: T10.3 y T10.4-A/B/C/D completadas.

**Integración real controlada (20/11/2026):**

- [x] Ejecutar Vercel Dev con Firebase real y autenticación administrativa.
- [x] Subir una imagen JPEG temporal a S3 mediante URL PUT prefirmada.
- [x] Asociar el `imageKey` a un producto temporal no publicado en Firestore.
- [x] Obtener URL GET administrativa y descargar el JPEG desde S3 (HTTP 200).
- [x] Comprobar el rechazo de lectura anónima de ese producto no publicado (HTTP 404).
- [x] Eliminar el producto temporal y confirmar la vuelta a 60 productos en el panel.
- [x] Eliminar la imagen temporal con `DELETE /api/product-image-delete` (HTTP 200 y `deleted: true`).
- [x] Comprobar en AWS Console la ausencia de objetos actuales en el bucket (cero objetos).
- [x] Confirmar la publicación de reglas de productos en Firebase Console según el desarrollador.

Objeto temporal eliminado: `products/db53e3f9-e534-449e-993d-398238907c53.jpg`. La captura del listado vacío no verifica posibles versiones históricas.

**Mejoras UX autorizadas:**

- [x] Incorporar desplazamiento al formulario al seleccionar «Editar».
- [x] Incorporar búsqueda por nombre y marca sin distinguir mayúsculas.
- [x] Incorporar filtros por categoría y publicación, combinables con la búsqueda.
- [x] Incorporar paginación local de doce productos.
- [x] Volver a la primera página al cambiar filtros.
- [x] Mantener el orden alfabético anterior y mostrar estados sin resultados.
- [x] Ajustar tarjetas a pantallas móviles de 320 px, con botones bajo los datos.
- [x] Comprobar visualmente la página en escritorio y móvil.
- [x] Mantener Firestore Rules, tipos, servicios y dependencias sin cambios en esta mejora.

**Decisión:** no implementar ordenamiento por fecha porque los productos históricos no tienen `createdAt` fiable. Solo se modificaron `src/pages/AdminProductsPage.tsx` y `src/pages/AdminProductsPage.test.tsx`. No se crearon nuevos archivos UX.

**Verificaciones aportadas:**

- [x] 30 pruebas del panel administrativo aprobadas.
- [x] Suite general posterior a la corrección responsive: 466 aprobadas, 18 omitidas, cero fallidas; 25 archivos aprobados y dos omitidos.
- [x] TypeScript API satisfactorio.
- [x] ESLint y build satisfactorios, repetidos después del ajuste canónico de Tailwind.
- [x] `git diff --check` sin errores, con solo los dos archivos TSX modificados antes de la documentación.
- [x] Repetir lint, build y comprobación de diff después de reemplazar manualmente `break-words` por `wrap-break-word`.
- [x] Incorporar y revisar la documentación final de `docs/PROJECT.md` y `docs/TASKS.md`.
- [x] Verificar el alcance de los cambios del cierre UX y la ausencia de secretos evidentes en los archivos autorizados; la revisión no es una auditoría exhaustiva del historial.
- [x] Autorizar y realizar commit y push del cierre UX y documental (`edd3669`, confirmado posteriormente).

**Limitaciones:** la consulta de referencias Firestore y la eliminación S3 no son atómicas; no existe limpieza automática de huérfanos. Las pruebas con servicios reales se efectuaron localmente, sin despliegue público. No se verificaron versiones históricas del bucket.

**Estado histórico al finalizar T10.5:** integración real y mejoras UX verificadas. Posteriormente se publicó T10.5 mediante el commit `edd3669` y se autorizó y ejecutó T11.

### T11 — Administrar órdenes

Responsable: MIXTO

Dependencias: T08 y T10, completadas.

- [x] Consultar todas las órdenes como Admin.
- [x] Filtrar por estado.
- [x] Actualizar estados autorizados.
- [x] Mostrar estados de carga, ausencia de datos y errores.
- [x] Verificar las restricciones de permisos.
- [x] Verificar el comportamiento funcional con emuladores.
- [x] Ejecutar la verificación técnica final.

**Aceptación:** cumplida en el entorno local de pruebas.

Admin puede listar todas las órdenes, filtrarlas y modificar
exclusivamente el estado permitido.

Customer conserva el acceso únicamente a sus órdenes
y no puede ingresar al panel administrativo.

La creación de órdenes sigue reservada al backend.

**Alcance:** la implementación y verificación de T11
están completadas. La publicación del cierre documental
en GitHub se realizará mediante un commit independiente
y autorizado. La validación en producción se reserva a T14.

#### T11.1 — Revisión técnica de solo lectura

- [x] Revisar modelos, servicios, rutas y páginas de órdenes.
- [x] Revisar reglas Firestore y backend de checkout.
- [x] Contrastar requisitos y dependencias.
- [x] Identificar componentes reutilizables.
- [x] Definir límites de seguridad.

**Resultado:** revisión completada sin modificaciones.

#### T11.2 — Consultas y permisos administrativos

- [x] Incorporar `getAdminOrders()`.
- [x] Incorporar `updateAdminOrderStatus()`.
- [x] Conservar validaciones del modelo de órdenes.
- [x] Restringir creación de órdenes al backend.
- [x] Proteger importes, artículos y propietario.
- [x] Añadir pruebas de servicio y permisos.
- [x] Aprobar 15 pruebas de reglas con Firebase Emulator.
- [x] Revisar y publicar reglas en Firebase Console.
- [x] Publicar implementación en GitHub.

**Archivos:** `firestore.rules`,
`src/services/orderService.ts`,
`src/services/orderService.test.ts` y
`src/services/adminOrderRules.integration.test.ts`.

**Evidencia:** 24 pruebas de servicio; 15/15 pruebas
administrativas de reglas. Suite general histórica:
479 aprobadas, 33 omitidas y cero fallidas.

La publicación de reglas en Firebase real fue confirmada
por el desarrollador. No se utilizaron órdenes reales
durante las verificaciones de T11.

**Commit publicado:**
`9fb31e857eec65033dde7c417b4e5ed2f4011ee4`.

#### T11.3 — Interfaz administrativa de órdenes

- [x] Crear `src/pages/AdminOrdersPage.tsx`.
- [x] Añadir pruebas del componente.
- [x] Incorporar navegación administrativa.
- [x] Incorporar ruta protegida `/admin/ordenes`.
- [x] Mostrar listado y filtros.
- [x] Implementar selección y confirmación de estado.
- [x] Mostrar errores, carga y estados vacíos.
- [x] Comprobar diseño responsive y modos visuales.
- [x] Verificar y publicar la implementación.

**Archivos:** `src/pages/AdminOrdersPage.tsx`,
`src/pages/AdminOrdersPage.test.tsx`,
`src/layouts/AdminLayout.tsx`,
`src/layouts/AdminLayout.test.tsx` y `src/App.tsx`.

**Evidencia:** 12 pruebas del panel administrativo
aprobadas, prueba del layout aprobada, revisión visual
en escritorio y ancho móvil de 320 px.

Suite general reportada: 516 aprobadas, 8 omitidas
y cero fallidas. Lint, build y TypeScript API correctos.

**Commit publicado:**
`13634fcff364cabc81d07450b65fe24494c8a7f8`.

#### T11.4 — Verificación funcional integrada

- [x] Comprobar acceso administrativo en Firebase Emulator.
- [x] Comprobar acceso restringido para Customer.
- [x] Comprobar estados sin órdenes.
- [x] Mostrar una orden ficticia en administración.
- [x] Verificar filtros por estado.
- [x] Cambiar `pending` a `processing`.
- [x] Comprobar persistencia del cambio.
- [x] Verificar historial y detalle del propietario.
- [x] Ejecutar checkout autenticado contra API local.
- [x] Comprobar creación de orden y descuento de stock.
- [x] Verificar la orden generada en ambas interfaces.

**Entorno:** proyecto ficticio `demo-papelcorpsac`;
Vite puerto 3000; Vercel Dev puerto 3001;
Authentication Emulator puerto 9099 y Firestore Emulator
puerto 8080.

**Evidencia principal:** POST autenticado a
`/api/checkout` con HTTP 201, `success: true`,
`replayed: false`, estado `pending`, moneda `PEN`
y total de 2590 céntimos.

Orden generada:

`b60b02d40be51c059ebfa86e7b4c2dd319d28a8cad0f01842b1dd50542e5f2df`

Se comprobó la reducción de stock de 5 a 4 unidades
y su visualización posterior en el catálogo.

La nueva orden apareció en `/mis-ordenes`
y en `/admin/ordenes` junto con la orden
administrativa de prueba anterior.

**Límite:** el POST de checkout se ejecutó directamente
contra la API mediante una solicitud autenticada,
no desde el formulario React. No se realizaron
pagos reales ni operaciones sobre Firestore real.

**Estado:** verificación funcional completada
en Firebase Emulator. Sin cambios de código,
commits ni despliegues.

#### T11.5 — Revisión y cierre técnico

- [x] Ejecutar ESLint.
- [x] Ejecutar TypeScript API.
- [x] Ejecutar suite general de pruebas.
- [x] Confirmar 516 pruebas aprobadas y 8 omitidas.
- [x] Comprobar pruebas de reglas con emuladores.
- [x] Investigar fallo reproducible de compilación.
- [x] Retirar configuración temporal `.env.local`.
- [x] Repetir build de producción satisfactoriamente.
- [x] Comprobar sincronización de `main`.
- [x] Consolidar documentación del cierre de T11 en `PROJECT.md` y `TASKS.md` (registrada en estos documentos; revisión retrospectiva del 27/11/2026).
- [ ] Revisar diff y estado de Git después de documentar.
- [ ] Obtener autorización para commit y push documental.

**Resultado técnico:** lint, TypeScript API y build
satisfactorios; 516 pruebas aprobadas,
8 omitidas y cero fallidas.

El build volvió a funcionar tras retirar la configuración
temporal de emuladores. No se modificaron archivos de código.

**Advertencia conocida:** chunk de Vite de 580,46 kB,
no bloqueante y fuera del alcance de T11.

**Estado de T11 actualizado:** implementación y verificación local completadas. La narración de T11 está consolidada en estos documentos; no se ha aportado evidencia de un commit exclusivo de cierre documental de T11. Las comprobaciones históricas de diff y autorización se mantienen diferenciadas de la verificación funcional.

El despliegue se efectuó posteriormente en T14; las comprobaciones de recorridos de Production están detalladas allí. T15 se dedicará a la documentación académica.


## 9. Calidad y despliegue

### T12 — Testing y revisión integral

**Estado:** COMPLETADA Y VERIFICADA LOCALMENTE el 24/11/2026. La documentación conserva la evidencia de T12; la publicación de esta revisión documental actualizada requiere commit y push del desarrollador.

Responsables:

- MIXTO: implementación y verificación progresiva de pruebas.
- Revisión técnica: realizada en este chat, en modo de solo lectura, conforme a la decisión vigente desde T08.

#### Criterios de verificación

- [x] Preparar y probar `renderWithProviders`.
- [x] Verificar autenticación y hooks relacionados.
- [x] Verificar `useCart`, `CartContext` y persistencia del carrito.
- [x] Probar las acciones de `cartReducer`.
- [x] Incorporar pruebas de los componentes y páginas principales.
- [x] Verificar integración de carrito y checkout.
- [x] Utilizar mocks de Firebase y AWS en los escenarios correspondientes.
- [x] Ejecutar por separado las suites de Firebase Emulator.
- [x] Evaluar casos límite, errores y operaciones asíncronas.
- [x] Ejecutar suite de tests, lint, TypeScript API y build.
- [x] Revisar accesibilidad y movimiento reducido en T12.4.
- [x] Revisar los antecedentes documentados de seguridad de dependencias.
- [x] Medir la cobertura global V8.
- [x] Completar el diagnóstico no bloqueante de Vite en T12.6.

#### Evidencia final — 24/11/2026

| Indicador | Resultado |
|---|---:|
| Pruebas generales aprobadas | **634** |
| Pruebas omitidas en la ejecución general | 33 |
| Pruebas fallidas | 0 |
| Archivos de pruebas aprobados | 41 |
| Archivos omitidos por requerir emuladores | 3 |
| Pruebas aprobadas por separado con Firebase Emulator | **33** |
| Cobertura de instrucciones | 86,08 % |
| Cobertura de ramas | 86,11 % |
| Cobertura de funciones | 84,41 % |
| Cobertura de líneas | **86,35 %** |

Las 33 pruebas de emuladores corresponden a **8 de checkout, 10 de reglas de productos/imágenes y 15 de reglas administrativas de órdenes**. Se aprobaron por separado; no constituyen una ejecución conjunta de 667 casos.

La cobertura incluye código de producción de `src`, `server` y `api`, con exclusiones explícitas en el comando utilizado. No se estableció una cobertura mínima obligatoria en los documentos de referencia. No se declara cobertura total.

**Áreas principales verificadas:** autenticación, roles, rutas protegidas, catálogo, búsqueda, filtros, paginación, detalle, favoritos, carrito, persistencia, checkout, idempotencia, stock, órdenes, administración, servicios de imágenes privadas, errores y casos límite.

**Calidad reportada:** suite general de Vitest, ESLint, `npm.cmd run typecheck:api` y build satisfactorios. La advertencia de Vite queda documentada y no bloquea la compilación.

**Commits de evidencia:** `e42e7e6` (accesibilidad y movimiento reducido), `3b32f9c` (rutas, hooks y favoritos), `d8136fa` (pruebas de cinco páginas principales).

#### Evidencia incremental histórica de T07–T11

Evidencia acumulada:

- 264 pruebas aprobadas y ocho pruebas de integración omitidas en la ejecución general durante la verificación de T07.
- En la ejecución general posterior a T08, el desarrollador reportó 284 pruebas aprobadas y ocho omitidas (12 archivos aprobados y uno omitido); las ocho omitidas corresponden a la suite de integración de checkout.
- Las ocho pruebas de integración omitidas fueron ejecutadas separadamente con Firestore Emulator y aprobaron.
- 272 casos aprobados al considerar ambas ejecuciones de T07.
- `npm.cmd run typecheck:api`: satisfactorio.
- `npm.cmd run build`: satisfactorio.
- `npm.cmd run lint`: satisfactorio.
- Auditorías históricas de T07: `npm.cmd audit` y `npm.cmd audit --omit=dev`, ambas con cero vulnerabilidades.
- Auditorías de T10.4-A (18/11/2026): `npm.cmd audit` con 12 alertas altas de `picomatch` documentadas y aceptadas provisionalmente; `npm.cmd audit --omit=dev` con cero vulnerabilidades.
- Seguimiento del 20/11/2026: `npm.cmd audit` y `npm.cmd audit --omit=dev` reportaron cero vulnerabilidades. `picomatch@4.0.7` permanece instalado. No se actualizaron dependencias; el hallazgo anterior se conserva como antecedente histórico.
- Suite de T10.4-A: 331 pruebas generales aprobadas, ocho omitidas; 28 específicas del backend PUT aprobadas.
- Suite de T10.4-B: 354 pruebas generales aprobadas, ocho omitidas; 23 específicas del frontend de subida aprobadas, lint, build y TypeScript API satisfactorios.
- Suite de T10.4-C: 408 pruebas generales aprobadas y 18 omitidas; diez pruebas de Firestore Rules aprobadas por separado. Nueve pruebas de `ProductImage` aprobadas, incluidas dos pruebas adicionales de robustez.
- Suite de T10.4-D: 460 pruebas generales aprobadas, 18 omitidas y cero fallidas; 24 pruebas del panel administrativo, 16 del endpoint DELETE, 16 del servicio frontend DELETE y diez del servicio de eliminación S3 aprobadas. TypeScript API, ESLint y build satisfactorios.
- Suite posterior a T10.5: 466 pruebas generales aprobadas, 18 omitidas, cero fallidas; 30 pruebas del panel administrativo aprobadas. Último cambio canónico de Tailwind verificado posteriormente con lint y build satisfactorios.

- Suite de T11.2: 479 pruebas generales aprobadas, 33 omitidas y cero fallidas; 24 pruebas del servicio de órdenes aprobadas. Las 15 pruebas nuevas de reglas se ejecutaron por separado y aprobaron con Firebase Emulator. Lint, build, TypeScript API y formato Git satisfactorios.

Las cifras anteriores corresponden a ejecuciones históricas y no sustituyen el resultado final de T12.

#### T12.6 — Diagnóstico del bundle JavaScript

**Estado:** completado el 24/11/2026, sin modificar código de producción ni dependencias.

Se identificó el chunk `index.esm-BaXGouFi.js` de **580,46 kB minificados** y aproximadamente **172,75 kB gzip**, asociado con Firestore. El archivo principal utiliza `import()` dinámico, coherente con `loadFirestore()` en `src/lib/firebase.ts`.

**Mediciones en Vite Preview (`localhost:4173`), Chrome DevTools, caché deshabilitada y sin limitación artificial de red:**

| Indicador | Visitante | Autenticado |
|---|---:|---:|
| Solicitudes | 19 | 29 |
| Transferencia | 667 kB | 841 kB |
| Recursos | 1,3 MB | 1,9 MB |
| DOMContentLoaded | 220 ms | 1,45 s |
| Load | 627 ms | 1,95 s |
| Finish | 1,26 s | 6,04 s |

El chunk de Firestore no apareció entre las solicitudes registradas del visitante, pero sí durante la sesión autenticada, con aproximadamente 171 kB transferidos. Se trata de mediciones locales puntuales, no resultados de producción.

**Decisión:** conservar la arquitectura actual y no dividir artificialmente el SDK ni aumentar el umbral informativo de Vite. La advertencia no bloquea T12. La evaluación del despliegue público y Lighthouse corresponde a T14. Detalles adicionales en `docs/PROJECT.md`, sección 7.10.

#### Limitaciones y seguimiento

- La cobertura no garantiza ausencia de errores, vulnerabilidades o defectos visuales.
- Los mocks y emuladores no sustituyen el entorno público.
- Las verificaciones de accesibilidad no equivalen a una auditoría integral.
- Algunos módulos auxiliares y rutas de inicialización conservan cobertura parcial o nula.
- T13 comprende integración continua; T14, despliegue y rendimiento; T15, documentación académica.

**Aceptación:** revisión integral automatizada de T12 completada satisfactoriamente en su alcance local. La publicación documental requiere comprobación de diferencias y autorización independientes.

### T13 — GitHub e integración continua

**Estado:** IMPLEMENTADA, PUBLICADA Y VERIFICADA. Cierre documental pendiente de revisión, commit y push.

Responsable: MIXTO

- [x] Crear repositorio del proyecto.
- [x] Revisar `.gitignore`.
- [x] Revisar de forma preliminar archivos versionados e historial Git en busca de patrones de secretos (sin coincidencias inesperadas; no equivale a una auditoría exhaustiva).
- [x] Configurar GitHub Actions.
- [x] Ejecutar `npm ci` en CI.
- [x] Automatizar tests, lint y build.
- [x] Incluir revisión de seguridad de dependencias.
- [x] Comprobar resultados del workflow.

#### T13.1 — Preparación y revisión preliminar de seguridad

Se comprobó que `main` estaba limpia y sincronizada, se revisaron `.gitignore` y `.env.example`, y se examinaron nombres de archivos versionados e históricos potencialmente sensibles. Una búsqueda de patrones de claves AWS, claves privadas y tokens de GitHub sobre el historial accesible no devolvió coincidencias. No se utilizó un detector especializado: no se afirma que el historial esté libre de todo tipo de secreto.

#### T13.2 — Configuración y ejecución de GitHub Actions

Se creó `.github/workflows/ci.yml` con un único job `quality`, activado por push y pull request hacia `main`. Utiliza Node.js 24, permisos `contents: read`, valores ficticios de Firebase y los comandos `npm ci`, `npm run lint`, `npm run typecheck:api`, `npm test`, `npm run build` y `npm audit --audit-level=high`. No hay despliegue ni credenciales privadas.

**Commit `01281fe`:** publicación inicial. CI #1 completó sus pasos: 634 pruebas aprobadas, 33 omitidas, cero fallidas, 41 archivos de pruebas aprobados y tres omitidos; ESLint, tipos API, build y `npm ci` satisfactorios; auditoría con cero vulnerabilidades reportadas. Duración: 46 segundos.

Se detectó una advertencia sobre el runtime interno Node.js 20 de `actions/checkout@v4` y `actions/setup-node@v4`.

**Commit `f4828ed`:** actualización de esas dos acciones a `v7`, sin otras modificaciones. CI #2 finalizó satisfactoriamente en 38 segundos y mostró todos los pasos completados; la advertencia anterior no apareció en la captura revisada.

#### T13.3 — Verificación y cierre documental

- [x] Verificar publicación de `.github/workflows/ci.yml` en `main`.
- [x] Revisar resultados de CI #1.
- [x] Revisar resultados de CI #2 después de actualizar las acciones.
- [x] Comprobar el estado limpio y sincronizado de Git después del commit `f4828ed`.
- [x] Registrar que las 33 pruebas con Firebase Emulator no se ejecutan en CI.
- [ ] Revisar el diff **en el repositorio local** de `docs/PROJECT.md` y `docs/TASKS.md` antes de publicar el cierre documental actualizado.
- [ ] Autorizar commit y push de esta actualización documental (acción manual pendiente).

**Aceptación técnica:** cumplida para el workflow implementado, que ejecuta lint, tipos API, tests, build y auditoría con umbral alto/crítico. No se ejecutó una prueba intencionadamente fallida de cada control; su capacidad de bloquear esos errores corresponde a la configuración de sus comandos y códigos de salida.

**Limitaciones:** las 33 pruebas de Firebase Emulator se verificaron por separado en etapas anteriores y no forman parte de CI. La búsqueda histórica de secretos fue preliminar. La CI no sustituye el despliegue ni las verificaciones públicas de T14.

### T14 — Desplegar en Vercel

Responsable: MANUAL

Dependencia: T13

**Estado al 27/11/2026:** aplicación desplegada y accesible en Production; correcciones funcionales y SEO publicadas, CI satisfactoria y Lighthouse ejecutado. **La aceptación integral de T14 sigue parcialmente pendiente** porque no se ha documentado el recorrido completo en Production del carrito, checkout, historial y operaciones reales S3. No confundir estos pendientes de aceptación con un fallo de despliegue.

#### Despliegue y configuración

- [x] Conectar el repositorio GitHub a Vercel y confirmar despliegues desde `main`.
- [x] Publicar la aplicación en `https://papelcorpsac.vercel.app/` y comprobar el estado `Ready` del commit `7f8878a`.
- [x] Comprobar navegación SPA y carga directa de `/catalogo`; `vercel.json` conserva el rewrite a `index.html`.
- [x] Confirmar configuración Firebase suficiente para mostrar catálogo real y sesión Customer en Production.
- [ ] Revisar de manera explícita **todas** las variables por entorno (incluidas las privadas del backend AWS/Firebase Admin), sus ámbitos y permisos, sin revelar valores; las capturas no documentan el inventario completo.
- [ ] Verificar mediante HTTP los endpoints serverless críticos de Production, empezando por `/api/health` y los rechazos esperados de rutas protegidas.

#### Recorridos funcionales públicos

- [x] Verificar acceso público al catálogo y sesión Customer autenticada; la captura del 27/11 muestra `Cliente Prueba1` y 60 productos disponibles.
- [x] Comprobar las pantallas de catálogo en vista móvil de 320 px y escritorio; las pruebas automatizadas cubren búsqueda, filtros, paginación y favoritos.
- [x] Publicar y verificar las correcciones de reglas de productos de T14 para documentos históricos con `id` opcional coherente con el ID del documento; reglas publicadas en Firebase Console según evidencia del desarrollador.
- [x] Verificar la interfaz de los diálogos de confirmación en claro/oscuro, 320 px, Cancelar, Escape y navegación por teclado, según los recorridos compartidos.
- [ ] Completar evidencia de registro, login, logout y permisos por ambos roles en Production; la sesión Customer observada no cubre todas esas variantes.
- [ ] Verificar en Production agregar, modificar y retirar productos del carrito mediante un recorrido real (el indicador `Carrito (0)` y los tests locales no lo sustituyen).
- [ ] Verificar checkout y consulta posterior del historial/detalle en Production **con una operación controlada y autorizada**, evitando afectar el inventario real de los 60 productos.
- [ ] Verificar completamente el flujo Admin de productos y órdenes en Production, sin realizar escrituras o eliminaciones no autorizadas sobre datos reales.
- [ ] Comprobar PUT/GET/DELETE de S3 desde endpoints desplegados, usando exclusivamente objetos temporales autorizados; las pruebas reales de T10.5 fueron locales con Vercel Dev.

#### Calidad y rendimiento en Production

- [x] Confirmar commit `bf4e4da` y CI #9 satisfactorio: 654 tests aprobados, 39 omitidos y cero fallidos; 31 pruebas de reglas en emuladores aprobadas por separado.
- [x] Confirmar commit `7f8878a` y CI #10 satisfactorio: 659 tests aprobados, 39 omitidos y cero fallidos, despliegue Vercel `Ready` y repositorio sincronizado según el desarrollador.
- [x] Verificar en navegador que `https://papelcorpsac.vercel.app/robots.txt` entrega `User-agent: *` y `Allow: /`; comprobar también la corrección de la descripción HTML y el SEO 100/100 en Lighthouse.
- [x] Ejecutar Lighthouse sobre `/catalogo` en Mobile y Desktop, como visitante y Customer autenticado, con throttling simulado.
- [x] Registrar advertencias y oportunidades de rendimiento sin alterar el chunk de Firestore ni introducir cambios sin una nueva autorización.

**Matriz Lighthouse posterior al commit `7f8878a` — `/catalogo`, Production, 27/11/2026 (ejecuciones individuales, no promedios):**

| Perfil | Dispositivo | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS | Speed Index |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Visitante | Mobile | 70 | 100 | 100 | 100 | 2,1 s | 9,7 s | 40 ms | 0,095 | 3,1 s |
| Visitante | Desktop | 88 | 100 | 100 | 100 | 0,6 s | 1,8 s | 0 ms | 0,127 | 0,9 s |
| Customer | Mobile | 63 | 100 | 100 | 100 | 2,1 s | 8,7 s | 40 ms | 0,216 | 2,1 s |
| Customer | Desktop | 69 | 100 | 100 | 100 | 0,7 s | 2,1 s | 0 ms | 0,240 | 3,7 s |

**Referencia anterior a la optimización:** Inicio visitante Mobile 96/100/100/83 y Desktop 100/100/100/83 (Rendimiento/Accesibilidad/Buenas prácticas/SEO); Catálogo visitante Mobile 72/100/100/83 (LCP 7,9 s; CLS 0,079) y Desktop 51/100/100/83 (LCP 2,7 s; CLS 0,999). Después del cambio no se repitió Lighthouse de Inicio; en Catálogo el SEO llegó a 100 y el rendimiento Desktop se midió en 88, mientras que Mobile se midió en 70.

Lighthouse indicó en las cuatro mediciones posteriores que la página tardó demasiado en terminar la carga dentro del límite y que los resultados pueden estar incompletos. En pruebas anteriores se observaron avisos de IndexedDB y extensiones; se desactivaron extensiones y se utilizaron ventanas de incógnito. La opción `Clear storage` estuvo activada para visitante y desactivada para Customer para preservar su sesión; los resultados no son un experimento controlado. No se puede atribuir el rendimiento únicamente al chunk dinámico de Firestore. El `CLS` del Customer Desktop (0,240), el LCP Mobile y la entrega de imágenes/fuentes son oportunidades reales de mejora, no evidencia de fallos en las operaciones comerciales.

**SEO y catálogo:** el commit `7f8878a` incluye `index.html` con meta descripción, `public/robots.txt`, y ajustes de carga de imágenes y de la estructura de espera del catálogo; se ampliaron las pruebas de `CatalogPage`, `ProductCard` y `ProductImage`. `robots.txt` es un archivo público estándar de instrucciones para rastreadores: `User-agent: *` y `Allow: /` permiten el rastreo, pero no garantizan indexación ni sustituyen el control de acceso. Se creó para corregir el hallazgo de `robots.txt` inválido de Lighthouse. Vite copia `public/robots.txt` a la raíz del build y Vercel lo sirve en `/robots.txt`. No contiene credenciales.

**Seguridad de productos — commit `bf4e4da`:** `firestore.rules` admite de forma opcional el campo histórico `id` si coincide con el ID del documento; conserva los demás controles de escritura, lectura y roles. Se reutilizó la suite de reglas de productos y se incorporó `ConfirmDialog.tsx` para confirmaciones de borrado de producto, imagen temporal y cambio de estado administrativo. La publicación de reglas en Firebase Console fue confirmada por el desarrollador el 27/11/2026. No se efectuaron operaciones masivas sobre el catálogo real.

**Aceptación de T14:** despliegue público, catálogo, sesión Customer, interfaz responsive, CI, SEO y auditorías Lighthouse **comprobados**. El criterio original «ambos roles pueden completar sus recorridos» **no se considera demostrado íntegramente en Production** por las verificaciones pendientes descritas. Se mantiene el desarrollo en estado operativo, con ajustes de rendimiento no bloqueantes y sin cambios adicionales de código aprobados para esta actualización documental.

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

**Corte documental:** 27 de noviembre de 2026. Estas notas reemplazan los estados que permanecieron congelados al cierre de T13; los registros anteriores se conservan como historial, no como situación actual.

**Última implementación publicada:** `7f8878a` — `perf: improve catalog loading and SEO`, después de `bf4e4da` — corrección de validación de productos históricos y diálogos de confirmación. Ambos están en `main` según los comandos y capturas compartidos. GitHub Actions CI #9 y #10: `Success`; Vercel Production: `Ready` para `7f8878a`.

**Despliegue:** `https://papelcorpsac.vercel.app/` accesible; Firebase real y catálogo de 60 productos visibles; reglas corregidas publicadas según Firebase Console; `/robots.txt` sirve instrucciones de rastreo válidas.

**Pruebas automatizadas más recientes:** CI #10 reportó **659 aprobadas, 39 omitidas y 0 fallidas**. Las 39 omitidas corresponden a suites dependientes de emuladores que no se ejecutan en CI: 8 de checkout y 31 de reglas. Las 31 de reglas se aprobaron en ejecución separada durante T14; las 8 de checkout cuentan con antecedentes de ejecución separada en etapas previas. No sumar ejecuciones como si fueran un único lote.

**Auditoría pública Lighthouse:** cuatro escenarios `/catalogo`: visitante Mobile 70, Desktop 88; Customer Mobile 63, Desktop 69 en Performance; las otras tres categorías alcanzaron 100 en las cuatro. La advertencia de carga incompleta limita la precisión de estas mediciones. Sigue existiendo el aviso no bloqueante de Vite por el chunk Firestore de 580,46 kB minificados (172,75 kB gzip).

**Estado de etapas:** T00–T13 implementadas en sus alcances documentados. T14 desplegada y parcialmente verificada, **no íntegramente aceptada** por las pruebas públicas pendientes de carrito, checkout, historial y S3; T15 permanece pendiente (README, bitácora y presentación). La revisión explícita de versiones estables de T01 y las comprobaciones de Git/documentación señaladas como pendientes requieren evidencia adicional.

**Intervención actual:** actualización de `docs/PROJECT.md` y `docs/TASKS.md`, preparada a partir de los documentos aportados. Todavía no se ha realizado commit ni push de estos cambios documentales en el repositorio del desarrollador.

T00 — Documentación inicial: COMPLETADA.

T01 — Inicializar React, TypeScript y Vite: COMPLETADA, con comprobaciones históricas pendientes de evidencia señaladas en su apartado.

T02 — Tailwind CSS, componentes y navegación: COMPLETADA.

T03 — Configurar Firebase: COMPLETADA.

T04 — Implementar autenticación y roles: COMPLETADA.

T05 — Implementar catálogo: COMPLETADA.

T06 — Implementar carrito: COMPLETADA.

T07 — Implementar checkout: COMPLETADA Y VERIFICADA LOCALMENTE.

T08 — Historial y detalle de órdenes: COMPLETADA, VERIFICADA Y PUBLICADA EN GITHUB. Implementación `b3107e1` y cierre documental `7979f12`.

T07.1 — Infraestructura mínima de Vercel: IMPLEMENTADA Y DESPLEGADA POSTERIORMENTE EN T14; comprobación HTTP pública de endpoints pendiente.

T07.2-A — Firebase Authentication Emulator: COMPLETADA Y PUBLICADA. Commit `1a1b713`.

T07.2-B — Verificación de tokens en servidor: COMPLETADA Y PUBLICADA. Commit `65eafcd`, con ajustes posteriores `beb8f51` y `c8ea255`.

T07.3-A — Validación de solicitudes: COMPLETADA. Commit `e578af2`.

T07.3-B — Servicio transaccional: COMPLETADA. Commit `58d0c39`.

T07.3-C — Endpoint HTTP protegido: COMPLETADA. Commit `1d61f22`.

T07.3-D — Integración con Firestore Emulator: COMPLETADA. Commit `43bd2e7`.

T07.4-A — Interfaz y navegación: COMPLETADA. Commit `86fe9ca`.

T07.4-B — Pruebas del cliente y componente: COMPLETADA. Commits `fce557c` y `0aeddfb`.

T07.4-C — Protección del carrito e idempotencia: COMPLETADA. Commit `ee29994`.

T09 — Configurar AWS S3: COMPLETADA Y VERIFICADA EN SU ALCANCE DE INFRAESTRUCTURA. Bucket privado, CORS, IAM con permisos mínimos, credenciales protegidas y AWS STS HTTP 200. La integración funcional corresponde a T10.

T10.1 — Revisión técnica de la base existente: COMPLETADA. Revisión de solo lectura, dependencias verificadas y propuesta T10.2 autorizada.

T10.2 — Layout y navegación administrativa: COMPLETADA, VERIFICADA Y PUBLICADA EN GITHUB. Commit `ea95c91`.

T10.3 — CRUD administrativo de productos: COMPLETADA, VERIFICADA Y PUBLICADA EN `main`. Commit `cac3b48`. Sus reglas se publicaron posteriormente en la integración de T10.5.

T10.4-A — Backend PUT prefirmado de AWS S3: COMPLETADA, VERIFICADA LOCALMENTE Y PUBLICADA. Commit `40f15ed`. Excepción de seguridad de dependencias autorizada y documentada.

T10.4-B — Interfaz administrativa de subida S3: IMPLEMENTADA, VERIFICADA LOCALMENTE Y PUBLICADA. Commit `8c55a95`. Integración real pospuesta.

T10.4-C — Persistencia de `imageKey` y GET privado: COMPLETADA, VERIFICADA LOCALMENTE Y PUBLICADA. Commit `8fd8716`.

T10.4-D — Eliminación autorizada de imágenes S3: COMPLETADA Y PUBLICADA. Commit `f68bba6`; evidencia histórica de 460 pruebas aprobadas y 18 omitidas.

T10.5 — Integración real AWS/Firebase y mejoras UX: COMPLETADA Y PUBLICADA. Commit `edd3669` en `main`; evidencia histórica de 466 pruebas aprobadas y 18 omitidas.

T11.1 — Revisión técnica de administración de órdenes: COMPLETADA (solo lectura).

T11.2 — Consultas y permisos administrativos: COMPLETADA, REGLAS PUBLICADAS Y CÓDIGO PUBLICADO. Commit `9fb31e8`.

T11.3 — Interfaz administrativa: COMPLETADA, VERIFICADA Y PUBLICADA. Commit `13634fc`.

T11.4 — Verificación integrada: COMPLETADA EN FIREBASE EMULATOR. Checkout HTTP 201 y descuento de stock comprobados; interfaz administrativa y consulta del cliente verificadas.

T11.5 — Verificación técnica: COMPLETADA. 516 pruebas aprobadas, 8 omitidas, lint, TypeScript API y build correctos. La narración documental fue consolidada; sin evidencia de commit exclusivo de cierre T11.

T12 — Testing y revisión integral: COMPLETADA Y VERIFICADA LOCALMENTE. 634 pruebas generales aprobadas, 33 de emuladores aprobadas por separado, cobertura global de líneas del 86,35 %. Publicación documental pendiente.

T12.6 — Diagnóstico de bundle: COMPLETADO. Advertencia conocida de Firestore, importación dinámica confirmada; mediciones de Production obtenidas durante T14 sin modificación del bundle.

T13 — GitHub e integración continua: IMPLEMENTADA Y PUBLICADA (`01281fe`, `f4828ed`); CI #9 y CI #10 posteriores satisfactoriamente. La documentación actualizada debe publicarse por separado.

T14 — Despliegue y mediciones de Production: PUBLICADO Y VERIFICADO PARCIALMENTE. Commits `bf4e4da` y `7f8878a`; CI #9 y #10 satisfactorias; cuatro auditorías Lighthouse. Criterios de recorridos completos en Production aún pendientes.

T15 — README, bitácora y presentación: PENDIENTE.

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
| 2026-11-11 | T08 | 20 pruebas específicas aprobadas; suite general posterior: 284 aprobadas y 8 omitidas; build y lint satisfactorios. Dos usuarios de prueba con órdenes independientes; historial propio, detalle, acceso cruzado, orden inexistente y escrituras directas comprobadas en Firebase Emulator. Reglas actualizadas publicadas en Firestore Console según confirmación del desarrollador. | Completada y verificada localmente; código publicado mediante `b3107e1`; cierre documental `7979f12`. | Ninguno. |
| 2026-11-11 | T09 | Bucket privado en `us-east-1`; bloqueo público y ACL verificados; SSE-S3; CORS; IAM restringido a `products/*`; usuario sin grupos; variables locales y Vercel Development configuradas; AWS STS HTTP 200. | Infraestructura completada y verificada. | Pruebas operativas S3 previstas para T10. |
| 2026-11-11 | T10.1 | Revisión de solo lectura del repositorio, autenticación, rutas, componentes, catálogo, reglas Firestore y dependencias; contraste con PROJECT.md, TASKS.md y las guías del docente. | Revisión técnica completada; propuesta T10.2 autorizada. | Ninguno. |
| 2026-11-11 | T10.2 | Layout administrativo independiente, navegación por rol, seis pruebas específicas, 290 pruebas generales, lint y build correctos; comprobaciones visuales por rol. Commit `ea95c91`. | Completada, verificada y publicada en `main`. | Ninguno. |
| 2026-11-17 | T10.3 | CRUD de productos, ruta protegida, validación y reglas Firestore; 13 pruebas del servicio, 303 generales aprobadas y 8 omitidas; lint y build correctos; 15/15 pruebas de permisos, 4/4 de precios; recorrido CRUD completo y bloqueo Customer verificados en emulador. | Completada y publicada, commit `cac3b48`. | En esa fecha aún no se habían publicado las reglas CRUD en Firebase real; publicación confirmada posteriormente en T10.5. |
| 2026-11-18 | T10.4-A | Backend de URL PUT con comprobación de Admin, formatos y tamaño declarado; 28 pruebas específicas y 331 generales aprobadas, 8 omitidas; TypeScript API, lint, build, firma real del SDK con credenciales ficticias y `git diff --check` correctos. `npm audit`: 12 alertas altas de `picomatch`; producción: cero. | Implementada, verificada localmente y publicada en `main`, commit `40f15ed`; riesgo de dependencias aceptado provisionalmente. | Prueba real S3 diferida hasta integración final. |
| 2026-11-19 | T10.4-B | Selector de imágenes, servicio POST/PUT, validaciones JPEG/PNG/WebP y 5 MiB; 14 pruebas del servicio y nueve del componente; suite general de 354 aprobadas y ocho omitidas; lint, build, TypeScript API y diff correctos; interfaz revisada en escritorio y móvil; endpoint accesible mediante Vercel Dev. | Implementada, verificada localmente y publicada, commit `8c55a95`. | Integración real AWS/Firebase diferida. |
| 2026-11-19 | T10.4-C | Persistencia de `imageKey`, GET prefirmado de 60 segundos, autorización de imágenes no publicadas, servicio frontend y visualización con fallback; suite general final de 408 aprobadas y 18 omitidas; diez pruebas de reglas aprobadas en Firebase Emulator; nueve pruebas de `ProductImage`, incluidas dos de robustez; TypeScript API, ESLint, build y formato Git correctos. | Implementada, verificada localmente y publicada en `main`, commit `8fd8716`. | Integración AWS/Firebase real diferida. |
| 2026-11-20 | T10.4-D | Eliminación S3 protegida mediante Firebase Admin, comprobación de referencias Firestore, servicio HTTP y confirmación administrativa; 24 pruebas del panel, 16 del endpoint DELETE, 16 del servicio frontend DELETE, diez del servicio de eliminación S3 y 20 del servicio S3 existente; suite general de 460 aprobadas y 18 omitidas; TypeScript API, ESLint y build correctos; dos ajustes de robustez en el formulario. | Implementada, verificada localmente y publicada en `main` (`f68bba6`). | Integración real y UX verificadas posteriormente en T10.5; persisten las limitaciones documentadas de concurrencia y huérfanos. |
| 2026-11-20 | T10.5 | PUT/GET/DELETE reales AWS S3 y Firebase; producto temporal retirado, 60 productos originales y 0 objetos S3 actuales; búsqueda, filtros, paginación de 12 y responsive a 320 px; suite general de 466 aprobadas y 18 omitidas; panel 30 aprobadas. | Integración real y mejoras UX verificadas; publicación posterior `edd3669`. | Persisten riesgo de concurrencia y ausencia de limpieza automática de huérfanos. |
| 2026-11-20 | T11.2 | Servicios de órdenes, reglas administrativas, 24 pruebas de servicio, 15/15 de reglas, autorización y publicación en Firebase Console; commit `9fb31e8`. | Implementada, verificada y publicada. | Ninguno funcional. |
| 2026-11-20 | T11.3 | Panel `/admin/ordenes`, filtros, cambios de estado, pruebas del componente y layout, responsive; commit `13634fc`. | Implementada, verificada y publicada. | Verificación integrada posterior. |
| 2026-11-20–21 | T11.4 | Autenticación y roles en emuladores; orden administrativa de prueba; cambio `pending` a `processing`; checkout HTTP 201, orden nueva por S/ 25.90 y stock 5 a 4; consulta de Admin y Customer. | Verificación integrada local completada. | Validación del despliegue real en T14. |
| 2026-11-21 | T11.5 | 516 pruebas aprobadas y 8 omitidas; lint, TypeScript API y build correctos tras retirar `.env.local` temporal; Git sincronizado antes de documentar. | Cierre técnico verificado. | Revisión documental y autorización de commit/push pendientes. |
| 2026-11-24 | T12 | 634 pruebas generales aprobadas, 33 de emuladores aprobadas por separado, cobertura de líneas 86,35 %, lint, TypeScript API y build satisfactorios. Commits `e42e7e6`, `3b32f9c` y `d8136fa`. | Completada y verificada localmente. | Revisión y publicación documental. |
| 2026-11-24 | T12.6 | Chunk de Firestore de 580,46 kB; importación dinámica y mediciones en Vite Preview confirmadas. | Diagnóstico completado sin cambios de código. | Lighthouse y rendimiento público en T14. |
| 2026-11-24 | T13 | GitHub Actions con un job, `npm ci`, ESLint, tipos API, 634 pruebas aprobadas y 33 omitidas en CI #1, build y auditoría con 0 vulnerabilidades. Actualización de acciones a v7; CI #2 satisfactoria. Commits `01281fe` y `f4828ed`. | Integración continua implementada, publicada y verificada. | Cierre documental; despliegue T14. |
| 2026-11-27 | T14 — reglas y confirmaciones | `bf4e4da`; corrección de `validProduct` para `id` histórico, publicación en Firestore Console confirmada, tres diálogos de confirmación responsive y accesibles; CI #9: 654 aprobadas y 39 omitidas; reglas con emuladores 31/31 separadas. | Corrección publicada y verificada en su alcance. | Auditorías de rendimiento y recorrido de aceptación de T14. |
| 2026-11-27 | T14 — catálogo y SEO | `7f8878a` en `main`; CI #10: 659 aprobadas y 39 omitidas, Vercel Production `Ready`; meta descripción, `/robots.txt` válido, mejoras de prioridad de imágenes y carga del catálogo. | Publicado y comprobado. | Optimización de rendimiento opcional; validación integral de recorridos de producción. |
| 2026-11-27 | T14 — Lighthouse | Visitante Mobile 70 y Desktop 88; Customer Mobile 63 y Desktop 69; Accesibilidad, Best Practices y SEO 100 en los cuatro. Capturas con advertencia de tiempo de carga incompleto. | Auditoría de laboratorio realizada, con limitaciones documentadas. | Cerrar recorridos checkout, historial, Admin y S3 en Production antes de declarar T14 integralmente aceptada. |

### Condiciones históricas del cierre de T11

- [x] Implementación y verificación funcional de T11.
- [x] Publicación de reglas administrativas en Firebase Console.
- [x] Publicación de T11.2 y T11.3 en GitHub.
- [x] Checkout integrado verificado en Firebase Emulator.
- [x] Lint, build, TypeScript API y pruebas satisfactorios.
- [ ] Revisar los cambios documentales de PROJECT.md y TASKS.md.
- [ ] Ejecutar `git diff --check` y comprobar el estado de Git.
- [ ] Autorizar commit y push exclusivos del cierre documental.

Estas casillas corresponden al **acto histórico de publicación documental específica de T11** y no son condiciones funcionales que obliguen a repetir T11. Las secciones de T11 sí han sido consolidadas; no se dispone de evidencia de las tres acciones documentales como un cierre Git independiente. En el momento descrito, T12 aún estaba pendiente; posteriormente se completó y verificó. La publicación de los documentos actualizados en este corte de T14 sigue requiriendo revisión y commit/push.

T14 publicó la aplicación y documentó pruebas de Production, pero conserva pendientes algunos recorridos funcionales. T15 se reserva para README, bitácora, documentación académica y presentación.

### Antecedentes del cierre T10.5

Condiciones históricas del cierre T10.5, **publicado posteriormente mediante `edd3669`**:

- [x] Lint, build y `git diff --check` satisfactorios después de la sustitución canónica de Tailwind.
- [x] Mantener la evidencia histórica de `docs/PROJECT.md` y `docs/TASKS.md` en el cierre publicado.
- [x] Limitar el commit de T10.5 a los archivos autorizados, según la preparación y publicación corroboradas.
- [x] Revisar los archivos de ese cambio sin secretos evidentes; esta comprobación no es auditoría exhaustiva.
- [x] Autorizar y publicar `edd3669`; la sincronización de `main` quedó confirmada en comprobaciones posteriores.

**Integración real ya comprobada:** autorización administrativa, PUT, GET y DELETE sobre AWS S3 privado, persistencia `imageKey`, protección anónima de imágenes no publicadas, limpieza del producto temporal y ausencia de objetos actuales en AWS Console. Las reglas de productos se publicaron según la confirmación del desarrollador. No se introdujo limpieza automática de huérfanos y el riesgo de concurrencia sigue documentado. La falta de verificación de versiones históricas tampoco se presenta como resuelta.

Las siguientes fueron condiciones **históricas** previas al despliegue público de T14:

- Verificar el árbol y el artefacto efectivo de producción.
- Confirmar que no existan vulnerabilidades conocidas sin tratamiento.
- Configurar credenciales y permisos mínimos.
- Confirmar que los emuladores no puedan activarse en Preview o Production.
- Obtener autorización expresa del desarrollador.

El despliegue se realizó posteriormente mediante Vercel Production; la revisión explícita de todas las variables privadas y endpoints desplegados continúa señalada como pendiente en T14. La publicación de reglas de Firestore no equivale por sí sola a probar esas funciones. No registrar pruebas, despliegues o configuraciones inexistentes.
