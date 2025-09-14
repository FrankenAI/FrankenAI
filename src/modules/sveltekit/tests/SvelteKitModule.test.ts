import { describe, test, expect, beforeEach } from 'bun:test';
import { SvelteKitModule } from '../SvelteKitModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('SvelteKitModule', () => {
  let module: SvelteKitModule;

  beforeEach(() => {
    module = new SvelteKitModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('sveltekit');
      expect(metadata.displayName).toBe('SvelteKit');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://kit.svelte.dev');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('svelte');
      expect(metadata.keywords).toContain('fullstack');
      expect(metadata.keywords).toContain('ssr');
      expect(metadata.supportedVersions).toContain('1.x');
      expect(metadata.supportedVersions).toContain('2.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('sveltekit');
      expect(module.type).toBe('framework');
      expect(module.priorityType).toBe('meta-framework');
    });
  });

  describe('detect', () => {
    test('should detect SvelteKit project with @sveltejs/kit dependency', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'svelte.config.js'],
        files: ['src/routes/+page.svelte', 'src/app.html'],
        packageJson: {
          devDependencies: {
            '@sveltejs/kit': '^2.0.0',
            '@sveltejs/adapter-auto': '^3.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('@sveltejs/kit in package.json devDependencies');
      expect(result.evidence).toContain('SvelteKit adapter detected: @sveltejs/adapter-auto');
    });

    test('should detect SvelteKit project with routes directory structure', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'svelte.config.js'],
        files: [
          'src/routes/+page.svelte',
          'src/routes/+layout.svelte',
          'src/routes/about/+page.svelte',
          'src/app.html'
        ],
        packageJson: {
          dependencies: {
            '@sveltejs/kit': '^1.30.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('@sveltejs/kit in package.json dependencies');
    });

    test('should detect SvelteKit project with different adapters', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'svelte.config.js'],
        files: ['src/routes/+page.svelte'],
        packageJson: {
          devDependencies: {
            '@sveltejs/kit': '^2.5.0',
            '@sveltejs/adapter-static': '^3.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('SvelteKit adapter detected: @sveltejs/adapter-static');
    });

    test('should not detect regular Svelte project as SvelteKit', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'vite.config.js'],
        files: ['src/App.svelte', 'src/main.js'],
        packageJson: {
          dependencies: {
            svelte: '^4.0.0'
          },
          devDependencies: {
            '@sveltejs/vite-plugin-svelte': '^2.4.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.3);
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
      expect(result.confidence).toBe(0);
    });
  });

  describe('detectVersion', () => {
    test('should detect SvelteKit version from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          devDependencies: {
            '@sveltejs/kit': '^2.5.7'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('2');
    });

    test('should handle SvelteKit 1.x version detection', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          devDependencies: {
            '@sveltejs/kit': '^1.30.4'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('1');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('sveltekit/guidelines/framework.md');
      expect(paths[0].priority).toBe('meta-framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('2.0.0');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('sveltekit/guidelines/framework.md');
      expect(paths[1].path).toBe('sveltekit/guidelines/2/features.md');
      expect(paths[1].version).toBe('2');
    });

    test('should extract major version correctly', async () => {
      const paths = await module.getGuidelinePaths('v1.30.4');

      expect(paths[1].path).toBe('sveltekit/guidelines/1/features.md');
      expect(paths[1].version).toBe('1');
    });
  });

  describe('generateCommands', () => {
    test('should generate correct npm commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['SvelteKit'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json'],
          dependencies: ['@sveltejs/kit']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('npm run dev');
      expect(commands.build).toContain('npm run build');
      expect(commands.build).toContain('npm run preview');
      expect(commands.test).toContain('npm run test');
      expect(commands.lint).toContain('npm run lint');
      expect(commands.lint).toContain('npm run lint:fix');
      expect(commands.install).toContain('npm install');
    });

    test('should generate correct yarn commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['SvelteKit'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['yarn'],
          configFiles: ['package.json', 'yarn.lock'],
          dependencies: ['@sveltejs/kit']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('yarn run dev');
      expect(commands.build).toContain('yarn run build');
      expect(commands.build).toContain('yarn run preview');
      expect(commands.install).toContain('yarn install');
    });

    test('should add playwright commands when playwright config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['SvelteKit'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'playwright.config.ts'],
          dependencies: ['@sveltejs/kit']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:playwright');
    });

    test('should add vitest commands when vitest config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['SvelteKit'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'vitest.config.ts'],
          dependencies: ['@sveltejs/kit']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:vitest');
    });

    test('should add svelte-check when TypeScript config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['SvelteKit'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'tsconfig.json'],
          dependencies: ['@sveltejs/kit']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.lint).toContain('npm run check');
    });

    test('should prefer bun over other package managers', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['SvelteKit'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['bun', 'npm', 'yarn'],
          configFiles: ['package.json'],
          dependencies: ['@sveltejs/kit']
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
    test('should return SvelteKit config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('svelte.config.js');
      expect(configFiles).toContain('vite.config.js');
      expect(configFiles).toContain('vite.config.ts');
      expect(configFiles).toContain('package.json');
    });
  });
});