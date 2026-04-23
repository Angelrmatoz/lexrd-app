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
- **IA/ML**: Google Gemini (2.5 Flash, 2.0 Flash, Gemma 4) con sistema multi-model fallback, RAG con pgvector.
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
*El backend corre por defecto en el puerto **4000**.*

**Frontend Web:**
```sh
pnpm dev:web
```

**Frontend Móvil:**
```sh
pnpm dev:native
```

## Despliegue (Azure Container Apps + GHCR)

Este proyecto está configurado para desplegarse utilizando **GitHub Container Registry (GHCR)** como puente para **Azure Container Apps**.

### Pipeline de CI/CD
El archivo `.github/workflows/ci.yml` automatiza:
1. Pruebas unitarias e integración del backend.
2. Build de la imagen Docker utilizando `backend/Dockerfile`.
3. Push de la imagen a **GHCR** (`ghcr.io`).

### Configuración en Azure Container Apps
Debes configurar tu instancia de Azure Container Apps para que tenga acceso a GHCR:
1. Habilita la autenticación de registros externos en Azure.
2. Usa `ghcr.io` como servidor de registro.
3. Utiliza la imagen `ghcr.io/<TU_USUARIO_GITHUB>/lexrd-backend:latest`.

### Secretos en GitHub
Asegúrate de tener configurado:
- `GEMINI_API_KEY`: Tu clave de API de Google Gemini (modelos Gemini 2.5 Flash, 2.0 Flash, Gemma 4).
- `API_KEY_FILTER`: Clave de seguridad para proteger los endpoints del backend.
- (El token `GITHUB_TOKEN` para GHCR se gestiona automáticamente por el workflow).

## Características Principales
- **RAG (Retrieval-Augmented Generation)**: Consultas inteligentes sobre el Código Civil, Penal, Laboral, Constitucional y leyes especiales de RD.
- **Query Rewriting & Routing**: Optimización semántica y direccionamiento inteligente de consultas para mejorar la precisión de recuperación.
- **Seguridad**: Configuración personalizada para facilitar pruebas de desarrollo.
- **Branding Localizado**: Interfaz adaptada a la identidad visual de República Dominicana.

## Actualizaciones Recientes (Abril 2026)
- **UI/UX Móvil**: Integración de `KeyboardAvoidingView` para mejor manejo del teclado y altura dinámica de inputs.
- **Diseño**: Actualización de colores principales a `#0034BB` para mejorar el contraste.
- **Backend**: Mejoras en el contexto legal para mayor precisión en las respuestas.
- **Configuración**: Actualización de dependencias (`react-native-worklets`), assets (iconos, splash screen) y exclusión de directorio `android` en git.
