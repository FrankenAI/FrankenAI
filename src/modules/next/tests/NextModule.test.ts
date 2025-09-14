import { describe, test, expect, beforeEach } from 'bun:test';
import { NextModule } from '../NextModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('NextModule', () => {
  let module: NextModule;
  let mockContext: DetectionContext;

  beforeEach(() => {
    module = new NextModule();
    mockContext = {
      projectRoot: '/mock/project',
      files: [],
      packageManagers: ['npm']
    };
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('next');
      expect(metadata.displayName).toBe('Next.js');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://nextjs.org');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('react');
      expect(metadata.keywords).toContain('ssr');
      expect(metadata.supportedVersions).toContain('13.x');
      expect(metadata.supportedVersions).toContain('14.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('next');
      expect(module.type).toBe('framework');
      expect(module.priorityType).toBe('meta-framework');
    });
  });

  describe('detect', () => {
    test('should detect Next.js project with dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'next.config.js'],
        files: ['pages/_app.js', 'pages/index.js'],
        packageJson: {
          dependencies: {
            next: '^14.0.0',
            react: '^18.2.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.evidence).toContain('next in package.json dependencies');
    });

    test('should detect Next.js project with app directory structure', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'next.config.ts'],
        files: ['app/layout.tsx', 'app/page.tsx', 'public/favicon.ico'],
        packageJson: {
          dependencies: {
            next: '^14.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.evidence).toContain('Next.js config file: next.config.ts');
    });

    test('should not detect non-Next.js project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/index.js'],
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
    test('should detect Next.js version from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            next: '^14.2.5'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('14');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('next/guidelines/framework.md');
      expect(paths[0].priority).toBe('meta-framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('14.0.0');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('next/guidelines/framework.md');
      expect(paths[1].path).toBe('next/guidelines/14/features.md');
      expect(paths[1].version).toBe('14');
    });

    test('should extract major version correctly', async () => {
      const paths = await module.getGuidelinePaths('v13.4.19');

      expect(paths[1].path).toBe('next/guidelines/13/features.md');
      expect(paths[1].version).toBe('13');
    });
  });

  describe('generateCommands', () => {
    test('should generate correct npm commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Next.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json'],
          dependencies: ['next']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('npm run dev');
      expect(commands.dev).toContain('npm run start');
      expect(commands.build).toContain('npm run build');
      expect(commands.build).toContain('npm run export');
      expect(commands.test).toContain('npm run test');
      expect(commands.lint).toContain('npm run lint');
      expect(commands.lint).toContain('npm run lint:fix');
      expect(commands.install).toContain('npm install');
    });

    test('should generate correct yarn commands', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Next.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['yarn'],
          configFiles: ['package.json', 'yarn.lock'],
          dependencies: ['next']
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
          frameworks: ['Next.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'vitest.config.ts'],
          dependencies: ['next']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:vitest');
    });

    test('should add jest commands when jest config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Next.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'jest.config.js'],
          dependencies: ['next']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.test).toContain('npm run test:jest');
    });

    test('should prefer bun over other package managers', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Next.js'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['bun', 'npm', 'yarn'],
          configFiles: ['package.json'],
          dependencies: ['next']
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

      expect(extensions).toContain('.js');
      expect(extensions).toContain('.jsx');
      expect(extensions).toContain('.ts');
      expect(extensions).toContain('.tsx');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Next.js config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('next.config.js');
      expect(configFiles).toContain('next.config.ts');
      expect(configFiles).toContain('next.config.mjs');
      expect(configFiles).toContain('package.json');
      expect(configFiles).toContain('tailwind.config.js');
    });
  });
});