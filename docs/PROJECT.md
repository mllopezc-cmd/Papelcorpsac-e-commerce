# Papelcorpsac — Proyecto Integrador 5

## 1. Descripción y objetivo

**Nombre del proyecto:** Papelcorpsac
**Identidad visual:** PAPEL CORP
**Rubro:** Papelería, instrumentos de escritura y artículos de oficina.
**Tipo:** Single Page Application (SPA) de comercio electrónico.
**Ubicación de desarrollo:** D:/Papelcorpsac
**Moneda:** Soles peruanos (PEN).

Papelcorpsac es un proyecto académico que busca desarrollar, testear y desplegar una aplicación de comercio electrónico
funcional, responsive y segura.

La aplicación contará con dos roles:

- **Customer:** podrá explorar productos, gestionar el carrito, simular compras y consultar sus órdenes.
- **Admin:** podrá administrar productos, imágenes y órdenes mediante un panel protegido.

El objetivo es cumplir los requisitos del Proyecto Integrador 5 con una solución sencilla, mantenible y fácil de explicar
durante su presentación.

## 2. Fuentes de referencia

El desarrollo seguirá este orden de prioridad:

1. **Consigna oficial del Proyecto Integrador 5:** establece los requisitos funcionales, técnicos y de evaluación.
2. **Guía de desarrollo del Proyecto Integrador 5:** orienta las etapas, buenas prácticas y criterios de verificación.
3. **Repositorio del docente:** proporciona ejemplos y explicaciones de los conceptos trabajados.
   https://github.com/HX-ARomero/m5-front-demo
4. **Documentación oficial de las tecnologías:** se utilizará para comprobar instalaciones, compatibilidad y prácticas
   técnicas vigentes.

Los materiales del docente serán referencias de aprendizaje, no código que deba copiarse automáticamente.

Las mejoras propias se incorporarán cuando aporten valor sin sustituir requisitos obligatorios ni generar complejidad
innecesaria.

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

Por decisión del desarrollador, se utilizará React 19 y versiones estables actuales de las demás herramientas,
siempre que sean compatibles entre sí.

La consigna original menciona React 18. Esta diferencia deberá validarse con el docente antes de la entrega.

No se instalarán versiones experimentales ni dependencias adicionales sin una necesidad justificada.

Las versiones exactas se definirán y comprobarán durante la instalación inicial, no anticipadamente en este documento.

## 4. Identidad visual y experiencia de usuario

Papelcorpsac adoptará una identidad corporativa premium, inspirada en la referencia visual proporcionada por
el desarrollador.

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

Posteriormente se aprobó ampliar el catálogo a 60 productos en soles peruanos (PEN): doce principales y 48
demostrativos, distribuidos en las mismas cuatro categorías con 15 productos por categoría. Los doce productos
principales conservan sus imágenes reales; los 48 adicionales utilizan una imagen demostrativa SVG local. El código
local contiene los datos de seed. El seguimiento reporta que los 60 productos se publicaron en Firestore; ese estado
remoto no se verifica mediante la lectura del repositorio.

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

La organización inicial seguirá preferentemente un enfoque por capas, como el explicado en
el repositorio del docente.

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
- Verificar en servidor los Firebase ID tokens mediante Firebase Admin SDK. Derivar el UID exclusivamente del token
  verificado; no confiar en estados de React, localStorage ni identificadores enviados por el cliente.
- No confiar en precios ni stock enviados por el navegador. Obtener productos, precios vigentes y disponibilidad
  desde Firestore antes de procesar la compra.
- Simular el pago, sin efectuar cobros reales.
- Crear cada orden con estado inicial `pending`; conservar los estados `processing`, `completed` y `cancelled`
  definidos en este documento.
- Crear la orden y descontar el stock dentro de una transacción atómica.
- Aplicar idempotencia para evitar órdenes duplicadas por reintentos.
- Vaciar el carrito únicamente después de confirmar la creación de la orden.

Estas son decisiones de diseño aprobadas para T07; no describen funcionalidades implementadas.

### Autenticación de servidor y entornos (T07.2)

- Utilizar Firebase Authentication Emulator solo en desarrollo local, con el proyecto de demostración
  `demo-papelcorpsac` y host `127.0.0.1:9099`.
- Rechazar cualquier configuración del emulador en Vercel Preview y Production.
- Para un endpoint de diagnóstico, verificar tokens con `verifyIdToken(token)`. Para futuras operaciones sensibles
  de creación de órdenes, usar `verifyIdToken(token, true)` para comprobar revocación.
- Mantener separadas las variables públicas `VITE_*` del frontend y los secretos de servidor.
- La configuración de credenciales reales de servidor en Vercel queda pendiente de la etapa correspondiente; no
  almacenar secretos en el repositorio ni exponerlos al cliente.
- Reutilizar los módulos de servidor de verificación y autenticación en la implementación definitiva del checkout.
- Actualmente `firebase-admin@14.5.0` figura en `devDependencies` y no está integrado en la API. Su ubicación como
  dependencia de runtime, así como la gestión segura de credenciales, se evaluarán antes de implementar T07.2-B.

### Seguridad de dependencias

Se utilizarán versiones estables y compatibles.

Después de instalar o actualizar dependencias, se revisarán las vulnerabilidades conocidas,
especialmente las moderadas, altas y críticas.

Las correcciones deberán preservar la compatibilidad y superar las verificaciones del proyecto.

No se utilizarán overrides ni actualizaciones forzadas sin identificar primero el problema que deben resolver.

Los procedimientos y resultados de auditoría se registrarán durante las tareas correspondientes.

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

**GitHub Copilot:**

- Desarrollar funcionalidades autorizadas.
- Implementar componentes y servicios.
- Aplicar el diseño visual aprobado.
- Crear y ejecutar pruebas pertinentes.
- Proponer correcciones y mejoras justificadas.

**Reviewer:**

- Revisar código y requisitos.
- Detectar errores y riesgos.
- Identificar sobreingeniería.
- Informar resultados sin modificar archivos.

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
- Las dependencias hayan sido revisadas.
- La aplicación esté desplegada y accesible.
- El README contenga la documentación técnica y la bitácora de IA requerida.

El desarrollo seguirá el principio de cumplir los requisitos con la menor complejidad razonable,
sin sacrificar funcionalidad, calidad ni seguridad.
