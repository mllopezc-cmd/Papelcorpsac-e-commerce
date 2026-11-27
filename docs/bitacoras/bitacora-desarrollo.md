# Bitácora de desarrollo — Papelcorpsac

**Proyecto Integrador 5 | Desarrollo de Aplicaciones Web**

[Índice de bitácoras](README.md) · [README principal](../../README.md) · [Bitácora de IA](bitacora-ia.md)

## 1. Propósito y método

Este documento sintetiza los hitos de Papelcorpsac desde su preparación hasta su documentación académica. Las fechas y los resultados se basan en el historial registrado en [`PROJECT.md`](../PROJECT.md) y [`TASKS.md`](../TASKS.md), complementado con los resultados de Git, GitHub Actions y Vercel mostrados por el desarrollador.

Se distingue entre **implementación**, **verificación local**, **integración con servicios reales** y **verificación en Production**. Las actividades no ejecutadas no se presentan como completadas.

## 2. Registro cronológico

### Entrada 01 — 05/11/2026 | T00–T03: preparación y base técnica

**Actividad:** creación de la documentación inicial, configuración del proyecto React con TypeScript y Vite, diseño responsive con Tailwind CSS, navegación y preparación de Firebase.

**Decisiones:** utilizar React 19, una SPA con componentes reutilizables y una identidad corporativa sobria para PAPEL CORP. Separar la configuración local y las credenciales del código publicado.

**Evidencia:** archivos de configuración, dependencias, estructura inicial y verificaciones registradas en `PROJECT.md` y `TASKS.md`.

**Alcance:** las tareas iniciales sin evidencia explícita permanecen diferenciadas en el seguimiento histórico.

### Entrada 02 — 06/11/2026 | T04: autenticación y roles

**Actividad:** implementación de registro, inicio y cierre de sesión, autenticación con Google, persistencia y protección de rutas por roles.

**Decisión:** distinguir Customer de Admin mediante perfiles y controles de acceso, evitando basar la seguridad exclusivamente en la navegación visible.

**Evidencia:** implementación y pruebas documentadas durante T04. El registro de usuarios se comprobó en etapas anteriores; no se repitió específicamente en el recorrido principal de Production de T14.

### Entrada 03 — 10/11/2026 | T05–T06: catálogo y carrito

**Actividad:** catálogo de 60 productos, clasificación por categorías, búsqueda, filtros, favoritos, paginación y carrito con gestión de cantidades.

**Decisión:** utilizar Context API y `useReducer` para las acciones del carrito y mantener los datos comerciales del catálogo en Firestore.

**Evidencia:** seguimiento funcional de T05, commit `51244e6` y pruebas registradas durante el desarrollo.

### Entrada 04 — 10–11/11/2026 | T07: checkout y transacciones

**Actividad:** endpoints protegidos, validación de solicitudes, creación transaccional de órdenes, control de stock, idempotencia e integración con React.

**Decisión:** calcular y verificar la operación comercial del lado del servidor; el frontend no decide unilateralmente los precios ni modifica existencias.

**Evidencia:** pruebas unitarias y de integración con Firebase Emulator Suite. La verificación integral de T07 reportó 264 pruebas aprobadas y ocho de integración ejecutadas satisfactoriamente por separado.

**Límite:** estos resultados correspondían al entorno de desarrollo, no todavía a Production.

### Entrada 05 — 11/11/2026 | T08–T09: historial y S3 privado

**Actividad:** historial de órdenes por Customer, reglas de lectura por propietario y preparación de la infraestructura AWS S3.

**Decisiones:** restringir la lectura de órdenes al dueño y conservar el bucket privado, con permisos IAM mínimos y URLs prefirmadas como mecanismo de acceso a objetos.

**Evidencia:** pruebas con dos usuarios de emulador; lectura cruzada denegada; configuración AWS verificada; comprobación STS HTTP 200.

**Límite:** la prueba STS de T09 verificó identidad, no operaciones reales PUT, GET o DELETE. Dichas operaciones se probaron después.

### Entrada 06 — 17–20/11/2026 | T10: administración e imágenes

**Actividad:** panel administrativo, CRUD de productos, reglas de autorización, subida de imágenes y endpoints S3 para PUT, GET y DELETE.

**Decisiones:** mantener separación entre Firestore (documentos) y S3 (objetos); almacenar `imageKey` en Firestore; impedir la eliminación administrativa de objetos referenciados por productos.

