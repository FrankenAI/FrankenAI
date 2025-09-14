import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { PennantDetection } from './detection.js';

export class PennantModule implements LibraryModule {
  readonly id = 'pennant';
  readonly type = 'library' as const;
  readonly priorityType = 'laravel-tool' as const;

  private versionInfo: any;

  getMetadata(): ModuleMetadata {
    return {
      name: 'pennant',
      displayName: 'Laravel Pennant',
      description: 'Laravel Pennant feature flags module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://laravel.com/docs/pennant',
      keywords: ['php', 'laravel', 'feature-flags', 'toggles', 'deployment'],
      supportedVersions: ['1.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await PennantDetection.detect(context);

    if (result.detected) {
      this.versionInfo = await PennantDetection.getVersionInfo(context);
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return PennantDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Pennant guidelines
    paths.push({
      path: 'pennant/guidelines/feature-flags.md',
      priority: 'laravel-tool',
      category: 'feature',
      version
    });

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<Partial<StackCommands>> {
    const commands: Partial<StackCommands> = {
      dev: [],
      install: []
    };

    // Pennant commands
    commands.dev = [
      'php artisan pennant:purge',     // Purge feature flags
      'php artisan pennant:clear',     // Clear flag cache
    ];

    // Installation commands
    commands.install = [
      'composer install',
      'php artisan pennant:install'    // If Pennant has installation
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return PennantDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return PennantDetection.getConfigFiles();
  }
}