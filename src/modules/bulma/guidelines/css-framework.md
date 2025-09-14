# Bulma Guidelines

## Core Bulma Principles

Bulma is a modern CSS framework based on Flexbox with no JavaScript dependencies.

### Flexbox-First Approach
- Bulma is built entirely with Flexbox
- Use Bulma's flex utilities and modifiers
- No JavaScript required - pure CSS framework

### Modifier System
- Use Bulma's modifier classes with `is-` and `has-` prefixes
- Combine modifiers for complex styling
- Size modifiers: `is-small`, `is-medium`, `is-large`

```html
<button class="button is-primary is-large is-fullwidth">
    Large Primary Button
</button>
```

## Common Bulma Patterns

### Layout with Bulma
```html
<section class="section">
    <div class="container">
        <div class="columns">
            <div class="column is-half">
                <div class="content">
                    Half-width column
                </div>
            </div>
            <div class="column">
                Auto-width column
            </div>
        </div>
    </div>
</section>
```

### Navigation
```html
<nav class="navbar" role="navigation">
    <div class="navbar-brand">
        <a class="navbar-item" href="#">
            <img src="logo.png" width="112" height="28">
        </a>
        <a class="navbar-burger" data-target="navbarMenu">
            <span></span>
            <span></span>
            <span></span>
        </a>
    </div>
    <div id="navbarMenu" class="navbar-menu">
        <div class="navbar-start">
            <a class="navbar-item">Home</a>
            <a class="navbar-item">About</a>
        </div>
        <div class="navbar-end">
            <a class="navbar-item">Login</a>
        </div>
    </div>
</nav>
```

### Cards
```html
<div class="card">
    <div class="card-image">
        <figure class="image is-4by3">
            <img src="image.jpg" alt="Image">
        </figure>
    </div>
    <div class="card-content">
        <div class="content">
            <p class="title is-4">Card Title</p>
            <p class="subtitle is-6">Card subtitle</p>
            <p>Card content goes here.</p>
        </div>
    </div>
    <footer class="card-footer">
        <a href="#" class="card-footer-item">Action</a>
    </footer>
</div>
```

### Forms
```html
<div class="field">
    <label class="label">Email</label>
    <div class="control has-icons-left">
        <input class="input" type="email" placeholder="Email">
        <span class="icon is-small is-left">
            <i class="fas fa-envelope"></i>
        </span>
    </div>
</div>

<div class="field">
    <div class="control">
        <button class="button is-primary">Submit</button>
    </div>
</div>
```

### Hero Section
```html
<section class="hero is-primary is-medium">
    <div class="hero-body">
        <div class="container">
            <h1 class="title">Hero Title</h1>
            <h2 class="subtitle">Hero subtitle</h2>
        </div>
    </div>
</section>
```

## Bulma-Specific Best Practices

### Column System
- Use Bulma's 12-column system with fractional and named sizes
- Responsive modifiers: `is-mobile`, `is-tablet`, `is-desktop`, `is-widescreen`

```html
<div class="columns is-mobile">
    <div class="column is-half-mobile is-one-third-tablet">
        Responsive column
    </div>
    <div class="column">
        Auto column
    </div>
</div>
```

### Color Modifiers
- Use semantic colors: `is-primary`, `is-success`, `is-warning`, `is-danger`
- Combine with light/dark modifiers: `is-light`, `is-dark`

```html
<div class="notification is-primary is-light">
    Light primary notification
</div>
```

### Spacing and Sizing
- Use spacing helpers: `m-*`, `p-*`, `mx-*`, `py-*`
- Size modifiers for typography and components

```html
<h1 class="title is-1 has-text-centered mb-6">
    Large centered title with bottom margin
</h1>
```

### Flexbox Utilities
- Use flex helpers: `is-flex`, `is-justify-content-center`, `is-align-items-center`
- Direction modifiers: `is-flex-direction-column`

```html
<div class="is-flex is-justify-content-space-between is-align-items-center">
    <span>Left content</span>
    <span>Right content</span>
</div>
```

## Customization

### SASS Variables
```scss
// Override Bulma variables
$primary: #3273dc;
$family-primary: 'Nunito', sans-serif;
$radius-large: 8px;

@import "~bulma/bulma.sass";
```

### Custom Components
```scss
// Create custom components following Bulma conventions
.custom-card {
    @extend .card;

    &.is-elevated {
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
}
```

## Integration Tips

### Vue Integration
```vue
<template>
    <div class="field is-grouped">
        <div class="control">
            <button class="button is-primary" @click="submit">
                Submit
            </button>
        </div>
    </div>
</template>
```

### React Integration
```jsx
function BulmaButton({ children, color = 'primary', size, ...props }) {
    const classes = `button is-${color} ${size ? `is-${size}` : ''}`;
    return <button className={classes} {...props}>{children}</button>;
}
```