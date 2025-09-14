import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';
import { VersionUtils, type NpmVersionInfo } from '../../core/utils/VersionUtils.js';

/**
 * Astro detection utilities
 */
export class AstroDetection {
  /**
   * Detect Astro framework
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for Astro in package.json dependencies
    if (context.packageJson?.dependencies?.['astro']) {
      evidence.push('astro in package.json dependencies');
      confidence += 0.9;
    }

    if (context.packageJson?.devDependencies?.['astro']) {
      evidence.push('astro in package.json devDependencies');
      confidence += 0.9;
    }

    // Check for astro.config.js/ts
    const astroConfigFiles = ['astro.config.js', 'astro.config.ts', 'astro.config.mjs'];
    for (const configFile of astroConfigFiles) {
      if (context.configFiles.includes(configFile)) {
        evidence.push(`Astro config file: ${configFile}`);
        confidence += 0.8;
      }
    }

    // Check for .astro files
    const astroFiles = context.files.filter(file => file.endsWith('.astro'));
    if (astroFiles.length > 0) {
      evidence.push(`Astro component files found: ${astroFiles.length}`);
      confidence += Math.min(astroFiles.length * 0.1, 0.5);
    }

    // Check for Astro-specific directories
    const astroDirs = ['src/pages', 'src/components', 'src/layouts'];
    for (const dir of astroDirs) {
      if (context.files.some(file => file.startsWith(dir + '/'))) {
        evidence.push(`Astro directory structure: ${dir}`);
        confidence += 0.1;
      }
    }

    // Check for Astro integrations
    const astroIntegrations = [
      '@astrojs/react', '@astrojs/vue', '@astrojs/svelte', '@astrojs/solid-js',
      '@astrojs/tailwind', '@astrojs/image', '@astrojs/sitemap'
    ];

    for (const integration of astroIntegrations) {
      if (context.packageJson?.dependencies?.[integration] ||
          context.packageJson?.devDependencies?.[integration]) {
        evidence.push(`Astro integration detected: ${integration}`);
        confidence += 0.2;
      }
    }

    // Check for public directory (common in Astro)
    if (context.files.some(file => file.startsWith('public/'))) {
      evidence.push('Public directory found (Astro convention)');
      confidence += 0.1;
    }

    // Check for Astro scripts in package.json
    const scripts = context.packageJson?.scripts || {};
    if (scripts['dev']?.includes('astro') || scripts['build']?.includes('astro') || scripts['preview']?.includes('astro')) {
      evidence.push('Astro scripts in package.json');
      confidence += 0.3;
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
      metadata: {
        hasAstroConfig: astroConfigFiles.some(file => context.configFiles.includes(file)),
        astroFilesCount: astroFiles.length,
        hasPublicDir: context.files.some(file => file.startsWith('public/')),
        integrationsFound: astroIntegrations.filter(integration =>
          context.packageJson?.dependencies?.[integration] || context.packageJson?.devDependencies?.[integration]
        )
      }
    };
  }

  /**
   * Detect Astro version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const versionInfo = await VersionUtils.detectNpmVersionInfo('astro', context);
    return versionInfo ? versionInfo.major.toString() : undefined;
  }

  /**
   * Get detailed version information
   */
  static async getVersionInfo(context: DetectionContext): Promise<NpmVersionInfo | null> {
    return VersionUtils.detectNpmVersionInfo('astro', context);
  }

  /**
   * Get Astro configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'astro.config.js',
      'astro.config.ts',
      'astro.config.mjs',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'tailwind.config.js',
      'tailwind.config.ts'
    ];
  }

  /**
   * Get Astro file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.astro', '.js', '.ts', '.jsx', '.tsx'];
  }

  /**
   * Get Astro directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'src/pages/',
      'src/components/',
      'src/layouts/',
      'public/',
      'dist/',
      'src/content/',
      'src/styles/'
    ];
  }
}