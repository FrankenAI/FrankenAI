# 🧟 FrankenAI

Multi-headed AI development assistant that combines Claude Code's precision implementation with Gemini CLI's large-scale analysis capabilities.

> **Meta Note:** FrankenAI was created with the help of FrankenAI itself! The hybrid Claude Code + Gemini CLI workflow proved invaluable during development, demonstrating the power of combining different AI tools for complex projects.

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

## Currently Supported Stacks

### Frameworks ✅ Implemented
- **Laravel** - PHP framework with detection and guidelines
- **React** - JavaScript library with component patterns
- **Vue.js** - Progressive JavaScript framework
- **Svelte** - Compile-time optimized framework
- **SvelteKit** - Full-stack Svelte framework
- **Next.js** - React-based full-stack framework
- **Nuxt.js** - Vue-based full-stack framework

### Languages ✅ Implemented
- **JavaScript** - Core language support with modern patterns
- **TypeScript** - Typed JavaScript with advanced patterns
- **PHP** - Server-side language with Laravel integration

### 🚧 Planned Support
*These frameworks are planned but not yet implemented:*

**Frontend Frameworks:**
- Angular, Astro, Solid.js, Qwik

**Backend Frameworks:**
- Express.js, Fastify, NestJS, Django, Flask, Ruby on Rails

**Languages:**
- Python, Ruby, Go, Rust, Java, C#

**Styling:**
- Tailwind CSS, Bootstrap integration

## Inspiration & Origins

