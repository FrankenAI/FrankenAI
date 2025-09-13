import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import type { DetectedStack } from './StackDetector.js';
import { ModuleManager } from './ModuleManager.js';
import { ModuleRegistry } from './ModuleRegistry.js';
import type { GuidelinePath, ModulePriorityType } from './types/Module.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface Guideline {
  id: string;
  path: string;
  content: string;
  category: 'framework' | 'language' | 'feature';
  priority: ModulePriorityType;
}

export interface GuidelineContext {
  phpVersion?: string;
  laravelVersion?: string;
  vueVersion?: string;
  reactVersion?: string;
  nextVersion?: string;
  nuxtVersion?: string;
  svelteVersion?: string;
  svelteKitVersion?: string;
  stack: DetectedStack;
}

export class GuidelineManager {
  private guidelinesPath: string;
  private moduleManager: ModuleManager;
  private moduleRegistry: ModuleRegistry;

  constructor() {
    // Path to the guidelines directory
    this.guidelinesPath = path.join(__dirname, '..', '..', 'src', 'guidelines');
    this.moduleManager = new ModuleManager();
    this.moduleRegistry = new ModuleRegistry();
  }

  /**
   * Clear all modules and registrations (useful for testing)
   */
  clear(): void {
    this.moduleManager.clear();
    this.moduleRegistry.clear();
  }

  /**
   * Initialize modules for guideline collection
   */
  private async initializeModules(): Promise<void> {
    await this.moduleRegistry.discoverModules();
    for (const registration of this.moduleRegistry.getEnabledRegistrations()) {
      this.moduleManager.register(registration);
    }
    await this.moduleManager.initialize();
  }

  /**
   * Collect all applicable guidelines based on the detected stack
   */
  async collectGuidelines(context: GuidelineContext): Promise<Guideline[]> {
    await this.initializeModules();

    const guidelines: Guideline[] = [];
    const modules = this.moduleManager.getModules();


    for (const module of modules) {
      // Check if this module matches the detected stack
      const moduleMetadata = module.getMetadata();
      const shouldInclude = this.shouldIncludeModule(module, context);


      if (shouldInclude) {
        // Get version for this module
        const version = this.getModuleVersion(module, context);


        // Get guideline paths from the module
        let guidelinePaths: GuidelinePath[] = [];
        if (module.type === 'framework') {
          const frameworkModule = module as any;
          guidelinePaths = await frameworkModule.getGuidelinePaths(version);
        } else if (module.type === 'language') {
          const languageModule = module as any;
          guidelinePaths = await languageModule.getGuidelinePaths(version);
        }


        // Load the actual guideline content
        for (const guidelinePath of guidelinePaths) {
          const guideline = await this.loadModuleGuideline(guidelinePath, module.id);
          if (guideline) {
            guidelines.push(guideline);
          }
        }
      }
    }

    return this.sortGuidelines(guidelines);
  }

  /**
   * Check if a module should be included based on the detected stack
   */
  private shouldIncludeModule(module: any, context: GuidelineContext): boolean {
    const metadata = module.getMetadata();
    const displayName = metadata.displayName;

    // Check frameworks
    if (module.type === 'framework') {
      return context.stack.frameworks.includes(displayName);
    }

    // Check languages
    if (module.type === 'language') {
      return context.stack.languages.includes(displayName);
    }

    return false;
  }

  /**
   * Get version for a specific module from context
   */
  private getModuleVersion(module: any, context: GuidelineContext): string | undefined {
    const moduleId = module.id.toLowerCase();

    switch (moduleId) {
      case 'laravel': return context.laravelVersion;
      case 'vue': return context.vueVersion;
      case 'react': return context.reactVersion;
      case 'next': return context.nextVersion;
      case 'nuxt': return context.nuxtVersion;
      case 'svelte': return context.svelteVersion;
      case 'sveltekit': return context.svelteKitVersion;
      case 'php': return context.phpVersion;
      default: return undefined;
    }
  }

  /**
   * Load a guideline from a module's guideline path
   */
  private async loadModuleGuideline(guidelinePath: GuidelinePath, moduleId: string): Promise<Guideline | null> {
    try {
      // Try loading from module directory first
      let fullPath = path.join(__dirname, '..', 'modules', moduleId, guidelinePath.path);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf-8');
        return {
          id: `${moduleId}-${guidelinePath.path.replace(/\//g, '-').replace('.md', '')}`,
          path: guidelinePath.path,
          content,
          category: guidelinePath.category,
          priority: guidelinePath.priority
        };
      }

      // Fallback to old guidelines directory
      fullPath = path.join(this.guidelinesPath, guidelinePath.path);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf-8');
        return {
          id: `${moduleId}-${guidelinePath.path.replace(/\//g, '-').replace('.md', '')}`,
          path: guidelinePath.path,
          content,
          category: guidelinePath.category,
          priority: guidelinePath.priority
        };
      }

