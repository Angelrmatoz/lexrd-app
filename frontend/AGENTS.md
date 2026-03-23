# Frontend - Agents Documentation

This directory contains the application layers for the Lexrd project.

## Project Structure
- `web/`: Next.js application using `react-native-web` for cross-platform compatibility.
- `native/`: Expo application for iOS and Android.

## Shared Resources
- Both applications share UI components from `../../packages/ui` (`@repo/ui`).
- Shared TypeScript configurations are in `../../packages/typescript-config`.

## Tech Stack
- **Frameworks**: Next.js (Web), Expo/React Native (Native).
- **Styling**: Vanilla CSS / CSS Modules (Web), StyleSheet (Native).
- **Navigation**: Next.js App Router (Web), Expo Router (Native).

## Development Workflow
- Run individual apps from the root using `pnpm dev:web` or `pnpm dev:native`.
- Always verify changes in both environments if modifying shared components in `@repo/ui`.

## Conventions
- **Components**: PascalCase (e.g., `Header.tsx`).
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`).
- **File Naming**: Prefer kebab-case for non-component files.
