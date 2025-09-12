## FrankenAI Workflow

### Discovery Phase (Use Gemini CLI)
Use Gemini CLI for large-scale codebase analysis:

```bash
# Architecture overview
gemini -p "@src/ @app/ What's the overall architecture and how do components interact?"

# Feature verification  
gemini -p "@src/ @components/ Is user authentication implemented? Show me all auth-related code"

# Pattern detection
gemini -p "@./ Show me all async functions and their purposes with file locations"
```

### Implementation Phase (Use Claude Code)
Switch to Claude Code for precise development work:
- **File Editing**: Read/Write/Edit tools for specific code changes
- **Framework Tools**: Use framework-specific commands and tools  
- **Command Execution**: Run tests, builds, and development commands
- **Real-time Debugging**: Debug issues and validate implementations