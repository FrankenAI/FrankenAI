import { describe, test, expect, beforeEach } from 'bun:test';
import { LaravelModule } from '../LaravelModule.js';
import { GuidelineManager } from '../../../core/GuidelineManager.js';
import type { GuidelineContext } from '../../../core/GuidelineManager.js';

describe('Laravel Gemini Guidelines Integration', () => {
  let module: LaravelModule;
  let guidelineManager: GuidelineManager;

  beforeEach(() => {
    module = new LaravelModule();
    guidelineManager = new GuidelineManager();
    guidelineManager.clear();
  });

  describe('LaravelModule Gemini Guidelines', () => {
    test('should include Gemini analysis guidelines in guideline paths', async () => {
      const paths = await module.getGuidelinePaths('11.0');

      // Should have core Laravel guidelines
      const coreGuideline = paths.find(p => p.path === 'laravel/guidelines/framework.md');
      expect(coreGuideline).toBeDefined();

      // Should have Gemini analysis guidelines
      const geminiGuideline = paths.find(p => p.path === 'laravel/guidelines/gemini-analysis.md');
      expect(geminiGuideline).toBeDefined();
      expect(geminiGuideline!.priority).toBe('meta-framework');
      expect(geminiGuideline!.category).toBe('framework');

      // Should have version-specific guidelines
      const versionGuideline = paths.find(p => p.path === 'laravel/guidelines/11/features.md');
      expect(versionGuideline).toBeDefined();

      expect(paths).toHaveLength(3);
    });

    test('should include Gemini guidelines without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(2); // core + gemini

      const geminiGuideline = paths.find(p => p.path === 'laravel/guidelines/gemini-analysis.md');
      expect(geminiGuideline).toBeDefined();
    });
  });

  describe('GuidelineManager Integration', () => {
    test('should load Laravel Gemini guidelines in full context', async () => {
      const context: GuidelineContext = {
        laravelVersion: '11.0',
        phpVersion: '8.2',
        stack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json', 'artisan'],
          dependencies: ['laravel/framework']
        }
      };

      const guidelines = await guidelineManager.collectGuidelines(context);

      // Should have Laravel Gemini analysis guidelines
      const laravelGeminiGuidelines = guidelines.filter(g =>
        g.path === 'laravel/guidelines/gemini-analysis.md'
      );
      expect(laravelGeminiGuidelines).toHaveLength(1);

      const geminiGuideline = laravelGeminiGuidelines[0];
      expect(geminiGuideline.id).toContain('laravel');
      expect(geminiGuideline.priority).toBe('meta-framework');
      expect(geminiGuideline.category).toBe('framework');
    });

    test('should maintain correct priority with other guidelines', async () => {
      const context: GuidelineContext = {
        stack: {
          frameworks: ['Laravel'],
          languages: ['PHP', 'JavaScript'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json'],
          dependencies: ['laravel/framework']
        }
      };

      const guidelines = await guidelineManager.collectGuidelines(context);

      // Laravel guidelines (meta-framework) should come before language guidelines (base-lang)
      const laravelGuidelines = guidelines.filter(g => g.priority === 'meta-framework');
      const languageGuidelines = guidelines.filter(g => g.priority === 'base-lang');

      if (laravelGuidelines.length > 0 && languageGuidelines.length > 0) {
        const firstLaravel = guidelines.findIndex(g => g.priority === 'meta-framework');
        const firstLanguage = guidelines.findIndex(g => g.priority === 'base-lang');

        expect(firstLaravel).toBeLessThan(firstLanguage);
      }
    });

    test('should generate CLAUDE.md with Laravel Gemini content', async () => {
      const context: GuidelineContext = {
        stack: {
          frameworks: ['Laravel'],
          languages: ['PHP'],
          runtime: 'php',
          packageManagers: ['composer'],
          configFiles: ['composer.json'],
          dependencies: ['laravel/framework']
        }
      };

      const guidelines = await guidelineManager.collectGuidelines(context);
      const claudeContent = guidelineManager.generateClaudeContent(guidelines, context);

      // Should include Laravel stack detection
      expect(claudeContent).toContain('Laravel');

      // Should include FrankenAI workflow section
      expect(claudeContent).toContain('## FrankenAI Workflow');
      expect(claudeContent).toContain('Discovery Phase (Gemini CLI)');
      expect(claudeContent).toContain('Implementation Phase (Claude Code)');

      // Should include guidelines markers
      expect(claudeContent).toContain('[//]: # (franken-ai:guidelines:start)');
      expect(claudeContent).toContain('[//]: # (franken-ai:guidelines:end)');
    });
  });
});