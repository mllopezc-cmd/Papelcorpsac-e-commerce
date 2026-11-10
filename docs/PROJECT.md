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

- React y React DOM.
- TypeScript.
- Vite.
- React Router.
- Tailwind CSS.
- Context API y useReducer.

### Backend y servicios

- Firebase Authentication.
- Cloud Firestore.
- AWS S3.
- Vercel Serverless Functions.

### Testing

- Vitest.
- React Testing Library.

### Control de versiones y despliegue

- Git y GitHub.
- Integración continua.
- Vercel.

### Política de versiones

Por decisión del desarrollador, se utilizará React 19 y versiones estables actuales de las demás herramientas, siempre que sean compatibles entre sí.

La consigna original menciona React 18. Esta diferencia deberá validarse con el docente antes de la entrega.

No se instalarán versiones experimentales ni dependencias adicionales sin una necesidad justificada.

Las versiones exactas se definirán y comprobarán durante la instalación inicial, no anticipadamente en este documento.

## 4. Identidad visual y experiencia de usuario

Papelcorpsac adoptará una identidad corporativa premium, inspirada en la referencia visual proporcionada por el desarrollador.

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

Se utilizarán variantes adecuadas para los modos claro y oscuro.

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

Tailwind CSS se integrará después de inicializar correctamente React, Vite y TypeScript.

La implementación visual priorizará la reutilización y evitará efectos decorativos innecesarios.

## 5. Catálogo y funcionalidades

### Catálogo previsto inicialmente

El alcance inicial contemplaba un catálogo demostrativo de doce productos distribuidos en cuatro categorías:

- Instrumentos de escritura.
- Papelería.
- Artículos de oficina.
- Accesorios de escritorio.

Los productos, precios y existencias son demostrativos.

### Estado implementado del catálogo

Posteriormente se aprobó ampliar el catálogo a 60 productos en soles peruanos (PEN): doce principales y 48 demostrativos, distribuidos en las mismas cuatro categorías con 15 productos por categoría.

Los doce productos principales conservan sus imágenes reales; los 48 adicionales utilizan una imagen demostrativa SVG local. El código local contiene los datos de seed.

El seguimiento reporta que los 60 productos se publicaron en Firestore; ese estado remoto no se verifica mediante la lectura del repositorio.

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
- Paginación local de doce productos por página, con navegación compacta en móviles.
- Diseño responsive consistente con la identidad visual de PAPEL CORP.

### Carrito

- Agregar productos.
- Eliminar productos.
- Actualizar cantidades.
- Calcular el total automáticamente.
- Compartir el estado mediante Context API y useReducer.

Como mejora de experiencia, se podrá conservar el carrito al recargar la aplicación.

### Checkout y órdenes

- Revisar el carrito.
- Simular el pago sin pasarela real.
- Confirmar la compra.
- Registrar órdenes en Firestore.
- Consultar historial y detalle de órdenes.

Estados obligatorios:

- pending
- processing
- completed
- cancelled

### Panel administrativo

- Acceso protegido para admin.
- Layout diferenciado del cliente.
- CRUD completo de productos.
- Subida de imágenes a AWS S3.
- Consulta de todas las órdenes.
- Filtro por estado.
- Actualización autorizada de estados.

## 6. Arquitectura y reutilización

Se utilizará una arquitectura sencilla con separación clara de responsabilidades.

Principios generales:

- Componentes reutilizables con props tipadas.
- Composición mediante children cuando corresponda.
- Navegación SPA con React Router.
- Layouts diferenciados para cliente y administrador.
- Contextos separados para autenticación y carrito.
- useReducer para gestionar las acciones del carrito.
- Hooks para lógica React reutilizable.
- Servicios para interactuar con Firebase y AWS.

La organización inicial seguirá preferentemente un enfoque por capas, como el explicado en el repositorio del docente.

La estructura concreta de carpetas se definirá después de instalar React y conforme aparezcan necesidades reales.

No se crearán componentes, abstracciones ni directorios innecesarios.

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

### Decisiones aprobadas para checkout (pendientes de implementación)

- Utilizar Vercel Serverless Functions como backend de las operaciones de checkout.
- Verificar en servidor los Firebase ID tokens mediante Firebase Admin SDK. Derivar el UID exclusivamente del token verificado; no confiar en estados de React, localStorage ni identificadores enviados por el cliente.
- No confiar en precios ni stock enviados por el navegador. Obtener productos, precios vigentes y disponibilidad desde Firestore antes de procesar la compra.
- Simular el pago, sin efectuar cobros reales.
- Crear cada orden con estado inicial `pending`; conservar los estados `processing`, `completed` y `cancelled` definidos en este documento.
- Crear la orden y descontar el stock dentro de una transacción atómica.
- Aplicar idempotencia para evitar órdenes duplicadas por reintentos.
- Vaciar el carrito únicamente después de confirmar la creación de la orden.

