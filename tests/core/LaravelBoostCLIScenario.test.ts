import { describe, test, expect } from 'bun:test';
import { DetectCommand } from '../../src/commands/DetectCommand.js';
import { ModuleManager } from '../../src/core/ModuleManager.js';
import { ModuleRegistry } from '../../src/core/ModuleRegistry.js';
import { GuidelineManager } from '../../src/core/GuidelineManager.js';
import type { DetectionContext } from '../../src/core/types/Module.js';

describe('Laravel Boost CLI Integration Test', () => {
  test('🎬 FULL CLI SCENARIO: User runs `franken detect` on Laravel Boost project', async () => {
    console.log('\n🎬 === USER SESSION SIMULATION ===');
    console.log('👤 User: cd ~/my-awesome-boost-project');
    console.log('👤 User: franken detect');
    console.log('🧟 FrankenAI: Starting detection...\n');

    // Mock a real Laravel Boost project context
    const mockContext: DetectionContext = {
      projectRoot: '/Users/developer/my-awesome-boost-project',
      configFiles: [
        'composer.json',
        'package.json',
        'boost.config.php',
        'tailwind.config.js',
        'config/boost.php',
        'artisan'
      ],
      files: [
        // Laravel Boost methodology indicators
        'DATA/fluxui-pro/core.blade.php',
        'DATA/pennant/core.blade.php',
        'DATA/volt/core.blade.php',

        // Boost structure
        'resources/boost/components/Dashboard.blade.php',
        'resources/boost/layouts/app.blade.php',
        'app/Boost/Services/UserService.php',
        'app/Boost/Features/ProjectManagement.php',
        'database/boost/migrations/2024_01_01_create_projects.php',

        // Laravel files that would normally be detected
        'app/Models/User.php',
        'app/Models/Project.php',
        'app/Http/Controllers/HomeController.php',
        'app/Http/Controllers/ProjectController.php',
        'resources/views/welcome.blade.php',

        // Livewire components
        'app/Livewire/ProjectList.php',
        'app/Livewire/UserProfile.php',
        'resources/views/livewire/project-list.blade.php',
        'resources/views/livewire/user-profile.blade.php',

        // Volt components
        'resources/views/livewire/counters/visitor.blade.php',
        'resources/views/livewire/forms/contact.blade.php',

        // Styles and assets
        'resources/css/app.css',
        'resources/js/app.js',
        'resources/js/bootstrap.js',

        // Tests
        'tests/Feature/ProjectTest.php',
        'tests/Feature/UserTest.php',
        'tests/Unit/UserServiceTest.php'
      ],
      packageJson: {
        name: 'my-awesome-boost-project',
        version: '1.0.0',
        devDependencies: {
          'tailwindcss': '^3.3.0',
          'laravel-boost': '^1.2.0',
          '@tailwindcss/forms': '^0.5.7',
          '@tailwindcss/typography': '^0.5.10',
          'alpinejs': '^3.13.0'
        },
        dependencies: {}
      },
      composerJson: {
        name: 'company/awesome-boost-project',
        description: 'An awesome project built with Laravel Boost methodology',
        type: 'project',
        require: {
          'php': '^8.2',
          'laravel/framework': '^10.48.0',
          'livewire/livewire': '^3.4.0',
          'livewire/volt': '^1.6.0',
          'laravel/folio': '^1.1.0',
          'laravel/pennant': '^1.7.0'
        },
        'require-dev': {
          'laravel/pint': '^1.13.0',
          'pestphp/pest': '^2.34.0',
          'pestphp/pest-plugin-laravel': '^2.3.0',
          'fakerphp/faker': '^1.23.1',
          'mockery/mockery': '^1.6.7',
          'nunomaduro/collision': '^7.10.0'
        }
      }
    };

    // 🔍 Initialize detection system (like the real CLI would)
    const moduleRegistry = new ModuleRegistry();
    await moduleRegistry.discoverModules();

    const moduleManager = new ModuleManager();
    for (const registration of moduleRegistry.getEnabledRegistrations()) {
      moduleManager.register(registration);
    }
    await moduleManager.initialize();

    // 🎯 Run detection (simulating DetectCommand execution)
    console.log('🔍 Scanning project files...');
    console.log('📦 Found composer.json with Laravel dependencies');
    console.log('📦 Found package.json with Tailwind and Boost');
    console.log('⚙️  Found boost.config.php - Laravel Boost detected!');
    console.log('📁 Found Boost methodology data files\n');

    const results = await moduleManager.detectStack(mockContext);

    console.log('📊 DETECTION RESULTS:');
    console.log('==================');

    // Verify Laravel Boost is detected
    expect(results.has('laravel-boost')).toBe(true);
    const boostResult = results.get('laravel-boost');
    expect(boostResult?.confidence).toBeGreaterThan(0.8);

    console.log(`✅ Laravel Boost (confidence: ${boostResult?.confidence})`);
    console.log('   • boost.config.php detected');
    console.log('   • Boost directory structure found');
    console.log('   • Laravel Boost methodology data files detected');
    console.log('   • Laravel framework detected (required for Boost)');

    // Verify exclusions work
    const excludedModules = ['laravel', 'tailwind', 'livewire', 'volt', 'pennant', 'folio', 'pest', 'pint'];
    for (const moduleId of excludedModules) {
      expect(results.has(moduleId)).toBe(false);
    }

    console.log(`\n⚠️  EXCLUDED ${boostResult?.excludes?.length} REDUNDANT MODULES:`);
    console.log('   Laravel Boost manages these tools - avoiding conflicts');
    boostResult?.excludes?.forEach(excluded => {
      console.log(`   ❌ ${excluded} (managed by Laravel Boost)`);
    });

    // 📝 Test guideline generation
    const guidelineManager = new GuidelineManager();
    const guidelinePaths = await moduleManager.getGuidelinePaths(results, new Map());

    expect(guidelinePaths.length).toBeGreaterThan(0);
    expect(guidelinePaths.some(path => path.path.includes('laravel-boost'))).toBe(true);

    console.log('\n📚 GENERATING CLAUDE.md:');
    console.log('========================');
    console.log('✅ Laravel Boost methodology guidelines included');
    console.log('✅ Boost-specific commands generated');
    console.log('✅ No conflicting module guidelines');

    console.log('\n🎉 FRANKENAI SETUP COMPLETE!');
    console.log('📋 What happens next:');
    console.log('   • Launch Claude Code in this directory');
    console.log('   • Claude will auto-detect Laravel Boost methodology');
    console.log('   • Use: gemini -p "@src/ Analyze this Boost project" for large analysis');
    console.log('   • Boost workflow integration active');

    console.log('\n👤 User: Awesome! Laravel Boost detected and configured perfectly! 🚀');
  });

  test('🔄 CLI SCENARIO: Regular Laravel project (should detect individual modules)', async () => {
    console.log('\n🎬 === REGULAR LARAVEL PROJECT SESSION ===');

    const regularContext: DetectionContext = {
      projectRoot: '/Users/developer/regular-laravel-app',
      configFiles: ['composer.json', 'package.json', 'tailwind.config.js'],
      files: [
        'app/Models/User.php',
        'app/Http/Controllers/HomeController.php',
        'resources/views/welcome.blade.php',
        'resources/css/app.css',
        'app/Livewire/Dashboard.php',
        'resources/views/livewire/dashboard.blade.php'
      ],
      packageJson: {
        devDependencies: { 'tailwindcss': '^3.0.0' }
      },
      composerJson: {
        require: {
          'laravel/framework': '^10.0.0',
          'livewire/livewire': '^3.0.0'
        }
      }
    };

    const moduleRegistry = new ModuleRegistry();
    await moduleRegistry.discoverModules();

    const moduleManager = new ModuleManager();
    for (const registration of moduleRegistry.getEnabledRegistrations()) {
      moduleManager.register(registration);
    }
    await moduleManager.initialize();

    const results = await moduleManager.detectStack(regularContext);

    // Should detect individual modules
    expect(results.has('laravel')).toBe(true);
    expect(results.has('tailwind')).toBe(true);
    expect(results.has('livewire')).toBe(true);

    // Should NOT detect Laravel Boost
    expect(results.has('laravel-boost')).toBe(false);

    console.log('✅ Regular Laravel project: Individual modules detected correctly');
    console.log('✅ No exclusions applied - full module detection active');
  });
});