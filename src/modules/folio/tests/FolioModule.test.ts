import { describe, test, expect, beforeEach } from 'bun:test';
import { FolioModule } from '../FolioModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('FolioModule', () => {
  let module: FolioModule;

  beforeEach(() => {
    module = new FolioModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('folio');
      expect(metadata.displayName).toBe('Laravel Folio');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://laravel.com/docs/folio');
      expect(metadata.keywords).toContain('laravel');
      expect(metadata.keywords).toContain('routing');
      expect(metadata.keywords).toContain('pages');
      expect(metadata.keywords).toContain('file-based');
      expect(metadata.supportedVersions).toContain('1.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('folio');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('laravel-tool');
    });
  });

  describe('detect', () => {
    test('should detect Folio project with laravel/folio dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'config/app.php'],
        files: [
          'resources/views/pages/index.blade.php',
          'resources/views/pages/about.blade.php',
          'resources/views/pages/users/[user].blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/folio': '^1.0.0',
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('Laravel Folio found in composer.json dependencies');
      expect(result.evidence).toContain('Laravel framework detected');
      expect(result.evidence).toContain('Folio page files detected in resources/views/pages/');
    });

    test('should detect Folio page structure', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'resources/views/pages/home.blade.php',
          'resources/views/pages/blog/[post].blade.php',
          'resources/views/pages/users/[user]/settings.blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/folio': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.evidence).toContain('Folio page files detected in resources/views/pages/');
    });

    test('should detect dynamic route patterns', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'resources/views/pages/products/[slug].blade.php',
          'resources/views/pages/categories/[...path].blade.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/folio': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.evidence).toContain('Folio dynamic route patterns detected');
    });

    test('should not detect without Laravel framework', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['resources/views/pages/index.blade.php'],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/folio': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeLessThan(0.8);
      expect(result.evidence).toContain('Warning: Folio requires Laravel framework');
    });

    test('should not detect non-Laravel projects', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['pages/index.js', 'pages/about.js'],
        packageJson: {
          dependencies: {
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
    test('should detect Folio version from composer.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/folio': '^1.2.3'
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
            'laravel/folio': '^1.1.0'
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
      expect(paths[0].path).toBe('folio/guidelines/routing.md');
      expect(paths[0].priority).toBe('laravel-tool');
      expect(paths[0].category).toBe('framework');
    });
  });

  describe('generateCommands', () => {
    test('should generate Laravel Folio commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'artisan'],
          dependencies: ['laravel/folio']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan serve');
      expect(commands.build).toContain('php artisan optimize');
      expect(commands.test).toContain('php artisan test');
      expect(commands.install).toContain('composer install');
    });

    test('should include Folio-specific commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json'],
          dependencies: ['laravel/folio']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('php artisan folio:list');
      expect(commands.build).toContain('php artisan route:cache');
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
    test('should return Folio config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('config/app.php');
      expect(configFiles).toContain('composer.json');
      expect(configFiles).toContain('routes/web.php');
      expect(configFiles).toContain('.env');
    });
  });
});