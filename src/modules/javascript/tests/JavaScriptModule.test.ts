import { describe, test, expect } from 'bun:test';
import { JavaScriptModule } from '../JavaScriptModule.js';
import type { DetectionContext } from '../../../core/types/Module.js';

describe('JavaScriptModule', () => {
  const module = new JavaScriptModule();

  test('should have correct metadata', () => {
    const metadata = module.getMetadata();

    expect(metadata.name).toBe('javascript');
    expect(metadata.displayName).toBe('JavaScript');
    expect(metadata.keywords).toContain('javascript');
    expect(module.type).toBe('language');
    expect(module.priorityType).toBe('base-lang');
  });

  test('should detect JavaScript project', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['package.json'],
      files: ['src/index.js', 'src/app.js'],
      packageJson: {
        name: 'test-app',
        version: '1.0.0'
      },
      composerJson: null
    };

    const result = await module.detect(context);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  test('should not detect non-JavaScript project', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['composer.json'],
      files: ['src/Controller.php'],
      packageJson: null,
      composerJson: {
        require: {
          'laravel/framework': '^11.0'
        }
      }
    };

    const result = await module.detect(context);

    expect(result.detected).toBe(false);
  });

  test('should return guideline paths', async () => {
    const guidelines = await module.getGuidelinePaths();

    expect(guidelines).toHaveLength(1);
    expect(guidelines[0].path).toBe('javascript/guidelines/language.md');
    expect(guidelines[0].priority).toBe('base-lang');
    expect(guidelines[0].category).toBe('language');
  });

  test('should get supported extensions', () => {
    const extensions = module.getSupportedExtensions();

    expect(extensions).toContain('.js');
    expect(extensions).toContain('.mjs');
    expect(extensions).toContain('.cjs');
  });

  test('should get runtime', () => {
    const runtime = module.getRuntime();

    expect(runtime).toBe('node');
  });
});