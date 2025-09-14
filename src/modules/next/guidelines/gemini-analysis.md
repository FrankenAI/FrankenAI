# Next.js Analysis with Gemini CLI

## When to Use Gemini CLI for Next.js Projects

Next.js projects often have complex routing, data fetching patterns, and full-stack architecture that benefit from Gemini CLI's large context window for comprehensive analysis.

## Next.js Architecture Analysis

### Full Application Structure
```bash
# Complete Next.js app overview
gemini -p "@pages/ @src/app/ @components/ @lib/ @styles/ Analyze this Next.js application's overall architecture and structure"

# App Router vs Pages Router analysis
gemini -p "@src/app/ @pages/ Which routing system is this Next.js app using and how is it structured?"

# Component organization analysis
gemini -p "@components/ @src/components/ How are React components organized in this Next.js application?"
```

### Routing and Navigation Analysis
```bash
# Route structure analysis
gemini -p "@src/app/ @pages/ Map out all the routes in this Next.js application"

# Dynamic routing patterns
gemini -p "@src/app/ @pages/ What dynamic routes exist and how are they structured?"

# API routes analysis
gemini -p "@src/app/api/ @pages/api/ Analyze the API endpoints and their structure"

# Middleware and route protection
gemini -p "@middleware.ts @middleware.js @src/app/ How is middleware configured and what routes does it protect?"
```

### Data Fetching Patterns
```bash
# Data fetching strategy analysis
gemini -p "@src/app/ @pages/ @lib/ What data fetching patterns are used (SSG, SSR, ISR, CSR)?"

# Server components analysis (App Router)
gemini -p "@src/app/ Which components are server components vs client components?"

# API integration patterns
gemini -p "@src/app/ @pages/ @lib/ How does this app handle external API calls and data management?"

# Database integration analysis
gemini -p "@lib/ @src/app/ @prisma/ @models/ How is database access structured in this Next.js app?"
```

## Performance and Optimization Analysis

### Build and Bundle Analysis
```bash
# Build optimization analysis
gemini -p "@next.config.js @package.json @src/ What build optimizations are configured?"

# Image optimization usage
gemini -p "@src/ @public/ How is Next.js Image optimization being used?"

# Font optimization analysis
gemini -p "@src/ @styles/ What font loading strategies are implemented?"

# Bundle analysis and code splitting
gemini -p "@src/ @components/ How is code splitting implemented across the application?"
```

### SEO and Meta Analysis
```bash
# SEO implementation analysis
gemini -p "@src/app/ @pages/ @components/ How is SEO handled (metadata, Open Graph, etc.)?"

# Sitemap and robots analysis
gemini -p "@src/app/sitemap.ts @src/app/robots.ts @public/ What SEO files are configured?"

# Schema markup implementation
gemini -p "@src/ Is structured data/schema markup implemented?"
```

## Authentication and Security Analysis

### Authentication Implementation
```bash
# Auth system analysis
gemini -p "@src/app/ @pages/ @lib/auth/ @middleware.ts How is user authentication implemented?"

# Session management analysis
gemini -p "@src/app/ @lib/ @pages/ How are user sessions managed?"

# Protected routes analysis
gemini -p "@middleware.ts @src/app/ @pages/ Which routes are protected and how?"

# API route security
gemini -p "@src/app/api/ @pages/api/ How are API routes secured and validated?"
```

## Styling and UI Analysis

### Styling Architecture
```bash
# Styling strategy analysis
gemini -p "@styles/ @src/app/ @tailwind.config.js What styling approach is used (CSS Modules, Tailwind, etc.)?"

# Theme and design system
gemini -p "@components/ @styles/ @src/ Is there a consistent design system or theme?"

# Responsive design implementation
gemini -p "@components/ @styles/ How is responsive design handled across components?"
```

### Component Library Integration
```bash
# UI library analysis
gemini -p "@components/ @package.json What UI libraries are integrated (MUI, Chakra, etc.)?"

# Custom component patterns
gemini -p "@components/ @src/components/ What are the common component patterns used?"
```

## State Management Analysis

