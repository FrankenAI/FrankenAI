// Test setup file for FrankenAI
import { beforeAll, afterAll } from 'bun:test';
import fs from 'fs-extra';
import path from 'path';

// Global test setup
beforeAll(async () => {
  // Ensure test fixtures exist
  const fixturesPath = path.join(__dirname, '..', 'test-fixtures');

  if (!await fs.pathExists(fixturesPath)) {
    console.warn('⚠️  Test fixtures not found. Creating minimal fixtures...');
    await createMinimalFixtures(fixturesPath);
  }
});

// Global test cleanup
afterAll(async () => {
  // Cleanup any temporary files created during tests
  // This is handled by individual test cleanups
});

async function createMinimalFixtures(fixturesPath: string) {
  await fs.ensureDir(fixturesPath);

  // Create Vue test fixture
  const vueProjectPath = path.join(fixturesPath, 'test-vue-project');
  await fs.ensureDir(vueProjectPath);
  await fs.writeJson(path.join(vueProjectPath, 'package.json'), {
    name: 'test-vue-project',
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      test: 'vitest',
      lint: 'eslint .'
    },
    dependencies: {
      vue: '^3.4.0'
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.0.0',
      vite: '^5.0.0',
      vitest: '^1.0.0',
      eslint: '^8.0.0'
    }
  });

  // Create React test fixture
  const reactProjectPath = path.join(fixturesPath, 'test-react-project');
  await fs.ensureDir(reactProjectPath);
  await fs.writeJson(path.join(reactProjectPath, 'package.json'), {
    name: 'test-react-project',
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vite build',
      test: 'vitest',
      lint: 'eslint .'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0'
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.0.0',
      vite: '^5.0.0',
      vitest: '^1.0.0',
      eslint: '^8.0.0'
    }
  });

  // Create Next.js test fixture
  const nextProjectPath = path.join(fixturesPath, 'test-next-project');
  await fs.ensureDir(nextProjectPath);
  await fs.writeJson(path.join(nextProjectPath, 'package.json'), {
    name: 'test-next-project',
    version: '1.0.0',
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      test: 'jest',
      lint: 'next lint'
    },
    dependencies: {
      next: '^14.2.0',
      react: '^18.2.0',
      'react-dom': '^18.2.0'
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/react': '^18.0.0',
      eslint: '^8.0.0',
      'eslint-config-next': '^14.0.0',
      typescript: '^5.0.0'
    }
  });

  // Create Nuxt test fixture
  const nuxtProjectPath = path.join(fixturesPath, 'test-nuxt-project');
  await fs.ensureDir(nuxtProjectPath);
  await fs.writeJson(path.join(nuxtProjectPath, 'package.json'), {
    name: 'test-nuxt-project',
    version: '1.0.0',
    scripts: {
      dev: 'nuxt dev',
      build: 'nuxt build',
      generate: 'nuxt generate',
      start: 'nuxt start',
      test: 'vitest',
      lint: 'eslint .'
    },
    dependencies: {
      nuxt: '^3.8.0',
      vue: '^3.4.0'
    },
    devDependencies: {
      '@nuxt/devtools': '^1.0.0',
      vitest: '^1.0.0',
      eslint: '^8.0.0'
    }
  });

  // Create Laravel test fixture
  const laravelProjectPath = path.join(fixturesPath, 'test-laravel-84');
  await fs.ensureDir(laravelProjectPath);
  await fs.writeFile(path.join(laravelProjectPath, 'artisan'), '#!/usr/bin/env php\n<?php\n// Laravel Artisan CLI');
  await fs.writeJson(path.join(laravelProjectPath, 'composer.json'), {
    name: 'test/laravel-app-84',
    type: 'project',
    description: 'Test Laravel application with PHP 8.4',
    require: {
      php: '^8.4.0',
      'laravel/framework': '^12.0'
    }
  });
  await fs.writeJson(path.join(laravelProjectPath, 'composer.lock'), {
    packages: [
      {
        name: 'laravel/framework',
        version: 'v12.0.0',
        description: 'The Laravel Framework'
      }
    ]
  });

  console.log('✅ Created minimal test fixtures');
}