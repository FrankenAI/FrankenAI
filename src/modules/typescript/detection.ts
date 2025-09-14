import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';
import { VersionUtils, type NpmVersionInfo } from '../../core/utils/VersionUtils.js';

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
    const versionInfo = await VersionUtils.detectNpmVersionInfo('typescript', context);
    return versionInfo ? versionInfo.major.toString() : undefined;
  }

  /**
   * Get detailed version information
   */
  static async getVersionInfo(context: DetectionContext): Promise<NpmVersionInfo | null> {
    return VersionUtils.detectNpmVersionInfo('typescript', context);
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