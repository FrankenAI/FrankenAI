import type { Command } from 'commander';
import chalk from 'chalk';
import type { BaseCommand, CommandSignature } from '../core/types/Command.js';

export interface AboutCommandOptions {
  detailed?: boolean;
  version?: boolean;
}

export class AboutCommand implements BaseCommand {
  /**
   * Get command signature metadata
   */
  getSignature(): CommandSignature {
    return {
      name: 'about',
      description: 'Show information about FrankenAI',
      category: 'General',
      usage: [
        'franken-ai about',
        'franken-ai about --detailed',
        'franken-ai about --version'
      ],
      options: [
        {
          flags: '-d, --detailed',
          description: 'Show detailed information including supported stacks and workflows'
        },
        {
          flags: '-v, --version',
          description: 'Show version information only'
        }
      ],
      help: `Display information about FrankenAI including its purpose, workflow, and capabilities.

FrankenAI combines multiple AI tools into a unified development workflow:
- Claude Code for precise implementation and tooling
- Gemini CLI for large-scale codebase analysis

Use --detailed to see comprehensive information about supported frameworks,
languages, and the hybrid workflow methodology.

Examples:
  franken-ai about           # Basic information
  franken-ai about -d        # Detailed capabilities
  franken-ai about --version # Version only`
    };
  }

  /**
   * Configure the command
   */
  configure(program: Command): void {
    const signature = this.getSignature();

    const cmd = program
      .command(signature.name)
      .description(signature.description);

    signature.options?.forEach(opt => {
      cmd.option(opt.flags, opt.description, opt.defaultValue);
    });

    cmd.action((options: AboutCommandOptions) => this.execute(options));
  }

  /**
   * Execute the about command
   */
  async execute(options: AboutCommandOptions): Promise<void> {
    try {
      if (options.version) {
        this.showVersionOnly();
        return;
      }

      if (options.detailed) {
        this.showDetailedInfo();
      } else {
        this.showBasicInfo();
      }
    } catch (error) {
      console.error('Error displaying about information:', error);
      process.exit(1);
    }
  }

  /**
   * Show version information only
   */
  private showVersionOnly(): void {
    console.log('franken-ai v0.1.0');
  }

  /**
   * Show basic information about FrankenAI
   */
  private showBasicInfo(): void {
    console.log(chalk.green.bold('🧟 FrankenAI v0.1.0'));
    console.log(chalk.cyan('Multi-headed AI development assistant'));
    console.log();

    console.log(chalk.bold('What is FrankenAI?'));
    console.log('FrankenAI orchestrates multiple AI tools to create a powerful "Megazord"');
    console.log('for development workflows. It combines Claude Code\'s precision with');
    console.log('Gemini CLI\'s large-scale analysis capabilities.');
    console.log();

    console.log(chalk.bold('Key Features:'));
    console.log(chalk.green('●') + ' Automatic project stack detection');
    console.log(chalk.green('●') + ' Enhanced CLAUDE.md generation with framework-specific guidelines');
    console.log(chalk.green('●') + ' Hybrid AI workflow optimization');
    console.log(chalk.green('●') + ' Modular architecture supporting 10+ frameworks and languages');
    console.log();

    console.log(chalk.bold('Hybrid Workflow:'));
    console.log(chalk.blue('1. Discovery Phase') + ' - Use Gemini CLI for large-scale analysis');
    console.log('   ' + chalk.dim('gemini -p "@src/ What\'s the overall architecture?"'));
    console.log(chalk.blue('2. Implementation Phase') + ' - Use Claude Code for precise development');
    console.log('   ' + chalk.dim('Launch Claude Code with auto-generated CLAUDE.md'));
    console.log();

    console.log(chalk.dim('Use "franken-ai about --detailed" for comprehensive information'));
    console.log(chalk.dim('Use "franken-ai list" to see all available commands'));

    this.showMeta();
  }

  /**
   * Show detailed information
   */
  private showDetailedInfo(): void {
    console.log(chalk.green.bold('🧟 FrankenAI v0.1.0'));
    console.log(chalk.cyan('Multi-headed AI development assistant'));
    console.log();

    this.showMeta();

    console.log(chalk.bold('The Problem:'));
    console.log('Modern development involves complex stacks, and no single AI tool excels');
    console.log('at everything. Claude Code is precise but has context limits. Gemini CLI');
    console.log('has massive context but lacks development tooling.');
    console.log();

    console.log(chalk.bold('The Solution:'));
    console.log('FrankenAI automatically detects your project stack and generates');
    console.log('comprehensive guidelines that leverage each tool\'s strengths optimally.');
    console.log();

    this.showSupportedStacks();
    this.showWorkflow();
    this.showInspiration();
    this.showUsage();
    this.showContributing();
    this.showDisclaimer();
  }

  /**
   * Show meta information
   */
  private showMeta(): void {
    console.log(chalk.yellow.bold('📝 Meta Note:'));
    console.log('FrankenAI was created with the help of FrankenAI itself!');
    console.log('The hybrid Claude Code + Gemini CLI workflow proved invaluable');
    console.log('during development, demonstrating its real-world effectiveness.');
    console.log();
  }

  /**
   * Show supported stacks
   */
  private showSupportedStacks(): void {
    console.log(chalk.bold('Supported Stacks:'));
    console.log();

    console.log(chalk.blue('Frameworks:'));
    console.log('  • Laravel (10, 11, 12) + Livewire, Inertia');
    console.log('  • Vue.js (2, 3) + Vue Router, Pinia');
    console.log('  • React + Next.js');
    console.log('  • Svelte + SvelteKit');
    console.log();

    console.log(chalk.blue('Languages:'));
    console.log('  • PHP (8.1, 8.2, 8.3, 8.4)');
    console.log('  • TypeScript');
    console.log('  • JavaScript');
    console.log();

    console.log(chalk.blue('Systems:'));
    console.log('  • Express.js, Hono');
    console.log('  • WordPress, Craft CMS');
    console.log('  • Tailwind CSS, Bootstrap');
    console.log();
  }

