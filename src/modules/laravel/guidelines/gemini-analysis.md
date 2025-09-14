# Laravel Analysis with Gemini CLI

## When to Use Gemini CLI for Laravel Projects

Use Gemini CLI's massive context window for Laravel-specific analysis tasks that require understanding relationships across multiple files and directories.

## Laravel Architecture Analysis

### Full Application Structure
```bash
# Get complete Laravel app overview
gemini -p "@app/ @config/ @routes/ @database/ Analyze this Laravel application's overall architecture and explain the main components"

# Understand service organization
gemini -p "@app/Providers/ @config/ What services are configured and how do they interact?"

# Database architecture analysis
gemini -p "@app/Models/ @database/migrations/ @database/seeders/ Analyze the database schema, relationships, and data flow"
```

### Feature Implementation Discovery
```bash
# Check authentication implementation
gemini -p "@app/Http/Controllers/Auth/ @app/Models/User.php @config/auth.php @routes/web.php How is user authentication implemented?"

# API structure analysis
gemini -p "@app/Http/Controllers/Api/ @routes/api.php @app/Http/Resources/ Analyze the API structure and endpoints"

# Authorization and permissions
gemini -p "@app/Policies/ @app/Http/Middleware/ @config/permission.php How are permissions and authorization handled?"
```

### Laravel-Specific Patterns
```bash
# Service layer analysis
gemini -p "@app/Services/ @app/Http/Controllers/ How are business logic and services organized?"

# Event and listener system
gemini -p "@app/Events/ @app/Listeners/ @app/Providers/EventServiceProvider.php What events and listeners are implemented?"

# Job and queue analysis
gemini -p "@app/Jobs/ @config/queue.php @database/migrations/*_jobs_table.php How is the job queue system configured?"

# Artisan commands
gemini -p "@app/Console/ What custom Artisan commands exist and what do they do?"
```

## Laravel Testing Strategy Analysis

```bash
# Test coverage analysis
gemini -p "@tests/ @app/ What features are tested and what's missing from test coverage?"

# Feature test patterns
gemini -p "@tests/Feature/ @app/Http/Controllers/ Do the feature tests cover all controller endpoints?"

# Unit test coverage
gemini -p "@tests/Unit/ @app/Models/ @app/Services/ Are the models and services properly unit tested?"
```

## Configuration and Environment Analysis

```bash
# Environment and configuration
gemini -p "@config/ @.env.example @app/Providers/ How is the application configured for different environments?"

# Package integration analysis
gemini -p "@composer.json @config/ @app/Providers/ What third-party packages are integrated and how?"

# Performance optimization check
gemini -p "@config/cache.php @config/database.php @config/session.php What caching and optimization strategies are implemented?"
```

## Laravel + Frontend Integration

### Blade Templates Analysis
```bash
# Blade template structure
gemini -p "@resources/views/ @app/Http/Controllers/ How are views organized and what data is passed to templates?"

# Component usage patterns
gemini -p "@resources/views/components/ @resources/views/ What Blade components exist and how are they used?"
```

### Asset and Frontend Build
```bash
# Frontend build analysis
gemini -p "@resources/js/ @resources/css/ @vite.config.js @package.json How is the frontend build process configured?"

# Vue/React integration (if present)
gemini -p "@resources/js/ @resources/views/ How is JavaScript framework integration set up?"
```

## Security Analysis

```bash
# Security implementation review
gemini -p "@app/Http/Middleware/ @config/cors.php @app/Http/Controllers/ What security measures are implemented?"

# Input validation patterns
gemini -p "@app/Http/Requests/ @app/Http/Controllers/ How is input validation handled across the application?"

# CSRF and authentication security
gemini -p "@app/Http/Middleware/ @config/session.php @resources/views/ How are CSRF protection and session security implemented?"
```

## Performance and Scaling Analysis

```bash
# Database query optimization
gemini -p "@app/Models/ @database/migrations/ Are there any N+1 query issues or missing indexes?"

# Caching implementation
gemini -p "@app/ @config/cache.php What caching strategies are used throughout the application?"

# Background job processing
gemini -p "@app/Jobs/ @config/queue.php @app/Http/Controllers/ How are long-running tasks handled?"
```

## Migration and Deployment Analysis

```bash
# Deployment readiness
gemini -p "@config/ @.env.example @composer.json Is the application properly configured for production deployment?"

# Migration strategy
gemini -p "@database/migrations/ @database/seeders/ What is the database migration strategy and are there any potential issues?"
```

## Laravel Ecosystem Integration

```bash
# Laravel ecosystem packages
gemini -p "@composer.json @config/ @app/Providers/ What Laravel ecosystem packages (Horizon, Telescope, etc.) are integrated?"

# Custom package integration
gemini -p "@app/Providers/ @composer.json How are custom packages and service providers integrated?"
```

## Best Practices Compliance

```bash
# Laravel conventions adherence
gemini -p "@app/ Does this Laravel application follow Laravel naming conventions and best practices?"

# Code organization review
gemini -p "@app/ @routes/ Is the code well-organized according to Laravel standards?"

# Documentation completeness
gemini -p "@README.md @docs/ @app/ Is the project well-documented for other developers?"
```

## Context Switching to Claude Code

After using Gemini CLI for analysis, switch to Claude Code for:
- Implementing specific features identified in the analysis
- Running Laravel Artisan commands (`php artisan make:*`)
- Writing and running tests (`php artisan test`)
- Making targeted code changes to files
- Database migrations and model updates
- Debugging specific issues found during analysis