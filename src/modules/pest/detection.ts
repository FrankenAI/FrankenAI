import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

export class PestDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check composer.json for Pest dependency
    const composerJson = context.composerJson;
    if (composerJson) {
      if (composerJson.require?.['pestphp/pest'] ||
          composerJson['require-dev']?.['pestphp/pest']) {
        evidence.push('Pest found in composer.json dependencies');
        confidence += 0.8;
      }

      // Check for Laravel-specific Pest plugin
      if (composerJson.require?.['pestphp/pest-plugin-laravel'] ||
          composerJson['require-dev']?.['pestphp/pest-plugin-laravel']) {
        evidence.push('Pest Laravel plugin found in composer.json');
        confidence += 0.2;
      }
    }

    // Check for Pest configuration files
    const configFiles = this.getConfigFiles();
    const foundConfigFiles = context.configFiles.filter(file =>
      configFiles.includes(file)
    );

    if (foundConfigFiles.length > 0) {
      evidence.push(`Pest config found: ${foundConfigFiles.join(', ')}`);
      confidence += 0.4;
    }

    // Check for tests directory with Pest-style tests
    const hasPestTests = context.files.some(file =>
      (file.startsWith('tests/') && file.endsWith('.php')) ||
      file.includes('Pest.php')
    );

    if (hasPestTests) {
      evidence.push('Tests directory with Pest-style tests found');
      confidence += 0.3;
    }

    // Look for Pest-specific functions in test files (it, test, describe)
    // This is a heuristic since we can't read file contents in detection
    const hasPestDir = context.files.some(file =>
      file === 'tests/Pest.php' || file.includes('.pest.php')
    );

    if (hasPestDir) {
      evidence.push('Pest-specific test files found');
      confidence += 0.4;
    }

    // Check for vendor/bin/pest
    const hasVendorBin = context.files.some(file =>
      file === 'vendor/bin/pest'
    );

    if (hasVendorBin) {
      evidence.push('Pest binary found in vendor/bin');
      confidence += 0.2;
    }

    const detected = confidence >= 0.7;

    return {
      detected,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        hasConfigFile: foundConfigFiles.length > 0,
        hasLaravelPlugin: this.hasLaravelPlugin(composerJson),
        configFiles: foundConfigFiles
      }
    };
  }

  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const composerJson = context.composerJson;
    if (!composerJson) return undefined;

    // Check in require-dev first (most common)
    const devVersion = composerJson['require-dev']?.['pestphp/pest'];
    if (devVersion) {
      return this.normalizeVersion(devVersion);
    }

    // Check in require
    const version = composerJson.require?.['pestphp/pest'];
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
      'tests/Pest.php',
      'Pest.php',
      'pest.xml',
      'pest.xml.dist'
    ];
  }

  private static hasLaravelPlugin(composerJson: any): boolean {
    if (!composerJson) return false;

    return !!(composerJson.require?.['pestphp/pest-plugin-laravel'] ||
             composerJson['require-dev']?.['pestphp/pest-plugin-laravel']);
  }

  private static normalizeVersion(version: string): string {
    // Remove constraint operators and normalize
    return version.replace(/^[~^>=<]*/, '').trim();
  }
}