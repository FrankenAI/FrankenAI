import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

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

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
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
    // Try package.json first
    if (context.packageJson?.dependencies?.['nuxt']) {
      const version = context.packageJson.dependencies['nuxt'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    if (context.packageJson?.devDependencies?.['nuxt']) {
      const version = context.packageJson.devDependencies['nuxt'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    // Check for legacy Nuxt 2 packages
    if (context.packageJson?.dependencies?.['nuxt-edge'] ||
        context.packageJson?.devDependencies?.['nuxt-edge']) {
      return '2'; // Nuxt Edge was primarily Nuxt 2
    }

    // Try package-lock.json for more precise version
    try {
      const packageLockPath = path.join(context.projectRoot, 'package-lock.json');
      if (await fs.pathExists(packageLockPath)) {
        const packageLock = await fs.readJson(packageLockPath);
        const nuxtPackage = packageLock.dependencies?.nuxt || packageLock.packages?.['node_modules/nuxt'];

        if (nuxtPackage?.version) {
          const match = nuxtPackage.version.match(/^v?(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    // Try yarn.lock
    try {
      const yarnLockPath = path.join(context.projectRoot, 'yarn.lock');
      if (await fs.pathExists(yarnLockPath)) {
        const yarnLock = await fs.readFile(yarnLockPath, 'utf-8');
        const nuxtMatch = yarnLock.match(/nuxt@[\^~]?(\d+\.\d+\.\d+)/);
        if (nuxtMatch) {
          const majorVersion = nuxtMatch[1].split('.')[0];
          return majorVersion;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return undefined;
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