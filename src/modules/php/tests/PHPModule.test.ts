import { describe, test, expect, beforeEach } from 'bun:test';
import { PHPModule } from '../PHPModule.js';
import type { DetectionContext } from '../../../core/types/Module.js';

describe('PHPModule', () => {
  let module: PHPModule;

  beforeEach(() => {
    module = new PHPModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('php');
      expect(metadata.displayName).toBe('PHP');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://www.php.net');
      expect(metadata.keywords).toContain('php');
      expect(metadata.keywords).toContain('language');
      expect(metadata.keywords).toContain('backend');
      expect(metadata.supportedVersions).toContain('8.1');
      expect(metadata.supportedVersions).toContain('8.3');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('php');
      expect(module.type).toBe('language');
      expect(module.priorityType).toBe('specialized-lang');
    });
  });

  describe('detect', () => {
    test('should detect PHP project with composer.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['src/Controller.php', 'public/index.php'],
        packageJson: null,
        composerJson: {
          require: {
            php: '^8.2'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('composer.json found');
      expect(result.evidence).toContain('PHP files found: 2');
    });

    test('should detect PHP project with .php files', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['phpunit.xml'],
        files: [
          'src/Model.php',
          'src/Service.php',
          'app/Controllers/HomeController.php',
          'public/index.php'
        ],
        packageJson: null,
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.evidence).toContain('PHP files found: 4');
      expect(result.evidence).toContain('PHP config file: phpunit.xml');
    });

    test('should detect PHP project with directory structure', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['.php-cs-fixer.php'],
        files: [
          'vendor/autoload.php',
          'app/Models/User.php',
          'src/Services/PaymentService.php',
          'public/index.php'
        ],
        packageJson: null,
        composerJson: {
          require: {
            'php': '>=8.1'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('composer.json found');
      expect(result.evidence).toContain('PHP directory structure: vendor/');
      expect(result.evidence).toContain('PHP entry point: public/index.php');
    });

    test('should not detect non-PHP project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/index.js', 'src/utils.js'],
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

    test('should not detect TypeScript project as PHP', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'tsconfig.json'],
        files: ['src/index.ts', 'src/types.d.ts'],
        packageJson: {
          devDependencies: {
            typescript: '^5.0.0'
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
    test('should detect PHP version from composer.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            php: '^8.2.0'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('8.2');
    });

    test('should handle different PHP version formats', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: [],
        packageJson: null,
        composerJson: {
          require: {
            php: '>=8.1'
          }
        }
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('8.1');
    });

    test('should return undefined when no PHP version found', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: [],
        files: [],
        packageJson: null,
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBeUndefined();
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('php/guidelines/language.md');
      expect(paths[0].priority).toBe('specialized-lang');
      expect(paths[0].category).toBe('language');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('8.2');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('php/guidelines/language.md');
      expect(paths[1].path).toBe('php/guidelines/8.2/features.md');
      expect(paths[1].version).toBe('8.2');
    });
  });

  describe('getSupportedExtensions', () => {
    test('should return supported file extensions', () => {
      const extensions = module.getSupportedExtensions();

      expect(extensions).toContain('.php');
      expect(extensions).toContain('.phtml');
      expect(extensions).toContain('.php5');
    });
  });

  describe('getRuntime', () => {
    test('should return correct runtime', () => {
      const runtime = module.getRuntime();

      expect(runtime).toBe('php');
    });
  });
});