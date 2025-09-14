import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { VoltDetection } from './detection.js';

export class VoltModule implements LibraryModule {
  readonly id = 'volt';
  readonly type = 'library' as const;
  readonly priorityType = 'laravel-tool' as const;

  private versionInfo: any;

  getMetadata(): ModuleMetadata {
    return {
      name: 'volt',
      displayName: 'Livewire Volt',
      description: 'Livewire Volt functional API module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://laravel-livewire.com/docs/volt',
      keywords: ['php', 'laravel', 'livewire', 'volt', 'functional', 'reactive'],
      supportedVersions: ['1.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await VoltDetection.detect(context);

    if (result.detected) {
      this.versionInfo = await VoltDetection.getVersionInfo(context);

      // Note: Volt does NOT exclude Livewire - it extends it
      // Volt is a functional API for Livewire, they work together
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return VoltDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Volt guidelines
    paths.push({
      path: 'volt/guidelines/functional-api.md',
      priority: 'laravel-tool',
      category: 'framework',
      version
    });

    // Laravel and Livewire integration
    paths.push({
      path: 'volt/guidelines/livewire-integration.md',
      priority: 'laravel-tool',
      category: 'framework',
      version
    });

    // Testing Volt components
    paths.push({
      path: 'volt/guidelines/testing.md',
      priority: 'laravel-tool',
      category: 'testing',
      version
    });

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<Partial<StackCommands>> {
    const commands: Partial<StackCommands> = {
      dev: [],
      test: [],
      install: []
    };

    // Volt commands (requires Laravel)
    commands.dev = [
      'php artisan make:volt',       // Create new Volt component
      'php artisan volt:list',       // List Volt components (if available)
      'php artisan serve'            // Start development server
    ];

    // Testing commands specific to Volt
    commands.test = [
      'php artisan test --filter=Volt',
      'php artisan test tests/Feature/Volt/'
    ];

    // Installation commands
    commands.install = [
      'composer install',
      'php artisan volt:install'     // If Volt has installation command
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return VoltDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return VoltDetection.getConfigFiles();
  }
}