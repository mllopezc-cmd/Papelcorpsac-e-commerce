# Papelcorpsac — Instrucciones para GitHub Copilot

## 1. Contexto

Antes de trabajar:

- Leer docs/PROJECT.md.
- Consultar docs/TASKS.md.
- Identificar la tarea autorizada.
- Revisar los archivos existentes.

Prioridad de referencias:

1. Consigna oficial del Proyecto Integrador 5.
2. Guía de desarrollo del proyecto.
3. https://github.com/HX-ARomero/m5-front-demo
4. Documentación oficial actual.

El repositorio docente es una referencia de aprendizaje.
No copiar automáticamente sus implementaciones.

## 2. Alcance

Trabajar únicamente en Papelcorpsac.

- Cumplir los requisitos obligatorios.
- No agregar funcionalidades no solicitadas.
- Implementar una tarea aprobada a la vez.
- Respetar las decisiones registradas en PROJECT.md.
- No comenzar tareas posteriores sin autorización.
- No modificar archivos ajenos al cambio necesario.

## 3. Código y arquitectura

- Priorizar soluciones sencillas y legibles.
- Utilizar TypeScript con tipos claros.
- Reutilizar componentes existentes.
- Utilizar props tipadas y children cuando corresponda.
- Separar presentación, estado y servicios.
- Mantener AuthContext y CartContext independientes.
- Utilizar useReducer para el carrito.
- Utilizar React Router para navegación.
- Aplicar Tailwind CSS y mobile-first.
- Respetar la identidad visual de Papelcorpsac.

No crear abstracciones, dependencias o carpetas para necesidades hipotéticas.

No realizar refactorizaciones no relacionadas con la tarea aprobada.

## 4. Dependencias

- Utilizar React 19 según PROJECT.md.
- Mantener React y React DOM compatibles.
- Preferir versiones estables y compatibles.
- Verificar Node.js y requisitos de herramientas.
- Conservar package-lock.json.
- Revisar npm audit después de cambios.
- Investigar vulnerabilidades moderadas o superiores.
- Explicar el paquete afectado y la solución propuesta.
- No añadir overrides preventivos.
- No ejecutar npm audit fix --force automáticamente.
- No ignorar alertas sin informar al desarrollador.
- No instalar nuevas dependencias sin justificación.

Los cambios importantes de versiones requieren aprobación.

## 5. Seguridad

- No exponer credenciales privadas.
- No subir secretos a GitHub.
- Mantener .env fuera del control de versiones.
- No utilizar variables VITE\_ para secretos de servidor.
- Proteger roles y permisos mediante Firestore Rules.
- Proteger órdenes por propietario.
- No confiar en precios enviados por el navegador.
- Validar operaciones comerciales sensibles.
- Mantener credenciales AWS en servidor.
- Autorizar las solicitudes de URLs prefirmadas.

No debilitar la seguridad para facilitar pruebas.

## 6. Testing y calidad

- Escribir pruebas cuando aporten valor al requisito.
- Utilizar Vitest y React Testing Library.
- Probar hooks, reducers y componentes pertinentes.
- Crear pruebas de integración para flujos importantes.
- Mockear Firebase y AWS.
- Comprobar casos límite relevantes.
- Ejecutar verificaciones disponibles.
- No afirmar que algo funciona sin evidencia.

## 7. Operaciones reservadas al desarrollador

No realizar sin autorización:

- Inicializar o regenerar Vite.
- Crear proyectos Firebase.
- Configurar recursos AWS.
- Modificar credenciales y permisos externos.
- Configurar Vercel.
- Ejecutar operaciones destructivas.
- Realizar commits o push.
- Desplegar a producción.

Copilot puede implementar las integraciones dentro de tareas previamente autorizadas.

## 8. Forma de trabajo

Para cada tarea:

1. Leer los requisitos pertinentes.
2. Inspeccionar archivos existentes.
3. Explicar los cambios necesarios.
4. Solicitar aprobación cuando corresponda.
5. Implementar solamente lo autorizado.
6. Ejecutar pruebas relacionadas.
7. Informar resultados y limitaciones.
8. Actualizar TASKS.md con evidencia.
9. Detenerse.

El informe final debe indicar:

- Qué se modificó.
- Por qué era necesario.
- Qué se verificó.
- Qué riesgos o problemas permanecen.

## 9. Uso de IA

Ayudar a planificar, implementar, revisar y aprender.

No inventar resultados, prompts o pruebas.
La reflexión personal de la bitácora corresponde al desarrollador.

## Regla final

Cumplir la consigna con soluciones claras, reutilizables y seguras, evitando sobreingeniería.
