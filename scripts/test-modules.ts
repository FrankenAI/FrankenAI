#!/usr/bin/env bun

/**
 * Script to run all module tests
 * Usage: bun run test:modules
 */

import { $ } from 'bun';
import path from 'path';
import fs from 'fs';

async function runModuleTests() {
  console.log('🧪 Running module tests...\n');

  try {
    // Find all module test files manually
    const modulesDir = path.join(process.cwd(), 'src', 'modules');
    const testFiles: string[] = [];

    if (!fs.existsSync(modulesDir)) {
      console.log('No modules directory found.');
      return;
    }

    const modules = fs.readdirSync(modulesDir);
    for (const module of modules) {
      const testsDir = path.join(modulesDir, module, 'tests');
      if (fs.existsSync(testsDir)) {
        const testDirFiles = fs.readdirSync(testsDir);
        for (const file of testDirFiles) {
          if (file.endsWith('.test.ts')) {
            testFiles.push(path.join(testsDir, file));
          }
        }
      }
    }

    if (testFiles.length === 0) {
      console.log('No module test files found.');
      return;
    }

    console.log(`Found ${testFiles.length} module test files:`);
    testFiles.forEach(file => {
      const relativePath = path.relative(process.cwd(), file);
      console.log(`  • ${relativePath}`);
    });
    console.log('');

    // Run tests for each module
    for (const testFile of testFiles) {
      const moduleName = path.basename(path.dirname(path.dirname(testFile)));
      console.log(`📦 Testing ${moduleName} module...`);

      try {
        await $`bun test ${testFile}`;
        console.log(`✅ ${moduleName} tests passed\n`);
      } catch (error) {
        console.error(`❌ ${moduleName} tests failed\n`);
        throw error;
      }
    }

    console.log('🎉 All module tests passed!');
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

runModuleTests();