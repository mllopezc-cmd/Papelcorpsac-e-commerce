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
- Las auditorías posteriores a la corrección de T07 reportaron cero vulnerabilidades tanto en `npm audit` como en `npm audit --omit=dev`; durante T10.4-A se identificó un nuevo hallazgo de desarrollo, documentado en su apartado.
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

- [ ] Verificar y autorizar configuración externa.

Aceptación:

El CRUD completo y la carga de imágenes funcionan.

Las operaciones administrativas están protegidas.

Las órdenes históricas conservan sus detalles.

Las subtareas T10.4-A/B/C/D quedaron verificadas y publicadas. Posteriormente se comprobaron la integración real con Firebase y AWS S3, la publicación de reglas de productos confirmada por el desarrollador y las mejoras UX de T10.5. La verificación final de Tailwind y la revisión documental fueron satisfactorias. El cierre general de T10 permanece pendiente de la publicación Git.

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
- [ ] Verificar que Git incluya exclusivamente los archivos autorizados y que no haya secretos.
- [ ] Autorizar y realizar commit y push del cierre UX y documental.

**Limitaciones:** la consulta de referencias Firestore y la eliminación S3 no son atómicas; no existe limpieza automática de huérfanos. Las pruebas con servicios reales se efectuaron localmente, sin despliegue público. No se verificaron versiones históricas del bucket.

**Estado:** integración real y mejoras UX verificadas en el alcance descrito; publicación del cierre pendiente. T11 no autorizada.

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
- [ ] Mockear Firebase y AWS en los escenarios correspondientes.
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
- 272 casos aprobados al considerar ambas ejecuciones de T07.
- `npm.cmd run typecheck:api`: satisfactorio.
- `npm.cmd run build`: satisfactorio.
- `npm.cmd run lint`: satisfactorio.
- Auditorías históricas de T07: `npm.cmd audit` y `npm.cmd audit --omit=dev`, ambas con cero vulnerabilidades.
- Auditorías de T10.4-A (18/11/2026): `npm.cmd audit` con 12 alertas altas de `picomatch` documentadas y aceptadas provisionalmente; `npm.cmd audit --omit=dev` con cero vulnerabilidades.
- Suite de T10.4-A: 331 pruebas generales aprobadas, ocho omitidas; 28 específicas del backend PUT aprobadas.
- Suite de T10.4-B: 354 pruebas generales aprobadas, ocho omitidas; 23 específicas del frontend de subida aprobadas, lint, build y TypeScript API satisfactorios.
- Suite de T10.4-C: 408 pruebas generales aprobadas y 18 omitidas; diez pruebas de Firestore Rules aprobadas por separado. Nueve pruebas de `ProductImage` aprobadas, incluidas dos pruebas adicionales de robustez.
- Suite de T10.4-D: 460 pruebas generales aprobadas, 18 omitidas y cero fallidas; 24 pruebas del panel administrativo, 16 del endpoint DELETE, 16 del servicio frontend DELETE y diez del servicio de eliminación S3 aprobadas. TypeScript API, ESLint y build satisfactorios.
- Suite posterior a T10.5: 466 pruebas generales aprobadas, 18 omitidas, cero fallidas; 30 pruebas del panel administrativo aprobadas. Último cambio canónico de Tailwind verificado posteriormente con lint y build satisfactorios.

La revisión integral de T12 continúa pendiente y no se considera sustituida por las pruebas incrementales.

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

**Última subtarea publicada:** T10.4-D — Eliminación protegida de imágenes privadas S3, commit `f68bba6` en `main`.

**Intervención actual:** T10.5 — Integración real AWS/Firebase, mejoras UX administrativas y documentación final; commit y push del cierre pendientes.

**Evidencia más reciente:** 466 pruebas generales aprobadas, 18 omitidas y ninguna fallida; 30 pruebas del panel aprobadas; lint, build, TypeScript API y `git diff --check` correctos en las ejecuciones compartidas. Lint y build se repitieron satisfactoriamente después del último cambio manual de Tailwind.

