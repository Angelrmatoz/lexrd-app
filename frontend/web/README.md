# LexRD - Frontend Web

La aplicación web de LexRD, construida con **Next.js 16** + **React 19** + **TailwindCSS v4**.

## Desarrollo

### Sin Docker (recomendado)

Desde la raíz del monorepo:

```bash
pnpm dev --filter=web
```

O desde esta carpeta:

```bash
pnpm dev
```

La app se abre en: `http://localhost:3000`

### Con Docker (Hot Reload + Turbopack)

Desde la raíz del monorepo:

```bash
docker compose -f frontend/web/docker-compose.dev.yml up -d
```

El hot reload funciona con **polling** configurado en `next.config.js` (`pollIntervalMs: 1000`), lo que permite que Turbopack detecte cambios en archivos montados desde el host.

## Producción

### Build local

```bash
pnpm build
pnpm start
```

### Con Docker

```bash
docker compose -f frontend/web/docker-compose.yml up -d
```

## Estructura

| Ruta | Descripción |
|---|---|
| `/` | Chat principal |
| `/library` | Biblioteca de jurisprudencia |

---
*Para detalles de arquitectura del monorepo, consulta el `README.md` en la raíz del proyecto.*
