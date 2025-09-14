# CSS Frameworks - Common Guidelines

## Core Principles

### Responsive Design
- Mobile-first approach: design for small screens first, then enhance for larger screens
- Use framework-specific responsive utilities
- Test on multiple device sizes

### Component-Based Thinking
- Extract repeated patterns into reusable components
- Follow the project's component conventions (Blade, JSX, Vue, Svelte)
- Create consistent design tokens (colors, spacing, typography)

### Performance Considerations
- Remove unused CSS classes in production
- Use framework's optimization tools
- Minimize custom CSS, leverage framework utilities

## Common Patterns

### Grid Systems
- Use framework's grid system for layouts
- Prefer CSS Grid or Flexbox utilities over floats
- Ensure responsive breakpoints are consistent

### Forms
- Use framework's form components and validation styles
- Provide clear focus states and error messaging
- Ensure accessibility with proper labels and ARIA attributes

### Navigation
- Use framework's navigation components
- Ensure mobile-friendly navigation (hamburger menus, etc.)
- Provide clear active states and hover effects

### Cards and Content
- Use framework's card components for content organization
- Maintain consistent spacing and typography
- Use semantic HTML structure

## Accessibility

### ARIA and Semantic HTML
- Use proper semantic elements (`<nav>`, `<main>`, `<article>`, etc.)
- Add ARIA labels where needed
- Ensure proper heading hierarchy

### Color Contrast
- Use framework's accessible color combinations
- Test color contrast ratios (4.5:1 minimum for normal text)
- Don't rely solely on color to convey information

### Keyboard Navigation
- Ensure all interactive elements are keyboard accessible
- Provide visible focus indicators
- Use framework's focus management utilities

## Code Organization

### Class Ordering
- Follow consistent class ordering: layout → spacing → colors → typography → effects
- Group related classes together
- Remove redundant or conflicting classes

### Naming Conventions
- Use framework's naming conventions consistently
- Create project-specific naming patterns for custom components
- Document custom utilities and components

### File Structure
- Organize styles by component or feature
- Separate framework configuration from custom styles
- Use framework's recommended file structure

## Best Practices

### Development Workflow
- Use framework's development tools and hot reload
- Validate markup with framework's linting tools
- Test responsive behavior during development

### Maintenance
- Keep framework updated to latest stable version
- Document custom modifications and overrides
- Regular accessibility audits

### Team Collaboration
- Document component usage and variations
- Create style guides for custom components
- Use consistent code formatting and conventions