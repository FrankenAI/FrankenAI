import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleContext,
  ModuleMetadata,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';

export class LivewireModule implements LibraryModule {
  readonly id = 'livewire';
  readonly type = 'library';
  readonly priorityType = 'laravel-tool';

  getMetadata(): ModuleMetadata {
    return {
      name: 'livewire',
      displayName: 'Livewire',
      description: 'Laravel Livewire full-stack framework module',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://laravel-livewire.com',
      keywords: ['laravel', 'livewire', 'full-stack', 'reactive', 'component'],
      supportedVersions: ['2.x', '3.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for Laravel first (Livewire requires Laravel)
    if (!context.composerJson) {
      return { detected: false, confidence: 0, evidence: ['No composer.json found - Laravel required'] };
    }

    const hasLaravel = !!(
      context.composerJson.require?.['laravel/framework'] ||
      context.composerJson['require-dev']?.['laravel/framework']
    );

    if (!hasLaravel) {
      return { detected: false, confidence: 0, evidence: ['Laravel not found - required for Livewire'] };
    }

    // Check for Livewire in composer.json
    if (context.composerJson.require?.['livewire/livewire'] ||
        context.composerJson['require-dev']?.['livewire/livewire']) {
      evidence.push('livewire/livewire in composer.json dependencies');
      confidence += 0.8;
    }

    // Check for Livewire v3 package name
    if (context.composerJson.require?.['livewire/volt'] ||
        context.composerJson['require-dev']?.['livewire/volt']) {
      evidence.push('livewire/volt detected (Livewire v3 companion)');
      confidence += 0.2;
    }

    // Check for Livewire directories
    const files = context.files || [];
    const livewireComponents = files.filter(file =>
      file.includes('app/Http/Livewire/') ||
      file.includes('app/Livewire/') ||
      file.includes('resources/views/livewire/')
    );

    if (livewireComponents.length > 0) {
      evidence.push(`Livewire components found: ${livewireComponents.length}`);
      confidence += Math.min(livewireComponents.length * 0.1, 0.3);
    }

    // Check for Livewire Blade directives in view files
    const bladeFiles = files.filter(file => file.endsWith('.blade.php'));
    let wireDirectivesFound = 0;

    for (const file of bladeFiles.slice(0, 10)) { // Check first 10 blade files
      if (file.includes('wire:') || file.includes('@livewire')) {
        wireDirectivesFound++;
      }
    }

    if (wireDirectivesFound > 0) {
      evidence.push(`Blade files with Livewire directives: ${wireDirectivesFound}`);
      confidence += Math.min(wireDirectivesFound * 0.05, 0.2);
    }

    // Check for Livewire config
    const configFiles = context.configFiles || [];
    if (configFiles.includes('config/livewire.php') || files.some(file => file.includes('config/livewire.php'))) {
      evidence.push('Livewire config file found');
      confidence += 0.2;
    }

    // Check for Livewire tests
    const livewireTests = files.filter(file =>
      file.includes('tests/') && (
        file.includes('Livewire') ||
        file.includes('livewire')
      )
    );

    if (livewireTests.length > 0) {
      evidence.push(`Livewire test files found: ${livewireTests.length}`);
      confidence += 0.1;
    }

    return {
      detected: confidence >= 0.3,
      confidence: Math.min(confidence, 1),
      evidence
    };
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    if (!context.composerJson) return undefined;

    const livewireVersion =
      context.composerJson.require?.['livewire/livewire'] ||
      context.composerJson['require-dev']?.['livewire/livewire'];

    if (livewireVersion) {
      const match = livewireVersion.match(/(\d+)/);
      return match ? match[1] : undefined;
    }

    return undefined;
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [
      {
        path: 'livewire/guidelines/laravel-tool.md',
        priority: this.priorityType,
        category: 'framework'
      }
    ];

    if (version) {
      const majorVersion = version.split('.')[0];
      paths.push({
        path: `livewire/guidelines/${majorVersion}/features.md`,
        priority: this.priorityType,
        category: 'framework',
        version: majorVersion
      });
    }

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<StackCommands> {
    const commands: StackCommands = {
      dev: ['php artisan serve'],
      build: ['php artisan optimize'],
      test: ['php artisan test'],
      lint: ['./vendor/bin/pint'],
      install: ['composer install']
    };

    const configFiles = context.detectedStack.configFiles;

    // Add Livewire-specific commands
    commands.dev?.unshift('php artisan livewire:publish --force'); // Publish Livewire assets

    // Add testing commands
    if (configFiles.includes('phpunit.xml') || configFiles.includes('phpunit.xml.dist')) {
      commands.test?.push('./vendor/bin/phpunit --filter=Livewire');
    }

    if (configFiles.includes('pest.xml')) {
      commands.test?.push('./vendor/bin/pest --group=livewire');
    }

    return commands;
  }

  getSupportedExtensions(): string[] {
    return ['.php', '.blade.php'];
  }

  getConfigFiles(): string[] {
    return [
      'composer.json',
      'config/livewire.php',
      'phpunit.xml',
      'phpunit.xml.dist',
      'pest.xml'
    ];
  }
}