import chalk from 'chalk';
import Table from 'cli-table3';
import fs from 'fs-extra';
import path from 'path';
import type { BaseCommand, CommandSignature } from '../core/types/Command.js';
import type { Command } from 'commander';

export interface StatusOptions {
  verbose?: boolean;
  json?: boolean;
}

interface ClaudeMdSection {
  name: string;
  start: string;
  end: string;
  content: string;
  exists: boolean;
}

interface ParsedClaude {
  exists: boolean;
  fileSize?: number;
  lastModified?: Date;
  sections: ClaudeMdSection[];
  stackInfo?: {
    runtime?: string;
    languages?: string[];
    frameworks?: string[];
    versions?: Record<string, string>;
  };
  commands?: {
    dev?: string[];
    build?: string[];
    test?: string[];
    lint?: string[];
    install?: string[];
  };
  workflowConfigured?: boolean;
  guidelinesConfigured?: boolean;
}

export class StatusCommand implements BaseCommand {
  /**
   * Get command signature metadata
   */
  getSignature(): CommandSignature {
    return {
      name: 'status',
      description: 'Show FrankenAI configuration status by parsing CLAUDE.md',
      category: 'General',
      usage: [
        'franken-ai status',
        'franken-ai status --verbose',
        'franken-ai status --json'
      ],
      options: [
        {
          flags: '-v, --verbose',
          description: 'Show detailed configuration information'
        },
        {
          flags: '--json',
          description: 'Output in JSON format'
        }
      ],
      help: `The status command analyzes your existing CLAUDE.md file to show:
- What stack was detected and configured
- Which command sections are present
- Whether workflow instructions are configured
- Guidelines sections that are active

This is useful to:
- See what's currently configured without regenerating
- Debug CLAUDE.md issues
- Understand what sections need updating

Examples:
  franken-ai status           # Show current configuration
  franken-ai status -v        # Show detailed section content
  franken-ai status --json    # JSON output for automation`
    };
  }

  /**
   * Configure the command
   */
  configure(program: Command): void {
    program
      .command('status')
      .description('Show FrankenAI configuration status by parsing CLAUDE.md')
      .option('-v, --verbose', 'Show detailed configuration information')
      .option('--json', 'Output in JSON format')
      .action((options: StatusOptions) => this.execute(options));
  }

  /**
   * Execute the status command
   */
  async execute(options: StatusOptions): Promise<void> {
    try {
      const claudeConfig = await this.parseClaude();

      if (options.json) {
        console.log(JSON.stringify(claudeConfig, null, 2));
        return;
      }

      await this.displayStatus(claudeConfig, options.verbose || false);

    } catch (error) {
      console.error(chalk.red('Error checking CLAUDE.md status:'), error);
      process.exit(1);
    }
  }

  /**
   * Parse CLAUDE.md and extract configuration
   */
  private async parseClaude(): Promise<ParsedClaude> {
    const claudePath = path.join(process.cwd(), 'CLAUDE.md');

    if (!await fs.pathExists(claudePath)) {
      return { exists: false, sections: [] };
    }

    const content = await fs.readFile(claudePath, 'utf-8');
    const stats = await fs.stat(claudePath);

    // Parse sections with placeholders
    const sections = this.extractSections(content);

    // Extract specific information
    const stackInfo = this.extractStackInfo(content);
    const commands = this.extractCommands(content);
    const workflowConfigured = content.includes('franken-ai:workflow:start');
    const guidelinesConfigured = content.includes('franken-ai:guidelines:start');

    return {
      exists: true,
      fileSize: stats.size,
      lastModified: stats.mtime,
      sections,
      stackInfo,
      commands,
      workflowConfigured,
      guidelinesConfigured
    };
  }

