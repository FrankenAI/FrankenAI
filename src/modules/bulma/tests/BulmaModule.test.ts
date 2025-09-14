import { describe, test, expect, beforeEach } from 'bun:test';
import { BulmaModule } from '../BulmaModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('BulmaModule', () => {
  let module: BulmaModule;

  beforeEach(() => {
    module = new BulmaModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('bulma');
      expect(metadata.displayName).toBe('Bulma');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://bulma.io');
      expect(metadata.keywords).toContain('css');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('flexbox');
      expect(metadata.keywords).toContain('modern');
      expect(metadata.supportedVersions).toContain('0.9.x');
      expect(metadata.supportedVersions).toContain('1.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('bulma');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('css-framework');
    });
  });

  describe('detect', () => {
    test('should detect Bulma project with dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/styles/app.scss', 'src/components/Button.tsx', 'index.html'],
        packageJson: {
          dependencies: {
            bulma: '^0.9.4',
            '@bulma/extensions': '^2.2.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('bulma in package.json dependencies');
      expect(result.evidence).toContain('Bulma extensions detected');
    });

    test('should detect Bulma project with React components', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/App.jsx', 'src/components/Hero.jsx'],
        packageJson: {
          dependencies: {
            react: '^18.0.0',
            'react-bulma-components': '^4.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('React Bulma components detected');
    });

    test('should detect Bulma project with Vue Buefy', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/App.vue', 'src/components/Navbar.vue'],
        packageJson: {
          dependencies: {
            vue: '^3.0.0',
            buefy: '^0.9.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('Vue Bulma components detected');
    });

    test('should detect Bulma project with Angular components', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'angular.json'],
        files: ['src/app/app.component.ts', 'src/app/app.component.html'],
        packageJson: {
          dependencies: {
            '@angular/core': '^16.0.0',
            'ngx-bulma': '^12.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('Angular Bulma components detected');
    });

    test('should detect Bulma with SCSS/Sass customization', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [
          'src/scss/custom.scss',
          'src/sass/variables.sass',
          'src/styles/bulma-custom.scss'
        ],
        packageJson: {
          devDependencies: {
            bulma: '^1.0.0',
            sass: '^1.60.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('SCSS/Sass files found (commonly used with Bulma customization)');
    });

    test('should detect Bulma with community extensions', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/styles/main.css'],
        packageJson: {
          devDependencies: {
            bulma: '^0.9.4',
            'bulma-extensions': '^6.2.7'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('Bulma community extensions detected');
    });

    test('should not detect Bootstrap project as Bulma', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/App.jsx', 'src/styles/globals.css'],
        packageJson: {
          dependencies: {
            bootstrap: '^5.3.0',
            '@popperjs/core': '^2.11.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(false);
      expect(result.confidence).toBeLessThan(0.3);
    });

    test('should not detect non-CSS framework project', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/index.js', 'src/utils.js'],
        packageJson: {
          dependencies: {
            express: '^4.18.0',
            lodash: '^4.17.0'
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
    test('should detect Bulma version 1.x from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            bulma: '^1.0.0'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('1');
    });

    test('should handle Bulma 0.9.x version detection', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            bulma: '^0.9.4'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('0.9');
    });
  });

  describe('getGuidelinePaths', () => {
    test('should return correct guideline paths without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(1);
      expect(paths[0].path).toBe('bulma/guidelines/css-framework.md');
      expect(paths[0].priority).toBe('css-framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines for 1.x', async () => {
      const paths = await module.getGuidelinePaths('1.0.0');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('bulma/guidelines/css-framework.md');
      expect(paths[1].path).toBe('bulma/guidelines/1/features.md');
      expect(paths[1].version).toBe('1');
    });

    test('should return version-specific guidelines for 0.9.x', async () => {
      const paths = await module.getGuidelinePaths('0.9.4');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('bulma/guidelines/css-framework.md');
      expect(paths[1].path).toBe('bulma/guidelines/0.9/features.md');
      expect(paths[1].version).toBe('0.9');
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
          configFiles: ['package.json'],
          dependencies: ['bulma']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('npm run dev');
      expect(commands.dev).toContain('npm run serve');
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
          configFiles: ['package.json', 'yarn.lock'],
          dependencies: ['bulma']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('yarn run dev');
      expect(commands.build).toContain('yarn run build');
      expect(commands.install).toContain('yarn install');
    });

    test('should add webpack commands when webpack config detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: [],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'webpack.config.js'],
          dependencies: ['bulma']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.build).toContain('npx webpack --mode production');
    });

    test('should add gulp commands when gulpfile detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: [],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'gulpfile.js'],
          dependencies: ['bulma']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.dev).toContain('npx gulp watch');
      expect(commands.build).toContain('npx gulp build');
    });

    test('should add SCSS compilation when SCSS detected', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['React'],
          languages: ['JavaScript', 'SCSS'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json'],
          dependencies: ['bulma']
        }
      };

      const commands = await module.generateCommands(moduleContext);

      expect(commands.build).toContain('npx sass src/scss:dist/css');
    });

    test('should prefer bun over other package managers', async () => {
      const moduleContext: ModuleContext = {
        detectedStack: {
          frameworks: ['Svelte'],
          languages: ['TypeScript'],
          runtime: 'node',
          packageManagers: ['bun', 'npm', 'yarn'],
          configFiles: ['package.json'],
          dependencies: ['bulma']
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

      expect(extensions).toContain('.css');
      expect(extensions).toContain('.scss');
      expect(extensions).toContain('.sass');
      expect(extensions).toContain('.html');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Bulma config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('package.json');
      expect(configFiles).toContain('webpack.config.js');
      expect(configFiles).toContain('webpack.config.ts');
      expect(configFiles).toContain('gulpfile.js');
      expect(configFiles).toContain('gulpfile.ts');
      expect(configFiles).toContain('sass.config.js');
      expect(configFiles).toContain('bulma.config.js');
    });
  });
});