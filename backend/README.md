# LexRD - Backend (AI Core)

El backend de LexRD es el motor de inteligencia artificial y procesamiento de datos legales de la República Dominicana. Está construido con **Spring Boot 4.0.4** y **Java 25**, utilizando **Spring AI 2.0.0-M3** para una gestión avanzada de modelos de lenguaje.

## Funcionalidades Principales

-   **Pipeline RAG Avanzado**: Implementa un flujo completo de "Generación Aumentada por Recuperación" (RAG).
    -   **Query Router**: Clasifica la intención del usuario para identificar el documento legal más relevante.
    -   **Query Rewriting**: Reformula consultas informales en términos legales técnicos para optimizar la búsqueda semántica.
    -   **Búsqueda Filtrada**: Utiliza metadatos para buscar específicamente en las leyes sugeridas por el enrutador.
-   **Multi-Model Fallback**: Sistema de resiliencia que intenta utilizar modelos secundarios si el modelo primario falla por saturación o errores temporales.
    - **Cadena**: `gemini-2.5-flash` → `gemini-2.5-flash-lite` → `gemini-2.0-flash` → `gemini-2.0-flash-lite` → `gemma-4-31b-it`
-   **Local Embeddings (Transformers)**: Genera embeddings vectoriales localmente utilizando el modelo **Jina Embeddings V2 Base ES** (768 dimensiones) y **DJL PyTorch**.
-   **Animación Typewriter (Frontend)**: La respuesta síncrona del backend se muestra con animación de escritura carácter por carácter en el frontend.
-   **Ingesta Inteligente**: Procesamiento de leyes con `StructuralLawSplitter`, que respeta la jerarquía legal (Libros, Títulos, Capítulos, Artículos).

## Base de Conocimientos Actual

El sistema procesa y consulta actualmente la siguiente legislación dominicana:
- **Constitución de la República Dominicana**.
- **Códigos**: Civil, Comercio, Penal, Procesal Penal, Procedimiento Civil, Trabajo, Tributario, Monetario y Financiero, y Código para la Protección de los Derechos de Niños, Niñas y Adolescentes (NNA).
- **Leyes Especiales**: Ley No. 63-17 de Movilidad, Transporte Terrestre, Tránsito y Seguridad Vial.

## API Endpoints

Todos los endpoints (excepto `/api/health` y documentación) requieren el header `x-api-key`.

-   `POST /api/chat`: Respuesta síncrona de la IA (JSON con `{"response": "..."}`).
-   `GET /api/documents`: Lista los documentos legales disponibles.
-   `GET /api/health`: Estado del sistema (Acceso público).
-   `GET /swagger-ui.html`: Documentación interactiva de la API.

## Requisitos del Entorno

Configura las siguientes variables en tu archivo `.env` o variables de entorno:

1.  **GEMINI_API_KEY**: Clave para el acceso a los modelos de Google Gemini.
2.  **API_KEY_FILTER**: Clave de seguridad para proteger los endpoints del backend (debe enviarse como `x-api-key` en las peticiones).
3.  **Base de Datos**: PostgreSQL con la extensión `pgvector`.

## Cómo Ejecutar

### Desarrollo Local

1.  **Levantar PostgreSQL local:**
    ```sh
    docker compose -f docker-compose.db.yml up -d
    ```

2.  **Ejecutar el backend:**
    ```sh
    ./mvnw spring-boot:run
    ```

El servidor estará disponible en: `http://localhost:4000`

### Optimizaciones de Arranque
El sistema incluye un `DjlWarmupRunner` que descarga las bibliotecas nativas de PyTorch al inicio para garantizar que el modelo de embeddings local funcione sin latencia desde la primera consulta.

---
*Para detalles técnicos profundos sobre la arquitectura de los agentes y servicios de IA, consulta `AGENTS.md`.*
