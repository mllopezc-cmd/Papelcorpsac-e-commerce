# Papelcorpsac — Plan de trabajo

## 1. Propósito

Organizar el desarrollo del Proyecto Integrador 5 mediante tareas pequeñas, ordenadas y verificables.

Los requisitos y las decisiones generales están definidos en docs/PROJECT.md.

Este documento registra qué debemos hacer, quién lo realizará y cómo comprobaremos su finalización.

## 2. Reglas de trabajo

Estados:

- [ ] Pendiente.
- [x] Completada y verificada.

Responsables:

- MANUAL: desarrollador.
- COPILOT: implementación asistida.
- MIXTO: colaboración con intervención manual.
- REVIEWER: revisión de solo lectura.

Reglas:

- Una tarea activa a la vez.
- Revisar dependencias antes de comenzar.
- No modificar áreas ajenas a la tarea.
- No avanzar automáticamente a la siguiente.
- No marcar tareas como completas sin evidencia.
- Registrar problemas y decisiones importantes.

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

Los cinco documentos existen y Copilot reconoce correctamente las instrucciones generales, el agente
Reviewer y la Skill complete-feature.

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
- El registro de T01 reporta una auditoría inicial sin vulnerabilidades. Auditorías posteriores reportaron cinco hallazgos moderados de desarrollo relacionados con `glob`; se pospuso la corrección y sigue pendiente evaluar una solución compatible.
- No hay evidencia suficiente en el registro para marcar la comprobación inicial de Node/npm, la instalación de dependencias ni la ejecución de `npm run dev`.

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

Tailwind CSS funciona correctamente, la navegación pública está operativa y las primeras vistas respetan la identidad
visual aprobada, con diseño responsive.

La protección efectiva de /admin se implementará en T04.
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

Ampliaciones aprobadas e implementadas en T05:

- El alcance inicial de doce productos se amplió a 60: doce principales y 48 demostrativos, distribuidos en cuatro categorías con 15 productos por categoría. El seguimiento reporta los 60 publicados en Firestore; su contenido remoto no puede verificarse leyendo el repositorio.
- Los doce productos principales conservan sus imágenes reales; los 48 demostrativos utilizan el SVG local.
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
- Commit `51244e6` publicado en GitHub; rama `main` sincronizada con `origin/main`.
- No se registran pruebas automatizadas como ejecutadas.

Asuntos pendientes:

- `npm audit` reportó cinco hallazgos moderados en dependencias de desarrollo relacionados con `glob` y su árbol de dependencias. La auditoría de producción reportó cero vulnerabilidades. Por decisión del desarrollador, la corrección se pospone hasta evaluar una solución compatible.
- Vite muestra una advertencia no bloqueante por un chunk JavaScript de aproximadamente 580,48 kB minificados. Su optimización se pospone.

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

## 7. Checkout y órdenes

### T07 — Implementar checkout

Responsable: MIXTO
Dependencias: T04, T06

- [ ] Mostrar resumen de la compra.
- [ ] Validar datos necesarios.
- [ ] Simular pago sin pasarela real.
- [ ] Validar productos e importes de forma confiable.
- [ ] Crear orden en Firestore.
- [ ] Mostrar confirmación o error.
- [ ] Limpiar el carrito después de confirmar.

Aceptación:

Una compra simulada crea una orden válida.
Los errores no generan confirmaciones falsas.
La escritura no permite manipular importes o propietarios.

El desarrollador aprueba la operación de servidor necesaria para proteger las órdenes.

### T08 — Historial y detalle de órdenes

Responsable: COPILOT
Dependencia: T07

- [ ] Consultar órdenes del usuario autenticado.
- [ ] Mostrar historial.
- [ ] Mostrar detalle de una orden.
- [ ] Mostrar estado de la orden.
- [ ] Proteger la información por propietario.
- [ ] Gestionar carga, vacío y errores.

Aceptación:

Cada cliente puede consultar únicamente sus órdenes y el detalle de compras anteriores.

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

Responsable: COPILOT
Dependencias: T08, T10

- [ ] Consultar todas las órdenes como admin.
- [ ] Filtrar por estado.
- [ ] Actualizar estados autorizados.
- [ ] Mostrar carga y errores.
- [ ] Verificar restricciones de permisos.

Aceptación:

El administrador puede consultar todas las órdenes, filtrarlas por estado y actualizar sus estados.
Los clientes no pueden realizar estas operaciones.

## 9. Calidad y despliegue

### T12 — Testing y revisión integral

Responsables:

- COPILOT: implementación y ejecución de verificaciones.
- REVIEWER: revisión de resultados sin modificar archivos.

