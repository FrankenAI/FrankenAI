import fs from 'fs-extra';
import path from 'path';
import { DetectedStack } from './StackDetector.js';
import { GuidelineTemplate, TemplateManager } from './TemplateManager.js';

export interface GeneratorOptions {
  includeDocs?: boolean;
  verbose?: boolean;
  projectRoot?: string;
  availableTools?: {
    claude?: boolean;
    gemini?: boolean;
  };
  selectedTemplates?: GuidelineTemplate[];
}

export class WorkspaceGenerator {
  private projectRoot: string;

  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async enhance(stack: DetectedStack, options: GeneratorOptions = {}): Promise<void> {
    const { includeDocs = false, verbose = false } = options;
    const claudeMdPath = path.join(this.projectRoot, 'CLAUDE.md');

    // Read existing CLAUDE.md content
    let existingContent = '';
    if (await fs.pathExists(claudeMdPath)) {
      existingContent = await fs.readFile(claudeMdPath, 'utf-8');
    }

    // Generate enhanced content
    const enhancedContent = this.generateEnhancedContent(existingContent, stack, {
      includeDocs,
      verbose,
    });

    // Write enhanced content back to CLAUDE.md
    await fs.writeFile(claudeMdPath, enhancedContent, 'utf-8');
  }

  private generateEnhancedContent(
    existingContent: string,
    stack: DetectedStack,
    options: GeneratorOptions
  ): string {
    const stackSection = this.generateStackSection(stack);
    const commandsSection = this.generateStackCommands(stack);
    
    // Use templates if provided, otherwise use legacy docs generation
    let guidelinesSection = '';
    if (options.selectedTemplates && options.selectedTemplates.length > 0) {
      const templateManager = new TemplateManager();
      guidelinesSection = templateManager.generateTemplateContent(options.selectedTemplates);
    } else if (options.includeDocs) {
      guidelinesSection = this.generateFrameworkDocs(stack.frameworks);
    }

    const frankenAiSection = this.generateFrankenAiSection(
      stackSection, 
      commandsSection, 
      guidelinesSection,
      options.availableTools
    );

    return this.insertOrUpdateFrankenAiSection(existingContent, frankenAiSection);
  }

  private generateStackSection(stack: DetectedStack): string {
    const frameworks = stack.frameworks.length > 0 ? stack.frameworks.join(', ') : 'Generic';
    const languages = stack.languages.join(', ');

    return `## Detected Stack: ${frameworks}

### Project Information
- **Runtime**: ${stack.runtime}
- **Languages**: ${languages}
- **Frameworks**: ${frameworks}
- **Package Managers**: ${stack.packageManagers.join(', ')}
- **Config Files**: ${stack.configFiles.join(', ')}`;
  }

  generateStackCommands(stack: DetectedStack): string {
    let commandsSection = '\n## Commands\n\n';

    if (stack.commands.dev.length > 0) {
      commandsSection += '### Development\n';
      stack.commands.dev.forEach(cmd => {
        commandsSection += `- \`${cmd}\` - Start development server\n`;
      });
      commandsSection += '\n';
    }

    if (stack.commands.build.length > 0) {
      commandsSection += '### Build\n';
      stack.commands.build.forEach(cmd => {
        commandsSection += `- \`${cmd}\` - Build for production\n`;
      });
      commandsSection += '\n';
    }

    if (stack.commands.test.length > 0) {
      commandsSection += '### Testing\n';
      stack.commands.test.forEach(cmd => {
        commandsSection += `- \`${cmd}\` - Run tests\n`;
      });
      commandsSection += '\n';
    }

    if (stack.commands.lint.length > 0) {
      commandsSection += '### Linting\n';
      stack.commands.lint.forEach(cmd => {
        commandsSection += `- \`${cmd}\` - Run linter\n`;
      });
      commandsSection += '\n';
    }

    if (stack.commands.install.length > 0) {
      commandsSection += '### Package Management\n';
      stack.commands.install.forEach(cmd => {
        commandsSection += `- \`${cmd}\` - Install dependencies\n`;
      });
    }

    // If no commands were found
    if (
      stack.commands.dev.length === 0 &&
      stack.commands.build.length === 0 &&
      stack.commands.test.length === 0 &&
      stack.commands.lint.length === 0 &&
      stack.commands.install.length === 0
    ) {
      commandsSection += 'No specific commands detected for this project.\n';
    }

    return commandsSection;
  }

