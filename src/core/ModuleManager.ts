import EventEmitter from 'events';
import type {
  Module,
  FrameworkModule,
  LanguageModule,
  LibraryModule,
  ModuleRegistration,
  ModuleConfig,
  DetectionContext,
  DetectionResult,
  ModuleContext,
  GuidelinePath,
  ModulePriorityType
} from './types/Module.js';
import type { StackCommands } from './StackDetector.js';

/**
 * Manages module lifecycle and operations
 */
export class ModuleManager extends EventEmitter {
  private modules = new Map<string, Module>();
  private registrations = new Map<string, ModuleRegistration>();
  private configs = new Map<string, ModuleConfig>();
  private initialized = false;

  /**
   * Register a module
   */
  register(registration: ModuleRegistration): void {
    if (this.registrations.has(registration.id)) {
      throw new Error(`Module ${registration.id} is already registered`);
    }

    this.registrations.set(registration.id, registration);
  }

  /**
   * Clear all registrations (useful for testing)
   */
  clear(): void {
    this.modules.clear();
    this.registrations.clear();
    this.configs.clear();
    this.initialized = false;
  }

  /**
   * Configure a module
   */
  configure(moduleId: string, config: ModuleConfig): void {
    this.configs.set(moduleId, config);
  }

  /**
   * Initialize all registered modules
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const enabledRegistrations = Array.from(this.registrations.values())
      .filter(reg => reg.enabled)
      .sort((a, b) => {
        const aPriorityType = this.configs.get(a.id)?.priorityType ?? 'base-lang';
        const bPriorityType = this.configs.get(b.id)?.priorityType ?? 'base-lang';
        return this.getPriorityValue(bPriorityType) - this.getPriorityValue(aPriorityType); // Higher priority first
      });

    for (const registration of enabledRegistrations) {
      try {
        await this.loadModule(registration);
      } catch (error) {
        console.error(`Failed to load module ${registration.id}:`, error);
        this.emit('module:error', { module: null, error: error as Error });
      }
    }

    this.initialized = true;
  }

  /**
   * Load a single module
   */
  private async loadModule(registration: ModuleRegistration): Promise<void> {
    try {
      const module = await registration.factory();

      // Validate module
      this.validateModule(module);

      // Store module
      this.modules.set(module.id, module);

      // Initialize module if it supports it
      if (module.initialize) {
        const context: ModuleContext = {
          projectRoot: process.cwd(),
          detectedStack: { // Basic context, will be updated later
            runtime: 'generic',
            languages: [],
            frameworks: [],
            packageManagers: [],
            configFiles: [],
            commands: {
              dev: [],
              build: [],
              test: [],
              lint: [],
              install: []
            }
          },
          detectionResult: {
            detected: false,
            confidence: 0,
            evidence: []
          }
        };

        if (module.initialize) {
          await module.initialize(context);
        }
      }

      this.emit('module:loaded', { module });
    } catch (error) {
      throw new Error(`Failed to load module ${registration.id}: ${error}`);
    }
  }

  /**
   * Validate a module meets requirements
   */
  private validateModule(module: Module): void {
    if (!module.id) {
      throw new Error('Module must have an id');
    }

    if (!module.type || !['framework', 'language', 'library'].includes(module.type)) {
      throw new Error('Module must have a valid type (framework, language, or library)');
    }

    if (!module.priorityType || !['meta-framework', 'framework', 'css-framework', 'laravel-tool', 'specialized-lang', 'base-lang'].includes(module.priorityType)) {
      throw new Error('Module must have a valid priorityType');
    }

    if (typeof module.getMetadata !== 'function') {
      throw new Error('Module must implement getMetadata()');
    }

    // Type-specific validation
    if (module.type === 'framework') {
      const frameworkModule = module as FrameworkModule;
      if (typeof frameworkModule.detect !== 'function') {
        throw new Error('Framework module must implement detect()');
      }
      if (typeof frameworkModule.detectVersion !== 'function') {
        throw new Error('Framework module must implement detectVersion()');
      }
      if (typeof frameworkModule.getGuidelinePaths !== 'function') {
        throw new Error('Framework module must implement getGuidelinePaths()');
      }
      if (typeof frameworkModule.generateCommands !== 'function') {
        throw new Error('Framework module must implement generateCommands()');
      }
    }

    if (module.type === 'language') {
      const languageModule = module as LanguageModule;
      if (typeof languageModule.detect !== 'function') {
        throw new Error('Language module must implement detect()');
      }
      if (typeof languageModule.detectVersion !== 'function') {
        throw new Error('Language module must implement detectVersion()');
      }
      if (typeof languageModule.getGuidelinePaths !== 'function') {
        throw new Error('Language module must implement getGuidelinePaths()');
      }
      if (typeof languageModule.getSupportedExtensions !== 'function') {
        throw new Error('Language module must implement getSupportedExtensions()');
      }
    }

    if (module.type === 'library') {
      const libraryModule = module as LibraryModule;
      if (typeof libraryModule.detect !== 'function') {
        throw new Error('Library module must implement detect()');
      }
      if (typeof libraryModule.detectVersion !== 'function') {
        throw new Error('Library module must implement detectVersion()');
      }
      if (typeof libraryModule.getGuidelinePaths !== 'function') {
        throw new Error('Library module must implement getGuidelinePaths()');
      }
      if (typeof libraryModule.generateCommands !== 'function') {
        throw new Error('Library module must implement generateCommands()');
      }
    }
  }