Estas son decisiones de diseño aprobadas para T07. La infraestructura y la verificación reutilizable de autenticación disponen de avances implementados y validados localmente, pero el checkout, la creación de órdenes y el descuento de stock continúan pendientes.

### Autenticación de servidor y entornos (T07.2)

**Estado de T07.2-A:** Firebase Authentication Emulator configurado y verificado localmente para el proyecto ficticio `demo-papelcorpsac`, en `127.0.0.1:9099`. Commit publicado: `1a1b71337bbf80ab1ad2d8e457a2c335fb5327b2`.

**Estado de T07.2-B:** implementación y verificaciones locales realizadas; cierre y publicación pendientes por la evaluación de seguridad de dependencias y las comprobaciones finales.

Archivos implementados para T07.2-B:

- `server/firebaseAdmin.ts`: inicialización reutilizable de Firebase Admin y validación de configuración.
- `server/auth.ts`: extracción de Bearer token, verificación mediante Firebase Admin y obtención del UID verificado.
- `api/auth-check.ts`: endpoint de diagnóstico `GET /api/auth-check`.
- Pruebas unitarias correspondientes en `server/` y `api/`.

`firebase-admin@14.5.0` está declarado en `dependencies`, por ser necesario para las funciones de servidor, y se sincronizó `package-lock.json`.

Decisiones y restricciones:

- Utilizar Firebase Authentication Emulator únicamente para pruebas locales autorizadas, con el proyecto `demo-papelcorpsac` y host exacto `127.0.0.1:9099`.
- Exigir `PAPELCORPSAC_USE_AUTH_EMULATOR=true`, `FIREBASE_PROJECT_ID=demo-papelcorpsac` y `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` para activar el emulador.
- Rechazar el modo emulador cuando `NODE_ENV=production`, cuando `VERCEL_ENV` sea distinto de `development` o cuando existan marcadores Vercel sin identificar el entorno como `development`.
- Las variables de entorno no demuestran por sí solas una ejecución físicamente local. La configuración de Preview y Production deberá excluir las variables del emulador.
- Para el endpoint de diagnóstico, utilizar `verifyIdToken(token)`; para futuras operaciones sensibles de creación de órdenes, se prevé `verifyIdToken(token, true)` para comprobar revocación.
- Admitir JWT sin firma únicamente cuando la configuración validada autorice el Authentication Emulator. Fuera de ese modo, exigir firma no vacía. En todos los casos, Firebase Admin conserva la responsabilidad de verificar el token y sus claims.
- Mantener separadas las variables públicas `VITE_*` del frontend y la configuración privada del servidor.
- No almacenar secretos en el repositorio ni exponerlos al cliente.
- Mantener las credenciales reales del servidor y su configuración en Vercel como asuntos pendientes de la etapa correspondiente.
- Reutilizar los módulos de autenticación de servidor en el futuro checkout, sin implementar todavía operaciones comerciales.

Evidencia de T07.2-B reportada por el desarrollador:

- `npm.cmd run typecheck:api`: satisfactorio.
- `npm.cmd run test`: 89 de 89 pruebas aprobadas.
- `npm.cmd run lint`: satisfactorio.
- `npm.cmd run build`: satisfactorio, con advertencia no bloqueante de chunk JavaScript superior a 500 kB.
- `GET /api/auth-check` sin token: HTTP 401.
- Token válido de `demo-papelcorpsac`: HTTP 200, `{"authenticated":true}`.
- JWT ficticio: HTTP 401.
- Token emitido por un segundo emulador para `demo-other-project`, con audiencia y emisor previamente comprobados: HTTP 401.
- `git diff --check`: sin errores reportados.

Las pruebas se realizaron con emuladores y Vercel local. No equivalen a validación de un despliegue real en Vercel Preview o Production.

### Seguridad de dependencias

Se utilizarán versiones estables y compatibles.

Después de instalar o actualizar dependencias, se revisarán las vulnerabilidades conocidas, especialmente las moderadas, altas y críticas.

Las correcciones deberán preservar la compatibilidad y superar las verificaciones del proyecto.

No se utilizarán overrides ni actualizaciones forzadas sin identificar primero el problema que deben resolver.

Los procedimientos y resultados de auditoría se registrarán durante las tareas correspondientes.

**Hallazgo vigente de T07.2-B — 10 de noviembre de 2026:**

