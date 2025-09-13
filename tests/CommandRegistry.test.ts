import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { CommandRegistry } from '../src/core/CommandRegistry.js';
import { ModulesCommand } from '../src/commands/ModulesCommand.js';
import { InitCommand } from '../src/commands/InitCommand.js';
import { ListCommand } from '../src/commands/ListCommand.js';
import { AboutCommand } from '../src/commands/AboutCommand.js';
import type { BaseCommand } from '../src/core/types/Command.js';

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

describe('CommandRegistry', () => {
  let registry: CommandRegistry;
  let initCommand: InitCommand;
  let modulesCommand: ModulesCommand;
  let aboutCommand: AboutCommand;
  let listCommand: ListCommand;

  beforeEach(() => {
    registry = new CommandRegistry();
    initCommand = new InitCommand();
    modulesCommand = new ModulesCommand();
    aboutCommand = new AboutCommand();
    listCommand = new ListCommand(registry);
  });

  describe('Command Registration', () => {
    test('should register commands successfully', () => {
      registry.register(initCommand);
      registry.register(modulesCommand);
      registry.register(aboutCommand);
      registry.register(listCommand);

      expect(registry.has('init')).toBe(true);
      expect(registry.has('modules')).toBe(true);
      expect(registry.has('mod')).toBe(true); // alias
      expect(registry.has('about')).toBe(true);
      expect(registry.has('list')).toBe(true);
      expect(registry.has('ls')).toBe(true); // alias
    });

    test('should retrieve commands by name and alias', () => {
      registry.register(initCommand);
      registry.register(modulesCommand);
      registry.register(aboutCommand);
      registry.register(listCommand);

      expect(registry.get('init')).toBe(initCommand);
      expect(registry.get('modules')).toBe(modulesCommand);
      expect(registry.get('mod')).toBe(modulesCommand); // alias
      expect(registry.get('about')).toBe(aboutCommand);
      expect(registry.get('list')).toBe(listCommand);
      expect(registry.get('ls')).toBe(listCommand); // alias
    });

    test('should retrieve command signatures', () => {
      registry.register(initCommand);
      registry.register(modulesCommand);
      registry.register(aboutCommand);
      registry.register(listCommand);

      const initSig = registry.getSignature('init');
      const modulesSig = registry.getSignature('modules');
      const aboutSig = registry.getSignature('about');
      const listSig = registry.getSignature('list');

      expect(initSig?.name).toBe('init');
      expect(modulesSig?.name).toBe('modules');
      expect(aboutSig?.name).toBe('about');
      expect(listSig?.name).toBe('list');

      // Test aliases
      expect(registry.getSignature('mod')?.name).toBe('modules');
      expect(registry.getSignature('ls')?.name).toBe('list');
    });

    test('should return undefined for non-existent commands', () => {
      expect(registry.get('nonexistent')).toBeUndefined();
      expect(registry.getSignature('nonexistent')).toBeUndefined();
      expect(registry.has('nonexistent')).toBe(false);
    });
  });

  describe('Command Collection', () => {
    beforeEach(() => {
      registry.register(initCommand);
      registry.register(modulesCommand);
      registry.register(aboutCommand);
      registry.register(listCommand);
    });

    test('should get all commands without duplicates', () => {
      const commands = registry.getAllCommands();

      expect(commands.length).toBe(4);
      expect(commands).toContain(initCommand);
      expect(commands).toContain(modulesCommand);
      expect(commands).toContain(aboutCommand);
      expect(commands).toContain(listCommand);
    });

    test('should get all signatures without duplicates', () => {
      const signatures = registry.getAllSignatures();

      expect(signatures.length).toBe(4);
      expect(signatures.some(sig => sig.name === 'init')).toBe(true);
      expect(signatures.some(sig => sig.name === 'modules')).toBe(true);
      expect(signatures.some(sig => sig.name === 'about')).toBe(true);
      expect(signatures.some(sig => sig.name === 'list')).toBe(true);
    });

    test('should return correct command count', () => {
      expect(registry.count()).toBe(4);
    });
  });

  describe('Category Organization', () => {
    beforeEach(() => {
      registry.register(initCommand);
      registry.register(modulesCommand);
      registry.register(aboutCommand);
      registry.register(listCommand);
    });

    test('should group commands by category', () => {
      const byCategory = registry.getCommandsByCategory();

      expect(byCategory['Setup']).toBeDefined();
      expect(byCategory['Module Management']).toBeDefined();
      expect(byCategory['General']).toBeDefined();

      expect(byCategory['Setup'].length).toBe(1);
      expect(byCategory['Module Management'].length).toBe(1);
      expect(byCategory['General'].length).toBe(2);

      expect(byCategory['Setup'][0].name).toBe('init');
      expect(byCategory['Module Management'][0].name).toBe('modules');
      expect(byCategory['General'].some(cmd => cmd.name === 'about')).toBe(true);
      expect(byCategory['General'].some(cmd => cmd.name === 'list')).toBe(true);
    });

    test('should sort commands alphabetically within categories', () => {
      const byCategory = registry.getCommandsByCategory();
      const generalCommands = byCategory['General'];

      // Should be sorted: about, list
      expect(generalCommands[0].name).toBe('about');
      expect(generalCommands[1].name).toBe('list');
    });
  });

  describe('Display Methods', () => {
    beforeEach(() => {
      registry.register(initCommand);
      registry.register(modulesCommand);
      registry.register(aboutCommand);
      registry.register(listCommand);
    });

    test('should display command list', () => {
      registry.displayList();

      const output = consoleOutput.join('\n');
      expect(output).toContain('Available Commands');
      expect(output).toContain('Setup');
      expect(output).toContain('Module Management');
      expect(output).toContain('General');
      expect(output).toContain('init');
      expect(output).toContain('modules (mod)');
      expect(output).toContain('about');
      expect(output).toContain('list (ls)');
      expect(output).toContain('Total: 4 commands across 3 categories');
    });

    test('should display detailed help', () => {
      registry.displayDetailedHelp();

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

    test('should display categories in preferred order', () => {
      registry.displayList();

      const output = consoleOutput.join('\n');
      const setupIndex = output.indexOf('Setup');
      const moduleIndex = output.indexOf('Module Management');
      const generalIndex = output.indexOf('General');

      // Setup should come first, then Module Management, then General
      expect(setupIndex).toBeLessThan(moduleIndex);
      expect(moduleIndex).toBeLessThan(generalIndex);
    });

    test('should show command aliases in display', () => {
      registry.displayList();

      const output = consoleOutput.join('\n');
      expect(output).toContain('modules (mod)');
      expect(output).toContain('list (ls)');
      // Commands without aliases should not show parentheses
      expect(output).toMatch(/init\s+Initialize FrankenAI/);
      expect(output).toMatch(/about\s+Show information/);
    });

    test('should include summary information', () => {
      registry.displayList();

      const output = consoleOutput.join('\n');
      expect(output).toContain('Total: 4 commands across 3 categories');
      expect(output).toContain('Use --help with any command for detailed information');
      expect(output).toContain('franken-ai <command> --help');
    });
  });

  describe('Command Signatures', () => {
    beforeEach(() => {
      registry.register(initCommand);
      registry.register(modulesCommand);
      registry.register(aboutCommand);
      registry.register(listCommand);
    });

    test('should validate all commands have proper signatures', () => {
      const commands = registry.getAllCommands();

      commands.forEach(command => {
        const signature = command.getSignature();

        expect(signature.name).toBeDefined();
        expect(signature.name.length).toBeGreaterThan(0);
        expect(signature.description).toBeDefined();
        expect(signature.description.length).toBeGreaterThan(0);
        expect(signature.category).toBeDefined();
        expect(signature.usage).toBeDefined();
        expect(signature.options).toBeDefined();
        expect(signature.help).toBeDefined();
      });
    });

    test('should have unique command names', () => {
      const signatures = registry.getAllSignatures();
      const names = signatures.map(sig => sig.name);
      const uniqueNames = [...new Set(names)];

      expect(names.length).toBe(uniqueNames.length);
    });

    test('should validate option formats', () => {
      const signatures = registry.getAllSignatures();

      signatures.forEach(signature => {
        if (signature.options) {
          signature.options.forEach(option => {
            expect(option.flags).toBeDefined();
            expect(option.description).toBeDefined();
            expect(option.flags.length).toBeGreaterThan(0);
            expect(option.description.length).toBeGreaterThan(0);
          });
        }
      });
    });

    test('should validate usage examples', () => {
      const signatures = registry.getAllSignatures();

      signatures.forEach(signature => {
        if (signature.usage) {
          expect(signature.usage.length).toBeGreaterThan(0);
          signature.usage.forEach(usage => {
            expect(usage).toContain('franken-ai');
            // Usage should contain either the command name or its alias
            const containsName = usage.includes(signature.name);
            const containsAlias = signature.alias && usage.includes(signature.alias);
            expect(containsName || containsAlias).toBe(true);
          });
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle empty registry gracefully', () => {
      expect(registry.count()).toBe(0);
      expect(registry.getAllCommands()).toEqual([]);
      expect(registry.getAllSignatures()).toEqual([]);
      expect(registry.getCommandsByCategory()).toEqual({});
    });

    test('should handle duplicate registrations', () => {
      registry.register(initCommand);
      registry.register(initCommand); // Register again

      expect(registry.count()).toBe(1); // Should still be 1
      expect(registry.get('init')).toBe(initCommand);
    });
  });

  describe('Integration Tests', () => {
    test('should work with all FrankenAI commands', () => {
      registry.register(initCommand);
      registry.register(modulesCommand);
      registry.register(aboutCommand);
      registry.register(listCommand);

      // Test that all commands are accessible
      expect(registry.get('init')).toBeInstanceOf(InitCommand);
      expect(registry.get('modules')).toBeInstanceOf(ModulesCommand);
      expect(registry.get('mod')).toBeInstanceOf(ModulesCommand);
      expect(registry.get('about')).toBeInstanceOf(AboutCommand);
      expect(registry.get('list')).toBeInstanceOf(ListCommand);
      expect(registry.get('ls')).toBeInstanceOf(ListCommand);
    });

    test('should maintain command interface consistency', () => {
      const commands: BaseCommand[] = [
        initCommand,
        modulesCommand,
        aboutCommand,
        listCommand
      ];

      commands.forEach(command => {
        expect(typeof command.getSignature).toBe('function');
        expect(typeof command.configure).toBe('function');
        expect(typeof command.execute).toBe('function');

        const signature = command.getSignature();
        expect(typeof signature.name).toBe('string');
        expect(typeof signature.description).toBe('string');
      });
    });
  });
});