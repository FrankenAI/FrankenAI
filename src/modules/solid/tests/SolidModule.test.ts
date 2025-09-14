import { describe, test, expect, beforeEach } from 'bun:test';
import { SolidModule } from '../SolidModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('SolidModule', () => {
  let module: SolidModule;

  beforeEach(() => {
    module = new SolidModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('solid');
      expect(metadata.displayName).toBe('Solid.js');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://www.solidjs.com');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('reactive');
      expect(metadata.keywords).toContain('performance');
      expect(metadata.keywords).toContain('jsx');
      expect(metadata.supportedVersions).toContain('1.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('solid');
      expect(module.type).toBe('framework');
      expect(module.priorityType).toBe('framework');
    });
  });

  describe('detect', () => {
    test('should detect Solid.js project with dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'vite.config.ts'],
        files: ['src/App.tsx', 'src/components/Counter.tsx'],
        packageJson: {
          dependencies: {
            'solid-js': '^1.8.0'
          },
          devDependencies: {
            'vite-plugin-solid': '^0.2.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('solid-js in package.json dependencies');
      expect(result.evidence).toContain('Vite with Solid plugin detected');
    });

    test('should detect Solid.js project with SolidStart', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'app.config.ts'],
        files: ['src/routes/index.tsx', 'src/components/Nav.tsx'],
        packageJson: {
          dependencies: {
            'solid-js': '^1.8.0',
            'solid-start': '^0.4.0',
            '@solidjs/router': '^0.10.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('Solid build tool detected: solid-start');
      expect(result.evidence).toContain('Solid build tool detected: @solidjs/router');
      expect(result.evidence).toContain('Solid Start config detected');
    });

    test('should detect Solid.js project with JSX files', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'vite.config.js'],
        files: [
          'src/App.jsx',
          'src/components/Button.jsx',
          'src/components/Modal.tsx'
        ],
        packageJson: {
          devDependencies: {
            'solid-js': '^1.7.0',
            'vite-plugin-solid': '^0.2.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('JSX/TSX files found: 3');
      expect(result.evidence).toContain('Solid directory structure: src/components');
    });

    test('should not detect React project as Solid', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/App.jsx', 'src/components/Button.jsx'],
        packageJson: {
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.3);
    });

    test('should not detect non-Solid project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/index.js', 'src/utils.js'],
        packageJson: {
          dependencies: {
            express: '^4.18.0'
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
    test('should detect Solid.js version from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            'solid-js': '^1.8.7'
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
      expect(paths[0].path).toBe('solid/guidelines/framework.md');
      expect(paths[0].priority).toBe('framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('1.8.0');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('solid/guidelines/framework.md');
      expect(paths[1].path).toBe('solid/guidelines/1/features.md');
      expect(paths[1].version).toBe('1');
    });
  });

  describe('generateCommands', () => {
    test('should generate correct npm commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Solid.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json'],
          dependencies: ['solid-js']
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
          frameworks: ['Solid.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['yarn'],
          configFiles: ['package.json', 'yarn.lock'],
          dependencies: ['solid-js']
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
          frameworks: ['Solid.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'vitest.config.ts'],
          dependencies: ['solid-js']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:vitest');
    });

    test('should add jest commands when jest config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Solid.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'jest.config.js'],
          dependencies: ['solid-js']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:jest');
    });

    test('should add typecheck command when TypeScript config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Solid.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'tsconfig.json'],
          dependencies: ['solid-js']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.lint).toContain('npm run typecheck');
    });

    test('should prefer bun over other package managers', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Solid.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['bun', 'npm', 'yarn'],
          configFiles: ['package.json'],
          dependencies: ['solid-js']
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

      expect(extensions).toContain('.jsx');
      expect(extensions).toContain('.tsx');
      expect(extensions).toContain('.js');
      expect(extensions).toContain('.ts');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Solid.js config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('vite.config.js');
      expect(configFiles).toContain('vite.config.ts');
      expect(configFiles).toContain('app.config.js');
      expect(configFiles).toContain('app.config.ts');
      expect(configFiles).toContain('package.json');
      expect(configFiles).toContain('tsconfig.json');
    });
  });
});