import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { StackDetector } from '../src/core/StackDetector.js';

describe('StackDetector', () => {
  let tmpDir: string;
  let detector: StackDetector;

  beforeEach(async () => {
    // Create temporary directory for test projects
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'franken-ai-test-'));
    detector = new StackDetector(tmpDir);
  });

  afterEach(async () => {
    // Cleanup temporary directory
    await fs.remove(tmpDir);
  });

  describe('Vue.js Detection', () => {
    test('should detect Vue.js from dependencies', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          vue: '^3.4.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Vue');
      expect(stack.languages).toContain('JavaScript');
      expect(stack.runtime).toBe('node');
    });

    test('should detect Vue.js from devDependencies', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: {
          vue: '^3.4.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Vue');
    });

    test('should detect Vue.js from vue.config.js', async () => {
      await fs.writeFile(path.join(tmpDir, 'vue.config.js'), 'module.exports = {};');
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        scripts: { dev: 'vue-cli-service serve' }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Vue');
    });

    test('should detect Vue.js with TypeScript', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          vue: '^3.4.0'
        },
        devDependencies: {
          typescript: '^5.0.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Vue');
      expect(stack.languages).toContain('JavaScript');
      expect(stack.languages).toContain('TypeScript');
    });
  });

  describe('React Detection', () => {
    test('should detect React from dependencies', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('React');
      expect(stack.languages).toContain('JavaScript');
      expect(stack.runtime).toBe('node');
    });

    test('should detect React with TypeScript', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          react: '^18.2.0'
        },
        devDependencies: {
          typescript: '^5.0.0',
          '@types/react': '^18.0.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('React');
      expect(stack.languages).toContain('JavaScript');
      expect(stack.languages).toContain('TypeScript');
    });
  });

  describe('Next.js Detection', () => {
    test('should detect Next.js from dependencies', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          next: '^14.2.0',
          react: '^18.2.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Next');
      expect(stack.frameworks).toContain('React');
      expect(stack.runtime).toBe('node');
    });

    test('should detect Next.js from config file', async () => {
      await fs.writeFile(path.join(tmpDir, 'next.config.js'), 'module.exports = {};');
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        scripts: { dev: 'next dev' }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Next');
    });

    test('should detect Next.js with TypeScript config', async () => {
      await fs.writeFile(path.join(tmpDir, 'next.config.ts'), 'export default {};');
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          next: '^14.2.0'
        },
        devDependencies: {
          typescript: '^5.0.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Next');
      expect(stack.languages).toContain('TypeScript');
    });
  });

  describe('Nuxt.js Detection', () => {
    test('should detect Nuxt.js from dependencies', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          nuxt: '^3.8.0',
          vue: '^3.4.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Nuxt');
      expect(stack.frameworks).toContain('Vue');
      expect(stack.runtime).toBe('node');
    });

    test('should detect Nuxt.js from config file', async () => {
      await fs.writeFile(path.join(tmpDir, 'nuxt.config.js'), 'export default {};');
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        scripts: { dev: 'nuxt dev' }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Nuxt');
    });

    test('should detect Nuxt.js from @nuxt/kit dependency', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: {
          '@nuxt/kit': '^3.8.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Nuxt');
    });
  });

  describe('Laravel Detection', () => {
    test('should detect Laravel from artisan file', async () => {
      await fs.writeFile(path.join(tmpDir, 'artisan'), '#!/usr/bin/env php');
      await fs.writeJson(path.join(tmpDir, 'composer.json'), {
        require: {
          php: '^8.3.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Laravel');
      expect(stack.languages).toContain('PHP');
      expect(stack.runtime).toBe('php');
    });

    test('should detect Laravel from composer.json', async () => {
      await fs.writeJson(path.join(tmpDir, 'composer.json'), {
        require: {
          'laravel/framework': '^11.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Laravel');
    });
  });

  describe('Package Manager Detection', () => {
    test('should detect npm from package-lock.json', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {});
      await fs.writeJson(path.join(tmpDir, 'package-lock.json'), {});

      const stack = await detector.detect();
      expect(stack.packageManagers).toContain('npm');
    });

    test('should detect yarn from yarn.lock', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {});
      await fs.writeFile(path.join(tmpDir, 'yarn.lock'), '');

      const stack = await detector.detect();
      expect(stack.packageManagers).toContain('yarn');
    });

    test('should detect pnpm from pnpm-lock.yaml', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {});
      await fs.writeFile(path.join(tmpDir, 'pnpm-lock.yaml'), '');

      const stack = await detector.detect();
      expect(stack.packageManagers).toContain('pnpm');
    });

    test('should detect bun from bun.lockb', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {});
      await fs.writeFile(path.join(tmpDir, 'bun.lockb'), '');

      const stack = await detector.detect();
      expect(stack.packageManagers).toContain('bun');
    });

    test('should detect composer from composer.lock', async () => {
      await fs.writeJson(path.join(tmpDir, 'composer.json'), {});
      await fs.writeJson(path.join(tmpDir, 'composer.lock'), {});

      const stack = await detector.detect();
      expect(stack.packageManagers).toContain('composer');
    });
  });

  describe('Command Generation', () => {
    test('should generate commands for Vue.js project', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          vue: '^3.4.0'
        },
        scripts: {
          dev: 'vite',
          build: 'vite build',
          test: 'vitest',
          lint: 'eslint .'
        }
      });
      await fs.writeFile(path.join(tmpDir, 'yarn.lock'), '');

      const stack = await detector.detect();
      expect(stack.commands.dev).toContain('yarn run dev');
      expect(stack.commands.build).toContain('yarn run build');
      expect(stack.commands.test).toContain('yarn run test');
      expect(stack.commands.lint).toContain('yarn run lint');
    });

    test('should generate commands for Next.js project', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          next: '^14.2.0',
          react: '^18.2.0'
        },
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start'
        }
      });

      const stack = await detector.detect();
      expect(stack.commands.dev).toContain('npm run dev');
      expect(stack.commands.build).toContain('npm run build');
    });

    test('should generate commands for Laravel project', async () => {
      await fs.writeFile(path.join(tmpDir, 'artisan'), '#!/usr/bin/env php');
      await fs.writeJson(path.join(tmpDir, 'composer.json'), {
        require: {
          'laravel/framework': '^11.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.commands.dev).toContain('php artisan serve');
      expect(stack.commands.test).toContain('php artisan test');
    });
  });

  describe('Mixed Projects', () => {
    test('should detect Laravel with Vue.js frontend', async () => {
      await fs.writeFile(path.join(tmpDir, 'artisan'), '#!/usr/bin/env php');
      await fs.writeJson(path.join(tmpDir, 'composer.json'), {
        require: {
          'laravel/framework': '^11.0'
        }
      });
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        devDependencies: {
          vue: '^3.4.0',
          vite: '^5.0.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Laravel');
      expect(stack.frameworks).toContain('Vue');
      expect(stack.languages).toContain('PHP');
      expect(stack.languages).toContain('JavaScript');
    });

    test('should prioritize specific frameworks over generic ones', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        dependencies: {
          next: '^14.2.0',
          react: '^18.2.0',
          vue: '^3.4.0'
        }
      });

      const stack = await detector.detect();
      expect(stack.frameworks).toContain('Next');
      expect(stack.frameworks).toContain('React');
      expect(stack.frameworks).toContain('Vue');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty project', async () => {
      const stack = await detector.detect();
      expect(stack.runtime).toBe('generic');
      expect(stack.frameworks).toHaveLength(0);
      expect(stack.languages).toHaveLength(0);
    });

    test('should handle missing package.json', async () => {
      await fs.writeFile(path.join(tmpDir, 'README.md'), '# Test Project');

      const stack = await detector.detect();
      expect(stack.runtime).toBe('generic');
    });

    test('should handle invalid package.json', async () => {
      await fs.writeFile(path.join(tmpDir, 'package.json'), '{ invalid json }');

      const stack = await detector.detect();
      expect(stack.runtime).toBe('generic');
    });

    test('should handle missing dependencies in package.json', async () => {
      await fs.writeJson(path.join(tmpDir, 'package.json'), {
        name: 'test-project'
      });

      const stack = await detector.detect();
      expect(stack.runtime).toBe('node');
      expect(stack.languages).toContain('JavaScript');
    });
  });
});