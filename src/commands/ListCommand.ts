import type { Command } from 'commander';
import type { BaseCommand, CommandSignature } from '../core/types/Command.js';
import { CommandRegistry } from '../core/CommandRegistry.js';

export interface ListCommandOptions {
  detailed?: boolean;
  category?: string;
  help?: boolean;
}

export class ListCommand implements BaseCommand {
  private commandRegistry: CommandRegistry;

  constructor(commandRegistry: CommandRegistry) {
    this.commandRegistry = commandRegistry;
  }

  /**
   * Get command signature metadata
   */
  getSignature(): CommandSignature {
    return {
      name: 'list',
      alias: 'ls',
      description: 'List all available FrankenAI commands',
      category: 'General',
      usage: [
        'franken-ai list',
        'franken-ai list --detailed',
        'franken-ai list --category "Setup"',
        'franken-ai ls --help'
      ],
      options: [
        {
          flags: '-d, --detailed',
          description: 'Show detailed information for each command including usage and options'
        },
        {
          flags: '-c, --category <category>',
          description: 'Filter commands by category (Setup, Module Management, General)'
        },
        {
          flags: '--help-all',
          description: 'Show comprehensive help for all commands'
        }
      ],
      help: `List all available FrankenAI commands with their descriptions and usage.

This command provides a comprehensive overview of all available commands in the
FrankenAI toolkit, organized by category for easy discovery.

Command categories:
  Setup             - Initialize and configure FrankenAI
  Module Management - Work with detected framework/language modules
  General           - Utility and information commands

The output format shows:
  command (alias)   Description of what the command does

Use --detailed to see full usage examples and option details for each command.
Use --category to filter to specific command categories.
Use --help-all to see comprehensive help documentation for all commands.

Examples:
  franken-ai list                      # Show all commands
  franken-ai list --detailed           # Show commands with usage examples
  franken-ai list --category Setup     # Show only setup commands
  franken-ai ls                        # Using alias
  franken-ai list --help-all           # Comprehensive help for all commands`
    };
  }

  /**
   * Configure the command
   */
  configure(program: Command): void {
    const signature = this.getSignature();

    const cmd = program
      .command(signature.name)
      .alias(signature.alias!)
      .description(signature.description);

    // Add options from signature
    signature.options?.forEach(opt => {
      cmd.option(opt.flags, opt.description, opt.defaultValue);
    });

    cmd.action((options: ListCommandOptions) => this.execute(options));
  }

  /**
   * Execute the list command
   */
  async execute(options: ListCommandOptions): Promise<void> {
    try {
      if (options.help) {
        this.commandRegistry.displayDetailedHelp();
        return;
      }

      if (options.detailed || options.category) {
        await this.showDetailedList(options);
      } else {
        this.commandRegistry.displayList();
      }
    } catch (error) {
      console.error('Error listing commands:', error);
      process.exit(1);
    }
  }

  /**
   * Show detailed command listing
   */
  private async showDetailedList(options: ListCommandOptions): Promise<void> {
    const categories = this.commandRegistry.getCommandsByCategory();

    if (options.category) {
      // Filter by specific category
      const categoryCommands = categories[options.category];
      if (!categoryCommands) {
        console.log(`No commands found in category "${options.category}"`);
        console.log(`Available categories: ${Object.keys(categories).join(', ')}`);
        return;
      }

      console.log(`\n${options.category} Commands\n`);
      categoryCommands.forEach(signature => {
        this.displayCommandDetails(signature);
        console.log();
      });
    } else {
      // Show all categories with details
      this.commandRegistry.displayDetailedHelp();
    }
  }

  /**
   * Display detailed information for a single command
   */
  private displayCommandDetails(signature: CommandSignature): void {
    const nameDisplay = signature.alias
      ? `${signature.name} (${signature.alias})`
      : signature.name;

    console.log(`${nameDisplay}`);
    console.log(`  Description: ${signature.description}`);

    if (signature.usage && signature.usage.length > 0) {
      console.log(`  Usage:`);
      signature.usage.forEach(usage => {
        console.log(`    ${usage}`);
      });
    }

    if (signature.options && signature.options.length > 0) {
      console.log(`  Options:`);
      signature.options.forEach(option => {
        console.log(`    ${option.flags.padEnd(20)} ${option.description}`);
      });
    }
  }
}