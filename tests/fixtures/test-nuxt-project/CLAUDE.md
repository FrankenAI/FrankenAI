# FrankenAI Configuration


[//]: # (franken-ai:stack:start)
## Detected Stack: Nuxt.js, Vue.js

### Project Information
- **Runtime**: node
- **Languages**: JavaScript
- **Frameworks**: Nuxt.js, Vue.js
[//]: # (franken-ai:stack:end)

[//]: # (franken-ai:commands:start)
## Commands

### Development
- `npm run dev` - Start development server

### Build
- `npm run build` - Build for production

### Testing
- `npm run test` - Run tests

### Linting
- `npm run lint` - Run linter

### Package Management
- `npm install` - Install dependencies

[//]: # (franken-ai:commands:end)

[//]: # (franken-ai:workflow:start)
## FrankenAI Workflow

### Discovery Phase (Gemini CLI)
Use for large-scale codebase analysis:

```bash
# Architecture overview
gemini -p "@src/ @app/ What's the overall architecture?"

# Feature verification
gemini -p "@src/ Is user authentication implemented?"

# Pattern detection
gemini -p "@./ Show me all async functions with file locations"
```

### Implementation Phase (Claude Code)
Use for precise development:

- **File Editing**: Read/Write/Edit tools for code changes
- **Framework Tools**: Use framework-specific commands
- **Testing**: Run and debug tests
- **Real-time Problem Solving**: Debug and validate implementations
[//]: # (franken-ai:workflow:end)