### State Management Strategy
```bash
# State management analysis
gemini -p "@src/ @store/ @context/ @hooks/ How is application state managed?"

# Context usage patterns
gemini -p "@src/ @context/ How is React Context used throughout the application?"

# Custom hooks analysis
gemini -p "@hooks/ @src/hooks/ What custom hooks exist and what do they do?"

# Server state management
gemini -p "@src/ @lib/ How is server state managed (React Query, SWR, etc.)?"
```

## Deployment and Configuration Analysis

### Deployment Configuration
```bash
# Deployment setup analysis
gemini -p "@next.config.js @package.json @vercel.json @docker* How is this Next.js app configured for deployment?"

# Environment configuration
gemini -p "@.env* @next.config.js How are environment variables managed?"

# Build and CI/CD analysis
gemini -p "@.github/ @package.json @next.config.js What build and deployment processes are configured?"
```

### Performance Monitoring
```bash
# Analytics and monitoring
gemini -p "@src/ @next.config.js What analytics and monitoring tools are integrated?"

# Error tracking implementation
gemini -p "@src/ @next.config.js How is error tracking and reporting handled?"
```

## Testing Strategy Analysis

### Test Coverage Analysis
```bash
# Testing setup analysis
gemini -p "@__tests__/ @src/ @jest.config.js @vitest.config.js How is testing configured and structured?"

# Component testing patterns
gemini -p "@__tests__/ @src/ What components are tested and what testing patterns are used?"

# E2E testing implementation
gemini -p "@e2e/ @playwright.config.js @cypress.config.js Are end-to-end tests implemented?"

# API testing coverage
gemini -p "@__tests__/ @src/app/api/ Are API routes properly tested?"
```

## Next.js 13+ App Router Specific Analysis

### App Router Features
```bash
# App Router implementation analysis
gemini -p "@src/app/ How effectively is the new App Router being used?"

# Server Components usage
gemini -p "@src/app/ What's the balance between Server and Client Components?"

# Streaming and Suspense
gemini -p "@src/app/ How is streaming and Suspense implemented?"

# Parallel routes and intercepting routes
gemini -p "@src/app/ Are advanced routing features like parallel routes used?"
```

### App Router Data Fetching
```bash
# New data fetching patterns
gemini -p "@src/app/ How is data fetching handled in the App Router?"

# Caching strategy analysis
gemini -p "@src/app/ @next.config.js What caching strategies are implemented?"

# Revalidation patterns
gemini -p "@src/app/ How is data revalidation configured?"
```

## Integration Analysis

### Third-party Integrations
```bash
# External service integrations
gemini -p "@src/ @lib/ @package.json What external services are integrated (CMS, payment, etc.)?"

# Database and ORM analysis
gemini -p "@lib/ @prisma/ @models/ How is database integration structured?"

# API integration patterns
gemini -p "@src/ @lib/ How are external APIs consumed and managed?"
```

## Common Issues and Patterns

### Performance Issues Detection
```bash
# Performance bottleneck analysis
gemini -p "@src/ @components/ @next.config.js Are there potential performance issues in this Next.js app?"

# Bundle size analysis
gemini -p "@package.json @src/ @next.config.js What's contributing to the bundle size?"

# Hydration mismatch detection
gemini -p "@src/ @components/ Are there potential hydration mismatch issues?"
```

### Best Practices Review
```bash
# Next.js best practices compliance
gemini -p "@src/ @next.config.js Does this Next.js app follow current best practices?"

# Security best practices
gemini -p "@src/ @middleware.ts @next.config.js Are security best practices implemented?"

# Accessibility implementation
gemini -p "@components/ @src/ How is accessibility handled throughout the application?"
```

## Context Switching to Claude Code

After Gemini CLI analysis, switch to Claude Code for:
- Creating new pages and components
- Implementing specific Next.js features (middleware, API routes)
- Setting up authentication flows
- Running Next.js development commands (`next dev`, `next build`)
- Writing and running tests
- Optimizing performance based on analysis findings
- Debugging specific Next.js issues
- Implementing data fetching patterns
- Setting up deployment configurations