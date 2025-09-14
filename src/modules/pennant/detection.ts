import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

export class PennantDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check composer.json for Pennant dependency
    const composerJson = context.composerJson;
    if (composerJson) {
      if (composerJson.require?.['laravel/pennant'] ||
          composerJson['require-dev']?.['laravel/pennant']) {
        evidence.push('Laravel Pennant found in composer.json dependencies');
        confidence += 0.8;
      }
    }

    // Check for Laravel framework (required for Pennant)
    const hasLaravel = this.hasLaravelFramework(composerJson);
    if (!hasLaravel && confidence > 0) {
      evidence.push('Warning: Pennant requires Laravel framework');
      confidence *= 0.5;
    } else if (hasLaravel) {
      evidence.push('Laravel framework detected (required for Pennant)');
      confidence += 0.2;
    }

    // Check for Pennant configuration
    const configFiles = this.getConfigFiles();
    const foundConfigFiles = context.configFiles.filter(file =>
      configFiles.includes(file)
    );

    if (foundConfigFiles.length > 0) {
      evidence.push(`Pennant config found: ${foundConfigFiles.join(', ')}`);
      confidence += 0.4;
    }

    // Look for feature flag usage patterns in PHP files
    const hasFeatureFlagUsage = this.hasFeatureFlagPatterns(context.files);
    if (hasFeatureFlagUsage) {
      evidence.push('Feature flag usage patterns detected');
      confidence += 0.3;
    }

    const detected = confidence >= 0.7;

    return {
      detected,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        hasLaravelFramework: hasLaravel,
        hasConfigFiles: foundConfigFiles.length > 0,
        hasFeatureFlagUsage
      }
    };
  }

  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const composerJson = context.composerJson;
    if (!composerJson) return undefined;

    const version = composerJson.require?.['laravel/pennant'];
    if (version) {
      return this.normalizeVersion(version);
    }

    const devVersion = composerJson['require-dev']?.['laravel/pennant'];
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
    return ['.php'];
  }

  static getConfigFiles(): string[] {
    return [
      'config/pennant.php',
      'bootstrap/providers.php',
      'config/app.php'
    ];
  }

  private static hasLaravelFramework(composerJson: any): boolean {
    if (!composerJson) return false;

    return !!(composerJson.require?.['laravel/framework'] ||
             composerJson.require?.['illuminate/support']);
  }

  private static hasFeatureFlagPatterns(files: string[]): boolean {
    // Look for typical feature flag patterns
    // Note: We can't read file contents, so this is based on file names/paths
    const flagPatterns = [
      'Features/',
      'FeatureFlags/',
      'flags/',
      'pennant/'
    ];

    return flagPatterns.some(pattern =>
      files.some(file => file.includes(pattern))
    );
  }

  private static normalizeVersion(version: string): string {
    return version.replace(/^[~^>=<]*/, '').trim();
  }
}