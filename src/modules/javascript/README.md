# JavaScript Module

Language module for JavaScript programming language detection and guidelines.

## Detection Criteria

- **Primary**: `package.json` presence
- **Secondary**: `.js`, `.mjs`, `.cjs` files in project
- **Tertiary**: JavaScript config files (ESLint, Babel, Webpack, etc.), Node.js lock files

## Version Detection Criteria

- **Primary**: `engines.node` in `package.json`
- **Secondary**: `.nvmrc` file content
- **Tertiary**: `browserslist` configuration (defaults to ES2020 for modern browsers)
- **Fallback**: ES2020 (modern JavaScript default)

## Guidelines Provided

- `javascript/guidelines/language.md` - Core JavaScript language guidelines
- `javascript/guidelines/{version}/features.md` - Version-specific features (if available)

## Supported Versions

- ES2015 (ES6)
- ES2017
- ES2018
- ES2019
- ES2020
- ES2021
- ES2022

## Detection Features

- Package.json configuration detection
- JavaScript file counting
- TypeScript conflict detection (reduces confidence if more TS than JS files)
- Node.js environment detection
- Build tool configuration detection
- Node modules presence detection

## File Extensions

- `.js` - Standard JavaScript files
- `.mjs` - ES modules
- `.cjs` - CommonJS modules
- `.jsx` - React JSX files (JavaScript with JSX syntax)

## Directory Indicators

- `src/` - Source code
- `lib/` - Library code
- `public/` - Public assets
- `dist/` - Distribution/build output
- `build/` - Build output
- `node_modules/` - NPM dependencies
- `scripts/` - Utility scripts
- `utils/` - Utility functions
- `helpers/` - Helper functions

## Runtime

Node.js