FrankenAI was inspired by a discussion on [Reddit about Gemini CLI's potential](https://www.reddit.com/r/ChatGPTCoding/comments/1lm3fxq/gemini_cli_is_awesome_but_only_when_you_make/) when properly integrated into development workflows. The idea was to create a tool that bridges the gap between different AI assistants, each with their own strengths.

FrankenAI follows the **Laravel Boost** methodology for guidelines:
- Security-first approach
- Concise, actionable patterns
- Convention over configuration
- Framework-specific best practices

*Guidelines based on [Laravel Boost](https://github.com/laravel/boost) patterns with proper attribution.*

The hybrid workflow concept emerged from recognizing that:
- **Gemini CLI** excels at large-scale codebase analysis with its massive context window
- **Claude Code** provides precise implementation with excellent development tooling
- **Combining both** creates a powerful "Megazord" that leverages each tool's strengths

## How It Works

1. **Module Loading** - Automatically loads framework and language modules from `src/modules/`
2. **Stack Detection** - Each module detects its presence using package.json dependencies and config files
3. **Module Prioritization** - Modules are sorted by priority (high → medium → low), then by type (framework → language), then alphabetically
4. **Guideline Assembly** - Enabled modules provide embedded guidelines and best practices
5. **CLAUDE.md Generation** - Combines applicable guidelines into a comprehensive workspace configuration file
6. **Command Generation** - Generates framework-specific development commands and workflow patterns
7. **Hybrid AI Workflow** - Provides optimized usage patterns for Claude Code + Gemini CLI integration

## Project Structure

```
src/
├── core/
│   ├── ModuleManager.ts      # Module loading and management
│   ├── ModuleRegistry.ts     # Module registration system
│   ├── StackDetector.ts      # Project stack detection
│   ├── GuidelineManager.ts   # Guideline assembly and templating
│   ├── CommandRegistry.ts    # CLI command registration
│   └── EnvironmentChecker.ts # AI tool availability checking
├── modules/
│   ├── laravel/             # Laravel framework module
│   ├── react/               # React library module
│   ├── vue/                 # Vue.js framework module
│   ├── svelte/              # Svelte framework module
│   ├── sveltekit/           # SvelteKit framework module
│   ├── next/                # Next.js framework module
│   ├── nuxt/                # Nuxt.js framework module
│   ├── php/                 # PHP language module
│   ├── javascript/          # JavaScript language module
│   └── typescript/          # TypeScript language module
└── commands/
    ├── InitCommand.ts       # Project initialization
    ├── ModulesCommand.ts    # Module listing and info
    ├── ListCommand.ts       # Command listing
    └── AboutCommand.ts      # Project information
```

## Contributing

We welcome contributions to make FrankenAI more powerful and comprehensive! Whether you're adding support for new frameworks, improving existing guidelines, or enhancing the core functionality, your contributions help the entire development community.

### Philosophy: Opinionated by Design

**FrankenAI is intentionally opinionated.** We believe that providing curated, best-practice guidelines is more valuable than exhaustive options. Contributors are encouraged to share their expertise and best practices, but final decisions about what gets included will be made by the maintainers to ensure consistency and quality.

**Decision-Making Process:**
- Contributors propose improvements through issues and pull requests
- Maintainers evaluate contributions based on security, performance, and community consensus
- When multiple approaches exist, we choose the one that best aligns with modern best practices
- All decisions prioritize developer safety and code quality over personal preferences

### Ways to Contribute

- **Framework Support**: Add new framework detection and guidelines
- **Language Modules**: Implement support for additional programming languages
- **Template Improvements**: Enhance existing guideline templates with better practices
- **Documentation**: Help improve documentation and examples
- **Bug Fixes**: Report issues and submit fixes
- **Testing**: Add test coverage and improve existing tests

### Getting Started

FrankenAI uses a modular architecture designed for easy extension:

1. **Module Development**: Implement new framework/language modules in `src/modules/`
2. **Guidelines**: Create embedded guidelines following Laravel Boost methodology
3. **Detection Logic**: Add package.json and config file detection patterns
4. **Testing**: Add comprehensive tests and run `bun test`

### Guidelines for Contributors

- Follow the existing code style and patterns
- Ensure all tests pass before submitting
- Add tests for new functionality
- Update documentation as needed
- Follow semantic versioning principles

For detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).

**Ready to contribute?** Check out our [GitHub Issues](https://github.com/your-repo/franken-ai/issues) for good first contributions or propose new features!

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

## Important Disclaimer

**FrankenAI is an assistant to assistants that assists you.** It should be understood and used within its proper context as a development workflow orchestrator, not as a replacement for human judgment and expertise.

### Key Considerations

- **Review Generated Content**: Always review the generated `CLAUDE.md` file to ensure it aligns with your project's specific needs, security requirements, and coding standards.

- **Code Review Essential**: Thoroughly review any code generated by the AI tools FrankenAI orchestrates. The system combines outputs from multiple AI models, each with their own limitations and potential for errors.

- **Human Oversight Required**: FrankenAI does not replace human developers, architects, or code reviewers. It enhances your workflow but requires critical thinking and oversight from experienced developers.

- **Security Responsibility**: While FrankenAI promotes security-first practices through its guidelines, you remain responsible for implementing appropriate security measures and conducting security reviews for your specific use case.

- **Framework-Specific Validation**: Generated guidelines are based on common patterns and best practices, but may not account for your specific framework version, customizations, or unique requirements.

### Best Practices

1. **Start Small**: Begin with non-critical projects to familiarize yourself with FrankenAI's output
2. **Team Review**: Have team members review generated guidelines before adoption
3. **Iterative Refinement**: Customize and refine the generated `CLAUDE.md` based on your team's needs
4. **Stay Updated**: Keep both FrankenAI and your AI tools updated for best results
5. **Maintain Skepticism**: Approach AI-generated content with healthy skepticism and critical evaluation

**Remember**: FrankenAI amplifies your development workflow but cannot replace the critical thinking, domain expertise, and contextual judgment that human developers provide.

## License

This project is licensed under the **MIT License**, which means:

- ✅ **You can use it commercially** - Use FrankenAI in your commercial projects
- ✅ **You are permitted to modify it** - Modify the code to fit your specific needs
- ✅ **You can distribute it** - Share and distribute the software freely
- ✅ **You can use it privately** - Use privately without any restrictions
- ⚠️ **No warranty is provided** - Software provided "as is" without warranties
- 📄 **You must include attribution** - Include license and copyright notice in distributions

For the complete license text, see: [LICENSE](./LICENSE) or [MIT License](https://opensource.org/licenses/MIT)