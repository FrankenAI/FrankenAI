import { describe, test, expect, beforeEach } from 'bun:test';
import { BootstrapModule } from '../BootstrapModule.js';
import type { DetectionContext, ModuleContext } from '../../../core/types/Module.js';

describe('BootstrapModule', () => {
  let module: BootstrapModule;

  beforeEach(() => {
    module = new BootstrapModule();
  });

  describe('getMetadata', () => {
    test('should return correct metadata', () => {
      const metadata = module.getMetadata();

      expect(metadata.name).toBe('bootstrap');
      expect(metadata.displayName).toBe('Bootstrap');
      expect(metadata.author).toBe('FrankenAI');
      expect(metadata.homepage).toBe('https://getbootstrap.com');
      expect(metadata.keywords).toContain('css');
      expect(metadata.keywords).toContain('framework');
      expect(metadata.keywords).toContain('components');
      expect(metadata.keywords).toContain('responsive');
      expect(metadata.supportedVersions).toContain('4.x');
      expect(metadata.supportedVersions).toContain('5.x');
    });
  });

  describe('module properties', () => {
    test('should have correct module properties', () => {
      expect(module.id).toBe('bootstrap');
      expect(module.type).toBe('library');
      expect(module.priorityType).toBe('css-framework');
    });
  });

  describe('detect', () => {
    test('should detect Bootstrap project with dependencies', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/styles/app.css', 'src/components/Button.tsx', 'index.html'],
        packageJson: {
          dependencies: {
            bootstrap: '^5.3.0',
            '@popperjs/core': '^2.11.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.evidence).toContain('bootstrap in package.json dependencies');
      expect(result.evidence).toContain('Popper.js (Bootstrap dependency) detected');
    });

    test('should detect Bootstrap project with React Bootstrap', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/App.jsx', 'src/components/Modal.jsx'],
        packageJson: {
          dependencies: {
            react: '^18.0.0',
            'react-bootstrap': '^2.8.0',
            'bootstrap-icons': '^1.10.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('React Bootstrap detected');
      expect(result.evidence).toContain('Bootstrap Icons detected');
    });

    test('should detect Bootstrap project with Vue Bootstrap', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/App.vue', 'src/components/Navbar.vue'],
        packageJson: {
          dependencies: {
            vue: '^3.0.0',
            'bootstrap-vue-next': '^0.14.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('Vue Bootstrap detected');
    });

    test('should detect Bootstrap project with Angular ng-bootstrap', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'angular.json'],
        files: ['src/app/app.component.ts', 'src/app/app.component.html'],
        packageJson: {
          dependencies: {
            '@angular/core': '^16.0.0',
            '@ng-bootstrap/ng-bootstrap': '^15.0.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.2);
      expect(result.evidence).toContain('Angular Bootstrap (ng-bootstrap) detected');
    });

    test('should detect Bootstrap with SCSS customization', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [
          'src/scss/custom.scss',
          'src/scss/variables.scss',
          'src/styles/bootstrap.scss'
        ],
        packageJson: {
          devDependencies: {
            bootstrap: '^5.3.2',
            sass: '^1.60.0'
          }
        },
        composerJson: null
      };

      const result = await module.detect(context);

      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.evidence).toContain('SCSS files found (commonly used with Bootstrap customization)');
    });

    test('should not detect Tailwind CSS project as Bootstrap', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'tailwind.config.js'],
        files: ['src/App.jsx', 'src/styles/globals.css'],
        packageJson: {
          devDependencies: {
            tailwindcss: '^3.3.0',
            postcss: '^8.4.0'
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
    test('should detect Bootstrap version from package.json', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            bootstrap: '^5.3.2'
          }
        },
        composerJson: null
      };

      const version = await module.detectVersion(context);

      expect(version).toBe('5');
    });

    test('should handle Bootstrap 4.x version detection', async () => {
      const context: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            bootstrap: '^4.6.2'
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
      expect(paths[0].path).toBe('bootstrap/guidelines/css-framework.md');
      expect(paths[0].priority).toBe('css-framework');
      expect(paths[0].category).toBe('framework');
    });

    test('should return version-specific guidelines when version provided', async () => {
      const paths = await module.getGuidelinePaths('5.3.2');

      expect(paths).toHaveLength(2);
      expect(paths[0].path).toBe('bootstrap/guidelines/css-framework.md');
      expect(paths[1].path).toBe('bootstrap/guidelines/5/features.md');
      expect(paths[1].version).toBe('5');
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
          dependencies: ['bootstrap']
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
          dependencies: ['bootstrap']
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
          dependencies: ['bootstrap']
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
          dependencies: ['bootstrap']
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
          dependencies: ['bootstrap']
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
          dependencies: ['bootstrap']
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
      expect(extensions).toContain('.less');
      expect(extensions).toContain('.html');
    });
  });

  describe('getConfigFiles', () => {
    test('should return Bootstrap config files', () => {
      const configFiles = module.getConfigFiles();

      expect(configFiles).toContain('package.json');
      expect(configFiles).toContain('webpack.config.js');
      expect(configFiles).toContain('webpack.config.ts');
      expect(configFiles).toContain('gulpfile.js');
      expect(configFiles).toContain('gulpfile.ts');
      expect(configFiles).toContain('sass.config.js');
      expect(configFiles).toContain('bootstrap.config.js');
    });
  });
});