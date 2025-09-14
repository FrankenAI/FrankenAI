import { describe, test, expect, beforeEach } from 'bun:test';
import { VueModule } from '../VueModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('VueModule', () => {
  let module: VueModule;
  let mockContext: DetectionContext;

  beforeEach(() => {
    module = new VueModule();
    mockContext = {
      projectRoot: '/mock/project',
      files: [],
      packageManagers: ['npm']
    };
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('vue');
      expect(metadata.displayName).toBe('Vue.js');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://vuejs.org');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('frontend');
      expect(metadata.supportedVersions).toContain('3.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('vue');
      expect(module.type).toBe('framework');
      expect(module.priorityType).toBe('framework');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('vue/guidelines/framework.md');
      expect(paths[0].priority).toBe('framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('3.4.0');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('vue/guidelines/framework.md');
      expect(paths[1].path).toBe('vue/guidelines/3/features.md');
      expect(paths[1].version).toBe('3');
    });

    test('should extract major version correctly', async () => {
      const paths = await module.getGuidelinePaths('v2.7.14');

      expect(paths[1].path).toBe('vue/guidelines/2/features.md');
      expect(paths[1].version).toBe('2');
    });
  });

  describe('generateCommands', () => {
    test('should generate correct npm commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Vue.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json'],
          dependencies: ['vue']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('npm run dev');
      expect(commands.dev).toContain('npm run serve');
      expect(commands.build).toContain('npm run build');
      expect(commands.test).toContain('npm run test');
      expect(commands.test).toContain('npm run test:unit');
      expect(commands.lint).toContain('npm run lint');
      expect(commands.lint).toContain('npm run lint:fix');
      expect(commands.install).toContain('npm install');
    });

    test('should generate correct yarn commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Vue.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['yarn'],
          configFiles: ['package.json', 'yarn.lock'],
          dependencies: ['vue']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('yarn run dev');
      expect(commands.build).toContain('yarn run build');
      expect(commands.install).toContain('yarn install');
    });

    test('should add vitest commands when vitest config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Vue.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'vitest.config.ts'],
          dependencies: ['vue']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:vitest');
    });

    test('should add jest commands when jest config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Vue.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'jest.config.js'],
          dependencies: ['vue']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:jest');
    });

    test('should prefer bun over other package managers', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Vue.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['bun', 'npm', 'yarn'],
          configFiles: ['package.json'],
          dependencies: ['vue']
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
    });
  });

  describe('getConfigFiles', () => {
    test('should return Vue config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('vue.config.js');
      expect(configFiles).toContain('vite.config.js');
    });
  });
});