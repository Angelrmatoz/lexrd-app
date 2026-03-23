# Lexrd App - Agents Documentation

This document tracks the current state, architecture, and recent modifications of the workspace for AI agents.

## Project Architecture
This is a **Turborepo** monorepo using **pnpm** as the package manager.

### Key Directories
- `frontend/`: Contains the application layers.
  - `web/`: Next.js application (using `react-native-web`).
  - `native/`: React Native application (Expo).
- `backend/`: Java Spring Boot backend service.
- `packages/`: Shared workspace packages.
  - `ui/`: Shared React Native component library (`@repo/ui`).
  - `typescript-config/`: Shared TypeScript configurations (`@repo/typescript-config`).

## Recent Modifications & Fixes

### 1. Folder Rename: `apps/` -> `frontend/`
- Renamed the main application directory to `frontend/`.
- Updated `pnpm-workspace.yaml` to include `"frontend/*"`.
- Updated `README.md` to reflect the new structure.

### 2. Individual Scripts (`package.json`)
Added individual scripts to the root `package.json` for independent application management:
- `dev:web`: `turbo run dev --filter=web`
- `dev:native`: `turbo run dev --filter=native`
- `start:web`: `turbo run start --filter=web`
- `start:native`: `turbo run dev --filter=native`

### 3. TypeScript & Module Resolution Fixes
Resolved `TS2307` and `TS2304` errors:
- **`packages/typescript-config/nextjs.json`**: 
  - Set `jsx: "react-jsx"` to fix missing DOM names (e.g., `div`).
  - Set `moduleResolution: "bundler"` for modern workspace resolution.
  - Updated `include` to cover project roots.
- **`packages/ui/package.json`**:
  - Updated `main`, `types`, and `exports` to point directly to `src/index.tsx`. This allows the workspace to resolve the source code and types in real-time without needing a separate build step during development.

## Developer Notes
- Always run `pnpm install` after structural changes to refresh workspace symlinks.
- If TypeScript errors persist in the IDE, restart the TS Server.

## Coding Conventions
To ensure consistency across the codebase, follow these naming conventions:

### General (TypeScript & Java)
- **Classes & Interfaces**: Use `PascalCase`.
  - *Example*: `interface UserProfile`, `class BackendService`.
- **Methods & Variables**: Use `camelCase`.
  - *Example*: `function getUserData()`, `const userList = []`.

### Frontend Specific
- **Components**: Use `PascalCase` for React components.
  - *Example*: `export function Button()`.
- **Hooks**: Always prefix with `use` and use `camelCase`.
  - *Example*: `useAuth()`.
