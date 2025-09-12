# FrankenAI Roadmap 🗺️

## Phase 1: Template System & Stack Detection ✅ **(COMPLETED)**

### Core Features
- ✅ **Hierarchical Template Structure**
  - Common templates (`laravel.md`, `php.md`) for universal patterns
  - Version-specific templates (`laravel11.md`, `php82.md`) for version features
  - Organized by categories: frameworks/, languages/, styling/, packages/

- ✅ **Intelligent Stack Detection**
  - Automatic detection from package.json and composer.json
  - Version extraction for precise template matching
  - Support for npm/composer ecosystems

- ✅ **Popular Tech Stack Coverage**
  - **Frameworks**: Laravel (10,11,12), Vue (2,3), React, Svelte, Astro, Solid
  - **Languages**: PHP (8.1,8.2), JavaScript, TypeScript, CSS
  - **Styling**: Tailwind CSS, Bootstrap
  - **Systems**: Craft CMS, WordPress, Express.js, Hono
  - **Packages**: Livewire 3, Vue Router 4

- ✅ **Developer Experience**
  - CLI tool with interactive template selection
  - Markdown delimiters for section regeneration
  - Comprehensive contributing guidelines

---

## Phase 2: Simplified Documentation System 📚 **(NEXT)**

### Vision
Create curated, actionable documentation that complements the templates with simplified references organized by the same tech stack families.

### Planned Features

#### 🎯 **Structured Documentation Hub**
```
docs/
├── frameworks/
│   ├── laravel/
│   │   ├── quickstart.md      # 5-minute Laravel setup
│   │   ├── commands.md        # Essential Artisan commands
│   │   ├── patterns.md        # Common code patterns
│   │   └── troubleshooting.md # Common issues & solutions
│   └── vue/
│       ├── quickstart.md
│       ├── composition-api.md
│       └── ecosystem.md
├── languages/
│   └── php/
│       ├── modern-php.md      # PHP 8+ features summary
│       ├── security.md        # Security checklist
│       └── performance.md     # Optimization tips
└── workflows/
    ├── laravel-vue.md         # Full-stack Laravel+Vue workflow
    ├── testing-strategy.md    # Testing best practices
    └── deployment.md          # Deployment patterns
```

#### 📋 **Documentation Features**
- **Quick Reference Cards**: Essential commands, patterns, and configs
- **Decision Trees**: "Which approach should I use?" flowcharts
- **Code Templates**: Copy-paste ready boilerplates
- **Troubleshooting Guides**: Common issues and solutions
- **Integration Guides**: How to combine different technologies

#### 🔧 **Technical Implementation**
- Markdown-based documentation with consistent structure
- Auto-generated table of contents and cross-references
- Search functionality within documentation
- Integration with FrankenAI CLI for context-aware doc suggestions

### Example Documentation Structure

**Quick Reference Example** (`docs/frameworks/laravel/commands.md`):
```markdown
# Laravel Commands Quick Reference

## Database
| Command | Description | Example |
|---------|-------------|---------|
| `php artisan migrate` | Run migrations | `php artisan migrate` |
| `php artisan migrate:fresh --seed` | Fresh DB with seeds | For development reset |

## Development
| Command | Description | When to Use |
|---------|-------------|-------------|
| `php artisan serve` | Dev server | Local development |
| `php artisan tinker` | REPL | Debugging, testing |
```

---

## Phase 3: MCP Integration & AI Companions 🤖 **(FUTURE)**

### Vision
Create Model Context Protocol (MCP) integrations that leverage both Claude and Gemini as specialized AI companions, each optimized for their strengths.

### Planned Features

#### 🧠 **Specialized AI Companions**

**Claude Companion (Precision & Implementation)**
- **File Operations**: Read, edit, create files with surgical precision
- **Code Generation**: Generate specific functions, classes, tests
- **Refactoring**: Safe code transformations and improvements
- **Debugging**: Step-by-step issue resolution
- **Framework Tools**: Laravel Artisan, Vue CLI, etc.

