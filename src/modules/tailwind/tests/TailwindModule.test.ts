import { describe, test, expect, beforeEach } from 'bun:test';
import { TailwindModule } from '../TailwindModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('TailwindModule', () => {
  let module: TailwindModule;

  beforeEach(() => {
    module = new TailwindModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('tailwind');
      expect(metadata.displayName).toBe('Tailwind CSS');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://tailwindcss.com');
      expect(metadata.keywords).toContain('css');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('utility-first');
      expect(metadata.keywords).toContain('styling');
      expect(metadata.supportedVersions).toContain('3.x');
      expect(metadata.supportedVersions).toContain('4.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('tailwind');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('css-framework');
    });
  });

  describe('detect', () => {
    test('should detect Tailwind CSS project with dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'tailwind.config.js'],
        files: ['src/styles/globals.css', 'src/components/Button.tsx'],
        packageJson: {
          devDependencies: {
            tailwindcss: '^3.3.0',
            '@tailwindcss/typography': '^0.5.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('tailwindcss in package.json dependencies');
      expect(result.evidence).toContain('Tailwind config file found');
      expect(result.evidence).toContain('Tailwind typography plugin detected');
    });

    test('should detect Tailwind CSS project with config file only', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'tailwind.config.ts'],
        files: ['src/styles/app.css', 'src/pages/index.vue'],
        packageJson: {
          devDependencies: {
            vue: '^3.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.evidence).toContain('Tailwind config file found');
    });

    test('should detect Tailwind CSS with Headless UI', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'tailwind.config.js'],
        files: ['src/App.tsx', 'src/components/Dialog.tsx'],
        packageJson: {
          dependencies: {
            react: '^18.0.0',
            tailwindcss: '^3.4.0',
            '@headlessui/react': '^1.7.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('Headless UI (Tailwind companion) detected');
    });

    test('should detect Tailwind CSS with PostCSS config', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'tailwind.config.js', 'postcss.config.js'],
        files: ['src/index.css'],
        packageJson: {
          devDependencies: {
            tailwindcss: '^3.3.5',
            postcss: '^8.4.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('PostCSS config found (commonly used with Tailwind)');
    });

    test('should not detect non-Tailwind CSS project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/index.js', 'src/styles/main.scss'],
        packageJson: {
          dependencies: {
            bootstrap: '^5.3.0',
            sass: '^1.60.0'
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
    test('should detect Tailwind CSS version from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          devDependencies: {
            tailwindcss: '^3.4.1'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('3');
    });

    test('should handle Tailwind CSS 4.x version detection', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          devDependencies: {
            tailwindcss: '^4.0.0-beta.1'
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
      expect(paths[0].path).toBe('tailwind/guidelines/css-framework.md');
      expect(paths[0].priority).toBe('css-framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('3.4.1');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('tailwind/guidelines/css-framework.md');
      expect(paths[1].path).toBe('tailwind/guidelines/3/features.md');
      expect(paths[1].version).toBe('3');
    });
  });

  describe('generateCommands', () => {
    test('should generate correct npm commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['React'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'tailwind.config.js'],
          dependencies: ['tailwindcss']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('npm run dev');
      expect(commands.build).toContain('npx tailwindcss build');
      expect(commands.build).toContain('npm run build');
      expect(commands.test).toContain('npm run test');
      expect(commands.lint).toContain('npm run lint');
      expect(commands.install).toContain('npm install');
    });

    test('should generate correct yarn commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Vue.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['yarn'],
          configFiles: ['package.json', 'tailwind.config.ts'],
          dependencies: ['tailwindcss']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('yarn run dev');
      expect(commands.build).toContain('yarn tailwindcss build');
      expect(commands.build).toContain('yarn run build');
      expect(commands.install).toContain('yarn install');
    });

    test('should add PostCSS commands when postcss config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['React'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'tailwind.config.js', 'postcss.config.js'],
          dependencies: ['tailwindcss']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.build).toContain('npx postcss src/styles.css -o dist/styles.css');
    });

    test('should prefer bun over other package managers', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Svelte'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['bun', 'npm', 'yarn'],
          configFiles: ['package.json', 'tailwind.config.ts'],
          dependencies: ['tailwindcss']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('bun run dev');
      expect(commands.build).toContain('bun tailwindcss build');
      expect(commands.install).toContain('bun install');
    });
  });

  describe('getSupportedExtensions', () => {
    test('should return supported file extensions', () => {
      const extensions = module.getSupportedExtensions();

      expect(extensions).toContain('.css');
      expect(extensions).toContain('.scss');
      expect(extensions).toContain('.sass');
      expect(extensions).toContain('.less');
      expect(extensions).toContain('.pcss');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Tailwind CSS config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('tailwind.config.js');
      expect(configFiles).toContain('tailwind.config.ts');
      expect(configFiles).toContain('tailwind.config.mjs');
      expect(configFiles).toContain('tailwind.config.cjs');
      expect(configFiles).toContain('postcss.config.js');
      expect(configFiles).toContain('postcss.config.ts');
      expect(configFiles).toContain('package.json');
    });
  });
});