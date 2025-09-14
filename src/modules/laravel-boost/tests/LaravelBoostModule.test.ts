import { describe, test, expect, beforeEach } from 'bun:test';
import { LaravelBoostModule } from '../LaravelBoostModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('LaravelBoostModule', () => {
  let module: LaravelBoostModule;

  beforeEach(() => {
    module = new LaravelBoostModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('laravel-boost');
      expect(metadata.displayName).toBe('Laravel Boost');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://laravelboost.com');
      expect(metadata.keywords).toContain('laravel');
      expect(metadata.keywords).toContain('boost');
      expect(metadata.keywords).toContain('methodology');
      expect(metadata.keywords).toContain('meta-framework');
      expect(metadata.supportedVersions).toContain('1.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('laravel-boost');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('meta-framework');
    });
  });

  describe('detect', () => {
    test('should detect Laravel Boost with config file', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'boost.config.php', 'config/boost.php'],
        files: [
          'resources/boost/components/UserCard.blade.php',
          'app/Boost/Features/UserManagement.php',
          'database/boost/migrations/create_users_table.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('Laravel Boost configuration file detected');
      expect(result.evidence).toContain('Laravel framework detected (required for Boost)');
      expect(result.evidence).toContain('Laravel Boost directory structure detected');

      // Should exclude redundant modules
      expect(result.excludes).toBeDefined();
      expect(result.excludes).toContain('laravel');
      expect(result.excludes).toContain('tailwind');
      expect(result.excludes).toContain('livewire');
      expect(result.excludes).toContain('volt');
      expect(result.excludes).toContain('pint');
    });

    test('should detect Laravel Boost with DATA files', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'DATA/fluxui-pro/core.blade.php',
          'DATA/pennant/core.blade.php',
          'DATA/volt/core.blade.php',
          'resources/views/components/Button.blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.evidence).toContain('Laravel Boost methodology data files detected');
      expect(result.metadata?.boostComponents).toContain('boost-methodology');
    });

    test('should detect Laravel Boost with package.json dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'composer.json'],
        files: ['resources/views/app.blade.php'],
        packageJson: {
          devDependencies: {
            'laravel-boost': '^1.0.0',
            'tailwindcss': '^3.0.0'
          }
        },
        composerJson: {
          require: {
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.5);
      expect(result.evidence).toContain('Laravel Boost dependencies detected in package.json');
    });

    test('should detect Laravel Boost with boost patterns in files', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'resources/views/boost/dashboard.blade.php',
          'app/Http/Controllers/BoostController.php',
          'README-boost.md'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.6);
    });

    test('should not detect without Laravel framework', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['boost.config.php'],
        files: ['app/Boost/UserCard.php'],
        packageJson: null,
        composerJson: {
          require: {
            'symfony/console': '^6.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.6);
      expect(result.evidence).toContain('Warning: Laravel Boost requires Laravel framework');
    });

    test('should not detect non-Laravel projects', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/App.jsx', 'src/components/Button.jsx'],
        packageJson: {
          dependencies: {
            'react': '^18.0.0',
            'next': '^13.0.0'
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
    test('should return default version when no specific version found', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['boost.config.php'],
        files: [],
        packageJson: null,
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('1.0.0');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('laravel-boost/guidelines/methodology.md');
      expect(paths[0].priority).toBe('meta-framework');
      expect(paths[0].category).toBe('methodology');
    });
  });

  describe('generateCommands', () => {
    test('should generate Laravel Boost commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel Boost'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'artisan'],
          dependencies: []
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan serve');
      expect(commands.dev).toContain('php artisan boost:dev');
      expect(commands.build).toContain('php artisan optimize');
      expect(commands.build).toContain('php artisan boost:build');
      expect(commands.install).toContain('composer install');
      expect(commands.install).toContain('php artisan boost:install');
    });
  });

  describe('getSupportedExtensions', () => {
    test('should return supported file extensions', () => {
      const extensions = module.getSupportedExtensions();

      expect(extensions).toContain('.php');
      expect(extensions).toContain('.blade.php');
      expect(extensions).toContain('.js');
      expect(extensions).toContain('.ts');
      expect(extensions).toContain('.css');
      expect(extensions).toContain('.scss');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Laravel Boost config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('boost.config.js');
      expect(configFiles).toContain('boost.config.php');
      expect(configFiles).toContain('config/boost.php');
      expect(configFiles).toContain('laravel-boost.json');
      expect(configFiles).toContain('.boost');
      expect(configFiles).toContain('composer.json');
      expect(configFiles).toContain('package.json');
    });
  });
});