      // Try without the module prefix in the path
      const pathWithoutModule = guidelinePath.path.replace(`${moduleId}/`, '');
      fullPath = path.join(__dirname, '..', 'modules', moduleId, pathWithoutModule);
      if (await fs.pathExists(fullPath)) {
        const content = await fs.readFile(fullPath, 'utf-8');
        return {
          id: `${moduleId}-${guidelinePath.path.replace(/\//g, '-').replace('.md', '')}`,
          path: guidelinePath.path,
          content,
          category: guidelinePath.category,
          priority: guidelinePath.priority
        };
      }
    } catch (error) {
      console.warn(`Failed to load guideline: ${guidelinePath.path}`, error);
    }
    return null;
  }

  /**
   * Sort guidelines by priority type
   */
  private sortGuidelines(guidelines: Guideline[]): Guideline[] {
    const priorityOrder: Record<ModulePriorityType, number> = {
      'meta-framework': 4,
      'framework': 3,
      'specialized-lang': 2,
      'base-lang': 1
    };

    return guidelines.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }


  /**
   * Extract major version from version string
   */
  private extractMajorVersion(version: string): string {
    // Handle versions like "^8.3.0", "~11.0", "8.3", etc.
    const match = version.match(/(\d+)\.?(\d+)?/);
    if (match) {
      return match[2] ? `${match[1]}.${match[2]}` : match[1];
    }
    return '';
  }


  /**
   * Generate the final CLAUDE.md content
   */
  generateClaudeContent(guidelines: Guideline[], context: GuidelineContext): string {
    const sections: string[] = [];

    // Add header
    sections.push('# FrankenAI Configuration\n');

    // Add stack information
    sections.push(this.generateStackSection(context));

    // Add commands section
    sections.push(this.generateCommandsSection(context));

    // Add workflow section BEFORE guidelines (as requested)
    sections.push(this.generateWorkflowSection());

    // Add guidelines by category
    const frameworkGuidelines = guidelines.filter(g => g.category === 'framework');
    const languageGuidelines = guidelines.filter(g => g.category === 'language');

    if (frameworkGuidelines.length > 0 || languageGuidelines.length > 0) {
      sections.push('[//]: # (franken-ai:guidelines:start)');

      // Add framework guidelines first
      for (const guideline of frameworkGuidelines) {
        sections.push(guideline.content);
      }

      // Add language guidelines
      for (const guideline of languageGuidelines) {
        sections.push(guideline.content);
      }

      sections.push('[//]: # (franken-ai:guidelines:end)');
    }

    return sections.join('\n\n');
  }

  /**
   * Generate stack information section
   */
  private generateStackSection(context: GuidelineContext): string {
    const lines: string[] = [];

    lines.push('[//]: # (franken-ai:stack:start)');
    lines.push(`## Detected Stack: ${context.stack.frameworks.join(', ') || 'Generic'}\n`);
    lines.push('### Project Information');

    if (context.stack.runtime) {
      lines.push(`- **Runtime**: ${context.stack.runtime}`);
    }

    if (context.stack.languages.length > 0) {
      lines.push(`- **Languages**: ${context.stack.languages.join(', ')}`);
    }

    if (context.stack.frameworks.length > 0) {
      lines.push(`- **Frameworks**: ${context.stack.frameworks.join(', ')}`);
    }

    if (context.laravelVersion) {
      lines.push(`- **Laravel Version**: ${context.laravelVersion}`);
    }

    if (context.phpVersion) {
      lines.push(`- **PHP Version**: ${context.phpVersion}`);
    }

    lines.push('[//]: # (franken-ai:stack:end)');

    return lines.join('\n');
  }

  /**
   * Generate commands section
   */
  private generateCommandsSection(context: GuidelineContext): string {
    const lines: string[] = [];

    lines.push('[//]: # (franken-ai:commands:start)');
    lines.push('## Commands\n');

    // Generate commands based on detected stack
    if (context.stack.frameworks.includes('Laravel')) {
      lines.push('### Development');
      lines.push('- `php artisan serve` - Start development server');
      lines.push('- `php artisan tinker` - Interactive REPL\n');

      lines.push('### Build');
      lines.push('- `npm run build` - Build assets for production');
      lines.push('- `npm run dev` - Build assets for development\n');

      lines.push('### Testing');
      lines.push('- `php artisan test` - Run tests');
      lines.push('- `vendor/bin/phpunit` - Run PHPUnit tests\n');

      lines.push('### Linting');
      lines.push('- `./vendor/bin/pint` - Run Laravel Pint (if installed)');
      lines.push('- `composer run lint` - Run linter\n');

      lines.push('### Package Management');
      lines.push('- `composer install` - Install PHP dependencies');
      lines.push('- `npm install` - Install Node.js dependencies\n');
    } else if (context.stack.frameworks.some(f => ['Next', 'Nuxt', 'Vue', 'React'].includes(f))) {
      // Frontend framework commands
      const packageManager = this.getPreferredPackageManager(context.stack.packageManagers);

      lines.push('### Development');
      lines.push(`- \`${packageManager} run dev\` - Start development server`);

      if (context.stack.frameworks.includes('Next') || context.stack.frameworks.includes('Nuxt')) {
        lines.push(`- \`${packageManager} run start\` - Start production server\n`);
      } else {
        lines.push('');
      }

      lines.push('### Build');
      lines.push(`- \`${packageManager} run build\` - Build for production`);

      if (context.stack.frameworks.includes('Next')) {
        lines.push(`- \`${packageManager} run export\` - Export static site\n`);
      } else if (context.stack.frameworks.includes('Nuxt')) {
        lines.push(`- \`${packageManager} run generate\` - Generate static site\n`);
      } else {
        lines.push('');
      }

      lines.push('### Testing');
      lines.push(`- \`${packageManager} run test\` - Run tests`);
      lines.push(`- \`${packageManager} run test:watch\` - Run tests in watch mode\n`);

      lines.push('### Linting');
      lines.push(`- \`${packageManager} run lint\` - Run linter`);
      lines.push(`- \`${packageManager} run lint:fix\` - Fix linting issues\n`);

      lines.push('### Package Management');
      lines.push(`- \`${packageManager} install\` - Install dependencies\n`);
    } else {
      // Generic commands based on detected package managers
      const packageManager = this.getPreferredPackageManager(context.stack.packageManagers);

      lines.push('### Development');
      lines.push(`- \`${packageManager} run dev\` - Start development server\n`);
      lines.push('### Build');
      lines.push(`- \`${packageManager} run build\` - Build for production\n`);
      lines.push('### Testing');
      lines.push(`- \`${packageManager} run test\` - Run tests\n`);
      lines.push('### Linting');
      lines.push(`- \`${packageManager} run lint\` - Run linter\n`);
      lines.push('### Package Management');
      lines.push(`- \`${packageManager} install\` - Install dependencies\n`);
    }

    lines.push('[//]: # (franken-ai:commands:end)');
    return lines.join('\n');
  }

  /**
   * Get preferred package manager from available ones
   */
  private getPreferredPackageManager(packageManagers: string[]): string {
    if (packageManagers.includes('bun')) return 'bun';
    if (packageManagers.includes('yarn')) return 'yarn';
    if (packageManagers.includes('pnpm')) return 'pnpm';
    return 'npm';
  }

  /**
   * Generate workflow status section
   */
  private generateWorkflowSection(): string {
    const lines: string[] = [];

    lines.push('[//]: # (franken-ai:workflow:start)');
    lines.push('## FrankenAI Workflow\n');
    lines.push('### Discovery Phase (Gemini CLI)');
    lines.push('Use for large-scale codebase analysis:\n');
    lines.push('```bash');
    lines.push('# Architecture overview');
    lines.push('gemini -p "@src/ @app/ What\'s the overall architecture?"\n');
    lines.push('# Feature verification');
    lines.push('gemini -p "@src/ Is user authentication implemented?"\n');
    lines.push('# Pattern detection');
    lines.push('gemini -p "@./ Show me all async functions with file locations"');
    lines.push('```\n');
    lines.push('### Implementation Phase (Claude Code)');
    lines.push('Use for precise development:\n');
    lines.push('- **File Editing**: Read/Write/Edit tools for code changes');
    lines.push('- **Framework Tools**: Use framework-specific commands');
    lines.push('- **Testing**: Run and debug tests');
    lines.push('- **Real-time Problem Solving**: Debug and validate implementations');
    lines.push('[//]: # (franken-ai:workflow:end)');

    return lines.join('\n');
  }

  /**
   * List all available guideline files (for debugging/info)
   */
  async listAvailableGuidelines(): Promise<string[]> {
    const guidelines: string[] = [];

    const walkDir = async (dir: string, prefix = ''): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          await walkDir(fullPath, relativePath);
        } else if (entry.name.endsWith('.md')) {
          guidelines.push(relativePath);
        }
      }
    };

    await walkDir(this.guidelinesPath);
    return guidelines;
  }
}