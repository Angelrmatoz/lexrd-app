# Backend - Agents Documentation

El corazón de IA de LexRD, construido con Java 25, Spring Boot 4.0.4 y Spring AI.

## Arquitectura de IA
El backend implementa un patrón RAG (Retrieval-Augmented Generation) avanzado:
1.  **Ingesta**: `IngestionService.java` lee PDFs de `src/main/resources/knowledge-base`, los divide con `StructuralLawSplitter.java` y los guarda en `pgvector`.
2.  **Consulta**: `ChatService.java` realiza **Query Rewriting** para convertir lenguaje natural en términos de búsqueda legal.
3.  **Generación**: Combina el contexto recuperado con el modelo de IA (OpenRouter) para generar respuestas fundamentadas.

## Configuración Clave
-   **Seguridad**: `SecurityConfig.java` permite acceso libre a `/api/**` para facilitar pruebas POST desde Postman/Frontend en desarrollo.
-   **IA Fallback**: `FallbackChatModel.java` gestiona errores de API de OpenRouter intentando hasta 3 modelos diferentes secuencialmente.
-   **Base de Datos**: Usa Supabase (PostgreSQL) con la extensión `pgvector`.

## Estructura de Paquetes
-   `config/`: Configuraciones de IA, Seguridad y Base de Datos.
-   `controller/`: Endpoints REST (`ChatController`, `DocumentController`).
-   `service/`: Lógica de negocio, RAG y procesamiento de documentos.
-   `model/`: DTOs de petición y respuesta.

## Notas para IA
-   **Spring AI 2.0.0-M3**: Debido a refactorizaciones en la API de Spring AI (como la clase `MessageChatMemoryAdvisor`), se recomienda usar valores literales para ciertas claves (ej. `"chat_memory_conversation_id"`) en lugar de depender de constantes que pueden cambiar de ubicación.
-   Cualquier cambio en la lógica de búsqueda debe probarse verificando que el `similarityThreshold` en `ChatService` sea el óptimo para los documentos actuales.
-   Si se añaden nuevos PDFs al `knowledge-base`, el sistema los procesará en el siguiente inicio si el `app.seeder.enabled` está en `true`.
