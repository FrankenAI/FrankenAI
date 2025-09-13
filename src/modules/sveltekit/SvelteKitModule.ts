import type {
  FrameworkModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { SvelteKitDetection } from './detection.js';

export class SvelteKitModule implements FrameworkModule {
  readonly id = 'sveltekit';
  readonly type = 'framework' as const;
  readonly priorityType = 'meta-framework' as const;

  getMetadata(): ModuleMetadata {
    return {
      name: 'sveltekit',
      displayName: 'SvelteKit',
      description: 'SvelteKit full-stack framework module with detection and guidelines',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://kit.svelte.dev',
      keywords: ['javascript', 'typescript', 'svelte', 'framework', 'fullstack', 'ssr'],
      supportedVersions: ['1.x', '2.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    return SvelteKitDetection.detect(context);
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return SvelteKitDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core SvelteKit framework guidelines
    paths.push({
      path: 'sveltekit/guidelines/framework.md',
      priority: 'meta-framework',
      category: 'framework',
      version
    });

    // Version-specific guidelines (if they exist)
    if (version) {
      const majorVersion = this.extractMajorVersion(version);
      const versionSpecificPath = `sveltekit/guidelines/${majorVersion}/features.md`;
      paths.push({
        path: versionSpecificPath,
        priority: 'meta-framework',
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
      `${packageManager} run build`,
      `${packageManager} run preview` // Preview built app
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

    if (context.detectedStack.configFiles.includes('playwright.config.js') ||
        context.detectedStack.configFiles.includes('playwright.config.ts')) {
      commands.test.push(`${packageManager} run test:playwright`);
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
    return SvelteKitDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return SvelteKitDetection.getConfigFiles();
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