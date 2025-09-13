# Vue.js Module

Framework module for Vue.js frontend framework detection and guidelines.

## Detection Criteria

- **Primary**: `vue` in `package.json` dependencies
- **Secondary**: Vue config files (`vue.config.js`, `vite.config.js` with Vue plugin)
- **Tertiary**: `.vue` files, Vue ecosystem packages (Vue Router, Vuex/Pinia)

## Version Detection Criteria

- **Primary**: `vue` version in `package.json` dependencies/devDependencies
- **Secondary**: `vue` version in `package-lock.json`

## Guidelines Provided

- `vue/guidelines/framework.md` - Core Vue.js guidelines
- `vue/guidelines/{version}/features.md` - Version-specific features

## Commands Generated

### Development
- `npm run dev` / `yarn dev` / `pnpm dev` / `bun dev` - Start development server
- `npm run serve` / `yarn serve` / `pnpm serve` / `bun serve` - Start development server (alternative)

### Build
- `npm run build` / `yarn build` / `pnpm build` / `bun build` - Build for production

### Testing
- `npm run test` / `yarn test` / `pnpm test` / `bun test` - Run tests
- `npm run test:unit` / `yarn test:unit` / `pnpm test:unit` / `bun test:unit` - Run unit tests
- `npm run test:vitest` - Run Vitest tests (if Vitest detected)
- `npm run test:jest` - Run Jest tests (if Jest detected)

### Linting
- `npm run lint` / `yarn lint` / `pnpm lint` / `bun lint` - Run linter
- `npm run lint:fix` / `yarn lint:fix` / `pnpm lint:fix` / `bun lint:fix` - Fix linting issues

### Installation
- `npm install` / `yarn install` / `pnpm install` / `bun install` - Install dependencies

## Supported Versions

- Vue.js 2.x
- Vue.js 3.x

## Detection Features

- Vue Router detection
- State management detection (Vuex/Pinia)
- Build tool detection (Vite, Vue CLI)
- Single File Component (.vue) counting