**Integración real:** PUT, GET y DELETE verificados sobre AWS S3 privado desde Vercel Dev con Firebase real; producto temporal eliminado, 60 productos originales visibles y bucket con cero objetos actuales. Reglas de productos publicadas en Firebase Console según confirmación previa del desarrollador.

**T11:** no autorizada; el proyecto no está desplegado públicamente.

T00 — Documentación inicial: COMPLETADA.

T01 — Inicializar React, TypeScript y Vite: COMPLETADA, con comprobaciones históricas pendientes de evidencia señaladas en su apartado.

T02 — Tailwind CSS, componentes y navegación: COMPLETADA.

T03 — Configurar Firebase: COMPLETADA.

T04 — Implementar autenticación y roles: COMPLETADA.

T05 — Implementar catálogo: COMPLETADA.

T06 — Implementar carrito: COMPLETADA.

T07 — Implementar checkout: COMPLETADA Y VERIFICADA LOCALMENTE.

T08 — Historial y detalle de órdenes: COMPLETADA, VERIFICADA Y PUBLICADA EN GITHUB. Implementación `b3107e1` y cierre documental `7979f12`.

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

T09 — Configurar AWS S3: COMPLETADA Y VERIFICADA EN SU ALCANCE DE INFRAESTRUCTURA. Bucket privado, CORS, IAM con permisos mínimos, credenciales protegidas y AWS STS HTTP 200. La integración funcional corresponde a T10.

T10.1 — Revisión técnica de la base existente: COMPLETADA. Revisión de solo lectura, dependencias verificadas y propuesta T10.2 autorizada.

T10.2 — Layout y navegación administrativa: COMPLETADA, VERIFICADA Y PUBLICADA EN GITHUB. Commit `ea95c91`.

T10.3 — CRUD administrativo de productos: COMPLETADA, VERIFICADA Y PUBLICADA EN `main`. Commit `cac3b48`. Sus reglas se publicaron posteriormente en la integración de T10.5.

T10.4-A — Backend PUT prefirmado de AWS S3: COMPLETADA, VERIFICADA LOCALMENTE Y PUBLICADA. Commit `40f15ed`. Excepción de seguridad de dependencias autorizada y documentada.

T10.4-B — Interfaz administrativa de subida S3: IMPLEMENTADA, VERIFICADA LOCALMENTE Y PUBLICADA. Commit `8c55a95`. Integración real pospuesta.

T10.4-C — Persistencia de `imageKey` y GET privado: COMPLETADA, VERIFICADA LOCALMENTE Y PUBLICADA. Commit `8fd8716`.

T10.4-D — Eliminación autorizada de imágenes S3: COMPLETADA Y PUBLICADA. Commit `f68bba6`; evidencia histórica de 460 pruebas aprobadas y 18 omitidas.

