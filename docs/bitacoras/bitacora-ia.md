# Bitácora de uso de inteligencia artificial — Papelcorpsac

**Proyecto Integrador 5 | Desarrollo de Aplicaciones Web**

[Índice de bitácoras](README.md) · [README principal](../../README.md) · [Bitácora de desarrollo](bitacora-desarrollo.md)

## 1. Objetivo y alcance

Documentar el empleo de herramientas de inteligencia artificial como apoyo durante el desarrollo, revisión, pruebas y documentación de Papelcorpsac. El propósito es transparentar **qué problema se abordó, qué criterio técnico se obtuvo, qué decisión se adoptó y cómo se verificó**.

Este documento reúne **siete entradas basadas en hechos registrados** en [`PROJECT.md`](../PROJECT.md), [`TASKS.md`](../TASKS.md) y en los resultados comunicados durante el desarrollo. Las descripciones de consulta son **síntesis del tema trabajado, no citas textuales de prompts**. No se atribuyen a la IA comandos, despliegues, accesos a consolas ni pruebas que realizó manualmente el desarrollador.

De acuerdo con el seguimiento histórico, se utilizó inicialmente Copilot en tareas de implementación asistida y, desde T07.2-B, el trabajo continuó con edición manual en VS Code y asistencia técnica mediante el chat. Desde T08 las revisiones se realizaron en el chat.

## 2. Registro de intervenciones

### Entrada 01 — 05/11/2026 | T02: interfaz, componentes y navegación

**Consulta o necesidad:** organizar una aplicación React responsive con navegación pública, componentes reutilizables e identidad visual PAPEL CORP.

**Apoyo de IA registrado:** asistencia para estructurar la interfaz y preparar la navegación, según la asignación de T02 a implementación asistida en el plan de trabajo.

**Aprendizaje técnico:** una arquitectura de componentes reutilizables y un sistema visual coherente reducen duplicaciones y facilitan la evolución de las vistas.

**Decisión adoptada:** utilizar Tailwind CSS 4, React Router, estilos corporativos y un enfoque mobile-first.

**Verificación o evidencia:** implementación y comprobaciones de T02 registradas en `PROJECT.md` y `TASKS.md`.

**Límite:** no se reproduce un prompt literal ni se atribuyen a la IA las comprobaciones realizadas por el desarrollador.

### Entrada 02 — 10–11/11/2026 | T07: checkout protegido

**Consulta o necesidad:** diseñar el flujo de compra simulada con validación de datos, control de inventario y prevención de registros duplicados.

**Apoyo de IA registrado:** análisis de alternativas de validación y de los pasos de implementación, así como propuesta de pruebas para servicios y endpoints.

**Aprendizaje técnico:** no basta con validar el carrito en React. El servidor debe recalcular y verificar los datos comerciales, y la persistencia requiere operaciones consistentes.

**Decisión adoptada:** ejecutar validaciones en servidor, usar transacciones de Firestore para la orden y el inventario e incorporar idempotencia.

**Verificación o evidencia:** pruebas unitarias y pruebas de integración con Firebase Emulator Suite documentadas en T07; ocho pruebas integradas ejecutadas por separado de la suite general.

**Límite:** estas pruebas iniciales correspondieron a un entorno local; la verificación pública se registró después en T14.

### Entrada 03 — 17/11/2026 | T10.3: CRUD y autorización administrativa

**Consulta o necesidad:** incorporar creación, edición y eliminación de productos sin debilitar las reglas de Firestore ni exponer operaciones de Admin a Customer.

**Apoyo de IA registrado:** revisión de la arquitectura del CRUD, validaciones de formularios, autorizaciones y casos de prueba del servicio.

**Aprendizaje técnico:** ocultar rutas o botones no constituye una autorización efectiva; las reglas de Firestore deben restringir las escrituras.

**Decisión adoptada:** proteger `/admin/productos`, exigir el rol `admin` en las reglas y validar los datos comerciales antes de persistirlos.

**Verificación o evidencia:** 13 pruebas de servicio, 15 comprobaciones de permisos, cuatro verificaciones de precios y recorrido CRUD en el emulador; publicación del código mediante el commit `cac3b48`.

**Límite:** la verificación descrita corresponde a T10.3; las comprobaciones posteriores con servicios reales pertenecen a las siguientes subtareas de T10.

### Entrada 04 — 18–20/11/2026 | T10.4: imágenes privadas AWS S3

**Consulta o necesidad:** integrar subida, consulta y eliminación segura de imágenes de productos sin hacer público el bucket y sin exponer credenciales AWS.

**Apoyo de IA registrado:** análisis de endpoints, validaciones de imagen, firma temporal de URLs, autorización de Admin y pruebas de los distintos servicios.

**Aprendizaje técnico:** una referencia permanente de Firestore (`imageKey`) debe distinguirse de una URL prefirmada temporal; las operaciones PUT, GET y DELETE requieren políticas de acceso específicas.

**Decisión adoptada:** mantener el bucket privado, almacenar la clave del objeto en el producto y rechazar desde la aplicación la eliminación de un archivo que continúe asociado a un producto.

