import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

export class FluxFreeDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    const composerJson = context.composerJson;
    if (composerJson) {
      if (composerJson.require?.['livewire/flux'] ||
          composerJson['require-dev']?.['livewire/flux']) {
        evidence.push('Flux UI found in composer.json dependencies');
        confidence += 0.7;

        // Check if it's Pro version (exclude Free if Pro detected)
        const isProVersion = this.isFluxProVersion(context);
        if (isProVersion) {
          evidence.push('Flux UI Pro version detected');
          confidence = 0; // Free version not applicable if Pro is detected
          return {
            detected: false,
            confidence: 0,
            evidence: ['Flux UI Pro version detected - Free version not applicable'],
            excludes: ['flux-free'] // This module excludes itself if Pro is detected
          };
        } else {
          evidence.push('Flux UI Free version detected');
        }
      }
    }

    // Check for Livewire (required for Flux)
    const hasLivewire = this.hasLivewire(composerJson);
    if (!hasLivewire && confidence > 0) {
      evidence.push('Warning: Flux UI requires Livewire');
      confidence *= 0.5;
    } else if (hasLivewire) {
      evidence.push('Livewire framework detected (required for Flux)');
      confidence += 0.2;
    }

    // Check for Laravel framework
    const hasLaravel = this.hasLaravelFramework(composerJson);
    if (hasLaravel) {
      evidence.push('Laravel framework detected');
      confidence += 0.1;
    }

    // Check for Flux component usage
    const hasFluxComponents = this.hasFluxComponentUsage(context.files);
    if (hasFluxComponents) {
      evidence.push('Flux UI component usage detected');
      confidence += 0.3;
    }

    const detected = confidence >= 0.6;

    return {
      detected,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        hasLivewire,
        hasLaravelFramework: hasLaravel,
        hasFluxComponents,
        isProVersion: false
      }
    };
  }

  static async detectVersion(context: DetectionContext): Promise<string | undefined> {
    const composerJson = context.composerJson;
    if (!composerJson) return undefined;

    const version = composerJson.require?.['livewire/flux'];
    if (version) {
      return this.normalizeVersion(version);
    }

    const devVersion = composerJson['require-dev']?.['livewire/flux'];
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
      'config/flux.php',
      'config/livewire.php'
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

  private static hasFluxComponentUsage(files: string[]): boolean {
    // Look for Blade files that might contain Flux components
    return files.some(file =>
      file.endsWith('.blade.php') &&
      (file.includes('/livewire/') ||
       file.includes('/components/') ||
       file.includes('/resources/views/'))
    );
  }

  private static isFluxProVersion(context: DetectionContext): boolean {
    // Check for Pro version indicators
    // This would need more sophisticated detection in real implementation
    // For now, we'll use basic heuristics
    const proIndicators = [
      'flux-pro',
      'flux/pro',
      'FLUX_PRO_LICENSE'
    ];

    return context.files.some(file =>
      proIndicators.some(indicator => file.includes(indicator))
    );
  }

  private static normalizeVersion(version: string): string {
    return version.replace(/^[~^>=<]*/, '').trim();
  }
}