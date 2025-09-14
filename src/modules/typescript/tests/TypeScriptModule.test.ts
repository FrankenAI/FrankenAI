import { describe, test, expect, beforeEach } from 'bun:test';
import { TypeScriptModule } from '../TypeScriptModule.js';
import type { DetectionContext } from '../../../core/types/Module.js';

describe('TypeScriptModule', () => {
  let module: TypeScriptModule;
  let mockContext: DetectionContext;

  beforeEach(() => {
    module = new TypeScriptModule();
    mockContext = {
      projectRoot: '/mock/project',
      files: [],
      packageManagers: ['npm']
    };
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('typescript');
      expect(metadata.displayName).toBe('TypeScript');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://www.typescriptlang.org');
      expect(metadata.keywords).toContain('typescript');
      expect(metadata.keywords).toContain('language');
      expect(metadata.keywords).toContain('types');
      expect(metadata.supportedVersions).toContain('5.0');
      expect(metadata.supportedVersions).toContain('5.4');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('typescript');
      expect(module.type).toBe('language');
      expect(module.priorityType).toBe('specialized-lang');
    });
  });

  describe('detect', () => {
    test('should detect TypeScript project with tsconfig.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'tsconfig.json'],
        files: ['src/index.ts', 'src/types.d.ts'],
        packageJson: {
          devDependencies: {
            typescript: '^5.2.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('tsconfig.json found');
      expect(result.evidence).toContain('typescript in package.json dependencies');
    });

    test('should detect TypeScript project with .ts files', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/main.ts', 'src/utils.ts', 'src/types/api.d.ts'],
        packageJson: {
          dependencies: {
            '@types/node': '^20.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.evidence).toContain('TypeScript files found: 2');
      expect(result.evidence).toContain('TypeScript declaration files found: 1');
    });

    test('should detect TypeScript project with TypeScript packages', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'vite.config.ts'],
        files: ['src/index.ts'],
        packageJson: {
          devDependencies: {
            '@types/react': '^18.0.0',
            'ts-node': '^10.9.0',
            'typescript-eslint': '^6.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.evidence).toContain('TypeScript package detected: @types/react');
      expect(result.evidence).toContain('TypeScript config file: vite.config.ts');
    });

    test('should not detect non-TypeScript project', async () => {
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

    test('should not detect PHP project as TypeScript', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['composer.json'],
        files: ['src/Controller.php', 'src/Model.php'],
        packageJson: null,
        composerJson: {
          require: {
            'php': '^8.1'
          }
        }
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0);
    });
  });

  describe('detectVersion', () => {
    test('should detect TypeScript version from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          devDependencies: {
            typescript: '^5.2.4'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('5');
    });

    test('should handle TypeScript 4.x version detection', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          devDependencies: {
            typescript: '^4.9.5'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('4');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('typescript/guidelines/language.md');
      expect(paths[0].priority).toBe('specialized-lang');
      expect(paths[0].category).toBe('language');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('5.2');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('typescript/guidelines/language.md');
      expect(paths[1].path).toBe('typescript/guidelines/5.2/features.md');
      expect(paths[1].version).toBe('5.2');
    });
  });

  describe('getSupportedExtensions', () => {
    test('should return supported file extensions', () => {
      const extensions = module.getSupportedExtensions();

      expect(extensions).toContain('.ts');
      expect(extensions).toContain('.tsx');
      expect(extensions).toContain('.d.ts');
    });
  });

  describe('getRuntime', () => {
    test('should return correct runtime', () => {
      const runtime = module.getRuntime();

      expect(runtime).toBe('node');
    });
  });
});