import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

export class PHPUnitDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check composer.json for PHPUnit dependency
    const composerJson = context.composerJson;
    if (composerJson) {
      if (composerJson.require?.['phpunit/phpunit'] ||
          composerJson['require-dev']?.['phpunit/phpunit']) {
        evidence.push('PHPUnit found in composer.json dependencies');
        confidence += 0.7;
      }
    }

    // Check for PHPUnit configuration files
    const configFiles = this.getConfigFiles();
    const foundConfigFiles = context.configFiles.filter(file =>
      configFiles.includes(file)
    );

    if (foundConfigFiles.length > 0) {
      evidence.push(`PHPUnit config found: ${foundConfigFiles.join(', ')}`);
      confidence += 0.6;
    }

    // Check for tests directory structure
    const hasTestsDir = context.files.some(file =>
      file.startsWith('tests/') && file.endsWith('.php')
    );

    if (hasTestsDir) {
      evidence.push('Tests directory with PHP files found');
      confidence += 0.4;
    }

    // Look for PHPUnit test class patterns
    const hasTestClasses = context.files.some(file =>
      file.includes('Test.php') || file.includes('TestCase.php')
    );

    if (hasTestClasses) {
      evidence.push('PHPUnit test classes found');
      confidence += 0.3;
    }

    // Check for vendor/bin/phpunit
    const hasVendorBin = context.files.some(file =>
      file === 'vendor/bin/phpunit'
    );

    if (hasVendorBin) {
      evidence.push('PHPUnit binary found in vendor/bin');
      confidence += 0.2;
    }

    const detected = confidence >= 0.6;

    return {
      detected,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        hasConfigFile: foundConfigFiles.length > 0,
        hasTestsDirectory: hasTestsDir,
        configFiles: foundConfigFiles
      }
    };
  }

  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const composerJson = context.composerJson;
    if (!composerJson) return undefined;

    // Check in require-dev first (most common)
    const devVersion = composerJson['require-dev']?.['phpunit/phpunit'];
    if (devVersion) {
      return this.normalizeVersion(devVersion);
    }

    // Check in require
    const version = composerJson.require?.['phpunit/phpunit'];
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
      'phpunit.xml',
      'phpunit.xml.dist',
      'phpunit.dist.xml',
      'tests/phpunit.xml'
    ];
  }

  private static normalizeVersion(version: string): string {
    // Remove constraint operators and normalize
    return version.replace(/^[~^>=<]*/, '').trim();
  }
}