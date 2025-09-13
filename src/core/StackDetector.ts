import fs from 'fs-extra';
import path from 'path';
import { ModuleManager } from './ModuleManager.js';
import { ModuleRegistry } from './ModuleRegistry.js';
import type { DetectionContext } from './types/Module.js';

export interface DetectedStack {
  runtime: string;
  languages: string[];
  frameworks: string[];
  packageManagers: string[];
  configFiles: string[];
  commands: StackCommands;
}

export interface StackCommands {
  dev: string[];
  build: string[];
  test: string[];
  lint: string[];
  install: string[];
}

export class StackDetector {
  private projectRoot: string;
  private moduleManager: ModuleManager;
  private moduleRegistry: ModuleRegistry;

  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.moduleManager = new ModuleManager();
    this.moduleRegistry = new ModuleRegistry();
  }

  async detect(): Promise<DetectedStack> {
    // Initialize modules
    await this.initializeModules();

    // Prepare detection context
    const context = await this.createDetectionContext();

    // Run module-based detection
    const detectionResults = await this.moduleManager.detectStack(context);
    const versions = await this.moduleManager.detectVersions(context, detectionResults);

    // Extract detected frameworks and languages
    const frameworks: string[] = [];
    const languages: string[] = [];

    for (const [moduleId, result] of detectionResults) {
      const module = this.moduleManager.getModule(moduleId);
      if (module) {
        const displayName = module.getMetadata().displayName;
        if (module.type === 'framework') {
          frameworks.push(displayName);
        } else if (module.type === 'language') {
          languages.push(displayName);
        }
      }
    }

    const packageManagers = await this.detectPackageManagers();
    const runtime = this.determineRuntime(languages, packageManagers);
    const commands = await this.moduleManager.generateCommands(
      {
        projectRoot: this.projectRoot,
        detectedStack: {
          runtime,
          languages,
          frameworks,
          packageManagers,
          configFiles: context.configFiles,
          commands: { dev: [], build: [], test: [], lint: [], install: [] }
        },
        detectionResult: { detected: true, confidence: 1, evidence: [] }
      },
      detectionResults
    );

    return {
      runtime,
      languages,
      frameworks,
      packageManagers,
      configFiles: context.configFiles,
      commands,
    };
  }

  private async initializeModules(): Promise<void> {
    // Discover and register all modules
    await this.moduleRegistry.discoverModules();

    // Register discovered modules with the manager
    for (const registration of this.moduleRegistry.getEnabledRegistrations()) {
      this.moduleManager.register(registration);
    }

    // Initialize the module manager
    await this.moduleManager.initialize();
  }

  private async createDetectionContext(): Promise<DetectionContext> {
    const configFiles = await this.findConfigFiles();
    const files = await this.scanProjectFiles();
    const packageJson = await this.readPackageJson();
    const composerJson = await this.readComposerJson();

    return {
      projectRoot: this.projectRoot,
      configFiles,
      files,
      packageJson,
      composerJson
    };
  }

  private async findConfigFiles(): Promise<string[]> {
    // Get config file patterns from all modules
    const allModules = this.moduleManager.getModules();
    const configPatterns = new Set<string>();

    // Add module-specific config files
    for (const module of allModules) {
      if ('getConfigFiles' in module && typeof module.getConfigFiles === 'function') {
        const moduleConfigs = module.getConfigFiles();
        moduleConfigs.forEach((config: string) => configPatterns.add(config));
      }
    }

    // Add common config files
    const commonPatterns = [
      'package.json', 'composer.json', 'tsconfig.json', '.env',
      'docker-compose.yml', 'Dockerfile', 'requirements.txt', 'Pipfile',
      'pyproject.toml', 'Cargo.toml', 'go.mod', 'manage.py'
    ];
    commonPatterns.forEach(pattern => configPatterns.add(pattern));

    const found: string[] = [];
    for (const pattern of configPatterns) {
      const fullPath = path.join(this.projectRoot, pattern);
      if (await fs.pathExists(fullPath)) {
        found.push(pattern);
      }
    }

    return found;
  }



  private async detectPackageManagers(): Promise<string[]> {
    const managers = new Set<string>();

    if (await fs.pathExists(path.join(this.projectRoot, 'package-lock.json'))) {
      managers.add('npm');
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'yarn.lock'))) {
      managers.add('yarn');
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'pnpm-lock.yaml'))) {
      managers.add('pnpm');
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'bun.lockb'))) {
      managers.add('bun');
    }
    if (await fs.pathExists(path.join(this.projectRoot, 'composer.lock'))) {
      managers.add('composer');
    }

    return Array.from(managers);
  }

  private determineRuntime(languages: string[], packageManagers: string[]): string {
    if (packageManagers.includes('bun')) return 'bun';
    if (packageManagers.includes('npm') || packageManagers.includes('yarn') || packageManagers.includes('pnpm')) return 'node';
    if (packageManagers.includes('composer')) return 'php';

    // Fallback to language-based runtime detection
    if (languages.includes('JavaScript') || languages.includes('TypeScript')) return 'node';
    if (languages.includes('PHP')) return 'php';

    return 'node';
  }


  private getPreferredPackageManager(packageManagers: string[], runtime: string): string {
    if (runtime === 'bun' && packageManagers.includes('bun')) return 'bun';
    if (packageManagers.includes('yarn')) return 'yarn';
    if (packageManagers.includes('pnpm')) return 'pnpm';
    if (packageManagers.includes('composer')) return 'composer';
    return 'npm';
  }

  private async readPackageJson(): Promise<any> {
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      if (await fs.pathExists(packagePath)) {
        return await fs.readJson(packagePath);
      }
    } catch (error) {
      // Ignore errors
    }
    return null;
  }

  private async readComposerJson(): Promise<any> {
    try {
      const composerPath = path.join(this.projectRoot, 'composer.json');
      if (await fs.pathExists(composerPath)) {
        return await fs.readJson(composerPath);
      }
    } catch (error) {
      // Ignore errors
    }
    return null;
  }


  private async scanProjectFiles(): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (dir: string, depth = 0): Promise<void> => {
      if (depth > 3) return; // Limit recursion depth

      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(this.projectRoot, fullPath);

          // Skip node_modules, vendor, and other common ignored directories
          if (entry.name.startsWith('.') ||
              ['node_modules', 'vendor', 'dist', 'build', 'public', '__pycache__'].includes(entry.name)) {
            continue;
          }

          if (entry.isDirectory()) {
            await scanDirectory(fullPath, depth + 1);
          } else if (entry.isFile()) {
            files.push(relativePath);
          }
        }
      } catch (error) {
        // Ignore permission errors or other issues
      }
    };

    await scanDirectory(this.projectRoot);
    return files;
  }

}