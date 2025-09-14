import { describe, test, expect } from 'bun:test';
import { ModuleManager } from '../../src/core/ModuleManager.js';
import { LaravelBoostModule } from '../../src/modules/laravel-boost/LaravelBoostModule.js';
import { LaravelModule } from '../../src/modules/laravel/LaravelModule.js';
import { TailwindModule } from '../../src/modules/tailwind/TailwindModule.js';
import { LivewireModule } from '../../src/modules/livewire/LivewireModule.js';
import { VoltModule } from '../../src/modules/volt/VoltModule.js';
import { PestModule } from '../../src/modules/pest/PestModule.js';
import type { DetectionContext, ModuleRegistration } from '../../src/core/types/Module.js';

describe('Laravel Boost User Scenarios - Real World Tests', () => {

  async function createModuleManager() {
    const moduleManager = new ModuleManager();

    const modules = [
      { id: 'laravel-boost', factory: () => new LaravelBoostModule() },
      { id: 'laravel', factory: () => new LaravelModule() },
      { id: 'tailwind', factory: () => new TailwindModule() },
      { id: 'livewire', factory: () => new LivewireModule() },
      { id: 'volt', factory: () => new VoltModule() },
      { id: 'pest', factory: () => new PestModule() }
    ];

    for (const module of modules) {
      const registration: ModuleRegistration = {
        id: module.id,
        factory: async () => module.factory(),
        enabled: true
      };
      moduleManager.register(registration);
    }

    await moduleManager.initialize();
    return moduleManager;
  }

  test('🚀 USER SCENARIO: Laravel Boost project with full stack', async () => {
    const moduleManager = await createModuleManager();

    // 🎯 SIMULATE: User runs FrankenAI on Laravel Boost project
    const context: DetectionContext = {
      projectRoot: '/user/awesome-boost-project',
      configFiles: [
        'composer.json',
        'package.json',
        'boost.config.php',
        'tailwind.config.js',
        'pest.config.php'
      ],
      files: [
        // Laravel Boost methodology files
        'DATA/fluxui-pro/core.blade.php',
        'DATA/pennant/core.blade.php',
        'DATA/volt/core.blade.php',

        // Boost directory structure
        'resources/boost/components/UserProfile.blade.php',
        'resources/boost/layouts/app.blade.php',
        'app/Boost/Features/UserManagement.php',
        'database/boost/migrations/create_users_table.php',

        // Standard Laravel files (would normally be detected)
        'app/Models/User.php',
        'app/Http/Controllers/UserController.php',
        'resources/views/welcome.blade.php',
        'resources/css/app.css',

        // Livewire components
        'app/Livewire/UserDashboard.php',
        'resources/views/livewire/user-dashboard.blade.php',

        // Volt components
        'resources/views/livewire/profile/edit.blade.php',

        // Tests
        'tests/Feature/UserTest.php'
      ],
      packageJson: {
        devDependencies: {
          'tailwindcss': '^3.0.0',
          'laravel-boost': '^1.0.0',
          '@tailwindcss/forms': '^0.5.0'
        }
      },
      composerJson: {
        require: {
          'laravel/framework': '^10.0.0',
          'livewire/livewire': '^3.0.0',
          'livewire/volt': '^1.0.0'
        },
        'require-dev': {
          'pestphp/pest': '^2.0.0',
          'laravel/pint': '^1.0.0'
        }
      }
    };

    // 🔍 DETECTION PHASE
    console.log('\n🧟 FrankenAI analyzing user\'s Laravel Boost project...');
    const results = await moduleManager.detectStack(context);

    console.log('\n📊 Detection Results:');
    for (const [moduleId, result] of results) {
      console.log(`   ✅ ${moduleId} (confidence: ${result.confidence})`);
    }

    // ✅ ASSERTIONS: Laravel Boost should be detected
    expect(results.has('laravel-boost')).toBe(true);
    const boostResult = results.get('laravel-boost');
    expect(boostResult?.confidence).toBeGreaterThan(0.8);

    // ❌ ASSERTIONS: Redundant modules should be EXCLUDED
    expect(results.has('laravel')).toBe(false); // Excluded by Boost
    expect(results.has('tailwind')).toBe(false); // Excluded by Boost
    expect(results.has('livewire')).toBe(false); // Excluded by Boost
    expect(results.has('volt')).toBe(false); // Excluded by Boost
    expect(results.has('pest')).toBe(false); // Excluded by Boost

    // ✅ Check exclusion list
    expect(boostResult?.excludes).toContain('laravel');
    expect(boostResult?.excludes).toContain('tailwind');
    expect(boostResult?.excludes).toContain('livewire');
    expect(boostResult?.excludes).toContain('volt');
    expect(boostResult?.excludes).toContain('pest');

    console.log('\n🎯 Result: Laravel Boost detected, redundant modules excluded!');
    console.log(`   📋 Excluded ${boostResult?.excludes?.length} modules to avoid conflicts`);
  });

  test('🔄 USER SCENARIO: Regular Laravel project (no boost)', async () => {
    const moduleManager = await createModuleManager();

    // 🎯 SIMULATE: User runs FrankenAI on regular Laravel project
    const context: DetectionContext = {
      projectRoot: '/user/regular-laravel-project',
      configFiles: ['composer.json', 'package.json', 'tailwind.config.js'],
      files: [
        'app/Models/User.php',
        'app/Http/Controllers/HomeController.php',
        'resources/views/welcome.blade.php',
        'resources/css/app.css',
        'app/Livewire/Counter.php',
        'resources/views/livewire/counter.blade.php',
        'tests/Feature/ExampleTest.php'
      ],
      packageJson: {
        devDependencies: {
          'tailwindcss': '^3.0.0'
        }
      },
      composerJson: {
        require: {
          'laravel/framework': '^10.0.0',
          'livewire/livewire': '^3.0.0'
        },
        'require-dev': {
          'pestphp/pest': '^2.0.0'
        }
      }
    };

    // 🔍 DETECTION PHASE
    console.log('\n🧟 FrankenAI analyzing regular Laravel project...');
    const results = await moduleManager.detectStack(context);

    console.log('\n📊 Detection Results:');
    for (const [moduleId, result] of results) {
      console.log(`   ✅ ${moduleId} (confidence: ${result.confidence})`);
    }

    // ✅ ASSERTIONS: Individual modules should be detected
    expect(results.has('laravel')).toBe(true);
    expect(results.has('tailwind')).toBe(true);
    expect(results.has('livewire')).toBe(true);
    expect(results.has('pest')).toBe(true);

    // ❌ ASSERTIONS: Laravel Boost should NOT be detected
    expect(results.has('laravel-boost')).toBe(false);

    console.log('\n🎯 Result: Individual modules detected, no exclusions needed');
  });

  test('⚡ USER SCENARIO: Boost detection edge cases', async () => {
    const moduleManager = await createModuleManager();

    // Test minimal boost detection
    const minimalBoostContext: DetectionContext = {
      projectRoot: '/user/minimal-boost',
      configFiles: ['composer.json', 'boost.config.js'],
      files: ['app/Models/User.php'],
      packageJson: null,
      composerJson: {
        require: { 'laravel/framework': '^10.0.0' }
      }
    };

    const results = await moduleManager.detectStack(minimalBoostContext);

    console.log('\n🧪 Minimal Boost Detection Test:');
    console.log(`   Laravel Boost detected: ${results.has('laravel-boost')}`);
    console.log(`   Laravel excluded: ${!results.has('laravel')}`);

    expect(results.has('laravel-boost')).toBe(true);
    expect(results.has('laravel')).toBe(false);
  });
});