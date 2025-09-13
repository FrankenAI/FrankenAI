import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { EnvironmentChecker } from '../core/EnvironmentChecker.js';
import { StackDetector } from '../core/StackDetector.js';
import { GuidelineManager, type GuidelineContext } from '../core/GuidelineManager.js';

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

    // Step 5: Template Selection (now automatic based on stack)
    await this.selectTemplates(stack, toolStatus, options);

    // Step 6: Generate Enhanced CLAUDE.md (our main value)
    await this.generateWorkspace(stack, options, toolStatus, null);

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

  private async selectTemplates(stack: any, toolStatus: any, options: InitOptions): Promise<void> {
    // This method is no longer needed with the new GuidelineManager
    // Guidelines are automatically selected based on the detected stack
    this.log(LogLevel.VERBOSE, chalk.gray('Guidelines will be automatically selected based on detected stack'));
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


  private async generateWorkspace(stack: any, options: InitOptions, toolStatus: any, selectedTemplates: any) {
    this.log(LogLevel.NORMAL, chalk.blue('📝 Generating enhanced CLAUDE.md...'));

    try {
      // Detect versions for context
      const context: GuidelineContext = {
        stack,
        phpVersion: await this.detectPHPVersion(),
        laravelVersion: await this.detectLaravelVersion(),
        vueVersion: await this.detectVueVersion(),
        reactVersion: await this.detectReactVersion(),
        nextVersion: await this.detectNextVersion(),
        nuxtVersion: await this.detectNuxtVersion(),
        svelteVersion: await this.detectSvelteVersion(),
        svelteKitVersion: await this.detectSvelteKitVersion(),
      };

      // Use the new GuidelineManager
      const guidelineManager = new GuidelineManager();
      const guidelines = await guidelineManager.collectGuidelines(context);

      if (this.logLevel >= LogLevel.VERBOSE && guidelines.length > 0) {
        this.log(LogLevel.VERBOSE, chalk.gray('Collected guidelines:'));
        guidelines.forEach(guideline => {
          this.log(LogLevel.VERBOSE, chalk.gray(`   • ${guideline.path} (${guideline.category})`));
        });
      }

      // Generate and write the CLAUDE.md content
      const content = guidelineManager.generateClaudeContent(guidelines, context);
      const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
      await fs.writeFile(claudeMdPath, content, 'utf-8');

      this.log(LogLevel.NORMAL, chalk.green('✅ Enhanced CLAUDE.md generated'));

      // Show summary
      const categoryCounts = guidelines.reduce((acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(categoryCounts).forEach(([category, count]) => {
        this.log(LogLevel.NORMAL, chalk.gray(`   • ${this.formatCategory(category)}: ${count} guideline${count > 1 ? 's' : ''}`));
      });
    } catch (error) {
      this.logError(chalk.red('❌ Workspace generation failed'));
      throw error;
    }
  }

  private formatCategory(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  private async detectPHPVersion(): Promise<string | undefined> {
    try {
      const composerPath = path.join(process.cwd(), 'composer.json');
      if (await fs.pathExists(composerPath)) {
        const composer = await fs.readJson(composerPath);
        const phpRequire = composer.require?.php;
        if (phpRequire) {
          // Extract version like "^8.3" -> "8.3"
          const match = phpRequire.match(/(\d+\.\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private async detectLaravelVersion(): Promise<string | undefined> {
    try {
      const composerLockPath = path.join(process.cwd(), 'composer.lock');
      if (await fs.pathExists(composerLockPath)) {
        const composerLock = await fs.readJson(composerLockPath);
        const laravelPackage = composerLock.packages?.find(
          (pkg: any) => pkg.name === 'laravel/framework'
        );
        if (laravelPackage?.version) {
          // Extract version like "v11.0.0" -> "11"
          const match = laravelPackage.version.match(/v?(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private async detectVueVersion(): Promise<string | undefined> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        const vueVersion = packageJson.dependencies?.vue || packageJson.devDependencies?.vue;
        if (vueVersion) {
          // Extract version like "^3.4.0" -> "3"
          const match = vueVersion.match(/(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private async detectReactVersion(): Promise<string | undefined> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        const reactVersion = packageJson.dependencies?.react || packageJson.devDependencies?.react;
        if (reactVersion) {
          // Extract version like "^18.2.0" -> "18"
          const match = reactVersion.match(/(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private async detectNextVersion(): Promise<string | undefined> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        const nextVersion = packageJson.dependencies?.next || packageJson.devDependencies?.next;
        if (nextVersion) {
          // Extract version like "^14.2.0" -> "14"
          const match = nextVersion.match(/(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private async detectNuxtVersion(): Promise<string | undefined> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        const nuxtVersion = packageJson.dependencies?.nuxt || packageJson.devDependencies?.nuxt;
        if (nuxtVersion) {
          // Extract version like "^3.8.0" -> "3"
          const match = nuxtVersion.match(/(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private async detectSvelteVersion(): Promise<string | undefined> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        const svelteVersion = packageJson.dependencies?.svelte || packageJson.devDependencies?.svelte;
        if (svelteVersion) {
          // Extract version like "^4.2.0" -> "4" or "^5.0.0" -> "5"
          const match = svelteVersion.match(/(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }

  private async detectSvelteKitVersion(): Promise<string | undefined> {
    try {
      const packagePath = path.join(process.cwd(), 'package.json');
      if (await fs.pathExists(packagePath)) {
        const packageJson = await fs.readJson(packagePath);
        const svelteKitVersion = packageJson.dependencies?.['@sveltejs/kit'] || packageJson.devDependencies?.['@sveltejs/kit'];
        if (svelteKitVersion) {
          // Extract version like "^1.20.0" -> "1" or "^2.0.0" -> "2"
          const match = svelteKitVersion.match(/(\d+)/);
          return match ? match[1] : undefined;
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return undefined;
  }
}