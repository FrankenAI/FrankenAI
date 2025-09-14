import type { DetectedStack, StackCommands } from '../StackDetector.js';

/**
 * Context provided to modules for detection
 */
export interface DetectionContext {
  projectRoot: string;
  configFiles: string[];
  packageJson?: any;
  composerJson?: any;
  files: string[];
}

/**
 * Result of module detection
 */
export interface DetectionResult {
  detected: boolean;
  confidence: number; // 0-1, higher means more confident
  evidence: string[]; // List of evidence found
  excludes?: string[]; // Module IDs to exclude if this module is detected
  metadata?: Record<string, any>;
}

/**
 * Path to guideline file with metadata
 */
export interface GuidelinePath {
  path: string;
  priority: ModulePriorityType;
  category: 'framework' | 'language' | 'feature' | 'testing';
  version?: string;
}

/**
 * Module metadata
 */
export interface ModuleMetadata {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author?: string;
  homepage?: string;
  keywords: string[];
  supportedVersions?: string[];
}

/**
 * Context provided to modules for operations
 */
export interface ModuleContext {
  projectRoot: string;
  detectedStack: DetectedStack;
  detectionResult: DetectionResult;
  version?: string;
  packageManager?: string;
}

/**
 * Module detection priority types
 */
export type ModulePriorityType =
  | 'meta-framework'    // Next.js, Nuxt, SvelteKit, Laravel
  | 'framework'         // React, Vue, Svelte
  | 'css-framework'     // Tailwind CSS, Bootstrap, Bulma
  | 'laravel-tool'      // Livewire, Inertia, Filament, etc.
  | 'specialized-lang'  // TypeScript, PHP
  | 'base-lang';        // JavaScript

/**
 * Base interface for all modules
 */
export interface Module {
  /**
   * Unique module identifier
   */
  readonly id: string;

  /**
   * Module type
   */
  readonly type: 'framework' | 'language' | 'library';

  /**
   * Module priority type for detection ordering
   */
  readonly priorityType: ModulePriorityType;

  /**
   * Get module metadata
   */
  getMetadata(): ModuleMetadata;

  /**
   * Initialize the module
   */
  initialize?(context: ModuleContext): Promise<void>;

  /**
   * Cleanup module resources
   */
  cleanup?(): Promise<void>;
}

/**
 * Framework module interface
 */
export interface FrameworkModule extends Module {
  readonly type: 'framework';

  /**
   * Detect if this framework is present in the project
   */
  detect(context: DetectionContext): Promise<DetectionResult>;

  /**
   * Detect the version of this framework
   */
  detectVersion(context: DetectionContext): Promise<string | undefined>;

  /**
   * Get guideline paths for this framework
   */
  getGuidelinePaths(version?: string): Promise<GuidelinePath[]>;

  /**
   * Generate framework-specific commands
   */
  generateCommands(context: ModuleContext): Promise<Partial<StackCommands>>;

  /**
   * Get supported file extensions
   */
  getSupportedExtensions?(): string[];

  /**
   * Get framework-specific configuration files
   */
  getConfigFiles?(): string[];
}

/**
 * Library module interface (CSS frameworks, utility libraries)
 */
export interface LibraryModule extends Module {
  readonly type: 'library';

  /**
   * Detect if this library is present in the project
   */
  detect(context: DetectionContext): Promise<DetectionResult>;

  /**
   * Detect the version of this library
   */
  detectVersion(context: DetectionContext): Promise<string | undefined>;

  /**
   * Get guideline paths for this library
   */
  getGuidelinePaths(version?: string): Promise<GuidelinePath[]>;

  /**
   * Generate library-specific commands
   */
  generateCommands(context: ModuleContext): Promise<Partial<StackCommands>>;

  /**
   * Get supported file extensions
   */
  getSupportedExtensions?(): string[];

  /**
   * Get library-specific configuration files
   */
  getConfigFiles?(): string[];
}

/**
 * Language module interface
 */
export interface LanguageModule extends Module {
  readonly type: 'language';

  /**
   * Detect if this language is present in the project
   */
  detect(context: DetectionContext): Promise<DetectionResult>;

  /**
   * Detect the version of this language
   */
  detectVersion(context: DetectionContext): Promise<string | undefined>;

  /**
   * Get guideline paths for this language
   */
  getGuidelinePaths(version?: string): Promise<GuidelinePath[]>;

  /**
   * Get supported file extensions for this language
   */
  getSupportedExtensions(): string[];

  /**
   * Get language runtime information
   */
  getRuntime?(): string;
}

/**
 * Module factory function
 */
export type ModuleFactory = () => Module | Promise<Module>;

/**
 * Module registration info
 */
export interface ModuleRegistration {
  id: string;
  factory: ModuleFactory;
  enabled: boolean;
  config?: Record<string, any>;
}

/**
 * Module event types
 */
export interface ModuleEvents {
  'module:loaded': { module: Module };
  'module:unloaded': { module: Module };
  'module:error': { module: Module; error: Error };
  'detection:start': { context: DetectionContext };
  'detection:complete': { results: Map<string, DetectionResult> };
}

/**
 * Module configuration
 */
export interface ModuleConfig {
  enabled?: boolean;
  priorityType?: ModulePriorityType;
  settings?: Record<string, any>;
}

/**
 * Module loader interface
 */
export interface ModuleLoader {
  /**
   * Load a module from a file or module
   */
  load(path: string): Promise<Module>;

  /**
   * Check if a module can be loaded
   */
  canLoad(path: string): boolean;

  /**
   * Get supported file extensions for module files
   */
  getSupportedExtensions(): string[];
}

/**
 * Module validation result
 */
export interface ModuleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Module validator
 */
export interface ModuleValidator {
  /**
   * Validate a module
   */
  validate(module: Module): ModuleValidationResult;
}