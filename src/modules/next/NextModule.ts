import type {
  FrameworkModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { NextDetection } from './detection.js';

export class NextModule implements FrameworkModule {
  readonly id = 'next';
  readonly type = 'framework' as const;
  readonly priorityType = 'meta-framework' as const;

  getMetadata(): ModuleMetadata {
    return {
      name: 'next',
      displayName: 'Next.js',
      description: 'Next.js React framework module with detection and guidelines',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://nextjs.org',
      keywords: ['javascript', 'typescript', 'react', 'framework', 'ssr', 'static-site'],
      supportedVersions: ['13.x', '14.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    return NextDetection.detect(context);
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return NextDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Next.js framework guidelines
    paths.push({
      path: 'next/guidelines/framework.md',
      priority: 'meta-framework',
      category: 'framework',
      version
    });

    // Version-specific guidelines
    if (version) {
      const majorVersion = this.extractMajorVersion(version);
      const versionSpecificPath = `next/guidelines/${majorVersion}/features.md`;
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
      `${packageManager} run export` // For static export
    ];

    // Start production server
    commands.dev.push(`${packageManager} run start`);

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

    // Installation commands
    commands.install = [
      `${packageManager} install`
    ];

    return commands;
  }

  getSupportedExtensions(): string[] {
    return NextDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return NextDetection.getConfigFiles();
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