#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CommandRegistry } from './core/CommandRegistry.js';
import { InitCommand } from './commands/InitCommand.js';
import { ModulesCommand } from './commands/ModulesCommand.js';
import { ListCommand } from './commands/ListCommand.js';
import { AboutCommand } from './commands/AboutCommand.js';
import { DetectCommand } from './commands/DetectCommand.js';
import { StatusCommand } from './commands/StatusCommand.js';

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
const detectCommand = new DetectCommand();
const statusCommand = new StatusCommand();

commandRegistry.register(initCommand);
commandRegistry.register(modulesCommand);
commandRegistry.register(listCommand);
commandRegistry.register(aboutCommand);
commandRegistry.register(detectCommand);
commandRegistry.register(statusCommand);

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
  .action(async (_section, _options) => {
    console.log(chalk.yellow('🚧 Coming soon: Selective section updates'));
    console.log(chalk.gray('   For now, use: franken-ai init --force'));
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}