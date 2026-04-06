# LexRD - Asistente Legal Inteligente (RD)

LexRD es una plataforma monorepo diseñada para proporcionar asistencia legal basada en la normativa de la República Dominicana, utilizando Inteligencia Artificial avanzada y técnicas de RAG (Retrieval-Augmented Generation).

## Arquitectura del Proyecto

Este proyecto utiliza **Turborepo** con **pnpm** para gestionar múltiples aplicaciones y paquetes.

### Estructura de Directorios

- `frontend/`: Capas de interfaz de usuario.
  - `web/`: Aplicación web construida con **Next.js** y `react-native-web`.
  - `native/`: Aplicación móvil multiplataforma construida con **Expo/React Native**.
- `backend/`: Microservicio central construido con **Java 25** y **Spring Boot 4**.
  - Implementa **Spring AI** para la integración con modelos de lenguaje.
  - Utiliza **pgvector** para la búsqueda semántica en documentos legales.
- `packages/`: Código compartido entre aplicaciones.
  - `ui/`: Librería de componentes compartida (`@repo/ui`).
  - `typescript-config/`: Configuraciones base de TypeScript.

## Stack Tecnológico

- **Frontend**: Next.js, Expo, React Native Web, TypeScript.
- **Backend**: Spring Boot 4, Java 25, Spring AI.
- **IA/ML**: OpenRouter (Modelos: Nvidia Nemotron, Llama 3.1), ONNX para embeddings locales.
- **Base de Datos**: PostgreSQL con la extensión `pgvector` (alojado en Supabase).
- **Gestión de Monorepo**: Turborepo, pnpm.

## Cómo empezar

### Requisitos previos
- Node.js (v18+)
- pnpm
- Java 25 (JDK)
- Docker (para base de datos local opcional)

### Instalación
```sh
pnpm install
```

### Ejecución en Desarrollo

**Backend:**
```sh
cd backend
./mvnw spring-boot:run
```
*El backend corre por defecto en el puerto **5000**.*

**Frontend Web:**
```sh
pnpm dev:web
```

**Frontend Móvil:**
```sh
pnpm dev:native
```

## Características Principales
- **RAG (Retrieval-Augmented Generation)**: Consultas inteligentes sobre el Código Civil, Código Penal, Ley 63-17 y más.
- **Query Rewriting**: Optimización de preguntas informales en términos legales para búsquedas precisas.
- **Seguridad**: Configuración personalizada para facilitar pruebas de integración (CSRF desactivado en entorno de desarrollo).
- **Branding Localizado**: Interfaz e iconografía adaptadas a los colores patrios de República Dominicana.
- **Spring AI 2.0.0-M3**: Backend actualizado para soportar la última versión de Spring AI con manejo de memoria de conversación estable.
