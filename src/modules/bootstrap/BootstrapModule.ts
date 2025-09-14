import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleContext,
  ModuleMetadata,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';

export class BootstrapModule implements LibraryModule {
  readonly id = 'bootstrap';
  readonly type = 'library';
  readonly priorityType = 'css-framework';

  getMetadata(): ModuleMetadata {
    return {
      name: 'bootstrap',
      displayName: 'Bootstrap',
      description: 'Bootstrap CSS framework module',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://getbootstrap.com',
      keywords: ['css', 'framework', 'components', 'responsive', 'grid'],
      supportedVersions: ['4.x', '5.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    if (context.packageJson) {
      if (context.packageJson.dependencies?.bootstrap || context.packageJson.devDependencies?.bootstrap) {
        evidence.push('bootstrap in package.json dependencies');
        confidence += 0.8;
      }

      if (context.packageJson.dependencies?.['bootstrap-icons'] ||
          context.packageJson.devDependencies?.['bootstrap-icons']) {
        evidence.push('Bootstrap Icons detected');
        confidence += 0.1;
      }

      if (context.packageJson.dependencies?.['@popperjs/core'] ||
          context.packageJson.devDependencies?.['@popperjs/core']) {
        evidence.push('Popper.js (Bootstrap dependency) detected');
        confidence += 0.1;
      }

      if (context.packageJson.dependencies?.['react-bootstrap'] ||
          context.packageJson.devDependencies?.['react-bootstrap']) {
        evidence.push('React Bootstrap detected');
        confidence += 0.2;
      }

      if (context.packageJson.dependencies?.['vue-bootstrap'] ||
          context.packageJson.dependencies?.['bootstrap-vue'] ||
          context.packageJson.dependencies?.['bootstrap-vue-next'] ||
          context.packageJson.devDependencies?.['vue-bootstrap'] ||
          context.packageJson.devDependencies?.['bootstrap-vue'] ||
          context.packageJson.devDependencies?.['bootstrap-vue-next']) {
        evidence.push('Vue Bootstrap detected');
        confidence += 0.2;
      }

      if (context.packageJson.dependencies?.['@ng-bootstrap/ng-bootstrap'] ||
          context.packageJson.devDependencies?.['@ng-bootstrap/ng-bootstrap']) {
        evidence.push('Angular Bootstrap (ng-bootstrap) detected');
        confidence += 0.2;
      }
    }

    const files = context.files || [];
    const cssFiles = files.filter(file => file.endsWith('.css') || file.endsWith('.scss'));
    const hasBootstrapImports = cssFiles.some(file =>
      file.includes('bootstrap') || file.includes('vendor')
    );

    if (hasBootstrapImports) {
      evidence.push('CSS files that commonly contain Bootstrap imports found');
      confidence += 0.2;
    }

    const htmlFiles = files.filter(file => file.endsWith('.html'));
    if (htmlFiles.length > 0) {
      evidence.push(`HTML files found: ${htmlFiles.length} (likely to use Bootstrap classes)`);
      confidence += 0.1;
    }

    const componentFiles = files.filter(file =>
      file.endsWith('.jsx') || file.endsWith('.tsx') ||
      file.endsWith('.vue') || file.endsWith('.svelte') ||
      file.endsWith('.component.ts') || file.endsWith('.component.html')
    );

    if (componentFiles.length > 0) {
      evidence.push(`Component files found: ${componentFiles.length} (likely to use Bootstrap classes)`);
      confidence += 0.1;
    }

    const scssFiles = files.filter(file => file.endsWith('.scss'));
    if (scssFiles.length > 0) {
      evidence.push('SCSS files found (commonly used with Bootstrap customization)');
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

    const bootstrapVersion =
      context.packageJson.dependencies?.bootstrap ||
      context.packageJson.devDependencies?.bootstrap;

    if (bootstrapVersion) {
      const match = bootstrapVersion.match(/(\d+)/);
      return match ? match[1] : undefined;
    }

    return undefined;
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [
      {
        path: 'bootstrap/guidelines/css-framework.md',
        priority: this.priorityType,
        category: 'framework'
      }
    ];

    if (version) {
      const majorVersion = version.split('.')[0];
      paths.push({
        path: `bootstrap/guidelines/${majorVersion}/features.md`,
        priority: this.priorityType,
        category: 'framework',
        version: majorVersion
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
    return ['.css', '.scss', '.sass', '.less', '.html'];
  }

  getConfigFiles(): string[] {
    return [
      'package.json',
      'webpack.config.js',
      'webpack.config.ts',
      'gulpfile.js',
      'gulpfile.ts',
      'sass.config.js',
      'bootstrap.config.js'
    ];
  }
}