  /**
   * Get all loaded modules ordered by priority
   */
  getModules(): Module[] {
    return Array.from(this.modules.values()).sort(this.sortByPriority);
  }

  /**
   * Sort modules by priority type
   */
  private sortByPriority = (a: Module, b: Module): number => {
    const priorityOrder: Record<ModulePriorityType, number> = {
      'meta-framework': 6,
      'framework': 5,
      'css-framework': 4,
      'laravel-tool': 3,
      'specialized-lang': 2,
      'base-lang': 1
    };

    return priorityOrder[b.priorityType] - priorityOrder[a.priorityType];
  };

  /**
   * Get loaded modules by type
   */
  getModulesByType<T extends Module>(type: 'framework' | 'language' | 'library'): T[] {
    return this.getModules()
      .filter(module => module.type === type) as T[];
  }

  /**
   * Get a specific module by ID
   */
  getModule<T extends Module>(id: string): T | undefined {
    return this.modules.get(id) as T | undefined;
  }

  /**
   * Detect frameworks and languages using modules
   */
  async detectStack(context: DetectionContext): Promise<Map<string, DetectionResult>> {
    this.emit('detection:start', { context });

    const results = new Map<string, DetectionResult>();
    const exclusions = new Set<string>();

    // Run detection for all modules
    const modules = this.getModules();
    const detectionPromises = modules.map(async (module) => {
      try {
        let result: DetectionResult;

        if (module.type === 'framework') {
          const frameworkModule = module as FrameworkModule;
          result = await frameworkModule.detect(context);
        } else if (module.type === 'language') {
          const languageModule = module as LanguageModule;
          result = await languageModule.detect(context);
        } else if (module.type === 'library') {
          const libraryModule = module as LibraryModule;
          result = await libraryModule.detect(context);
        } else {
          throw new Error(`Unknown module type: ${module.type}`);
        }

        if (result.detected) {
          results.set(module.id, result);

          // If this module excludes other modules, add them to exclusions
          if (result.excludes && result.excludes.length > 0) {
            result.excludes.forEach(excludedId => {
              exclusions.add(excludedId);
            });
          }
        }
      } catch (error) {
        console.error(`Detection failed for module ${module.id}:`, error);
        this.emit('module:error', { module, error: error as Error });
      }
    });

    await Promise.all(detectionPromises);

    // Remove excluded modules from results
    if (exclusions.size > 0) {
      for (const excludedId of exclusions) {
        if (results.has(excludedId)) {
          const excludedResult = results.get(excludedId);
          results.delete(excludedId);
          console.log(`Module ${excludedId} excluded by higher-priority module (confidence: ${excludedResult?.confidence})`);
        }
      }
    }

    this.emit('detection:complete', { results, exclusions: Array.from(exclusions) });
    return results;
  }

  /**
   * Detect versions for detected frameworks/languages
   */
  async detectVersions(
    context: DetectionContext,
    detectionResults: Map<string, DetectionResult>
  ): Promise<Map<string, string>> {
    const versions = new Map<string, string>();

    const versionPromises = Array.from(detectionResults.keys()).map(async (moduleId) => {
      try {
        const module = this.getModule(moduleId);
        if (!module) return;

        let version: string | undefined;

        if (module.type === 'framework') {
          const frameworkModule = module as FrameworkModule;
          version = await frameworkModule.detectVersion(context);
        } else if (module.type === 'language') {
          const languageModule = module as LanguageModule;
          version = await languageModule.detectVersion(context);
        } else if (module.type === 'library') {
          const libraryModule = module as LibraryModule;
          version = await libraryModule.detectVersion(context);
        }

        if (version) {
          versions.set(moduleId, version);
        }
      } catch (error) {
        console.error(`Version detection failed for module ${moduleId}:`, error);
      }
    });

    await Promise.all(versionPromises);
    return versions;
  }

