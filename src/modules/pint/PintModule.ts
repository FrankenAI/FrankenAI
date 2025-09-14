import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { PintDetection } from './detection.js';

export class PintModule implements LibraryModule {
  readonly id = 'pint';
  readonly type = 'library' as const;
  readonly priorityType = 'laravel-tool' as const;

  private versionInfo: any;

  getMetadata(): ModuleMetadata {
    return {
      name: 'pint',
      displayName: 'Laravel Pint',
      description: 'Laravel Pint code style fixer module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://laravel.com/docs/pint',
      keywords: ['php', 'laravel', 'code-style', 'formatting', 'psr-12'],
      supportedVersions: ['1.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await PintDetection.detect(context);

    if (result.detected) {
      this.versionInfo = await PintDetection.getVersionInfo(context);
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return PintDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Pint guidelines
    paths.push({
      path: 'pint/guidelines/tool.md',
      priority: 'laravel-tool',
      category: 'feature',
      version
    });

    // Laravel-specific integration
    paths.push({
      path: 'pint/guidelines/laravel-integration.md',
      priority: 'laravel-tool',
      category: 'feature',
      version
    });

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<Partial<StackCommands>> {
    const commands: Partial<StackCommands> = {
      lint: [],
      install: []
    };

    // Determine if using Laravel
    const isLaravel = context.detectedStack.frameworks.includes('Laravel');

    // Lint commands
    if (isLaravel) {
      commands.lint = [
        './vendor/bin/pint',
        './vendor/bin/pint --diff',
        './vendor/bin/pint --dirty'
      ];
    } else {
      commands.lint = [
        'vendor/bin/pint',
        'composer pint'
      ];
    }

    // Installation commands
    commands.install = [
      'composer install --dev'
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return PintDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return PintDetection.getConfigFiles();
  }
}