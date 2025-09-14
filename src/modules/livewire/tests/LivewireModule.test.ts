import { describe, test, expect, beforeEach } from 'bun:test';
import { LivewireModule } from '../LivewireModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('LivewireModule', () => {
  let module: LivewireModule;

  beforeEach(() => {
    module = new LivewireModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('livewire');
      expect(metadata.displayName).toBe('Livewire');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://laravel-livewire.com');
      expect(metadata.keywords).toContain('laravel');
      expect(metadata.keywords).toContain('livewire');
      expect(metadata.keywords).toContain('full-stack');
      expect(metadata.supportedVersions).toContain('2.x');
      expect(metadata.supportedVersions).toContain('3.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('livewire');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('laravel-tool');
    });
  });

  describe('detect', () => {
    test('should detect Livewire project with composer dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'config/livewire.php'],
        files: [
          'app/Http/Livewire/Counter.php',
          'resources/views/livewire/counter.blade.php',
          'tests/Feature/Livewire/CounterTest.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/framework': '^10.0',
            'livewire/livewire': '^3.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('livewire/livewire in composer.json dependencies');
      expect(result.evidence).toContain('Livewire components found: 2');
      expect(result.evidence).toContain('Livewire config file found');
    });

    test('should detect Livewire project with v3 Volt package', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['app/Livewire/ShowPosts.php'],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/framework': '^10.0',
            'livewire/livewire': '^3.0',
            'livewire/volt': '^1.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('livewire/volt detected (Livewire v3 companion)');
    });

    test('should detect Livewire from component directories only', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'app/Livewire/CreatePost.php',
          'app/Livewire/EditPost.php',
          'resources/views/livewire/create-post.blade.php',
          'resources/views/livewire/edit-post.blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/framework': '^10.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('Livewire components found: 4');
    });

    test('should not detect Livewire without Laravel', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['app/Livewire/Counter.php'],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/livewire': '^3.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.evidence).toContain('Laravel not found - required for Livewire');
    });

    test('should not detect non-Laravel project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/index.js'],
        packageJson: {
          dependencies: {
            react: '^18.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.evidence).toContain('No composer.json found - Laravel required');
    });
  });

  describe('detectVersion', () => {
    test('should detect Livewire version from composer.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/livewire': '^3.4.0'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('3');
    });

    test('should handle Livewire 2.x version detection', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/livewire': '^2.12.0'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('2');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('livewire/guidelines/laravel-tool.md');
      expect(paths[0].priority).toBe('laravel-tool');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('3.4.0');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('livewire/guidelines/laravel-tool.md');
      expect(paths[1].path).toBe('livewire/guidelines/3/features.md');
      expect(paths[1].version).toBe('3');
    });
  });

  describe('generateCommands', () => {
    test('should generate correct Laravel/Livewire commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'config/livewire.php'],
          dependencies: ['laravel/framework', 'livewire/livewire']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan livewire:publish --force');
      expect(commands.dev).toContain('php artisan serve');
      expect(commands.build).toContain('php artisan optimize');
      expect(commands.test).toContain('php artisan test');
      expect(commands.lint).toContain('./vendor/bin/pint');
      expect(commands.install).toContain('composer install');
    });

    test('should add PHPUnit filter for Livewire tests', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'phpunit.xml'],
          dependencies: ['livewire/livewire']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('./vendor/bin/phpunit --filter=Livewire');
    });

    test('should add Pest filter for Livewire tests', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'pest.xml'],
          dependencies: ['livewire/livewire']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('./vendor/bin/pest --group=livewire');
    });
  });

  describe('getSupportedExtensions', () => {
    test('should return supported file extensions', () => {
      const extensions = module.getSupportedExtensions();

      expect(extensions).toContain('.php');
      expect(extensions).toContain('.blade.php');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Livewire config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('composer.json');
      expect(configFiles).toContain('config/livewire.php');
      expect(configFiles).toContain('phpunit.xml');
      expect(configFiles).toContain('phpunit.xml.dist');
      expect(configFiles).toContain('pest.xml');
    });
  });
});