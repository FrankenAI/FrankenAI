import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

export class PintDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check composer.json for Pint dependency
    const composerJson = context.composerJson;
    if (composerJson) {
      if (composerJson.require?.['laravel/pint'] ||
          composerJson['require-dev']?.['laravel/pint']) {
        evidence.push('Laravel Pint found in composer.json dependencies');
        confidence += 0.8;
      }
    }

    // Check for Pint configuration files
    const configFiles = this.getConfigFiles();
    const foundConfigFiles = context.configFiles.filter(file =>
      configFiles.includes(file)
    );

    if (foundConfigFiles.length > 0) {
      evidence.push(`Pint config found: ${foundConfigFiles.join(', ')}`);
      confidence += 0.4;
    }

    // Check for vendor/bin/pint
    const hasVendorBin = context.files.some(file =>
      file === 'vendor/bin/pint'
    );

    if (hasVendorBin) {
      evidence.push('Pint binary found in vendor/bin');
      confidence += 0.3;
    }

    // Check for Laravel framework (Pint is primarily for Laravel)
    const hasLaravel = this.hasLaravelFramework(composerJson);
    if (hasLaravel && confidence > 0) {
      evidence.push('Laravel framework detected (Pint\'s primary target)');
      confidence += 0.2;
    }

    const detected = confidence >= 0.7;

    return {
      detected,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        hasConfigFile: foundConfigFiles.length > 0,
        hasLaravelFramework: hasLaravel,
        configFiles: foundConfigFiles
      }
    };
  }

  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const composerJson = context.composerJson;
    if (!composerJson) return undefined;

    // Check in require-dev first (most common)
    const devVersion = composerJson['require-dev']?.['laravel/pint'];
    if (devVersion) {
      return this.normalizeVersion(devVersion);
    }

    // Check in require
    const version = composerJson.require?.['laravel/pint'];
    if (version) {
      return this.normalizeVersion(version);
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
    return ['.php'];
  }

  static getConfigFiles(): string[] {
    return [
      'pint.json',
      '.pint.json',
      'pint.config.php',
      '.pint.config.php'
    ];
  }

  private static hasLaravelFramework(composerJson: any): boolean {
    if (!composerJson) return false;

    return !!(composerJson.require?.['laravel/framework'] ||
             composerJson.require?.['illuminate/support']);
  }

  private static normalizeVersion(version: string): string {
    // Remove constraint operators and normalize
    return version.replace(/^[~^>=<]*/, '').trim();
  }
}