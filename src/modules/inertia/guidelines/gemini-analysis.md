# Inertia.js Analysis with Gemini CLI

## When to Use Gemini CLI for Inertia Projects

Inertia.js creates a bridge between backend and frontend, making it perfect for Gemini CLI's ability to analyze relationships across multiple technologies and file structures simultaneously.

## Full-Stack Architecture Analysis

### Cross-Stack Application Structure
```bash
# Complete Inertia app overview (backend + frontend)
gemini -p "@app/ @resources/js/ @routes/ Analyze this Inertia.js application's full-stack architecture"

# Backend-Frontend data flow analysis
gemini -p "@app/Http/Controllers/ @resources/js/Pages/ How does data flow from Laravel controllers to Inertia pages?"

# Routing relationship analysis
gemini -p "@routes/web.php @resources/js/Pages/ @resources/js/app.js Map the relationship between Laravel routes and Inertia pages"
```

### Inertia-Specific Patterns Analysis
```bash
# Page component organization
gemini -p "@resources/js/Pages/ @resources/js/Layouts/ How are Inertia pages and layouts organized?"

# Shared data and props analysis
gemini -p "@app/Http/Controllers/ @app/Http/Middleware/HandleInertiaRequests.php @resources/js/ What shared data is passed to all Inertia pages?"

# Form handling patterns
gemini -p "@resources/js/Pages/ @app/Http/Controllers/ How are forms handled across the Inertia stack?"
```

## Frontend Framework Integration Analysis

### Vue.js + Inertia Analysis
```bash
# Vue component structure with Inertia
gemini -p "@resources/js/ @resources/js/Pages/ How are Vue components organized in this Inertia app?"

# Vue composition patterns
gemini -p "@resources/js/Pages/ @resources/js/Components/ What Vue composition patterns are used (Options API vs Composition API)?"

# State management integration
gemini -p "@resources/js/ @resources/js/stores/ Is Pinia/Vuex integrated with Inertia and how?"
```

### React + Inertia Analysis
```bash
# React component patterns with Inertia
gemini -p "@resources/js/ @resources/js/Pages/ How are React components structured in this Inertia application?"

# React hooks usage
gemini -p "@resources/js/Pages/ @resources/js/Components/ What React hooks patterns are used with Inertia?"

# State management with React
gemini -p "@resources/js/ Is there Redux/Zustand integration and how does it work with Inertia?"
```

### Svelte + Inertia Analysis
```bash
# Svelte component organization
gemini -p "@resources/js/ @resources/js/Pages/ How are Svelte components organized in this Inertia setup?"

# Svelte stores integration
gemini -p "@resources/js/ @resources/js/stores/ How are Svelte stores integrated with Inertia data flow?"
```

## Authentication and Authorization Analysis

### Inertia Auth Implementation
```bash
# Authentication flow analysis
gemini -p "@app/Http/Controllers/Auth/ @resources/js/Pages/Auth/ @app/Http/Middleware/HandleInertiaRequests.php How is authentication implemented across the Inertia stack?"

# User data sharing
gemini -p "@app/Http/Middleware/HandleInertiaRequests.php @resources/js/ How is authenticated user data shared with frontend pages?"

# Protected routes and middleware
gemini -p "@routes/web.php @app/Http/Middleware/ @resources/js/Pages/ How are protected routes handled in Inertia?"
```

## Asset and Build Analysis

### Build Configuration
```bash
# Inertia build setup analysis
gemini -p "@vite.config.js @webpack.mix.js @resources/js/app.js @package.json How is the Inertia frontend build configured?"

# Asset optimization
gemini -p "@resources/js/ @resources/css/ @public/ How are assets optimized for production in this Inertia setup?"

# Code splitting implementation
gemini -p "@resources/js/Pages/ @vite.config.js Are pages properly code-split for optimal loading?"
```

## Data Handling and API Integration

### Props and Data Flow
```bash
# Data transformation analysis
gemini -p "@app/Http/Controllers/ @app/Http/Resources/ @resources/js/Pages/ How is data transformed between Laravel and Inertia pages?"

# Resource usage patterns
gemini -p "@app/Http/Resources/ @app/Http/Controllers/ Are API Resources used consistently for Inertia responses?"

# Validation handling
gemini -p "@app/Http/Requests/ @resources/js/Pages/ How is validation handled across the Inertia stack?"
```

