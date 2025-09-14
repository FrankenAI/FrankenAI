import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ModuleRegistration, ModuleFactory } from './types/Module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Registry for automatic module discovery and registration
 */
export class ModuleRegistry {
  private modulesPath: string;
  private registrations = new Map<string, ModuleRegistration>();

  constructor() {
    this.modulesPath = path.join(__dirname, '..', 'modules');
  }

  /**
   * Discover and register all available modules
   */
  async discoverModules(): Promise<void> {
    try {
      if (!await fs.pathExists(this.modulesPath)) {
        console.warn(`Modules directory not found: ${this.modulesPath}`);
        return;
      }

      const entries = await fs.readdir(this.modulesPath, { withFileTypes: true });
      const moduleDirs = entries.filter(entry => entry.isDirectory());

      for (const dir of moduleDirs) {
        try {
          await this.discoverModule(dir.name);
        } catch (error) {
          console.error(`Failed to discover module ${dir.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Module discovery failed:', error);
    }
  }

  /**
   * Discover a single module by directory name
   */
  private async discoverModule(moduleName: string): Promise<void> {
    const moduleDir = path.join(this.modulesPath, moduleName);
    const tsIndexPath = path.join(moduleDir, 'index.ts');
    const jsIndexPath = path.join(moduleDir, 'index.js');

    // Check for index file (prefer .ts, fallback to .js)
    let indexFile: string | null = null;
    if (await fs.pathExists(tsIndexPath)) {
      indexFile = tsIndexPath;
    } else if (await fs.pathExists(jsIndexPath)) {
      indexFile = jsIndexPath;
    }

    if (!indexFile) {
      console.warn(`Module ${moduleName} has no index file`);
      return;
    }

    // Create module factory
    const factory: ModuleFactory = async () => {
      const module = await import(indexFile);

      // Support both default export and named export
      let moduleInstance = module.default || module[moduleName] || module;

      // Try to find a module class by common naming patterns
      if (!moduleInstance || (typeof moduleInstance === 'object' && !moduleInstance.id)) {
        const capitalizedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
        const possibleNames = [
          `${capitalizedName}Module`,
          `${capitalizedName}`,
          moduleName
        ];

        for (const name of possibleNames) {
          if (module[name]) {
            moduleInstance = module[name];
            break;
          }
        }
      }

      if (typeof moduleInstance === 'function') {
        return new moduleInstance();
      }

      return moduleInstance;
    };

    // Register module
    const registration: ModuleRegistration = {
      id: moduleName,
      factory,
      enabled: true
    };

    this.register(registration);
  }

  /**
   * Register a module manually
   */
  register(registration: ModuleRegistration): void {
    this.registrations.set(registration.id, registration);
  }

  /**
   * Unregister a module
   */
  unregister(moduleId: string): boolean {
    return this.registrations.delete(moduleId);
  }

  /**
   * Get a module registration
   */
  getRegistration(moduleId: string): ModuleRegistration | undefined {
    return this.registrations.get(moduleId);
  }

  /**
   * Get all module registrations
   */
  getAllRegistrations(): ModuleRegistration[] {
    return Array.from(this.registrations.values());
  }

  /**
   * Get enabled module registrations
   */
  getEnabledRegistrations(): ModuleRegistration[] {
    return this.getAllRegistrations().filter(reg => reg.enabled);
  }

  /**
   * Enable a module
   */
  enable(moduleId: string): boolean {
    const registration = this.registrations.get(moduleId);
    if (registration) {
      registration.enabled = true;
      return true;
    }
    return false;
  }

  /**
   * Disable a module
   */
  disable(moduleId: string): boolean {
    const registration = this.registrations.get(moduleId);
    if (registration) {
      registration.enabled = false;
      return true;
    }
    return false;
  }

  /**
   * Check if a module is registered
   */
  isRegistered(moduleId: string): boolean {
    return this.registrations.has(moduleId);
  }

  /**
   * Check if a module is enabled
   */
  isEnabled(moduleId: string): boolean {
    const registration = this.registrations.get(moduleId);
    return registration?.enabled ?? false;
  }

  /**
   * Get module count
   */
  getCount(): number {
    return this.registrations.size;
  }

  /**
   * Get enabled module count
   */
  getEnabledCount(): number {
    return this.getEnabledRegistrations().length;
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.registrations.clear();
  }

  /**
   * Load modules from a configuration file
   */
  async loadFromConfig(configPath: string): Promise<void> {
    try {
      if (!await fs.pathExists(configPath)) {
        return;
      }

      const config = await fs.readJson(configPath);

      if (config.modules && Array.isArray(config.modules)) {
        for (const moduleConfig of config.modules) {
          if (typeof moduleConfig === 'string') {
            // Simple module name
            const registration: ModuleRegistration = {
              id: moduleConfig,
              factory: () => this.loadModuleById(moduleConfig),
              enabled: true
            };
            this.register(registration);
          } else if (typeof moduleConfig === 'object') {
            // Module with configuration
            const registration: ModuleRegistration = {
              id: moduleConfig.id || moduleConfig.name,
              factory: () => this.loadModuleById(moduleConfig.id || moduleConfig.name),
              enabled: moduleConfig.enabled !== false,
              config: moduleConfig.config || {}
            };
            this.register(registration);
          }
        }
      }
    } catch (error) {
      console.error(`Failed to load modules from config: ${configPath}`, error);
    }
  }

  /**
   * Save module configuration
   */
  async saveToConfig(configPath: string): Promise<void> {
    try {
      const config = {
        modules: this.getAllRegistrations().map(reg => ({
          id: reg.id,
          enabled: reg.enabled,
          config: reg.config || {}
        }))
      };

      await fs.writeJson(configPath, config, { spaces: 2 });
    } catch (error) {
      console.error(`Failed to save module config: ${configPath}`, error);
    }
  }

  /**
   * Load a module by ID
   */
  private async loadModuleById(moduleId: string): Promise<any> {
    const modulePath = path.join(this.modulesPath, moduleId);

    // Try different file extensions
    const possibleFiles = [
      path.join(modulePath, 'index.js'),
      path.join(modulePath, 'index.ts'),
      path.join(modulePath, `${moduleId}.js`),
      path.join(modulePath, `${moduleId}.ts`)
    ];

    for (const filePath of possibleFiles) {
      if (await fs.pathExists(filePath)) {
        const module = await import(filePath);
        return module.default || module[moduleId] || module;
      }
    }

    throw new Error(`Module file not found for: ${moduleId}`);
  }

  /**
   * Validate module structure
   */
  async validateModuleStructure(moduleName: string): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const moduleDir = path.join(this.modulesPath, moduleName);

    // Check if module directory exists
    if (!await fs.pathExists(moduleDir)) {
      errors.push(`Module directory does not exist: ${moduleDir}`);
      return { valid: false, errors, warnings };
    }

    // Check for index file
    const indexFiles = ['index.js', 'index.ts'];
    const hasIndex = await Promise.all(
      indexFiles.map(file => fs.pathExists(path.join(moduleDir, file)))
    );

    if (!hasIndex.some(exists => exists)) {
      errors.push(`Module ${moduleName} missing index file (index.js or index.ts)`);
    }

    // Check for module class file
    const moduleFiles = [`${moduleName}.js`, `${moduleName}.ts`, `${moduleName}Module.js`, `${moduleName}Module.ts`];
    const hasModuleFile = await Promise.all(
      moduleFiles.map(file => fs.pathExists(path.join(moduleDir, file)))
    );

    if (!hasModuleFile.some(exists => exists)) {
      warnings.push(`Module ${moduleName} missing main module file`);
    }

    // Check for detection file
    const detectionFiles = ['detection.js', 'detection.ts'];
    const hasDetection = await Promise.all(
      detectionFiles.map(file => fs.pathExists(path.join(moduleDir, file)))
    );

    if (!hasDetection.some(exists => exists)) {
      warnings.push(`Module ${moduleName} missing detection file`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}