  generateFrameworkDocs(frameworks: string[]): string {
    if (frameworks.length === 0) {
      return '';
    }

    let docsSection = '\n## Framework Documentation\n\n';

    frameworks.forEach(framework => {
      docsSection += this.getFrameworkSpecificDocs(framework);
    });

    return docsSection;
  }

  private getFrameworkSpecificDocs(framework: string): string {
    const docs: Record<string, string> = {
      'Vue.js': `### Vue.js Best Practices

- **Composition API**: Prefer Composition API over Options API for better TypeScript support
- **Single File Components**: Use \`.vue\` files with \`<script setup>\` syntax
- **Reactivity**: Use \`ref()\` for primitives, \`reactive()\` for objects
- **Props & Emits**: Always define props and emits with TypeScript interfaces

\`\`\`vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  update: [value: number];
}>();
</script>
\`\`\`

`,

      'Nuxt.js': `### Nuxt.js Guidelines

- **Auto-imports**: Leverage Nuxt's auto-import for composables, components, and utilities
- **Server Routes**: Use \`server/api/\` for API endpoints
- **Layouts**: Define layouts in \`layouts/\` directory
- **Middleware**: Use middleware for route protection and logic

\`\`\`typescript
// composables/useAuth.ts (auto-imported)
export const useAuth = () => {
  const user = useState('user', () => null);
  
  const login = async (credentials: LoginCredentials) => {
    // Auth logic
  };
  
  return { user, login };
};
\`\`\`

`,

      'Laravel': `### Laravel Best Practices

- **Eloquent Models**: Use proper relationships and accessors/mutators
- **Service Classes**: Extract complex logic into service classes
- **Form Requests**: Validate data using Form Request classes
- **Artisan Commands**: Create custom commands for repetitive tasks

\`\`\`php
// app/Services/UserService.php
class UserService
{
    public function createUser(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
    }
}
\`\`\`

`,

      'React': `### React Best Practices

- **Functional Components**: Use function components with hooks
- **TypeScript**: Define proper interfaces for props and state
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Error Boundaries**: Implement error boundaries for error handling

\`\`\`typescript
interface UserProps {
  userId: string;
}

const UserProfile: React.FC<UserProps> = ({ userId }) => {
  const { user, loading, error } = useUser(userId);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{user.name}</div>;
};
\`\`\`

`,

      'Next.js': `### Next.js Guidelines

- **App Router**: Use the new App Router (\`app/\` directory)
- **Server Components**: Leverage Server Components for better performance
- **API Routes**: Use Route Handlers in \`app/api/\`
- **Metadata**: Define metadata using the Metadata API

\`\`\`typescript
// app/users/[id]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getUser(params.id);
  return {
    title: \`\${user.name} - Profile\`,
  };
}

export default async function UserPage({ params }: Props) {
  const user = await getUser(params.id);
  return <UserProfile user={user} />;
}
\`\`\`

`,
    };

    return docs[framework] || `### ${framework}\n\nNo specific guidelines available for ${framework}.\n\n`;
  }

  private generateFrankenAiSection(
    stackSection: string,
    commandsSection: string,
    docsSection: string,
    availableTools: { claude?: boolean; gemini?: boolean } = {}
  ): string {
    const workflowSection = this.generateWorkflowSection(availableTools);
    const toolStatusSection = this.generateToolStatusSection(availableTools);

    return `# FrankenAI Configuration

[//]: # (franken-ai:stack:start)
${stackSection}
[//]: # (franken-ai:stack:end)

[//]: # (franken-ai:commands:start)
${commandsSection}
[//]: # (franken-ai:commands:end)

[//]: # (franken-ai:guidelines:start)
${docsSection}
[//]: # (franken-ai:guidelines:end)

[//]: # (franken-ai:workflow:start)
${workflowSection}
[//]: # (franken-ai:workflow:end)

[//]: # (franken-ai:tools:start)
${toolStatusSection}
[//]: # (franken-ai:tools:end)`;
  }

