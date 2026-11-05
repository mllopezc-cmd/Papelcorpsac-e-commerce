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
- [ ] Inicializar React + TypeScript con Vite.
- [ ] Verificar React 19 y React DOM compatibles.
- [ ] Revisar versiones estables de las dependencias.
- [ ] Instalar dependencias.
- [ ] Conservar package-lock.json.
- [ ] Ejecutar npm run dev.
- [ ] Ejecutar npm run build.
- [ ] Ejecutar npm audit.
- [ ] Revisar vulnerabilidades moderadas, altas y críticas.

Aceptación:

La aplicación base funciona, las versiones son compatibles y los hallazgos de seguridad han sido evaluados.

No copiar overrides anteriores preventivamente.
No utilizar actualizaciones forzadas sin justificación.

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

- [ ] Implementar registro y login.
- [ ] Implementar logout.
- [ ] Mantener persistencia de sesión.
- [ ] Implementar AuthContext y useAuth.
- [ ] Proteger rutas autenticadas.
- [ ] Restringir rutas administrativas.
- [ ] Gestionar carga del rol y errores.

MANUAL:

- [ ] Configurar el primer usuario administrador.

Aceptación:

Ambos métodos de autenticación funcionan.
Customer y admin tienen permisos diferenciados.
No existe autoasignación de privilegios.
Las reglas de Firestore respaldan las restricciones.

## 6. Catálogo y carrito

### T05 — Implementar catálogo

Responsable: COPILOT
Dependencias: T02, T03

- [ ] Consultar productos desde Firestore.
- [ ] Mostrar listado y tarjetas reutilizables.
- [ ] Filtrar por categoría.
- [ ] Buscar por nombre con debounce.
- [ ] Mostrar detalle de producto.
- [ ] Gestionar estados de carga, vacío y error.
- [ ] Verificar diseño responsive.

Aceptación:

El catálogo funciona correctamente en móvil y escritorio y respeta la identidad visual de Papelcorpsac.

La carga de datos demostrativos en Firestore requiere autorización del desarrollador.

### T06 — Implementar carrito

Responsable: COPILOT
Dependencia: T05

- [ ] Implementar CartContext.
- [ ] Implementar cartReducer.
- [ ] Implementar useCart.
- [ ] Agregar y eliminar productos.
- [ ] Actualizar cantidades.
- [ ] Calcular totales.
- [ ] Mantener el carrito durante la navegación.
- [ ] Incorporar persistencia local aprobada.
- [ ] Probar las acciones del reducer.

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
- [ ] Probar todas las acciones de cartReducer.
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

- [ ] Crear repositorio del proyecto.
- [ ] Revisar .gitignore.
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

## 10. Seguimiento

Tarea activa: Ninguna.

T00 — Documentación inicial: COMPLETADA.

T01 — Inicializar React, TypeScript y Vite: COMPLETADA.

T02 — Tailwind CSS, componentes y navegación: COMPLETADA.

T03 — Configurar Firebase: COMPLETADA.

Próxima tarea: T04 — Implementar autenticación y roles.

Bloqueos: Ninguno registrado.

Registro de avances:

| Fecha      | Tarea | Evidencia                                                                        | Resultado  | Pendiente |
| ---------- | ----- | -------------------------------------------------------------------------------- | ---------- | --------- |
| 2026-11-05 | T00   | Documentos guardados; Reviewer y Skill reconocidos                               | Completada | Ninguno   |
| 2026-11-05 | T01   | React y Vite funcionando; lint y build correctos; npm audit sin vulnerabilidades | Completada | Ninguno   |
| 2026-11-05 | T02   | Tailwind CSS 4 con Vite; React Router y navegación pública; identidad PAPEL CORP y diseño responsive; modos claro/oscuro con persistencia; accesibilidad y contraste revisados; `npm run lint` y `npm run build` satisfactorios; `npm audit`: cero vulnerabilidades; Reviewer: APROBADO | Completada | Ninguno |
| 2026-11-05 | T03   | Proyecto Firebase `papelcorpsac`; Firestore `(default)` en `us-east1`, modo producción y reglas iniciales de denegación; Authentication con correo/contraseña y Google; app web Papelcorpsac-web registrada; `.env` con seis variables verificadas sin mostrar valores; `.env.example` con seis nombres vacíos; `.gitignore` ignora `.env` y permite `.env.example`; `git status --short`: únicamente `?? .env.example` | Completada | Ninguno |

No registrar pruebas o configuraciones inexistentes.
