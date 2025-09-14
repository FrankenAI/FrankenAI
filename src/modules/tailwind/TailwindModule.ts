import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleContext,
  ModuleMetadata,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';

export class TailwindModule implements LibraryModule {
  readonly id = 'tailwind';
  readonly type = 'library';
  readonly priorityType = 'css-framework';

  getMetadata(): ModuleMetadata {
    return {
      name: 'tailwind',
      displayName: 'Tailwind CSS',
      description: 'Tailwind CSS utility-first framework module',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://tailwindcss.com',
      keywords: ['css', 'framework', 'utility-first', 'styling', 'responsive'],
      supportedVersions: ['3.x', '4.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    if (context.packageJson) {
      if (context.packageJson.dependencies?.tailwindcss || context.packageJson.devDependencies?.tailwindcss) {
        evidence.push('tailwindcss in package.json dependencies');
        confidence += 0.8;
      }

      if (context.packageJson.dependencies?.['@tailwindcss/typography'] ||
          context.packageJson.devDependencies?.['@tailwindcss/typography']) {
        evidence.push('Tailwind typography plugin detected');
        confidence += 0.1;
      }

      if (context.packageJson.dependencies?.['@tailwindcss/forms'] ||
          context.packageJson.devDependencies?.['@tailwindcss/forms']) {
        evidence.push('Tailwind forms plugin detected');
        confidence += 0.1;
      }

      if (context.packageJson.dependencies?.['@headlessui/react'] ||
          context.packageJson.dependencies?.['@headlessui/vue'] ||
          context.packageJson.devDependencies?.['@headlessui/react'] ||
          context.packageJson.devDependencies?.['@headlessui/vue']) {
        evidence.push('Headless UI (Tailwind companion) detected');
        confidence += 0.1;
      }
    }

    const configFiles = context.configFiles || [];
    if (configFiles.includes('tailwind.config.js') || configFiles.includes('tailwind.config.ts') ||
        configFiles.includes('tailwind.config.mjs') || configFiles.includes('tailwind.config.cjs')) {
      evidence.push('Tailwind config file found');
      confidence += 0.6;
    }

    if (configFiles.includes('postcss.config.js') || configFiles.includes('postcss.config.ts')) {
      evidence.push('PostCSS config found (commonly used with Tailwind)');
      confidence += 0.1;
    }

    const files = context.files || [];
    const cssFiles = files.filter(file => file.endsWith('.css') || file.endsWith('.scss'));
    const hasTailwindImports = cssFiles.some(file =>
      file.includes('globals.css') || file.includes('app.css') || file.includes('main.css') ||
      file.includes('index.css') || file.includes('style.css')
    );

    if (hasTailwindImports) {
      evidence.push('CSS files that commonly contain Tailwind imports found');
      confidence += 0.2;
    }

    const jsxTsxFiles = files.filter(file =>
      file.endsWith('.jsx') || file.endsWith('.tsx') ||
      file.endsWith('.vue') || file.endsWith('.svelte')
    );

    if (jsxTsxFiles.length > 0) {
      evidence.push(`Component files found: ${jsxTsxFiles.length} (likely to use Tailwind classes)`);
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

    const tailwindVersion =
      context.packageJson.dependencies?.tailwindcss ||
      context.packageJson.devDependencies?.tailwindcss;

    if (tailwindVersion) {
      const match = tailwindVersion.match(/(\d+)/);
      return match ? match[1] : undefined;
    }

    return undefined;
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [
      {
        path: 'tailwind/guidelines/css-framework.md',
        priority: this.priorityType,
        category: 'framework'
      }
    ];

    if (version) {
      const majorVersion = version.split('.')[0];
      paths.push({
        path: `tailwind/guidelines/${majorVersion}/features.md`,
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
      dev: [`${runCmd} dev`],
      build: [`${runCmd} build`],
      test: [`${runCmd} test`],
      lint: [`${runCmd} lint`],
      install: [installCmd]
    };

    const configFiles = context.detectedStack.configFiles;

    if (configFiles.includes('tailwind.config.js') || configFiles.includes('tailwind.config.ts')) {
      commands.build.unshift(`${preferredPM === 'npm' ? 'npx' : preferredPM} tailwindcss build`);
    }

    if (configFiles.includes('postcss.config.js') || configFiles.includes('postcss.config.ts')) {
      commands.build.push(`${preferredPM === 'npm' ? 'npx' : preferredPM} postcss src/styles.css -o dist/styles.css`);
    }

    return commands;
  }

  getSupportedExtensions(): string[] {
    return ['.css', '.scss', '.sass', '.less', '.pcss'];
  }

  getConfigFiles(): string[] {
    return [
      'tailwind.config.js',
      'tailwind.config.ts',
      'tailwind.config.mjs',
      'tailwind.config.cjs',
      'postcss.config.js',
      'postcss.config.ts',
      'package.json'
    ];
  }
}