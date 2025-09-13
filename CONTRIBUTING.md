# Contributing to FrankenAI

We welcome contributions from developers who want to help make FrankenAI more powerful and comprehensive! This guide will help you get started with contributing to the project.

## Philosophy: Opinionated by Design

**FrankenAI is intentionally opinionated.** We believe that providing curated, battle-tested guidelines is more valuable than offering every possible approach. Our goal is to give developers the best practices that have proven successful in real-world projects.

### Decision-Making Process

- **Community Input**: We encourage contributors to share their expertise and propose best practices
- **Maintainer Review**: Final decisions about what gets included are made by the maintainers
- **Quality Focus**: We evaluate contributions based on security, performance, maintainability, and community consensus
- **Modern Standards**: When multiple approaches exist, we choose those that align with current industry best practices
- **Developer Safety**: All decisions prioritize code quality and developer experience over personal preferences

### What This Means for Contributors

- **Share Your Expertise**: Propose improvements, patterns, and practices you've found effective
- **Expect Discussion**: Be prepared to discuss and defend your approaches with concrete examples
- **Accept Decisions**: Understand that not all contributions may be accepted, even if they're technically valid
- **Focus on Quality**: Prioritize security, performance, and maintainability in your contributions

## Getting Started

### Prerequisites

- **Node.js/Bun**: v18+ for runtime and package management
- **Git**: For version control
- **TypeScript**: Basic knowledge of TypeScript
- **AI Development**: Familiarity with AI-assisted development workflows

### Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/franken-ai.git
   cd franken-ai
   ```

2. **Install Dependencies**:
   ```bash
   bun install
   ```

3. **Build and Test**:
   ```bash
   bun run build
   bun test
   ```

4. **Local Testing**:
   ```bash
   bun run dev --help
   ```

## Architecture Overview

FrankenAI uses a **modular architecture** where each module is responsible for:

1. **Detection**: Identify if a framework/language is present
2. **Metadata**: Provide module information and capabilities
3. **Guidelines**: Supply framework/language-specific best practices
4. **Commands**: Generate appropriate development commands

### Module Structure

Modules are organized in `src/modules/` with embedded guidelines:

```
src/modules/
├── laravel/
│   ├── index.ts              # Entry point
│   ├── LaravelModule.ts      # Main module class
│   └── guidelines/
│       ├── framework.md      # Core Laravel guidelines
│       ├── 10/
│       │   └── features.md   # Laravel 10 specific
│       └── 11/
│           └── features.md   # Laravel 11 specific
└── javascript/
    ├── index.ts
    ├── JavaScriptModule.ts
    └── guidelines/
        ├── language.md       # Core JS guidelines
        └── es2024/
            └── features.md   # ES2024 features
```

## Types of Contributions

### 🚀 Framework Support

Add support for new web frameworks or enhance existing ones.

**What to Add:**
- Framework detection logic
- Guideline templates following Laravel Boost methodology
- Version-specific patterns when applicable
- Comprehensive tests

**Example Module Structure:**
```typescript
export class AngularModule implements FrameworkModule {
  readonly id = 'angular';
  readonly type = 'framework';
  readonly priority = 'high';

  getMetadata(): ModuleMetadata {
    return {
      name: 'angular',
      displayName: 'Angular',
      description: 'Angular framework module with detection and guidelines',
      version: '1.0.0',
      author: 'FrankenAI Team',
      keywords: ['angular', 'typescript', 'frontend', 'spa'],
      supportedVersions: ['15', '16', '17']
    };
  }

  detect(context: DetectionContext): boolean {
    // Detection logic
  }

  getGuidelines(context: GuidelineContext): GuidelineFile[] {
    // Return applicable guidelines
  }
}
```

### 💻 Language Modules

Implement support for additional programming languages.

**What to Add:**
- Language detection patterns
- Best practices and coding standards
- Security guidelines specific to the language
- Integration patterns with popular frameworks

### 📝 Template Improvements

Enhance existing guideline templates with better practices.

**Focus Areas:**
- Security best practices
- Performance optimization patterns
- Modern development workflows
- Framework-specific idioms

### 🛠 Core Functionality

Improve the core FrankenAI functionality.

**Areas for Enhancement:**
- Module system improvements
- Better stack detection
- Enhanced CLI experience
- Performance optimizations

### 📚 Documentation

Help improve documentation and examples.

**What We Need:**
- Usage examples for specific frameworks
- Best practice guides
- Tutorial content
- API documentation

## Creating a New Module

### 1. Framework Module Example

```typescript
// src/modules/myframework/MyFrameworkModule.ts
import type {
  FrameworkModule,
  DetectionContext,
  ModuleMetadata,
  GuidelineContext,
  GuidelineFile
} from '../../core/types/Module.js';

export class MyFrameworkModule implements FrameworkModule {
  readonly id = 'myframework';
  readonly type = 'framework';
  readonly priority = 'medium';

  getMetadata(): ModuleMetadata {
    return {
      name: 'myframework',
      displayName: 'My Framework',
      description: 'My Framework module with detection and guidelines',
      version: '1.0.0',
      author: 'Your Name',
      keywords: ['javascript', 'framework', 'frontend'],
      supportedVersions: ['1.0', '2.0']
    };
  }

  detect(context: DetectionContext): boolean {
    // Check package.json dependencies
    const hasFramework = context.packageJson?.dependencies?.['myframework'] ||
                        context.packageJson?.devDependencies?.['myframework'];

    // Check for config files
    const hasConfig = context.files.some(file =>
      file.endsWith('myframework.config.js') ||
      file.endsWith('myframework.config.ts')
    );

    return hasFramework || hasConfig;
  }

