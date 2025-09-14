import { describe, test, expect, beforeEach } from 'bun:test';
import { NextModule } from '../NextModule.js';
import { GuidelineManager } from '../../../core/GuidelineManager.js';
import type { GuidelineContext } from '../../../core/GuidelineManager.js';
import type { DetectionContext } from '../../../core/types/Module.js';

describe('Next.js Gemini Guidelines Integration', () => {
  let module: NextModule;
  let guidelineManager: GuidelineManager;

  beforeEach(() => {
    module = new NextModule();
    guidelineManager = new GuidelineManager();
    guidelineManager.clear();
  });

  describe('NextModule Gemini Guidelines', () => {
    test('should include Gemini analysis guidelines in guideline paths', async () => {
      const paths = await module.getGuidelinePaths('14');

      // Should have core Next.js guidelines
      const coreGuideline = paths.find(p => p.path === 'next/guidelines/framework.md');
      expect(coreGuideline).toBeDefined();

      // Should have Gemini analysis guidelines
      const geminiGuideline = paths.find(p => p.path === 'next/guidelines/gemini-analysis.md');
      expect(geminiGuideline).toBeDefined();
      expect(geminiGuideline!.priority).toBe('meta-framework');
      expect(geminiGuideline!.category).toBe('framework');

      // Should have version-specific guidelines
      const versionGuideline = paths.find(p => p.path === 'next/guidelines/14/features.md');
      expect(versionGuideline).toBeDefined();

      expect(paths).toHaveLength(3);
    });

    test('should include Gemini guidelines without version', async () => {
      const paths = await module.getGuidelinePaths();

      expect(paths).toHaveLength(2); // core + gemini

      const geminiGuideline = paths.find(p => p.path === 'next/guidelines/gemini-analysis.md');
      expect(geminiGuideline).toBeDefined();
    });
  });

  describe('React Exclusion System', () => {
    test('should exclude React when Next.js is detected', async () => {
      const detectionContext: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json', 'next.config.js'],
        files: ['pages/index.js', 'components/Header.js'],
        packageJson: {
          dependencies: {
            next: '^14.0.0',
            react: '^18.0.0',
            'react-dom': '^18.0.0'
          },
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start'
          }
        },
        composerJson: null
      };

      const result = await module.detect(detectionContext);

      // Should detect Next.js
      expect(result.detected).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.3);

      // Should exclude React
      expect(result.excludes).toContain('react');
      expect(result.evidence).toContain('Next.js includes React - excluding standalone React guidelines');
    });

    test('should not exclude React when Next.js is not detected', async () => {
      const detectionContext: DetectionContext = {
        projectRoot: '/test',
        configFiles: ['package.json'],
        files: ['src/App.js'],
        packageJson: {
          dependencies: {
            react: '^18.0.0',
            'react-dom': '^18.0.0'
          }
          // No Next.js dependency or scripts
        },
        composerJson: null
      };

      const result = await module.detect(detectionContext);

      // Should not detect Next.js
      expect(result.detected).toBe(false);

      // Should not exclude React
      expect(result.excludes).toBeUndefined();
    });
  });

  describe('GuidelineManager Integration with Exclusions', () => {
    test('should load Next.js guidelines but exclude React guidelines', async () => {
      const context: GuidelineContext = {
        stack: {
          frameworks: ['Next.js'], // Next.js detected, should exclude React
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'next.config.js'],
          dependencies: ['next', 'react']
        }
      };

      const guidelines = await guidelineManager.collectGuidelines(context);

      // Should have Next.js guidelines
      const nextGuidelines = guidelines.filter(g => g.id.includes('next'));
      expect(nextGuidelines.length).toBeGreaterThan(0);

      // Should have Next.js Gemini guidelines
      const nextGeminiGuidelines = guidelines.filter(g =>
        g.path === 'next/guidelines/gemini-analysis.md'
      );
      expect(nextGeminiGuidelines).toHaveLength(1);

      // Should NOT have React guidelines (excluded by Next.js)
      const reactGuidelines = guidelines.filter(g => g.id.includes('react'));
      expect(reactGuidelines).toHaveLength(0);
    });

    test('should maintain correct priority with Next.js as meta-framework', async () => {
      const context: GuidelineContext = {
        stack: {
          frameworks: ['Next.js'],
          languages: ['JavaScript', 'TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json'],
          dependencies: ['next']
        }
      };

      const guidelines = await guidelineManager.collectGuidelines(context);

      // Next.js guidelines (meta-framework) should come before language guidelines
      const nextGuidelines = guidelines.filter(g => g.priority === 'meta-framework');
      const languageGuidelines = guidelines.filter(g => g.priority === 'base-lang' || g.priority === 'specialized-lang');

      if (nextGuidelines.length > 0 && languageGuidelines.length > 0) {
        const firstNext = guidelines.findIndex(g => g.priority === 'meta-framework');
        const firstLanguage = guidelines.findIndex(g => g.priority === 'base-lang' || g.priority === 'specialized-lang');

        expect(firstNext).toBeLessThan(firstLanguage);
      }
    });

    test('should generate CLAUDE.md with Next.js content and no React guidelines', async () => {
      const context: GuidelineContext = {
        stack: {
          frameworks: ['Next.js'],
          languages: ['JavaScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'next.config.js'],
          dependencies: ['next']
        }
      };

      const guidelines = await guidelineManager.collectGuidelines(context);
      const claudeContent = guidelineManager.generateClaudeContent(guidelines, context);

      // Should include Next.js stack detection
      expect(claudeContent).toContain('Next.js');

      // Should include FrankenAI workflow section
      expect(claudeContent).toContain('## FrankenAI Workflow');

      // Should NOT contain React-specific content (since React is excluded)
      const reactGuidelines = guidelines.filter(g => g.id.includes('react'));
      expect(reactGuidelines).toHaveLength(0);
    });
  });

  describe('Complex Project Scenarios', () => {
    test('should handle Next.js with other non-conflicting tools', async () => {
      const context: GuidelineContext = {
        stack: {
          frameworks: ['Next.js', 'Tailwind CSS'], // CSS framework should coexist
          languages: ['JavaScript', 'TypeScript'],
          runtime: 'node',
          packageManagers: ['npm'],
          configFiles: ['package.json', 'next.config.js', 'tailwind.config.js'],
          dependencies: ['next', 'tailwindcss']
        }
      };

      const guidelines = await guidelineManager.collectGuidelines(context);

      // Should have Next.js guidelines
      const nextGuidelines = guidelines.filter(g => g.id.includes('next'));
      expect(nextGuidelines.length).toBeGreaterThan(0);

      // Should have Tailwind guidelines (not conflicting)
      const tailwindGuidelines = guidelines.filter(g => g.id.includes('tailwind'));
      expect(tailwindGuidelines.length).toBeGreaterThan(0);

      // Should NOT have React guidelines (excluded by Next.js)
      const reactGuidelines = guidelines.filter(g => g.id.includes('react'));
      expect(reactGuidelines).toHaveLength(0);
    });
  });
});