- [ ] Preparar renderWithProviders.
- [ ] Probar useAuth mediante renderHook.
- [ ] Probar useCart mediante renderHook.
- [x] Probar todas las acciones de cartReducer.
- [ ] Probar componentes importantes.
- [ ] Probar integración de carrito y checkout.
- [ ] Mockear Firebase y AWS.
- [ ] Evaluar casos límite con ayuda de IA.
- [ ] Ejecutar tests, lint y build.
- [ ] Revisar responsive y accesibilidad.
- [ ] Revisar vulnerabilidades de dependencias.

Aceptación:

Las pruebas obligatorias están implementadas y ejecutadas con resultados satisfactorios.

Los tests se crean progresivamente durante las tareas anteriores; esta fase corresponde a la revisión integral.

### T13 — GitHub e integración continua

Responsable: MIXTO

- [x] Crear repositorio del proyecto.
- [x] Revisar .gitignore.
- [ ] Verificar que no existan secretos versionados.
- [ ] Configurar GitHub Actions.
- [ ] Ejecutar npm ci en CI.
- [ ] Automatizar tests, lint y build.
- [ ] Incluir revisión de seguridad de dependencias.
- [ ] Comprobar resultados del workflow.

Aceptación:

La integración continua funciona y señala fallos de pruebas, build, lint y vulnerabilidades
que superen el umbral de seguridad configurado.

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

Podrá realizarse un despliegue inicial anterior si el desarrollador lo autoriza.

Estado previo reportado: el proyecto Vercel `looney-ai-chat/papelcorpsac` fue creado y vinculado localmente durante T07.1. La aplicación Papelcorpsac no está desplegada en producción y no se activó integración automática con GitHub. El proyecto existente podrá reutilizarse durante este despliegue formal.

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

La documentación permite reproducir el proyecto, la bitácora contiene al menos cinco entradas reales
con aprendizajes y decisiones, y la demostración de ambos roles está preparada.

Registrar evidencias de IA durante el desarrollo, no solamente al finalizar.

Observación: README.md continúa siendo la plantilla genérica de Vite; su documentación del proyecto, bitácora y presentación permanecen pendientes.

## 10. Seguimiento

Tarea activa: T07 — Implementar checkout (en desarrollo).

T00 — Documentación inicial: COMPLETADA.

T01 — Inicializar React, TypeScript y Vite: COMPLETADA.

T02 — Tailwind CSS, componentes y navegación: COMPLETADA.

T03 — Configurar Firebase: COMPLETADA.

T04 — Implementar autenticación y roles: COMPLETADA.

T05 — Implementar catálogo: COMPLETADA.

T06 — Implementar carrito: COMPLETADA.

T07 — Implementar checkout: EN DESARROLLO.

T07.1 — Infraestructura mínima de Vercel: IMPLEMENTADA Y VALIDADA LOCALMENTE.

T07.2-A — Configuración de Firebase Authentication Emulator: IMPLEMENTADA Y VERIFICADA LOCALMENTE (sin commit reportado).

Próxima intervención pendiente: T07.2-B — Verificación de tokens en servidor (pendiente de autorización).

Bloqueos: Autorización para T07.2-B pendiente.

Registro de avances:

