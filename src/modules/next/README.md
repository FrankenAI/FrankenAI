# Next.js Module

Framework module for Next.js React framework detection and guidelines.

## Detection Criteria

- **Primary**: `next` in `package.json` dependencies
- **Secondary**: Next.js config files (`next.config.js`, `next.config.ts`)
- **Tertiary**: Next.js directory structure (`pages/`, `app/`, `public/`), Next.js specific files

## Version Detection Criteria

- **Primary**: `next` version in `package.json` dependencies/devDependencies
- **Secondary**: `next` version in `package-lock.json`
- **Tertiary**: `next` version in `yarn.lock`

## Guidelines Provided

- `next/guidelines/framework.md` - Core Next.js guidelines
- `next/guidelines/{version}/features.md` - Version-specific features

## Commands Generated

### Development
- `npm run dev` / `yarn dev` / `pnpm dev` / `bun dev` - Start development server
- `npm run start` / `yarn start` / `pnpm start` / `bun start` - Start production server

### Build
- `npm run build` / `yarn build` / `pnpm build` / `bun build` - Build for production
- `npm run export` / `yarn export` / `pnpm export` / `bun export` - Export static site

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

- Next.js 13.x
- Next.js 14.x

## Detection Features

- Next.js config detection
- Pages Router detection (`pages/` directory)
- App Router detection (`app/` directory)
- Build output detection (`.next/` directory)
- Next.js scripts detection in package.json