**Gemini Companion (Analysis & Discovery)**
- **Codebase Analysis**: Large-scale architectural analysis
- **Pattern Detection**: Find inconsistencies and opportunities
- **Feature Discovery**: "Does this already exist in the codebase?"
- **Documentation Generation**: Auto-generate docs from code
- **Migration Planning**: Plan upgrades and refactoring strategies

#### 🔗 **MCP Integrations**

**Context-Aware Assistants**
```typescript
// MCP Server for FrankenAI
interface FrankenAIMCP {
  // Stack-aware context
  getProjectContext(): {
    stack: DetectedStack,
    templates: GuidelineTemplate[],
    documentation: Documentation[]
  }
  
  // Intelligent routing
  routeQuery(query: string): {
    companion: 'claude' | 'gemini' | 'both',
    context: string[],
    templates: string[]
  }
}
```

**Smart Workflow Orchestration**
- **Discovery Flow**: Start with Gemini for analysis → Switch to Claude for implementation
- **Context Preservation**: Share findings between AI companions
- **Template Integration**: Auto-inject relevant templates based on context
- **Documentation Sync**: Keep docs updated with code changes

#### 🛠️ **Technical Architecture**

**MCP Servers**
- `franken-ai-context`: Project context and stack detection
- `franken-ai-templates`: Template management and injection
- `franken-ai-docs`: Documentation access and search
- `franken-ai-router`: Intelligent query routing between AIs

**Integration Points**
- **Claude Code**: Native MCP support for enhanced context
- **Gemini CLI**: Extended context through MCP protocols
- **VS Code Extension**: IDE integration for seamless workflow
- **Web Interface**: Dashboard for project insights and AI coordination

#### 🎯 **Example Workflows**

**Feature Development Workflow**:
1. **Discovery** (Gemini): "Analyze authentication patterns in this codebase"
2. **Context Injection**: Load Laravel + Vue + Livewire templates
3. **Implementation** (Claude): "Create user registration with these patterns"
4. **Documentation Update**: Auto-update relevant docs with new patterns

**Code Review Workflow**:
1. **Analysis** (Gemini): "Review this PR for security and performance issues"
2. **Template Compliance**: Check against FrankenAI best practices
3. **Improvements** (Claude): "Apply suggested improvements to these files"
4. **Documentation**: Update guides with new patterns discovered

---

## Timeline & Milestones 📅

### Phase 1 ✅ **(Q1 2025 - COMPLETED)**
- Template system architecture
- Stack detection and version matching
- CLI tool with core functionality
- Popular framework/language/system coverage

### Phase 2 🎯 **(Q2 2025)**
- Documentation hub creation
- Quick reference system
- Integration with template system
- Search and discovery features

### Phase 3 🚀 **(Q3-Q4 2025)**
- MCP server development
- AI companion specialization
- Workflow orchestration system
- IDE and web integrations

---

## Success Metrics 📊

### Phase 1 (Current)
- ✅ 15+ templates across popular tech stacks
- ✅ Automatic version detection
- ✅ Developer adoption and contributions

### Phase 2 (Documentation)
- 50+ curated documentation pages
- Sub-second search performance
- 90% user satisfaction for "finding what I need quickly"

### Phase 3 (MCP Integration)
- Seamless AI companion switching
- 80% reduction in context-switching overhead
- Integration with 3+ major IDEs/editors

---

## Contributing to the Roadmap 💡

Have ideas for any phase? We welcome:
- **Template Suggestions**: New frameworks, languages, or patterns
- **Documentation Improvements**: Better organization or missing guides
- **MCP Integration Ideas**: Novel uses of AI companions
- **Workflow Optimizations**: Better developer experience patterns

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute!

---

*"FrankenAI: From single-headed templates to multi-headed AI orchestration"* 🧟‍♂️✨