import { describe, test, expect } from 'bun:test';
import { PackageRegistry, PackageInfo } from '../../src/core/PackageRegistry.js';
import fs from 'fs-extra';
import path from 'path';

describe('PackageRegistry', () => {
  describe('findTemplatesForPackage', () => {
    test('should find Laravel templates for laravel/framework package', async () => {
      const packageInfo: PackageInfo = {
        name: 'laravel/framework',
        version: '^11.0',
        type: 'composer'
      };

      const templates = await PackageRegistry.findTemplatesForPackage(packageInfo);
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates).toContain('frameworks/laravel/laravel.md');
      expect(templates).toContain('frameworks/laravel/laravel11.md');
    });

    test('should find Vue templates for vue package', async () => {
      const packageInfo: PackageInfo = {
        name: 'vue',
        version: '^3.0.0',
        type: 'npm'
      };

      const templates = await PackageRegistry.findTemplatesForPackage(packageInfo);
      
      expect(templates.length).toBeGreaterThan(0);
      expect(templates).toContain('frameworks/vue/vue.md');
      expect(templates).toContain('frameworks/vue/vue3.md');
    });

    test('should return empty array for unknown package', async () => {
      const packageInfo: PackageInfo = {
        name: 'unknown-package',
        version: '1.0.0',
        type: 'npm'
      };

      const templates = await PackageRegistry.findTemplatesForPackage(packageInfo);
      expect(templates).toEqual([]);
    });
  });

  describe('getAllPackageTemplates', () => {
    test('should consolidate templates from multiple packages', async () => {
      const packages: PackageInfo[] = [
        { name: 'laravel/framework', version: '^11.0', type: 'composer' },
        { name: 'livewire/livewire', version: '^3.0', type: 'composer' },
        { name: 'vue', version: '^3.0', type: 'npm' }
      ];

      const templates = await PackageRegistry.getAllPackageTemplates(packages);
      
      expect(templates.length).toBeGreaterThan(0);
      
      // Should contain Laravel templates
      const laravelTemplate = templates.find(t => t.templatePath.includes('laravel/laravel.md'));
      expect(laravelTemplate).toBeDefined();
      expect(laravelTemplate?.category).toBe('framework');
      
      // Should contain Livewire template  
      const livewireTemplate = templates.find(t => t.templatePath.includes('livewire'));
      expect(livewireTemplate).toBeDefined();
      expect(livewireTemplate?.ecosystem).toBe('laravel');
    });
  });

  describe('version extraction', () => {
    test('should extract PHP versions correctly', async () => {
      const phpPackage: PackageInfo = {
        name: 'php',
        version: '^8.2.0',
        type: 'composer'
      };

      const templates = await PackageRegistry.findTemplatesForPackage(phpPackage);
      expect(templates).toContain('languages/php/php82.md');
    });
  });
});