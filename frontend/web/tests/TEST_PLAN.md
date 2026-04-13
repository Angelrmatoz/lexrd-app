# Plan de Pruebas E2E - LexRD (Frontend Web)

Este documento detalla la estrategia y el progreso de las pruebas End-to-End (E2E) utilizando Playwright para la aplicación web de LexRD.

## Estrategia de Organización

Para mantener la mantenibilidad y claridad, las pruebas se dividirán en los siguientes archivos lógicos:

1. **`chat-core.spec.ts`**: Flujo principal, envío/recepción, animaciones (Typewriter, Pensando) y renderizado (Markdown, Fuentes).
2. **`chat-limits.spec.ts`**: Gestión de sesión, límite de mensajes (MAX_MESSAGES) y reseteo automático.
3. **`chat-errors.spec.ts`**: Resiliencia, manejo de errores del API (ej. 500) y fallbacks visuales.
4. **`chat-ui-scroll.spec.ts`**: Comportamiento de la interfaz, auto-scroll inteligente y responsividad.
5. **Auditoría de Rendimiento**: Tareas de optimización en componentes React (blur, inercia de scroll en Safari, layout thrashing por typewriter).

---

## 1. Flujo Principal de Chat (`chat-core.spec.ts`) - *Prioridad Crítica*

- [x] **Envío de mensaje y recepción de respuesta**: Verificar que un usuario pueda escribir en el `ChatInput`, enviarlo y que aparezca tanto su mensaje como la respuesta de la IA.
- [x] **Limpiar Chat Manual**: Probar que el botón de "Nuevo Chat" limpie los mensajes y restaure el estado inicial.
- [x] **Estado de "Pensando"**: Verificar que el indicador visual de carga (el robot animado con "Pensando...") aparezca inmediatamente después de enviar un mensaje y desaparezca cuando comience la respuesta.
- [x] **Efecto Typewriter**: Asegurarse de que el contenido de la respuesta de la IA no aparezca de golpe, sino que se vaya actualizando progresivamente.
- [x] **Fuentes Jurídicas (RAG)**: Validar que si el backend devuelve fuentes (`sources`), estas se rendericen correctamente debajo del mensaje.
- [x] **Markdown y Formato**: Verificar que las respuestas que contienen negritas, listas o tablas se rendericen como HTML y no como texto plano.T
## 2. Gestión de Límites y Sesión (`chat-limits.spec.ts`) - *Prioridad Alta*

- [x] **Límite de Mensajes**: Forzar el envío de la cantidad máxima de mensajes y verificar que aparezca la alerta de "Límite alcanzado" y se bloquee el input.
- [x] **Countdown de Reseteo**: Verificar que después de alcanzar el límite, el contador funcione y el chat se limpie automáticamente al llegar a cero.

## 3. Resiliencia y Errores (`chat-errors.spec.ts`) - *Prioridad Media/Baja*

- [x] **Manejo de Errores del API**: Simular un fallo en el backend (ej. 500 Internal Server Error) y verificar que el frontend muestre el mensaje de error amigable: "Hubo un error al procesar tu solicitud...".

## 4. Interfaz y Navegación (`chat-ui-scroll.spec.ts`) - *Prioridad Media*

- [x] **Auto-Scroll Inteligente**: Validar que mientras la IA escribe, la pantalla haga scroll hacia abajo automáticamente, pero que se detenga si el usuario hace scroll hacia arriba manualmente.
- [x] **Responsividad**: Probar la interfaz en resoluciones de móvil para asegurar que el sidebar se oculte correctamente y el chat sea usable.

## 5. Auditoría de Rendimiento en WebKit/iOS - *Prioridad Alta*

- [x] **Prueba de Carga de Pintado (Repaint)**: Se añadió `will-change: transform` + `translateZ(0)` en los elementos decorativos con `blur-[120px]` para forzar composición GPU y evitar repaints costosos en Safari de iOS.
- [x] **Frecuencia del Typewriter**: Se ajustó `TYPEWRITER_INTERVAL_MS` de 15ms a 20ms (50fps). Es indistinguible visualmente y reduce significativamente el layout thrashing en Safari.
- [x] **Scroll Activo**: El auto-scroll usa `behavior: "smooth"` con un `threshold` de 120px que detecta scroll manual del usuario. La interacción es compatible con la inercia nativa de Safari (`overflow-y: auto`).
