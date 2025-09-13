# React Module

Framework module for React frontend framework detection and guidelines.

## Detection Criteria

- **Primary**: `react` and `react-dom` in `package.json` dependencies
- **Secondary**: React build tools (Create React App, Vite with React plugin)
- **Tertiary**: `.jsx`/`.tsx` files, React ecosystem packages (React Router, Redux, etc.)

## Version Detection Criteria

- **Primary**: `react` version in `package.json` dependencies/devDependencies
- **Secondary**: `react` version in `package-lock.json`

## Guidelines Provided

- `react/guidelines/framework.md` - Core React guidelines
- `react/guidelines/{version}/features.md` - Version-specific features

## Commands Generated

### Development
- `npm run dev` / `yarn dev` / `pnpm dev` / `bun dev` - Start development server
- `npm run start` / `yarn start` / `pnpm start` / `bun start` - Start development server (CRA)

### Build
- `npm run build` / `yarn build` / `pnpm build` / `bun build` - Build for production

### Testing
- `npm run test` / `yarn test` / `pnpm test` / `bun test` - Run tests
- `npm run test:vitest` - Run Vitest tests (if Vitest detected)
- `npm run test:jest` - Run Jest tests (if Jest detected)
- `npm run test -- --coverage` - Run tests with coverage (if CRA detected)

### Linting
- `npm run lint` / `yarn lint` / `pnpm lint` / `bun lint` - Run linter
- `npm run lint:fix` / `yarn lint:fix` / `pnpm lint:fix` / `bun lint:fix` - Fix linting issues

### Installation
- `npm install` / `yarn install` / `pnpm install` / `bun install` - Install dependencies

## Supported Versions

- React 17.x
- React 18.x
- React 19.x

## Detection Features

- React DOM detection (confirms React app vs library usage)
- Create React App detection
- Vite + React plugin detection
- React Router detection
- State management detection (Redux, Zustand, Jotai, Recoil)
- JSX/TSX file counting