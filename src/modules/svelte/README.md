# Svelte Module

Framework module for Svelte frontend framework detection and guidelines.

## Detection Criteria

- **Primary**: `svelte` in `package.json` dependencies/devDependencies
- **Secondary**: Svelte build tools (Vite + Svelte plugin, Rollup + Svelte plugin)
- **Tertiary**: `.svelte` files, `svelte.config.js`, Svelte directory structure

## Version Detection Criteria

- **Primary**: `svelte` version in `package.json` dependencies/devDependencies
- **Secondary**: `svelte` version in `package-lock.json`

## Guidelines Provided

- `svelte/guidelines/framework.md` - Core Svelte guidelines
- `svelte/guidelines/{version}/features.md` - Version-specific features (if available)

## Commands Generated

### Development
- `npm run dev` / `yarn dev` / `pnpm dev` / `bun dev` - Start development server

### Build
- `npm run build` / `yarn build` / `pnpm build` / `bun build` - Build for production

### Testing
- `npm run test` / `yarn test` / `pnpm test` / `bun test` - Run tests
- `npm run test:vitest` - Run Vitest tests (if Vitest detected)
- `npm run test:jest` - Run Jest tests (if Jest detected)

### Linting
- `npm run lint` / `yarn lint` / `pnpm lint` / `bun lint` - Run linter
- `npm run lint:fix` / `yarn lint:fix` / `pnpm lint:fix` / `bun lint:fix` - Fix linting issues
- `npm run check` / `yarn check` / `pnpm check` / `bun check` - Run Svelte type checking (if TypeScript detected)

### Installation
- `npm install` / `yarn install` / `pnpm install` / `bun install` - Install dependencies

## Supported Versions

- Svelte 3.x
- Svelte 4.x
- Svelte 5.x

## Detection Features

- Svelte config detection (`svelte.config.js`)
- Build tool detection (Vite/Rollup with Svelte plugins)
- Svelte component file counting
- Directory structure detection (src/lib, src/routes, src/components)