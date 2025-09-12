import { exec } from 'child_process';
import { promisify } from 'util';
import which from 'which';

const execAsync = promisify(exec);

export interface ToolStatus {
  installed: boolean;
  version?: string;
  path?: string;
  error?: string;
}

export interface EnvironmentStatus {
  claude: ToolStatus;
  gemini: ToolStatus;
  bun: ToolStatus;
  node: ToolStatus;
}

export class EnvironmentChecker {
  async checkAll(): Promise<EnvironmentStatus> {
    const [claude, gemini, bun, node] = await Promise.all([
      this.checkClaude(),
      this.checkGemini(),
      this.checkBun(),
      this.checkNode(),
    ]);

    return { claude, gemini, bun, node };
  }

  async checkClaude(): Promise<ToolStatus> {
    // Try multiple detection methods
    const detectionMethods = [
      // Method 1: Use user's shell with profile (for aliases)
      () => execAsync('bash -l -c "claude --version"'),
      // Method 2: Use zsh with profile (common on macOS)  
      () => execAsync('zsh -l -c "claude --version"'),
      // Method 3: Direct command (for PATH installations)
      () => execAsync('claude --version'),
      // Method 4: Try common installation paths
      () => execAsync('/usr/local/bin/claude --version'),
      () => execAsync(`${process.env.HOME}/.claude/local/claude --version`),
    ];

    for (const method of detectionMethods) {
      try {
        const { stdout } = await method();
        const version = stdout.trim();

        // Try to get path if possible
        let path: string | undefined;
        try {
          path = await which('claude');
        } catch {
          path = 'claude (detected via shell)';
        }

        return {
          installed: true,
          version,
          path,
        };
      } catch {
        // Continue to next method
      }
    }

    // All methods failed
    return {
      installed: false,
      error: 'Claude CLI not found in PATH, aliases, or common installation paths',
    };
  }

  async checkGemini(): Promise<ToolStatus> {
    try {
      const path = await which('gemini');
      const { stdout } = await execAsync('gemini --version');
      const version = stdout.trim();

      return {
        installed: true,
        version,
        path,
      };
    } catch (error) {
      return {
        installed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkBun(): Promise<ToolStatus> {
    try {
      const path = await which('bun');
      const { stdout } = await execAsync('bun --version');
      const version = stdout.trim();

      return {
        installed: true,
        version,
        path,
      };
    } catch (error) {
      return {
        installed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async checkNode(): Promise<ToolStatus> {
    try {
      const path = await which('node');
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();

      return {
        installed: true,
        version,
        path,
      };
    } catch (error) {
      return {
        installed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async suggestInstallation(tool: string): Promise<string> {
    const suggestions: Record<string, string> = {
      claude: 'Visit https://claude.ai/code to install Claude Code',
      gemini: 'Install with: npm install -g @google/generative-ai',
      bun: 'Install with: curl -fsSL https://bun.sh/install | bash',
      node: 'Install with: https://nodejs.org/ or use a version manager like nvm',
    };

    return suggestions[tool] || `Install ${tool} manually`;
  }
}