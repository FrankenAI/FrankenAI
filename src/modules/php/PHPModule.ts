import type {
  LanguageModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  GuidelinePath
} from '../../core/types/Module.js';
import { PHPDetection } from './detection.js';

export class PHPModule implements LanguageModule {
  readonly id = 'php';
  readonly type = 'language' as const;
  readonly priorityType = 'specialized-lang' as const;

  getMetadata(): ModuleMetadata {
    return {
      name: 'php',
      displayName: 'PHP',
      description: 'PHP language module with detection and guidelines',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://www.php.net',
      keywords: ['php', 'language', 'backend', 'server-side'],
      supportedVersions: ['8.1', '8.2', '8.3', '8.4', '8.5']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    return PHPDetection.detect(context);
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return PHPDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core PHP language guidelines
    paths.push({
      path: 'php/guidelines/language.md',
      priority: 'specialized-lang',
      category: 'language',
      version
    });

    // Version-specific guidelines
    if (version) {
      const versionSpecificPath = `php/guidelines/${version}/features.md`;
      paths.push({
        path: versionSpecificPath,
        priority: 'specialized-lang',
        category: 'language',
        version
      });
    }

    return paths;
  }

  getSupportedExtensions(): string[] {
    return PHPDetection.getSupportedExtensions();
  }

  getRuntime(): string {
    return PHPDetection.getRuntime();
  }
}