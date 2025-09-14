import type {
  FrameworkModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { SvelteDetection } from './detection.js';

export class SvelteModule implements FrameworkModule {
  readonly id = 'svelte';
  readonly type = 'framework' as const;
  readonly priorityType = 'framework' as const;

  private versionInfo: any; // Will store detailed version info

  getMetadata(): ModuleMetadata {
    return {
      name: 'svelte',
      displayName: 'Svelte',
      description: 'Svelte framework module with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://svelte.dev',
      keywords: ['javascript', 'typescript', 'framework', 'frontend', 'compiler'],
      supportedVersions: ['3.x', '4.x', '5.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await SvelteDetection.detect(context);

    // Store version info for later use
    if (result.detected) {
      this.versionInfo = await SvelteDetection.getVersionInfo(context);
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return SvelteDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Svelte framework guidelines
    paths.push({
      path: 'svelte/guidelines/framework.md',
      priority: 'framework',
      category: 'framework',
      version
    });

    // Version-specific guidelines (if they exist)
    if (version) {
      const majorVersion = this.extractMajorVersion(version);
      const versionSpecificPath = `svelte/guidelines/${majorVersion}/features.md`;
      paths.push({
        path: versionSpecificPath,
        priority: 'framework',
        category: 'framework',
        version: majorVersion
      });
    }

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<Partial<StackCommands>> {
    const commands: Partial<StackCommands> = {
      dev: [],
      build: [],
      test: [],
      lint: [],
      install: []
    };

    // Determine package manager
    const packageManager = this.getPreferredPackageManager(context.detectedStack.packageManagers);

    // Development commands
    commands.dev = [
      `${packageManager} run dev`
    ];

    // Build commands
    commands.build = [
      `${packageManager} run build`
    ];

    // Test commands
    commands.test = [
      `${packageManager} run test`
    ];

    // Check for specific test frameworks
    if (context.detectedStack.configFiles.includes('vitest.config.js') ||
        context.detectedStack.configFiles.includes('vitest.config.ts')) {
      commands.test.push(`${packageManager} run test:vitest`);
    }

    if (context.detectedStack.configFiles.includes('jest.config.js') ||
        context.detectedStack.configFiles.includes('jest.config.ts')) {
      commands.test.push(`${packageManager} run test:jest`);
    }

    // Linting commands
    commands.lint = [
      `${packageManager} run lint`,
      `${packageManager} run lint:fix`
    ];

    // Check if using svelte-check
    if (context.detectedStack.configFiles.includes('tsconfig.json')) {
      commands.lint.push(`${packageManager} run check`);
    }

    // Installation commands
    commands.install = [
      `${packageManager} install`
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return SvelteDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return SvelteDetection.getConfigFiles();
  }

  private extractMajorVersion(version: string): string {
    const match = version.match(/^[^\d]*(\d+)/);
    return match ? match[1] : version;
  }

  private getPreferredPackageManager(packageManagers: string[]): string {
    if (packageManagers.includes('bun')) return 'bun';
    if (packageManagers.includes('yarn')) return 'yarn';
    if (packageManagers.includes('pnpm')) return 'pnpm';
    return 'npm';
  }
}