### External API Integration
```bash
# API integration patterns
gemini -p "@resources/js/ @app/Http/Controllers/ How are external APIs integrated in this Inertia application?"

# Error handling across stack
gemini -p "@app/Exceptions/ @resources/js/ How are errors handled and displayed across the full stack?"
```

## Performance Analysis

### Loading and Performance Optimization
```bash
# Page loading optimization
gemini -p "@resources/js/Pages/ @app/Http/Controllers/ Are pages optimized for fast loading and good UX?"

# Asset loading strategy
gemini -p "@resources/js/ @vite.config.js What's the asset loading strategy and can it be optimized?"

# Database query optimization for Inertia
gemini -p "@app/Http/Controllers/ @app/Models/ Are database queries optimized for Inertia page loads?"
```

### Caching Strategy
```bash
# Inertia caching implementation
gemini -p "@app/Http/Controllers/ @config/cache.php @resources/js/ What caching strategies are used for Inertia responses?"

# Asset caching configuration
gemini -p "@vite.config.js @public/ How are assets cached for optimal performance?"
```

## Testing Strategy Analysis

### Full-Stack Testing
```bash
# Test coverage across stack
gemini -p "@tests/ @resources/js/ @app/Http/Controllers/ How comprehensive is testing across the Inertia stack?"

# Feature test patterns
gemini -p "@tests/Feature/ @resources/js/Pages/ Do feature tests properly test Inertia page interactions?"

# Frontend testing integration
gemini -p "@resources/js/ @tests/ Is frontend testing (Jest, Vitest) integrated with backend testing?"
```

### End-to-End Testing
```bash
# E2E test coverage
gemini -p "@tests/ @resources/js/Pages/ Are critical user flows tested end-to-end?"

# Browser testing setup
gemini -p "@tests/ @resources/js/ Is browser testing (Dusk, Cypress, Playwright) properly configured?"
```

## Security Analysis

### Cross-Stack Security
```bash
# Security implementation analysis
gemini -p "@app/Http/Middleware/ @resources/js/ @config/ How is security implemented across the Inertia stack?"

# CSRF and XSS protection
gemini -p "@app/Http/Middleware/ @resources/js/ How are CSRF and XSS protections implemented in Inertia?"

# Input sanitization
gemini -p "@app/Http/Requests/ @resources/js/Pages/ How is user input sanitized on both frontend and backend?"
```

## Deployment and Production Analysis

### Production Readiness
```bash
# Production configuration
gemini -p "@config/ @.env.example @vite.config.js @package.json Is the Inertia app properly configured for production?"

# Asset compilation for production
gemini -p "@vite.config.js @webpack.mix.js @package.json How are assets compiled and optimized for production deployment?"

# Server requirements analysis
gemini -p "@composer.json @package.json @config/ What are the server requirements for this Inertia application?"
```

## Development Workflow Analysis

### Developer Experience
```bash
# Development setup analysis
gemini -p "@README.md @package.json @composer.json @.env.example How easy is it for new developers to set up this Inertia project?"

# Hot reloading and development tools
gemini -p "@vite.config.js @resources/js/ Are development tools properly configured for good DX?"

# Debugging capabilities
gemini -p "@config/ @resources/js/ What debugging tools and techniques are available for this Inertia stack?"
```

## Common Issues and Patterns

### Architecture Patterns Review
```bash
# Best practices compliance
gemini -p "@app/ @resources/js/ Does this Inertia application follow recommended architecture patterns?"

# Code organization review
gemini -p "@resources/js/ @app/Http/Controllers/ Is the code well-organized for maintainability?"

# Documentation completeness
gemini -p "@README.md @docs/ @resources/js/ @app/ Is the project well-documented for the full stack?"
```

## Context Switching to Claude Code

After Gemini CLI analysis, switch to Claude Code for:
- Creating new Inertia pages and components
- Implementing form handling with `useForm()`
- Setting up authentication flows
- Running Laravel and frontend build commands
- Writing and running full-stack tests
- Making targeted changes to controllers and pages
- Debugging specific Inertia response issues
- Installing and configuring Inertia plugins