import type {
  LanguageModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  GuidelinePath
} from '../../core/types/Module.js';
import { TypeScriptDetection } from './detection.js';

export class TypeScriptModule implements LanguageModule {
  readonly id = 'typescript';
  readonly type = 'language' as const;
  readonly priorityType = 'specialized-lang' as const;

  getMetadata(): ModuleMetadata {
    return {
      name: 'typescript',
      displayName: 'TypeScript',
      description: 'TypeScript language module with detection and guidelines',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://www.typescriptlang.org',
      keywords: ['typescript', 'language', 'javascript', 'types', 'frontend', 'backend'],
      supportedVersions: ['4.0', '4.5', '4.9', '5.0', '5.1', '5.2', '5.3', '5.4']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    return TypeScriptDetection.detect(context);
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return TypeScriptDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core TypeScript language guidelines
    paths.push({
      path: 'typescript/guidelines/language.md',
      priority: 'specialized-lang',
      category: 'language',
      version
    });

    // Version-specific guidelines (if they exist)
    if (version) {
      const versionSpecificPath = `typescript/guidelines/${version}/features.md`;
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
    return TypeScriptDetection.getSupportedExtensions();
  }

  getRuntime(): string {
    return TypeScriptDetection.getRuntime();
  }
}