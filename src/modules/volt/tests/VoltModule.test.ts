import { describe, test, expect, beforeEach } from 'bun:test';
import { VoltModule } from '../VoltModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('VoltModule', () => {
  let module: VoltModule;

  beforeEach(() => {
    module = new VoltModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('volt');
      expect(metadata.displayName).toBe('Laravel Volt');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://laravel.com/docs/volt');
      expect(metadata.keywords).toContain('laravel');
      expect(metadata.keywords).toContain('livewire');
      expect(metadata.keywords).toContain('functional');
      expect(metadata.keywords).toContain('components');
      expect(metadata.supportedVersions).toContain('1.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('volt');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('laravel-tool');
    });
  });

  describe('detect', () => {
    test('should detect Volt project with livewire/volt dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'config/volt.php'],
        files: [
          'resources/views/livewire/counter.blade.php',
          'resources/views/livewire/todos/index.blade.php',
          'resources/views/pages/dashboard.blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/volt': '^1.0.0',
            'livewire/livewire': '^3.0.0',
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('Laravel Volt found in composer.json dependencies');
      expect(result.evidence).toContain('Livewire framework detected (required for Volt)');
      expect(result.evidence).toContain('Laravel framework detected');
      expect(result.evidence).toContain('Volt config file detected');
    });

    test('should detect Volt functional components', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'resources/views/livewire/functional-counter.blade.php',
          'resources/views/livewire/components/todo-item.blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/volt': '^1.0.0',
            'livewire/livewire': '^3.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.evidence).toContain('Volt functional components detected');
    });

    test('should detect page-based Volt components', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'resources/views/pages/profile.blade.php',
          'resources/views/pages/settings/index.blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/volt': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.evidence).toContain('Volt page components detected');
    });

    test('should not detect without Livewire dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['resources/views/livewire/counter.blade.php'],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/volt': '^1.0.0',
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeLessThan(0.8);
      expect(result.evidence).toContain('Warning: Volt requires Livewire');
    });

    test('should not detect without Laravel framework', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['resources/views/components/counter.blade.php'],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/volt': '^1.0.0',
            'livewire/livewire': '^3.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeLessThan(0.8);
      expect(result.evidence).toContain('Warning: Volt requires Laravel framework');
    });

    test('should not detect non-Laravel projects', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/components/Counter.jsx'],
        packageJson: {
          dependencies: {
            'react': '^18.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.3);
    });
  });

  describe('detectVersion', () => {
    test('should detect Volt version from composer.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/volt': '^1.2.3'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('1.2.3');
    });

    test('should handle dev dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'livewire/volt': '^1.1.0'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('1.1.0');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('volt/guidelines/functional-api.md');
      expect(paths[0].priority).toBe('laravel-tool');
      expect(paths[0].category).toBe('framework');
    });
  });

  describe('generateCommands', () => {
    test('should generate Laravel Volt commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel', 'Livewire'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'artisan'],
          dependencies: ['livewire/volt']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan serve');
      expect(commands.build).toContain('php artisan optimize');
      expect(commands.test).toContain('php artisan test');
      expect(commands.install).toContain('composer install');
    });

    test('should include Volt-specific commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel', 'Livewire'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json'],
          dependencies: ['livewire/volt']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan volt:install');
      expect(commands.build).toContain('php artisan livewire:publish');
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
    test('should return Volt config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('config/volt.php');
      expect(configFiles).toContain('config/livewire.php');
      expect(configFiles).toContain('composer.json');
      expect(configFiles).toContain('.env');
    });
  });
});