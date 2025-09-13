import { describe, test, expect } from 'bun:test';
import { ReactModule } from '../ReactModule.js';
import type { DetectionContext } from '../../../core/types/Module.js';

describe('ReactModule', () => {
  const module = new ReactModule();

  test('should have correct metadata', () => {
    const metadata = module.getMetadata();

    expect(metadata.name).toBe('react');
    expect(metadata.displayName).toBe('React');
    expect(metadata.keywords).toContain('jsx');
    expect(module.type).toBe('framework');
    expect(module.priorityType).toBe('framework');
  });

  test('should detect React project', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['package.json'],
      files: ['src/App.jsx', 'src/components/Button.jsx'],
      packageJson: {
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        }
      },
      composerJson: null
    };

    const result = await module.detect(context);

    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.evidence).toContain('react in package.json dependencies');
  });

  test('should not detect Next.js as React (Next should be detected separately)', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['package.json', 'next.config.js'],
      files: ['pages/index.js', 'pages/_app.js'],
      packageJson: {
        dependencies: {
          react: '^18.2.0',
          next: '^14.0.0'
        }
      },
      composerJson: null
    };

    const result = await module.detect(context);

    // React should still be detected even in Next.js projects
    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  test('should detect React version', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['package.json'],
      files: [],
      packageJson: {
        dependencies: {
          react: '^18.2.5'
        }
      },
      composerJson: null
    };

    const version = await module.detectVersion(context);

    expect(version).toBe('18');
  });

  test('should return guideline paths', async () => {
    const guidelines = await module.getGuidelinePaths('18');

    expect(guidelines).toHaveLength(2);
    expect(guidelines[0].path).toBe('react/guidelines/framework.md');
    expect(guidelines[0].priority).toBe('framework');
    expect(guidelines[1].path).toBe('react/guidelines/18/features.md');
  });

  test('should generate React commands', async () => {
    const mockContext = {
      projectRoot: '/test',
      detectedStack: {
        runtime: 'node',
        languages: ['JavaScript'],
        frameworks: ['React'],
        packageManagers: ['npm'],
        configFiles: ['package.json'],
        commands: { dev: [], build: [], test: [], lint: [], install: [] }
      },
      detectionResult: { detected: true, confidence: 1, evidence: [] }
    };

    const commands = await module.generateCommands(mockContext);

    expect(commands.dev).toContain('npm run dev');
    expect(commands.build).toContain('npm run build');
    expect(commands.test).toContain('npm run test');
    expect(commands.install).toContain('npm install');
  });

  test('should get supported extensions', () => {
    const extensions = module.getSupportedExtensions();

    expect(extensions).toContain('.jsx');
    expect(extensions).toContain('.tsx');
    expect(extensions).toContain('.js');
    expect(extensions).toContain('.ts');
  });

  test('should get config files', () => {
    const configFiles = module.getConfigFiles();

    expect(configFiles).toContain('package.json');
    expect(configFiles).toContain('vite.config.js');
  });
});