import type {
  LibraryModule,
  DetectionContext,
  DetectionResult,
  ModuleContext,
  ModuleMetadata,
  GuidelinePath
} from '../../core/types/Module.js';
import type { StackCommands } from '../../core/StackDetector.js';

export class InertiaModule implements LibraryModule {
  readonly id = 'inertia';
  readonly type = 'library';
  readonly priorityType = 'laravel-tool';

  getMetadata(): ModuleMetadata {
    return {
      name: 'inertia',
      displayName: 'Inertia.js',
      description: 'Inertia.js full-stack framework bridge module',
      version: '1.0.0',
      author: 'FrankenAI',
      homepage: 'https://inertiajs.com',
      keywords: ['inertia', 'fullstack', 'spa', 'laravel', 'bridge'],
      supportedVersions: ['1.x', '2.x']
    };
  }

  async detect(context: DetectionContext): Promise<DetectionResult> {
    const evidence: string[] = [];
    let confidence = 0;

    // Check for Laravel first (Inertia backend requires Laravel)
    if (context.composerJson) {
      const hasLaravel = !!(
        context.composerJson.require?.['laravel/framework'] ||
        context.composerJson['require-dev']?.['laravel/framework']
      );

      if (hasLaravel) {
        // Check for Inertia Laravel adapter
        if (context.composerJson.require?.['inertiajs/inertia-laravel'] ||
            context.composerJson['require-dev']?.['inertiajs/inertia-laravel']) {
          evidence.push('inertiajs/inertia-laravel in composer.json dependencies');
          confidence += 0.7;
        }
      }
    }

    // Check for Inertia frontend packages in package.json
    if (context.packageJson) {
      if (context.packageJson.dependencies?.['@inertiajs/react'] ||
          context.packageJson.devDependencies?.['@inertiajs/react']) {
        evidence.push('Inertia React adapter detected');
        confidence += 0.6;
      }

      if (context.packageJson.dependencies?.['@inertiajs/vue3'] ||
          context.packageJson.devDependencies?.['@inertiajs/vue3']) {
        evidence.push('Inertia Vue 3 adapter detected');
        confidence += 0.6;
      }

      if (context.packageJson.dependencies?.['@inertiajs/vue2'] ||
          context.packageJson.devDependencies?.['@inertiajs/vue2']) {
        evidence.push('Inertia Vue 2 adapter detected');
        confidence += 0.6;
      }

      if (context.packageJson.dependencies?.['@inertiajs/svelte'] ||
          context.packageJson.devDependencies?.['@inertiajs/svelte']) {
        evidence.push('Inertia Svelte adapter detected');
        confidence += 0.6;
      }
    }

    // Check for Inertia directory structure
    const files = context.files || [];
    const inertiaPages = files.filter(file =>
      file.includes('resources/js/Pages/') ||
      file.includes('resources/js/pages/') ||
      file.includes('resources/ts/Pages/') ||
      file.includes('resources/ts/pages/')
    );

    if (inertiaPages.length > 0) {
      evidence.push(`Inertia Pages directory found: ${inertiaPages.length} files`);
      confidence += Math.min(inertiaPages.length * 0.05, 0.3);
    }

    // Check for Inertia middleware
    if (files.some(file => file.includes('app/Http/Middleware') && file.includes('Inertia'))) {
      evidence.push('Inertia middleware found');
      confidence += 0.2;
    }

    // Check for Inertia config files
    const configFiles = context.configFiles || [];
    if (configFiles.includes('config/inertia.php') || files.some(file => file.includes('config/inertia.php'))) {
      evidence.push('Inertia config file found');
      confidence += 0.2;
    }

    // Check for app.js/app.ts with Inertia setup
    const appFiles = files.filter(file =>
      (file.includes('resources/js/app.') || file.includes('resources/ts/app.')) &&
      (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx'))
    );

    if (appFiles.length > 0) {
      evidence.push('Frontend app files found (likely Inertia setup)');
      confidence += 0.1;
    }

    // Check for Inertia-specific imports or usage patterns in JS/TS files
    const jsFiles = files.filter(file =>
      file.endsWith('.js') || file.endsWith('.ts') ||
      file.endsWith('.jsx') || file.endsWith('.tsx') ||
      file.endsWith('.vue') || file.endsWith('.svelte')
    );

    if (jsFiles.length > 0) {
      evidence.push(`Frontend component files found: ${jsFiles.length}`);
      confidence += 0.1;
    }

    // Determine what to exclude based on detected frontend adapters
    const excludes: string[] = [];
    if (context.packageJson) {
      if (context.packageJson.dependencies?.['@inertiajs/vue3'] ||
          context.packageJson.devDependencies?.['@inertiajs/vue3'] ||
          context.packageJson.dependencies?.['@inertiajs/vue2'] ||
          context.packageJson.devDependencies?.['@inertiajs/vue2']) {
        excludes.push('vue');
        evidence.push('Inertia handles Vue integration - excluding standalone Vue guidelines');
      }

      if (context.packageJson.dependencies?.['@inertiajs/react'] ||
          context.packageJson.devDependencies?.['@inertiajs/react']) {
        excludes.push('react');
        evidence.push('Inertia handles React integration - excluding standalone React guidelines');
      }

      if (context.packageJson.dependencies?.['@inertiajs/svelte'] ||
          context.packageJson.devDependencies?.['@inertiajs/svelte']) {
        excludes.push('svelte');
        evidence.push('Inertia handles Svelte integration - excluding standalone Svelte guidelines');
      }
    }

    return {
      detected: confidence >= 0.4,
      confidence: Math.min(confidence, 1),
      evidence,
      excludes: excludes.length > 0 ? excludes : undefined
    };
  }

  async detectVersion(context: DetectionContext): Promise<string | undefined> {
    if (!context.composerJson) return undefined;

    const inertiaVersion =
      context.composerJson.require?.['inertiajs/inertia-laravel'] ||
      context.composerJson['require-dev']?.['inertiajs/inertia-laravel'];

    if (inertiaVersion) {
      const match = inertiaVersion.match(/(\d+)/);
      return match ? match[1] : undefined;
    }

    return undefined;
  }

  async getGuidelinePaths(version?: string): Promise<GuidelinePath[]> {
    const paths: GuidelinePath[] = [
      {
        path: 'inertia/guidelines/laravel-tool.md',
        priority: this.priorityType,
        category: 'framework'
      },
      // Gemini CLI analysis guidelines for Inertia cross-stack complexity
      {
        path: 'inertia/guidelines/gemini-analysis.md',
        priority: this.priorityType,
        category: 'framework'
      }
    ];

    if (version) {
      const majorVersion = version.split('.')[0];
      paths.push({
        path: `inertia/guidelines/${majorVersion}/features.md`,
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
      dev: ['php artisan serve', `${runCmd} dev`],
      build: [`${runCmd} build`, 'php artisan optimize'],
      test: ['php artisan test', `${runCmd} test`],
      lint: ['./vendor/bin/pint', `${runCmd} lint`],
      install: ['composer install', installCmd]
    };

    const configFiles = context.detectedStack.configFiles;

    // Add Inertia-specific commands
    if (configFiles.includes('vite.config.js') || configFiles.includes('vite.config.ts')) {
      commands.dev = [`${runCmd} dev`, 'php artisan serve']; // Vite first for HMR
    }

    if (configFiles.includes('webpack.config.js') || configFiles.includes('webpack.mix.js')) {
      commands.dev?.push(`${runCmd} watch`);
    }

    return commands;
  }

  getSupportedExtensions(): string[] {
    return ['.php', '.blade.php', '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte'];
  }

  getConfigFiles(): string[] {
    return [
      'composer.json',
      'package.json',
      'config/inertia.php',
      'vite.config.js',
      'vite.config.ts',
      'webpack.config.js',
      'webpack.mix.js'
    ];
  }
}