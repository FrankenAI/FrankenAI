import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';
import { VersionUtils, type NpmVersionInfo } from '../../core/utils/VersionUtils.js';

/**
 * Nuxt.js detection utilities
 */
export class NuxtDetection {
  /**
   * Detect Nuxt.js framework
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for Nuxt in package.json dependencies
    if (context.packageJson?.dependencies?.['nuxt']) {
      evidence.push('nuxt in package.json dependencies');
      confidence += 0.9;
    }

    if (context.packageJson?.devDependencies?.['nuxt']) {
      evidence.push('nuxt in package.json devDependencies');
      confidence += 0.9;
    }

    // Check for legacy Nuxt 2 packages
    if (context.packageJson?.dependencies?.['nuxt-edge'] ||
        context.packageJson?.devDependencies?.['nuxt-edge']) {
      evidence.push('nuxt-edge in dependencies');
      confidence += 0.8;
    }

    // Check for Nuxt config files
    const nuxtConfigFiles = ['nuxt.config.js', 'nuxt.config.ts'];
    for (const configFile of nuxtConfigFiles) {
      if (context.configFiles.includes(configFile)) {
        evidence.push(`Nuxt config file: ${configFile}`);
        confidence += 0.8;
      }
    }

    // Check for Nuxt-specific directories
    const nuxtDirs = ['pages', 'components', 'layouts', 'middleware', 'plugins', 'assets', 'static'];
    let dirCount = 0;
    for (const dir of nuxtDirs) {
      if (context.files.some(file => file.startsWith(dir + '/'))) {
        evidence.push(`Nuxt directory structure: ${dir}`);
        confidence += 0.1;
        dirCount++;
      }
    }

    // Bonus for multiple Nuxt directories
    if (dirCount >= 3) {
      evidence.push('Multiple Nuxt directories found');
      confidence += 0.2;
    }

    // Check for .nuxt directory (build output)
    if (context.files.some(file => file.startsWith('.nuxt/'))) {
      evidence.push('Nuxt build directory (.nuxt) found');
      confidence += 0.1;
    }

    // Check for Nuxt scripts in package.json
    const scripts = context.packageJson?.scripts || {};
    if (scripts['dev']?.includes('nuxt') || scripts['build']?.includes('nuxt') || scripts['generate']?.includes('nuxt')) {
      evidence.push('Nuxt scripts in package.json');
      confidence += 0.3;
    }

    // Check for Vue dependency (Nuxt is Vue-based)
    if (context.packageJson?.dependencies?.['vue'] || context.packageJson?.devDependencies?.['vue']) {
      evidence.push('Vue.js detected (Nuxt dependency)');
      confidence += 0.1;
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    const detected = confidence > 0.3;

    return {
      detected,
      confidence,
      evidence: detected ? [...evidence, 'Nuxt.js includes Vue.js - excluding standalone Vue guidelines'] : evidence,
      excludes: detected ? ['vue'] : undefined, // Nuxt includes Vue
      metadata: {
        hasNuxtConfig: nuxtConfigFiles.some(file => context.configFiles.includes(file)),
        hasPagesDir: context.files.some(file => file.startsWith('pages/')),
        hasComponentsDir: context.files.some(file => file.startsWith('components/')),
        hasLayoutsDir: context.files.some(file => file.startsWith('layouts/')),
        nuxtDirCount: dirCount
      }
    };
  }

  /**
   * Detect Nuxt version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const versionInfo = await VersionUtils.detectNpmVersionInfo('nuxt', context);
    return versionInfo ? versionInfo.major.toString() : undefined;
  }

  /**
   * Get detailed version information
   */
  static async getVersionInfo(context: DetectionContext): Promise<NpmVersionInfo | null> {
    return VersionUtils.detectNpmVersionInfo('nuxt', context);
  }

  /**
   * Get Nuxt configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'nuxt.config.js',
      'nuxt.config.ts',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'tsconfig.json'
    ];
  }

  /**
   * Get Nuxt file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.vue', '.js', '.ts', '.jsx', '.tsx'];
  }

  /**
   * Get Nuxt directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'pages/',
      'components/',
      'layouts/',
      'middleware/',
      'plugins/',
      'assets/',
      'static/',
      'public/',
      '.nuxt/',
      'dist/'
    ];
  }
}