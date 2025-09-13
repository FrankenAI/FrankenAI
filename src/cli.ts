#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CommandRegistry } from './core/CommandRegistry.js';
import { InitCommand } from './commands/InitCommand.js';
import { ModulesCommand } from './commands/ModulesCommand.js';
import { ListCommand } from './commands/ListCommand.js';
import { AboutCommand } from './commands/AboutCommand.js';

const program = new Command();
const commandRegistry = new CommandRegistry();

program
  .name('franken-ai')
  .description('🧟 Multi-headed AI development assistant combining Claude Code + Gemini CLI')
  .version('0.1.0');

// Register all commands
const initCommand = new InitCommand();
const modulesCommand = new ModulesCommand();
const listCommand = new ListCommand(commandRegistry);
const aboutCommand = new AboutCommand();

commandRegistry.register(initCommand);
commandRegistry.register(modulesCommand);
commandRegistry.register(listCommand);
commandRegistry.register(aboutCommand);

// Configure all registered commands with Commander.js
commandRegistry.getAllCommands().forEach(command => {
  command.configure(program);
});

// Update command - regenerate sections (coming soon)
program
  .command('update [section]')
  .description('🔄 Update specific sections in CLAUDE.md')
  .option('-f, --force', 'Force update without confirmation')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (section, options) => {
    console.log(chalk.yellow('🚧 Coming soon: Selective section updates'));
    console.log(chalk.gray('   For now, use: franken-ai init --force'));
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