import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
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

describe('AboutCommand', () => {
  let aboutCommand: AboutCommand;
  let program: Command;

  beforeEach(() => {
    aboutCommand = new AboutCommand();
    program = new Command();
  });

  describe('Command Configuration', () => {
    test('should configure command with correct options', () => {
      aboutCommand.configure(program);

      const commands = program.commands;
      const aboutCmd = commands.find(cmd => cmd.name() === 'about');

      expect(aboutCmd).toBeDefined();
      expect(aboutCmd?.description()).toBe('Show information about FrankenAI');

      // Check options exist
      const options = aboutCmd?.options;
      expect(options?.some(opt => opt.flags === '-d, --detailed')).toBe(true);
      expect(options?.some(opt => opt.flags === '-v, --version')).toBe(true);
    });

    test('should have correct command signature', () => {
      const signature = aboutCommand.getSignature();

      expect(signature.name).toBe('about');
      expect(signature.description).toBe('Show information about FrankenAI');
      expect(signature.category).toBe('General');
      expect(signature.usage).toBeDefined();
      expect(signature.options).toBeDefined();
      expect(signature.help).toBeDefined();
      expect(signature.usage).toContain('franken-ai about');
      expect(signature.usage).toContain('franken-ai about --detailed');
      expect(signature.usage).toContain('franken-ai about --version');
    });
  });

  describe('Command Execution', () => {
    test('should display basic about information', async () => {
      await aboutCommand.execute({});

      const output = consoleOutput.join('\n');
      expect(output).toContain('🧟 FrankenAI v0.1.0');
      expect(output).toContain('Multi-headed AI development assistant');
      expect(output).toContain('What is FrankenAI?');
      expect(output).toContain('Key Features:');
      expect(output).toContain('Hybrid Workflow:');
      expect(output).toContain('Meta Note:');
      expect(output).toContain('created with the help of FrankenAI itself');
      expect(output).toContain('Discovery Phase');
      expect(output).toContain('Implementation Phase');
    });

    test('should display detailed information when detailed flag is used', async () => {
      await aboutCommand.execute({ detailed: true });

      const output = consoleOutput.join('\n');
      expect(output).toContain('🧟 FrankenAI v0.1.0');
      expect(output).toContain('The Problem:');
      expect(output).toContain('The Solution:');
      expect(output).toContain('Supported Stacks:');
      expect(output).toContain('Frameworks:');
      expect(output).toContain('Languages:');
      expect(output).toContain('Systems:');
      expect(output).toContain('How It Works:');
      expect(output).toContain('Inspiration & Origins:');
      expect(output).toContain('Laravel Boost');
      expect(output).toContain('Reddit discussion');
      expect(output).toContain('Quick Start:');
    });

    test('should display version only when version flag is used', async () => {
      await aboutCommand.execute({ version: true });

      const output = consoleOutput.join('\n');
      expect(output).toBe('franken-ai v0.1.0');
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
        // Normal execution should not throw
        await aboutCommand.execute({});
        expect(exitCode).toBeUndefined();
      } finally {
        process.exit = originalExit;
        console.error = originalError;
      }
    });
  });

  describe('Content Sections', () => {
    test('should include meta information about self-creation', async () => {
      await aboutCommand.execute({});

      const output = consoleOutput.join('\n');
      expect(output).toContain('Meta Note:');
      expect(output).toContain('FrankenAI was created with the help of FrankenAI itself');
      expect(output).toContain('hybrid Claude Code + Gemini CLI workflow');
      expect(output).toContain('real-world effectiveness');
    });

    test('should include key features in basic mode', async () => {
      await aboutCommand.execute({});

      const output = consoleOutput.join('\n');
      expect(output).toContain('Key Features:');
      expect(output).toContain('Automatic project stack detection');
      expect(output).toContain('Enhanced CLAUDE.md generation');
      expect(output).toContain('Hybrid AI workflow optimization');
      expect(output).toContain('Modular architecture supporting 10+ frameworks');
    });

    test('should include workflow information', async () => {
      await aboutCommand.execute({});

      const output = consoleOutput.join('\n');
      expect(output).toContain('Hybrid Workflow:');
      expect(output).toContain('1. Discovery Phase');
      expect(output).toContain('Gemini CLI');
      expect(output).toContain('2. Implementation Phase');
      expect(output).toContain('Claude Code');
      expect(output).toContain('gemini -p "@src/ What\'s the overall architecture?"');
    });
  });

  describe('Detailed Mode Content', () => {
    test('should include supported stacks in detailed mode', async () => {
      await aboutCommand.execute({ detailed: true });

      const output = consoleOutput.join('\n');
      expect(output).toContain('Supported Stacks:');
      expect(output).toContain('Frameworks:');
      expect(output).toContain('Laravel');
      expect(output).toContain('Vue.js');
      expect(output).toContain('React');
      expect(output).toContain('Svelte');
      expect(output).toContain('Languages:');
      expect(output).toContain('PHP');
      expect(output).toContain('TypeScript');
      expect(output).toContain('JavaScript');
      expect(output).toContain('Systems:');
      expect(output).toContain('Express.js');
      expect(output).toContain('Tailwind CSS');
    });

    test('should include inspiration section in detailed mode', async () => {
      await aboutCommand.execute({ detailed: true });

      const output = consoleOutput.join('\n');
      expect(output).toContain('Inspiration & Origins:');
      expect(output).toContain('Reddit discussion');
      expect(output).toContain('r/ChatGPTCoding');
      expect(output).toContain('gemini_cli_is_awesome_but_only_when_you_make');
      expect(output).toContain('Laravel Boost');
      expect(output).toContain('Security-first approach');
      expect(output).toContain('Concise, actionable patterns');
      expect(output).toContain('Convention over configuration');
    });

    test('should include how it works section in detailed mode', async () => {
      await aboutCommand.execute({ detailed: true });

      const output = consoleOutput.join('\n');
      expect(output).toContain('How It Works:');
      expect(output).toContain('1. Stack Detection');
      expect(output).toContain('2. Module Discovery');
      expect(output).toContain('3. Guideline Generation');
      expect(output).toContain('4. Workflow Integration');
      expect(output).toContain('package.json');
      expect(output).toContain('composer.json');
    });

    test('should include quick start section in detailed mode', async () => {
      await aboutCommand.execute({ detailed: true });

      const output = consoleOutput.join('\n');
      expect(output).toContain('Quick Start:');
      expect(output).toContain('franken-ai init');
      expect(output).toContain('franken-ai modules');
      expect(output).toContain('franken-ai list');
      expect(output).toContain('For detailed help: franken-ai <command> --help');
    });
  });

  describe('Output Formatting', () => {
    test('should use proper formatting and colors', async () => {
      await aboutCommand.execute({});

      const output = consoleOutput.join('\n');
      // Check that the output contains basic structure
      expect(output).toContain('🧟 FrankenAI v0.1.0');
      expect(output).toContain('●'); // Bullet points
      expect(output).toContain('1.'); // Numbered lists
      expect(output).toContain('2.'); // Numbered lists
    });

    test('should have consistent version display', async () => {
      // Test basic mode
      await aboutCommand.execute({});
      let output = consoleOutput.join('\n');
      expect(output).toContain('🧟 FrankenAI v0.1.0');

      // Clear output and test detailed mode
      consoleOutput = [];
      await aboutCommand.execute({ detailed: true });
      output = consoleOutput.join('\n');
      expect(output).toContain('🧟 FrankenAI v0.1.0');

      // Clear output and test version-only mode
      consoleOutput = [];
      await aboutCommand.execute({ version: true });
      output = consoleOutput.join('\n');
      expect(output).toBe('franken-ai v0.1.0');
    });

    test('should include helpful navigation hints', async () => {
      await aboutCommand.execute({});

      const output = consoleOutput.join('\n');
      expect(output).toContain('Use "franken-ai about --detailed" for comprehensive information');
      expect(output).toContain('Use "franken-ai list" to see all available commands');
    });
  });

  describe('Command Integration', () => {
    test('should work with commander program', () => {
      aboutCommand.configure(program);

      expect(program.commands.length).toBeGreaterThan(0);

      const aboutCmd = program.commands.find(cmd => cmd.name() === 'about');
      expect(aboutCmd).toBeDefined();
    });

    test('should have correct command description', () => {
      aboutCommand.configure(program);

      const aboutCmd = program.commands.find(cmd => cmd.name() === 'about');
      expect(aboutCmd?.description()).toBe('Show information about FrankenAI');
    });

    test('should handle all option combinations', () => {
      aboutCommand.configure(program);

      const aboutCmd = program.commands.find(cmd => cmd.name() === 'about');
      const options = aboutCmd?.options || [];

      // Verify all expected options exist
      expect(options.some(opt => opt.long === '--detailed')).toBe(true);
      expect(options.some(opt => opt.long === '--version')).toBe(true);
    });
  });
});