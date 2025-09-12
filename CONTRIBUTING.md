# Contributing to FrankenAI

## 🚀 How to Contribute

We welcome contributions to improve FrankenAI templates and functionality! Here's how you can help:

### 📝 Adding or Improving Templates

Templates are organized hierarchically in the `src/templates/` directory:

```
src/templates/
├── frameworks/
│   ├── laravel/
│   │   ├── laravel.md      # Common Laravel patterns
│   │   ├── laravel10.md    # Laravel 10 specific
│   │   ├── laravel11.md    # Laravel 11 specific
│   │   └── laravel12.md    # Laravel 12 specific
│   └── vue/
│       ├── vue2.md         # Vue 2 specific
│       └── vue3.md         # Vue 3 specific
├── languages/
│   └── php/
│       ├── php.md          # Common PHP patterns
│       ├── php81.md        # PHP 8.1 specific
│       └── php82.md        # PHP 8.2 specific
├── styling/
│   ├── tailwind.md
│   └── css.md
├── systems/
│   ├── craftcms.md         # Craft CMS patterns
│   ├── wordpress.md        # WordPress development
│   ├── expressjs.md        # Express.js backend
│   └── hono.md             # Hono framework
└── packages/
    ├── livewire3.md
    └── vue-router4.md
```

### 🔄 Template Structure Guidelines

1. **Common Templates** (`framework.md`, `language.md`): Include universal patterns and best practices
2. **Version-Specific Templates** (`framework10.md`): Include features and changes specific to that version
3. **Keep It Practical**: Focus on actionable code examples and patterns
4. **Use Clear Headers**: Organize content with descriptive sections

### 📋 Template Content Guidelines

- **Start with Core Features**: Highlight the most important patterns first
- **Include Code Examples**: Provide practical, copy-paste ready examples
- **Explain Breaking Changes**: For version-specific templates, mention what changed
- **Best Practices Only**: Focus on recommended approaches, not legacy patterns

### 🛠️ Adding New Framework Support

To add a new framework:

1. Create directory: `src/templates/frameworks/[framework-name]/`
2. Add common template: `[framework-name].md`
3. Add version-specific templates as needed: `[framework-name][version].md`
4. Update `TemplateManager.ts` to detect and load your templates:

```typescript
// Add to getVersionSpecificTemplates method
if (framework === 'YourFramework') {
  const pkg = packageInfo.find(p => p.name === 'your-framework');
  if (pkg) {
    const majorVersion = this.extractMajorVersion(pkg.version);
    const templateFile = `yourframework${majorVersion}.md`;
    const content = await this.loadTemplate('frameworks', templateFile);
    // ... rest of template loading logic
  }
}
```

### 🧪 Testing Your Changes

1. **Build the project**: `bun run build`
2. **Test locally**: Create a test project with your framework/language
3. **Run FrankenAI**: `franken-ai init --verbose` to see your templates in action

### 📨 Submitting Changes

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b add-nextjs-templates`
3. **Make your changes**: Follow the guidelines above
4. **Test thoroughly**: Ensure your templates work and don't break existing functionality
5. **Submit a Pull Request**: Include:
   - Clear description of what you added/changed
   - Examples of the templates in action
   - Any new dependencies or detection logic

### 💡 Ideas for Contributions

- **New Frameworks**: Astro, SvelteKit, Nuxt 4, etc.
- **Language Versions**: PHP 8.3, PHP 8.4, TypeScript 5.x
- **Package Ecosystems**: Inertia.js, Alpine.js, Pinia, Zustand
- **CMS & Systems**: Strapi, Sanity, Directus, Payload CMS, Fastify
- **Testing Frameworks**: Pest, Vitest, Playwright
- **Development Tools**: Docker, Vite, Webpack

### ❓ Questions?

- Open an issue for discussion
- Check existing templates for inspiration
- Keep templates focused and practical

## 🎯 Template Quality Standards

- ✅ **Actionable**: Code examples that users can copy and use
- ✅ **Current**: Use modern patterns and latest best practices  
- ✅ **Focused**: Specific to the framework/language/version
- ✅ **Tested**: Works in real projects
- ❌ **Avoid**: Deprecated patterns, generic advice, lengthy explanations

Thank you for contributing to FrankenAI! 🤖