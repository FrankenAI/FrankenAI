import type {
  FrameworkModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  ModuleContext,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';
import { VueDetection } from './detection.js';

export class VueModule implements FrameworkModule {
  readonly id = 'vue';
  readonly type = 'framework' as const;
  readonly priorityType = 'framework' as const;

  getMetadata(): ModuleMetadata {
    return {
      name: 'vue',
      displayName: 'Vue.js',
      description: 'Vue.js framework module with detection and guidelines',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://vuejs.org',
      keywords: ['javascript', 'typescript', 'framework', 'frontend', 'spa'],
      supportedVersions: ['2.x', '3.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    return VueDetection.detect(context);
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return VueDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core Vue framework guidelines
    paths.push({
      path: 'vue/guidelines/framework.md',
      priority: 'framework',
      category: 'framework',
      version
    });

    // Version-specific guidelines
    if (version) {
      const majorVersion = this.extractMajorVersion(version);
      const versionSpecificPath = `vue/guidelines/${majorVersion}/features.md`;
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
      `${packageManager} run serve`
    ];

    // Build commands
    commands.build = [
      `${packageManager} run build`
    ];

    // Test commands
    commands.test = [
      `${packageManager} run test`,
      `${packageManager} run test:unit`
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
    return VueDetection.getSupportedExtensions();
  }

  getConfigFiles(): string[] {
    return VueDetection.getConfigFiles();
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