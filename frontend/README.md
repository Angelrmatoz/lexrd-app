# LexRD - Frontend

Esta carpeta contiene las aplicaciones de interfaz de usuario de la plataforma LexRD, diseñadas para ser multiplataforma y eficientes.

## Estructura de Proyectos
- **`web/`**: Aplicación web construida con **Next.js**. Utiliza `react-native-web` para compartir lógica de componentes.
- **`native/`**: Aplicación móvil nativa construida con **Expo** y **React Native**. Permite despliegue en iOS y Android.

## Características Clave
- **UI Compartida**: Ambas aplicaciones consumen componentes de la librería local `@repo/ui` (ubicada en `packages/ui`).
- **TypeScript**: Estricto en todo el código.
- **Comunicación con Backend**: Conexión vía API al servicio de IA en Spring Boot (puerto 4000). Respuesta JSON síncrona con animación typewriter manejada en el frontend.

## Comandos de Ejecución (desde la raíz)
- **Ejecutar Web**: `pnpm dev:web`
- **Ejecutar Móvil**: `pnpm dev:native`

---
*Para detalles técnicos específicos para agentes de IA, consulta `AGENTS.md` en esta carpeta.*
