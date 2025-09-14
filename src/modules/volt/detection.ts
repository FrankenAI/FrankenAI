import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

export class VoltDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check composer.json for Volt dependency
    const composerJson = context.composerJson;
    if (composerJson) {
      if (composerJson.require?.['livewire/volt'] ||
          composerJson['require-dev']?.['livewire/volt']) {
        evidence.push('Livewire Volt found in composer.json dependencies');
        confidence += 0.8;
      }
    }

    // Check for Livewire dependency (required for Volt)
    const hasLivewire = this.hasLivewire(composerJson);
    if (!hasLivewire && confidence > 0) {
      evidence.push('Warning: Volt requires Livewire framework');
      confidence *= 0.5; // Reduce confidence if no Livewire
    } else if (hasLivewire) {
      evidence.push('Livewire framework detected (required for Volt)');
      confidence += 0.3;
    }

    // Check for Laravel framework (required for both Livewire and Volt)
    const hasLaravel = this.hasLaravelFramework(composerJson);
    if (hasLaravel) {
      evidence.push('Laravel framework detected (required for Volt)');
      confidence += 0.2;
    }

    // Check for Volt component files
    const hasVoltComponents = this.hasVoltComponentPatterns(context.files);
    if (hasVoltComponents) {
      evidence.push('Volt component patterns detected in Blade files');
      confidence += 0.6;
    }

    // Check for Volt-specific directories
    const hasVoltDirectories = context.files.some(file =>
      file.includes('/volt/') || file.includes('livewire/volt/')
    );

    if (hasVoltDirectories) {
      evidence.push('Volt-specific directories found');
      confidence += 0.4;
    }

    // Check for configuration files
    const configFiles = this.getConfigFiles();
    const foundConfigFiles = context.configFiles.filter(file =>
      configFiles.includes(file)
    );

    if (foundConfigFiles.length > 0) {
      evidence.push(`Volt/Livewire config found: ${foundConfigFiles.join(', ')}`);
      confidence += 0.2;
    }

    const detected = confidence >= 0.7;

    return {
      detected,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        hasLivewire,
        hasLaravelFramework: hasLaravel,
        hasVoltComponents,
        voltComponentCount: this.countVoltComponents(context.files)
      }
    };
  }

  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const composerJson = context.composerJson;
    if (!composerJson) return undefined;

    // Check in require first (most common for Volt)
    const version = composerJson.require?.['livewire/volt'];
    if (version) {
      return this.normalizeVersion(version);
    }

    // Check in require-dev
    const devVersion = composerJson['require-dev']?.['livewire/volt'];
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
      'config/livewire.php',
      'config/volt.php',
      'bootstrap/providers.php',
      'config/app.php'
    ];
  }

  private static hasLivewire(composerJson: any): boolean {
    if (!composerJson) return false;

    return !!(composerJson.require?.['livewire/livewire'] ||
             composerJson['require-dev']?.['livewire/livewire']);
  }

  private static hasLaravelFramework(composerJson: any): boolean {
    if (!composerJson) return false;

    return !!(composerJson.require?.['laravel/framework'] ||
             composerJson.require?.['illuminate/support']);
  }

  private static hasVoltComponentPatterns(files: string[]): boolean {
    // Look for files that might contain Volt components
    // Volt components are typically Blade files with @volt directive
    const voltPatterns = [
      '/volt/',
      'livewire/volt/',
      'resources/views/livewire/',
      'resources/views/components/',
      '.volt.blade.php'
    ];

    return voltPatterns.some(pattern =>
      files.some(file =>
        file.includes(pattern) ||
        (file.endsWith('.blade.php') && file.includes('volt'))
      )
    );
  }

  private static countVoltComponents(files: string[]): number {
    return files.filter(file =>
      (file.endsWith('.blade.php') &&
       (file.includes('/volt/') ||
        file.includes('livewire/volt/') ||
        file.includes('.volt.')))
    ).length;
  }

  private static normalizeVersion(version: string): string {
    // Remove constraint operators and normalize
    return version.replace(/^[~^>=<]*/, '').trim();
  }
}