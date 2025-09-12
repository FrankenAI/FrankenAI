import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { StackDetector } from '../core/StackDetector.js';
import { EnvironmentChecker } from '../core/EnvironmentChecker.js';
import { TemplateManager } from '../core/TemplateManager.js';

export interface UpdateOptions {
  force?: boolean;
  verbose?: boolean;
}

export class UpdateCommand {
  private readonly availableSections = {
    stack: 'Stack Information',
    commands: 'Project Commands',
    guidelines: 'Framework Guidelines',
    workflow: 'FrankenAI Workflow',
    tools: 'Tool Status',
    all: 'All Sections'
  };

  async execute(section: string | undefined, options: UpdateOptions): Promise<void> {
    console.log(chalk.green.bold('🔄 FrankenAI Update'));
    console.log(chalk.gray('Regenerate sections based on current project state\n'));

    // Check if CLAUDE.md exists
    const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
    if (!await fs.pathExists(claudeMdPath)) {
      console.log(chalk.red('❌ CLAUDE.md not found'));
      console.log(chalk.gray('   Run: franken-ai init first'));
      process.exit(1);
    }

    // Check if FrankenAI section exists
    const currentContent = await fs.readFile(claudeMdPath, 'utf-8');
    if (!currentContent.includes('[//]: # (franken-ai:')) {
      console.log(chalk.yellow('⚠️  No FrankenAI sections found in CLAUDE.md'));
      console.log(chalk.gray('   Run: franken-ai init to add FrankenAI configuration'));
      process.exit(1);
    }

    // Show what changed in the project
    await this.showProjectChanges(options);

    // Determine which section to update
    let targetSection: string;
    
    if (section && this.availableSections[section as keyof typeof this.availableSections]) {
      targetSection = section;
    } else {
      const { selectedSection } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selectedSection',
          message: 'Which section would you like to regenerate?',
          choices: Object.entries(this.availableSections).map(([key, name]) => ({
            name: `🔄 ${name}`,
            value: key,
            short: name,
          })),
        },
      ]);
      targetSection = selectedSection;
    }

    // Perform the update
    await this.updateSection(targetSection, options);
    
    console.log(chalk.green('✅ Section regenerated successfully'));
  }

  private async showProjectChanges(options: UpdateOptions): Promise<void> {
    if (!options.verbose) return;

    console.log(chalk.blue('📋 Current project state:'));
    const stackDetector = new StackDetector();
    const stack = await stackDetector.detect();
    
    console.log(chalk.gray(`   Frameworks: ${stack.frameworks.join(', ') || 'None'}`));
    console.log(chalk.gray(`   Languages: ${stack.languages.join(', ')}`));
    console.log(chalk.gray(`   Runtime: ${stack.runtime}`));
    console.log('');
  }

  private async updateSection(section: string, options: UpdateOptions): Promise<void> {
    console.log(chalk.blue(`🔄 Updating ${this.availableSections[section as keyof typeof this.availableSections]}...`));

    // Read current CLAUDE.md
    const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
    const currentContent = await fs.readFile(claudeMdPath, 'utf-8');

    if (section === 'all') {
      // Regenerate everything - easier to just call init logic
      console.log(chalk.yellow('🔄 Regenerating entire FrankenAI section...'));
      // This would call the main init logic - simplified for now
      console.log(chalk.gray('   Tip: Use franken-ai init --force for full regeneration'));
      return;
    }

    // Get fresh data
    const stackDetector = new StackDetector();
    const stack = await stackDetector.detect();
    
    const envChecker = new EnvironmentChecker();
    const toolStatus = await envChecker.checkAll();

    let newSectionContent = '';

    switch (section) {
      case 'stack':
        newSectionContent = this.generateStackSection(stack);
        break;
      case 'commands':
        newSectionContent = this.generateCommandsSection(stack);
        break;
      case 'guidelines':
        newSectionContent = await this.regenerateGuidelines(stack, toolStatus);
        break;
      case 'workflow':
        newSectionContent = this.generateWorkflowSection(toolStatus);
        break;
      case 'tools':
        newSectionContent = this.generateToolsSection(toolStatus);
        break;
      default:
        console.log(chalk.red(`❌ Unknown section: ${section}`));
        return;
    }

    // Replace the section content using regex
    const sectionMarker = `[//]: # (franken-ai:${section})`;
    const regex = new RegExp(`${sectionMarker}[\\s\\S]*?(?=\\[//\\]: # \\(franken-ai:|---\\n|$)`, 'g');
    
    const updatedContent = currentContent.replace(regex, `${sectionMarker}\n${newSectionContent}\n\n`);

    if (updatedContent === currentContent) {
      console.log(chalk.yellow(`⚠️  No changes detected for ${section} section`));
      return;
    }

    // Write updated content
    await fs.writeFile(claudeMdPath, updatedContent, 'utf-8');
    
    if (options.verbose) {
      console.log(chalk.gray(`   Updated section: ${section}`));
    }
  }

  private generateStackSection(stack: any): string {
    const frameworks = stack.frameworks.length > 0 ? stack.frameworks.join(', ') : 'Generic';
    
    return `## Detected Stack: ${frameworks}

### Project Information
- **Runtime**: ${stack.runtime}
- **Languages**: ${stack.languages.join(', ')}
- **Frameworks**: ${frameworks}
- **Package Managers**: ${stack.packageManagers.join(', ')}
- **Config Files**: ${stack.configFiles.join(', ')}`;
  }

  private generateCommandsSection(stack: any): string {
    let commandsSection = '## Commands\n\n';

    if (stack.commands.dev.length > 0) {
      commandsSection += '### Development\n';
      stack.commands.dev.forEach((cmd: string) => {
        commandsSection += `- \`${cmd}\` - Start development server\n`;
      });
      commandsSection += '\n';
    }

    if (stack.commands.build.length > 0) {
      commandsSection += '### Build\n';
      stack.commands.build.forEach((cmd: string) => {
        commandsSection += `- \`${cmd}\` - Build for production\n`;
      });
      commandsSection += '\n';
    }

    if (stack.commands.test.length > 0) {
      commandsSection += '### Testing\n';
      stack.commands.test.forEach((cmd: string) => {
        commandsSection += `- \`${cmd}\` - Run tests\n`;
      });
    }

    return commandsSection;
  }

  private generateWorkflowSection(toolStatus: any): string {
    const claude = toolStatus.claude.installed;
    const gemini = toolStatus.gemini.installed;

    if (claude && gemini) {
      return `## FrankenAI Workflow

### Discovery Phase (Use Gemini CLI)
Use Gemini CLI for large-scale codebase analysis:

\`\`\`bash
# Architecture overview
gemini -p "@src/ @app/ What's the overall architecture and how do components interact?"
\`\`\`

### Implementation Phase (Use Claude Code)
Switch to Claude Code for precise development work:
- **File Editing**: Read/Write/Edit tools for specific code changes`;
    } else {
      return `## FrankenAI Workflow (Limited)

⚠️  Install missing tools for full FrankenAI functionality`;
    }
  }

  private generateToolsSection(toolStatus: any): string {
    return `## AI Tool Status

This workspace is configured to work with:
- ${toolStatus.claude.installed ? '✅' : '❌'} Claude Code: Precision implementation and file editing  
- ${toolStatus.gemini.installed ? '✅' : '❌'} Gemini CLI: Large-scale codebase analysis and understanding`;
  }

  private async regenerateGuidelines(stack: any, toolStatus: any): Promise<string> {
    console.log(chalk.blue('  📋 Detecting available templates...'));
    
    const templateManager = new TemplateManager();
    const availableTemplates = await templateManager.getAvailableTemplates(stack, {
      claude: toolStatus.claude.installed,
      gemini: toolStatus.gemini.installed,
    });

    if (availableTemplates.length === 0) {
      return '## Guidelines\n\nNo specific guidelines available for current stack.';
    }

    console.log(chalk.gray(`      Found ${availableTemplates.length} templates`));
    
    // Auto-select all available templates for regeneration
    const content = templateManager.generateTemplateContent(availableTemplates);
    
    return content || '## Guidelines\n\nNo guidelines generated.';
  }
}