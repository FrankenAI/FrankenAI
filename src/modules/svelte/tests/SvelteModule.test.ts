import { describe, test, expect, beforeEach } from 'bun:test';
import { SvelteModule } from '../SvelteModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('SvelteModule', () => {
  let module: SvelteModule;

  beforeEach(() => {
    module = new SvelteModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('svelte');
      expect(metadata.displayName).toBe('Svelte');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://svelte.dev');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('frontend');
      expect(metadata.keywords).toContain('compiler');
      expect(metadata.supportedVersions).toContain('3.x');
      expect(metadata.supportedVersions).toContain('4.x');
      expect(metadata.supportedVersions).toContain('5.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('svelte');
      expect(module.type).toBe('framework');
      expect(module.priorityType).toBe('framework');
    });
  });

  describe('detect', () => {
    test('should detect Svelte project with dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'svelte.config.js'],
        files: ['src/App.svelte', 'src/lib/Button.svelte'],
        packageJson: {
          dependencies: {
            svelte: '^4.2.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('svelte in package.json dependencies');
      expect(result.evidence).toContain('svelte.config.js found');
    });

    test('should detect Svelte project with Vite plugin', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'vite.config.js'],
        files: ['src/App.svelte', 'src/components/Header.svelte'],
        packageJson: {
          devDependencies: {
            svelte: '^4.0.0',
            '@sveltejs/vite-plugin-svelte': '^2.4.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('svelte in package.json devDependencies');
      expect(result.evidence).toContain('Vite with Svelte plugin detected');
    });

    test('should detect Svelte project with Rollup plugin', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'rollup.config.js'],
        files: ['src/main.js', 'src/App.svelte'],
        packageJson: {
          devDependencies: {
            svelte: '^3.59.0',
            'rollup-plugin-svelte': '^7.1.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.6);
      expect(result.evidence).toContain('Rollup with Svelte plugin detected');
    });

    test('should not detect non-Svelte project', async () => {
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
  });

  describe('detectVersion', () => {
    test('should detect Svelte version from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            svelte: '^4.2.8'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('4');
    });

    test('should handle Svelte 3.x version detection', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          devDependencies: {
            svelte: '^3.59.2'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('3');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('svelte/guidelines/framework.md');
      expect(paths[0].priority).toBe('framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('4.0.0');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('svelte/guidelines/framework.md');
      expect(paths[1].path).toBe('svelte/guidelines/4/features.md');
      expect(paths[1].version).toBe('4');
    });

    test('should extract major version correctly', async () => {
      const paths = await module.getGuidelinePaths('v3.59.2');

      expect(paths[1].path).toBe('svelte/guidelines/3/features.md');
      expect(paths[1].version).toBe('3');
    });
  });

  describe('generateCommands', () => {
    test('should generate correct npm commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Svelte'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json'],
          dependencies: ['svelte']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('npm run dev');
      expect(commands.build).toContain('npm run build');
      expect(commands.test).toContain('npm run test');
      expect(commands.lint).toContain('npm run lint');
      expect(commands.lint).toContain('npm run lint:fix');
      expect(commands.install).toContain('npm install');
    });

    test('should generate correct yarn commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Svelte'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['yarn'],
          configFiles: ['package.json', 'yarn.lock'],
          dependencies: ['svelte']
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
          frameworks: ['Svelte'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'vitest.config.ts'],
          dependencies: ['svelte']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:vitest');
    });

    test('should add svelte-check when TypeScript config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Svelte'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'tsconfig.json'],
          dependencies: ['svelte']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.lint).toContain('npm run check');
    });

    test('should prefer bun over other package managers', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Svelte'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['bun', 'npm', 'yarn'],
          configFiles: ['package.json'],
          dependencies: ['svelte']
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

      expect(extensions).toContain('.svelte');
      expect(extensions).toContain('.js');
      expect(extensions).toContain('.ts');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Svelte config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('svelte.config.js');
      expect(configFiles).toContain('vite.config.js');
      expect(configFiles).toContain('vite.config.ts');
      expect(configFiles).toContain('rollup.config.js');
      expect(configFiles).toContain('package.json');
    });
  });
});