  private generateWorkflowSection(availableTools: { claude?: boolean; gemini?: boolean }): string {
    const { claude = false, gemini = false } = availableTools;

    if (!claude && !gemini) {
      return `## FrankenAI Workflow (Limited)

⚠️  **Both Claude Code and Gemini CLI are missing**
Please install both tools to use the full FrankenAI workflow.

Installation instructions:
- **Claude Code**: Visit https://claude.ai/code
- **Gemini CLI**: Run \`npm install -g @google/generative-ai\``;
    }

    if (!gemini) {
      return `## FrankenAI Workflow (Claude Only)

### Implementation Phase (Use Claude Code)
Switch to Claude Code for development work:
- **File Editing**: Read/Write/Edit tools for specific code changes
- **Framework Tools**: Use framework-specific commands and tools  
- **Command Execution**: Run tests, builds, and development commands
- **Real-time Debugging**: Debug issues and validate implementations

⚠️  **Install Gemini CLI for large-scale codebase analysis**:
\`\`\`bash
npm install -g @google/generative-ai
\`\`\``;
    }

    if (!claude) {
      return `## FrankenAI Workflow (Gemini Only)

### Discovery Phase (Use Gemini CLI)
Use Gemini CLI for large-scale codebase analysis:

\`\`\`bash
# Architecture overview
gemini -p "@src/ @app/ What's the overall architecture and how do components interact?"

# Feature verification  
gemini -p "@src/ @components/ Is user authentication implemented? Show me all auth-related code"

# Pattern detection
gemini -p "@./ Show me all async functions and their purposes with file locations"
\`\`\`

⚠️  **Install Claude Code for precise implementation**:
Visit https://claude.ai/code`;
    }

    // Both tools available - full workflow
    return `## FrankenAI Workflow

### Discovery Phase (Use Gemini CLI)
Use Gemini CLI for large-scale codebase analysis:

\`\`\`bash
# Architecture overview
gemini -p "@src/ @app/ What's the overall architecture and how do components interact?"

# Feature verification  
gemini -p "@src/ @components/ Is user authentication implemented? Show me all auth-related code"

# Pattern detection
gemini -p "@./ Show me all async functions and their purposes with file locations"
\`\`\`

### Implementation Phase (Use Claude Code)
Switch to Claude Code for precise development work:
- **File Editing**: Read/Write/Edit tools for specific code changes
- **Framework Tools**: Use framework-specific commands and tools  
- **Command Execution**: Run tests, builds, and development commands
- **Real-time Debugging**: Debug issues and validate implementations`;
  }

  private generateToolStatusSection(availableTools: { claude?: boolean; gemini?: boolean }): string {
    const { claude = false, gemini = false } = availableTools;

    return `## AI Tool Status

This workspace is configured to work with:
- ${claude ? '✅' : '❌'} Claude Code: Precision implementation and file editing
- ${gemini ? '✅' : '🔍'} Gemini CLI: Large-scale codebase analysis and understanding`;
  }

  private insertOrUpdateFrankenAiSection(existingContent: string, frankenAiSection: string): string {
    if (!existingContent.trim()) {
      return frankenAiSection;
    }

    // Remove ALL existing FrankenAI sections first (clean slate)
    let cleanedContent = this.removeAllFrankenAiSections(existingContent);

    // Append the new FrankenAI section
    if (cleanedContent.trim()) {
      return cleanedContent.trim() + '\n\n' + frankenAiSection;
    } else {
      return frankenAiSection;
    }
  }

  private removeAllFrankenAiSections(content: string): string {
    const lines = content.split('\n');
    const cleanedLines: string[] = [];
    let insideFrankenAi = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if we're entering a FrankenAI section
      if (line.includes('# FrankenAI Configuration')) {
        insideFrankenAi = true;
        continue; // Skip this line
      }

      // Check if we're exiting FrankenAI section (next # heading that's not FrankenAI)
      if (insideFrankenAi && line.startsWith('# ') && !line.includes('FrankenAI')) {
        insideFrankenAi = false;
        cleanedLines.push(line); // Keep this line as it's not FrankenAI
        continue;
      }

      // Check for any FrankenAI delimiter (old or new format)
      if (line.includes('[//]: # (franken-ai:')) {
        if (line.includes(':end)')) {
          insideFrankenAi = false;
        } else if (line.includes(':start)') || !line.includes(':end')) {
          insideFrankenAi = true;
        }
        continue; // Skip delimiter lines
      }

      // If we're not inside FrankenAI section, keep the line
      if (!insideFrankenAi) {
        cleanedLines.push(line);
      }
      // Otherwise skip (we're inside FrankenAI section)
    }

    return cleanedLines.join('\n');
  }
}