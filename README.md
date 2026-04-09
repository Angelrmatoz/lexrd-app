# LexRD - Asistente Legal Inteligente (RD)

LexRD es una plataforma monorepo diseñada para proporcionar asistencia legal basada en la normativa de la República Dominicana, utilizando Inteligencia Artificial avanzada y técnicas de RAG (Retrieval-Augmented Generation).

## Arquitectura del Proyecto

Este proyecto utiliza **Turborepo** con **pnpm** para gestionar múltiples aplicaciones y paquetes.

### Estructura de Directorios

- `frontend/`: Capas de interfaz de usuario.
  - `web/`: Aplicación web construida con **Next.js** y `react-native-web`.
  - `native/`: Aplicación móvil multiplataforma construida con **Expo/React Native**.
- `backend/`: Microservicio central construido con **Java 25** y **Spring Boot 4.0.4**.
  - Implementa **Spring AI 2.0.0-M3** para la integración con modelos de lenguaje.
  - Utiliza **pgvector** en PostgreSQL para la búsqueda semántica en documentos legales.
- `packages/`: Código compartido entre aplicaciones.
  - `ui/`: Librería de componentes compartida (`@repo/ui`).
  - `typescript-config/`: Configuraciones base de TypeScript.

## Stack Tecnológico

- **Frontend**: Next.js, Expo, React Native Web, TypeScript, Tailwind CSS, Shadcn UI.
- **Backend**: Spring Boot 4.0.4, Java 25, Spring AI.
- **IA/ML**: OpenRouter (Nvidia Nemotron, Llama 3.1), RAG con pgvector.
- **Base de Datos**: PostgreSQL (Supabase) con la extensión `pgvector`.
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
- **RAG (Retrieval-Augmented Generation)**: Consultas inteligentes sobre el Código Civil, Penal, Laboral, Constitucional y leyes especiales de RD.
- **Query Rewriting & Routing**: Optimización semántica y direccionamiento inteligente de consultas para mejorar la precisión de recuperación.
- **Seguridad**: Configuración personalizada para facilitar pruebas de desarrollo.
- **Branding Localizado**: Interfaz adaptada a la identidad visual de República Dominicana.
