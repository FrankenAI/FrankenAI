# Bootstrap Guidelines

## Core Bootstrap Principles

Bootstrap is a component-first CSS framework that provides pre-built components and utility classes.

### Component-First Approach
- Use Bootstrap's pre-built components (buttons, cards, navbar, etc.) before creating custom ones
- Customize components using Bootstrap's CSS custom properties
- Leverage Bootstrap's JavaScript components for interactive elements

### Grid System
- Use Bootstrap's 12-column grid system with containers, rows, and columns
- Responsive breakpoints: xs (<576px), sm (≥576px), md (≥768px), lg (≥992px), xl (≥1200px), xxl (≥1400px)

```html
<div class="container">
    <div class="row">
        <div class="col-12 col-md-6 col-lg-4">Content</div>
        <div class="col-12 col-md-6 col-lg-8">Content</div>
    </div>
</div>
```

## Common Bootstrap Patterns

### Navigation
```html
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
        <a class="navbar-brand" href="#">Brand</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link active" href="#">Home</a>
                </li>
            </ul>
        </div>
    </div>
</nav>
```

### Cards
```html
<div class="card">
    <div class="card-header">
        Card Header
    </div>
    <div class="card-body">
        <h5 class="card-title">Card Title</h5>
        <p class="card-text">Card content goes here.</p>
        <a href="#" class="btn btn-primary">Action</a>
    </div>
</div>
```

### Forms
```html
<form>
    <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id="email">
    </div>
    <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input type="password" class="form-control" id="password">
    </div>
    <button type="submit" class="btn btn-primary">Submit</button>
</form>
```

### Buttons
```html
<!-- Primary styles -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>

<!-- States -->
<button class="btn btn-primary" disabled>Disabled</button>
<button class="btn btn-outline-primary">Outlined</button>
```

## Bootstrap-Specific Best Practices

### Customization
- Use SCSS variables to customize Bootstrap themes
- Override Bootstrap variables before importing Bootstrap
- Use CSS custom properties for runtime theme switching

```scss
// Custom Bootstrap variables
$primary: #007bff;
$secondary: #6c757d;
$border-radius: 0.5rem;

@import "bootstrap";
```

### JavaScript Components
- Initialize Bootstrap components properly
- Use data attributes or JavaScript API
- Handle component events for custom functionality

```javascript
// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
})
```

### Utility Classes
- Use Bootstrap's spacing utilities (m-*, p-*, g-*)
- Leverage display utilities (d-flex, d-none, etc.)
- Use text utilities for typography

```html
<div class="d-flex justify-content-between align-items-center p-3 mb-4 bg-light rounded">
    <h4 class="mb-0">Title</h4>
    <small class="text-muted">Subtitle</small>
</div>
```

## Integration with Frameworks

### React (react-bootstrap)
```jsx
import { Button, Card, Container } from 'react-bootstrap';

function MyComponent() {
    return (
        <Container>
            <Card>
                <Card.Body>
                    <Card.Title>Card Title</Card.Title>
                    <Button variant="primary">Action</Button>
                </Card.Body>
            </Card>
        </Container>
    );
}
```

### Vue (bootstrap-vue)
```vue
<template>
    <b-container>
        <b-card>
            <b-card-title>Card Title</b-card-title>
            <b-button variant="primary">Action</b-button>
        </b-card>
    </b-container>
</template>
```