# 🧟 FrankenAI

Multi-headed AI development assistant that combines Claude Code's precision implementation with Gemini CLI's large-scale analysis capabilities.

## What is FrankenAI?

FrankenAI orchestrates multiple AI tools to create a powerful "Megazord" for development workflows. It automatically generates enhanced `CLAUDE.md` files with framework-specific guidelines, creating a seamless bridge between different AI assistants.

**The Problem:** Modern development involves complex stacks, and no single AI tool excels at everything. Claude Code is precise for implementation but has context limits. Gemini CLI has massive context for analysis but lacks development tooling.

**The Solution:** FrankenAI automatically detects your project stack and generates comprehensive guidelines that leverage each tool's strengths optimally.

## Prerequisites

- **Node.js/Bun** - Runtime for FrankenAI CLI
- **Claude Code** - For precision implementation ([claude.ai/code](https://claude.ai/code))
- **Gemini CLI** - For large-scale analysis (`npm install -g @google/generative-ai`)

## Installation

```bash
# Clone and install
git clone <repo-url> franken-ai
cd franken-ai
bun install
bun run build

# Make globally available (optional)
npm link
```

## Usage

### Initialize Project

```bash
# Auto-detect stack and generate CLAUDE.md
franken-ai init

# Force overwrite existing CLAUDE.md
franken-ai init --force

# Quiet mode
franken-ai init --quiet --yes
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

## Supported Stacks

### Frameworks
- **Laravel** (10, 11, 12) + Livewire, Inertia
- **Vue.js** (2, 3) + Vue Router, Pinia
- **React** + Next.js
- **Svelte**

### Languages
- **PHP** (8.1, 8.2, 8.3, 8.4)
- **TypeScript**
- **JavaScript**

### Systems
- **Express.js**
- **Hono**
- **WordPress**
- **Craft CMS**

### Styling
- **Tailwind CSS**
- **Bootstrap**

## Inspiration

FrankenAI follows the **Laravel Boost** methodology for guidelines:
- Security-first approach
- Concise, actionable patterns
- Convention over configuration
- Framework-specific best practices

*Guidelines based on [Laravel Boost](https://github.com/laravel/boost) patterns with proper attribution.*

## How It Works

1. **Stack Detection** - Scans `package.json`, `composer.json`, and config files
2. **Template Mapping** - Uses YAML registry to match packages to guidelines
3. **Version Resolution** - Loads common + version-specific templates
4. **CLAUDE.md Generation** - Combines templates into comprehensive guide
5. **AI Tool Integration** - Provides optimal workflow patterns for each tool

## Project Structure

```
src/
├── core/
│   ├── PackageRegistry.ts    # YAML-based package detection
│   ├── TemplateManager.ts    # Template loading and generation
│   └── StackDetector.ts      # Project stack detection
├── registry/
│   ├── npm-packages.yaml     # NPM package mappings
│   └── composer-packages.yaml # Composer package mappings
├── templates/
│   ├── frameworks/           # Framework guidelines
│   ├── languages/           # Language-specific patterns
│   ├── systems/            # System/runtime guidelines
│   └── styling/           # CSS framework patterns
└── commands/
    └── InitCommand.ts      # Main CLI command
```

## Contributing

FrankenAI uses a registry-based system for easy extension:

1. Add package mappings to `src/registry/*.yaml`
2. Create template files in `src/templates/`
3. Follow Laravel Boost methodology for guidelines
4. Run tests: `bun test`

## Development

```bash
# Install dependencies
bun install

# Build project
bun run build

# Run tests
bun test

# Test locally
./dist/cli.js init --verbose
```

## License

MIT