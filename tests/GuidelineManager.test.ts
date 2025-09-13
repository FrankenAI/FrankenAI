import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { GuidelineManager, type GuidelineContext } from '../src/core/GuidelineManager.js';
import type { DetectedStack } from '../src/core/StackDetector.js';

describe('GuidelineManager', () => {
  let tmpDir: string;
  let manager: GuidelineManager;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'franken-ai-guidelines-test-'));
    // Create a fresh manager instance for each test to avoid registration conflicts
    manager = new GuidelineManager();
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
    // Clear module registrations to avoid conflicts between tests
    manager?.clear();
  });

  const createMockStack = (overrides: Partial<DetectedStack> = {}): DetectedStack => ({
    runtime: 'node',
    languages: ['JavaScript'],
    frameworks: [],
    packageManagers: ['npm'],
    configFiles: ['package.json'],
    commands: {
      dev: ['npm run dev'],
      build: ['npm run build'],
      test: ['npm run test'],
      lint: ['npm run lint'],
      install: ['npm install']
    },
    ...overrides
  });

  describe('Framework Guidelines Collection', () => {
    test('should collect React guidelines', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({ frameworks: ['React'] }),
        reactVersion: '18'
      };

      const guidelines = await manager.collectGuidelines(context);

      const reactGuidelines = guidelines.filter(g => g.path.includes('react'));
      expect(reactGuidelines.length).toBeGreaterThan(0);

      const frameworkGuideline = reactGuidelines.find(g => g.path === 'react/guidelines/framework.md');
      expect(frameworkGuideline).toBeDefined();
      expect(frameworkGuideline?.category).toBe('framework');
      expect(frameworkGuideline?.content).toContain('React Framework Guidelines');
    });

    test('should collect Laravel guidelines with version', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({
          runtime: 'php',
          languages: ['PHP'],
          frameworks: ['Laravel'],
          packageManagers: ['composer']
        }),
        laravelVersion: '12',
        phpVersion: '8.4'
      };

      const guidelines = await manager.collectGuidelines(context);

      const laravelGuidelines = guidelines.filter(g => g.path.includes('laravel'));
      expect(laravelGuidelines.length).toBeGreaterThan(0);

      const frameworkGuideline = laravelGuidelines.find(g => g.path === 'laravel/guidelines/framework.md');
      expect(frameworkGuideline).toBeDefined();

      const versionGuideline = laravelGuidelines.find(g => g.path === 'laravel/guidelines/12/features.md');
      expect(versionGuideline).toBeDefined();
    });
  });

  describe('Language Guidelines Collection', () => {
    test('should collect JavaScript guidelines', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({
          runtime: 'node',
          languages: ['JavaScript']
        })
      };

      const guidelines = await manager.collectGuidelines(context);

      const jsGuidelines = guidelines.filter(g => g.path.includes('javascript'));
      expect(jsGuidelines.length).toBeGreaterThan(0);

      const languageGuideline = jsGuidelines.find(g => g.path === 'javascript/guidelines/language.md');
      expect(languageGuideline).toBeDefined();
      expect(languageGuideline?.category).toBe('language');
    });
  });

  describe('Multiple Framework Guidelines', () => {
    test('should collect guidelines for Laravel + JavaScript project', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({
          runtime: 'php',
          frameworks: ['Laravel'],
          languages: ['PHP', 'JavaScript'],
          packageManagers: ['composer', 'npm']
        }),
        laravelVersion: '12',
        phpVersion: '8.4'
      };

      const guidelines = await manager.collectGuidelines(context);

      const frameworkGuidelines = guidelines.filter(g => g.category === 'framework');
      const languageGuidelines = guidelines.filter(g => g.category === 'language');

      expect(frameworkGuidelines.length).toBeGreaterThanOrEqual(1);
      expect(languageGuidelines.length).toBeGreaterThanOrEqual(1);

      const laravelGuideline = frameworkGuidelines.find(g => g.path.includes('laravel'));
      const jsGuideline = languageGuidelines.find(g => g.path.includes('javascript'));

      expect(laravelGuideline).toBeDefined();
      expect(jsGuideline).toBeDefined();
    });
  });

  describe('CLAUDE.md Content Generation', () => {
    test('should generate complete CLAUDE.md for React project', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({
          frameworks: ['React'],
          languages: ['JavaScript', 'TypeScript']
        }),
        reactVersion: '18'
      };

      const guidelines = await manager.collectGuidelines(context);
      const content = manager.generateClaudeContent(guidelines, context);

      expect(content).toContain('# FrankenAI Configuration');
      expect(content).toContain('## Detected Stack: React');
      expect(content).toContain('- **Runtime**: node');
      expect(content).toContain('- **Languages**: JavaScript, TypeScript');
      expect(content).toContain('- **Frameworks**: React');
      expect(content).toContain('## Commands');
      expect(content).toContain('### Development');
      expect(content).toContain('npm run dev');
      expect(content).toContain('React Framework Guidelines');
    });

    test('should generate complete CLAUDE.md for Laravel project', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({
          runtime: 'php',
          languages: ['PHP'],
          frameworks: ['Laravel'],
          packageManagers: ['composer']
        }),
        laravelVersion: '12',
        phpVersion: '8.4'
      };

      const guidelines = await manager.collectGuidelines(context);
      const content = manager.generateClaudeContent(guidelines, context);

      expect(content).toContain('# FrankenAI Configuration');
      expect(content).toContain('## Detected Stack: Laravel');
      expect(content).toContain('- **Runtime**: php');
      expect(content).toContain('- **Languages**: PHP');
      expect(content).toContain('- **Laravel Version**: 12');
      expect(content).toContain('- **PHP Version**: 8.4');
      expect(content).toContain('php artisan serve');
      expect(content).toContain('composer install');
    });

    test('should include workflow section', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({ frameworks: ['React'] })
      };

      const guidelines = await manager.collectGuidelines(context);
      const content = manager.generateClaudeContent(guidelines, context);

      expect(content).toContain('## FrankenAI Workflow');
      expect(content).toContain('### Discovery Phase (Gemini CLI)');
      expect(content).toContain('### Implementation Phase (Claude Code)');
      expect(content).toContain('gemini -p "@src/ @app/ What\'s the overall architecture?"');
    });

    test('should generate correct commands for different package managers', async () => {
      const contexts = [
        {
          packageManagers: ['yarn'],
          expected: 'yarn run dev'
        },
        {
          packageManagers: ['pnpm'],
          expected: 'pnpm run dev'
        },
        {
          packageManagers: ['bun'],
          expected: 'bun run dev'
        },
        {
          packageManagers: ['npm'],
          expected: 'npm run dev'
        }
      ];

      for (const { packageManagers, expected } of contexts) {
        // Clear manager before each iteration to avoid registration conflicts
        manager.clear();

        const context: GuidelineContext = {
          stack: createMockStack({
            frameworks: ['React'],
            packageManagers
          })
        };

        const guidelines = await manager.collectGuidelines(context);
        const content = manager.generateClaudeContent(guidelines, context);

        expect(content).toContain(expected);
      }
    });
  });

  describe('Priority and Ordering', () => {
    test('should sort guidelines by priority', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({
          frameworks: ['Laravel'],
          languages: ['JavaScript']
        }),
        laravelVersion: '12'
      };

      const guidelines = await manager.collectGuidelines(context);

      // Framework guidelines should come before language guidelines
      const frameworkIndex = guidelines.findIndex(g => g.category === 'framework');
      const languageIndex = guidelines.findIndex(g => g.category === 'language');

      expect(frameworkIndex).toBeLessThan(languageIndex);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty frameworks array', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({ frameworks: [] })
      };

      const guidelines = await manager.collectGuidelines(context);
      const content = manager.generateClaudeContent(guidelines, context);

      expect(content).toContain('## Detected Stack: Generic');
      expect(content).toContain('## Commands');
    });

    test('should handle missing version information', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({
          frameworks: ['React'],
          languages: ['JavaScript']
        })
        // No version information provided
      };

      const guidelines = await manager.collectGuidelines(context);

      // Should still collect framework guidelines without version-specific ones
      const reactGuidelines = guidelines.filter(g => g.path.includes('react'));
      expect(reactGuidelines.length).toBeGreaterThan(0);

      const frameworkGuideline = reactGuidelines.find(g => g.path === 'react/guidelines/framework.md');
      expect(frameworkGuideline).toBeDefined();
    });

    test('should handle invalid framework names', async () => {
      const context: GuidelineContext = {
        stack: createMockStack({
          frameworks: ['NonExistentFramework'],
          languages: [] // No languages to avoid JavaScript detection
        })
      };

      const guidelines = await manager.collectGuidelines(context);

      // Should not crash and should return only guidelines for known modules
      // Since no valid modules are specified, should return 0 guidelines
      expect(guidelines).toHaveLength(0);
    });
  });
});