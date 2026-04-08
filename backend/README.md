# LexRD - Backend (AI Core)

El backend de LexRD es el motor de inteligencia artificial y procesamiento de datos legales. Está construido con **Spring Boot** y utiliza **Spring AI** para gestionar la interacción con modelos de lenguaje avanzados.

## Funcionalidades Principales
- **Sistema RAG**: Implementa "Generación Aumentada por Recuperación" para que la IA responda basándose exclusivamente en documentos legales dominicanos.
- **Base de Datos Vectorial**: Utiliza **pgvector** en PostgreSQL para realizar búsquedas semánticas ultra rápidas entre miles de fragmentos de leyes.
- **Query Rewriting**: Optimiza las preguntas informales de los usuarios convirtiéndolas en términos legales técnicos antes de realizar la búsqueda.
- **Ingesta Automática**: Al iniciar, el sistema procesa los archivos PDF ubicados en `src/main/resources/knowledge-base` y los sincroniza con la base de datos vectorial.
- **Memoria de Conversación**: Utiliza Spring AI 2.0.0-M3 con configuración resiliente (`chat_memory_conversation_id`) para el historial de chat con el modelo.

## Requisitos del Entorno
- **Java 25** (JDK).
- **Base de Datos**: PostgreSQL con la extensión `pgvector` activada (se recomienda el uso de Supabase).
- **API Key**: Se requiere una clave de **Gemini** configurada en las variables de entorno.

## Cómo Ejecutar

### Desarrollo Local

1. **Levantar PostgreSQL local:**
   ```sh
   docker compose -f docker-compose.db.yml up -d
   ```

2. **Ejecutar el backend:**
   ```sh
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=database
   ```

El servidor abrirá en: `http://localhost:4000`

### Producción (Azure Container Apps)

El `docker-compose.yml` está configurado para producción. En Azure Container Apps, la imagen se construye con el `Dockerfile` y se despliega directamente.

```sh
docker compose up -d
```

---
*Para detalles técnicos específicos sobre los servicios y configuraciones de IA, consulta `AGENTS.md` en esta misma carpeta.*
