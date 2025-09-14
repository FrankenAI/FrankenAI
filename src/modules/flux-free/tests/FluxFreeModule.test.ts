import { describe, test, expect, beforeEach } from 'bun:test';
import { FluxFreeModule } from '../FluxFreeModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('FluxFreeModule', () => {
  let module: FluxFreeModule;

  beforeEach(() => {
    module = new FluxFreeModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('flux-free');
      expect(metadata.displayName).toBe('Flux UI Free');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://fluxui.dev');
      expect(metadata.keywords).toContain('laravel');
      expect(metadata.keywords).toContain('livewire');
      expect(metadata.keywords).toContain('ui');
      expect(metadata.keywords).toContain('components');
      expect(metadata.supportedVersions).toContain('1.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('flux-free');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('laravel-tool');
    });
  });

  describe('detect', () => {
    test('should detect Flux Free project with livewire/flux dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'config/app.php'],
        files: ['resources/views/components/Button.blade.php', 'app/Livewire/Dashboard.php'],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/flux': '^1.0.0',
            'livewire/livewire': '^3.0.0',
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('Flux UI found in composer.json dependencies');
      expect(result.evidence).toContain('Livewire framework detected (required for Flux)');
      expect(result.evidence).toContain('Laravel framework detected');
    });

    test('should detect Flux Free components in blade files', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'resources/views/dashboard.blade.php',
          'resources/views/components/form.blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/flux': '^1.0.0',
            'livewire/livewire': '^3.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.evidence).toContain('Flux UI found in composer.json dependencies');
    });

    test('should reduce confidence without Livewire dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['resources/views/app.blade.php'],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/flux': '^1.0.0',
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.evidence).toContain('Warning: Flux UI requires Livewire');
    });

    test('should not detect non-Laravel projects', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/App.jsx', 'src/components/Button.jsx'],
        packageJson: {
          dependencies: {
            react: '^18.0.0'
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
    test('should detect Flux version from composer.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/flux': '^1.2.3'
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
            'livewire/flux': '^1.1.0'
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
      expect(paths[0].path).toBe('flux-free/guidelines/components.md');
      expect(paths[0].priority).toBe('laravel-tool');
      expect(paths[0].category).toBe('framework');
    });
  });

  describe('generateCommands', () => {
    test('should generate Laravel Artisan commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel', 'Livewire'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'artisan'],
          dependencies: ['livewire/flux']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan serve');
      expect(commands.install).toContain('composer install');
    });

    test('should include Livewire commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel', 'Livewire'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json'],
          dependencies: ['livewire/flux']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan livewire:publish --config');
      expect(commands.install).toContain('php artisan flux:install');
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
    test('should return Flux and Laravel config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('config/flux.php');
      expect(configFiles).toContain('config/livewire.php');
    });
  });
});