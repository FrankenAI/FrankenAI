import type { BaseCommand, CommandSignature } from './types/Command.js';
import chalk from 'chalk';

/**
 * Central registry for all FrankenAI commands
 * Provides discovery, registration, and metadata access like Laravel's Artisan
 */
export class CommandRegistry {
  private commands: Map<string, BaseCommand> = new Map();
  private signatures: Map<string, CommandSignature> = new Map();

  /**
   * Register a command with the registry
   */
  register(command: BaseCommand): void {
    const signature = command.getSignature();
    this.commands.set(signature.name, command);
    this.signatures.set(signature.name, signature);

    // Also register alias if available
    if (signature.alias) {
      this.commands.set(signature.alias, command);
      this.signatures.set(signature.alias, signature);
    }
  }

  /**
   * Get a command by name or alias
   */
  get(name: string): BaseCommand | undefined {
    return this.commands.get(name);
  }

  /**
   * Get command signature by name or alias
   */
  getSignature(name: string): CommandSignature | undefined {
    return this.signatures.get(name);
  }

  /**
   * Get all registered commands (excluding aliases)
   */
  getAllCommands(): BaseCommand[] {
    const uniqueCommands: BaseCommand[] = [];
    const seen = new Set<string>();

    for (const [name, command] of this.commands.entries()) {
      const signature = command.getSignature();
      if (signature.name === name && !seen.has(signature.name)) {
        uniqueCommands.push(command);
        seen.add(signature.name);
      }
    }

    return uniqueCommands;
  }

  /**
   * Get all command signatures (excluding aliases)
   */
  getAllSignatures(): CommandSignature[] {
    return this.getAllCommands().map(cmd => cmd.getSignature());
  }

  /**
   * Get commands grouped by category
   */
  getCommandsByCategory(): Record<string, CommandSignature[]> {
    const signatures = this.getAllSignatures();
    const byCategory: Record<string, CommandSignature[]> = {};

    signatures.forEach(signature => {
      const category = signature.category || 'General';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(signature);
    });

    // Sort commands within each category
    Object.keys(byCategory).forEach(category => {
      byCategory[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return byCategory;
  }

  /**
   * Check if a command exists
   */
  has(name: string): boolean {
    return this.commands.has(name);
  }

  /**
   * Get command count
   */
  count(): number {
    return this.getAllCommands().length;
  }

  /**
   * Display formatted command list
   */
  displayList(): void {
    const categories = this.getCommandsByCategory();
    const categoryOrder = ['Setup', 'Module Management', 'General'];

    console.log(chalk.bold('\nAvailable Commands'));
    console.log();

    // Display categories in preferred order, then remaining
    const processedCategories = new Set<string>();

    categoryOrder.forEach(categoryName => {
      if (categories[categoryName]) {
        this.displayCategory(categoryName, categories[categoryName]);
        processedCategories.add(categoryName);
      }
    });

    // Display remaining categories
    Object.keys(categories).forEach(categoryName => {
      if (!processedCategories.has(categoryName)) {
        this.displayCategory(categoryName, categories[categoryName]);
      }
    });

    this.displaySummary();
  }

  /**
   * Display commands in a specific category
   */
  private displayCategory(categoryName: string, commands: CommandSignature[]): void {
    console.log(chalk.blue.bold(categoryName));

    commands.forEach(signature => {
      const nameDisplay = signature.alias
        ? `${signature.name} (${signature.alias})`
        : signature.name;

      console.log(`  ${chalk.green(nameDisplay.padEnd(20))} ${signature.description}`);
    });

    console.log();
  }

  /**
   * Display registry summary
   */
  private displaySummary(): void {
    const totalCommands = this.count();
    const totalCategories = Object.keys(this.getCommandsByCategory()).length;

    console.log(chalk.dim(`Total: ${totalCommands} commands across ${totalCategories} categories`));
    console.log();
    console.log(chalk.dim('Use --help with any command for detailed information:'));
    console.log(chalk.dim('  franken-ai <command> --help'));
  }

  /**
   * Display detailed help for all commands
   */
  displayDetailedHelp(): void {
    const categories = this.getCommandsByCategory();

    console.log(chalk.bold('\nFrankenAI Command Reference'));
    console.log(chalk.dim('Multi-headed AI development assistant'));
    console.log();

    Object.entries(categories).forEach(([categoryName, commands]) => {
      console.log(chalk.blue.bold(`${categoryName} Commands`));
      console.log(chalk.blue('═'.repeat(`${categoryName} Commands`.length)));
      console.log();

      commands.forEach(signature => {
        this.displayCommandHelp(signature);
        console.log();
      });
    });
  }

  /**
   * Display detailed help for a specific command
   */
  private displayCommandHelp(signature: CommandSignature): void {
    const nameDisplay = signature.alias
      ? `${signature.name} (${signature.alias})`
      : signature.name;

    console.log(chalk.green.bold(nameDisplay));
    console.log(chalk.dim(signature.description));

    if (signature.usage && signature.usage.length > 0) {
      console.log();
      console.log(chalk.cyan('Usage:'));
      signature.usage.forEach(usage => {
        console.log(chalk.dim(`  ${usage}`));
      });
    }

    if (signature.options && signature.options.length > 0) {
      console.log();
      console.log(chalk.cyan('Options:'));
      signature.options.forEach(option => {
        const flagsPadded = option.flags.padEnd(25);
        console.log(chalk.dim(`  ${flagsPadded} ${option.description}`));
        if (option.defaultValue !== undefined) {
          console.log(chalk.dim(`  ${' '.repeat(27)} (default: ${option.defaultValue})`));
        }
      });
    }

    if (signature.help) {
      console.log();
      console.log(chalk.cyan('Details:'));
      signature.help.split('\n').forEach(line => {
        console.log(chalk.dim(`  ${line}`));
      });
    }
  }
}