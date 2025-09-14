import type {
  FrameworkModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { AstroDetection } from './detection.js';

export class AstroModule implements FrameworkModule {
  readonly id = 'astro';
  readonly type = 'framework' as const;
  readonly priorityType = 'meta-framework' as const;

  private versionInfo: any; // Will store detailed version info

  getMetadata(): ModuleMetadata {
    return {
      name: 'astro',
      displayName: 'Astro',
      description: 'Astro multi-framework static site generator with detection and guidelines',
      version: this.versionInfo?.installed || this.versionInfo?.raw || '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://astro.build',
      keywords: ['javascript', 'typescript', 'framework', 'static-site', 'multi-framework', 'islands'],
      supportedVersions: ['3.x', '4.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const result = await AstroDetection.detect(context);

    // Store version info for later use
    if (result.detected) {
      this.versionInfo = await AstroDetection.getVersionInfo(context);
    }

    return result;
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return AstroDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Astro framework guidelines
    paths.push({
      path: 'astro/guidelines/framework.md',
      priority: 'meta-framework',
      category: 'framework',
      version
    });

    // Version-specific guidelines
    if (version) {
      const majorVersion = this.extractMajorVersion(version);
      const versionSpecificPath = `astro/guidelines/${majorVersion}/features.md`;
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
      `${packageManager} run preview` // Preview built site
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

    // Astro-specific commands
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
    return AstroDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return AstroDetection.getConfigFiles();
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