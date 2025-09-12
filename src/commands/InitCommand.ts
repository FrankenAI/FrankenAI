import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { EnvironmentChecker } from '../core/EnvironmentChecker.js';
import { StackDetector } from '../core/StackDetector.js';
import { WorkspaceGenerator } from '../core/WorkspaceGenerator.js';
import { TemplateManager, GuidelineTemplate } from '../core/TemplateManager.js';

export interface InitOptions {
  docs?: boolean;
  force?: boolean;
  safe?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  silent?: boolean;
  yes?: boolean;
  noInteraction?: boolean;
}

export enum LogLevel {
  SILENT = 0,
  QUIET = 1,
  NORMAL = 2,
  VERBOSE = 3,
}

export class InitCommand {
  private logLevel: LogLevel = LogLevel.NORMAL;
  private isInteractive = true;

  async execute(options: InitOptions) {
    // Setup logging and interaction levels
    this.setupLogLevel(options);
    this.isInteractive = !options.noInteraction;
    
    this.log(LogLevel.NORMAL, chalk.green.bold('🧟 FrankenAI Initialization'));
    this.log(LogLevel.NORMAL, chalk.gray('Multi-headed AI development assistant\n'));

    // Step 1: Check for existing CLAUDE.md and handle conflicts
    const shouldProceed = await this.checkExistingSetup(options);
    if (!shouldProceed) {
      this.logWarning(chalk.yellow('⚠️  Setup cancelled by user'));
      return;
    }

    // Step 2: Environment Check and tool availability
    const toolStatus = await this.checkEnvironment();

    // Step 3: Handle missing tools
    const shouldContinue = await this.handleMissingTools(toolStatus, options);
    if (!shouldContinue) {
      this.logWarning(chalk.yellow('⚠️  Setup cancelled - install required tools first'));
      return;
    }

    // Step 4: Stack Detection  
    const stack = await this.detectStack();

    // Step 5: Template Selection
    const selectedTemplates = await this.selectTemplates(stack, toolStatus, options);

    // Step 6: Generate Enhanced CLAUDE.md (our main value)
    await this.generateWorkspace(stack, options, toolStatus, selectedTemplates);

    this.log(LogLevel.NORMAL, chalk.green.bold('\n✅ FrankenAI setup complete!'));
    this.log(LogLevel.NORMAL, chalk.blue('📋 What happens next:'));
    this.log(LogLevel.NORMAL, chalk.cyan('   • Launch Claude Code in this directory'));
    this.log(LogLevel.NORMAL, chalk.cyan('   • Claude will auto-detect and use your enhanced CLAUDE.md'));
    this.log(LogLevel.NORMAL, chalk.cyan('   • Use: gemini -p "@src/ Analyze this codebase" for large analysis'));
  }

  private setupLogLevel(options: InitOptions) {
    if (options.silent) {
      this.logLevel = LogLevel.SILENT;
    } else if (options.quiet) {
      this.logLevel = LogLevel.QUIET;
    } else if (options.verbose) {
      this.logLevel = LogLevel.VERBOSE;
    } else {
      this.logLevel = LogLevel.NORMAL;
    }
  }

  private log(level: LogLevel, message: string) {
    if (this.logLevel >= level) {
      console.log(message);
    }
  }

  private logError(message: string) {
    // Errors always show (except in silent mode)
    if (this.logLevel >= LogLevel.QUIET) {
      console.error(message);
    }
  }

  private logWarning(message: string) {
    // Warnings show in quiet mode and above
    if (this.logLevel >= LogLevel.QUIET) {
      console.log(message);
    }
  }

  private async checkExistingSetup(options: InitOptions): Promise<boolean> {
    const spinner = ora('🔍 Checking existing setup...').start();
    
    try {
      const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
      const exists = await fs.pathExists(claudeMdPath);
      
      if (!exists) {
        spinner.stop();
        return true; // No conflict, proceed
      }

      // Check if it has FrankenAI configuration
      const content = await fs.readFile(claudeMdPath, 'utf-8');
      const hasFrankenAI = content.includes('# FrankenAI Configuration');
      
      // STOP spinner before any user interaction
      spinner.stop();
    
      return await this.handleExistingFile(options, hasFrankenAI);
    } catch (error) {
      spinner.fail('❌ Failed to check existing setup');
      throw error;
    }
  }

