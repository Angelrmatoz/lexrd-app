# LexRD - Agents Documentation (Root)

Este documento sirve como contexto principal para cualquier IA que trabaje en este workspace. Define la arquitectura, el estado actual y las reglas de diseño.

## Arquitectura de Referencia
El proyecto es un **Turborepo** monorepo que integra un ecosistema de TypeScript (Next.js/Expo) con un motor de IA en Java (Spring Boot).

### Componentes Clave
1.  **Frontend (`frontend/`)**: Aplicación dual (Web/Mobile) compartiendo lógica de UI.
2.  **Backend (`backend/`)**: Servidor de IA basado en Spring AI.
    -   **IA RAG**: Google Gemini (2.5 Flash primario) con cadena de 5 modelos fallback, base de datos vectorial pgvector.
    -   **Frontend**: Animación typewriter en el frontend (carácter por carácter a ~15ms) sobre respuesta JSON síncrona del backend.
    -   **Base de Datos**: PostgreSQL (Supabase) con almacenamiento vectorial.
3.  **Packages (`packages/`)**: Componentes y configuraciones compartidas (`@repo/ui`, `typescript-config`).

## Estado Actual y Tecnologías
-   **Infraestructura**: Java 25, Spring Boot 4.0.4.
-   **IA Core**: Spring AI 2.0.0-M3 con `MessageWindowChatMemory` y `FallbackChatModel` (5 modelos: `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash` → `gemini-2.0-flash-lite` → `gemma-4-31b-it`).
    -   Patrones: Query Routing, Query Rewriting, RAG con `VectorStore`.
-   **Branding**: Iconografía (SVG) con colores patrios de la República Dominicana, gestionada desde `public/icon.svg`.

## Infraestructura y Despliegue
-   **CI/CD**: Configurado en `.github/workflows/ci.yml`. Automatiza el build y push de la imagen del backend a **GitHub Container Registry (GHCR)** para que **Azure Container Apps** pueda "jalarla".
-   **Seguridad**: El workflow utiliza `GITHUB_TOKEN` para la autenticación automática en GHCR.

## Directrices para Agentes
-   **Monorepo**: Considerar el impacto de cambios en `packages/ui` tanto en Web como en Native.
-   **IA/RAG**: Los modelos se configuran vía `application.properties`. La cadena de fallback se actualiza en `AiConfig.java` (inyección de `fallback1`-`fallback4`). El modelo primario se define en `ai.model.primary`.
-   **Frontend**: La respuesta del backend es JSON síncrono (`POST /api/chat`). La animación de escritura se maneja enteramente en el frontend (`useChatStore.ts`) con `setInterval` a ~15ms.
-   **Endpoint eliminado**: Ya no existe `/api/chat/stream` — todo el streaming visual es responsabilidad del frontend.
-   **Documentos**: El `knowledge-base` en `backend/src/main/resources/knowledge-base` contiene PDFs que se ingieren automáticamente mediante `IngestionService.java`.
-   **Seguridad**: CSRF está desactivado en entornos de desarrollo (`SecurityConfig.java`) para permitir pruebas POST directas (Postman).
-   **Estilo**: Seguir convenciones: `camelCase` para variables/métodos, `PascalCase` para clases/componentes.