  /**
   * Extract sections marked with placeholders
   */
  private extractSections(content: string): ClaudeMdSection[] {
    const sections: ClaudeMdSection[] = [];

    const sectionPatterns = [
      { name: 'Stack', start: 'franken-ai:stack:start', end: 'franken-ai:stack:end' },
      { name: 'Commands', start: 'franken-ai:commands:start', end: 'franken-ai:commands:end' },
      { name: 'Guidelines', start: 'franken-ai:guidelines:start', end: 'franken-ai:guidelines:end' },
      { name: 'Workflow', start: 'franken-ai:workflow:start', end: 'franken-ai:workflow:end' },
      { name: 'Tools', start: 'franken-ai:tools:start', end: 'franken-ai:tools:end' }
    ];

    for (const pattern of sectionPatterns) {
      const startRegex = new RegExp(`\\[//\\]: # \\(${pattern.start}\\)`, 'g');
      const endRegex = new RegExp(`\\[//\\]: # \\(${pattern.end}\\)`, 'g');

      const startMatch = startRegex.exec(content);
      const endMatch = endRegex.exec(content);

      if (startMatch && endMatch) {
        const sectionContent = content.substring(startMatch.index, endMatch.index + endMatch[0].length);
        sections.push({
          name: pattern.name,
          start: pattern.start,
          end: pattern.end,
          content: sectionContent,
          exists: true
        });
      } else {
        sections.push({
          name: pattern.name,
          start: pattern.start,
          end: pattern.end,
          content: '',
          exists: false
        });
      }
    }

    return sections;
  }

  /**
   * Extract stack information from content
   */
  private extractStackInfo(content: string): any {
    const stackInfo: any = {};

    // Extract runtime
    const runtimeMatch = content.match(/- \*\*Runtime\*\*: (.+)/);
    if (runtimeMatch) {
      stackInfo.runtime = runtimeMatch[1].trim();
    }

    // Extract languages
    const languagesMatch = content.match(/- \*\*Languages\*\*: (.+)/);
    if (languagesMatch) {
      stackInfo.languages = languagesMatch[1].split(',').map(l => l.trim());
    }

    // Extract frameworks
    const frameworksMatch = content.match(/- \*\*Frameworks\*\*: (.+)/);
    if (frameworksMatch) {
      stackInfo.frameworks = frameworksMatch[1].split(',').map(f => f.trim());
    }

    // Extract version information
    const versionMatches = content.match(/- \*\*(.+) Version\*\*: (.+)/g);
    if (versionMatches) {
      stackInfo.versions = {};
      versionMatches.forEach(match => {
        const [, tech, version] = match.match(/- \*\*(.+) Version\*\*: (.+)/) || [];
        if (tech && version) {
          stackInfo.versions[tech] = version.trim();
        }
      });
    }

    return Object.keys(stackInfo).length > 0 ? stackInfo : undefined;
  }

