import { describe, test, expect, beforeEach } from 'bun:test';
import { ModuleManager } from '../../src/core/ModuleManager.js';
import { LaravelBoostModule } from '../../src/modules/laravel-boost/LaravelBoostModule.js';
import { LaravelModule } from '../../src/modules/laravel/LaravelModule.js';
import { TailwindModule } from '../../src/modules/tailwind/TailwindModule.js';
import type { DetectionContext, ModuleRegistration } from '../../src/core/types/Module.js';

describe('Laravel Boost Exclusion Integration', () => {
  let moduleManager: ModuleManager;

  beforeEach(async () => {
    moduleManager = new ModuleManager();

    // Register Laravel Boost module
    const boostRegistration: ModuleRegistration = {
      id: 'laravel-boost',
      factory: async () => new LaravelBoostModule(),
      enabled: true
    };

    // Register Laravel module
    const laravelRegistration: ModuleRegistration = {
      id: 'laravel',
      factory: async () => new LaravelModule(),
      enabled: true
    };

    // Register Tailwind module
    const tailwindRegistration: ModuleRegistration = {
      id: 'tailwind',
      factory: async () => new TailwindModule(),
      enabled: true
    };

    moduleManager.register(boostRegistration);
    moduleManager.register(laravelRegistration);
    moduleManager.register(tailwindRegistration);

    await moduleManager.initialize();
  });

  test('should exclude Laravel modules when Laravel Boost is detected', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['composer.json', 'boost.config.php', 'tailwind.config.js'],
      files: [
        'resources/boost/components/UserCard.blade.php',
        'app/Models/User.php',
        'resources/css/app.css'
      ],
      packageJson: {
        devDependencies: {
          'tailwindcss': '^3.0.0'
        }
      },
      composerJson: {
        require: {
          'laravel/framework': '^10.0.0'
        }
      }
    };

    const results = await moduleManager.detectStack(context);

    // Laravel Boost should be detected
    expect(results.has('laravel-boost')).toBe(true);

    // Laravel and Tailwind should be excluded
    expect(results.has('laravel')).toBe(false);
    expect(results.has('tailwind')).toBe(false);

    // Check Laravel Boost result has exclusions
    const boostResult = results.get('laravel-boost');
    expect(boostResult?.excludes).toBeDefined();
    expect(boostResult?.excludes).toContain('laravel');
    expect(boostResult?.excludes).toContain('tailwind');
  });

  test('should not exclude modules when Laravel Boost is not detected', async () => {
    const context: DetectionContext = {
      projectRoot: '/test',
      configFiles: ['composer.json', 'tailwind.config.js'],
      files: [
        'app/Models/User.php',
        'app/Http/Controllers/UserController.php',
        'resources/css/app.css'
      ],
      packageJson: {
        devDependencies: {
          'tailwindcss': '^3.0.0'
        }
      },
      composerJson: {
        require: {
          'laravel/framework': '^10.0.0'
        }
      }
    };

    const results = await moduleManager.detectStack(context);

    // Laravel Boost should NOT be detected
    expect(results.has('laravel-boost')).toBe(false);

    // Laravel and Tailwind should be detected normally
    expect(results.has('laravel')).toBe(true);
    expect(results.has('tailwind')).toBe(true);
  });
});