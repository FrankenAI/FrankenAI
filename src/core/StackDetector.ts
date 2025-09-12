import fs from 'fs-extra';
import path from 'path';

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

  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async detect(): Promise<DetectedStack> {
    const configFiles = await this.findConfigFiles();
    const languages = await this.detectLanguages(configFiles);
    const frameworks = await this.detectFrameworks(configFiles);
    const packageManagers = await this.detectPackageManagers();
    const runtime = await this.detectRuntime(configFiles);
    const commands = await this.generateCommands(runtime, frameworks, packageManagers);

    return {
      runtime,
      languages,
      frameworks,
      packageManagers,
      configFiles,
      commands,
    };
  }

  private async findConfigFiles(): Promise<string[]> {
    const configPatterns = [
      'package.json',
      'composer.json',
      'requirements.txt',
      'Pipfile',
      'pyproject.toml',
      'Cargo.toml',
      'go.mod',
      'tsconfig.json',
      'vite.config.js',
      'vite.config.ts',
      'nuxt.config.js',
      'nuxt.config.ts',
      'next.config.js',
      'vue.config.js',
      'artisan',
      'manage.py',
      '.env',
      'docker-compose.yml',
      'Dockerfile',
    ];

    const found: string[] = [];

    for (const pattern of configPatterns) {
      const fullPath = path.join(this.projectRoot, pattern);
      if (await fs.pathExists(fullPath)) {
        found.push(pattern);
      }
    }

    return found;
  }

  private async detectLanguages(configFiles: string[]): Promise<string[]> {
    const languages = new Set<string>();

    if (configFiles.includes('package.json')) {
      languages.add('JavaScript');
      
      const packageJson = await this.readPackageJson();
      if (packageJson?.devDependencies?.typescript || packageJson?.dependencies?.typescript) {
        languages.add('TypeScript');
      }
    }

    if (configFiles.includes('composer.json')) {
      languages.add('PHP');
    }

    if (configFiles.some(f => f.includes('requirements.txt') || f.includes('Pipfile') || f.includes('pyproject.toml'))) {
      languages.add('Python');
    }

    if (configFiles.includes('Cargo.toml')) {
      languages.add('Rust');
    }

    if (configFiles.includes('go.mod')) {
      languages.add('Go');
    }

    return Array.from(languages);
  }

  private async detectFrameworks(configFiles: string[]): Promise<string[]> {
    const frameworks = new Set<string>();

    if (configFiles.includes('artisan')) {
      frameworks.add('Laravel');
    }

    if (configFiles.some(f => f.includes('nuxt.config'))) {
      frameworks.add('Nuxt.js');
    }

    if (configFiles.some(f => f.includes('next.config'))) {
      frameworks.add('Next.js');
    }

    if (configFiles.includes('vue.config.js')) {
      frameworks.add('Vue.js');
    }

    if (configFiles.includes('manage.py')) {
      frameworks.add('Django');
    }

    // Check package.json dependencies
    const packageJson = await this.readPackageJson();
    if (packageJson) {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (allDeps.vue || allDeps['@vue/cli-service']) {
        frameworks.add('Vue.js');
      }
      if (allDeps.react) {
        frameworks.add('React');
      }
      if (allDeps.express) {
        frameworks.add('Express');
      }
      if (allDeps.fastify) {
        frameworks.add('Fastify');
      }
      if (allDeps.nestjs || allDeps['@nestjs/core']) {
        frameworks.add('NestJS');
      }
    }

    return Array.from(frameworks);
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

  private async detectRuntime(configFiles: string[]): Promise<string> {
    if (configFiles.includes('bun.lockb')) return 'bun';
    if (configFiles.includes('package.json')) return 'node';
    if (configFiles.includes('composer.json')) return 'php';
    if (configFiles.some(f => f.includes('requirements.txt') || f.includes('Pipfile'))) return 'python';
    if (configFiles.includes('Cargo.toml')) return 'rust';
    if (configFiles.includes('go.mod')) return 'go';
    
    return 'generic';
  }

  private async generateCommands(
    runtime: string,
    frameworks: string[],
    packageManagers: string[]
  ): Promise<StackCommands> {
    const packageManager = this.getPreferredPackageManager(packageManagers, runtime);
    
    const commands: StackCommands = {
      dev: [],
      build: [],
      test: [],
      lint: [],
      install: [],
    };

    // Install commands
    switch (packageManager) {
      case 'bun':
        commands.install.push('bun install');
        break;
      case 'yarn':
        commands.install.push('yarn install');
        break;
      case 'pnpm':
        commands.install.push('pnpm install');
        break;
      case 'composer':
        commands.install.push('composer install');
        break;
      default:
        commands.install.push('npm install');
    }

    // Framework-specific commands
    if (frameworks.includes('Laravel')) {
      commands.dev.push('php artisan serve');
      commands.test.push('php artisan test');
      commands.build.push('php artisan optimize');
    }

    if (frameworks.includes('Nuxt.js')) {
      commands.dev.push(`${packageManager} run dev`);
      commands.build.push(`${packageManager} run build`);
      commands.test.push(`${packageManager} run test`);
    }

    if (frameworks.includes('Next.js')) {
      commands.dev.push(`${packageManager} run dev`);
      commands.build.push(`${packageManager} run build`);
      commands.test.push(`${packageManager} run test`);
    }

    // Generic Node.js commands
    if (runtime === 'node' || runtime === 'bun') {
      const packageJson = await this.readPackageJson();
      if (packageJson?.scripts) {
        const scripts = packageJson.scripts;
        
        if (scripts.dev) commands.dev.push(`${packageManager} run dev`);
        if (scripts.build) commands.build.push(`${packageManager} run build`);
        if (scripts.test) commands.test.push(`${packageManager} run test`);
        if (scripts.lint) commands.lint.push(`${packageManager} run lint`);
      }
    }

    return commands;
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
}