  /**
   * Extract commands from content
   */
  private extractCommands(content: string): any {
    const commands: any = {};

    // Extract different command types
    const commandTypes = ['Development', 'Build', 'Testing', 'Linting', 'Package Management'];

    for (const type of commandTypes) {
      const sectionRegex = new RegExp(`### ${type}\\s*([\\s\\S]*?)(?=###|\\[//\\]: #|$)`, 'i');
      const match = sectionRegex.exec(content);

      if (match) {
        const commandLines = match[1]
          .split('\n')
          .filter(line => line.trim().startsWith('- `'))
          .map(line => {
            const cmdMatch = line.match(/- `([^`]+)`/);
            return cmdMatch ? cmdMatch[1] : null;
          })
          .filter(Boolean);

        if (commandLines.length > 0) {
          const key = type.toLowerCase().replace(' management', '').replace('testing', 'test');
          commands[key] = commandLines;
        }
      }
    }

    return Object.keys(commands).length > 0 ? commands : undefined;
  }

  /**
   * Display status information
   */
  private async displayStatus(claude: ParsedClaude, verbose: boolean): Promise<void> {
    console.log(chalk.bold('📝 FrankenAI Configuration Status'));
    console.log();

    if (!claude.exists) {
      console.log(chalk.yellow('⚠️  CLAUDE.md not found'));
      console.log(chalk.dim('   Run: franken-ai init'));
      return;
    }

    console.log(chalk.green('✅ CLAUDE.md exists'));
    if (claude.lastModified) {
      console.log(chalk.dim(`   Last modified: ${claude.lastModified.toLocaleDateString()}`));
      console.log(chalk.dim(`   Size: ${(claude.fileSize! / 1024).toFixed(1)} KB`));
    }
    console.log();

    // Sections status
    console.log(chalk.bold('📊 Configuration Sections'));
    const sectionsTable = new Table({
      head: ['Section', 'Status', 'Content'],
      style: {
        head: ['cyan'],
        border: ['grey']
      }
    });

    claude.sections.forEach(section => {
      const status = section.exists ? chalk.green('✅ Present') : chalk.red('❌ Missing');
      const contentPreview = section.exists ?
        `${Math.round(section.content.length / 10) * 10} chars` :
        'Not configured';

      sectionsTable.push([section.name, status, contentPreview]);
    });

    console.log(sectionsTable.toString());
    console.log();

    // Stack information
    if (claude.stackInfo) {
      console.log(chalk.bold('🔍 Configured Stack'));
      const stackTable = new Table({
        head: ['Component', 'Details'],
        style: {
          head: ['cyan'],
          border: ['grey']
        }
      });

      if (claude.stackInfo.runtime) {
        stackTable.push(['Runtime', claude.stackInfo.runtime]);
      }
      if (claude.stackInfo.frameworks) {
        stackTable.push(['Frameworks', claude.stackInfo.frameworks.join(', ')]);
      }
      if (claude.stackInfo.languages) {
        stackTable.push(['Languages', claude.stackInfo.languages.join(', ')]);
      }
      if (claude.stackInfo.versions) {
        const versions = Object.entries(claude.stackInfo.versions)
          .map(([tech, version]) => `${tech}: ${version}`)
          .join(', ');
        stackTable.push(['Versions', versions]);
      }

      console.log(stackTable.toString());
      console.log();
    }

    // Commands
    if (claude.commands) {
      console.log(chalk.bold('🚀 Configured Commands'));
      const commandsTable = new Table({
        head: ['Type', 'Commands Available'],
        style: {
          head: ['cyan'],
          border: ['grey']
        }
      });

      Object.entries(claude.commands).forEach(([type, cmds]) => {
        if (Array.isArray(cmds) && cmds.length > 0) {
          const cmdDisplay = cmds.length > 3 ?
            `${cmds.slice(0, 3).join(', ')} (+${cmds.length - 3} more)` :
            cmds.join(', ');
          commandsTable.push([type.charAt(0).toUpperCase() + type.slice(1), cmdDisplay]);
        }
      });

      console.log(commandsTable.toString());
      console.log();
    }

    // Summary
    console.log(chalk.bold('📋 Summary'));
    const configuredSections = claude.sections.filter(s => s.exists).length;
    const totalSections = claude.sections.length;

    console.log(`   ${configuredSections}/${totalSections} sections configured`);
    console.log(`   Workflow: ${claude.workflowConfigured ? chalk.green('Yes') : chalk.yellow('No')}`);
    console.log(`   Guidelines: ${claude.guidelinesConfigured ? chalk.green('Yes') : chalk.yellow('No')}`);

    if (verbose && claude.sections.some(s => s.exists)) {
      console.log();
      console.log(chalk.bold('🔍 Section Details'));
      claude.sections.filter(s => s.exists).forEach(section => {
        console.log(chalk.cyan(`\n${section.name}:`));
        const preview = section.content.substring(0, 200).replace(/\n/g, ' ').trim();
        console.log(chalk.dim(`  ${preview}${section.content.length > 200 ? '...' : ''}`));
      });
    }
  }
}