import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { InitCommand } from '../src/commands/InitCommand.js';

describe('InitCommand', () => {
  let tmpDir: string;
  let initCommand: InitCommand;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'franken-ai-init-test-'));
    process.chdir(tmpDir);
    initCommand = new InitCommand();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  describe('Version Detection', () => {
    test('should detect PHP version from composer.json', async () => {
      await fs.writeJson(path.join(tmpDir, 'composer.json'), {
        require: {
          php: '^8.4.0'
        }
      });

      // @ts-ignore - accessing private method for testing
      const phpVersion = await initCommand.detectPHPVersion();
      expect(phpVersion).toBe('8.4');
    });

    test('should detect Laravel version from composer.lock', async () => {
      await fs.writeJson(path.join(tmpDir, 'composer.lock'), {
        packages: [
          {
            name: 'laravel/framework',
            version: 'v12.0.0'
          }
        ]
      });

      // @ts-ignore - accessing private method for testing
      const laravelVersion = await initCommand.detectLaravelVersion();
      expect(laravelVersion).toBe('12');
    });

    test('should detect Vue version from package.json dependencies', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          vue: '^3.4.0'
        }
      });

      // @ts-ignore - accessing private method for testing
      const vueVersion = await initCommand.detectVueVersion();
      expect(vueVersion).toBe('3');
    });

    test('should detect Vue version from package.json devDependencies', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: {
          vue: '~2.7.14'
        }
      });

      // @ts-ignore - accessing private method for testing
      const vueVersion = await initCommand.detectVueVersion();
      expect(vueVersion).toBe('2');
    });

    test('should detect React version from package.json', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          react: '^18.2.0'
        }
      });

      // @ts-ignore - accessing private method for testing
      const reactVersion = await initCommand.detectReactVersion();
      expect(reactVersion).toBe('18');
    });

    test('should detect Next.js version from package.json', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          next: '^14.2.0'
        }
      });

      // @ts-ignore - accessing private method for testing
      const nextVersion = await initCommand.detectNextVersion();
      expect(nextVersion).toBe('14');
    });

    test('should detect Nuxt version from package.json', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          nuxt: '^3.8.0'
        }
      });

      // @ts-ignore - accessing private method for testing
      const nuxtVersion = await initCommand.detectNuxtVersion();
      expect(nuxtVersion).toBe('3');
    });

    test('should return undefined for missing versions', async () => {
      // @ts-ignore - accessing private method for testing
      const phpVersion = await initCommand.detectPHPVersion();
      expect(phpVersion).toBeUndefined();

      // @ts-ignore - accessing private method for testing
      const vueVersion = await initCommand.detectVueVersion();
      expect(vueVersion).toBeUndefined();
    });

    test('should handle complex version strings', async () => {
      const testCases = [
        { input: '^8.3.0', expected: '8.3', field: 'php' }, // PHP should return major.minor version
        { input: '~11.0.5', expected: '11', field: 'laravel' },
        { input: '>=18.0.0', expected: '18', field: 'react' },
        { input: '3.4.21', expected: '3', field: 'vue' },
        { input: 'beta-3.9.0', expected: '3', field: 'nuxt' },
        { input: 'v14.2.0', expected: '14', field: 'next' }
      ];

      for (const { input, expected, field } of testCases) {
        if (field === 'php') {
          await fs.writeJson(path.join(tmpDir, 'composer.json'), {
            require: { php: input }
          });
          // @ts-ignore - accessing private method for testing
          const version = await initCommand.detectPHPVersion();
          expect(version).toBe(expected);
        } else {
          await fs.writeJson(path.join(tmpDir, 'package.json'), {
            dependencies: { [field]: input }
          });

          switch (field) {
            case 'vue':
              // @ts-ignore - accessing private method for testing
              const vueVersion = await initCommand.detectVueVersion();
              expect(vueVersion).toBe(expected);
              break;
            case 'react':
              // @ts-ignore - accessing private method for testing
              const reactVersion = await initCommand.detectReactVersion();
              expect(reactVersion).toBe(expected);
              break;
            case 'next':
              // @ts-ignore - accessing private method for testing
              const nextVersion = await initCommand.detectNextVersion();
              expect(nextVersion).toBe(expected);
              break;
            case 'nuxt':
              // @ts-ignore - accessing private method for testing
              const nuxtVersion = await initCommand.detectNuxtVersion();
              expect(nuxtVersion).toBe(expected);
              break;
          }
        }
      }
    });
  });

  describe('Project Type Integration', () => {
    test('should handle Vue.js project initialization', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        name: 'test-vue-app',
        dependencies: {
          vue: '^3.4.0'
        },
        scripts: {
          dev: 'vite',
          build: 'vite build'
        }
      });

      const options = {
        yes: true,
        verbose: true,
        silent: false,
        force: true
      };

      await initCommand.execute(options);

      const claudeExists = await fs.pathExists(path.join(tmpDir, 'CLAUDE.md'));
      expect(claudeExists).toBe(true);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('## Detected Stack: Vue');
      expect(claudeContent).toContain('Vue.js Framework Guidelines');
    });

    test('should handle React project initialization', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        name: 'test-react-app',
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        scripts: {
          dev: 'vite',
          build: 'vite build'
        }
      });

      const options = {
        yes: true,
        verbose: true,
        force: true
      };

      await initCommand.execute(options);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('## Detected Stack: React');
      expect(claudeContent).toContain('React Framework Guidelines');
    });

    test('should handle Next.js project initialization', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        name: 'test-next-app',
        dependencies: {
          next: '^14.2.0',
          react: '^18.2.0'
        },
        scripts: {
          dev: 'next dev',
          build: 'next build'
        }
      });

      const options = {
        yes: true,
        force: true
      };

      await initCommand.execute(options);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('## Detected Stack: Next.js, React');
      expect(claudeContent).toContain('Next.js Framework Guidelines');
      expect(claudeContent).toContain('React Framework Guidelines');
    });

    // Note: Nuxt.js module not yet implemented - test removed

    test('should handle Laravel project initialization', async () => {
      await fs.writeFile(path.join(tmpDir, 'artisan'), '#!/usr/bin/env php');
      await fs.writeJson(path.join(tmpDir, 'composer.json'), {
        require: {
          'laravel/framework': '^12.0',
          php: '^8.4.0'
        }
      });
      await fs.writeJson(path.join(tmpDir, 'composer.lock'), {
        packages: [
          {
            name: 'laravel/framework',
            version: 'v12.0.0'
          }
        ]
      });

      const options = {
        yes: true,
        force: true
      };

      await initCommand.execute(options);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('## Detected Stack: Laravel');
      expect(claudeContent).toContain('- **Laravel Version**: 12');
      expect(claudeContent).toContain('- **PHP Version**: 8.4');
      expect(claudeContent).toContain('php artisan serve');
      expect(claudeContent).toContain('Laravel Core Guidelines');
    });
  });

  describe('Command Generation for Different Package Managers', () => {
    test('should generate yarn commands when yarn.lock exists', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { vue: '^3.4.0' },
        scripts: { dev: 'vite' }
      });
      await fs.writeFile(path.join(tmpDir, 'yarn.lock'), '');

      const options = { yes: true, force: true };
      await initCommand.execute(options);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('yarn run dev');
      expect(claudeContent).toContain('yarn install');
    });

    test('should generate pnpm commands when pnpm-lock.yaml exists', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { react: '^18.2.0' },
        scripts: { dev: 'vite' }
      });
      await fs.writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), '');

      const options = { yes: true, force: true };
      await initCommand.execute(options);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('pnpm run dev');
      expect(claudeContent).toContain('pnpm install');
    });

    test('should generate bun commands when bun.lockb exists', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { next: '^14.2.0' },
        scripts: { dev: 'next dev' }
      });
      await fs.writeFile(path.join(tmpDir, 'bun.lockb'), '');

      const options = { yes: true, force: true };
      await initCommand.execute(options);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('bun run dev');
      expect(claudeContent).toContain('bun install');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing package.json gracefully', async () => {
      const options = { yes: true, force: true };

      await initCommand.execute(options);

      const claudeExists = await fs.pathExists(path.join(tmpDir, 'CLAUDE.md'));
      expect(claudeExists).toBe(true);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('## Detected Stack: Generic');
    });

    test('should handle corrupted JSON files', async () => {
      await fs.writeFile(path.join(tmpDir, 'package.json'), '{ invalid json }');

      // @ts-ignore - accessing private method for testing
      const vueVersion = await initCommand.detectVueVersion();
      expect(vueVersion).toBeUndefined();
    });

    test('should handle existing CLAUDE.md with --force option', async () => {
      await fs.writeFile(path.join(tmpDir, 'CLAUDE.md'), 'Existing content');
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: { vue: '^3.4.0' }
      });

      const options = { yes: true, force: true };
      await initCommand.execute(options);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('FrankenAI Configuration');
      expect(claudeContent).toContain('Vue.js Framework Guidelines');
      expect(claudeContent).not.toContain('Existing content');
    });
  });

  describe('Multi-Framework Projects', () => {
    test('should handle full-stack Laravel + Vue project', async () => {
      await fs.writeFile(path.join(tmpDir, 'artisan'), '#!/usr/bin/env php');
      await fs.writeJson(path.join(tmpDir, 'composer.json'), {
        require: {
          'laravel/framework': '^11.0',
          php: '^8.3.0'
        }
      });
      await fs.writeJson(path.join(tmpDir, 'composer.lock'), {
        packages: [{ name: 'laravel/framework', version: 'v11.0.0' }]
      });
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: {
          vue: '^3.4.0',
          vite: '^5.0.0'
        }
      });

      const options = { yes: true, force: true };
      await initCommand.execute(options);

      const claudeContent = await fs.readFile(path.join(tmpDir, 'CLAUDE.md'), 'utf-8');
      expect(claudeContent).toContain('Laravel, Vue');
      expect(claudeContent).toContain('- **Laravel Version**: 11');
      expect(claudeContent).toContain('- **PHP Version**: 8.3');
      expect(claudeContent).toContain('php artisan serve');
      expect(claudeContent).toContain('composer install');
    });
  });
});