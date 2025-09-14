import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { FluxFreeDetection } from './detection.js';

export class FluxFreeModule implements LibraryModule {
  readonly id = 'flux-free';
  readonly type = 'library' as const;
  readonly priorityType = 'laravel-tool' as const;

  private versionInfo: any;

  getMetadata(): ModuleMetadata {
    return {
      name: 'flux-free',
      displayName: 'Flux UI Free',
      description: 'Flux UI Free component library module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://fluxui.dev',
      keywords: ['php', 'laravel', 'livewire', 'ui', 'components', 'blade'],
      supportedVersions: ['1.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await FluxFreeDetection.detect(context);

    if (result.detected) {
      this.versionInfo = await FluxFreeDetection.getVersionInfo(context);
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return FluxFreeDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    paths.push({
      path: 'flux-free/guidelines/components.md',
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
      'php artisan livewire:publish --config' // If needed for customization
    ];

    commands.install = [
      'composer install',
      'php artisan flux:install' // If Flux has installation
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return FluxFreeDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return FluxFreeDetection.getConfigFiles();
  }
}