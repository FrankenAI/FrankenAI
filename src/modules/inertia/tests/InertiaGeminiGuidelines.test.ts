import { describe, test, expect, beforeEach } from 'bun:test';
import { InertiaModule } from '../InertiaModule.js';
import { GuidelineManager } from '../../../core/GuidelineManager.js';
import type { GuidelineContext } from '../../../core/GuidelineManager.js';
import type { DetectionContext } from '../../../core/types/Module.js';

describe('Inertia Gemini Guidelines Integration', () => {
  let module: InertiaModule;
  let guidelineManager: GuidelineManager;

  beforeEach(() => {
    module = new InertiaModule();
    guidelineManager = new GuidelineManager();
    guidelineManager.clear();
  });

  describe('InertiaModule Gemini Guidelines', () => {
    test('should include Gemini analysis guidelines in guideline paths', async () => {
      const paths = await module.getGuidelinePaths('1.0');

      // Should have core Inertia guidelines
      const coreGuideline = paths.find(p => p.path === 'inertia/guidelines/laravel-tool.md');
      expect(coreGuideline).toBeDefined();

      // Should have Gemini analysis guidelines
      const geminiGuideline = paths.find(p => p.path === 'inertia/guidelines/gemini-analysis.md');
      expect(geminiGuideline).toBeDefined();
      expect(geminiGuideline!.priority).toBe('laravel-tool');
      expect(geminiGuideline!.category).toBe('framework');

      // Should have version-specific guidelines
      const versionGuideline = paths.find(p => p.path === 'inertia/guidelines/1/features.md');
      expect(versionGuideline).toBeDefined();

      expect(paths).toHaveLength(3);
    });

    test('should include Gemini guidelines without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(2); // core + gemini

      const geminiGuideline = paths.find(p => p.path === 'inertia/guidelines/gemini-analysis.md');
      expect(geminiGuideline).toBeDefined();
      expect(geminiGuideline!.priority).toBe('laravel-tool');
    });
  });

  describe('GuidelineManager Integration', () => {
    test('should load Inertia Gemini guidelines in full context', async () => {
      const context: GuidelineContext = {
        stack: {
          frameworks: ['Inertia.js'],
          languages: ['PHP', 'JavaScript'],
          runtime: 'php',
          packageManagers: ['composer', 'npm'],
          configFiles: ['composer.json', 'package.json'],
          dependencies: ['inertiajs/inertia-laravel']
        }
      };

      const guidelines = await guidelineManager.collectGuidelines(context);

      // Should have Inertia Gemini analysis guidelines
      const inertiaGeminiGuidelines = guidelines.filter(g =>
        g.path === 'inertia/guidelines/gemini-analysis.md'
      );
      expect(inertiaGeminiGuidelines).toHaveLength(1);

      const geminiGuideline = inertiaGeminiGuidelines[0];
      expect(geminiGuideline.id).toContain('inertia');
      expect(geminiGuideline.priority).toBe('laravel-tool');
      expect(geminiGuideline.category).toBe('framework');
    });

    test('should work in combined Laravel + Inertia project', async () => {
      const context: GuidelineContext = {
        laravelVersion: '11.0',
        stack: {
          frameworks: ['Laravel', 'Inertia.js'],
          languages: ['PHP', 'JavaScript'],
          runtime: 'php',
          packageManagers: ['composer', 'npm'],
          configFiles: ['composer.json', 'package.json', 'artisan'],
          dependencies: ['laravel/framework', 'inertiajs/inertia-laravel']
        }
      };

      const guidelines = await guidelineManager.collectGuidelines(context);

      // Should have both Laravel and Inertia Gemini guidelines
      const laravelGemini = guidelines.find(g =>
        g.path === 'laravel/guidelines/gemini-analysis.md'
      );
      const inertiaGemini = guidelines.find(g =>
        g.path === 'inertia/guidelines/gemini-analysis.md'
      );

      expect(laravelGemini).toBeDefined();
      expect(inertiaGemini).toBeDefined();

      // Laravel (meta-framework) should come before Inertia (laravel-tool)
      const laravelIndex = guidelines.indexOf(laravelGemini!);
      const inertiaIndex = guidelines.indexOf(inertiaGemini!);

      expect(laravelIndex).toBeLessThan(inertiaIndex);
    });

    test('should respect Inertia detection requirements', async () => {
      const contextWithoutLaravel: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: [],
        packageJson: {
          dependencies: {
            '@inertiajs/vue3': '^1.0.0'
          }
        },
        composerJson: null // No Laravel
      };

      const result = await module.detect(contextWithoutLaravel);

      // Should detect Inertia frontend packages even without Laravel backend
      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.4);
      expect(result.evidence).toContain('Inertia Vue 3 adapter detected');

      const contextWithLaravel: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'composer.json'],
        files: [],
        packageJson: {
          dependencies: {
            '@inertiajs/vue3': '^1.0.0'
          }
        },
        composerJson: {
          require: {
            'laravel/framework': '^11.0',
            'inertiajs/inertia-laravel': '^1.0'
          }
        }
      };

      const resultWithLaravel = await module.detect(contextWithLaravel);

      // Should detect Inertia with Laravel
      expect(resultWithLaravel.detected).toBe(true);
      expect(resultWithLaravel.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('Cross-Stack Guidelines Benefits', () => {
    test('should provide cross-stack analysis capabilities', async () => {
      // This test verifies that Inertia Gemini guidelines are designed for cross-stack analysis
      const paths = await module.getGuidelinePaths();
      const geminiPath = paths.find(p => p.path.includes('gemini-analysis'));

      expect(geminiPath).toBeDefined();
      expect(geminiPath!.category).toBe('framework'); // Cross-stack framework guidance
      expect(geminiPath!.priority).toBe('laravel-tool'); // Positioned correctly in Laravel ecosystem
    });
  });
});