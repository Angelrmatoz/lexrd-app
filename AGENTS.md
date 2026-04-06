# LexRD - Agents Documentation (Root)

Este documento sirve como contexto principal para cualquier IA que trabaje en este workspace. Define la arquitectura, el estado actual y las reglas de diseño.

## Arquitectura de Referencia
El proyecto es un **Turborepo** monorepo que integra un ecosistema de TypeScript (Next.js/Expo) con un potente motor de IA en Java (Spring Boot).

### Componentes Clave
1.  **Frontend (`frontend/`)**: Aplicación dual (Web/Mobile) compartiendo lógica de UI.
2.  **Backend (`backend/`)**: Servidor de IA basado en Spring AI.
    -   **IA RAG**: Integración con OpenRouter y base de datos vectorial pgvector.
    -   **Base de Datos**: PostgreSQL (Supabase) con almacenamiento vectorial.
3.  **Packages (`packages/`)**: Componentes y configuraciones compartidas.

## Estado Actual y Cambios Recientes
-   **Branding**: Actualizado el icono de la aplicación (`icon.svg`) y configurado en la metadata de Next.js.
-   **IA Core**: Implementado **Query Rewriting** en `ChatService.java` para mejorar la recuperación de documentos legales.
-   **Configuración de Modelos**: Uso de OpenRouter con URL base corregida (`/api`) para evitar duplicación de rutas. Modelos primarios: Nvidia Nemotron 70B y Llama 3.1.
-   **Seguridad**: Archivo `SecurityConfig.java` configurado para desactivar CSRF en desarrollo, permitiendo pruebas POST directas desde clientes externos (Postman).
-   **Infraestructura**: Actualizado a Java 25 y Spring Boot 4.0.4.

## Directrices para Agentes
-   **Monorepo**: Siempre considerar el impacto de cambios en `packages/ui` tanto en Web como en Native.
-   **IA**: El backend utiliza un sistema de **Fallback** en `AiConfig.java`. Al añadir modelos, actualizar tanto `application.properties` como los fallbacks.
-   **Documentos**: El `knowledge-base` en `backend` contiene PDFs legales dominicanos que se ingieren automáticamente mediante `IngestionService.java`.
-   **Estilo**: Seguir convenciones de `camelCase` para variables/métodos y `PascalCase` para clases/componentes.
