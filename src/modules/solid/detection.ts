import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';
import { VersionUtils, type NpmVersionInfo } from '../../core/utils/VersionUtils.js';

/**
 * Solid.js detection utilities
 */
export class SolidDetection {
  /**
   * Detect Solid.js framework
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for solid-js in package.json dependencies
    if (context.packageJson?.dependencies?.['solid-js']) {
      evidence.push('solid-js in package.json dependencies');
      confidence += 0.9;
    }

    if (context.packageJson?.devDependencies?.['solid-js']) {
      evidence.push('solid-js in package.json devDependencies');
      confidence += 0.9;
    }

    // Check for Vite with Solid plugin
    if (context.configFiles.includes('vite.config.js') || context.configFiles.includes('vite.config.ts')) {
      if (context.packageJson?.dependencies?.['vite-plugin-solid'] ||
          context.packageJson?.devDependencies?.['vite-plugin-solid']) {
        evidence.push('Vite with Solid plugin detected');
        confidence += 0.8;
      }
    }

    // Check for SolidJS build tools
    const solidBuildTools = [
      'vite-plugin-solid',
      '@solidjs/router',
      'solid-start',
      'babel-preset-solid'
    ];

    for (const tool of solidBuildTools) {
      if (context.packageJson?.dependencies?.[tool] ||
          context.packageJson?.devDependencies?.[tool]) {
        evidence.push(`Solid build tool detected: ${tool}`);
        confidence += 0.3;
      }
    }

    // Check for .jsx/.tsx files (common in Solid)
    const jsxFiles = context.files.filter(file =>
      file.endsWith('.jsx') || file.endsWith('.tsx')
    );
    if (jsxFiles.length > 0) {
      evidence.push(`JSX/TSX files found: ${jsxFiles.length}`);
      confidence += Math.min(jsxFiles.length * 0.05, 0.3);
    }

    // Check for Solid-specific directories
    const solidDirs = ['src/components', 'src/routes', 'src/pages'];
    for (const dir of solidDirs) {
      if (context.files.some(file => file.startsWith(dir + '/'))) {
        evidence.push(`Solid directory structure: ${dir}`);
        confidence += 0.1;
      }
    }

    // Check for solid-start config
    if (context.configFiles.includes('app.config.ts') || context.configFiles.includes('app.config.js')) {
      evidence.push('Solid Start config detected');
      confidence += 0.3;
    }

    // Check for Solid scripts in package.json
    const scripts = context.packageJson?.scripts || {};
    const solidScripts = Object.entries(scripts).filter(([, script]) =>
      typeof script === 'string' && (script.includes('solid') || script.includes('vite-plugin-solid'))
    );

    if (solidScripts.length > 0) {
      evidence.push('Solid-related scripts in package.json');
      confidence += 0.2;
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
      metadata: {
        hasSolidJs: !!(context.packageJson?.dependencies?.['solid-js'] || context.packageJson?.devDependencies?.['solid-js']),
        hasVitePlugin: !!(context.packageJson?.dependencies?.['vite-plugin-solid'] || context.packageJson?.devDependencies?.['vite-plugin-solid']),
        hasSolidStart: !!(context.packageJson?.dependencies?.['solid-start'] || context.packageJson?.devDependencies?.['solid-start']),
        jsxFilesCount: jsxFiles.length,
        buildToolsFound: solidBuildTools.filter(tool =>
          context.packageJson?.dependencies?.[tool] || context.packageJson?.devDependencies?.[tool]
        )
      }
    };
  }

  /**
   * Detect Solid.js version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const versionInfo = await VersionUtils.detectNpmVersionInfo('solid-js', context);
    return versionInfo ? versionInfo.major.toString() : undefined;
  }

  /**
   * Get detailed version information
   */
  static async getVersionInfo(context: DetectionContext): Promise<NpmVersionInfo | null> {
    return VersionUtils.detectNpmVersionInfo('solid-js', context);
  }

  /**
   * Get Solid configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'vite.config.js',
      'vite.config.ts',
      'app.config.js',
      'app.config.ts',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'babel.config.js',
      '.babelrc'
    ];
  }

  /**
   * Get Solid file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.jsx', '.tsx', '.js', '.ts'];
  }

  /**
   * Get Solid directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'src/components/',
      'src/routes/',
      'src/pages/',
      'src/',
      'public/',
      'dist/',
      'build/'
    ];
  }
}