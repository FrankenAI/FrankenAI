import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { FolioDetection } from './detection.js';

export class FolioModule implements LibraryModule {
  readonly id = 'folio';
  readonly type = 'library' as const;
  readonly priorityType = 'laravel-tool' as const;

  private versionInfo: any;

  getMetadata(): ModuleMetadata {
    return {
      name: 'folio',
      displayName: 'Laravel Folio',
      description: 'Laravel Folio page-based routing module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://laravel.com/docs/folio',
      keywords: ['php', 'laravel', 'routing', 'pages', 'file-based'],
      supportedVersions: ['1.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await FolioDetection.detect(context);

    if (result.detected) {
      this.versionInfo = await FolioDetection.getVersionInfo(context);
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return FolioDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Folio guidelines
    paths.push({
      path: 'folio/guidelines/routing.md',
      priority: 'laravel-tool',
      category: 'framework',
      version
    });

    // Page creation and organization
    paths.push({
      path: 'folio/guidelines/page-organization.md',
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

    // Laravel Folio commands
    commands.dev = [
      'php artisan folio:list',      // List all Folio routes
      'php artisan folio:page',      // Create new Folio page
      'php artisan serve'            // Start development server
    ];

    // Installation commands
    commands.install = [
      'composer install',
      'php artisan folio:install'    // If Folio has installation command
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return FolioDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return FolioDetection.getConfigFiles();
  }
}