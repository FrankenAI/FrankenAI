import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { LaravelBoostDetection } from './detection.js';

export class LaravelBoostModule implements LibraryModule {
  readonly id = 'laravel-boost';
  readonly type = 'library' as const;
  readonly priorityType = 'meta-framework' as const; // Higher priority than laravel-tool

  private versionInfo: any;

  getMetadata(): ModuleMetadata {
    return {
      name: 'laravel-boost',
      displayName: 'Laravel Boost',
      description: 'Laravel Boost methodology and tooling detection',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://laravelboost.com',
      keywords: ['laravel', 'boost', 'methodology', 'meta-framework', 'tooling'],
      supportedVersions: ['1.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await LaravelBoostDetection.detect(context);

    if (result.detected) {
      this.versionInfo = await LaravelBoostDetection.getVersionInfo(context);
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return LaravelBoostDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    paths.push({
      path: 'laravel-boost/guidelines/methodology.md',
      priority: 'meta-framework',
      category: 'methodology',
      version
    });

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<Partial<StackCommands>> {
    const commands: Partial<StackCommands> = {
      dev: [],
      build: [],
      install: []
    };

    // Laravel Boost specific commands
    commands.dev = [
      'php artisan serve',
      'php artisan boost:dev' // If such command exists
    ];

    commands.build = [
      'php artisan optimize',
      'php artisan boost:build'
    ];

    commands.install = [
      'composer install',
      'php artisan boost:install'
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return LaravelBoostDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return LaravelBoostDetection.getConfigFiles();
  }
}