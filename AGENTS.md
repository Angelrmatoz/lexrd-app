# LexRD - Agents Documentation (Root)

Este documento sirve como contexto principal para cualquier IA que trabaje en este workspace. Define la arquitectura, el estado actual y las reglas de diseño.

## Arquitectura de Referencia
El proyecto es un **Turborepo** monorepo que integra un ecosistema de TypeScript (Next.js/Expo) con un motor de IA en Java (Spring Boot).

### Componentes Clave
1.  **Frontend (`frontend/`)**: Aplicación dual (Web/Mobile) compartiendo lógica de UI.
2.  **Backend (`backend/`)**: Servidor de IA basado en Spring AI.
    -   **IA RAG**: Integración con OpenRouter y base de datos vectorial pgvector.
    -   **Base de Datos**: PostgreSQL (Supabase) con almacenamiento vectorial.
3.  **Packages (`packages/`)**: Componentes y configuraciones compartidas (`@repo/ui`, `typescript-config`).

## Estado Actual y Tecnologías
-   **Infraestructura**: Java 25, Spring Boot 4.0.4.
-   **IA Core**: Spring AI 2.0.0-M3 con `MessageWindowChatMemory`.
    -   Patrones: Query Routing, Query Rewriting, RAG con `VectorStore`.
-   **Branding**: Iconografía (SVG) con colores patrios de la República Dominicana, gestionada desde `public/icon.svg`.

## Directrices para Agentes
-   **Monorepo**: Considerar el impacto de cambios en `packages/ui` tanto en Web como en Native.
-   **IA/RAG**: Los modelos se configuran vía `application.properties` (y perfiles). Al añadir modelos, actualizar los fallbacks en `FallbackChatModel.java`.
-   **Documentos**: El `knowledge-base` en `backend/src/main/resources/knowledge-base` contiene PDFs que se ingieren automáticamente mediante `IngestionService.java`.
-   **Seguridad**: CSRF está desactivado en entornos de desarrollo (`SecurityConfig.java`) para permitir pruebas POST directas (Postman).
-   **Estilo**: Seguir convenciones: `camelCase` para variables/métodos, `PascalCase` para clases/componentes.