  getGuidelines(context: GuidelineContext): GuidelineFile[] {
    const guidelines: GuidelineFile[] = [];

    // Always include core framework guidelines
    guidelines.push({
      path: 'src/modules/myframework/guidelines/framework.md',
      category: 'framework'
    });

    // Add version-specific guidelines if available
    if (context.frameworkVersion === '2.0') {
      guidelines.push({
        path: 'src/modules/myframework/guidelines/2.0/features.md',
        category: 'framework'
      });
    }

    return guidelines;
  }
}
```

### 2. Entry Point

```typescript
// src/modules/myframework/index.ts
import { MyFrameworkModule } from './MyFrameworkModule.js';

export default new MyFrameworkModule();
export { MyFrameworkModule };
```

### 3. Guidelines

Create comprehensive guidelines in markdown format:

```markdown
<!-- src/modules/myframework/guidelines/framework.md -->
# My Framework Development Guidelines

## Core Concepts

### Component Structure
```javascript
// Example My Framework component
const MyComponent = {
  template: `<div>{{ message }}</div>`,
  data() {
    return {
      message: 'Hello My Framework'
    }
  }
}
```

### Routing
```javascript
// Route configuration
const routes = [
  { path: '/', component: HomeComponent },
  { path: '/about', component: AboutComponent }
]
```

### State Management
```javascript
// Store setup
const store = new MyFrameworkStore({
  state: {
    user: null,
    loading: false
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    }
  }
});
```
```

### 4. Testing

Add comprehensive tests:

```typescript
// tests/MyFrameworkModule.test.ts
import { describe, test, expect } from 'bun:test';
import { MyFrameworkModule } from '../src/modules/myframework/MyFrameworkModule.js';

describe('MyFrameworkModule', () => {
  test('should detect myframework projects', () => {
    const context = {
      packageJson: {
        dependencies: { 'myframework': '^2.0.0' }
      },
      files: [],
      projectRoot: '/test'
    };

    const module = new MyFrameworkModule();
    const detected = module.detect(context);

    expect(detected).toBe(true);
  });

  test('should return correct metadata', () => {
    const module = new MyFrameworkModule();
    const metadata = module.getMetadata();

    expect(metadata.name).toBe('myframework');
    expect(metadata.displayName).toBe('My Framework');
    expect(metadata.type).toBe('framework');
  });

  test('should provide appropriate guidelines', () => {
    const module = new MyFrameworkModule();
    const context = { frameworkVersion: '2.0' };
    const guidelines = module.getGuidelines(context);

    expect(guidelines.length).toBeGreaterThan(0);
    expect(guidelines[0].category).toBe('framework');
  });
});
```

## Development Guidelines

### Code Style

- **TypeScript**: Use strict TypeScript with proper typing
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Format code using Prettier
- **Naming**: Use descriptive names following existing patterns

### Laravel Boost Methodology

All guidelines should follow these principles:

- **Security-first approach**: Prioritize secure patterns
- **Concise patterns**: Provide actionable, specific guidance
- **Convention over configuration**: Leverage framework conventions
- **Best practices**: Include current best practices and patterns

### Testing Requirements

- **Unit Tests**: Test all module functionality
- **Integration Tests**: Test module integration with core system
- **CLI Tests**: Test command-line interfaces if applicable
- **Coverage**: Maintain good test coverage (>80%)

## Submission Process

### 1. Planning

Before starting work:

- **Check Issues**: Look for existing issues or feature requests
- **Discuss First**: For major changes, open an issue for discussion
- **Follow Patterns**: Study existing modules to understand patterns

### 2. Development

- **Branch**: Create a feature branch from `main`
- **Commits**: Make atomic commits with clear messages
- **Testing**: Add tests for all new functionality
- **Documentation**: Update relevant documentation

### 3. Pull Request

- **Title**: Clear, descriptive title
- **Description**: Explain what changes were made and why
- **Testing**: Confirm all tests pass
- **Examples**: Provide usage examples when applicable

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Framework support
- [ ] Language module
- [ ] Core functionality
- [ ] Documentation
- [ ] Bug fix

## Testing
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Breaking changes documented
```

## Priority Contributions

We're especially looking for contributions in these areas:

### Frontend Frameworks
- **Angular** (TypeScript)
- **Astro** (JavaScript/TypeScript)
- **Solid.js** (TypeScript)
- **Qwik** (TypeScript)

### Backend Frameworks
- **Express.js** (JavaScript/TypeScript)
- **Fastify** (JavaScript/TypeScript)
- **NestJS** (TypeScript)
- **Django** (Python)
- **Flask** (Python)
- **Ruby on Rails** (Ruby)

### Languages
- **Python**
- **Ruby**
- **Go**
- **Rust**
- **Java**
- **C#**

## Quality Standards

### Code Quality
- ✅ **TypeScript strict**: No `any`, complete typing
- ✅ **Performance**: Fast detection (< 100ms per module)
- ✅ **Error handling**: No unhandled exceptions
- ✅ **Tests**: Coverage > 80%

### Guideline Quality
- ✅ **Practical**: Usable code examples
- ✅ **Current**: Based on latest versions
- ✅ **Structured**: Clear, organized sections
- ❌ **Avoid**: Deprecated patterns, generic advice

## Recognition

Contributors are recognized in:

- **README.md**: Major contributors listed
- **Release Notes**: Contributors mentioned in releases
- **Contributors Graph**: GitHub automatically tracks contributions

## Questions?

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Documentation**: Check existing docs first

---

Thank you for contributing to FrankenAI! Your contributions help developers worldwide create better AI-assisted development workflows. 🚀