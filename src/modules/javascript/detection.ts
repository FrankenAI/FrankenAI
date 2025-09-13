import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

/**
 * JavaScript detection utilities
 */
export class JavaScriptDetection {
  /**
   * Detect JavaScript language
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for package.json (strong JavaScript indicator)
    if (context.packageJson) {
      evidence.push('package.json found');
      confidence += 0.8;
    }

    // Check for .js files
    const jsFiles = context.files.filter(file =>
      file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')
    );
    if (jsFiles.length > 0) {
      evidence.push(`JavaScript files found: ${jsFiles.length}`);
      confidence += Math.min(jsFiles.length * 0.05, 0.5);
    }

    // Check for Node.js specific files
    const nodeFiles = ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'];
    for (const nodeFile of nodeFiles) {
      if (context.configFiles.includes(nodeFile)) {
        evidence.push(`Node.js file: ${nodeFile}`);
        confidence += 0.2;
        break; // Only count one Node.js indicator
      }
    }

    // Check for JavaScript config files
    const jsConfigFiles = [
      '.eslintrc.js', '.eslintrc.cjs', '.eslintrc.mjs',
      'babel.config.js', 'webpack.config.js', 'rollup.config.js',
      'vite.config.js', 'jest.config.js', 'vitest.config.js'
    ];

    for (const configFile of jsConfigFiles) {
      if (context.configFiles.includes(configFile)) {
        evidence.push(`JavaScript config file: ${configFile}`);
        confidence += 0.1;
      }
    }

    // Check for typical JavaScript directories
    const jsDirs = ['src/', 'lib/', 'public/', 'dist/', 'build/', 'node_modules/'];
    for (const dir of jsDirs) {
      if (context.files.some(file => file.startsWith(dir))) {
        evidence.push(`JavaScript directory: ${dir}`);
        confidence += 0.05;
      }
    }

    // Check if NOT TypeScript (lower confidence if TS files present)
    const tsFiles = context.files.filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'));
    if (tsFiles.length > jsFiles.length) {
      evidence.push('More TypeScript files detected, reducing JavaScript confidence');
      confidence *= 0.5; // Reduce confidence if more TS than JS
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
      metadata: {
        hasPackageJson: !!context.packageJson,
        jsFilesCount: jsFiles.length,
        tsFilesCount: tsFiles.length,
        hasNodeModules: context.files.some(file => file.startsWith('node_modules/')),
        configFilesFound: jsConfigFiles.filter(file => context.configFiles.includes(file))
      }
    };
  }

  /**
   * Detect JavaScript version (Node.js/ES version)
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Try package.json engines.node
    if (context.packageJson?.engines?.node) {
      const nodeConstraint = context.packageJson.engines.node;
      const match = nodeConstraint.match(/(\d+)/);
      return match ? `ES${2015 + parseInt(match[1]) - 6}` : undefined; // Rough ES version mapping
    }

    // Try .nvmrc
    try {
      const nvmrcPath = path.join(context.projectRoot, '.nvmrc');
      if (await fs.pathExists(nvmrcPath)) {
        const nodeVersion = await fs.readFile(nvmrcPath, 'utf-8');
        const match = nodeVersion.trim().match(/(\d+)/);
        return match ? `ES${2015 + parseInt(match[1]) - 6}` : undefined;
      }
    } catch (error) {
      // Ignore errors
    }

    // Try package.json browserslist (for browser JS)
    if (context.packageJson?.browserslist) {
      return 'ES2020'; // Modern browser default
    }

    // Default modern JS
    return 'ES2020';
  }

  /**
   * Get JavaScript configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'bun.lockb',
      '.nvmrc',
      '.eslintrc.js',
      '.eslintrc.cjs',
      '.eslintrc.mjs',
      '.eslintrc.json',
      'babel.config.js',
      'webpack.config.js',
      'rollup.config.js',
      'vite.config.js',
      'jest.config.js',
      'vitest.config.js',
      'jsconfig.json'
    ];
  }

  /**
   * Get JavaScript file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.js', '.mjs', '.cjs', '.jsx'];
  }

  /**
   * Get JavaScript directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'src/',
      'lib/',
      'public/',
      'dist/',
      'build/',
      'node_modules/',
      'scripts/',
      'utils/',
      'helpers/'
    ];
  }

  /**
   * Get JavaScript runtime
   */
  static getRuntime(): string {
    return 'node';
  }
}