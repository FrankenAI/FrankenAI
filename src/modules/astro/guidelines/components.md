# Astro - Component Guidelines

*Based on Laravel Boost methodology - Static site generation with modern JavaScript frameworks*

## Astro Overview

Astro is a modern static site generator that allows you to build faster websites with less client-side JavaScript. It supports multiple frameworks and focuses on delivering static HTML with selective hydration.

### Core Concepts
- **Zero JavaScript by default** - Ships HTML and CSS, JavaScript only when needed
- **Component islands** - Interactive components hydrate independently
- **Multi-framework support** - Use React, Vue, Svelte, and others together
- **Static-first** - Generate static HTML at build time

## Basic Component Usage

### Astro Components (.astro files)
```astro
---
// Component script (server-side)
const title = "Welcome";
const items = ["Item 1", "Item 2", "Item 3"];
---

<div>
  <h1>{title}</h1>
  <ul>
    {items.map(item => <li>{item}</li>)}
  </ul>
</div>

<style>
  h1 {
    color: #333;
    font-size: 2rem;
  }
</style>
```

### Framework Components Integration
```astro
---
// Import framework components
import ReactButton from './ReactButton.jsx';
import VueCounter from './VueCounter.vue';
import SvelteCard from './SvelteCard.svelte';
---

<div>
  <h1>Multi-Framework Page</h1>

  <!-- Static by default -->
  <ReactButton />

  <!-- Hydrate on client -->
  <VueCounter client:load />

  <!-- Hydrate when visible -->
  <SvelteCard client:visible />
</div>
```

## Client-Side Hydration

### Hydration Directives
```astro
<!-- Load immediately -->
<Counter client:load />

<!-- Load when page is idle -->
<Widget client:idle />

<!-- Load when component becomes visible -->
<Chart client:visible />

<!-- Load based on media query -->
<MobileMenu client:media="(max-width: 768px)" />

<!-- Hydrate only on client -->
<InteractiveMap client:only="react" />
```

## Best Practices

### Performance Optimization
- Use `client:` directives sparingly
- Prefer static components when possible
- Implement progressive enhancement patterns
- Optimize images and assets

### Framework Integration
- Keep framework-specific code in separate files
- Use TypeScript for better development experience
- Implement proper error boundaries
- Consider bundle splitting for large applications

### SEO and Accessibility
- Leverage static generation for better SEO
- Ensure proper semantic HTML structure
- Implement progressive enhancement
- Test with JavaScript disabled