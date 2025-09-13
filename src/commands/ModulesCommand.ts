import { Command } from 'commander';
import chalk from 'chalk';
import { ModuleManager } from '../core/ModuleManager.js';
import { ModuleRegistry } from '../core/ModuleRegistry.js';
import type { ModuleMetadata, ModulePriorityType } from '../core/types/Module.js';
import type { BaseCommand, CommandSignature } from '../core/types/Command.js';

export interface ModulesCommandOptions {
  detailed?: boolean;
  enabled?: boolean;
  disabled?: boolean;
  type?: 'framework' | 'language';
  format?: 'table' | 'list' | 'json';
}

export class ModulesCommand implements BaseCommand {
  private moduleManager: ModuleManager;
  private moduleRegistry: ModuleRegistry;

  constructor() {
    this.moduleManager = new ModuleManager();
    this.moduleRegistry = new ModuleRegistry();
  }

  /**
   * Get command signature metadata
   */
  getSignature(): CommandSignature {
    return {
      name: 'modules',
      alias: 'mod',
      description: 'List available modules',
      category: 'Module Management',
      usage: [
        'franken-ai modules',
        'franken-ai modules --detailed',
        'franken-ai modules --type framework',
        'franken-ai modules --enabled --format json'
      ],
      options: [
        {
          flags: '-d, --detailed',
          description: 'Show detailed information for each module'
        },
        {
          flags: '--enabled',
          description: 'Show only enabled modules'
        },
        {
          flags: '--disabled',
          description: 'Show only disabled modules'
        },
        {
          flags: '-t, --type <type>',
          description: 'Filter by module type (framework|language)'
        },
        {
          flags: '-f, --format <format>',
          description: 'Output format (table|list|json)',
          defaultValue: 'table'
        }
      ],
      help: `The modules command displays all available FrankenAI modules in your project.

Modules are automatically discovered and can be frameworks (React, Vue.js, Laravel)
or languages (JavaScript, TypeScript, PHP). Use filtering options to find specific
modules or get detailed information about their configuration.

Examples:
  franken-ai modules                    # Show all modules in table format
  franken-ai modules -d                 # Show detailed module information
  franken-ai modules --type framework   # Show only framework modules
  franken-ai modules --enabled -f json  # Show enabled modules as JSON
  franken-ai mod --disabled             # Show disabled modules (using alias)

Output formats:
  table - Clean tabular display (default)
  list  - Detailed list with descriptions
  json  - Machine-readable JSON format`
    };
  }

  /**
   * Configure the command
   */
  configure(program: Command): void {
    program
      .command('modules')
      .alias('mod')
      .description('List available modules')
      .option('-d, --detailed', 'Show detailed information for each module')
      .option('--enabled', 'Show only enabled modules')
      .option('--disabled', 'Show only disabled modules')
      .option('-t, --type <type>', 'Filter by module type (framework|language)')
      .option('-f, --format <format>', 'Output format (table|list|json)', 'table')
      .action((options: ModulesCommandOptions) => this.execute(options));
  }

  /**
   * Execute the modules command
   */
  async execute(options: ModulesCommandOptions): Promise<void> {
    try {
      // Initialize module registry
      await this.initializeModules();

      // Get modules based on filters
      const modules = await this.getFilteredModules(options);

      if (modules.length === 0) {
        console.log(chalk.yellow('No modules found matching the specified criteria.'));
        return;
      }

      // Output in requested format
      switch (options.format) {
        case 'json':
          await this.outputJson(modules, options);
          break;
        case 'list':
          await this.outputList(modules, options);
          break;
        case 'table':
        default:
          await this.outputTable(modules, options);
          break;
      }

    } catch (error) {
      console.error(chalk.red('Error listing modules:'), error);
      process.exit(1);
    }
  }

  /**
   * Initialize module registry and manager
   */
  private async initializeModules(): Promise<void> {
    await this.moduleRegistry.discoverModules();

    for (const registration of this.moduleRegistry.getEnabledRegistrations()) {
      this.moduleManager.register(registration);
    }

    await this.moduleManager.initialize();
  }

