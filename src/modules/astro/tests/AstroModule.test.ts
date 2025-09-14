import { describe, test, expect, beforeEach } from 'bun:test';
import { AstroModule } from '../AstroModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('AstroModule', () => {
  let module: AstroModule;

  beforeEach(() => {
    module = new AstroModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('astro');
      expect(metadata.displayName).toBe('Astro');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://astro.build');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('static-site');
      expect(metadata.keywords).toContain('multi-framework');
      expect(metadata.keywords).toContain('islands');
      expect(metadata.supportedVersions).toContain('3.x');
      expect(metadata.supportedVersions).toContain('4.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('astro');
      expect(module.type).toBe('framework');
      expect(module.priorityType).toBe('meta-framework');
    });
  });

  describe('detect', () => {
    test('should detect Astro project with dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'astro.config.ts'],
        files: ['src/pages/index.astro', 'src/components/Header.astro'],
        packageJson: {
          dependencies: {
            astro: '^4.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('astro in package.json dependencies');
      expect(result.evidence).toContain('Astro config file: astro.config.ts');
    });

    test('should detect Astro project with integrations', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'astro.config.js'],
        files: [
          'src/pages/index.astro',
          'src/components/Button.jsx',
          'public/favicon.ico'
        ],
        packageJson: {
          devDependencies: {
            astro: '^3.6.0',
            '@astrojs/react': '^3.0.0',
            '@astrojs/tailwind': '^5.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('Astro integration detected: @astrojs/react');
      expect(result.evidence).toContain('Astro integration detected: @astrojs/tailwind');
      expect(result.evidence).toContain('Public directory found (Astro convention)');
    });

    test('should detect Astro project with directory structure', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [
          'src/pages/blog/post.astro',
          'src/components/Layout.astro',
          'src/layouts/BaseLayout.astro'
        ],
        packageJson: {
          devDependencies: {
            astro: '^4.2.0'
          },
          scripts: {
            dev: 'astro dev',
            build: 'astro build',
            preview: 'astro preview'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('Astro directory structure: src/pages');
      expect(result.evidence).toContain('Astro directory structure: src/components');
      expect(result.evidence).toContain('Astro directory structure: src/layouts');
      expect(result.evidence).toContain('Astro scripts in package.json');
    });

    test('should not detect non-Astro project', async () => {
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
    test('should detect Astro version from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            astro: '^4.2.1'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('4');
    });

    test('should handle Astro 3.x version detection', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          devDependencies: {
            astro: '^3.6.5'
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
      expect(paths[0].path).toBe('astro/guidelines/framework.md');
      expect(paths[0].priority).toBe('meta-framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('4.0.0');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('astro/guidelines/framework.md');
      expect(paths[1].path).toBe('astro/guidelines/4/features.md');
      expect(paths[1].version).toBe('4');
    });

    test('should extract major version correctly', async () => {
      const paths = await module.getGuidelinePaths('v3.6.5');

      expect(paths[1].path).toBe('astro/guidelines/3/features.md');
      expect(paths[1].version).toBe('3');
    });
  });

  describe('generateCommands', () => {
    test('should generate correct npm commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Astro'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json'],
          dependencies: ['astro']
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
          frameworks: ['Astro'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['yarn'],
          configFiles: ['package.json', 'yarn.lock'],
          dependencies: ['astro']
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
          frameworks: ['Astro'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'playwright.config.ts'],
          dependencies: ['astro']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:playwright');
    });

    test('should add vitest commands when vitest config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Astro'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'vitest.config.ts'],
          dependencies: ['astro']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:vitest');
    });

    test('should add check command when TypeScript config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Astro'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'tsconfig.json'],
          dependencies: ['astro']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.lint).toContain('npm run check');
    });

    test('should prefer bun over other package managers', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Astro'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['bun', 'npm', 'yarn'],
          configFiles: ['package.json'],
          dependencies: ['astro']
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

      expect(extensions).toContain('.astro');
      expect(extensions).toContain('.js');
      expect(extensions).toContain('.ts');
      expect(extensions).toContain('.jsx');
      expect(extensions).toContain('.tsx');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Astro config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('astro.config.js');
      expect(configFiles).toContain('astro.config.ts');
      expect(configFiles).toContain('astro.config.mjs');
      expect(configFiles).toContain('package.json');
      expect(configFiles).toContain('tailwind.config.js');
    });
  });
});