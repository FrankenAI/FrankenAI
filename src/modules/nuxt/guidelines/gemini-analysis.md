# Nuxt.js Analysis with Gemini CLI

## When to Use Gemini CLI for Nuxt.js Projects

Nuxt.js applications often have complex SSR/SSG configurations, module ecosystems, and Vue.js integration patterns that benefit from Gemini CLI's large context analysis.

## Nuxt.js Architecture Analysis

### Application Structure Analysis
```bash
# Complete Nuxt.js app overview
gemini -p "@pages/ @layouts/ @components/ @plugins/ @middleware/ @nuxt.config.js Analyze this Nuxt.js application's overall architecture"

# Directory structure analysis
gemini -p "@assets/ @static/ @store/ @layouts/ How is this Nuxt.js application structured?"

# Module and plugin ecosystem
gemini -p "@modules/ @plugins/ @nuxt.config.js What Nuxt modules and plugins are configured?"
```

### Nuxt 3 vs Nuxt 2 Analysis
```bash
# Version and feature analysis
gemini -p "@nuxt.config.js @package.json Is this Nuxt 2 or Nuxt 3, and what features are being used?"

# Composition API vs Options API usage
gemini -p "@components/ @pages/ @composables/ What Vue.js patterns are used throughout the app?"

# Server engine analysis (Nuxt 3)
gemini -p "@nuxt.config.js @server/ What server engine and API routes are configured?"
```

## Routing and Pages Analysis

### Pages and Routing Structure
```bash
# Route structure analysis
gemini -p "@pages/ Map out all routes and nested routes in this Nuxt application"

# Dynamic routing patterns
gemini -p "@pages/ What dynamic routes and route parameters exist?"

# Layout system analysis
gemini -p "@layouts/ @pages/ How are layouts structured and applied to pages?"

# Middleware implementation
gemini -p "@middleware/ @pages/ @nuxt.config.js What middleware exists and how is it applied?"
```

### Navigation and Linking
```bash
# Navigation patterns
gemini -p "@components/ @layouts/ How is navigation implemented across the application?"

# Link and routing optimization
gemini -p "@components/ @pages/ How are internal and external links handled?"
```

## Data Fetching and State Management

### Nuxt Data Fetching Analysis
```bash
# Data fetching patterns analysis
gemini -p "@pages/ @components/ What data fetching methods are used (asyncData, fetch, useFetch, etc.)?"

# SSR/SSG data flow
gemini -p "@pages/ @components/ @nuxt.config.js How is server-side data fetching configured?"

# API integration patterns
gemini -p "@pages/ @plugins/ @composables/ How are external APIs integrated?"
```

### State Management Strategy
```bash
# Vuex/Pinia analysis
gemini -p "@store/ @composables/ What state management solution is used?"

# Global state patterns
gemini -p "@plugins/ @composables/ @store/ How is global application state managed?"

# Server state management
gemini -p "@composables/ @server/ How is server-side state handled?"
```

## Nuxt Configuration Analysis

### Configuration and Environment
```bash
# Nuxt configuration analysis
gemini -p "@nuxt.config.js @nuxt.config.ts What's configured in the Nuxt config?"

# Environment and runtime config
gemini -p "@nuxt.config.js @.env* How are environment variables and runtime config managed?"

# Build and deployment configuration
gemini -p "@nuxt.config.js @package.json How is the app configured for different deployment targets?"
```

### Module and Plugin Configuration
```bash
# Installed modules analysis
gemini -p "@nuxt.config.js @package.json What Nuxt modules are installed and configured?"

# Plugin integration analysis
gemini -p "@plugins/ @nuxt.config.js How are plugins structured and registered?"

# Custom module implementation
gemini -p "@modules/ Are there any custom Nuxt modules implemented?"
```

## Performance and Optimization Analysis

### Build and Bundle Optimization
```bash
# Build optimization analysis
gemini -p "@nuxt.config.js @package.json What build optimizations are configured?"

# Bundle analysis and splitting
gemini -p "@nuxt.config.js @components/ How is code splitting implemented?"

# Asset optimization
gemini -p "@assets/ @static/ @nuxt.config.js How are assets optimized and served?"
```

### SSR/SSG Configuration
```bash
# Rendering strategy analysis
gemini -p "@nuxt.config.js @pages/ What rendering strategies are used (SSR, SSG, SPA)?"

# Static generation analysis
gemini -p "@nuxt.config.js @pages/ Which pages are statically generated?"

# ISR implementation (Nuxt 3)
gemini -p "@nuxt.config.js How is Incremental Static Regeneration configured?"
```

