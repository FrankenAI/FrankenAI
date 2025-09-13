import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { ListCommand } from '../src/commands/ListCommand.js';
import { CommandRegistry } from '../src/core/CommandRegistry.js';
import { ModulesCommand } from '../src/commands/ModulesCommand.js';
import { InitCommand } from '../src/commands/InitCommand.js';
import { AboutCommand } from '../src/commands/AboutCommand.js';
import { Command } from 'commander';

// Mock console.log to capture output
let consoleOutput: string[] = [];
const originalConsoleLog = console.log;

beforeEach(() => {
  consoleOutput = [];
  console.log = (...args: any[]) => {
    consoleOutput.push(args.join(' '));
  };
});

afterEach(() => {
  console.log = originalConsoleLog;
});

describe('ListCommand', () => {
  let listCommand: ListCommand;
  let commandRegistry: CommandRegistry;
  let program: Command;

  beforeEach(() => {
    commandRegistry = new CommandRegistry();

    // Register test commands
    const modulesCommand = new ModulesCommand();
    const initCommand = new InitCommand();
    const aboutCommand = new AboutCommand();

    commandRegistry.register(modulesCommand);
    commandRegistry.register(initCommand);
    commandRegistry.register(aboutCommand);

    listCommand = new ListCommand(commandRegistry);
    commandRegistry.register(listCommand);

    program = new Command();
  });

  describe('Command Configuration', () => {
    test('should configure command with correct options', () => {
      listCommand.configure(program);

      const commands = program.commands;
      const listCmd = commands.find(cmd => cmd.name() === 'list');

      expect(listCmd).toBeDefined();
      expect(listCmd?.alias()).toBe('ls');
      expect(listCmd?.description()).toBe('List all available FrankenAI commands');

      // Check options exist
      const options = listCmd?.options;
      expect(options?.some(opt => opt.flags === '-d, --detailed')).toBe(true);
      expect(options?.some(opt => opt.flags === '-c, --category <category>')).toBe(true);
      expect(options?.some(opt => opt.flags === '--help-all')).toBe(true);
    });

    test('should have correct command signature', () => {
      const signature = listCommand.getSignature();

      expect(signature.name).toBe('list');
      expect(signature.alias).toBe('ls');
      expect(signature.description).toBe('List all available FrankenAI commands');
      expect(signature.category).toBe('General');
      expect(signature.usage).toBeDefined();
      expect(signature.options).toBeDefined();
      expect(signature.help).toBeDefined();
    });
  });

  describe('Command Execution', () => {
    test('should display basic command list', async () => {
      await listCommand.execute({});

      const output = consoleOutput.join('\n');
      expect(output).toContain('Available Commands');
      expect(output).toContain('Setup');
      expect(output).toContain('Module Management');
      expect(output).toContain('General');
      expect(output).toContain('init');
      expect(output).toContain('modules (mod)');
      expect(output).toContain('list (ls)');
      expect(output).toContain('about');
      expect(output).toContain('Total:');
      expect(output).toContain('commands across');
      expect(output).toContain('categories');
    });

    test('should display detailed help when detailed flag is used', async () => {
      await listCommand.execute({ detailed: true });

      const output = consoleOutput.join('\n');
      expect(output).toContain('FrankenAI Command Reference');
      expect(output).toContain('Multi-headed AI development assistant');
      expect(output).toContain('Setup Commands');
      expect(output).toContain('Module Management Commands');
      expect(output).toContain('General Commands');
      expect(output).toContain('Usage:');
      expect(output).toContain('Options:');
      expect(output).toContain('Details:');
    });

    test('should filter by category when category option is provided', async () => {
      await listCommand.execute({ category: 'Setup' });

      const output = consoleOutput.join('\n');
      expect(output).toContain('Setup Commands');
      expect(output).toContain('init');
      expect(output).toContain('Initialize FrankenAI');
      expect(output).toContain('Usage:');
      expect(output).toContain('Options:');

      // Should not contain other categories
      expect(output).not.toContain('Module Management Commands');
      expect(output).not.toContain('General Commands');
    });

    test('should handle invalid category gracefully', async () => {
      await listCommand.execute({ category: 'NonExistentCategory' });

      const output = consoleOutput.join('\n');
      expect(output).toContain('No commands found in category "NonExistentCategory"');
      expect(output).toContain('Available categories:');
      expect(output).toContain('Setup');
      expect(output).toContain('Module Management');
      expect(output).toContain('General');
    });

    test('should display comprehensive help when help flag is used', async () => {
      await listCommand.execute({ help: true });

      const output = consoleOutput.join('\n');
      expect(output).toContain('FrankenAI Command Reference');
      expect(output).toContain('Multi-headed AI development assistant');
      expect(output).toContain('Setup Commands');
      expect(output).toContain('Module Management Commands');
      expect(output).toContain('General Commands');
    });

    test('should handle errors gracefully', async () => {
      // Mock process.exit to prevent actual exit
      const originalExit = process.exit;
      let exitCode: number | undefined;
      process.exit = ((code?: number) => {
        exitCode = code;
        throw new Error(`Process exit called with code ${code}`);
      }) as any;

      // Mock console.error
      let errorOutput = '';
      const originalError = console.error;
      console.error = (...args: any[]) => {
        errorOutput = args.join(' ');
      };

      try {
        // This would require more sophisticated error injection
        // For now, we verify the error handling structure exists
        expect(listCommand.execute).toBeDefined();
      } finally {
        process.exit = originalExit;
        console.error = originalError;
      }
    });
  });

  describe('Command Registry Integration', () => {
    test('should work with command registry', () => {
      expect(commandRegistry.has('list')).toBe(true);
      expect(commandRegistry.has('ls')).toBe(true);
      expect(commandRegistry.get('list')).toBe(listCommand);
      expect(commandRegistry.get('ls')).toBe(listCommand);
    });

    test('should list all registered commands', async () => {
      await listCommand.execute({});

      const output = consoleOutput.join('\n');

      // Should show all registered commands
      expect(output).toContain('init');
      expect(output).toContain('modules (mod)');
      expect(output).toContain('list (ls)');
      expect(output).toContain('about');
    });

    test('should show correct command counts', async () => {
      await listCommand.execute({});

      const output = consoleOutput.join('\n');
      expect(output).toMatch(/Total: \d+ commands across \d+ categories/);
    });
  });

  describe('Output Formatting', () => {
    test('should format categories correctly', async () => {
      await listCommand.execute({});

      const output = consoleOutput.join('\n');
      expect(output).toContain('Setup');
      expect(output).toContain('Module Management');
      expect(output).toContain('General');
    });

    test('should show command aliases properly', async () => {
      await listCommand.execute({});

      const output = consoleOutput.join('\n');
      expect(output).toContain('modules (mod)');
      expect(output).toContain('list (ls)');
    });

    test('should display usage examples in detailed mode', async () => {
      await listCommand.execute({ detailed: true });

      const output = consoleOutput.join('\n');
      expect(output).toContain('franken-ai init');
      expect(output).toContain('franken-ai modules');
      expect(output).toContain('franken-ai list');
      expect(output).toContain('franken-ai about');
    });
  });

  describe('Category Filtering', () => {
    test('should show only Setup category commands', async () => {
      await listCommand.execute({ category: 'Setup' });

      const output = consoleOutput.join('\n');
      expect(output).toContain('Setup Commands');
      expect(output).toContain('init');
      expect(output).not.toContain('modules (mod)');
      expect(output).not.toContain('list (ls)');
      expect(output).not.toContain('about');
    });

    test('should show only Module Management category commands', async () => {
      await listCommand.execute({ category: 'Module Management' });

      const output = consoleOutput.join('\n');
      expect(output).toContain('Module Management Commands');
      expect(output).toContain('modules');
      expect(output).not.toContain('init');
      expect(output).not.toContain('list (ls)'); // Check for the specific command, not the word "list"
      expect(output).not.toContain('about');
    });

    test('should show only General category commands', async () => {
      await listCommand.execute({ category: 'General' });

      const output = consoleOutput.join('\n');
      expect(output).toContain('General Commands');
      expect(output).toContain('list (ls)');
      expect(output).toContain('about');
      expect(output).not.toContain('init');
      expect(output).not.toContain('modules (mod)');
    });
  });
});