  /**
   * Get modules based on filter options
   */
  private async getFilteredModules(options: ModulesCommandOptions): Promise<ModuleInfo[]> {
    const allRegistrations = this.moduleRegistry.getAllRegistrations();
    const moduleInfos: ModuleInfo[] = [];

    for (const registration of allRegistrations) {
      // Apply enabled/disabled filter
      if (options.enabled && !registration.enabled) continue;
      if (options.disabled && registration.enabled) continue;

      let metadata: ModuleMetadata | undefined;
      let moduleType: 'framework' | 'language' | undefined;
      let priority: ModulePriorityType = 'low';

      // Try to get metadata from loaded module
      try {
        const module = this.moduleManager.getModule(registration.id);
        if (module) {
          metadata = module.getMetadata();
          moduleType = module.type;
          priority = module.priority;
        } else if (registration.enabled) {
          // Try to load the module to get metadata
          const moduleInstance = registration.factory();
          metadata = moduleInstance.getMetadata();
          moduleType = moduleInstance.type;
          priority = moduleInstance.priority;
        }
      } catch (error) {
        // Module failed to load, create minimal info
        metadata = {
          name: registration.id,
          displayName: registration.id,
          description: 'Failed to load module',
          version: 'unknown',
          author: 'unknown',
          keywords: [],
          supportedVersions: []
        };
      }

      // Apply type filter
      if (options.type && moduleType !== options.type) continue;

      const moduleInfo: ModuleInfo = {
        id: registration.id,
        enabled: registration.enabled,
        type: moduleType || 'unknown',
        priority: priority,
        metadata: metadata || {
          name: registration.id,
          displayName: registration.id,
          description: 'No metadata available',
          version: 'unknown',
          author: 'unknown',
          keywords: [],
          supportedVersions: []
        },
        config: registration.config
      };

      moduleInfos.push(moduleInfo);
    }

    return this.sortModules(moduleInfos);
  }

  /**
   * Sort modules by loading priority, then type, then alphabetically
   */
  private sortModules(modules: ModuleInfo[]): ModuleInfo[] {
    return modules.sort((a, b) => {
      // 1. Sort by loading priority (high -> medium -> low)
      const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
      const aPriorityValue = priorityOrder[a.priority || 'low'];
      const bPriorityValue = priorityOrder[b.priority || 'low'];

      if (aPriorityValue !== bPriorityValue) {
        return aPriorityValue - bPriorityValue;
      }

      // 2. Sort by type (frameworks before languages)
      const typeOrder = { 'framework': 0, 'language': 1, 'unknown': 2 };
      const aTypeValue = typeOrder[a.type as keyof typeof typeOrder] || 2;
      const bTypeValue = typeOrder[b.type as keyof typeof typeOrder] || 2;

      if (aTypeValue !== bTypeValue) {
        return aTypeValue - bTypeValue;
      }

      // 3. Sort alphabetically by display name
      return a.metadata.displayName.localeCompare(b.metadata.displayName);
    });
  }

  /**
   * Output modules as a table
   */
  private async outputTable(modules: ModuleInfo[], options: ModulesCommandOptions): Promise<void> {
    console.log(chalk.bold('\nAvailable Modules'));
    console.log();

    if (modules.length === 0) {
      console.log('No modules available');
      return;
    }

    // Prepare table data
    const tableData = modules.map(module => {
      if (options.detailed) {
        return {
          'Name': module.metadata.displayName,
          'Type': this.getTypeString(module.type),
          'Status': module.enabled ? 'Enabled' : 'Disabled',
          'Priority': (module.priority || 'low').charAt(0).toUpperCase() + (module.priority || 'low').slice(1),
          'Version': module.metadata.version || 'unknown',
          'Description': (module.metadata.description || '').length > 50
            ? (module.metadata.description || '').substring(0, 47) + '...'
            : (module.metadata.description || '')
        };
      } else {
        return {
          'Name': module.metadata.displayName,
          'Type': this.getTypeString(module.type),
          'Status': module.enabled ? 'Enabled' : 'Disabled',
          'Version': module.metadata.version || 'unknown'
        };
      }
    });

    // Use console.table for clean, consistent formatting
    console.table(tableData);

    // Summary
    this.displaySummary(modules);
  }

  /**
   * Display summary statistics
   */
  private displaySummary(modules: ModuleInfo[]): void {
    const enabledCount = modules.filter(m => m.enabled).length;
    const frameworkCount = modules.filter(m => m.type === 'framework').length;
    const languageCount = modules.filter(m => m.type === 'language').length;
    const highPriorityCount = modules.filter(m => (m.priority || 'low') === 'high').length;

    console.log(`\n${chalk.bold('Summary:')}`);
    console.log(`  ${chalk.green('●')} ${enabledCount}/${modules.length} modules enabled`);
    console.log(`  ${chalk.blue('●')} ${frameworkCount} frameworks, ${chalk.cyan(languageCount)} languages`);
    if (highPriorityCount > 0) {
      console.log(`  ${chalk.yellow('●')} ${highPriorityCount} high priority modules`);
    }
  }

