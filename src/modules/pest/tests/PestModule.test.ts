import { describe, test, expect, beforeEach } from 'bun:test';
import { PestModule } from '../PestModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('PestModule', () => {
  let module: PestModule;

  beforeEach(() => {
    module = new PestModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('pest');
      expect(metadata.displayName).toBe('Pest');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://pestphp.com');
      expect(metadata.keywords).toContain('php');
      expect(metadata.keywords).toContain('testing');
      expect(metadata.keywords).toContain('pest');
      expect(metadata.keywords).toContain('modern');
      expect(metadata.supportedVersions).toContain('2.x');
      expect(metadata.supportedVersions).toContain('3.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('pest');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('laravel-tool');
    });
  });

  describe('detect', () => {
    test('should detect Pest project with composer dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'tests/Pest.php'],
        files: ['tests/Unit/ExampleTest.php', 'tests/Feature/ExampleTest.php'],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'pestphp/pest': '^2.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('Pest found in composer.json dependencies');
      expect(result.evidence).toContain('Pest config found: tests/Pest.php');
      expect(result.excludes).toContain('phpunit');
    });

    test('should detect Pest Laravel project with plugin', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'tests/Pest.php'],
        files: ['tests/Feature/AuthTest.php', 'app/Models/User.php'],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'pestphp/pest': '^2.24',
            'pestphp/pest-plugin-laravel': '^2.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.evidence).toContain('Pest Laravel plugin found in composer.json');
      expect(result.metadata?.hasLaravelPlugin).toBe(true);
    });

    test('should detect Pest with config file only', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['tests/Pest.php'],
        files: ['tests/ExampleTest.php'],
        packageJson: null,
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.evidence).toContain('Pest config found: tests/Pest.php');
    });

    test('should not detect non-Pest project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['tests/ExampleTest.php'],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'phpunit/phpunit': '^10.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.7);
    });
  });

  describe('detectVersion', () => {
    test('should detect Pest version from composer.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'pestphp/pest': '^2.24.1'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('2.24.1');
    });

    test('should handle version with tilde constraint', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'pestphp/pest': '~2.20'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('2.20');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('pest/guidelines/framework.md');
      expect(paths[0].priority).toBe('laravel-tool');
      expect(paths[0].category).toBe('testing');
      expect(paths[1].path).toBe('pest/guidelines/laravel-integration.md');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('2.24.1');

      expect(paths).toHaveLength(3);
      expect(paths[0].path).toBe('pest/guidelines/framework.md');
      expect(paths[1].path).toBe('pest/guidelines/laravel-integration.md');
      expect(paths[2].path).toBe('pest/guidelines/2/features.md');
      expect(paths[2].version).toBe('2');
    });
  });

  describe('generateCommands', () => {
    test('should generate Laravel Artisan commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'tests/Pest.php'],
          commands: { dev: [], build: [], test: [], lint: [], install: [] }
        },
        detectionResult: { detected: true, confidence: 1, evidence: [] }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('php artisan test');
      expect(commands.test).toContain('php artisan test --parallel');
      expect(commands.test).toContain('php artisan test --coverage');
      expect(commands.test).toContain('php artisan test --profile');
    });

    test('should generate standalone Pest commands for non-Laravel', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: [],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'tests/Pest.php'],
          commands: { dev: [], build: [], test: [], lint: [], install: [] }
        },
        detectionResult: { detected: true, confidence: 1, evidence: [] }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('vendor/bin/pest');
      expect(commands.test).toContain('composer test');
      expect(commands.test).toContain('vendor/bin/pest --coverage');
      expect(commands.test).toContain('vendor/bin/pest --profile');
    });
  });

  describe('getSupportedExtensions', () => {
    test('should return PHP file extensions', () => {
      const extensions = module.getSupportedExtensions();

      expect(extensions).toContain('.php');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Pest config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('tests/Pest.php');
      expect(configFiles).toContain('Pest.php');
      expect(configFiles).toContain('pest.xml');
      expect(configFiles).toContain('pest.xml.dist');
    });
  });
});