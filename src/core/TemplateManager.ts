import fs from 'fs-extra';
import path from 'path';
import { DetectedStack } from './StackDetector.js';
import { PackageRegistry, PackageInfo } from './PackageRegistry.js';

export interface GuidelineTemplate {
  id: string;
  name: string;
  description: string;
  category: 'framework' | 'language' | 'tool' | 'base' | 'package' | 'system' | 'styling';
  content: string;
  enabled: boolean;
  version?: string;
  ecosystem?: string;
}

export interface AvailableTools {
  claude: boolean;
  gemini: boolean;
}


export class TemplateManager {
  private templatesPath: string;

  constructor() {
    // Since __dirname points to dist/ after compilation, we need to go up to project root
    this.templatesPath = path.join(__dirname, '..', '..', 'src', 'templates');
  }

  async getAvailableTemplates(stack: DetectedStack, availableTools: AvailableTools): Promise<GuidelineTemplate[]> {
    const packageInfo = await this.detectPackageVersions();
    const templates: GuidelineTemplate[] = [];

    // Base templates (always available)
    const workflowContent = await this.loadTemplate('base', 'franken-ai-workflow.md');
    if (workflowContent) {
      templates.push({
        id: 'franken-ai-workflow',
        name: 'FrankenAI Workflow',
        description: availableTools.claude && availableTools.gemini 
          ? 'Complete workflow for Claude + Gemini integration'
          : 'FrankenAI workflow patterns (install Claude Code & Gemini CLI for full functionality)',
        category: 'base',
        content: workflowContent,
        enabled: true,
      });
    }

    // Get all package templates using the new registry system
    const packageTemplates = await PackageRegistry.getAllPackageTemplates(packageInfo);
    
    for (const template of packageTemplates) {
      const content = await this.loadTemplateFromPath(template.templatePath);
      
      if (content) {
        // Generate ID from template path
        const pathParts = template.templatePath.split('/');
        const filename = pathParts[pathParts.length - 1].replace('.md', '');
        const id = `${pathParts.slice(0, -1).join('-')}-${filename}`;
        
        templates.push({
          id,
          name: this.generateTemplateName(template.templatePath),
          description: `${template.category} guidelines`,
          category: template.category as 'framework' | 'language' | 'tool' | 'base' | 'package' | 'system' | 'styling',
          content,
          enabled: true,
          ecosystem: template.ecosystem
        });
      }
    }

    return templates;
  }

  private async loadTemplateFromPath(templatePath: string): Promise<string> {
    try {
      const fullPath = path.join(this.templatesPath, templatePath);
      if (await fs.pathExists(fullPath)) {
        return await fs.readFile(fullPath, 'utf-8');
      }
    } catch (error) {
      console.warn(`Failed to load template: ${templatePath}`, error);
    }
    return '';
  }

  private generateTemplateName(templatePath: string): string {
    const pathParts = templatePath.split('/');
    const filename = pathParts[pathParts.length - 1].replace('.md', '');
    
    // Handle version-specific names (like laravel11.md -> Laravel 11)
    const versionMatch = filename.match(/^([a-z]+)([0-9.]+)$/i);
    if (versionMatch) {
      const [, name, version] = versionMatch;
      return `${this.capitalize(name)} ${version} Guidelines`;
    }
    
    // Handle regular names (like laravel.md -> Laravel Guidelines)
    return `${this.capitalize(filename)} Guidelines`;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private async detectPackageVersions(): Promise<PackageInfo[]> {
    const packages: PackageInfo[] = [];

    // Check package.json (npm/bun)
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        for (const [name, version] of Object.entries(allDeps)) {
          packages.push({
            name,
            version: String(version),
            type: 'npm'
          });
        }
      }
    } catch (error) {
      console.warn('Failed to read package.json');
    }

    // Check composer.json (PHP)
    try {
      const composerPath = path.join(process.cwd(), 'composer.json');
      if (await fs.pathExists(composerPath)) {
        const composer = await fs.readJson(composerPath);
        const allDeps = { ...composer.require, ...composer['require-dev'] };
        
        for (const [name, version] of Object.entries(allDeps)) {
          packages.push({
            name,
            version: String(version),
            type: 'composer'
          });
        }
      }
    } catch (error) {
      console.warn('Failed to read composer.json');
    }

    return packages;
  }



  private async loadTemplate(category: string, filename: string): Promise<string> {
    try {
      const templatePath = path.join(this.templatesPath, category, filename);
      if (await fs.pathExists(templatePath)) {
        return await fs.readFile(templatePath, 'utf-8');
      }
    } catch (error) {
      console.warn(`Failed to load template: ${category}/${filename}`, error);
    }
    return '';
  }

  generateTemplateContent(selectedTemplates: GuidelineTemplate[]): string {
    const sections: string[] = [];

    // Group templates by category
    const byCategory = selectedTemplates.reduce((acc, template) => {
      if (!acc[template.category]) acc[template.category] = [];
      acc[template.category].push(template);
      return acc;
    }, {} as Record<string, GuidelineTemplate[]>);

    // Add sections in order of importance
    if (byCategory.base) {
      byCategory.base.forEach(template => {
        sections.push(template.content);
      });
    }

    if (byCategory.framework) {
      sections.push('## Framework Guidelines');
      byCategory.framework.forEach(template => {
        sections.push(template.content);
      });
    }

    if (byCategory.language) {
      sections.push('## Language Guidelines');
      byCategory.language.forEach(template => {
        sections.push(template.content);
      });
    }

    if (byCategory.system) {
      sections.push('## System Guidelines');
      byCategory.system.forEach(template => {
        sections.push(template.content);
      });
    }

    if (byCategory.styling) {
      sections.push('## Styling Guidelines');
      byCategory.styling.forEach(template => {
        sections.push(template.content);
      });
    }

    if (byCategory.package) {
      sections.push('## Package Guidelines');
      byCategory.package.forEach(template => {
        sections.push(template.content);
      });
    }

    if (byCategory.tool) {
      sections.push('## Tool Guidelines');
      byCategory.tool.forEach(template => {
        sections.push(template.content);
      });
    }

    return sections.join('\n\n');
  }
}