T10.5 — Integración real AWS/Firebase y mejoras UX: VERIFICADA EN EL ALCANCE DOCUMENTADO. Suite más reciente: 466 pruebas aprobadas y 18 omitidas. Ajuste Tailwind y revisión documental verificados; commit/push pendientes.

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
| 2026-11-17 | T10.3 | CRUD de productos, ruta protegida, validación y reglas Firestore; 13 pruebas del servicio, 303 generales aprobadas y 8 omitidas; lint y build correctos; 15/15 pruebas de permisos, 4/4 de precios; recorrido CRUD completo y bloqueo Customer verificados en emulador. | Completada y publicada, commit `cac3b48`. | Reglas CRUD de Firestore aún no publicadas en Firebase real. |
| 2026-11-18 | T10.4-A | Backend de URL PUT con comprobación de Admin, formatos y tamaño declarado; 28 pruebas específicas y 331 generales aprobadas, 8 omitidas; TypeScript API, lint, build, firma real del SDK con credenciales ficticias y `git diff --check` correctos. `npm audit`: 12 alertas altas de `picomatch`; producción: cero. | Implementada, verificada localmente y publicada en `main`, commit `40f15ed`; riesgo de dependencias aceptado provisionalmente. | Prueba real S3 diferida hasta integración final. |
| 2026-11-19 | T10.4-B | Selector de imágenes, servicio POST/PUT, validaciones JPEG/PNG/WebP y 5 MiB; 14 pruebas del servicio y nueve del componente; suite general de 354 aprobadas y ocho omitidas; lint, build, TypeScript API y diff correctos; interfaz revisada en escritorio y móvil; endpoint accesible mediante Vercel Dev. | Implementada, verificada localmente y publicada, commit `8c55a95`. | Integración real AWS/Firebase diferida. |
| 2026-11-19 | T10.4-C | Persistencia de `imageKey`, GET prefirmado de 60 segundos, autorización de imágenes no publicadas, servicio frontend y visualización con fallback; suite general final de 408 aprobadas y 18 omitidas; diez pruebas de reglas aprobadas en Firebase Emulator; nueve pruebas de `ProductImage`, incluidas dos de robustez; TypeScript API, ESLint, build y formato Git correctos. | Implementada, verificada localmente y publicada en `main`, commit `8fd8716`. | Integración AWS/Firebase real diferida. |
| 2026-11-20 | T10.4-D | Eliminación S3 protegida mediante Firebase Admin, comprobación de referencias Firestore, servicio HTTP y confirmación administrativa; 24 pruebas del panel, 16 del endpoint DELETE, 16 del servicio frontend DELETE, diez del servicio de eliminación S3 y 20 del servicio S3 existente; suite general de 460 aprobadas y 18 omitidas; TypeScript API, ESLint y build correctos; dos ajustes de robustez en el formulario. | Implementada, verificada localmente y publicada en `main` (`f68bba6`). | Integración real y UX verificadas posteriormente en T10.5; persisten las limitaciones documentadas de concurrencia y huérfanos. |
| 2026-11-20 | T10.5 | PUT/GET/DELETE reales AWS S3 y Firebase; producto temporal retirado, 60 productos originales y 0 objetos S3 actuales; búsqueda, filtros, paginación de 12 y responsive a 320 px; suite general de 466 aprobadas y 18 omitidas; panel 30 aprobadas. | Integración real y mejoras UX verificadas en el alcance documentado. | Lint/build posteriores al ajuste Tailwind y revisión documental satisfactorios; autorizar commit/push. |

### Condiciones para continuar

Antes de publicar el cierre UX y documental de T10.5:

- [x] Lint, build y `git diff --check` satisfactorios después de la sustitución canónica de Tailwind.
- Comprobar que `docs/PROJECT.md` y `docs/TASKS.md` conservan la evidencia histórica y describen correctamente el estado actual.
- Revisar el diff y el área de preparación de Git; limitarlo a los dos archivos TSX y los dos documentos Markdown autorizados.
- Verificar que no se hayan agregado secretos ni recursos de prueba.
- Obtener autorización para commit y push, y confirmar la sincronización de `main`.

**Integración real ya comprobada:** autorización administrativa, PUT, GET y DELETE sobre AWS S3 privado, persistencia `imageKey`, protección anónima de imágenes no publicadas, limpieza del producto temporal y ausencia de objetos actuales en AWS Console. Las reglas de productos se publicaron según la confirmación del desarrollador. No se introdujo limpieza automática de huérfanos y el riesgo de concurrencia sigue documentado. La falta de verificación de versiones históricas tampoco se presenta como resuelta.

Antes del despliegue público en Vercel:

- Verificar el árbol y el artefacto efectivo de producción.
- Confirmar que no existan vulnerabilidades conocidas sin tratamiento.
- Configurar credenciales y permisos mínimos.
- Confirmar que los emuladores no puedan activarse en Preview o Production.
- Obtener autorización expresa del desarrollador.

No registrar pruebas, despliegues o configuraciones inexistentes. La publicación de reglas de Firestore no equivale al despliegue público de la aplicación o del backend.