- `npm audit` y `npm audit --omit=dev` reportaron cinco alertas moderadas, sin hallazgos altos ni críticos reportados.
- La cadena está relacionada con `glob@10.5.0`, `rimraf@5.0.10`, `google-gax@5.0.8`, `gaxios@7.1.3` y `gcp-metadata@8.1.4`, dentro de dependencias transitivas opcionales de Firestore asociadas a Firebase Admin.
- El aviso principal es `GHSA-3g3m-2fjr-6pw4`, sobre la cancelación de operaciones de recorrido de archivos.
- El endpoint actual de autenticación importa `firebase-admin/app` y `firebase-admin/auth`, sin consultar Firestore. Esto limita la exposición funcional identificada, pero no demuestra que los paquetes vulnerables estén ausentes del artefacto de producción.
- La cadena sigue presente en el árbol auditado y no se considera corregida.
- No se aplicarán overrides de versiones mayores ni `npm audit fix --force` sin evidencia de compatibilidad y autorización expresa.

**Decisión aprobada:** se acepta temporalmente el riesgo identificado **solo para continuar el desarrollo y las verificaciones locales de T07.2-B**, usando proyectos de demostración y emuladores, sin credenciales productivas ni operaciones de escritura comercial.

Esta aceptación no es una corrección de seguridad, no elimina las alertas de npm y no autoriza despliegues.

**Condiciones de reevaluación obligatoria:**

- Antes de incorporar operaciones sensibles de Firestore para checkout y órdenes, evaluar nuevamente la cadena vulnerable y las alternativas compatibles.
- Antes de cualquier despliegue Vercel, revisar el árbol y el artefacto efectivo de producción, decidir y verificar la mitigación o corrección correspondiente, así como la configuración segura de credenciales y entornos.
- Ante nuevas versiones compatibles o cambios en los avisos de seguridad, repetir las auditorías y las pruebas pertinentes.

La autorización de commit y push deberá evaluarse por separado, tras las verificaciones finales, el control de archivos y la confirmación de ausencia de secretos.

## 8. Testing y despliegue

### Testing

Se implementarán las pruebas exigidas por la consigna:

- Wrapper de providers para componentes con contextos.
- Tests de useAuth mediante renderHook.
- Tests de useCart mediante renderHook.
- Tests de las acciones de cartReducer.
- Tests de componentes importantes.
- Tests de integración del carrito y checkout.
- Mocks de Firebase y AWS.
- Casos límite analizados con apoyo de IA.

Las pruebas se incorporarán progresivamente durante el desarrollo.

### Despliegue

- Repositorio del proyecto en GitHub.
- Integración continua.
- Variables de entorno configuradas correctamente.
- Deploy mediante Vercel.
- URL pública funcional.
- Verificación de los recorridos customer y admin.
- Comprobación del funcionamiento en dispositivos móviles.

El despliegue de funciones de servidor permanece bloqueado mientras no se complete la evaluación y el tratamiento del riesgo de dependencias de producción. La integración local con emuladores no constituye evidencia de despliegue público.

## 9. Uso de IA y responsabilidades

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

No se inventarán evidencias ni reflexiones.

### Responsabilidades

**Desarrollador:**

- Inicializar el proyecto.
- Aprobar dependencias y versiones.
- Configurar Firebase, AWS y Vercel.
- Gestionar credenciales y permisos.
- Autorizar cambios sensibles y despliegues.
- Documentar el aprendizaje con IA.
- Tomar las decisiones finales.
- Ejecutar manualmente los comandos y comprobar los resultados en su equipo.

**Implementación asistida con IA:**

- Desarrollar únicamente funcionalidades autorizadas.
- Proponer componentes, servicios y código completo en el chat cuando se solicite modificar archivos.
- Aplicar el diseño visual aprobado.
- Proponer pruebas pertinentes.
- Explicar los cambios, riesgos y verificaciones necesarias.
- No afirmar que se ejecutaron comandos o pruebas sin evidencia del desarrollador.

GitHub Copilot se utilizó durante las etapas anteriores. A partir de T07.2-B, por agotamiento de los créditos del plan gratuito, el desarrollo continuará manualmente en VS Code con asistencia desde este chat, sin ZIP ni documentos descargables.

**Revisión técnica:**

- Revisar código y requisitos.
- Detectar errores y riesgos.
- Identificar sobreingeniería.
- Informar resultados sin modificar archivos durante una revisión de solo lectura.
- Distinguir la evidencia aportada por el desarrollador de las comprobaciones todavía pendientes.

El desarrollador conserva la responsabilidad de autorizar los cambios y ejecutarlos.

## 10. Alcance y criterios de finalización

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

El desarrollo seguirá el principio de cumplir los requisitos con la menor complejidad razonable, sin sacrificar funcionalidad, calidad ni seguridad.
