# Frontend - Agents Documentation

Esta carpeta gestiona todas las interfaces de usuario de LexRD.

## Aplicaciones
-   **`web/`**: Next.js 15+ con `react-native-web`. Usa el App Router.
-   **`native/`**: Expo SDK 50+ / React Native.

## Integración con Backend
-   **API Base**: El frontend se comunica con el backend de Spring Boot (puerto 5000 por defecto).
-   **Endpoints Clave**:
    -   `POST /api/chat`: Envío de consultas legales. Cuerpo: `{"message": "..."}`.
    -   `GET /api/health`: Verificación de estado del servidor.

## Desarrollo y Estilo
-   **UI Compartida**: Los componentes se importan de `@repo/ui`. Si un componente necesita estilos específicos para web o móvil, se usan extensiones `.web.tsx` o condicionales de `Platform`.
-   **Temas**: Se prefiere el uso de CSS nativo/StyleSheet para mantener la consistencia. Evitar librerías externas de utilidades CSS a menos que sea necesario.

## Notas para IA
-   Al modificar la lógica de chat, asegurar que el manejo del `ChatResponse` incluya la visualización de las `sources` (fuentes legales).
-   Utilizar `TypeScript` estricto en todos los nuevos componentes.
