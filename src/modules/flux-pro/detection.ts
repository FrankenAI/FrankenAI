import type { DetectionContext, DetectionResult } from '../../core/types/Module.js';

export class FluxProDetection {
  static async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    const composerJson = context.composerJson;
    if (composerJson) {
      if (composerJson.require?.['livewire/flux'] ||
          composerJson['require-dev']?.['livewire/flux']) {
        evidence.push('Flux UI found in composer.json dependencies');
        confidence += 0.7;

        // Check specifically for Pro version indicators
        const isProVersion = this.isFluxProVersion(context);
        if (isProVersion) {
          evidence.push('Flux UI Pro version indicators detected');
          confidence += 0.3;
        } else {
          // If Flux is detected but no Pro indicators, this is likely Free version
          confidence = 0;
          return {
            detected: false,
            confidence: 0,
            evidence: ['Flux UI detected but no Pro version indicators found'],
            metadata: { isProVersion: false }
          };
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
      confidence += 0.1;
    }

    // Check for Laravel framework
    const hasLaravel = this.hasLaravelFramework(composerJson);
    if (hasLaravel) {
      evidence.push('Laravel framework detected');
      confidence += 0.1;
    }

    // Check for Pro-specific component usage
    const hasProComponents = this.hasFluxProComponents(context.files);
    if (hasProComponents) {
      evidence.push('Flux UI Pro components detected');
      confidence += 0.4;
    }

    // Check for Pro license or configuration
    const hasProLicense = this.hasProLicense(context);
    if (hasProLicense) {
      evidence.push('Flux UI Pro license or configuration detected');
      confidence += 0.3;
    }

    const detected = confidence >= 0.8; // Higher threshold for Pro detection

    return {
      detected,
      confidence: Math.min(confidence, 1.0),
      evidence,
      metadata: {
        hasLivewire,
        hasLaravelFramework: hasLaravel,
        hasProComponents,
        hasProLicense,
        isProVersion: true
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
      'config/livewire.php',
      '.env',
      '.env.local'
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

  private static isFluxProVersion(context: DetectionContext): boolean {
    // Check for Pro version indicators in files or environment
    const proIndicators = [
      'flux-pro',
      'flux/pro',
      'FLUX_PRO_LICENSE',
      'flux.pro',
      'fluxui.pro'
    ];

    // Check files for Pro indicators
    const hasProInFiles = context.files.some(file =>
      proIndicators.some(indicator =>
        file.toLowerCase().includes(indicator.toLowerCase())
      )
    );

    // Check config files for Pro indicators
    const hasProInConfig = context.configFiles.some(file =>
      proIndicators.some(indicator =>
        file.toLowerCase().includes(indicator.toLowerCase())
      )
    );

    return hasProInFiles || hasProInConfig;
  }

  private static hasFluxProComponents(files: string[]): boolean {
    // Look for Pro-specific components mentioned in Flux UI Pro docs
    const proComponents = [
      'flux:accordion',
      'flux:autocomplete',
      'flux:calendar',
      'flux:chart',
      'flux:command',
      'flux:context',
      'flux:date-picker',
      'flux:editor',
      'flux:pagination',
      'flux:popover',
      'flux:table',
      'flux:tabs',
      'flux:toast'
    ];

    // Check for Pro components in file names or Pro-specific paths
    return files.some(file =>
      file.endsWith('.blade.php') &&
      (file.includes('/pro/') ||
       file.includes('flux-pro') ||
       file.includes('/premium/') ||
       // Check if filename suggests Pro component usage
       proComponents.some(component =>
         file.toLowerCase().includes(component.replace('flux:', ''))
       ))
    );
  }

  private static hasProLicense(context: DetectionContext): boolean {
    // Look for Pro license indicators
    const licenseIndicators = [
      'FLUX_PRO_KEY',
      'FLUX_LICENSE',
      'flux-license',
      '.flux-pro'
    ];

    return context.configFiles.some(file =>
      licenseIndicators.some(indicator =>
        file.includes(indicator)
      )
    ) || context.files.some(file =>
      licenseIndicators.some(indicator =>
        file.includes(indicator)
      )
    );
  }

  private static normalizeVersion(version: string): string {
    return version.replace(/^[~^>=<]*/, '').trim();
  }
}