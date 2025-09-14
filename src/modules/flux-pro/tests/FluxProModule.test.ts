import { describe, test, expect, beforeEach } from 'bun:test';
import { FluxProModule } from '../FluxProModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('FluxProModule', () => {
  let module: FluxProModule;

  beforeEach(() => {
    module = new FluxProModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('flux-pro');
      expect(metadata.displayName).toBe('Flux UI Pro');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://fluxui.dev/pro');
      expect(metadata.keywords).toContain('laravel');
      expect(metadata.keywords).toContain('livewire');
      expect(metadata.keywords).toContain('ui');
      expect(metadata.keywords).toContain('premium');
      expect(metadata.keywords).toContain('components');
      expect(metadata.supportedVersions).toContain('1.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('flux-pro');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('laravel-tool');
    });
  });

  describe('detect', () => {
    test('should detect Flux Pro with Pro version indicators', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'config/flux.php', '.env.pro'],
        files: [
          'resources/views/components/Calendar.blade.php',
          'resources/views/dashboard/charts.blade.php',
          'app/Livewire/DataTable.php'
        ],
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
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('Flux UI found in composer.json dependencies');
      expect(result.evidence).toContain('Flux UI Pro version indicators detected');
    });

    test('should detect Pro components in file names', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'resources/views/components/accordion.blade.php',
          'resources/views/components/data-table.blade.php',
          'resources/views/admin/charts.blade.php'
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
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('Flux UI Pro components detected');
    });

    test('should detect Pro license indicators', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', '.flux-pro'],
        files: ['config/flux-license.php'],
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
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('Flux UI Pro license or configuration detected');
    });

    test('should not detect if no Pro indicators found', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['resources/views/simple.blade.php'],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/flux': '^1.0.0',
            'livewire/livewire': '^3.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0);
      expect(result.evidence).toContain('Flux UI detected but no Pro version indicators found');
    });

    test('should not detect without Livewire', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['resources/views/pro/calendar.blade.php'],
        packageJson: null,
        composerJson: {
          require: {
            'livewire/flux': '^1.0.0',
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeLessThan(0.8);
      expect(result.evidence).toContain('Warning: Flux UI requires Livewire');
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
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('flux-pro/guidelines/components.md');
      expect(paths[0].priority).toBe('laravel-tool');
      expect(paths[0].category).toBe('ui');
    });
  });

  describe('generateCommands', () => {
    test('should generate Laravel Pro commands', async () => {
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
      expect(commands.build).toContain('php artisan optimize');
      expect(commands.test).toContain('php artisan test');
      expect(commands.install).toContain('composer install');
    });

    test('should include Pro-specific commands', async () => {
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

      expect(commands.build).toContain('php artisan flux:optimize');
      expect(commands.dev).toContain('php artisan flux:install');
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
    test('should return Flux Pro config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('config/flux.php');
      expect(configFiles).toContain('config/livewire.php');
      expect(configFiles).toContain('.env');
      expect(configFiles).toContain('.env.local');
    });
  });
});