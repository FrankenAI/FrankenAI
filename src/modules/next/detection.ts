import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';
import { VersionUtils, type NpmVersionInfo } from '../../core/utils/VersionUtils.js';

/**
 * Next.js detection utilities
 */
export class NextDetection {
  /**
   * Detect Next.js framework
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for Next.js in package.json dependencies
    if (context.packageJson?.dependencies?.['next']) {
      evidence.push('next in package.json dependencies');
      confidence += 0.9;
    }

    if (context.packageJson?.devDependencies?.['next']) {
      evidence.push('next in package.json devDependencies');
      confidence += 0.9;
    }

    // Check for Next.js config files
    const nextConfigFiles = ['next.config.js', 'next.config.ts', 'next.config.mjs'];
    for (const configFile of nextConfigFiles) {
      if (context.configFiles.includes(configFile)) {
        evidence.push(`Next.js config file: ${configFile}`);
        confidence += 0.8;
      }
    }

    // Check for Next.js specific directories
    const nextDirs = ['pages', 'app', 'public'];
    for (const dir of nextDirs) {
      if (context.files.some(file => file.startsWith(dir + '/'))) {
        evidence.push(`Next.js directory structure: ${dir}`);
        confidence += 0.3;
      }
    }

    // Check for Next.js specific files
    const nextFiles = [
      'pages/_app.js',
      'pages/_app.tsx',
      'pages/_document.js',
      'pages/_document.tsx',
      'app/layout.js',
      'app/layout.tsx',
      'app/page.js',
      'app/page.tsx'
    ];

    for (const file of nextFiles) {
      if (context.files.includes(file)) {
        evidence.push(`Next.js file: ${file}`);
        confidence += 0.2;
      }
    }

    // Check for .next directory (build output)
    if (context.files.some(file => file.startsWith('.next/'))) {
      evidence.push('Next.js build directory (.next) found');
      confidence += 0.1;
    }

    // Check for Next.js scripts in package.json
    const scripts = context.packageJson?.scripts || {};
    if (scripts['dev']?.includes('next') || scripts['build']?.includes('next') || scripts['start']?.includes('next')) {
      evidence.push('Next.js scripts in package.json');
      confidence += 0.3;
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    const detected = confidence > 0.3;

    return {
      detected,
      confidence,
      evidence: detected ? [...evidence, 'Next.js includes React - excluding standalone React guidelines'] : evidence,
      excludes: detected ? ['react'] : undefined, // Next.js includes React
      metadata: {
        hasNextConfig: nextConfigFiles.some(file => context.configFiles.includes(file)),
        hasPagesDir: context.files.some(file => file.startsWith('pages/')),
        hasAppDir: context.files.some(file => file.startsWith('app/')),
        hasPublicDir: context.files.some(file => file.startsWith('public/'))
      }
    };
  }

  /**
   * Detect Next.js version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const versionInfo = await VersionUtils.detectNpmVersionInfo('next', context);
    return versionInfo ? versionInfo.major.toString() : undefined;
  }

  /**
   * Get detailed version information
   */
  static async getVersionInfo(context: DetectionContext): Promise<NpmVersionInfo | null> {
    return VersionUtils.detectNpmVersionInfo('next', context);
  }

  /**
   * Get Next.js configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'next.config.js',
      'next.config.ts',
      'next.config.mjs',
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'tsconfig.json',
      'jsconfig.json',
      'tailwind.config.js',
      'tailwind.config.ts'
    ];
  }

  /**
   * Get Next.js file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.js', '.jsx', '.ts', '.tsx'];
  }

  /**
   * Get Next.js directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'pages/',
      'app/',
      'public/',
      'components/',
      'lib/',
      'utils/',
      'styles/',
      '.next/',
      'out/'
    ];
  }
}