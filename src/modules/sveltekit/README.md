# SvelteKit Module

Framework module for SvelteKit full-stack framework detection and guidelines.

## Detection Criteria

- **Primary**: `@sveltejs/kit` in `package.json` dependencies/devDependencies
- **Secondary**: SvelteKit adapters, `svelte.config.js` with SvelteKit configuration
- **Tertiary**: SvelteKit directory structure (`src/routes/`, `src/app.html`), SvelteKit-specific files

## Version Detection Criteria

- **Primary**: `@sveltejs/kit` version in `package.json` dependencies/devDependencies
- **Secondary**: `@sveltejs/kit` version in `package-lock.json`

## Guidelines Provided

- `sveltekit/guidelines/framework.md` - Core SvelteKit guidelines
- `sveltekit/guidelines/{version}/features.md` - Version-specific features (if available)

## Commands Generated

### Development
- `npm run dev` / `yarn dev` / `pnpm dev` / `bun dev` - Start development server

### Build
- `npm run build` / `yarn build` / `pnpm build` / `bun build` - Build for production
- `npm run preview` / `yarn preview` / `pnpm preview` / `bun preview` - Preview built application

### Testing
- `npm run test` / `yarn test` / `pnpm test` / `bun test` - Run tests
- `npm run test:vitest` - Run Vitest tests (if Vitest detected)
- `npm run test:playwright` - Run Playwright tests (if Playwright detected)

### Linting
- `npm run lint` / `yarn lint` / `pnpm lint` / `bun lint` - Run linter
- `npm run lint:fix` / `yarn lint:fix` / `pnpm lint:fix` / `bun lint:fix` - Fix linting issues
- `npm run check` / `yarn check` / `pnpm check` / `bun check` - Run SvelteKit type checking (if TypeScript detected)

### Installation
- `npm install` / `yarn install` / `pnpm install` / `bun install` - Install dependencies

## Supported Versions

- SvelteKit 1.x
- SvelteKit 2.x

## Detection Features

- SvelteKit config detection (`svelte.config.js` with SvelteKit configuration)
- Adapter detection (auto, static, node, vercel, netlify)
- Routes directory detection (`src/routes/`)
- SvelteKit-specific file detection (`+layout.svelte`, `+page.svelte`, etc.)
- Build output detection (`.svelte-kit/` directory)
- App template detection (`src/app.html`)