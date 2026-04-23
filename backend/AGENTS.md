# Backend - Agents Documentation (AI Architecture)

Detalles técnicos de la implementación de IA en LexRD utilizando **Spring AI 2.0.0-M3**, **Java 25** y **Spring Boot 4.0.4**.

## Arquitectura del Orquestador (ChatService)

El backend no solo consulta un modelo; orquestación un pipeline multi-etapa:

1.  **Routing (Enrutamiento)**: Un clasificador interno analiza la consulta del usuario contra la lista de documentos disponibles (`constitucion.pdf`, `codigo-civil.pdf`, etc.) para decidir si debe filtrar la búsqueda vectorial a un archivo específico o buscar en todos (`ALL`).
2.  **Rewriting (Reescritura)**: El `REWRITE_PROMPT` transforma la pregunta original en una consulta semántica autocontenida, eliminando pronombres vagos y añadiendo contexto legal relevante.
3.  **Retrieval (Recuperación)**:
    -   **pgvector**: Búsqueda de similitud de coseno en PostgreSQL.
    -   **Metadata Filtering**: Si el Router identificó un archivo, se aplica un filtro `filename == '...'` para reducir el ruido.
    -   **TopK**: Se recuperan los fragmentos más relevantes para maximizar el contexto legal.
4.  **Augmentation & Generation**: Se inyecta el contexto en el `SYSTEM_PROMPT` y se genera la respuesta final asegurando que la IA base sus respuestas únicamente en la legislación dominicana.

## Resiliencia y Fallback (FallbackChatModel)

Para garantizar la disponibilidad del servicio, hemos implementado una capa de resiliencia personalizada:

- **Estrategia**: Si el modelo primario (`gemini-3.1-flash-lite-preview`) experimenta errores transitorios (timeouts, 502/503, rate limits 429), el sistema intercepta la excepción e intenta automáticamente con modelos secundarios.
- **Cadena de Fallback**:
    1. `gemini-2.5-flash` (Primario)
    2. `gemini-2.5-flash-lite`
    3. `gemini-2.0-flash`
    4. `gemini-2.0-flash-lite`
    5. `gemma-4-31b-it` (Último recurso)

## Modelos de Embedding y Procesamiento Local

-   **TransformersEmbeddingModel**: Se utiliza para generar vectores localmente.
-   **Modelo**: `jina-embeddings-v2-base-es` de Hugging Face.
    -   768 dimensiones.
-   **Motor**: **DJL (Deep Java Library)** con el engine de **PyTorch**.
-   **Warmup**: El `DjlWarmupRunner` descarga los binarios necesarios al arrancar para evitar latencias iniciales.

## Estrategia de Fragmentación (Splitting)

-   `StructuralLawSplitter`: Un splitter especializado que utiliza expresiones regulares para identificar la estructura jerárquica de las leyes dominicanas (Libros, Títulos, Capítulos, Secciones, Artículos).
-   **Agrupamiento Semántico**: Los fragmentos pequeños se agrupan hasta alcanzar un límite lógico para preservar la coherencia del artículo legal.

## Seguridad (ApiKeyFilter)

El sistema implementa una capa de seguridad ligera para proteger los recursos de IA:
- **Validación**: Se requiere una API Key configurada en `app.api.key`.
- **Header**: Las peticiones deben incluir el header `x-api-key`.
- **Endpoints Públicos**: `/api/health` y Swagger se mantienen públicos para monitoreo y documentación.

## Memoria y Contexto

-   **MessageWindowChatMemory**: Mantiene una ventana de los últimos mensajes.
-   **Advisors**: Se utiliza `MessageChatMemoryAdvisor` para persistir el historial de conversación por `conversation_id`.

## Notas Adicionales (Abril 2026)
- Recientes mejoras en el contexto legal de las indicaciones (prompts) aseguran un nivel más alto de precisión en las respuestas del asistente.
