import type {
  FrameworkModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { ReactDetection } from './detection.js';

export class ReactModule implements FrameworkModule {
  readonly id = 'react';
  readonly type = 'framework' as const;
  readonly priorityType = 'framework' as const;

  getMetadata(): ModuleMetadata {
    return {
      name: 'react',
      displayName: 'React',
      description: 'React framework module with detection and guidelines',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://react.dev',
      keywords: ['javascript', 'typescript', 'framework', 'frontend', 'spa', 'jsx'],
      supportedVersions: ['17.x', '18.x', '19.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    return ReactDetection.detect(context);
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return ReactDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core React framework guidelines
    paths.push({
      path: 'react/guidelines/framework.md',
      priority: 'framework',
      category: 'framework',
      version
    });

    // Version-specific guidelines
    if (version) {
      const majorVersion = this.extractMajorVersion(version);
      const versionSpecificPath = `react/guidelines/${majorVersion}/features.md`;
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
      `${packageManager} run dev`,
      `${packageManager} run start`
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

    // Check for Create React App
    const hasCreateReactApp = context.detectedStack.configFiles.includes('react-scripts') ||
                             (context.detectedStack as any).packageJson?.dependencies?.['react-scripts'];

    if (hasCreateReactApp) {
      commands.test.push(`${packageManager} run test -- --coverage`);
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
    return ReactDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return ReactDetection.getConfigFiles();
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