## SEO and Meta Management

### SEO Implementation Analysis
```bash
# SEO setup analysis
gemini -p "@pages/ @layouts/ @components/ @nuxt.config.js How is SEO handled (meta tags, Open Graph, etc.)?"

# Sitemap and robots configuration
gemini -p "@nuxt.config.js @static/ What SEO files and configurations exist?"

# Structured data implementation
gemini -p "@pages/ @components/ Is structured data/JSON-LD implemented?"
```

## Styling and UI Analysis

### Styling Architecture
```bash
# Styling strategy analysis
gemini -p "@assets/css/ @assets/scss/ @nuxt.config.js What styling approach is used?"

# CSS framework integration
gemini -p "@nuxt.config.js @assets/ @components/ What CSS frameworks are integrated?"

# Component styling patterns
gemini -p "@components/ How are components styled (scoped CSS, CSS modules, etc.)?"
```

### UI and Component Libraries
```bash
# UI library integration
gemini -p "@nuxt.config.js @components/ @package.json What UI libraries are integrated?"

# Component organization
gemini -p "@components/ How are reusable components organized?"
```

## Server-Side Analysis (Nuxt 3)

### Server API and Middleware
```bash
# Server API analysis
gemini -p "@server/api/ @server/middleware/ What server-side functionality exists?"

# Database integration
gemini -p "@server/ @composables/ @prisma/ How is database access implemented?"

# Authentication server-side
gemini -p "@server/ @middleware/ How is server-side authentication handled?"
```

## Testing Strategy Analysis

### Test Coverage Analysis
```bash
# Testing setup analysis
gemini -p "@test/ @spec/ @vitest.config.js @jest.config.js How is testing configured?"

# Component testing patterns
gemini -p "@test/ @components/ What components are tested and how?"

# E2E testing implementation
gemini -p "@test/ @cypress/ @playwright.config.js Are end-to-end tests implemented?"

# SSR testing coverage
gemini -p "@test/ How is server-side rendering tested?"
```

## Deployment and Production Analysis

### Deployment Configuration
```bash
# Deployment setup analysis
gemini -p "@nuxt.config.js @package.json @Dockerfile How is deployment configured?"

# Static site generation setup
gemini -p "@nuxt.config.js What pages and routes are statically generated?"

# Server deployment configuration
gemini -p "@nuxt.config.js @ecosystem.config.js How is server deployment configured?"
```

### Performance Monitoring
```bash
# Analytics and performance monitoring
gemini -p "@nuxt.config.js @plugins/ What analytics and monitoring are configured?"

# Error tracking and logging
gemini -p "@nuxt.config.js @plugins/ How are errors tracked and logged?"
```

## Nuxt Ecosystem Integration

### Content Management
```bash
# Nuxt Content analysis
gemini -p "@content/ @nuxt.config.js Is Nuxt Content used for content management?"

# Headless CMS integration
gemini -p "@composables/ @server/ @nuxt.config.js What CMS or content sources are integrated?"
```

### E-commerce and Specialized Modules
```bash
# E-commerce module analysis
gemini -p "@nuxt.config.js @store/ @components/ Are e-commerce modules (like @nuxtjs/commerce) used?"

# PWA configuration
gemini -p "@nuxt.config.js Is PWA functionality configured?"

# Internationalization setup
gemini -p "@nuxt.config.js @locales/ @lang/ How is i18n configured?"
```

## Best Practices and Architecture Review

### Code Organization and Patterns
```bash
# Nuxt best practices compliance
gemini -p "@pages/ @components/ @composables/ Does this app follow Nuxt.js best practices?"

# Vue.js patterns in Nuxt context
gemini -p "@components/ @composables/ What Vue.js patterns are used effectively?"

# Performance best practices
gemini -p "@nuxt.config.js @components/ Are performance best practices implemented?"
```

## Context Switching to Claude Code

After Gemini CLI analysis, switch to Claude Code for:
- Creating new pages, components, and layouts
- Implementing Nuxt-specific features (middleware, plugins)
- Setting up data fetching with `useFetch`, `$fetch`
- Running Nuxt development commands (`nuxt dev`, `nuxt generate`)
- Writing and running tests
- Configuring Nuxt modules and plugins
- Debugging SSR/hydration issues
- Implementing authentication flows
- Setting up deployment configurations
- Optimizing performance based on analysis findings