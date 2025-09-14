import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleContext,
  ModuleMetadata,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';

export class BulmaModule implements LibraryModule {
  readonly id = 'bulma';
  readonly type = 'library';
  readonly priorityType = 'css-framework';

  getMetadata(): ModuleMetadata {
    return {
      name: 'bulma',
      displayName: 'Bulma',
      description: 'Bulma CSS framework module',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://bulma.io',
      keywords: ['css', 'framework', 'flexbox', 'modern', 'mobile-first'],
      supportedVersions: ['0.9.x', '1.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    if (context.packageJson) {
      if (context.packageJson.dependencies?.bulma || context.packageJson.devDependencies?.bulma) {
        evidence.push('bulma in package.json dependencies');
        confidence += 0.8;
      }

      if (context.packageJson.dependencies?.['@bulma/extensions'] ||
          context.packageJson.devDependencies?.['@bulma/extensions']) {
        evidence.push('Bulma extensions detected');
        confidence += 0.1;
      }

      if (context.packageJson.dependencies?.['bulma-extensions'] ||
          context.packageJson.devDependencies?.['bulma-extensions']) {
        evidence.push('Bulma community extensions detected');
        confidence += 0.1;
      }

      if (context.packageJson.dependencies?.['react-bulma-components'] ||
          context.packageJson.devDependencies?.['react-bulma-components']) {
        evidence.push('React Bulma components detected');
        confidence += 0.2;
      }

      if (context.packageJson.dependencies?.['vue-bulma-components'] ||
          context.packageJson.dependencies?.['buefy'] ||
          context.packageJson.devDependencies?.['vue-bulma-components'] ||
          context.packageJson.devDependencies?.['buefy']) {
        evidence.push('Vue Bulma components detected');
        confidence += 0.2;
      }

      if (context.packageJson.dependencies?.['@angular/cdk'] ||
          context.packageJson.dependencies?.['ngx-bulma'] ||
          context.packageJson.devDependencies?.['@angular/cdk'] ||
          context.packageJson.devDependencies?.['ngx-bulma']) {
        evidence.push('Angular Bulma components detected');
        confidence += 0.2;
      }
    }

    const files = context.files || [];
    const cssFiles = files.filter(file => file.endsWith('.css') || file.endsWith('.scss'));
    const hasBulmaImports = cssFiles.some(file =>
      file.includes('bulma') || file.includes('vendor')
    );

    if (hasBulmaImports) {
      evidence.push('CSS files that commonly contain Bulma imports found');
      confidence += 0.2;
    }

    const htmlFiles = files.filter(file => file.endsWith('.html'));
    if (htmlFiles.length > 0) {
      evidence.push(`HTML files found: ${htmlFiles.length} (likely to use Bulma classes)`);
      confidence += 0.1;
    }

    const componentFiles = files.filter(file =>
      file.endsWith('.jsx') || file.endsWith('.tsx') ||
      file.endsWith('.vue') || file.endsWith('.svelte') ||
      file.endsWith('.component.ts') || file.endsWith('.component.html')
    );

    if (componentFiles.length > 0) {
      evidence.push(`Component files found: ${componentFiles.length} (likely to use Bulma classes)`);
      confidence += 0.1;
    }

    const scssFiles = files.filter(file => file.endsWith('.scss') || file.endsWith('.sass'));
    if (scssFiles.length > 0) {
      evidence.push('SCSS/Sass files found (commonly used with Bulma customization)');
      confidence += 0.1;
    }

    return {
      detected: confidence > 0.3,
      confidence: Math.min(confidence, 1),
      evidence
    };
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    if (!context.packageJson) return undefined;

    const bulmaVersion =
      context.packageJson.dependencies?.bulma ||
      context.packageJson.devDependencies?.bulma;

    if (bulmaVersion) {
      const match = bulmaVersion.match(/(\d+)/);
      if (match) {
        const major = parseInt(match[1]);
        return major >= 1 ? '1' : '0.9';
      }
    }

    return undefined;
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [
      {
        path: 'bulma/guidelines/css-framework.md',
        priority: this.priorityType,
        category: 'framework'
      }
    ];

    if (version) {
      const majorVersion = version.split('.')[0];
      const versionPath = majorVersion === '1' ? '1' : '0.9';
      paths.push({
        path: `bulma/guidelines/${versionPath}/features.md`,
        priority: this.priorityType,
        category: 'framework',
        version: versionPath
      });
    }

    return paths;
  }

  async generateCommands(context: ModuleContext): Promise<StackCommands> {
    const packageManagers = context.detectedStack.packageManagers;
    const preferredPM = packageManagers.includes('bun') ? 'bun' :
                       packageManagers.includes('yarn') ? 'yarn' : 'npm';

    const runCmd = preferredPM === 'npm' ? 'npm run' : `${preferredPM} run`;
    const installCmd = preferredPM === 'bun' ? 'bun install' :
                      preferredPM === 'yarn' ? 'yarn install' : 'npm install';

    const commands: StackCommands = {
      dev: [`${runCmd} dev`, `${runCmd} serve`, `${runCmd} start`],
      build: [`${runCmd} build`],
      test: [`${runCmd} test`],
      lint: [`${runCmd} lint`],
      install: [installCmd]
    };

    const configFiles = context.detectedStack.configFiles;

    if (configFiles.includes('webpack.config.js') || configFiles.includes('webpack.config.ts')) {
      commands.build.unshift(`${preferredPM === 'npm' ? 'npx' : preferredPM} webpack --mode production`);
    }

    if (configFiles.includes('gulpfile.js') || configFiles.includes('gulpfile.ts')) {
      commands.build.push(`${preferredPM === 'npm' ? 'npx' : preferredPM} gulp build`);
      commands.dev.unshift(`${preferredPM === 'npm' ? 'npx' : preferredPM} gulp watch`);
    }

    const languages = context.detectedStack.languages;
    if (languages.includes('SCSS') || languages.includes('Sass')) {
      commands.build.push(`${preferredPM === 'npm' ? 'npx' : preferredPM} sass src/scss:dist/css`);
    }

    return commands;
  }

  getSupportedExtensions(): string[] {
    return ['.css', '.scss', '.sass', '.html'];
  }

  getConfigFiles(): string[] {
    return [
      'package.json',
      'webpack.config.js',
      'webpack.config.ts',
      'gulpfile.js',
      'gulpfile.ts',
      'sass.config.js',
      'bulma.config.js'
    ];
  }
}