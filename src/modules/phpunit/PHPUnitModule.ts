import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { PHPUnitDetection } from './detection.js';

export class PHPUnitModule implements LibraryModule {
  readonly id = 'phpunit';
  readonly type = 'library' as const;
  readonly priorityType = 'laravel-tool' as const;

  private versionInfo: any;

  getMetadata(): ModuleMetadata {
    return {
      name: 'phpunit',
      displayName: 'PHPUnit',
      description: 'PHP testing framework module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://phpunit.de',
      keywords: ['php', 'testing', 'unit-tests', 'framework'],
      supportedVersions: ['9.x', '10.x', '11.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await PHPUnitDetection.detect(context);

    if (result.detected) {
      this.versionInfo = await PHPUnitDetection.getVersionInfo(context);
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return PHPUnitDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core PHPUnit guidelines
    paths.push({
      path: 'phpunit/guidelines/framework.md',
      priority: 'laravel-tool',
      category: 'testing',
      version
    });

    // Version-specific guidelines
    if (version) {
      const majorVersion = this.extractMajorVersion(version);
      const versionSpecificPath = `phpunit/guidelines/${majorVersion}/features.md`;
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
        'vendor/bin/phpunit',
        'composer test'
      ];
    }

    // Add coverage commands
    commands.test.push(
      isLaravel ? 'php artisan test --coverage' : 'vendor/bin/phpunit --coverage-html coverage'
    );

    // Installation commands
    commands.install = [
      'composer install --dev'
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return PHPUnitDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return PHPUnitDetection.getConfigFiles();
  }

  private extractMajorVersion(version: string): string {
    const match = version.match(/^[^\d]*(\d+)/);
    return match ? match[1] : version;
  }
}