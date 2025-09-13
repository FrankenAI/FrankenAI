import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

/**
 * Vue.js detection utilities
 */
export class VueDetection {
  /**
   * Detect Vue.js framework
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for Vue in package.json dependencies
    if (context.packageJson?.dependencies?.['vue']) {
      evidence.push('vue in package.json dependencies');
      confidence += 0.9;
    }

    if (context.packageJson?.devDependencies?.['vue']) {
      evidence.push('vue in package.json devDependencies');
      confidence += 0.9;
    }

    // Check for Vue-specific config files
    const vueConfigFiles = ['vue.config.js', 'vue.config.ts'];
    for (const configFile of vueConfigFiles) {
      if (context.configFiles.includes(configFile)) {
        evidence.push(`Vue config file: ${configFile}`);
        confidence += 0.8;
      }
    }

    // Check for Vite with Vue plugin
    if (context.configFiles.includes('vite.config.js') || context.configFiles.includes('vite.config.ts')) {
      if (context.packageJson?.dependencies?.['@vitejs/plugin-vue'] ||
          context.packageJson?.devDependencies?.['@vitejs/plugin-vue']) {
        evidence.push('Vite with Vue plugin detected');
        confidence += 0.7;
      }
    }

    // Check for .vue files
    const vueFiles = context.files.filter(file => file.endsWith('.vue'));
    if (vueFiles.length > 0) {
      evidence.push(`Vue SFC files found: ${vueFiles.length}`);
      confidence += Math.min(vueFiles.length * 0.1, 0.5);
    }

    // Check for Vue Router
    if (context.packageJson?.dependencies?.['vue-router'] ||
        context.packageJson?.devDependencies?.['vue-router']) {
      evidence.push('Vue Router detected');
      confidence += 0.2;
    }

    // Check for Vuex or Pinia
    if (context.packageJson?.dependencies?.['vuex'] ||
        context.packageJson?.devDependencies?.['vuex'] ||
        context.packageJson?.dependencies?.['pinia'] ||
        context.packageJson?.devDependencies?.['pinia']) {
      evidence.push('Vue state management (Vuex/Pinia) detected');
      confidence += 0.2;
    }

    // Check for Vue-specific directories
    const vueDirs = ['src/components', 'src/views', 'src/pages'];
    for (const dir of vueDirs) {
      if (context.files.some(file => file.startsWith(dir + '/'))) {
        evidence.push(`Vue directory structure: ${dir}`);
        confidence += 0.1;
      }
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
      metadata: {
        hasVueConfig: vueConfigFiles.some(file => context.configFiles.includes(file)),
        hasVueRouter: !!(context.packageJson?.dependencies?.['vue-router'] || context.packageJson?.devDependencies?.['vue-router']),
        hasStateManagement: !!(
          context.packageJson?.dependencies?.['vuex'] || context.packageJson?.devDependencies?.['vuex'] ||
          context.packageJson?.dependencies?.['pinia'] || context.packageJson?.devDependencies?.['pinia']
        ),
        vueFilesCount: vueFiles.length
      }
    };
  }

  /**
   * Detect Vue version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Try package.json first
    if (context.packageJson?.dependencies?.['vue']) {
      const version = context.packageJson.dependencies['vue'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    if (context.packageJson?.devDependencies?.['vue']) {
      const version = context.packageJson.devDependencies['vue'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    // Try package-lock.json for more precise version
    try {
      const packageLockPath = path.join(context.projectRoot, 'package-lock.json');
      if (await fs.pathExists(packageLockPath)) {
        const packageLock = await fs.readJson(packageLockPath);
        const vuePackage = packageLock.dependencies?.vue || packageLock.packages?.['node_modules/vue'];

        if (vuePackage?.version) {
          const match = vuePackage.version.match(/^v?(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return undefined;
  }

  /**
   * Get Vue configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'vue.config.js',
      'vue.config.ts',
      'vite.config.js',
      'vite.config.ts',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml'
    ];
  }

  /**
   * Get Vue file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.vue', '.js', '.ts', '.jsx', '.tsx'];
  }

  /**
   * Get Vue directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'src/components/',
      'src/views/',
      'src/pages/',
      'src/assets/',
      'src/stores/',
      'src/router/',
      'public/',
      'dist/'
    ];
  }
}