# 🧟 FrankenAI

Multi-headed AI development assistant that combines Claude Code and Gemini CLI for optimal development workflows.

## Overview

FrankenAI automatically detects your project stack and generates enhanced `CLAUDE.md` files with framework-specific guidelines and AI workflow optimizations.

## Prerequisites

- **Node.js/Bun** - Runtime for FrankenAI CLI
- **Claude Code** - For precision implementation ([claude.ai/code](https://claude.ai/code))
- **Gemini CLI** - For large-scale analysis (`npm install -g @google/generative-ai`)

## Installation

### Global Installation (Recommended)

```bash
# Install globally via npm
npm install -g @franken-ai/franken-ai

# Or via Yarn
yarn global add @franken-ai/franken-ai

# Or via Bun
bun install -g @franken-ai/franken-ai

# Or via pnpm
pnpm install -g @franken-ai/franken-ai
```

### Local Installation (Project-specific)

```bash
# Install as dev dependency
npm install --save-dev @franken-ai/franken-ai

# Or via Yarn
yarn add --dev @franken-ai/franken-ai

# Or via Bun
bun add --dev @franken-ai/franken-ai

# Or via pnpm
pnpm add --save-dev @franken-ai/franken-ai
```

### Development Installation

```bash
# Clone and install for development
git clone <repo-url> franken-ai
cd franken-ai
bun install
bun run build

# Link for global development use
npm link
```

## Usage

### Initialize Project

**Global Installation:**
```bash
# Auto-detect stack and generate CLAUDE.md
franken init

# Force overwrite existing CLAUDE.md
franken init --force

# Quiet mode
franken init --quiet --yes
```

**Local Installation (via package managers):**
```bash
# Via npm scripts
npm run franken init

# Via npx
npx @franken-ai/franken-ai init

# Via bunx
bunx @franken-ai/franken-ai init

# Via yarn dlx
yarn dlx @franken-ai/franken-ai init
```

### Other Commands

```bash
# Detect project stack without writing files
franken detect

# List available modules
franken modules

# Show project status
franken status

# Get help
franken --help
```

### Hybrid Workflow

1. **Discovery Phase** (Use Gemini CLI):
   ```bash
   gemini -p "@src/ What's the overall architecture?"
   gemini -p "@app/ Is user authentication implemented?"
   ```

2. **Implementation Phase** (Use Claude Code):
   - Launch Claude Code in your project directory
   - Claude automatically uses your enhanced CLAUDE.md
   - Implement specific features with precision tooling

## Supported Technologies

### Frameworks
- **Laravel** - PHP framework with ecosystem support
- **React** - JavaScript component library
- **Vue.js** - Progressive JavaScript framework
- **Svelte** - Compile-time optimized framework
- **SvelteKit** - Full-stack Svelte framework
- **Next.js** - React-based full-stack framework
- **Nuxt.js** - Vue-based full-stack framework
- **Astro** - Multi-framework static site generator
- **Solid.js** - Reactive JavaScript framework

### Laravel Ecosystem
- **Laravel Boost** - Meta-framework methodology (auto-excludes conflicting tools)
- **Inertia.js** - Modern monolith approach
- **Livewire** - Full-stack Laravel framework
- **Volt** - Functional API for Livewire
- **Folio** - Page-based routing
- **FluxUI Free/Pro** - UI component libraries
- **Pennant** - Feature flags

### Testing & Tools
- **Pest** - Modern PHP testing
- **PHPUnit** - Traditional PHP testing
- **Pint** - Laravel code style fixer

### CSS Frameworks
- **Tailwind CSS** - Utility-first CSS
- **Bootstrap** - Popular CSS framework
- **Bulma** - Modern CSS framework

### Languages
- **JavaScript** - Core language support
- **TypeScript** - Typed JavaScript
- **PHP** - Server-side language

## How It Works

1. **Stack Detection** - Analyzes package.json, config files, and project structure
2. **Module Prioritization** - Resolves conflicts using priority system (meta-framework → framework → tool → language)
3. **Guideline Assembly** - Collects framework-specific best practices and patterns
4. **CLAUDE.md Generation** - Creates comprehensive workspace configuration
5. **Command Integration** - Generates appropriate development commands for detected stack

## Commands

```bash
franken init          # Initialize project with auto-detection
franken detect        # Show detected stack
franken modules       # List available modules
franken status        # Show configuration status
franken --help        # Show help
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and contribution guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.