  /**
   * Get guideline paths from detected modules
   */
  async getGuidelinePaths(
    detectionResults: Map<string, DetectionResult>,
    versions: Map<string, string>
  ): Promise<GuidelinePath[]> {
    const allPaths: GuidelinePath[] = [];

    const guidelinePromises = Array.from(detectionResults.keys()).map(async (moduleId) => {
      try {
        const module = this.getModule(moduleId);
        if (!module) return;

        const version = versions.get(moduleId);
        let paths: GuidelinePath[] = [];

        if (module.type === 'framework') {
          const frameworkModule = module as FrameworkModule;
          paths = await frameworkModule.getGuidelinePaths(version);
        } else if (module.type === 'language') {
          const languageModule = module as LanguageModule;
          paths = await languageModule.getGuidelinePaths(version);
        } else if (module.type === 'library') {
          const libraryModule = module as LibraryModule;
          paths = await libraryModule.getGuidelinePaths(version);
        }

        allPaths.push(...paths);
      } catch (error) {
        console.error(`Failed to get guideline paths for module ${moduleId}:`, error);
      }
    });

    await Promise.all(guidelinePromises);

    // Sort by priority (higher priority types first)
    return allPaths.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
  }

  /**
   * Generate commands from framework modules
   */
  async generateCommands(
    context: ModuleContext,
    detectionResults: Map<string, DetectionResult>
  ): Promise<StackCommands> {
    const commands: StackCommands = {
      dev: [],
      build: [],
      test: [],
      lint: [],
      install: []
    };

    const frameworkModules = this.getModulesByType<FrameworkModule>('framework')
      .filter(module => detectionResults.has(module.id));

    const libraryModules = this.getModulesByType<LibraryModule>('library')
      .filter(module => detectionResults.has(module.id));

    const allModulesWithCommands = [...frameworkModules, ...libraryModules];

    const commandPromises = allModulesWithCommands.map(async (module) => {
      try {
        const moduleCommands = await module.generateCommands(context);

        // Merge commands
        if (moduleCommands.dev) commands.dev.push(...moduleCommands.dev);
        if (moduleCommands.build) commands.build.push(...moduleCommands.build);
        if (moduleCommands.test) commands.test.push(...moduleCommands.test);
        if (moduleCommands.lint) commands.lint.push(...moduleCommands.lint);
        if (moduleCommands.install) commands.install.push(...moduleCommands.install);
      } catch (error) {
        console.error(`Command generation failed for module ${module.id}:`, error);
      }
    });

    await Promise.all(commandPromises);
    return commands;
  }

  /**
   * Cleanup all modules
   */
  async cleanup(): Promise<void> {
    const cleanupPromises = Array.from(this.modules.values()).map(async (module) => {
      try {
        if (module.cleanup) {
          await module.cleanup();
        }
        this.emit('module:unloaded', { module });
      } catch (error) {
        console.error(`Cleanup failed for module ${module.id}:`, error);
        this.emit('module:error', { module, error: error as Error });
      }
    });

    await Promise.all(cleanupPromises);
    this.modules.clear();
    this.initialized = false;
  }

  /**
   * Check if manager is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get module statistics
   */
  getStats(): {
    total: number;
    loaded: number;
    frameworks: number;
    languages: number;
    libraries: number;
    enabled: number;
  } {
    const modules = this.getModules();

    return {
      total: this.registrations.size,
      loaded: modules.length,
      frameworks: modules.filter(m => m.type === 'framework').length,
      languages: modules.filter(m => m.type === 'language').length,
      libraries: modules.filter(m => m.type === 'library').length,
      enabled: Array.from(this.registrations.values()).filter(r => r.enabled).length
    };
  }

  /**
   * Convert priority type to numeric value for sorting
   */
  private getPriorityValue(priorityType: ModulePriorityType): number {
    switch (priorityType) {
      case 'meta-framework': return 85;
      case 'framework': return 75;
      case 'specialized-lang': return 65;
      case 'base-lang': return 55;
      default: return 0;
    }
  }
}