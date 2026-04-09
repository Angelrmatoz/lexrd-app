# LexRD - Frontend Web

La aplicación web de LexRD, construida con **Next.js 16** + **React 19** + **TailwindCSS**.

## Desarrollo

### Entorno Local
Desde la raíz del monorepo:
```bash
pnpm dev:web
```
La aplicación está disponible en: `http://localhost:3000`

### Con Docker
Desde la raíz del monorepo:
```bash
docker compose -f frontend/web/docker-compose.dev.yml up -d
```
*El hot reload está configurado con polling (`1000ms`) en `next.config.js` para compatibilidad con Turbopack.*

## Estructura

| Ruta | Descripción |
|---|---|
| `/` | Chat principal |
| `/official-documents` | Biblioteca de jurisprudencia y documentos |

---
*Para detalles de arquitectura, consulta el `README.md` y `AGENTS.md` en la raíz del proyecto.*
