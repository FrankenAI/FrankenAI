import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { PestDetection } from './detection.js';

export class PestModule implements LibraryModule {
  readonly id = 'pest';
  readonly type = 'library' as const;
  readonly priorityType = 'laravel-tool' as const;

  private versionInfo: any;

  getMetadata(): ModuleMetadata {
    return {
      name: 'pest',
      displayName: 'Pest',
      description: 'Modern PHP testing framework module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://pestphp.com',
      keywords: ['php', 'testing', 'pest', 'modern', 'framework'],
      supportedVersions: ['2.x', '3.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await PestDetection.detect(context);

    if (result.detected) {
      this.versionInfo = await PestDetection.getVersionInfo(context);

      // Pest excludes PHPUnit as it's a modern replacement
      result.excludes = ['phpunit'];
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return PestDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Pest guidelines
    paths.push({
      path: 'pest/guidelines/framework.md',
      priority: 'laravel-tool',
      category: 'testing',
      version
    });

    // Laravel-specific Pest guidelines
    paths.push({
      path: 'pest/guidelines/laravel-integration.md',
      priority: 'laravel-tool',
      category: 'testing',
      version
    });

    // Version-specific guidelines
    if (version) {
      const majorVersion = this.extractMajorVersion(version);
      const versionSpecificPath = `pest/guidelines/${majorVersion}/features.md`;
      paths.push({
        path: versionSpecificPath,
        priority: 'laravel-tool',
        category: 'testing',
        version: majorVersion
      });
    }

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<Partial<StackCommands>> {
    const commands: Partial<StackCommands> = {
      test: [],
      lint: [],
      install: []
    };

    // Determine if using Laravel
    const isLaravel = context.detectedStack.frameworks.includes('Laravel');

    // Test commands
    if (isLaravel) {
      commands.test = [
        'php artisan test',
        'php artisan test --parallel'
      ];
    } else {
      commands.test = [
        'vendor/bin/pest',
        'composer test'
      ];
    }

    // Add Pest-specific commands
    commands.test.push(
      isLaravel ? 'php artisan test --coverage' : 'vendor/bin/pest --coverage',
      isLaravel ? 'php artisan test --profile' : 'vendor/bin/pest --profile'
    );

    // Installation commands
    commands.install = [
      'composer install --dev'
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return PestDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return PestDetection.getConfigFiles();
  }

  private extractMajorVersion(version: string): string {
    const match = version.match(/^[^\d]*(\d+)/);
    return match ? match[1] : version;
  }
}