| Fecha      | Tarea | Evidencia                                                                        | Resultado  | Pendiente |
| ---------- | ----- | -------------------------------------------------------------------------------- | ---------- | --------- |
| 2026-11-05 | T00   | Documentos guardados; Reviewer y Skill reconocidos                               | Completada | Ninguno   |
| 2026-11-05 | T01   | React y Vite funcionando; lint y build correctos; npm audit sin vulnerabilidades | Completada | Ninguno   |
| 2026-11-05 | T02   | Tailwind CSS 4 con Vite; React Router y navegación pública; identidad PAPEL CORP y diseño responsive; modos claro/oscuro con persistencia; accesibilidad y contraste revisados; `npm run lint` y `npm run build` satisfactorios; `npm audit`: cero vulnerabilidades; Reviewer: APROBADO | Completada | Ninguno |
| 2026-11-05 | T03   | Proyecto Firebase `papelcorpsac`; Firestore `(default)` en `us-east1`, modo producción y reglas iniciales de denegación; Authentication con correo/contraseña y Google; app web Papelcorpsac-web registrada; `.env` con seis variables verificadas sin mostrar valores; `.env.example` con seis nombres vacíos; `.gitignore` ignora `.env` y permite `.env.example`; `git status --short`: únicamente `?? .env.example` | Completada | Ninguno |
| 2026-11-06 | T04   | Registro e inicio de sesión con correo y contraseña; inicio con Google; perfiles creados automáticamente en Firestore con rol `customer`; primer admin configurado manualmente desde Firebase Console; persistencia comprobada; `/admin` denegado a customer y acceso autorizado para admin; reglas Firestore publicadas; `npm run lint`, `npm run build`, `npm audit` (cero vulnerabilidades) y `git diff --check` satisfactorios. Observación: bundle JavaScript de 840.06 kB; advertencia informativa, no es un error de compilación ni un bloqueo de T04 | Completada | Ninguno |
| 2026-11-10 | T05   | Código local de catálogo, filtros, búsqueda, detalle y paginación; el seguimiento reporta 60 productos publicados en Firestore (doce principales y 48 demostrativos), estado remoto no verificable mediante el repositorio; comprobación manual de catálogo, filtros, búsqueda, favoritos y navegación; responsive en escritorio y móvil; `npm.cmd run lint`, `npm.cmd run build` y `git diff --cached --check` satisfactorios; commit `51244e6` publicado en `main`, sincronizada con `origin/main`. `npm audit`: cinco hallazgos moderados de desarrollo relacionados con `glob` y dependencias; producción, cero vulnerabilidades; resolución aplazada. Advertencia no bloqueante de Vite: chunk de aproximadamente 580,48 kB minificados; optimización aplazada | Completada | Evaluar solución compatible para hallazgos de `glob`; optimizar chunk Vite |
| No indicada | T06   | Evidencia reportada por el desarrollador: carrito con Context API, `useReducer` y `useCart`; ruta pública `/carrito`; operaciones de agregar, actualizar, eliminar y vaciar; unidades y subtotales en PEN; persistencia local versionada comprobada como visitante, al recargar y con Atrás/Adelante; notificación tras adiciones aceptadas; selector `+`/`−` y disponibilidad dinámica sin modificar el stock de Firestore; 10 escenarios UX satisfactorios; Vitest 5.1.0; 42/42 pruebas del reducer; lint sin errores ni advertencias; build satisfactorio. Revisión de solo lectura de Reviewer: APROBADO CON OBSERVACIONES, sin defectos bloqueantes | Completada | Permanecen las cinco alertas moderadas de desarrollo y la advertencia no bloqueante de chunk Vite; auditoría de producción reportada con cero vulnerabilidades |
| No indicada | T07.1 | Evidencias ejecutadas por el desarrollador y reportadas a Reviewer: Node.js v24.19.0; Vercel CLI 65.14.0 instalada globalmente; proyecto Vercel `looney-ai-chat/papelcorpsac` creado y vinculado localmente, sin integración de despliegues automáticos con GitHub; creado `api/health.ts`, configuración TypeScript aislada `tsconfig.api.json` y regla `.vercel` en `.gitignore`; TypeScript, ESLint y build satisfactorios; Vitest, 42/42 pruebas existentes aprobadas; `GET /api/health` HTTP 200 con JSON esperado, `POST /api/health` HTTP 405; rutas `/`, `/carrito` y `/catalogo` HTTP 200; T07.1 no utilizó Firebase Admin SDK, Firestore ni credenciales. Commit `5c83725` publicado en GitHub, según confirmación del desarrollador. Reviewer: APROBADO CON OBSERVACIONES, sin defectos bloqueantes | Avance parcial implementado y validado localmente; commit publicado en GitHub; aplicación no desplegada en producción | T07.2 — Autenticación confiable en servidor y el resto del checkout siguen pendientes. El HTTP 405 no incluye `Allow: GET` (observación no bloqueante). La configuración inicial del proyecto Vercel podrá reutilizarse en el despliegue formal, sin dar esa etapa por completada. Se conservan las cinco alertas moderadas de desarrollo relacionadas con `glob` y la advertencia no bloqueante del chunk Vite de aproximadamente 580,48 kB minificados |
| No indicada | T07.2-A | Evidencia manual ejecutada por el desarrollador y reportada a Reviewer: Firebase CLI confirmó `All emulators ready` para el proyecto aislado `demo-papelcorpsac`, con Authentication Emulator únicamente en `127.0.0.1:9099`; `curl.exe -i http://127.0.0.1:9099/` respondió HTTP 200 con JSON `authEmulator.ready: true`. Revisión de solo lectura de Copilot Reviewer: APROBADO CON OBSERVACIONES, sin bloqueantes. Sin commit reportado | Implementada y verificada localmente | T07.2-B — Verificación de tokens en servidor pendiente de autorización; T07 y T07.2 no están completadas |
| No indicada | T13   | Repositorio GitHub creado; el desarrollador reporta commits publicados en la rama `main`, incluido `5c83725` de T07.1 | Avance parcial reportado | Configurar y validar GitHub Actions/CI, automatizar pruebas, lint, build y auditoría; verificar el historial de secretos |
| No indicada | T14   | El desarrollador reporta que el proyecto Vercel `looney-ai-chat/papelcorpsac` fue creado y vinculado localmente durante T07.1; no se desplegó Papelcorpsac a producción ni se activó integración automática con GitHub | Avance de configuración externa reportado; T14 pendiente | Reutilizar el proyecto en el despliegue formal y completar configuración por entorno, publicación y verificaciones de producción |

No registrar pruebas o configuraciones inexistentes.
