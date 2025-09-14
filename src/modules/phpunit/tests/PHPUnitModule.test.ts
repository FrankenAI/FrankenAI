import { describe, test, expect, beforeEach } from 'bun:test';
import { PHPUnitModule } from '../PHPUnitModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('PHPUnitModule', () => {
  let module: PHPUnitModule;

  beforeEach(() => {
    module = new PHPUnitModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('phpunit');
      expect(metadata.displayName).toBe('PHPUnit');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://phpunit.de');
      expect(metadata.keywords).toContain('php');
      expect(metadata.keywords).toContain('testing');
      expect(metadata.keywords).toContain('unit-tests');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.supportedVersions).toContain('9.x');
      expect(metadata.supportedVersions).toContain('10.x');
      expect(metadata.supportedVersions).toContain('11.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('phpunit');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('laravel-tool');
    });
  });

  describe('detect', () => {
    test('should detect PHPUnit project with composer dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'phpunit.xml'],
        files: ['tests/ExampleTest.php', 'tests/Unit/UserTest.php'],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'phpunit/phpunit': '^10.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('PHPUnit found in composer.json dependencies');
      expect(result.evidence).toContain('PHPUnit config found: phpunit.xml');
      expect(result.evidence).toContain('Tests directory with PHP files found');
    });

    test('should detect PHPUnit with dist config', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'phpunit.xml.dist'],
        files: ['tests/Feature/ExampleTest.php'],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'phpunit/phpunit': '^9.5'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('PHPUnit config found: phpunit.xml.dist');
    });

    test('should detect PHPUnit with vendor binary only', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['tests/ExampleTest.php', 'vendor/bin/phpunit'],
        packageJson: null,
        composerJson: {
          dependencies: {
            'phpunit/phpunit': '^10.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('PHPUnit binary found in vendor/bin');
    });

    test('should detect PHPUnit with test classes pattern', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['tests/UserTest.php', 'tests/BaseTestCase.php'],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'phpunit/phpunit': '^11.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.evidence).toContain('PHPUnit test classes found');
    });

    test('should not detect non-PHPUnit project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['src/App.php'],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'pestphp/pest': '^2.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.6);
    });
  });

  describe('detectVersion', () => {
    test('should detect PHPUnit version from require-dev', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'phpunit/phpunit': '^10.5.1'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('10.5.1');
    });

    test('should detect PHPUnit version from require', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            'phpunit/phpunit': '~9.5'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('9.5');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('phpunit/guidelines/framework.md');
      expect(paths[0].priority).toBe('laravel-tool');
      expect(paths[0].category).toBe('testing');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('10.5.1');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('phpunit/guidelines/framework.md');
      expect(paths[1].path).toBe('phpunit/guidelines/10/features.md');
      expect(paths[1].version).toBe('10');
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
          configFiles: ['composer.json', 'phpunit.xml'],
          commands: { dev: [], build: [], test: [], lint: [], install: [] }
        },
        detectionResult: { detected: true, confidence: 1, evidence: [] }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('php artisan test');
      expect(commands.test).toContain('php artisan test --parallel');
      expect(commands.test).toContain('php artisan test --coverage');
    });

    test('should generate standalone PHPUnit commands for non-Laravel', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: [],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'phpunit.xml'],
          commands: { dev: [], build: [], test: [], lint: [], install: [] }
        },
        detectionResult: { detected: true, confidence: 1, evidence: [] }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('vendor/bin/phpunit');
      expect(commands.test).toContain('composer test');
      expect(commands.test).toContain('vendor/bin/phpunit --coverage-html coverage');
    });
  });

  describe('getSupportedExtensions', () => {
    test('should return PHP file extensions', () => {
      const extensions = module.getSupportedExtensions();

      expect(extensions).toContain('.php');
    });
  });

  describe('getConfigFiles', () => {
    test('should return PHPUnit config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('phpunit.xml');
      expect(configFiles).toContain('phpunit.xml.dist');
      expect(configFiles).toContain('phpunit.dist.xml');
      expect(configFiles).toContain('tests/phpunit.xml');
    });
  });
});