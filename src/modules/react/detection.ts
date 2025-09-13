import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

/**
 * React detection utilities
 */
export class ReactDetection {
  /**
   * Detect React framework
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for React in package.json dependencies
    if (context.packageJson?.dependencies?.['react']) {
      evidence.push('react in package.json dependencies');
      confidence += 0.9;
    }

    if (context.packageJson?.devDependencies?.['react']) {
      evidence.push('react in package.json devDependencies');
      confidence += 0.9;
    }

    // Check for React DOM (stronger indicator of React app)
    if (context.packageJson?.dependencies?.['react-dom']) {
      evidence.push('react-dom in dependencies');
      confidence += 0.8;
    }

    // Check for Create React App
    if (context.packageJson?.dependencies?.['react-scripts'] ||
        context.packageJson?.devDependencies?.['react-scripts']) {
      evidence.push('Create React App detected');
      confidence += 0.7;
    }

    // Check for Vite with React plugin
    if (context.configFiles.includes('vite.config.js') || context.configFiles.includes('vite.config.ts')) {
      if (context.packageJson?.dependencies?.['@vitejs/plugin-react'] ||
          context.packageJson?.devDependencies?.['@vitejs/plugin-react'] ||
          context.packageJson?.dependencies?.['@vitejs/plugin-react-swc'] ||
          context.packageJson?.devDependencies?.['@vitejs/plugin-react-swc']) {
        evidence.push('Vite with React plugin detected');
        confidence += 0.7;
      }
    }

    // Check for JSX/TSX files
    const reactFiles = context.files.filter(file =>
      file.endsWith('.jsx') || file.endsWith('.tsx') ||
      (file.endsWith('.js') && file.includes('src/')) ||
      (file.endsWith('.ts') && file.includes('src/'))
    );
    if (reactFiles.length > 0) {
      evidence.push(`React component files found: ${reactFiles.length}`);
      confidence += Math.min(reactFiles.length * 0.05, 0.3);
    }

    // Check for React Router
    if (context.packageJson?.dependencies?.['react-router-dom'] ||
        context.packageJson?.devDependencies?.['react-router-dom']) {
      evidence.push('React Router detected');
      confidence += 0.2;
    }

    // Check for popular React state management
    const stateLibs = ['redux', '@reduxjs/toolkit', 'zustand', 'jotai', 'recoil'];
    for (const lib of stateLibs) {
      if (context.packageJson?.dependencies?.[lib] ||
          context.packageJson?.devDependencies?.[lib]) {
        evidence.push(`React state management (${lib}) detected`);
        confidence += 0.1;
        break; // Only count one state management library
      }
    }

    // Check for React-specific directories
    const reactDirs = ['src/components', 'src/pages', 'src/hooks'];
    for (const dir of reactDirs) {
      if (context.files.some(file => file.startsWith(dir + '/'))) {
        evidence.push(`React directory structure: ${dir}`);
        confidence += 0.1;
      }
    }

    // Check for public/index.html (typical React app structure)
    if (context.files.includes('public/index.html')) {
      evidence.push('React app structure (public/index.html)');
      confidence += 0.1;
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
      metadata: {
        hasReactDOM: !!(context.packageJson?.dependencies?.['react-dom']),
        hasReactRouter: !!(context.packageJson?.dependencies?.['react-router-dom'] || context.packageJson?.devDependencies?.['react-router-dom']),
        hasCreateReactApp: !!(context.packageJson?.dependencies?.['react-scripts'] || context.packageJson?.devDependencies?.['react-scripts']),
        reactFilesCount: reactFiles.length
      }
    };
  }

  /**
   * Detect React version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Try package.json first
    if (context.packageJson?.dependencies?.['react']) {
      const version = context.packageJson.dependencies['react'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    if (context.packageJson?.devDependencies?.['react']) {
      const version = context.packageJson.devDependencies['react'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    // Try package-lock.json for more precise version
    try {
      const packageLockPath = path.join(context.projectRoot, 'package-lock.json');
      if (await fs.pathExists(packageLockPath)) {
        const packageLock = await fs.readJson(packageLockPath);
        const reactPackage = packageLock.dependencies?.react || packageLock.packages?.['node_modules/react'];

        if (reactPackage?.version) {
          const match = reactPackage.version.match(/^v?(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return undefined;
  }

  /**
   * Get React configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'vite.config.js',
      'vite.config.ts',
      'webpack.config.js',
      'craco.config.js',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'jsconfig.json'
    ];
  }

  /**
   * Get React file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.js', '.jsx', '.ts', '.tsx'];
  }

  /**
   * Get React directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'src/components/',
      'src/pages/',
      'src/hooks/',
      'src/contexts/',
      'src/utils/',
      'src/assets/',
      'public/',
      'build/',
      'dist/'
    ];
  }
}