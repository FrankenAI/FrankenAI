import chalk from 'chalk';
import Table from 'cli-table3';
import { StackDetector } from '../core/StackDetector.js';
import type { BaseCommand, CommandSignature } from '../core/types/Command.js';
import type { Command } from 'commander';

export interface DetectOptions {
  verbose?: boolean;
  json?: boolean;
}

export class DetectCommand implements BaseCommand {
  /**
   * Get command signature metadata
   */
  getSignature(): CommandSignature {
    return {
      name: 'detect',
      description: 'Detect and display project stack without writing files',
      category: 'General',
      usage: [
        'franken-ai detect',
        'franken-ai detect --verbose',
        'franken-ai detect --json'
      ],
      options: [
        {
          flags: '-v, --verbose',
          description: 'Show detailed detection information'
        },
        {
          flags: '--json',
          description: 'Output in JSON format'
        }
      ],
      help: `The detect command scans your project and displays what frameworks,
languages, and tools are detected without creating or modifying any files.

This is useful to:
- See what FrankenAI will detect before running 'init'
- Debug detection issues
- Get project stack information for documentation

Examples:
  franken-ai detect           # Basic detection output
  franken-ai detect -v        # Show config files and evidence
  franken-ai detect --json    # JSON output for scripts`
    };
  }

  /**
   * Configure the command
   */
  configure(program: Command): void {
    program
      .command('detect')
      .description('Detect and display project stack without writing files')
      .option('-v, --verbose', 'Show detailed detection information')
      .option('--json', 'Output in JSON format')
      .action((options: DetectOptions) => this.execute(options));
  }

  /**
   * Execute the detect command
   */
  async execute(options: DetectOptions): Promise<void> {
    try {
      console.log(chalk.bold('🔍 Detecting Project Stack...'));
      console.log();

      const stackDetector = new StackDetector();
      const detectedStack = await stackDetector.detect();

      // Check for Laravel Boost and display warning
      if (detectedStack.frameworks && detectedStack.frameworks.includes('laravel-boost')) {
        this.displayBoostWarning();
      }

      if (options.json) {
        console.log(JSON.stringify(detectedStack, null, 2));
        return;
      }

      await this.displayStack(detectedStack, options.verbose || false);

    } catch (error) {
      console.error(chalk.red('Error detecting stack:'), error);
      process.exit(1);
    }
  }

  /**
   * Display detected stack in a readable format
   */
  private async displayStack(stack: any, verbose: boolean): Promise<void> {
    // Main stack information
    console.log(chalk.bold('📊 Detected Stack'));

    const stackTable = new Table({
      head: ['Component', 'Details'],
      style: {
        head: ['cyan'],
        border: ['grey']
      }
    });

    stackTable.push(['Runtime', stack.runtime || 'generic']);

    if (stack.frameworks && stack.frameworks.length > 0) {
      stackTable.push(['Frameworks', stack.frameworks.join(', ')]);
    }

    if (stack.languages && stack.languages.length > 0) {
      stackTable.push(['Languages', stack.languages.join(', ')]);
    }

    if (stack.packageManagers && stack.packageManagers.length > 0) {
      stackTable.push(['Package Managers', stack.packageManagers.join(', ')]);
    }

    console.log(stackTable.toString());
    console.log();

    // Commands available
    if (stack.commands && this.hasCommands(stack.commands)) {
      console.log(chalk.bold('🚀 Available Commands'));

      const commandsTable = new Table({
        head: ['Type', 'Commands'],
        style: {
          head: ['cyan'],
          border: ['grey']
        }
      });

      if (stack.commands.dev && stack.commands.dev.length > 0) {
        commandsTable.push(['Development', stack.commands.dev.slice(0, 3).join(', ') +
                           (stack.commands.dev.length > 3 ? ` (+${stack.commands.dev.length - 3} more)` : '')]);
      }

      if (stack.commands.build && stack.commands.build.length > 0) {
        commandsTable.push(['Build', stack.commands.build.slice(0, 3).join(', ') +
                           (stack.commands.build.length > 3 ? ` (+${stack.commands.build.length - 3} more)` : '')]);
      }

      if (stack.commands.test && stack.commands.test.length > 0) {
        commandsTable.push(['Test', stack.commands.test.slice(0, 3).join(', ') +
                           (stack.commands.test.length > 3 ? ` (+${stack.commands.test.length - 3} more)` : '')]);
      }

      if (stack.commands.lint && stack.commands.lint.length > 0) {
        commandsTable.push(['Lint', stack.commands.lint.slice(0, 3).join(', ') +
                           (stack.commands.lint.length > 3 ? ` (+${stack.commands.lint.length - 3} more)` : '')]);
      }

      console.log(commandsTable.toString());
      console.log();
    }

    // Verbose information
    if (verbose) {
      console.log(chalk.bold('📁 Project Details'));

      const detailsTable = new Table({
        head: ['Item', 'Details'],
        style: {
          head: ['cyan'],
          border: ['grey']
        }
      });

      if (stack.configFiles && stack.configFiles.length > 0) {
        const configFiles = stack.configFiles.slice(0, 10).join(', ') +
                           (stack.configFiles.length > 10 ? ` (+${stack.configFiles.length - 10} more)` : '');
        detailsTable.push(['Config Files', configFiles]);
      }

      detailsTable.push(['Project Root', process.cwd()]);
      detailsTable.push(['Detection Time', new Date().toLocaleTimeString()]);

      console.log(detailsTable.toString());
      console.log();
    }

    // Summary
    console.log(chalk.bold('📋 Summary'));
    const frameworkCount = stack.frameworks ? stack.frameworks.length : 0;
    const languageCount = stack.languages ? stack.languages.length : 0;
    const pmCount = stack.packageManagers ? stack.packageManagers.length : 0;

    console.log(`   ${frameworkCount} framework(s), ${languageCount} language(s), ${pmCount} package manager(s)`);
    console.log(`   Runtime: ${stack.runtime || 'generic'}`);

    if (frameworkCount === 0 && languageCount === 0) {
      console.log(chalk.yellow('\n   ⚠️  No specific frameworks or languages detected'));
      console.log(chalk.dim('   Make sure package.json, composer.json, or other config files are present'));
    } else {
      console.log(chalk.green('\n   ✅ Stack detection successful'));
    }
  }

  /**
   * Display Laravel Boost priority warning
   */
  private displayBoostWarning(): void {
    console.log(chalk.yellow.bold('⚠️  ATTENTION: Laravel Boost Detected'));
    console.log(chalk.yellow('   Laravel Boost has been detected in this project. For optimization'));
    console.log(chalk.yellow('   purposes, Laravel Boost will take precedence over individual Laravel'));
    console.log(chalk.yellow('   tools to avoid conflicts and ensure methodology consistency.'));
    console.log(chalk.yellow('   The following modules have been automatically excluded:'));
    console.log(chalk.dim('   • Laravel, Tailwind, Livewire, Volt, Pennant, Folio, Pest, Pint, FluxUI'));
    console.log();
  }

  /**
   * Check if stack has any commands
   */
  private hasCommands(commands: any): boolean {
    return commands &&
      ((commands.dev && commands.dev.length > 0) ||
       (commands.build && commands.build.length > 0) ||
       (commands.test && commands.test.length > 0) ||
       (commands.lint && commands.lint.length > 0));
  }
}