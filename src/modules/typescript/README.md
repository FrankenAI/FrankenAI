# TypeScript Module

Language module for TypeScript programming language detection and guidelines.

## Detection Criteria

- **Primary**: `tsconfig.json` presence
- **Secondary**: `typescript` in `package.json` dependencies/devDependencies
- **Tertiary**: `.ts`/`.tsx` files, TypeScript-related packages (@types/*, ts-node, etc.)

## Version Detection Criteria

- **Primary**: `typescript` version in `package.json` dependencies/devDependencies
- **Secondary**: `compilerOptions.target` in `tsconfig.json` (mapped to approximate TS version)
- **Tertiary**: `typescript` version in `package-lock.json`

## Guidelines Provided

- `typescript/guidelines/language.md` - Core TypeScript language guidelines
- `typescript/guidelines/{version}/features.md` - Version-specific features (if available)

## Supported Versions

- TypeScript 4.0
- TypeScript 4.5
- TypeScript 4.9
- TypeScript 5.0
- TypeScript 5.1
- TypeScript 5.2
- TypeScript 5.3
- TypeScript 5.4

## Detection Features

- TypeScript configuration detection (`tsconfig.json`)
- TypeScript dependency detection
- TypeScript file counting (.ts, .tsx)
- Type definition file counting (.d.ts)
- TypeScript ecosystem packages detection (@types/*, ts-node, tsx, etc.)
- TypeScript config files detection (TS-based config files)

## File Extensions

- `.ts` - TypeScript source files
- `.tsx` - TypeScript JSX files (React with TypeScript)
- `.d.ts` - TypeScript declaration files

## Directory Indicators

- `src/` - Source code
- `lib/` - Library code
- `types/` - Type definitions
- `@types/` - DefinitelyTyped packages
- `dist/` - Distribution/build output
- `build/` - Build output
- `node_modules/` - NPM dependencies
- `typings/` - Legacy type definitions

## Runtime

Node.js (TypeScript compiles to JavaScript)