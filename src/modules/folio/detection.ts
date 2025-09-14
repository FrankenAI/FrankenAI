import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

export class FolioDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check composer.json for Folio dependency
    const composerJson = context.composerJson;
    if (composerJson) {
      if (composerJson.require?.['laravel/folio'] ||
          composerJson['require-dev']?.['laravel/folio']) {
        evidence.push('Laravel Folio found in composer.json dependencies');
        confidence += 0.8;
      }
    }

    // Check for Laravel framework (required for Folio)
    const hasLaravel = this.hasLaravelFramework(composerJson);
    if (!hasLaravel && confidence > 0) {
      evidence.push('Warning: Folio requires Laravel framework');
      confidence *= 0.5; // Reduce confidence if no Laravel
    } else if (hasLaravel) {
      evidence.push('Laravel framework detected (required for Folio)');
      confidence += 0.2;
    }

    // Check for Folio pages directory structure
    const hasPagesDirectory = context.files.some(file =>
      file.startsWith('resources/views/pages/') && file.endsWith('.blade.php')
    );

    if (hasPagesDirectory) {
      evidence.push('Folio pages directory found (resources/views/pages/)');
      confidence += 0.6;
    }

    // Check for Folio-specific configuration
    const configFiles = this.getConfigFiles();
    const foundConfigFiles = context.configFiles.filter(file =>
      configFiles.includes(file)
    );

    if (foundConfigFiles.length > 0) {
      evidence.push(`Folio config found: ${foundConfigFiles.join(', ')}`);
      confidence += 0.3;
    }

    // Look for Folio page patterns
    const hasFolioPages = this.hasFolioPagePatterns(context.files);
    if (hasFolioPages) {
      evidence.push('Folio page patterns detected in files');
      confidence += 0.4;
    }

    // Check for service provider registration (in config/app.php or bootstrap/providers.php)
    const hasServiceProvider = context.files.some(file =>
      (file === 'config/app.php' || file === 'bootstrap/providers.php')
    );

    if (hasServiceProvider && confidence > 0) {
      evidence.push('Laravel configuration files found');
      confidence += 0.1;
    }

    const detected = confidence >= 0.7;

    return {
      detected,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        hasLaravelFramework: hasLaravel,
        hasPagesDirectory,
        hasConfigFiles: foundConfigFiles.length > 0,
        folioPageCount: this.countFolioPages(context.files)
      }
    };
  }

  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const composerJson = context.composerJson;
    if (!composerJson) return undefined;

    // Check in require first (most common for Folio)
    const version = composerJson.require?.['laravel/folio'];
    if (version) {
      return this.normalizeVersion(version);
    }

    // Check in require-dev
    const devVersion = composerJson['require-dev']?.['laravel/folio'];
    if (devVersion) {
      return this.normalizeVersion(devVersion);
    }

    return undefined;
  }

  static async getVersionInfo(context: DetectionContext): Promise<any> {
    const version = await this.detectVersion(context);
    return {
      installed: version,
      raw: version
    };
  }

  static getSupportedExtensions(): string[] {
    return ['.php', '.blade.php'];
  }

  static getConfigFiles(): string[] {
    return [
      'config/folio.php',
      'bootstrap/providers.php',
      'config/app.php'
    ];
  }

  private static hasLaravelFramework(composerJson: any): boolean {
    if (!composerJson) return false;

    return !!(composerJson.require?.['laravel/framework'] ||
             composerJson.require?.['illuminate/support']);
  }

  private static hasFolioPagePatterns(files: string[]): boolean {
    // Look for files in typical Folio page locations
    const folioPatterns = [
      'resources/views/pages/',
      'resources/views/pages/index.blade.php',
      'resources/views/pages/[',  // Dynamic routes like [id].blade.php
      'resources/views/pages/auth/',
      'resources/views/pages/admin/'
    ];

    return folioPatterns.some(pattern =>
      files.some(file => file.includes(pattern))
    );
  }

  private static countFolioPages(files: string[]): number {
    return files.filter(file =>
      file.startsWith('resources/views/pages/') && file.endsWith('.blade.php')
    ).length;
  }

  private static normalizeVersion(version: string): string {
    // Remove constraint operators and normalize
    return version.replace(/^[~^>=<]*/, '').trim();
  }
}