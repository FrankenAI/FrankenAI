import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { WorkspaceGenerator } from '../../src/core/WorkspaceGenerator';
import { DetectedStack } from '../../src/core/StackDetector';
import fs from 'fs-extra';

// Mock external dependencies
mock.module('fs-extra', () => ({
  pathExists: mock(() => Promise.resolve(true)),
  readFile: mock(() => Promise.resolve('# CLAUDE.md\n\nExisting content')),
  writeFile: mock(() => Promise.resolve()),
}));

describe('WorkspaceGenerator', () => {
  let generator: WorkspaceGenerator;
  let mockStack: DetectedStack;

  beforeEach(() => {
    generator = new WorkspaceGenerator();
    mockStack = {
      runtime: 'bun',
      languages: ['TypeScript', 'JavaScript'],
      frameworks: ['Vue.js', 'Nuxt.js'],
      packageManagers: ['bun'],
      configFiles: ['package.json', 'nuxt.config.ts'],
      commands: {
        dev: ['bun run dev'],
        build: ['bun run build'],
        test: ['bun test'],
        lint: ['bun run lint'],
        install: ['bun install'],
      },
    };
  });

  describe('enhance', () => {
    test('should enhance CLAUDE.md with detected stack information', async () => {
      // Arrange
      const mockWriteFile = mock(() => Promise.resolve());
      (fs.writeFile as any).mockImplementation(mockWriteFile);

      // Act
      await generator.enhance(mockStack, { includeDocs: false, verbose: false });

      // Assert
      expect(mockWriteFile).toHaveBeenCalled();
      const writtenContent = (mockWriteFile as any).mock.calls[0][1];
      
      expect(writtenContent).toContain('Detected Stack:');
      expect(writtenContent).toContain('Vue.js, Nuxt.js');
      expect(writtenContent).toContain('bun run dev');
      expect(writtenContent).toContain('bun test');
    });

    test('should include documentation when includeDocs is true', async () => {
      // Arrange
      const mockWriteFile = mock(() => Promise.resolve());
      (fs.writeFile as any).mockImplementation(mockWriteFile);

      // Act
      await generator.enhance(mockStack, { includeDocs: true, verbose: false });

      // Assert
      expect(mockWriteFile).toHaveBeenCalled();
      const writtenContent = (mockWriteFile as any).mock.calls[0][1];
      
      expect(writtenContent).toContain('Framework Documentation');
      expect(writtenContent).toContain('Vue.js Best Practices');
      expect(writtenContent).toContain('Nuxt.js Guidelines');
    });

    test('should handle Laravel stack correctly', async () => {
      // Arrange
      const laravelStack: DetectedStack = {
        runtime: 'php',
        languages: ['PHP'],
        frameworks: ['Laravel'],
        packageManagers: ['composer'],
        configFiles: ['composer.json', 'artisan'],
        commands: {
          dev: ['php artisan serve'],
          build: ['php artisan optimize'],
          test: ['php artisan test'],
          lint: ['php artisan pint'],
          install: ['composer install'],
        },
      };

      const mockWriteFile = mock(() => Promise.resolve());
      (fs.writeFile as any).mockImplementation(mockWriteFile);

      // Act
      await generator.enhance(laravelStack, { includeDocs: false, verbose: false });

      // Assert
      expect(mockWriteFile).toHaveBeenCalled();
      const writtenContent = (mockWriteFile as any).mock.calls[0][1];
      
      expect(writtenContent).toContain('Laravel');
      expect(writtenContent).toContain('php artisan serve');
      expect(writtenContent).toContain('composer install');
    });

    test('should preserve existing FrankenAI configuration', async () => {
      // Arrange
      const existingContent = `# CLAUDE.md

# FrankenAI Configuration
Existing FrankenAI config

## Other Section
Other content`;

      const mockReadFile = mock(() => Promise.resolve(existingContent));
      const mockWriteFile = mock(() => Promise.resolve());
      (fs.readFile as any).mockImplementation(mockReadFile);
      (fs.writeFile as any).mockImplementation(mockWriteFile);

      // Act
      await generator.enhance(mockStack, { includeDocs: false, verbose: false });

      // Assert
      expect(mockWriteFile).toHaveBeenCalled();
      const writtenContent = (mockWriteFile as any).mock.calls[0][1];
      
      // Should have updated FrankenAI section but preserved other content
      expect(writtenContent).toContain('## Other Section');
      expect(writtenContent).toContain('FrankenAI Configuration');
      expect(writtenContent).toContain('Detected Stack:');
    });
  });

  describe('generateStackCommands', () => {
    test('should generate properly formatted commands section', () => {
      // Act
      const result = generator.generateStackCommands(mockStack);

      // Assert
      expect(result).toContain('## Commands');
      expect(result).toContain('### Development');
      expect(result).toContain('`bun run dev`');
      expect(result).toContain('### Testing');
      expect(result).toContain('`bun test`');
      expect(result).toContain('### Build');
      expect(result).toContain('`bun run build`');
    });

    test('should handle empty commands gracefully', () => {
      // Arrange
      const emptyStack: DetectedStack = {
        ...mockStack,
        commands: {
          dev: [],
          build: [],
          test: [],
          lint: [],
          install: [],
        },
      };

      // Act
      const result = generator.generateStackCommands(emptyStack);

      // Assert
      expect(result).toContain('## Commands');
      expect(result).toContain('No specific commands detected');
    });
  });

  describe('generateFrameworkDocs', () => {
    test('should generate documentation for detected frameworks', () => {
      // Act
      const result = generator.generateFrameworkDocs(['Vue.js', 'Nuxt.js']);

      // Assert
      expect(result).toContain('## Framework Documentation');
      expect(result).toContain('### Vue.js Best Practices');
      expect(result).toContain('### Nuxt.js Guidelines');
      expect(result).toContain('Composition API');
      expect(result).toContain('Auto-imports');
    });

    test('should return empty string when no frameworks detected', () => {
      // Act
      const result = generator.generateFrameworkDocs([]);

      // Assert
      expect(result).toBe('');
    });
  });
});