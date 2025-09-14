# Tailwind CSS Guidelines

## Tailwind Core

- Use Tailwind CSS classes to style HTML, check and use existing tailwind conventions within the project before writing your own.
- Offer to extract repeated patterns into components that match the project's conventions (i.e. Blade, JSX, Vue, etc..)
- Think through class placement, order, priority, and defaults - remove redundant classes, add classes to parent or child carefully to limit repetition, group elements logically
- You can use the `search-docs` tool to get exact examples from the official documentation when needed.

## Spacing

- When listing items, use gap utilities for spacing, don't use margins.

```html
<!-- Valid Flex Gap Spacing Example -->
<div class="flex gap-8">
    <div>Superior</div>
    <div>Michigan</div>
    <div>Erie</div>
</div>
```

## Dark Mode

- If existing pages and components support dark mode, new pages and components must support dark mode in a similar way, typically using `dark:`.

## Best Practices

### Responsive Design
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Mobile-first approach: base classes for mobile, then responsive overrides

```html
<!-- Responsive Grid Example -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Grid items -->
</div>
```

### Component Extraction
- Extract repeated patterns into reusable components
- Use `@apply` directive in CSS for complex component styles

```css
/* Component CSS */
.btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

### Utility Organization
- Group utilities logically: layout → spacing → colors → typography → effects
- Use consistent naming patterns across the project

```html
<!-- Well-organized utility classes -->
<div class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
    <h3 class="text-lg font-semibold text-gray-900">Title</h3>
    <button class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">Action</button>
</div>
```

## Common Patterns

### Cards
```html
<div class="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
    <h3 class="text-lg font-semibold mb-2">Card Title</h3>
    <p class="text-gray-600">Card content</p>
</div>
```

### Forms
```html
<div class="space-y-4">
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
    </div>
</div>
```

### Buttons
```html
<!-- Primary Button -->
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
    Primary Action
</button>

<!-- Secondary Button -->
<button class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
    Secondary Action
</button>
```