  /**
   * Get plain string representation of module type (without colors)
   */
  private getTypeString(type: string): string {
    switch (type) {
      case 'framework':
        return 'Framework';
      case 'language':
        return 'Language';
      default:
        return 'Unknown';
    }
  }

  /**
   * Output modules as a list
   */
  private async outputList(modules: ModuleInfo[], options: ModulesCommandOptions): Promise<void> {
    console.log(chalk.bold('\nAvailable Modules'));
    console.log();

    if (modules.length === 0) {
      console.log('No modules available');
      return;
    }

    for (const [index, module] of modules.entries()) {
      const statusIcon = module.enabled ? chalk.green('●') : chalk.gray('○');
      const priority = module.priority || 'low';
      const priorityText = priority === 'high' ? chalk.yellow(' [HIGH]') :
                          priority === 'medium' ? chalk.blue(' [MED]') : '';

      console.log(`${statusIcon} ${chalk.bold(module.metadata.displayName)}${priorityText}`);

      if (options.detailed) {
        console.log(`    ${chalk.dim('ID:')} ${module.id}`);
        console.log(`    ${chalk.dim('Type:')} ${this.getTypeString(module.type)}`);
        console.log(`    ${chalk.dim('Priority:')} ${module.priority || 'low'}`);
        console.log(`    ${chalk.dim('Version:')} ${module.metadata.version || 'unknown'}`);
        console.log(`    ${chalk.dim('Author:')} ${module.metadata.author || 'unknown'}`);

        if (module.metadata.description) {
          console.log(`    ${chalk.dim('Description:')} ${module.metadata.description}`);
        }

        if (module.metadata.keywords && module.metadata.keywords.length > 0) {
          console.log(`    ${chalk.dim('Keywords:')} ${module.metadata.keywords.join(', ')}`);
        }

        if (module.metadata.supportedVersions && module.metadata.supportedVersions.length > 0) {
          console.log(`    ${chalk.dim('Supported Versions:')} ${module.metadata.supportedVersions.join(', ')}`);
        }

        if (module.config && Object.keys(module.config).length > 0) {
          console.log(`    ${chalk.dim('Config:')} ${JSON.stringify(module.config, null, 4).replace(/\n/g, '\n    ')}`);
        }
      } else {
        const typeLabel = chalk.dim(`[${this.getTypeString(module.type)}]`);
        const description = module.metadata.description || 'No description available';
        console.log(`    ${typeLabel} ${chalk.dim(description)}`);
      }

      if (index < modules.length - 1) {
        console.log();
      }
    }

    // Summary
    this.displaySummary(modules);
  }

  /**
   * Output modules as JSON
   */
  private async outputJson(modules: ModuleInfo[], options: ModulesCommandOptions): Promise<void> {
    const output = {
      modules: modules.map(module => ({
        id: module.id,
        enabled: module.enabled,
        type: module.type,
        priority: module.priority || 'low',
        metadata: module.metadata,
        ...(options.detailed && module.config ? { config: module.config } : {})
      })),
      summary: {
        total: modules.length,
        enabled: modules.filter(m => m.enabled).length,
        disabled: modules.filter(m => !m.enabled).length,
        byType: {
          frameworks: modules.filter(m => m.type === 'framework').length,
          languages: modules.filter(m => m.type === 'language').length,
          unknown: modules.filter(m => m.type === 'unknown').length
        },
        byPriority: {
          high: modules.filter(m => (m.priority || 'low') === 'high').length,
          medium: modules.filter(m => (m.priority || 'low') === 'medium').length,
          low: modules.filter(m => (m.priority || 'low') === 'low').length
        }
      }
    };

    console.log(JSON.stringify(output, null, 2));
  }

  /**
   * Format module type for display
   */
  private formatType(type: string): string {
    switch (type) {
      case 'framework':
        return chalk.blue('Framework');
      case 'language':
        return chalk.cyan('Language');
      default:
        return chalk.gray('Unknown');
    }
  }

  /**
   * Format module status for display
   */
  private formatStatus(enabled: boolean): string {
    return enabled ? chalk.green('Enabled') : chalk.red('Disabled');
  }
}

interface ModuleInfo {
  id: string;
  enabled: boolean;
  type: 'framework' | 'language' | 'unknown';
  priority?: ModulePriorityType;
  metadata: ModuleMetadata;
  config?: any;
}