import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { ModuleRegistry } from '../src/core/ModuleRegistry.js';
import type { ModuleRegistration } from '../src/core/types/Module.js';

describe('ModuleRegistry', () => {
  let moduleRegistry: ModuleRegistry;
  let tmpDir: string;

  beforeEach(async () => {
    moduleRegistry = new ModuleRegistry();
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'franken-ai-registry-test-'));
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
    moduleRegistry.clear();
  });

  describe('Manual Registration', () => {
    test('should register a module manually', () => {
      const registration: ModuleRegistration = {
        id: 'manual-test',
        factory: () => ({ id: 'manual-test' } as any),
        enabled: true
      };

      moduleRegistry.register(registration);

      expect(moduleRegistry.isRegistered('manual-test')).toBe(true);
      expect(moduleRegistry.isEnabled('manual-test')).toBe(true);
    });

    test('should register multiple modules', () => {
      const registrations: ModuleRegistration[] = [
        { id: 'module1', factory: () => ({} as any), enabled: true },
        { id: 'module2', factory: () => ({} as any), enabled: false },
        { id: 'module3', factory: () => ({} as any), enabled: true }
      ];

      registrations.forEach(reg => moduleRegistry.register(reg));

      expect(moduleRegistry.getCount()).toBe(3);
      expect(moduleRegistry.getEnabledCount()).toBe(2);
    });
  });

  describe('Module Management', () => {
    beforeEach(() => {
      const registration: ModuleRegistration = {
        id: 'test-module',
        factory: () => ({} as any),
        enabled: true
      };
      moduleRegistry.register(registration);
    });

    test('should unregister a module', () => {
      expect(moduleRegistry.isRegistered('test-module')).toBe(true);

      const result = moduleRegistry.unregister('test-module');

      expect(result).toBe(true);
      expect(moduleRegistry.isRegistered('test-module')).toBe(false);
    });

    test('should return false when unregistering non-existent module', () => {
      const result = moduleRegistry.unregister('non-existent');

      expect(result).toBe(false);
    });

    test('should get module registration', () => {
      const registration = moduleRegistry.getRegistration('test-module');

      expect(registration).toBeDefined();
      expect(registration?.id).toBe('test-module');
      expect(registration?.enabled).toBe(true);
    });

    test('should return undefined for non-existent module', () => {
      const registration = moduleRegistry.getRegistration('non-existent');

      expect(registration).toBeUndefined();
    });

    test('should enable and disable modules', () => {
      expect(moduleRegistry.isEnabled('test-module')).toBe(true);

      const disableResult = moduleRegistry.disable('test-module');
      expect(disableResult).toBe(true);
      expect(moduleRegistry.isEnabled('test-module')).toBe(false);

      const enableResult = moduleRegistry.enable('test-module');
      expect(enableResult).toBe(true);
      expect(moduleRegistry.isEnabled('test-module')).toBe(true);
    });

    test('should return false when enabling/disabling non-existent module', () => {
      const enableResult = moduleRegistry.enable('non-existent');
      const disableResult = moduleRegistry.disable('non-existent');

      expect(enableResult).toBe(false);
      expect(disableResult).toBe(false);
    });
  });

  describe('Registry Queries', () => {
    beforeEach(() => {
      const registrations: ModuleRegistration[] = [
        { id: 'enabled1', factory: () => ({} as any), enabled: true },
        { id: 'enabled2', factory: () => ({} as any), enabled: true },
        { id: 'disabled1', factory: () => ({} as any), enabled: false },
        { id: 'disabled2', factory: () => ({} as any), enabled: false }
      ];
      registrations.forEach(reg => moduleRegistry.register(reg));
    });

    test('should get all registrations', () => {
      const allRegistrations = moduleRegistry.getAllRegistrations();

      expect(allRegistrations).toHaveLength(4);
      expect(allRegistrations.map(r => r.id)).toContain('enabled1');
      expect(allRegistrations.map(r => r.id)).toContain('disabled1');
    });

    test('should get enabled registrations only', () => {
      const enabledRegistrations = moduleRegistry.getEnabledRegistrations();

      expect(enabledRegistrations).toHaveLength(2);
      expect(enabledRegistrations.map(r => r.id)).toContain('enabled1');
      expect(enabledRegistrations.map(r => r.id)).toContain('enabled2');
      expect(enabledRegistrations.map(r => r.id)).not.toContain('disabled1');
    });

    test('should get correct counts', () => {
      expect(moduleRegistry.getCount()).toBe(4);
      expect(moduleRegistry.getEnabledCount()).toBe(2);
    });
  });

  describe('Clear Registry', () => {
    test('should clear all registrations', () => {
      const registrations: ModuleRegistration[] = [
        { id: 'clear1', factory: () => ({} as any), enabled: true },
        { id: 'clear2', factory: () => ({} as any), enabled: true }
      ];
      registrations.forEach(reg => moduleRegistry.register(reg));

      expect(moduleRegistry.getCount()).toBe(2);

      moduleRegistry.clear();

      expect(moduleRegistry.getCount()).toBe(0);
      expect(moduleRegistry.isRegistered('clear1')).toBe(false);
      expect(moduleRegistry.isRegistered('clear2')).toBe(false);
    });
  });

  describe('Configuration Management', () => {
    test('should load modules from configuration', async () => {
      const configPath = path.join(tmpDir, 'modules.json');
      const config = {
        modules: [
          'simple-module',
          {
            id: 'complex-module',
            enabled: true,
            config: { option: 'value' }
          },
          {
            id: 'disabled-module',
            enabled: false
          }
        ]
      };

      await fs.writeJson(configPath, config);

      // Mock the loadModuleById method to avoid file system dependencies
      const originalLoadModuleById = (moduleRegistry as any).loadModuleById;
      (moduleRegistry as any).loadModuleById = async (moduleId: string) => {
        return { id: moduleId, name: moduleId };
      };

      await moduleRegistry.loadFromConfig(configPath);

      expect(moduleRegistry.getCount()).toBe(3);
      expect(moduleRegistry.isRegistered('simple-module')).toBe(true);
      expect(moduleRegistry.isRegistered('complex-module')).toBe(true);
      expect(moduleRegistry.isRegistered('disabled-module')).toBe(true);
      expect(moduleRegistry.isEnabled('complex-module')).toBe(true);
      expect(moduleRegistry.isEnabled('disabled-module')).toBe(false);

      // Restore original method
      (moduleRegistry as any).loadModuleById = originalLoadModuleById;
    });

    test('should handle non-existent config file gracefully', async () => {
      const configPath = path.join(tmpDir, 'non-existent.json');

      await expect(moduleRegistry.loadFromConfig(configPath)).resolves.not.toThrow();
      expect(moduleRegistry.getCount()).toBe(0);
    });

    test('should save configuration', async () => {
      const configPath = path.join(tmpDir, 'save-config.json');

      const registrations: ModuleRegistration[] = [
        {
          id: 'save-test1',
          factory: () => ({} as any),
          enabled: true,
          config: { option: 'value1' }
        },
        {
          id: 'save-test2',
          factory: () => ({} as any),
          enabled: false,
          config: { option: 'value2' }
        }
      ];
      registrations.forEach(reg => moduleRegistry.register(reg));

      await moduleRegistry.saveToConfig(configPath);

      expect(await fs.pathExists(configPath)).toBe(true);

      const savedConfig = await fs.readJson(configPath);
      expect(savedConfig.modules).toHaveLength(2);
      expect(savedConfig.modules[0].id).toBe('save-test1');
      expect(savedConfig.modules[0].enabled).toBe(true);
      expect(savedConfig.modules[0].config.option).toBe('value1');
      expect(savedConfig.modules[1].id).toBe('save-test2');
      expect(savedConfig.modules[1].enabled).toBe(false);
    });
  });

  describe('Module Discovery', () => {
    test('should handle missing modules directory gracefully', async () => {
      // Create a registry with a non-existent modules path
      const customRegistry = new ModuleRegistry();

      // Mock the modules path to point to non-existent directory
      (customRegistry as any).modulesPath = path.join(tmpDir, 'non-existent-modules');

      await expect(customRegistry.discoverModules()).resolves.not.toThrow();
      expect(customRegistry.getCount()).toBe(0);
    });

    test('should discover modules in directory', async () => {
      // Create a mock modules directory structure
      const modulesDir = path.join(tmpDir, 'modules');
      const testModuleDir = path.join(modulesDir, 'test-module');

      await fs.ensureDir(testModuleDir);

      // Create a simple module file
      const moduleContent = `
        export class TestModule {
          id = 'test-module';
          type = 'framework';
          priorityType = 'framework';

          getMetadata() {
            return {
              name: 'test-module',
              displayName: 'Test Module',
              description: 'A test module',
              version: '1.0.0',
              author: 'Test',
              keywords: ['test'],
              supportedVersions: ['1.x']
            };
          }

          async detect() {
            return { detected: false, confidence: 0, evidence: [] };
          }

          async detectVersion() {
            return undefined;
          }

          async getGuidelinePaths() {
            return [];
          }

          async generateCommands() {
            return {};
          }

          getSupportedExtensions() {
            return ['.test'];
          }

          getConfigFiles() {
            return ['test.config.js'];
          }
        }

        export default TestModule;
      `;

      await fs.writeFile(path.join(testModuleDir, 'index.ts'), moduleContent);

      // Mock the modules path
      (moduleRegistry as any).modulesPath = modulesDir;

      await moduleRegistry.discoverModules();

      expect(moduleRegistry.isRegistered('test-module')).toBe(true);
      expect(moduleRegistry.isEnabled('test-module')).toBe(true);
    });
  });

  describe('Module Validation', () => {
    test('should validate module structure', async () => {
      const modulesDir = path.join(tmpDir, 'modules');
      const validModuleDir = path.join(modulesDir, 'valid-module');

      await fs.ensureDir(validModuleDir);
      await fs.writeFile(path.join(validModuleDir, 'index.ts'), 'export default {};');
      await fs.writeFile(path.join(validModuleDir, 'ValidModule.ts'), 'export class ValidModule {}');
      await fs.writeFile(path.join(validModuleDir, 'detection.ts'), 'export const detection = {};');

      // Mock the modules path
      (moduleRegistry as any).modulesPath = modulesDir;

      const validation = await moduleRegistry.validateModuleStructure('valid-module');

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings).toHaveLength(0);
    });

    test('should report validation errors for incomplete module', async () => {
      const modulesDir = path.join(tmpDir, 'modules');
      const incompleteModuleDir = path.join(modulesDir, 'incomplete-module');

      await fs.ensureDir(incompleteModuleDir);
      // Missing index file

      // Mock the modules path
      (moduleRegistry as any).modulesPath = modulesDir;

      const validation = await moduleRegistry.validateModuleStructure('incomplete-module');

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('missing index file');
    });

    test('should report validation warnings for missing optional files', async () => {
      const modulesDir = path.join(tmpDir, 'modules');
      const warningModuleDir = path.join(modulesDir, 'warning-module');

      await fs.ensureDir(warningModuleDir);
      await fs.writeFile(path.join(warningModuleDir, 'index.ts'), 'export default {};');
      // Missing module class file and detection file

      // Mock the modules path
      (moduleRegistry as any).modulesPath = modulesDir;

      const validation = await moduleRegistry.validateModuleStructure('warning-module');

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.warnings.length).toBeGreaterThan(0);
    });

    test('should handle validation of non-existent module', async () => {
      const modulesDir = path.join(tmpDir, 'modules');
      await fs.ensureDir(modulesDir);

      // Mock the modules path
      (moduleRegistry as any).modulesPath = modulesDir;

      const validation = await moduleRegistry.validateModuleStructure('non-existent');

      expect(validation.valid).toBe(false);
      expect(validation.errors).toHaveLength(1);
      expect(validation.errors[0]).toContain('does not exist');
    });
  });

  describe('Error Handling', () => {
    test('should handle module discovery errors gracefully', async () => {
      const modulesDir = path.join(tmpDir, 'modules');
      const errorModuleDir = path.join(modulesDir, 'error-module');

      await fs.ensureDir(errorModuleDir);
      await fs.writeFile(path.join(errorModuleDir, 'index.ts'), 'invalid javascript code {{');

      // Mock the modules path
      (moduleRegistry as any).modulesPath = modulesDir;

      // Should not throw, but should handle errors gracefully
      await expect(moduleRegistry.discoverModules()).resolves.not.toThrow();
    });

    test('should handle configuration file errors gracefully', async () => {
      const configPath = path.join(tmpDir, 'invalid.json');
      await fs.writeFile(configPath, '{ invalid json');

      await expect(moduleRegistry.loadFromConfig(configPath)).resolves.not.toThrow();
      expect(moduleRegistry.getCount()).toBe(0);
    });

    test('should handle configuration save errors gracefully', async () => {
      const configPath = path.join('/non-existent-directory', 'config.json');

      await expect(moduleRegistry.saveToConfig(configPath)).resolves.not.toThrow();
    });
  });
});