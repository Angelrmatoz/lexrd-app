# LexRD - Frontend

Esta carpeta contiene las aplicaciones de interfaz de usuario de la plataforma LexRD, diseñadas para ser multiplataforma y eficientes.

## Estructura de Proyectos
- **`web/`**: Aplicación web moderna construida con **Next.js**. Utiliza `react-native-web` para permitir la reutilización de componentes y estilos entre la web y el móvil.
- **`native/`**: Aplicación móvil nativa construida con **Expo** y **React Native**. Permite generar versiones para iOS y Android desde un mismo código base.

## Características Clave
- **UI Compartida**: Ambas aplicaciones consumen componentes de la librería local `@repo/ui` (ubicada en `packages/ui`).
- **TypeScript**: Todo el código está estrictamente tipado para minimizar errores y mejorar la experiencia de desarrollo.
- **Comunicación con Backend**: Se conecta al servicio central de IA (puerto 5000) para procesar las consultas legales.
- **Branding**: Iconografía personalizada con los colores de la bandera dominicana, servida correctamente desde el directorio `public` para Next.js.

## Comandos de Ejecución (desde la raíz)
- **Ejecutar Web**: `pnpm dev:web`
- **Ejecutar Móvil**: `pnpm dev:native`

---
*Para detalles técnicos específicos para agentes de IA, consulta `AGENTS.md` en esta misma carpeta.*