**Evidencia:** pruebas automatizadas del panel y los servicios, controles de permisos en emuladores, integración real AWS/Firebase documentada el 20/11/2026 y verificación responsive.

**Criterio de conservación:** borrar un producto no elimina automáticamente su imagen de S3. Esta retención es intencional y requiere limpieza posterior controlada si la imagen deja de utilizarse.

### Entrada 07 — 20–21/11/2026 | T11: administración de órdenes

**Actividad:** consulta y filtrado de pedidos, autorización administrativa y cambio controlado del estado de las órdenes.

**Decisión:** mantener el importe y el detalle comercial histórico como datos no editables desde el panel; permitir únicamente las transiciones autorizadas de estado.

**Evidencia:** pruebas con Firebase Emulator, cambio de `pending` a `processing`, orden de prueba, checkout HTTP 201 y descenso de stock de cinco a cuatro unidades.

**Límite:** esta modificación de estado se verificó antes del despliegue público, no durante el recorrido principal de T14 en Production.

### Entrada 08 — 24/11/2026 | T12–T13: calidad e integración continua

**Actividad:** ampliación de pruebas, controles de tipos, análisis de dependencias, build e implementación de GitHub Actions.

**Decisión:** separar las pruebas con emuladores de la suite general y mantener CI reproducible con Node.js 24.

**Evidencia:** T12 reportó 634 pruebas generales aprobadas, 33 pruebas de emuladores aprobadas por separado y cobertura de líneas del 86,35 %. T13 implementó CI y obtuvo ejecuciones satisfactorias.

**Límite:** un workflow exitoso no equivale a probar AWS S3, Firebase real o Vercel Production.

### Entrada 09 — 27/11/2026 | T14: despliegue y verificación pública

**Actividad:** comprobación de los recorridos principales de Customer y Admin, checkout simulado con Firestore real, operaciones S3 y limpieza de registros temporales.

**Evidencia:** producto de prueba publicado, orden `pending` por S/ 1.00, inventario de tres a dos unidades, consulta de la orden por ambos roles, PUT/GET/DELETE de imágenes según los casos permitidos, retorno a 60 productos y S3 sin objetos actuales tras la limpieza. Vercel mostró `Ready` para el commit `1a2b4b4` y GitHub Actions #12 finalizó satisfactoriamente.

**Limitaciones declaradas:** registro no repetido en Production; no se ejecutó una prueba de cambio de estado de orden allí; no se inspeccionaron independientemente las firmas HTTP GET.

### Entrada 10 — 27/11/2026 | T15: README profesional y bitácoras

**Actividad:** sustitución de la plantilla genérica de Vite por documentación académica y técnica. Se publicó `README.md` mediante el commit `b38c49f`, con GitHub Actions #13 en estado `Success`: 41 archivos de prueba aprobados, 659 pruebas aprobadas y 39 omitidas.

**Decisión documental:** conservar `docs/PROJECT.md` y `docs/TASKS.md` como antecedentes técnicos e incorporar la documentación narrativa en `docs/bitacoras/`, con enlaces de ida y vuelta desde el README principal.

**Estado:** la propuesta de organización de las bitácoras se presenta para revisión; su incorporación efectiva al repositorio se verificará en Git antes de considerarla publicada.

## 3. Síntesis de resultados

El proyecto cuenta con una aplicación de demostración desplegada, roles diferenciados, catálogo, carrito, checkout simulado, órdenes, panel de administración, integración privada S3 y controles automatizados de calidad.

Los resultados de cada etapa se interpretan dentro del entorno donde fueron obtenidos. Las verificaciones funcionales de Production de T14 y las comprobaciones automatizadas de CI #13 son evidencias complementarias, no equivalentes.

## 4. Fuentes y trazabilidad

- [PROJECT.md](../PROJECT.md): arquitectura, decisiones y pruebas.
- [TASKS.md](../TASKS.md): cronología detallada, tareas y evidencias.
- [GitHub Actions](https://github.com/mllopezc-cmd/Papelcorpsac-e-commerce/actions): ejecución de workflows.
- [Repositorio](https://github.com/mllopezc-cmd/Papelcorpsac-e-commerce): commits y archivos publicados.
- [Production](https://papelcorpsac.vercel.app/): demostración pública.

---

[Volver al índice de bitácoras](README.md) · [Volver al README principal](../../README.md) · [Consultar bitácora de IA](bitacora-ia.md)
