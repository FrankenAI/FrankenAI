import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { StackDetector } from '../src/core/StackDetector.js';
import { GuidelineManager } from '../src/core/GuidelineManager.js';
import { InitCommand } from '../src/commands/InitCommand.js';

const fixturesPath = path.join(__dirname, 'fixtures');

describe('Integration Tests', () => {
  let tmpDir: string;
  let originalCwd: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'franken-ai-integration-test-'));
    originalCwd = process.cwd();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await fs.remove(tmpDir);
  });

  const copyFixtureToTemp = async (fixtureName: string): Promise<string> => {
    const fixturePath = path.join(fixturesPath, fixtureName);
    const tempProjectPath = path.join(tmpDir, fixtureName);

    if (await fs.pathExists(fixturePath)) {
      await fs.copy(fixturePath, tempProjectPath);
    } else {
      throw new Error(`Fixture not found: ${fixturePath}`);
    }

    return tempProjectPath;
  };

  describe('Vue.js Project Integration', () => {
    test('should detect and generate complete CLAUDE.md for Vue project', async () => {
      const projectPath = await copyFixtureToTemp('test-vue-project');
      process.chdir(projectPath);

      const detector = new StackDetector(projectPath);
      const stack = await detector.detect();

      expect(stack.frameworks).toContain('Vue');
      expect(stack.runtime).toBe('node');
      expect(stack.languages).toContain('JavaScript');

      const manager = new GuidelineManager();
      const context = {
        stack,
        vueVersion: '3'
      };

      const guidelines = await manager.collectGuidelines(context);
      const content = manager.generateClaudeContent(guidelines, context);

      expect(content).toContain('## Detected Stack: Vue');
      expect(content).toContain('Vue.js Framework Guidelines');
      expect(content).toContain('npm run dev');
    });

    test('should run full init command on Vue project', async () => {
      const projectPath = await copyFixtureToTemp('test-vue-project');
      process.chdir(projectPath);

      const initCommand = new InitCommand();
      const options = {
        yes: true,
        force: true,
        silent: true
      };

      await initCommand.execute(options);

      const claudeExists = await fs.pathExists(path.join(projectPath, 'CLAUDE.md'));
      expect(claudeExists).toBe(true);

      const content = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('Vue.js Framework Guidelines');
      expect(content).toContain('## Detected Stack: Vue');
    });
  });

  describe('React Project Integration', () => {
    test('should detect and generate complete CLAUDE.md for React project', async () => {
      const projectPath = await copyFixtureToTemp('test-react-project');
      process.chdir(projectPath);

      const detector = new StackDetector(projectPath);
      const stack = await detector.detect();

      expect(stack.frameworks).toContain('React');
      expect(stack.runtime).toBe('node');

      const initCommand = new InitCommand();
      const options = {
        yes: true,
        force: true,
        silent: true
      };

      await initCommand.execute(options);

      const content = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('React Framework Guidelines');
      expect(content).toContain('## Detected Stack: React');
    });
  });

  describe('Next.js Project Integration', () => {
    test('should detect Next.js with React and generate appropriate guidelines', async () => {
      const projectPath = await copyFixtureToTemp('test-next-project');
      process.chdir(projectPath);

      const detector = new StackDetector(projectPath);
      const stack = await detector.detect();

      expect(stack.frameworks).toContain('Next');
      expect(stack.frameworks).toContain('React');
      expect(stack.languages).toContain('TypeScript');

      const initCommand = new InitCommand();
      const options = {
        yes: true,
        force: true,
        silent: true
      };

      await initCommand.execute(options);

      const content = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('Next.js Framework Guidelines');
      expect(content).toContain('React Framework Guidelines');
      expect(content).toContain('## Detected Stack: Next, React');
    });
  });

  describe('Nuxt.js Project Integration', () => {
    test('should detect Nuxt.js with Vue and generate appropriate guidelines', async () => {
      const projectPath = await copyFixtureToTemp('test-nuxt-project');
      process.chdir(projectPath);

      const detector = new StackDetector(projectPath);
      const stack = await detector.detect();

      expect(stack.frameworks).toContain('Nuxt');
      expect(stack.frameworks).toContain('Vue');

      const initCommand = new InitCommand();
      const options = {
        yes: true,
        force: true,
        silent: true
      };

      await initCommand.execute(options);

      const content = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('Nuxt.js Framework Guidelines');
      expect(content).toContain('Vue.js Framework Guidelines');
      expect(content).toContain('## Detected Stack: Nuxt, Vue');
    });
  });

  describe('Laravel Project Integration', () => {
    test('should detect Laravel with PHP and generate full guidelines', async () => {
      const projectPath = await copyFixtureToTemp('test-laravel-84');
      process.chdir(projectPath);

      const detector = new StackDetector(projectPath);
      const stack = await detector.detect();

      expect(stack.frameworks).toContain('Laravel');
      expect(stack.languages).toContain('PHP');
      expect(stack.runtime).toBe('php');

      const initCommand = new InitCommand();
      const options = {
        yes: true,
        force: true,
        silent: true
      };

      await initCommand.execute(options);

      const content = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('Laravel Framework Guidelines');
      expect(content).toContain('PHP 8.4 Specific Guidelines');
      expect(content).toContain('## Detected Stack: Laravel');
      expect(content).toContain('- **Laravel Version**: 12');
      expect(content).toContain('- **PHP Version**: 8.4');
      expect(content).toContain('php artisan serve');
    });
  });

  describe('Cross-Framework Compatibility', () => {
    test('should handle project switching between frameworks', async () => {
      // Start with Vue project
      const vueProjectPath = await copyFixtureToTemp('test-vue-project');
      process.chdir(vueProjectPath);

      let initCommand = new InitCommand();
      await initCommand.execute({ yes: true, force: true, silent: true });

      let content = await fs.readFile(path.join(vueProjectPath, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('Vue.js Framework Guidelines');

      // Switch to React project
      const reactProjectPath = await copyFixtureToTemp('test-react-project');
      process.chdir(reactProjectPath);

      initCommand = new InitCommand();
      await initCommand.execute({ yes: true, force: true, silent: true });

      content = await fs.readFile(path.join(reactProjectPath, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('React Framework Guidelines');
      expect(content).not.toContain('Vue.js Framework Guidelines');
    });

    test('should generate different commands based on package manager', async () => {
      const projects = [
        { name: 'test-vue-project', expectedPM: 'npm' },
        { name: 'test-react-project', expectedPM: 'npm' },
        { name: 'test-next-project', expectedPM: 'npm' }
      ];

      for (const { name, expectedPM } of projects) {
        const projectPath = await copyFixtureToTemp(name);

        // Add yarn.lock to change package manager
        if (expectedPM === 'yarn') {
          await fs.writeFile(path.join(projectPath, 'yarn.lock'), '');
        }

        process.chdir(projectPath);

        const initCommand = new InitCommand();
        await initCommand.execute({ yes: true, force: true, silent: true });

        const content = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
        expect(content).toContain(`${expectedPM} run dev`);
      }
    });
  });

  describe('Error Recovery', () => {
    test('should handle corrupted fixture files gracefully', async () => {
      const projectPath = path.join(tmpDir, 'corrupted-project');
      await fs.ensureDir(projectPath);

      // Create corrupted package.json
      await fs.writeFile(path.join(projectPath, 'package.json'), '{ invalid json }');

      process.chdir(projectPath);

      const detector = new StackDetector(projectPath);
      const stack = await detector.detect();

      expect(stack.runtime).toBe('generic');
      expect(stack.frameworks).toHaveLength(0);
    });

    test('should handle missing dependency information', async () => {
      const projectPath = path.join(tmpDir, 'minimal-project');
      await fs.ensureDir(projectPath);

      // Create minimal package.json without dependencies
      await fs.writeJson(path.join(projectPath, 'package.json'), {
        name: 'minimal-project',
        version: '1.0.0'
      });

      process.chdir(projectPath);

      const initCommand = new InitCommand();
      await initCommand.execute({ yes: true, force: true, silent: true });

      const claudeExists = await fs.pathExists(path.join(projectPath, 'CLAUDE.md'));
      expect(claudeExists).toBe(true);

      const content = await fs.readFile(path.join(projectPath, 'CLAUDE.md'), 'utf-8');
      expect(content).toContain('## Detected Stack: Generic');
    });
  });

  describe('Performance', () => {
    test('should complete initialization within reasonable time', async () => {
      const projectPath = await copyFixtureToTemp('test-vue-project');
      process.chdir(projectPath);

      const startTime = Date.now();

      const initCommand = new InitCommand();
      await initCommand.execute({ yes: true, force: true, silent: true });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });

    test('should handle multiple consecutive initializations', async () => {
      const projects = ['test-vue-project', 'test-react-project', 'test-next-project'];

      for (const projectName of projects) {
        const projectPath = await copyFixtureToTemp(projectName);
        process.chdir(projectPath);

        const initCommand = new InitCommand();
        await initCommand.execute({ yes: true, force: true, silent: true });

        const claudeExists = await fs.pathExists(path.join(projectPath, 'CLAUDE.md'));
        expect(claudeExists).toBe(true);
      }
    });
  });
});