  /**
   * Show workflow information
   */
  private showWorkflow(): void {
    console.log(chalk.bold('Hybrid Workflow:'));
    console.log();

    console.log(chalk.blue('1. Discovery Phase') + ' (Gemini CLI):');
    console.log('   ' + chalk.dim('gemini -p "@src/ What\'s the overall architecture?"'));
    console.log('   ' + chalk.dim('gemini -p "@app/ Is user authentication implemented?"'));
    console.log();

    console.log(chalk.blue('2. Implementation Phase') + ' (Claude Code):');
    console.log('   • Launch Claude Code in your project directory');
    console.log('   • Claude automatically uses your enhanced CLAUDE.md');
    console.log('   • Implement specific features with precision tooling');
    console.log();

    console.log(chalk.bold('How It Works:'));
    console.log('1. ' + chalk.cyan('Stack Detection') + ' - Scans package.json, composer.json, config files');
    console.log('2. ' + chalk.cyan('Module Discovery') + ' - Identifies frameworks and languages');
    console.log('3. ' + chalk.cyan('Guideline Generation') + ' - Combines templates into CLAUDE.md');
    console.log('4. ' + chalk.cyan('Workflow Integration') + ' - Provides optimal AI tool patterns');
    console.log();
  }

  /**
   * Show inspiration and origins
   */
  private showInspiration(): void {
    console.log(chalk.bold('Inspiration & Origins:'));
    console.log();

    console.log('FrankenAI was inspired by a Reddit discussion about Gemini CLI\'s');
    console.log('potential when properly integrated into development workflows.');
    console.log(chalk.dim('Source: r/ChatGPTCoding - "gemini_cli_is_awesome_but_only_when_you_make"'));
    console.log();

    console.log(chalk.bold('Methodology:'));
    console.log('Follows ' + chalk.cyan('Laravel Boost') + ' methodology for guidelines:');
    console.log('  • Security-first approach');
    console.log('  • Concise, actionable patterns');
    console.log('  • Convention over configuration');
    console.log('  • Framework-specific best practices');
    console.log();
  }

  /**
   * Show basic usage
   */
  private showUsage(): void {
    console.log(chalk.bold('Quick Start:'));
    console.log();

    console.log(chalk.cyan('Initialize your project:'));
    console.log('  franken-ai init');
    console.log();

    console.log(chalk.cyan('View available modules:'));
    console.log('  franken-ai modules');
    console.log();

    console.log(chalk.cyan('List all commands:'));
    console.log('  franken-ai list');
    console.log();

    console.log(chalk.dim('For detailed help: franken-ai <command> --help'));
    console.log();
  }

  /**
   * Show contributing information
   */
  private showContributing(): void {
    console.log(chalk.bold('Contributing:'));
    console.log();

    console.log('We welcome contributions to make FrankenAI more comprehensive!');
    console.log();

    console.log(chalk.yellow.bold('Philosophy: Opinionated by Design'));
    console.log('FrankenAI is intentionally opinionated. We provide curated, battle-tested');
    console.log('guidelines rather than exhaustive options. Contributors share expertise,');
    console.log('but maintainers make final decisions to ensure consistency and quality.');
    console.log();

    console.log(chalk.blue('Ways to contribute:'));
    console.log('  • Add new framework/language support');
    console.log('  • Improve existing guideline templates');
    console.log('  • Enhance core functionality and testing');
    console.log('  • Documentation and examples');
    console.log();

    console.log(chalk.cyan('Getting started:'));
    console.log('1. Implement new modules in src/modules/');
    console.log('2. Create embedded guidelines following Laravel Boost methodology');
    console.log('3. Add detection logic for package.json and config files');
    console.log('4. Add comprehensive tests and run bun test');
    console.log();

    console.log(chalk.dim('See CONTRIBUTING.md for detailed guidelines and decision process'));
    console.log();
  }

  /**
   * Show important disclaimer
   */
  private showDisclaimer(): void {
    console.log(chalk.bold('Important Disclaimer:'));
    console.log();

    console.log(chalk.yellow.bold('FrankenAI is an assistant to assistants that assists you.'));
    console.log('It should be used as a development workflow orchestrator, not as a');
    console.log('replacement for human judgment and expertise.');
    console.log();

    console.log(chalk.bold('Key Considerations:'));
    console.log('  • ' + chalk.cyan('Review Generated Content') + ' - Always verify CLAUDE.md fits your needs');
    console.log('  • ' + chalk.cyan('Code Review Essential') + ' - Thoroughly review AI-generated code');
    console.log('  • ' + chalk.cyan('Human Oversight Required') + ' - Critical thinking remains essential');
    console.log('  • ' + chalk.cyan('Security Responsibility') + ' - You own security implementation');
    console.log();

    console.log(chalk.bold('Best Practices:'));
    console.log('1. Start with non-critical projects');
    console.log('2. Have team members review generated guidelines');
    console.log('3. Customize CLAUDE.md based on your specific needs');
    console.log('4. Maintain healthy skepticism and critical evaluation');
    console.log();

    console.log(chalk.yellow('Remember:') + ' FrankenAI amplifies your workflow but cannot replace');
    console.log('the critical thinking and domain expertise of human developers.');
    console.log();
  }
}