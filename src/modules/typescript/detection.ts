import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

/**
 * TypeScript detection utilities
 */
export class TypeScriptDetection {
  /**
   * Detect TypeScript language
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for tsconfig.json (strongest TypeScript indicator)
    if (context.configFiles.includes('tsconfig.json')) {
      evidence.push('tsconfig.json found');
      confidence += 0.9;
    }

    // Check for TypeScript in package.json
    if (context.packageJson?.dependencies?.['typescript'] ||
        context.packageJson?.devDependencies?.['typescript']) {
      evidence.push('typescript in package.json dependencies');
      confidence += 0.8;
    }

    // Check for .ts/.tsx files
    const tsFiles = context.files.filter(file =>
      (file.endsWith('.ts') && !file.endsWith('.d.ts')) || file.endsWith('.tsx')
    );
    if (tsFiles.length > 0) {
      evidence.push(`TypeScript files found: ${tsFiles.length}`);
      confidence += Math.min(tsFiles.length * 0.1, 0.7);
    }

    // Check for .d.ts files (type definitions)
    const dtsFiles = context.files.filter(file => file.endsWith('.d.ts'));
    if (dtsFiles.length > 0) {
      evidence.push(`TypeScript declaration files found: ${dtsFiles.length}`);
      confidence += Math.min(dtsFiles.length * 0.05, 0.3);
    }

    // Check for TypeScript-specific packages
    const tsPackages = [
      '@types/node', '@types/react', '@types/express',
      'ts-node', 'tsx', 'ts-loader', 'typescript-eslint'
    ];

    for (const pkg of tsPackages) {
      if (context.packageJson?.dependencies?.[pkg] ||
          context.packageJson?.devDependencies?.[pkg]) {
        evidence.push(`TypeScript package detected: ${pkg}`);
        confidence += 0.1;
      }
    }

    // Check for TypeScript config files
    const tsConfigFiles = [
      'tsconfig.json', 'tsconfig.build.json', 'tsconfig.dev.json',
      '.eslintrc.ts', 'jest.config.ts', 'vite.config.ts', 'webpack.config.ts'
    ];

    for (const configFile of tsConfigFiles) {
      if (context.configFiles.includes(configFile)) {
        evidence.push(`TypeScript config file: ${configFile}`);
        confidence += 0.2;
      }
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
      metadata: {
        hasTsConfig: context.configFiles.includes('tsconfig.json'),
        hasTypeScript: !!(context.packageJson?.dependencies?.['typescript'] || context.packageJson?.devDependencies?.['typescript']),
        tsFilesCount: tsFiles.length,
        dtsFilesCount: dtsFiles.length,
        tsPackagesFound: tsPackages.filter(pkg =>
          context.packageJson?.dependencies?.[pkg] || context.packageJson?.devDependencies?.[pkg]
        )
      }
    };
  }

  /**
   * Detect TypeScript version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Try package.json typescript dependency
    if (context.packageJson?.dependencies?.['typescript']) {
      const version = context.packageJson.dependencies['typescript'];
      const match = version.match(/^[\^~]?(\d+\.\d+)/);
      return match ? match[1] : undefined;
    }

    if (context.packageJson?.devDependencies?.['typescript']) {
      const version = context.packageJson.devDependencies['typescript'];
      const match = version.match(/^[\^~]?(\d+\.\d+)/);
      return match ? match[1] : undefined;
    }

    // Try tsconfig.json compilerOptions.target
    try {
      const tsconfigPath = path.join(context.projectRoot, 'tsconfig.json');
      if (await fs.pathExists(tsconfigPath)) {
        const tsconfig = await fs.readJson(tsconfigPath);
        const target = tsconfig.compilerOptions?.target;
        if (target) {
          // Map target to approximate TS version
          const targetMap: Record<string, string> = {
            'ES5': '2.0',
            'ES6': '2.0',
            'ES2015': '2.0',
            'ES2016': '2.1',
            'ES2017': '2.3',
            'ES2018': '2.9',
            'ES2019': '3.2',
            'ES2020': '3.8',
            'ES2021': '4.2',
            'ES2022': '4.7',
            'ESNext': '5.0'
          };
          return targetMap[target] || '4.0';
        }
      }
    } catch (error) {
      // Ignore errors
    }

    // Try package-lock.json for precise version
    try {
      const packageLockPath = path.join(context.projectRoot, 'package-lock.json');
      if (await fs.pathExists(packageLockPath)) {
        const packageLock = await fs.readJson(packageLockPath);
        const tsPackage = packageLock.dependencies?.typescript ||
                         packageLock.packages?.['node_modules/typescript'];

        if (tsPackage?.version) {
          const match = tsPackage.version.match(/^v?(\d+\.\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return undefined;
  }

  /**
   * Get TypeScript configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'tsconfig.json',
      'tsconfig.build.json',
      'tsconfig.dev.json',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      '.eslintrc.ts',
      'jest.config.ts',
      'vite.config.ts',
      'webpack.config.ts',
      'rollup.config.ts'
    ];
  }

  /**
   * Get TypeScript file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.ts', '.tsx', '.d.ts'];
  }

  /**
   * Get TypeScript directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'src/',
      'lib/',
      'types/',
      '@types/',
      'dist/',
      'build/',
      'node_modules/',
      'typings/'
    ];
  }

  /**
   * Get TypeScript runtime
   */
  static getRuntime(): string {
    return 'node';
  }
}