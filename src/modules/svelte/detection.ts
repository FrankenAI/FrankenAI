import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

/**
 * Svelte detection utilities
 */
export class SvelteDetection {
  /**
   * Detect Svelte framework
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for Svelte in package.json dependencies
    if (context.packageJson?.dependencies?.['svelte']) {
      evidence.push('svelte in package.json dependencies');
      confidence += 0.9;
    }

    if (context.packageJson?.devDependencies?.['svelte']) {
      evidence.push('svelte in package.json devDependencies');
      confidence += 0.9;
    }

    // Check for Vite with Svelte plugin
    if (context.configFiles.includes('vite.config.js') || context.configFiles.includes('vite.config.ts')) {
      if (context.packageJson?.dependencies?.['@sveltejs/vite-plugin-svelte'] ||
          context.packageJson?.devDependencies?.['@sveltejs/vite-plugin-svelte']) {
        evidence.push('Vite with Svelte plugin detected');
        confidence += 0.8;
      }
    }

    // Check for Rollup with Svelte plugin
    if (context.configFiles.includes('rollup.config.js')) {
      if (context.packageJson?.dependencies?.['rollup-plugin-svelte'] ||
          context.packageJson?.devDependencies?.['rollup-plugin-svelte']) {
        evidence.push('Rollup with Svelte plugin detected');
        confidence += 0.7;
      }
    }

    // Check for .svelte files
    const svelteFiles = context.files.filter(file => file.endsWith('.svelte'));
    if (svelteFiles.length > 0) {
      evidence.push(`Svelte component files found: ${svelteFiles.length}`);
      confidence += Math.min(svelteFiles.length * 0.1, 0.5);
    }

    // Check for Svelte-specific directories
    const svelteDirs = ['src/lib', 'src/routes', 'src/components'];
    for (const dir of svelteDirs) {
      if (context.files.some(file => file.startsWith(dir + '/'))) {
        evidence.push(`Svelte directory structure: ${dir}`);
        confidence += 0.1;
      }
    }

    // Check for svelte.config.js
    if (context.configFiles.includes('svelte.config.js')) {
      evidence.push('svelte.config.js found');
      confidence += 0.7;
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
      metadata: {
        hasSvelteConfig: context.configFiles.includes('svelte.config.js'),
        hasVitePlugin: !!(context.packageJson?.dependencies?.['@sveltejs/vite-plugin-svelte'] || context.packageJson?.devDependencies?.['@sveltejs/vite-plugin-svelte']),
        hasRollupPlugin: !!(context.packageJson?.dependencies?.['rollup-plugin-svelte'] || context.packageJson?.devDependencies?.['rollup-plugin-svelte']),
        svelteFilesCount: svelteFiles.length
      }
    };
  }

  /**
   * Detect Svelte version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Try package.json first
    if (context.packageJson?.dependencies?.['svelte']) {
      const version = context.packageJson.dependencies['svelte'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    if (context.packageJson?.devDependencies?.['svelte']) {
      const version = context.packageJson.devDependencies['svelte'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    // Try package-lock.json for more precise version
    try {
      const packageLockPath = path.join(context.projectRoot, 'package-lock.json');
      if (await fs.pathExists(packageLockPath)) {
        const packageLock = await fs.readJson(packageLockPath);
        const sveltePackage = packageLock.dependencies?.svelte || packageLock.packages?.['node_modules/svelte'];

        if (sveltePackage?.version) {
          const match = sveltePackage.version.match(/^v?(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return undefined;
  }

  /**
   * Get Svelte configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'svelte.config.js',
      'vite.config.js',
      'vite.config.ts',
      'rollup.config.js',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml'
    ];
  }

  /**
   * Get Svelte file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.svelte', '.js', '.ts'];
  }

  /**
   * Get Svelte directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'src/lib/',
      'src/routes/',
      'src/components/',
      'src/app.html',
      'static/',
      'build/'
    ];
  }
}