import type {
  LanguageModule,
  DetectionContext,
  DetectionResult,
  ModuleMetadata,
  GuidelinePath
} from '../../core/types/Module.js';
import { JavaScriptDetection } from './detection.js';

export class JavaScriptModule implements LanguageModule {
  readonly id = 'javascript';
  readonly type = 'language' as const;
  readonly priorityType = 'base-lang' as const;

  getMetadata(): ModuleMetadata {
    return {
      name: 'javascript',
      displayName: 'JavaScript',
      description: 'JavaScript language module with detection and guidelines',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      keywords: ['javascript', 'language', 'frontend', 'backend', 'node'],
      supportedVersions: ['ES2015', 'ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', 'ES2022']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    return JavaScriptDetection.detect(context);
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    return JavaScriptDetection.detectVersion(context);
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [];

    // Core JavaScript language guidelines
    paths.push({
      path: 'javascript/guidelines/language.md',
      priority: 'base-lang',
      category: 'language',
      version
    });

    // Version-specific guidelines (if they exist)
    if (version) {
      const versionSpecificPath = `javascript/guidelines/${version}/features.md`;
      paths.push({
        path: versionSpecificPath,
        priority: 'base-lang',
        category: 'language',
        version
      });
    }

    return paths;
  }

  getSupportedExtensions(): string[] {
    return JavaScriptDetection.getSupportedExtensions();
  }

  getRuntime(): string {
    return JavaScriptDetection.getRuntime();
  }
}