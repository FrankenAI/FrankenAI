#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { InitCommand } from './commands/InitCommand.js';

const program = new Command();

program
  .name('franken-ai')
  .description('🧟 Multi-headed AI development assistant combining Claude Code + Gemini CLI')
  .version('0.1.0');

// Init command - main entry point
program
  .command('init')
  .description('🚀 Initialize FrankenAI in current project')
  .option('--docs', 'Synthesize framework documentation')
  .option('-f, --force', 'Force overwrite existing CLAUDE.md without asking')
  .option('--safe', 'Stop if CLAUDE.md already exists (no overwrite)')
  .option('-v, --verbose', 'Show detailed output')
  .option('-q, --quiet', 'Minimal output (errors and warnings only)')
  .option('--silent', 'No output except prompts')
  .option('-y, --yes', 'Auto-accept all prompts')
  .option('--no-interaction', 'Non-interactive mode (fail if input needed)')
  .action(async (options) => {
    try {
      const initCommand = new InitCommand();
      await initCommand.execute(options);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Update command - regenerate sections
program
  .command('update [section]')
  .description('🔄 Update specific sections in CLAUDE.md')
  .option('-f, --force', 'Force update without confirmation')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (section, options) => {
    try {
      const { UpdateCommand } = await import('./commands/UpdateCommand.js');
      const updateCommand = new UpdateCommand();
      await updateCommand.execute(section, options);
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('📊 Show FrankenAI status and configuration')
  .action(async () => {
    console.log(chalk.yellow('🚧 Coming soon: Status check'));
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}