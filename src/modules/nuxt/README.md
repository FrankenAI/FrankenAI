# Nuxt.js Module

Framework module for Nuxt.js Vue framework detection and guidelines.

## Detection Criteria

- **Primary**: `nuxt` in `package.json` dependencies/devDependencies
- **Secondary**: Nuxt config files (`nuxt.config.js`, `nuxt.config.ts`)
- **Tertiary**: Nuxt directory structure (`pages/`, `components/`, `layouts/`, etc.), Nuxt scripts in package.json

## Version Detection Criteria

- **Primary**: `nuxt` version in `package.json` dependencies/devDependencies
- **Secondary**: `nuxt` version in `package-lock.json`
- **Tertiary**: `nuxt` version in `yarn.lock`
- **Fallback**: `nuxt-edge` detection (indicates Nuxt 2.x)

## Guidelines Provided

- `nuxt/guidelines/framework.md` - Core Nuxt.js guidelines
- `nuxt/guidelines/{version}/features.md` - Version-specific features

## Commands Generated

### Development
- `npm run dev` / `yarn dev` / `pnpm dev` / `bun dev` - Start development server
- `npm run start` / `yarn start` / `pnpm start` / `bun start` - Start production server

### Build
- `npm run build` / `yarn build` / `pnpm build` / `bun build` - Build for production
- `npm run generate` / `yarn generate` / `pnpm generate` / `bun generate` - Generate static site

### Testing
- `npm run test` / `yarn test` / `pnpm test` / `bun test` - Run tests
- `npm run test:vitest` - Run Vitest tests (if Vitest detected)
- `npm run test:jest` - Run Jest tests (if Jest detected)

### Linting
- `npm run lint` / `yarn lint` / `pnpm lint` / `bun lint` - Run linter
- `npm run lint:fix` / `yarn lint:fix` / `pnpm lint:fix` / `bun lint:fix` - Fix linting issues

### Installation
- `npm install` / `yarn install` / `pnpm install` / `bun install` - Install dependencies

## Supported Versions

- Nuxt.js 2.x
- Nuxt.js 3.x

## Detection Features

- Nuxt config detection
- Multiple Nuxt directory detection (pages, components, layouts, middleware, plugins, assets, static)
- Build output detection (`.nuxt/` directory)
- Nuxt scripts detection in package.json
- Vue.js dependency detection (Nuxt requirement)