import fs from 'fs-extra';
import path from 'path';
import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

/**
 * PHP detection utilities
 */
export class PHPDetection {
  /**
   * Detect PHP language
   */
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for composer.json (strongest PHP indicator)
    if (context.composerJson) {
      evidence.push('composer.json found');
      confidence += 0.9;
    }

    // Check for .php files
    const phpFiles = context.files.filter(file => file.endsWith('.php'));
    if (phpFiles.length > 0) {
      evidence.push(`PHP files found: ${phpFiles.length}`);
      confidence += Math.min(phpFiles.length * 0.1, 0.7);
    }

    // Check for PHP-specific config files
    const phpConfigFiles = ['php.ini', '.php-version', '.php-cs-fixer.php', 'phpunit.xml', 'phpstan.neon'];
    for (const configFile of phpConfigFiles) {
      if (context.configFiles.includes(configFile)) {
        evidence.push(`PHP config file: ${configFile}`);
        confidence += 0.2;
      }
    }

    // Check for PHP directories
    const phpDirs = ['vendor/', 'app/', 'src/', 'public/'];
    for (const dir of phpDirs) {
      if (context.files.some(file => file.startsWith(dir))) {
        evidence.push(`PHP directory structure: ${dir}`);
        confidence += 0.1;
      }
    }

    // Check for index.php or other common PHP entry points
    const phpEntryPoints = ['index.php', 'public/index.php', 'web/index.php'];
    for (const entryPoint of phpEntryPoints) {
      if (context.files.includes(entryPoint)) {
        evidence.push(`PHP entry point: ${entryPoint}`);
        confidence += 0.2;
      }
    }

    // Ensure confidence doesn't exceed 1.0
    confidence = Math.min(confidence, 1.0);

    return {
      detected: confidence > 0.3,
      confidence,
      evidence,
      metadata: {
        hasComposerJson: !!context.composerJson,
        phpFilesCount: phpFiles.length,
        hasVendorDir: context.files.some(file => file.startsWith('vendor/')),
        configFilesFound: phpConfigFiles.filter(file => context.configFiles.includes(file))
      }
    };
  }

  /**
   * Detect PHP version
   */
  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Try composer.json require.php constraint
    if (context.composerJson?.require?.php) {
      const phpConstraint = context.composerJson.require.php;
      const match = phpConstraint.match(/(\d+\.\d+)/);
      return match ? match[1] : undefined;
    }

    // Try .php-version file
    try {
      const phpVersionPath = path.join(context.projectRoot, '.php-version');
      if (await fs.pathExists(phpVersionPath)) {
        const phpVersion = await fs.readFile(phpVersionPath, 'utf-8');
        const match = phpVersion.trim().match(/(\d+\.\d+)/);
        return match ? match[1] : undefined;
      }
    } catch (error) {
      // Ignore errors
    }

    // Try composer.lock platform.php
    try {
      const composerLockPath = path.join(context.projectRoot, 'composer.lock');
      if (await fs.pathExists(composerLockPath)) {
        const composerLock = await fs.readJson(composerLockPath);
        const platformPhp = composerLock.platform?.php;
        if (platformPhp) {
          const match = platformPhp.match(/(\d+\.\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return undefined;
  }

  /**
   * Get PHP configuration files
   */
  static getConfigFiles(): string[] {
    return [
      'composer.json',
      'composer.lock',
      '.php-version',
      'php.ini',
      '.php-cs-fixer.php',
      'phpunit.xml',
      'phpunit.xml.dist',
      'phpstan.neon',
      'phpstan.neon.dist',
      'psalm.xml',
      'pint.json'
    ];
  }

  /**
   * Get PHP file extensions
   */
  static getSupportedExtensions(): string[] {
    return ['.php', '.phtml', '.php4', '.php5', '.phps'];
  }

  /**
   * Get PHP directory indicators
   */
  static getDirectoryIndicators(): string[] {
    return [
      'vendor/',
      'app/',
      'src/',
      'public/',
      'web/',
      'lib/',
      'include/',
      'tests/'
    ];
  }

  /**
   * Get PHP runtime
   */
  static getRuntime(): string {
    return 'php';
  }
}