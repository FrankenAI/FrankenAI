import { describe, test, expect, beforeEach } from 'bun:test';
import { NuxtModule } from '../NuxtModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('NuxtModule', () => {
  let module: NuxtModule;
  let mockContext: DetectionContext;

  beforeEach(() => {
    module = new NuxtModule();
    mockContext = {
      projectRoot: '/mock/project',
      files: [],
      packageManagers: ['npm']
    };
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('nuxt');
      expect(metadata.displayName).toBe('Nuxt.js');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://nuxt.com');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('vue');
      expect(metadata.keywords).toContain('ssr');
      expect(metadata.supportedVersions).toContain('2.x');
      expect(metadata.supportedVersions).toContain('3.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('nuxt');
      expect(module.type).toBe('framework');
      expect(module.priorityType).toBe('meta-framework');
    });
  });

  describe('detect', () => {
    test('should detect Nuxt.js project with dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'nuxt.config.js'],
        files: ['pages/index.vue', 'components/Header.vue'],
        packageJson: {
          dependencies: {
            nuxt: '^3.8.0',
            vue: '^3.3.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('nuxt in package.json dependencies');
    });

    test('should detect Nuxt.js project with multiple directories', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'nuxt.config.ts'],
        files: [
          'pages/index.vue',
          'components/Button.vue',
          'layouts/default.vue',
          'middleware/auth.js',
          'plugins/analytics.js'
        ],
        packageJson: {
          devDependencies: {
            nuxt: '^3.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('Nuxt config file: nuxt.config.ts');
      expect(result.evidence).toContain('Multiple Nuxt directories found');
    });

    test('should detect legacy Nuxt 2 project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'nuxt.config.js'],
        files: ['pages/index.vue', 'static/favicon.ico'],
        packageJson: {
          dependencies: {
            'nuxt-edge': '^2.15.0',
            vue: '^2.7.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.evidence).toContain('nuxt-edge in dependencies');
    });

    test('should not detect non-Nuxt project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/index.js'],
        packageJson: {
          dependencies: {
            vue: '^3.0.0'
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
    test('should detect Nuxt.js version from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            nuxt: '^3.8.4'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('3');
    });

    test('should handle Nuxt 2 version detection', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            nuxt: '^2.17.3'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('2');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('nuxt/guidelines/framework.md');
      expect(paths[0].priority).toBe('meta-framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('3.0.0');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('nuxt/guidelines/framework.md');
      expect(paths[1].path).toBe('nuxt/guidelines/3/features.md');
      expect(paths[1].version).toBe('3');
    });

    test('should extract major version correctly', async () => {
      const paths = await module.getGuidelinePaths('v2.17.3');

      expect(paths[1].path).toBe('nuxt/guidelines/2/features.md');
      expect(paths[1].version).toBe('2');
    });
  });

  describe('generateCommands', () => {
    test('should generate correct npm commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Nuxt.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json'],
          dependencies: ['nuxt']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('npm run dev');
      expect(commands.dev).toContain('npm run start');
      expect(commands.build).toContain('npm run build');
      expect(commands.build).toContain('npm run generate');
      expect(commands.test).toContain('npm run test');
      expect(commands.lint).toContain('npm run lint');
      expect(commands.lint).toContain('npm run lint:fix');
      expect(commands.install).toContain('npm install');
    });

    test('should generate correct yarn commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Nuxt.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['yarn'],
          configFiles: ['package.json', 'yarn.lock'],
          dependencies: ['nuxt']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('yarn run dev');
      expect(commands.build).toContain('yarn run build');
      expect(commands.build).toContain('yarn run generate');
      expect(commands.install).toContain('yarn install');
    });

    test('should add vitest commands when vitest config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Nuxt.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'vitest.config.ts'],
          dependencies: ['nuxt']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:vitest');
    });

    test('should add jest commands when jest config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Nuxt.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'jest.config.js'],
          dependencies: ['nuxt']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:jest');
    });

    test('should prefer bun over other package managers', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Nuxt.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['bun', 'npm', 'yarn'],
          configFiles: ['package.json'],
          dependencies: ['nuxt']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('bun run dev');
      expect(commands.install).toContain('bun install');
    });
  });

  describe('getSupportedExtensions', () => {
    test('should return supported file extensions', () => {
      const extensions = module.getSupportedExtensions();

      expect(extensions).toContain('.vue');
      expect(extensions).toContain('.js');
      expect(extensions).toContain('.ts');
      expect(extensions).toContain('.jsx');
      expect(extensions).toContain('.tsx');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Nuxt.js config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('nuxt.config.js');
      expect(configFiles).toContain('nuxt.config.ts');
      expect(configFiles).toContain('package.json');
      expect(configFiles).toContain('tsconfig.json');
    });
  });
});