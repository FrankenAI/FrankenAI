import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

/**
 * SvelteKit detection utilities
 */
export class SvelteKitDetection {
  /**
   * Detect SvelteKit framework
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for SvelteKit in package.json dependencies
    if (context.packageJson?.dependencies?.['@sveltejs/kit']) {
      evidence.push('@sveltejs/kit in package.json dependencies');
      confidence += 0.9;
    }

    if (context.packageJson?.devDependencies?.['@sveltejs/kit']) {
      evidence.push('@sveltejs/kit in package.json devDependencies');
      confidence += 0.9;
    }

    // Check for SvelteKit adapter
    const adapters = [
      '@sveltejs/adapter-auto',
      '@sveltejs/adapter-static',
      '@sveltejs/adapter-node',
      '@sveltejs/adapter-vercel',
      '@sveltejs/adapter-netlify'
    ];

    for (const adapter of adapters) {
      if (context.packageJson?.dependencies?.[adapter] ||
          context.packageJson?.devDependencies?.[adapter]) {
        evidence.push(`SvelteKit adapter detected: ${adapter}`);
        confidence += 0.3;
        break; // Only count one adapter
      }
    }

    // Check for svelte.config.js with SvelteKit configuration
    if (context.configFiles.includes('svelte.config.js')) {
      try {
        const configPath = path.join(context.projectRoot, 'svelte.config.js');
        if (await fs.pathExists(configPath)) {
          const configContent = await fs.readFile(configPath, 'utf-8');
          if (configContent.includes('@sveltejs/kit') || configContent.includes('kit:')) {
            evidence.push('svelte.config.js with SvelteKit configuration');
            confidence += 0.8;
          }
        }
      } catch (error) {
        // Ignore file read errors
      }
    }

    // Check for SvelteKit-specific directories
    const svelteKitDirs = ['src/routes', 'src/lib', 'src/app.html'];
    for (const dir of svelteKitDirs) {
      if (dir === 'src/app.html') {
        if (context.files.includes(dir)) {
          evidence.push(`SvelteKit file: ${dir}`);
          confidence += 0.3;
        }
      } else {
        if (context.files.some(file => file.startsWith(dir + '/'))) {
          evidence.push(`SvelteKit directory structure: ${dir}`);
          confidence += 0.2;
        }
      }
    }

    // Check for SvelteKit-specific files
    const svelteKitFiles = [
      'src/routes/+layout.svelte',
      'src/routes/+page.svelte',
      'src/routes/+layout.js',
      'src/routes/+page.js',
      'src/routes/+layout.ts',
      'src/routes/+page.ts'
    ];

    for (const file of svelteKitFiles) {
      if (context.files.includes(file)) {
        evidence.push(`SvelteKit file: ${file}`);
        confidence += 0.2;
      }
    }

    // Check for .svelte-kit directory (build output)
    if (context.files.some(file => file.startsWith('.svelte-kit/'))) {
      evidence.push('SvelteKit build directory (.svelte-kit) found');
      confidence += 0.1;
    }

    // Check for SvelteKit scripts in package.json
    const scripts = context.packageJson?.scripts || {};
    if (scripts['dev']?.includes('vite') || scripts['build']?.includes('vite') || scripts['preview']?.includes('vite')) {
      evidence.push('SvelteKit Vite scripts in package.json');
      confidence += 0.2;
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
      metadata: {
        hasSvelteKitConfig: context.configFiles.includes('svelte.config.js'),
        hasRoutesDir: context.files.some(file => file.startsWith('src/routes/')),
        hasAppHtml: context.files.includes('src/app.html'),
        hasAdapter: adapters.some(adapter =>
          context.packageJson?.dependencies?.[adapter] || context.packageJson?.devDependencies?.[adapter]
        )
      }
    };
  }

  /**
   * Detect SvelteKit version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Try package.json first
    if (context.packageJson?.dependencies?.['@sveltejs/kit']) {
      const version = context.packageJson.dependencies['@sveltejs/kit'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    if (context.packageJson?.devDependencies?.['@sveltejs/kit']) {
      const version = context.packageJson.devDependencies['@sveltejs/kit'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    // Try package-lock.json for more precise version
    try {
      const packageLockPath = path.join(context.projectRoot, 'package-lock.json');
      if (await fs.pathExists(packageLockPath)) {
        const packageLock = await fs.readJson(packageLockPath);
        const svelteKitPackage = packageLock.dependencies?.['@sveltejs/kit'] ||
                                 packageLock.packages?.['node_modules/@sveltejs/kit'];

        if (svelteKitPackage?.version) {
          const match = svelteKitPackage.version.match(/^v?(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return undefined;
  }

  /**
   * Get SvelteKit configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'svelte.config.js',
      'vite.config.js',
      'vite.config.ts',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'tsconfig.json'
    ];
  }

  /**
   * Get SvelteKit file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.svelte', '.js', '.ts'];
  }

  /**
   * Get SvelteKit directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'src/routes/',
      'src/lib/',
      'src/params/',
      'src/hooks.client.js',
      'src/hooks.server.js',
      'src/app.html',
      'static/',
      'build/',
      '.svelte-kit/'
    ];
  }
}