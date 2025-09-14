import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

/**
 * Version information for Laravel
 */
interface LaravelVersionInfo {
  raw: string;           // '^11.0.0'
  major: number;         // 11
  installed?: string;    // '11.2.3' (if found in composer.lock)
  source: 'dependency' | 'installed' | 'both' | 'command';
}

/**
 * Laravel detection utilities
 */
export class LaravelDetection {
  /**
   * Get major version from semver string
   */
  private static getMajorVersion(versionSpec: string): number {
    const cleaned = semver.clean(versionSpec) || semver.minVersion(versionSpec)?.version;
    return semver.major(cleaned || '0.0.0');
  }

  /**
   * Get installed Laravel version from composer.lock
   */
  private static async getInstalledVersion(projectRoot: string): Promise<string | null> {
    try {
      const composerLockPath = path.join(projectRoot, 'vendor/composer/installed.json');

      if (await fs.pathExists(composerLockPath)) {
        const installed = await fs.readJson(composerLockPath);
        const packages = installed.packages || installed; // Handle different formats

        const laravelPackage = Array.isArray(packages)
          ? packages.find((pkg: any) => pkg.name === 'laravel/framework')
          : null;

        return laravelPackage?.version || null;
      }

      // Fallback to composer.lock
      const composerLockFallback = path.join(projectRoot, 'composer.lock');
      if (await fs.pathExists(composerLockFallback)) {
        const composerLock = await fs.readJson(composerLockFallback);
        const laravelPackage = composerLock.packages?.find(
          (pkg: any) => pkg.name === 'laravel/framework'
        );
        return laravelPackage?.version || null;
      }
    } catch (error) {
      // Ignore file read errors
    }
    return null;
  }

  /**
   * Detect Laravel version with hybrid approach
   */
  private static async detectVersionInfo(context: DetectionContext): Promise<LaravelVersionInfo | null> {
    const dependencySpec = context.composerJson?.require?.['laravel/framework'];
    if (!dependencySpec) return null;

    const specMajor = this.getMajorVersion(dependencySpec);
    const installedVersion = await this.getInstalledVersion(context.projectRoot);
    const installedMajor = installedVersion ? this.getMajorVersion(installedVersion) : null;

    // Priorité à la version installée si elle existe
    const effectiveMajor = installedMajor || specMajor;
    const source = installedMajor && specMajor
      ? 'both'
      : installedMajor ? 'installed' : 'dependency';

    return {
      raw: dependencySpec,
      major: effectiveMajor,
      installed: installedVersion || undefined,
      source
    };
  }
  /**
   * Detect Laravel framework
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for artisan file (strongest indicator)
    if (context.configFiles.includes('artisan')) {
      evidence.push('artisan command file found');
      confidence += 0.9;
    }

    // Check composer.json for Laravel framework
    if (context.composerJson?.require?.['laravel/framework']) {
      evidence.push('laravel/framework in composer.json dependencies');
      confidence += 0.8;
    }

    // Check for Laravel directory structure
    const laravelDirs = [
      'app/Http',
      'app/Models',
      'routes',
      'database/migrations',
      'resources/views'
    ];

    for (const dir of laravelDirs) {
      if (context.files.some(file => file.startsWith(dir + '/'))) {
        evidence.push(`Laravel directory structure: ${dir}`);
        confidence += 0.1;
      }
    }

    // Check for Laravel-specific files
    const laravelFiles = [
      'routes/web.php',
      'routes/api.php',
      'config/app.php',
      'app/Http/Kernel.php'
    ];

    for (const file of laravelFiles) {
      if (context.files.includes(file)) {
        evidence.push(`Laravel file: ${file}`);
        confidence += 0.15;
      }
    }

    // Check for Laravel config files
    const configFiles = context.files.filter(file => file.startsWith('config/') && file.endsWith('.php'));
    if (configFiles.length > 5) {
      evidence.push(`Laravel config files found: ${configFiles.length}`);
      confidence += 0.2;
    }

    // Check for .env file (common in Laravel)
    if (context.configFiles.includes('.env')) {
      const envPath = path.join(context.projectRoot, '.env');
      try {
        if (await fs.pathExists(envPath)) {
          const envContent = await fs.readFile(envPath, 'utf-8');
          if (envContent.includes('APP_NAME=') || envContent.includes('APP_KEY=')) {
            evidence.push('.env file with Laravel variables');
            confidence += 0.1;
          }
        }
      } catch (error) {
        // Ignore file read errors
      }
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3, // Require at least 30% confidence
      confidence,
      evidence,
      metadata: {
        hasArtisan: context.configFiles.includes('artisan'),
        hasComposerJson: !!context.composerJson,
        laravelDirsFound: laravelDirs.filter(dir =>
          context.files.some(file => file.startsWith(dir + '/'))
        ),
        configFilesCount: configFiles.length
      }
    };
  }

  /**
   * Detect Laravel version using semver-aware approach
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const versionInfo = await this.detectVersionInfo(context);
    return versionInfo ? versionInfo.major.toString() : undefined;
  }

  /**
   * Get detailed version information
   */
  static async getVersionInfo(context: DetectionContext): Promise<LaravelVersionInfo | null> {
    return this.detectVersionInfo(context);
  }


  /**
   * Get Laravel configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'artisan',
      'composer.json',
      'composer.lock',
      '.env',
      '.env.example',
      'phpunit.xml',
      'server.php'
    ];
  }

  /**
   * Get Laravel file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.php'];
  }

  /**
   * Get Laravel directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'app/Http/',
      'app/Models/',
      'app/Console/',
      'app/Providers/',
      'bootstrap/',
      'config/',
      'database/migrations/',
      'database/factories/',
      'database/seeders/',
      'public/',
      'resources/views/',
      'resources/lang/',
      'routes/',
      'storage/',
      'tests/Feature/',
      'tests/Unit/'
    ];
  }
}