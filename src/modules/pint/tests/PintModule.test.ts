import { describe, test, expect, beforeEach } from 'bun:test';
import { PintModule } from '../PintModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('PintModule', () => {
  let module: PintModule;

  beforeEach(() => {
    module = new PintModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('pint');
      expect(metadata.displayName).toBe('Laravel Pint');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://laravel.com/docs/pint');
      expect(metadata.keywords).toContain('laravel');
      expect(metadata.keywords).toContain('code-style');
      expect(metadata.keywords).toContain('formatter');
      expect(metadata.keywords).toContain('php-cs-fixer');
      expect(metadata.supportedVersions).toContain('1.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('pint');
      expect(module.type).toBe('tool');
      expect(module.priorityType).toBe('laravel-tool');
    });
  });

  describe('detect', () => {
    test('should detect Pint project with laravel/pint dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'pint.json'],
        files: [
          'app/Models/User.php',
          'app/Http/Controllers/Controller.php',
          'tests/Feature/ExampleTest.php'
        ],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'laravel/pint': '^1.0.0',
            'laravel/framework': '^10.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('Laravel Pint found in composer.json dependencies');
      expect(result.evidence).toContain('Laravel framework detected');
      expect(result.evidence).toContain('Pint config file detected');
    });

    test('should detect Pint with default Laravel setup', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [
          'app/Models/User.php',
          'app/Http/Controllers/HomeController.php'
        ],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'laravel/pint': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.evidence).toContain('Laravel Pint found in composer.json dependencies');
      expect(result.evidence).toContain('PHP files detected for code styling');
    });

    test('should detect custom Pint configuration', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'pint.json', '.pint.json'],
        files: ['app/Services/PaymentService.php'],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'laravel/pint': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('Pint config file detected');
    });

    test('should work without Laravel framework', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json', 'pint.json'],
        files: ['src/Calculator.php', 'src/Parser.php'],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'laravel/pint': '^1.0.0'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.evidence).toContain('Laravel Pint found in composer.json dependencies');
    });

    test('should not detect non-PHP projects', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/index.js', 'src/utils.js'],
        packageJson: {
          devDependencies: {
            'prettier': '^2.0.0'
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
    test('should detect Pint version from composer.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          'require-dev': {
            'laravel/pint': '^1.2.3'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('1.2.3');
    });

    test('should handle regular dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            'laravel/pint': '^1.1.0'
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
      expect(paths[0].path).toBe('pint/guidelines/code-style.md');
      expect(paths[0].priority).toBe('laravel-tool');
      expect(paths[0].category).toBe('tooling');
    });
  });

  describe('generateCommands', () => {
    test('should generate Laravel Pint commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'artisan'],
          dependencies: ['laravel/pint']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.lint).toContain('./vendor/bin/pint');
      expect(commands.lint).toContain('./vendor/bin/pint --test');
      expect(commands.install).toContain('composer install');
    });

    test('should include Pint-specific commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json'],
          dependencies: ['laravel/pint']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.lint).toContain('./vendor/bin/pint --dry-run');
      expect(commands.build).toContain('./vendor/bin/pint');
    });
  });

  describe('getSupportedExtensions', () => {
    test('should return supported file extensions', () => {
      const extensions = module.getSupportedExtensions();

      expect(extensions).toContain('.php');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Pint config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('pint.json');
      expect(configFiles).toContain('.pint.json');
      expect(configFiles).toContain('composer.json');
      expect(configFiles).toContain('.php-cs-fixer.php');
    });
  });
});