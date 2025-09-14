import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { FluxProDetection } from './detection.js';

export class FluxProModule implements LibraryModule {
  readonly id = 'flux-pro';
  readonly type = 'library' as const;
  readonly priorityType = 'laravel-tool' as const;

  private versionInfo: any;

  getMetadata(): ModuleMetadata {
    return {
      name: 'flux-pro',
      displayName: 'Flux UI Pro',
      description: 'Flux UI Pro component library module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://fluxui.dev/pro',
      keywords: ['php', 'laravel', 'livewire', 'ui', 'components', 'blade', 'premium'],
      supportedVersions: ['1.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await FluxProDetection.detect(context);

    if (result.detected) {
      this.versionInfo = await FluxProDetection.getVersionInfo(context);

      // Flux Pro excludes Flux Free since Pro includes all Free features
      result.excludes = ['flux-free'];
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return FluxProDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    paths.push({
      path: 'flux-pro/guidelines/components.md',
      priority: 'laravel-tool',
      category: 'framework',
      version
    });

    paths.push({
      path: 'flux-pro/guidelines/pro-features.md',
      priority: 'laravel-tool',
      category: 'framework',
      version
    });

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<Partial<StackCommands>> {
    const commands: Partial<StackCommands> = {
      dev: [],
      install: []
    };

    commands.dev = [
      'php artisan serve',
      'php artisan livewire:publish --config',
      'php artisan flux:publish --pro' // Pro-specific command
    ];

    commands.install = [
      'composer install',
      'php artisan flux:install --pro'
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return FluxProDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return FluxProDetection.getConfigFiles();
  }
}