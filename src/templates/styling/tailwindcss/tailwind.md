## Tailwind CSS Guidelines

### Key Features & Best Practices

**Utility-First Approach**
```html
<!-- Responsive design -->
<div class="container mx-auto px-4">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h3 class="text-xl font-semibold text-gray-800 mb-4">Card Title</h3>
      <p class="text-gray-600 leading-relaxed">Card content</p>
    </div>
  </div>
</div>
```

**Custom Components with @apply**
```css
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

**Configuration Customization**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,vue,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Best Practices
- Use consistent spacing scale
- Implement design tokens through config
- Use component extraction for repeated patterns
- Optimize for production with purging