  private async handleExistingFile(options: InitOptions, hasFrankenAI: boolean): Promise<boolean> {
    if (options.force) {
      if (hasFrankenAI) {
        this.log(LogLevel.NORMAL, chalk.yellow('🔄 CLAUDE.md exists with FrankenAI config - updating...'));
      } else {
        this.log(LogLevel.NORMAL, chalk.yellow('🔄 CLAUDE.md exists - adding FrankenAI config...'));
      }
      return true;
    }

    if (options.safe) {
      if (hasFrankenAI) {
        this.logWarning(chalk.red('⛔ CLAUDE.md already configured with FrankenAI'));
        this.log(LogLevel.QUIET, chalk.gray('   Use --force to update anyway'));
      } else {
        this.logWarning(chalk.red('⛔ CLAUDE.md already exists'));
        this.log(LogLevel.QUIET, chalk.gray('   Use --force to add FrankenAI config anyway'));
      }
      return false;
    }

    // Auto-accept with --yes flag
    if (options.yes) {
      if (hasFrankenAI) {
        this.log(LogLevel.NORMAL, chalk.yellow('🔄 CLAUDE.md has FrankenAI config - updating (--yes)...'));
      } else {
        this.log(LogLevel.NORMAL, chalk.yellow('🔄 CLAUDE.md exists - adding FrankenAI config (--yes)...'));
      }
      return true;
    }

    // Non-interactive mode
    if (!this.isInteractive) {
      this.logError(chalk.red('❌ CLAUDE.md exists and no --force or --yes provided'));
      this.logError(chalk.gray('   Use --force, --yes, or remove --no-interaction flag'));
      throw new Error('Interactive input required but --no-interaction specified');
    }

    // Interactive prompts (spinner is already stopped)
    if (hasFrankenAI) {
      this.logWarning(chalk.yellow('⚠️  CLAUDE.md already has FrankenAI configuration'));
      
      const { shouldUpdate } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldUpdate',
          message: 'Update existing FrankenAI configuration?',
          default: true,
        },
      ]);
      return shouldUpdate;
    } else {
      this.logWarning(chalk.yellow('⚠️  CLAUDE.md already exists'));
      
      const { shouldEnhance } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'shouldEnhance',
          message: 'Add FrankenAI configuration to existing file?',
          default: true,
        },
      ]);
      return shouldEnhance;
    }
  }

  private async checkEnvironment() {
    this.log(LogLevel.NORMAL, chalk.blue('🔍 Checking AI tools installation...'));
    
    try {
      const checker = new EnvironmentChecker();
      const status = await checker.checkAll();

      if (status.claude.installed && status.gemini.installed) {
        this.log(LogLevel.NORMAL, chalk.green('✅ Claude Code and Gemini CLI found'));
      } else {
        this.log(LogLevel.NORMAL, chalk.yellow('⚠️  Some AI tools missing'));
        
        if (!status.claude.installed) {
          this.log(LogLevel.NORMAL, chalk.red('  ❌ Claude Code not found'));
          this.log(LogLevel.NORMAL, chalk.gray('     Install: https://claude.ai/code'));
          
          // Check if we're running inside Claude Code
          if (process.env.CLAUDE_CODE) {
            this.log(LogLevel.NORMAL, chalk.blue('  ℹ️  Running inside Claude Code - this is expected'));
          }
        } else {
          this.log(LogLevel.NORMAL, chalk.green('  ✅ Claude Code found'));
        }
        
        if (!status.gemini.installed) {
          this.log(LogLevel.NORMAL, chalk.red('  ❌ Gemini CLI not found'));
          this.log(LogLevel.NORMAL, chalk.gray('     Install: npm install -g @google/generative-ai'));
        } else {
          this.log(LogLevel.NORMAL, chalk.green('  ✅ Gemini CLI found'));
        }
      }

      return status;
    } catch (error) {
      this.logError(chalk.red('❌ Environment check failed'));
      throw error;
    }
  }

  private async handleMissingTools(toolStatus: any, options: InitOptions): Promise<boolean> {
    const missingTools = [];
    if (!toolStatus.claude.installed) missingTools.push('Claude Code');
    if (!toolStatus.gemini.installed) missingTools.push('Gemini CLI');

    // If all tools are available, continue
    if (missingTools.length === 0) {
      return true;
    }

    // Show installation instructions
    this.log(LogLevel.NORMAL, chalk.yellow('\n📋 Missing tools installation:'));
    
    if (!toolStatus.claude.installed) {
      this.log(LogLevel.NORMAL, chalk.cyan('🤖 Claude Code:'));
      this.log(LogLevel.NORMAL, chalk.gray('   • Visit: https://claude.ai/code'));
      this.log(LogLevel.NORMAL, chalk.gray('   • Follow platform-specific installation'));
    }

    if (!toolStatus.gemini.installed) {
      this.log(LogLevel.NORMAL, chalk.cyan('🔍 Gemini CLI:'));
      this.log(LogLevel.NORMAL, chalk.gray('   • npm install -g @google/generative-ai'));
      this.log(LogLevel.NORMAL, chalk.gray('   • Or: bun add -g @google/generative-ai'));
    }

    // Auto-continue with --force or --yes
    if (options.force || options.yes) {
      this.log(LogLevel.NORMAL, chalk.yellow('⚠️  Continuing anyway (reduced functionality)'));
      return true;
    }

    // Non-interactive mode fails
    if (!this.isInteractive) {
      this.logError(chalk.red('❌ Missing tools in non-interactive mode'));
      this.logError(chalk.gray('   Use --force to continue with reduced functionality'));
      return false;
    }

    // Interactive choice
    this.log(LogLevel.NORMAL, '');
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'How would you like to proceed?',
        choices: [
          { name: '🛑 Cancel and install tools first (recommended)', value: 'cancel' },
          { name: '⚠️  Continue anyway (reduced functionality)', value: 'continue' },
          { name: '📖 Show detailed installation guide', value: 'guide' },
        ],
        default: 'cancel',
      },
    ]);

    if (action === 'guide') {
      await this.showInstallationGuide();
      return false; // Exit after showing guide
    }

    return action === 'continue';
  }

  private async showInstallationGuide() {
    this.log(LogLevel.NORMAL, chalk.blue.bold('\n📖 Installation Guide'));
    this.log(LogLevel.NORMAL, chalk.blue('═══════════════════\n'));

    this.log(LogLevel.NORMAL, chalk.cyan('🤖 Claude Code:'));
    this.log(LogLevel.NORMAL, chalk.gray('   1. Visit: https://claude.ai/code'));
    this.log(LogLevel.NORMAL, chalk.gray('   2. Download for your platform (Mac/Windows/Linux)'));
    this.log(LogLevel.NORMAL, chalk.gray('   3. Install and restart terminal'));
    this.log(LogLevel.NORMAL, chalk.gray('   4. Verify: claude --version\n'));

    this.log(LogLevel.NORMAL, chalk.cyan('🔍 Gemini CLI:'));
    this.log(LogLevel.NORMAL, chalk.gray('   1. Install Node.js/Bun if needed'));
    this.log(LogLevel.NORMAL, chalk.gray('   2. Install globally: npm install -g @google/generative-ai'));
    this.log(LogLevel.NORMAL, chalk.gray('   3. Configure API key (follow prompts)'));
    this.log(LogLevel.NORMAL, chalk.gray('   4. Verify: gemini --version\n'));

    this.log(LogLevel.NORMAL, chalk.green('💡 Once both are installed, run:'));
    this.log(LogLevel.NORMAL, chalk.green('   franken-ai init\n'));
  }

  private async selectTemplates(stack: any, toolStatus: any, options: InitOptions): Promise<GuidelineTemplate[]> {
    this.log(LogLevel.NORMAL, chalk.blue('📋 Loading available guidelines...'));
    
    try {
      const templateManager = new TemplateManager();
      const availableTemplates = await templateManager.getAvailableTemplates(stack, {
        claude: toolStatus.claude.installed,
        gemini: toolStatus.gemini.installed,
      });

      if (availableTemplates.length === 0) {
        this.log(LogLevel.NORMAL, chalk.yellow('ℹ️  No specific guidelines available for detected stack'));
        return [];
      }

      // Auto-select all templates in non-interactive mode
      if (!this.isInteractive || options.yes) {
        this.log(LogLevel.NORMAL, chalk.green(`✅ Auto-selected ${availableTemplates.length} guideline templates`));
        if (this.logLevel >= LogLevel.VERBOSE) {
          availableTemplates.forEach(template => {
            this.log(LogLevel.VERBOSE, chalk.gray(`   • ${template.name}`));
          });
        }
        return availableTemplates;
      }

      // Show available templates and let user select
      this.log(LogLevel.NORMAL, chalk.blue(`📋 Available guidelines for your stack:\n`));
      
      const choices = availableTemplates.map(template => ({
        name: `${this.getCategoryIcon(template.category)} ${template.name}`,
        value: template.id,
        checked: template.enabled,
        short: template.name,
      }));

      const { selectedIds } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedIds',
          message: 'Select guidelines to include in CLAUDE.md:',
          choices,
          pageSize: 10,
          validate: (selection: string[]) => {
            if (selection.length === 0) {
              return 'Please select at least one guideline';
            }
            return true;
          },
        },
      ]);

      const selectedTemplates = availableTemplates.filter(template => 
        selectedIds.includes(template.id)
      );

      this.log(LogLevel.NORMAL, chalk.green(`✅ Selected ${selectedTemplates.length} guideline templates`));
      
      return selectedTemplates;
    } catch (error) {
      this.logError(chalk.red('❌ Failed to load guidelines'));
      throw error;
    }
  }

  private getCategoryIcon(category: string): string {
    const icons = {
      base: '🤖',
      framework: '🏗️',
      language: '💻',
      tool: '⚙️',
    };
    return icons[category as keyof typeof icons] || '📄';
  }

  private async detectStack() {
    this.log(LogLevel.NORMAL, chalk.blue('🔍 Detecting project stack...'));
    
    try {
      const detector = new StackDetector();
      const stack = await detector.detect();
      
      if (stack.frameworks.length > 0) {
        this.log(LogLevel.NORMAL, chalk.green(`✅ Stack detected: ${stack.frameworks.join(', ')}`));
        if (this.logLevel >= LogLevel.VERBOSE) {
          this.log(LogLevel.VERBOSE, chalk.gray(`   Runtime: ${stack.runtime}`));
          this.log(LogLevel.VERBOSE, chalk.gray(`   Languages: ${stack.languages.join(', ')}`));
        }
      } else {
        this.log(LogLevel.NORMAL, chalk.yellow('ℹ️  No specific framework detected (generic setup)'));
      }
      
      return stack;
    } catch (error) {
      this.logError(chalk.red('❌ Stack detection failed'));
      throw error;
    }
  }


  private async generateWorkspace(stack: any, options: InitOptions, toolStatus: any, selectedTemplates: GuidelineTemplate[]) {
    this.log(LogLevel.NORMAL, chalk.blue('📝 Generating enhanced CLAUDE.md...'));
    
    try {
      const generator = new WorkspaceGenerator();
      await generator.enhance(stack, {
        includeDocs: options.docs,
        verbose: this.logLevel >= LogLevel.VERBOSE,
        availableTools: {
          claude: toolStatus.claude.installed,
          gemini: toolStatus.gemini.installed,
        },
        selectedTemplates
      });
      
      this.log(LogLevel.NORMAL, chalk.green('✅ Enhanced CLAUDE.md generated'));
    } catch (error) {
      this.logError(chalk.red('❌ Workspace generation failed'));
      throw error;
    }
  }
}