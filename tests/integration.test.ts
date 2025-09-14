import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { StackDetector } from '../src/core/StackDetector.js';
import { InitCommand } from '../src/commands/InitCommand.js';

describe('FrankenAI Essential Tests', () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'franken-ai-test-'));
    originalCwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    try {
      if (await fs.pathExists(tmpDir)) {
        await fs.remove(tmpDir);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  const createProject = async (type: 'vue' | 'react' | 'laravel', name: string) => {
    const projectPath = path.join(tmpDir, name);
    await fs.ensureDir(projectPath);

    switch (type) {
      case 'vue':
        await fs.writeJson(path.join(projectPath, 'package.json'), {
          name: name,
          dependencies: { vue: '^3.4.0' },
          scripts: { dev: 'vite' }
        });
        break;

      case 'react':
        await fs.writeJson(path.join(projectPath, 'package.json'), {
          name: name,
          dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
          scripts: { dev: 'vite' }
        });
        break;

      case 'laravel':
        await fs.writeJson(path.join(projectPath, 'composer.json'), {
          name: `test/${name}`,
          require: { php: '^8.4', 'laravel/framework': '^12.0' }
        });
        await fs.writeJson(path.join(projectPath, 'composer.lock'), {
          packages: [{ name: 'laravel/framework', version: 'v12.0.0' }]
        });
        break;
    }

    return projectPath;
  };

  describe('Core Functionality', () => {
    test('should detect correct stack for different project types', async () => {
      // Test Vue detection
      const vueProject = await createProject('vue', 'vue-test');
      process.chdir(vueProject);

      let detector = new StackDetector(vueProject);
      let stack = await detector.detect();

      expect(stack.frameworks).toContain('Vue.js');
      expect(stack.runtime).toBe('node');

      // Test React detection
      const reactProject = await createProject('react', 'react-test');
      process.chdir(reactProject);

      detector = new StackDetector(reactProject);
      stack = await detector.detect();

      expect(stack.frameworks).toContain('React');
      expect(stack.runtime).toBe('node');

      // Test Laravel detection
      const laravelProject = await createProject('laravel', 'laravel-test');
      process.chdir(laravelProject);

      detector = new StackDetector(laravelProject);
      stack = await detector.detect();

      expect(stack.frameworks).toContain('Laravel');
      expect(stack.runtime).toBe('php');
    });

    test('should select appropriate guidelines based on detected stack', async () => {
      const vueProject = await createProject('vue', 'vue-test');
      process.chdir(vueProject);

      const initCommand = new InitCommand();
      await initCommand.execute({
        yes: true,
        force: true,
        silent: true,
        noInteraction: true
      });

      const content = await fs.readFile(path.join(vueProject, 'CLAUDE.md'), 'utf-8');

      // Should have Vue-specific guidelines
      expect(content).toContain('Vue.js Framework Guidelines');
      expect(content).toContain('## Detected Stack: Vue.js');
      expect(content).toContain('Composition API');
    });

    test('should create or update CLAUDE.md file correctly', async () => {
      const projectPath = await createProject('react', 'react-test');
      process.chdir(projectPath);

      // Verify file doesn't exist initially
      expect(await fs.pathExists(path.join(projectPath, 'CLAUDE.md'))).toBe(false);

      // Run init command
      const initCommand = new InitCommand();
      await initCommand.execute({
        yes: true,
        force: true,
        silent: true,
        noInteraction: true
      });

      // Verify file was created
      expect(await fs.pathExists(path.join(projectPath, 'CLAUDE.md'))).toBe(true);

      const content = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');

      // Should contain essential content
      expect(content).toContain('# FrankenAI Configuration');
      expect(content).toContain('React Framework Guidelines');
      expect(content).toContain('## Commands');
      expect(content).toContain('npm run dev');

      // Test update (run again with different content)
      const originalContent = content;

      // Run again - should update existing file
      await initCommand.execute({
        yes: true,
        force: true,
        silent: true,
        noInteraction: true
      });

      const updatedContent = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');

      // File should still exist and have React content
      expect(updatedContent).toContain('React Framework Guidelines');
      expect(updatedContent).toContain('# FrankenAI Configuration');
    });
  });
});