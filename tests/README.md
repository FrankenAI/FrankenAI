# FrankenAI Test Suite

## Structure

```
tests/
├── fixtures/                      # Test project fixtures
│   ├── test-vue-project/          # Vue.js project template
│   ├── test-react-project/        # React project template
│   ├── test-next-project/         # Next.js project template
│   ├── test-nuxt-project/         # Nuxt.js project template
│   └── test-laravel-84/          # Laravel with PHP 8.4 template
├── StackDetector.test.ts          # Framework detection tests
├── GuidelineManager.test.ts       # Guidelines collection tests
├── InitCommand.test.ts            # Version detection & command tests
├── integration.test.ts            # End-to-end integration tests
├── setup.ts                      # Test setup and utilities
└── README.md                     # This file
```

## Running Tests

### All Tests
```bash
bun test
```

### Specific Test Files
```bash
bun test tests/StackDetector.test.ts
bun test tests/GuidelineManager.test.ts
bun test tests/InitCommand.test.ts
bun test tests/integration.test.ts
```

### With Verbose Output
```bash
bun test --verbose
```

## Test Categories

### Unit Tests

#### StackDetector.test.ts
Tests framework and language detection:
- **Vue.js Detection**: Dependencies, devDependencies, config files
- **React Detection**: Dependencies with TypeScript support
- **Next.js Detection**: Dependencies and config files
- **Nuxt.js Detection**: Dependencies, config files, @nuxt/kit
- **Laravel Detection**: artisan file, composer.json
- **Package Manager Detection**: npm, yarn, pnpm, bun, composer
- **Command Generation**: Framework-specific commands
- **Mixed Projects**: Laravel + Vue, Next + React combinations
- **Edge Cases**: Empty projects, missing files, invalid JSON

#### GuidelineManager.test.ts
Tests guideline collection and CLAUDE.md generation:
- **Framework Guidelines**: Vue, React, Next, Nuxt, Laravel
- **Language Guidelines**: PHP with version-specific features
- **Multiple Frameworks**: Next+React, Nuxt+Vue combinations
- **Content Generation**: Complete CLAUDE.md structure
- **Package Manager Commands**: Different PM command generation
- **Priority Ordering**: Framework vs language guideline ordering
- **Edge Cases**: Missing versions, invalid frameworks

#### InitCommand.test.ts
Tests version detection and project initialization:
- **Version Detection**: PHP, Laravel, Vue, React, Next, Nuxt
- **Complex Version Strings**: ^8.3.0, ~11.0.5, >=18.0.0, etc.
- **Project Integration**: End-to-end initialization for each framework
- **Package Manager Commands**: yarn, pnpm, bun command generation
- **Error Handling**: Missing files, corrupted JSON, existing CLAUDE.md
- **Multi-Framework**: Full-stack Laravel + Vue projects

### Integration Tests

#### integration.test.ts
Tests complete workflows with real project fixtures:
- **Vue.js Project**: Complete detection → guidelines → CLAUDE.md
- **React Project**: Stack detection and guideline generation
- **Next.js Project**: Multi-framework detection (Next + React)
- **Nuxt.js Project**: Multi-framework detection (Nuxt + Vue)
- **Laravel Project**: PHP + Laravel with version-specific features
- **Cross-Framework**: Switching between different project types
- **Performance**: Initialization time limits
- **Error Recovery**: Corrupted fixtures, missing dependencies

## Test Fixtures

Each fixture represents a realistic project structure:

### Frontend Projects
- **test-vue-project**: Vue 3 + Vite + TypeScript
- **test-react-project**: React 18 + Vite + TypeScript
- **test-next-project**: Next.js 14 + React 18 + TypeScript
- **test-nuxt-project**: Nuxt 3 + Vue 3 + TypeScript

### Backend Projects
- **test-laravel-84**: Laravel 12 + PHP 8.4

Each fixture includes:
- Realistic package.json/composer.json
- Appropriate lock files
- Framework-specific config files
- Typical script definitions

## Test Philosophy

### Coverage Goals
- **Framework Detection**: All supported frameworks (Vue, React, Next, Nuxt, Laravel)
- **Version Detection**: Major framework and language versions
- **Command Generation**: Package manager specific commands
- **Guidelines Collection**: Framework and version-specific guidelines
- **Error Handling**: Graceful degradation for edge cases
- **Performance**: Reasonable initialization times

### Test Principles
- **Isolated**: Each test creates its own temporary directory
- **Realistic**: Fixtures mirror real-world project structures
- **Comprehensive**: Test both happy paths and edge cases
- **Fast**: Unit tests complete quickly, integration tests have timeouts
- **Reliable**: Tests clean up after themselves

## Adding New Tests

### New Framework Support
1. Add fixture in `tests/fixtures/test-{framework}-project/`
2. Add detection tests in `StackDetector.test.ts`
3. Add guideline tests in `GuidelineManager.test.ts`
4. Add version detection in `InitCommand.test.ts`
5. Add integration test in `integration.test.ts`

### New Test Cases
- Use descriptive test names
- Include both positive and negative cases
- Test edge cases and error conditions
- Clean up temporary files
- Use appropriate test timeouts

## Debugging Tests

### Failed Tests
```bash
# Run specific failing test
bun test tests/StackDetector.test.ts -t "should detect Vue.js"

# Run with timeout for debugging
bun test --timeout 10000
```

### Test Fixtures
Fixtures are copied to temp directories during tests. To inspect:

```bash
# Check fixture structure
ls -la tests/fixtures/test-vue-project/

# Manually run detection on fixture
cd tests/fixtures/test-vue-project
node ../../../dist/cli.js init --verbose --yes
```

## Performance Expectations

- **Unit Tests**: < 100ms per test
- **Integration Tests**: < 5s per test
- **Full Test Suite**: < 30s total
- **Individual Framework Detection**: < 10ms
- **Complete Initialization**: < 2s per project