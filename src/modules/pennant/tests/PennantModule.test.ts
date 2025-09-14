import { describe, test, expect, beforeEach } from 'bun:test';
import { PennantModule } from '../PennantModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('PennantModule', () => {
  let module: PennantModule;

  beforeEach(() => {
    module = new PennantModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('pennant');
      expect(metadata.displayName).toBe('Laravel Pennant');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://laravel.com/docs/pennant');
      expect(metadata.keywords).toContain('laravel');
      expect(metadata.keywords).toContain('feature-flags');
      expect(metadata.keywords).toContain('toggles');
      expect(metadata.keywords).toContain('configuration');
      expect(metadata.supportedVersions).toContain('1.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('pennant');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('laravel-tool');
    });
  });

  describe('detect', () => {
    test('should detect Pennant project with laravel/pennant dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'config/pennant.php'],
        files: [
          'app/Http/Controllers/FeatureController.php',
          'resources/views/dashboard.blade.php',
          'database/migrations/create_features_table.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/pennant': '^1.0.0',
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('Laravel Pennant found in composer.json dependencies');
      expect(result.evidence).toContain('Laravel framework detected');
      expect(result.evidence).toContain('Pennant config file detected');
    });

    test('should detect Pennant usage in blade templates', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'resources/views/features/dashboard.blade.php',
          'resources/views/admin/features.blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/pennant': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.evidence).toContain('Laravel Pennant found in composer.json dependencies');
    });

    test('should detect feature flag migrations', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'database/migrations/create_features_table.php',
          'database/migrations/add_feature_flags.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/pennant': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.evidence).toContain('Pennant feature flag migrations detected');
    });

    test('should not detect without Laravel framework', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['config/pennant.php'],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/pennant': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeLessThan(0.8);
      expect(result.evidence).toContain('Warning: Pennant requires Laravel framework');
    });

    test('should not detect non-Laravel projects', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/features/flags.js'],
        packageJson: {
          dependencies: {
            'feature-flags': '^1.0.0'
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
    test('should detect Pennant version from composer.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/pennant': '^1.2.3'
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
            'laravel/pennant': '^1.1.0'
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
      expect(paths[0].path).toBe('pennant/guidelines/feature-flags.md');
      expect(paths[0].priority).toBe('laravel-tool');
      expect(paths[0].category).toBe('configuration');
    });
  });

  describe('generateCommands', () => {
    test('should generate Laravel Pennant commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'artisan'],
          dependencies: ['laravel/pennant']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan serve');
      expect(commands.build).toContain('php artisan optimize');
      expect(commands.test).toContain('php artisan test');
      expect(commands.install).toContain('composer install');
    });

    test('should include Pennant-specific commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json'],
          dependencies: ['laravel/pennant']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan pennant:features');
      expect(commands.build).toContain('php artisan pennant:clear');
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
    test('should return Pennant config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('config/pennant.php');
      expect(configFiles).toContain('config/cache.php');
      expect(configFiles).toContain('composer.json');
      expect(configFiles).toContain('.env');
    });
  });
});