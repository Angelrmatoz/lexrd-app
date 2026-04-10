# Frontend - Agents Documentation

Esta carpeta gestiona todas las interfaces de usuario de LexRD.

## Aplicaciones
-   **`web/`**: Next.js 16+, App Router, Tailwind CSS, Shadcn UI.
-   **`native/`**: Expo SDK 50+, React Native.

## Integración con Backend
-   **API Base**: Backend de Spring Boot (puerto 4000).
-   **Endpoints**:
    -   `POST /api/chat`: Consulta de IA con RAG. Respuesta JSON síncrona: `{"response": "...", "sources": [...]}`.
    -   `GET /api/health`: Health check.
-   **Tipografía de respuesta**: El endpoint ya NO usa streaming (`/api/chat/stream` eliminado). La animación de escritura carácter por carácter (~15ms) se implementa en el frontend (`useChatStore.ts`).
-   **API Key**: Incluir header `x-api-key` en cada petición (valor de `NEXT_PUBLIC_API_KEY_FILTER`).

## Desarrollo y Estilo
-   **UI Compartida**: Importar de `@repo/ui`.
-   **Temas**: Preferir CSS nativo/StyleSheet para mantener consistencia entre plataformas.
-   **Branding**: Icono en `/public/icon.svg`. Asegurar referencia con `type: "image/svg+xml"` en `layout.tsx`.
-   **Tipado**: TypeScript estricto en todos los nuevos componentes.
-   **IA Response**: Al procesar `ChatResponse`, visualizar siempre las fuentes (`sources`) recuperadas del backend.