**Verificación o evidencia:** pruebas de backend y frontend, reglas en emuladores, firma del SDK y pruebas PUT/GET/DELETE reales con Firebase y AWS reportadas el 20/11/2026. Las etapas históricas se distinguen en `PROJECT.md`.

**Límite:** la ausencia de borrado automático de una imagen al eliminar el producto es una decisión deliberada. La limpieza de archivos sin uso sigue siendo una operación controlada.

### Entrada 05 — 20–21/11/2026 | T11: órdenes administrativas

**Consulta o necesidad:** permitir consultas y cambios autorizados de estado en las órdenes sin modificar datos comerciales históricos ni exponer órdenes ajenas.

**Apoyo de IA registrado:** revisión de servicios, controles de rol, componentes de administración y pruebas con perfiles distintos.

**Aprendizaje técnico:** la visualización de una orden y el permiso para modificar su estado son operaciones distintas; deben verificarse explícitamente.

**Decisión adoptada:** conservar los detalles e importes de la orden como datos de solo lectura y restringir las actualizaciones autorizadas de estado al administrador.

**Verificación o evidencia:** pruebas del servicio y de las reglas, comprobaciones con emuladores y cambio de `pending` a `processing` durante T11.4.

**Límite:** el cambio de estado anterior fue local; en la verificación principal de Production de T14 se comprobó la visibilidad de la orden, pero no se realizó ese cambio.

### Entrada 06 — 24/11/2026 | T12–T13: pruebas y CI

**Consulta o necesidad:** ampliar los controles de calidad, evaluar resultados de cobertura, distinguir las pruebas omitidas y establecer verificaciones automatizadas antes de publicar cambios.

**Apoyo de IA registrado:** revisión de casos de prueba, diagnóstico de advertencias y apoyo en la organización del workflow de CI.

**Aprendizaje técnico:** una suite exitosa no demuestra por sí sola el funcionamiento de servicios externos; además, las pruebas omitidas deben reportarse por separado de las aprobadas.

**Decisión adoptada:** mantener pruebas de emuladores diferenciadas, ejecutar controles de lint, tipos y build, y automatizar la verificación mediante GitHub Actions.

**Verificación o evidencia:** T12 reportó 634 pruebas generales aprobadas, 33 de emuladores aprobadas por separado y cobertura de líneas de 86,35 %. T13 incorporó CI y se observaron ejecuciones satisfactorias.

**Límite:** los resultados son los reportados para esas etapas; no se equiparan a una auditoría independiente de seguridad o rendimiento en Production.

### Entrada 07 — 27/11/2026 | T14–T15: evidencia pública y documentación

**Consulta o necesidad:** diferenciar el cierre funcional de Production de las pruebas previas, redactar un README técnico profesional y organizar las bitácoras sin mezclarlas con el código.

**Apoyo de IA registrado:** acompañamiento en la interpretación de resultados de Git, GitHub Actions y Vercel; propuesta de contenido y estructura documental; revisión de diferencias entre hechos comprobados y pruebas no repetidas.

**Aprendizaje técnico:** la documentación técnica es más confiable cuando identifica el entorno, el alcance y los límites de cada evidencia. Un archivo README debe facilitar el acceso inmediato al sistema y enlazar a la documentación detallada.

**Decisión adoptada:** sustituir la plantilla Vite por un README académico, destacar Production y separar las bitácoras en `docs/bitacoras/` con navegación bidireccional.

**Verificación o evidencia:** commit `b38c49f` publicado en `main`, GitHub Actions #13 en estado `Success` con 659 pruebas aprobadas y 39 omitidas; verificación manual de T14 registrada con Firestore y S3 reales.

**Límite:** el commit anterior publicó el README antes de esta ampliación documental. La creación de las bitácoras y la revisión del nuevo encabezado deben verificarse localmente antes de su futura publicación.

## 3. Responsabilidades y validación humana

El uso de IA no sustituyó las siguientes responsabilidades del desarrollador:

- Autorizar cambios en el proyecto y tomar las decisiones finales.
- Gestionar credenciales, permisos e infraestructura Firebase, AWS y Vercel.
- Ejecutar comandos, pruebas, commits y despliegues y comprobar sus resultados.
- Revisar que la documentación describa únicamente hechos respaldados.
- Diferenciar recomendaciones de IA de implementaciones realmente ejecutadas.

No se incluyen conversaciones privadas ni claves. Para una entrega que solicite **prompts textuales**, se deberá recuperar el texto exacto de las conversaciones originales y añadirlo con su contexto, sin reconstruirlo de memoria.

## 4. Fuentes de trazabilidad

- [PROJECT.md](../PROJECT.md): historial de arquitectura, decisiones, pruebas y seguridad.
- [TASKS.md](../TASKS.md): responsables, actividades y criterios de aceptación.
- [Bitácora de desarrollo](bitacora-desarrollo.md): cronología general.
- [Historial de commits](https://github.com/mllopezc-cmd/Papelcorpsac-e-commerce/commits/main/): publicación de cambios.
- [GitHub Actions](https://github.com/mllopezc-cmd/Papelcorpsac-e-commerce/actions): controles automatizados.

---

[Volver al índice de bitácoras](README.md) · [Volver al README principal](../../README.md) · [Consultar bitácora de desarrollo](bitacora-desarrollo.md)
