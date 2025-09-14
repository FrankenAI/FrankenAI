import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

export class LaravelBoostDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for Laravel Boost indicators
    const boostIndicators = this.checkBoostIndicators(context);
    if (boostIndicators.found) {
      evidence.push(...boostIndicators.evidence);
      confidence += boostIndicators.confidence;
    }

    // Check for Laravel framework (required)
    const hasLaravel = this.hasLaravelFramework(context.composerJson);
    if (!hasLaravel && confidence > 0) {
      evidence.push('Warning: Laravel Boost requires Laravel framework');
      confidence *= 0.3;
    } else if (hasLaravel) {
      evidence.push('Laravel framework detected (required for Boost)');
      confidence += 0.1;
    }

    const detected = confidence >= 0.6;

    const result: DetectionResult = {
      detected,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        hasLaravelFramework: hasLaravel,
        boostComponents: boostIndicators.components
      }
    };

    // If Laravel Boost is detected, mark modules for exclusion
    if (detected) {
      result.excludes = [
        'laravel', // Core Laravel detection redundant
        'tailwind', // Boost manages Tailwind
        'livewire', // Boost includes Livewire patterns
        'pest', // Boost includes testing patterns
        'pint', // Boost includes code style
        'volt', // Boost includes Volt patterns
        'folio', // Boost includes routing patterns
        'pennant', // Boost includes feature flag patterns
        'flux-free', // Boost may include UI patterns
        'flux-pro' // Boost may include advanced UI
      ];
      evidence.push(`Laravel Boost detected - excluding ${result.excludes.length} redundant modules`);
    }

    return result;
  }

  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    // Laravel Boost might not have a traditional version in composer.json
    // Check for boost-specific version indicators
    const boostConfig = this.findBoostConfig(context);
    if (boostConfig) {
      return this.extractVersionFromConfig(boostConfig);
    }

    return undefined;
  }

  static async getVersionInfo(context: DetectionContext): Promise<any> {
    const version = await this.detectVersion(context);
    return {
      installed: version,
      raw: version,
      methodology: 'Laravel Boost'
    };
  }

  static getSupportedExtensions(): string[] {
    return ['.php', '.blade.php', '.js', '.ts', '.css', '.scss'];
  }

  static getConfigFiles(): string[] {
    return [
      'boost.config.js',
      'boost.config.php',
      'config/boost.php',
      'laravel-boost.json',
      '.boost',
      'composer.json',
      'package.json'
    ];
  }

  private static checkBoostIndicators(context: DetectionContext): {
    found: boolean;
    confidence: number;
    evidence: string[];
    components: string[];
  } {
    const evidence: string[] = [];
    const components: string[] = [];
    let confidence = 0;

    // Check for Laravel Boost config files
    const configFiles = [
      'boost.config.js',
      'boost.config.php',
      'config/boost.php',
      'laravel-boost.json',
      '.boost'
    ];

    const hasBoostConfig = context.configFiles.some(file =>
      configFiles.some(boostFile => file.includes(boostFile))
    );

    if (hasBoostConfig) {
      evidence.push('Laravel Boost configuration file detected');
      confidence += 0.8;
    }

    // Check for Boost-specific directory structure
    const boostDirectories = [
      'resources/boost',
      'app/Boost',
      'database/boost',
      'routes/boost'
    ];

    const hasBoostDirs = context.files.some(file =>
      boostDirectories.some(dir => file.includes(dir))
    );

    if (hasBoostDirs) {
      evidence.push('Laravel Boost directory structure detected');
      confidence += 0.6;
    }

    // Check for Boost methodology files in DATA
    const boostDataFiles = [
      'fluxui-pro/core.blade.php',
      'fluxui-free/core.blade.php',
      'pennant/core.blade.php',
      'volt/core.blade.php'
    ];

    const hasBoostData = context.files.some(file =>
      boostDataFiles.some(dataFile => file.includes(dataFile))
    );

    if (hasBoostData) {
      evidence.push('Laravel Boost methodology data files detected');
      confidence += 0.7;
      components.push('boost-methodology');
    }

    // Check for Boost-specific patterns in files
    const boostPatterns = [
      'Laravel Boost',
      'boost methodology',
      '@boost',
      'LaravelBoost'
    ];

    const hasBoostPatterns = context.files.some(file =>
      file.toLowerCase().includes('boost') ||
      boostPatterns.some(pattern => file.includes(pattern))
    );

    if (hasBoostPatterns) {
      evidence.push('Laravel Boost patterns detected in files');
      confidence += 0.4;
    }

    // Check package.json for boost-related dependencies
    if (context.packageJson) {
      const boostDeps = [
        'laravel-boost',
        '@laravel-boost/cli',
        'boost-framework'
      ];

      const hasBoostDeps = Object.keys({
        ...context.packageJson.dependencies,
        ...context.packageJson.devDependencies
      }).some(dep => boostDeps.includes(dep));

      if (hasBoostDeps) {
        evidence.push('Laravel Boost dependencies detected in package.json');
        confidence += 0.5;
      }
    }

    return {
      found: confidence > 0,
      confidence,
      evidence,
      components
    };
  }

  private static hasLaravelFramework(composerJson: any): boolean {
    if (!composerJson) return false;
    return !!(composerJson.require?.['laravel/framework'] ||
             composerJson.require?.['illuminate/support']);
  }

  private static findBoostConfig(context: DetectionContext): string | null {
    const configFiles = [
      'boost.config.js',
      'boost.config.php',
      'config/boost.php',
      'laravel-boost.json'
    ];

    return context.configFiles.find(file =>
      configFiles.some(config => file.includes(config))
    ) || null;
  }

  private static extractVersionFromConfig(configPath: string): string {
    // In a real implementation, you'd read and parse the config file
    // For now, return a default version
    return '1.0.0';
  }
}