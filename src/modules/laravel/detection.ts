import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

/**
 * Laravel detection utilities
 */
export class LaravelDetection {
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
   * Detect Laravel version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Try composer.json first
    if (context.composerJson?.require?.['laravel/framework']) {
      const version = context.composerJson.require['laravel/framework'];
      const match = version.match(/^[\^~]?(\d+)/);
      return match ? match[1] : undefined;
    }

    // Try composer.lock for more precise version
    try {
      const composerLockPath = path.join(context.projectRoot, 'composer.lock');
      if (await fs.pathExists(composerLockPath)) {
        const composerLock = await fs.readJson(composerLockPath);
        const laravelPackage = composerLock.packages?.find(
          (pkg: any) => pkg.name === 'laravel/framework'
        );

        if (laravelPackage) {
          const match = laravelPackage.version.match(/^v?(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    // Try Laravel version command if artisan exists
    if (context.configFiles.includes('artisan')) {
      try {
        const { execSync } = await import('child_process');
        const output = execSync('php artisan --version', {
          cwd: context.projectRoot,
          encoding: 'utf-8',
          timeout: 5000
        });

        const match = output.match(/Laravel Framework (\d+)/);
        return match ? match[1] : undefined;
      } catch (error) {
        // Ignore command execution errors
      }
    }

    return undefined;
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