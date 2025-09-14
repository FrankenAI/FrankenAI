import type {
  FrameworkModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { LaravelDetection } from './detection.js';

export class LaravelModule implements FrameworkModule {
  readonly id = 'laravel';
  readonly type = 'framework' as const;
  readonly priorityType = 'meta-framework' as const;

  private versionInfo: any; // Will store detailed version info

  getMetadata(): ModuleMetadata {
    return {
      name: 'laravel',
      displayName: 'Laravel',
      description: 'Laravel PHP framework module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://laravel.com',
      keywords: ['php', 'framework', 'mvc', 'eloquent', 'artisan'],
      supportedVersions: ['10.x', '11.x', '12.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await LaravelDetection.detect(context);

    // Store version info for later use
    if (result.detected) {
      this.versionInfo = await LaravelDetection.getVersionInfo(context);
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return LaravelDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Laravel framework guidelines
    paths.push({
      path: 'laravel/guidelines/framework.md',
      priority: 'meta-framework',
      category: 'framework',
      version
    });

    // Gemini CLI analysis guidelines for Laravel complexity
    paths.push({
      path: 'laravel/guidelines/gemini-analysis.md',
      priority: 'meta-framework',
      category: 'framework',
      version
    });

    // Version-specific guidelines
    if (version) {
      const majorVersion = this.extractMajorVersion(version);
      const versionSpecificPath = `laravel/guidelines/${majorVersion}/features.md`;
      paths.push({
        path: versionSpecificPath,
        priority: 'meta-framework',
        category: 'framework',
        version: majorVersion
      });
    }

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<Partial<StackCommands>> {
    const commands: Partial<StackCommands> = {
      dev: [],
      build: [],
      test: [],
      lint: [],
      install: []
    };

    // Development commands
    commands.dev = [
      'php artisan serve',
      'php artisan tinker'
    ];

    // Check if we have frontend assets
    const hasVite = context.detectedStack.configFiles.includes('vite.config.js') ||
                   context.detectedStack.configFiles.includes('vite.config.ts');
    const hasWebpack = context.detectedStack.configFiles.includes('webpack.mix.js');

    if (hasVite) {
      commands.dev.push('npm run dev');
      commands.build = ['npm run build'];
    } else if (hasWebpack) {
      commands.dev.push('npm run dev');
      commands.build = ['npm run production'];
    }

    // Test commands
    commands.test = [
      'php artisan test',
      'vendor/bin/phpunit'
    ];

    // Add Pest if detected
    if (context.detectedStack.configFiles.includes('pest.php')) {
      commands.test.push('vendor/bin/pest');
    }

    // Linting commands
    commands.lint = [];

    // Laravel Pint (code style fixer)
    commands.lint.push('./vendor/bin/pint');

    // PHP CS Fixer if present
    if (context.detectedStack.configFiles.includes('.php-cs-fixer.php') ||
        context.detectedStack.configFiles.includes('.php_cs')) {
      commands.lint.push('vendor/bin/php-cs-fixer fix');
    }

    // PHPStan if present
    if (context.detectedStack.configFiles.includes('phpstan.neon') ||
        context.detectedStack.configFiles.includes('phpstan.neon.dist')) {
      commands.lint.push('vendor/bin/phpstan analyse');
    }

    // Installation commands
    commands.install = [
      'composer install'
    ];

    // Add npm install if we have package.json
    if (context.detectedStack.configFiles.includes('package.json')) {
      const packageManager = this.getPreferredPackageManager(context.detectedStack.packageManagers);
      commands.install.push(`${packageManager} install`);
    }

    return commands;
  }

  getSupportedExtensions(): string[] {
    return LaravelDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return LaravelDetection.getConfigFiles();
  }

  private extractMajorVersion(version: string): string {
    const match = version.match(/^[^\d]*(\d+)/);
    return match ? match[1] : version;
  }

  private getPreferredPackageManager(packageManagers: string[]): string {
    if (packageManagers.includes('bun')) return 'bun';
    if (packageManagers.includes('yarn')) return 'yarn';
    if (packageManagers.includes('pnpm')) return 'pnpm';
    return 'npm';
  }
}