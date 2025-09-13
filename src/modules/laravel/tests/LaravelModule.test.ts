import { describe, test, expect } from 'bun:test';
import { LaravelModule } from '../LaravelModule.js';
import type { DetectionContext } from '../../../core/types/Module.js';

describe('LaravelModule', () => {
  const module = new LaravelModule();

  test('should have correct metadata', () => {
    const metadata = module.getMetadata();

    expect(metadata.name).toBe('laravel');
    expect(metadata.displayName).toBe('Laravel');
    expect(metadata.keywords).toContain('php');
    expect(metadata.keywords).toContain('framework');
    expect(module.type).toBe('framework');
    expect(module.priorityType).toBe('meta-framework');
  });

  test('should detect Laravel project', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['composer.json', 'artisan'],
      files: ['app/Http/Kernel.php', 'routes/web.php'],
      packageJson: null,
      composerJson: {
        require: {
          'laravel/framework': '^11.0'
        }
      }
    };

    const result = await module.detect(context);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.evidence).toContain('laravel/framework in composer.json dependencies');
  });

  test('should not detect non-Laravel project', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['package.json'],
      files: ['src/index.js'],
      packageJson: { dependencies: { react: '^18.0.0' } },
      composerJson: null
    };

    const result = await module.detect(context);

    expect(result.detected).toBe(false);
    expect(result.confidence).toBeLessThan(0.1);
  });

  test('should detect Laravel version from composer.json', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['composer.json'],
      files: [],
      packageJson: null,
      composerJson: {
        require: {
          'laravel/framework': '^11.5.0'
        }
      }
    };

    const version = await module.detectVersion(context);

    expect(version).toBe('11');
  });

  test('should return guideline paths', async () => {
    const guidelines = await module.getGuidelinePaths('11');

    expect(guidelines).toHaveLength(2);
    expect(guidelines[0].path).toBe('laravel/guidelines/framework.md');
    expect(guidelines[0].priority).toBe('meta-framework');
    expect(guidelines[1].path).toBe('laravel/guidelines/11/features.md');
  });

  test('should generate Laravel commands', async () => {
    const mockContext = {
      projectRoot: '/test',
      detectedStack: {
        runtime: 'php',
        languages: ['PHP'],
        frameworks: ['Laravel'],
        packageManagers: ['composer'],
        configFiles: ['composer.json', 'artisan'],
        commands: { dev: [], build: [], test: [], lint: [], install: [] }
      },
      detectionResult: { detected: true, confidence: 1, evidence: [] }
    };

    const commands = await module.generateCommands(mockContext);

    expect(commands.dev).toContain('php artisan serve');
    expect(commands.test).toContain('php artisan test');
    expect(commands.install).toContain('composer install');
  });

  test('should get supported extensions', () => {
    const extensions = module.getSupportedExtensions();

    expect(extensions).toContain('.php');
  });

  test('should get config files', () => {
    const configFiles = module.getConfigFiles();

    expect(configFiles).toContain('composer.json');
    expect(configFiles).toContain('artisan');
  });
});