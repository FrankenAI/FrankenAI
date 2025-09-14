# Laravel Folio - Page-Based Routing Guidelines

*Based on Laravel Boost methodology - File-based routing for modern Laravel applications*

## Laravel Folio Overview

Laravel Folio provides a file-based routing system where routes are automatically generated based on the file structure in your `resources/views/pages/` directory. This eliminates the need to define routes manually in `routes/web.php` for simple pages.

### Core Concepts
- **File-based routing** - Routes are determined by file structure
- **Automatic route generation** - No need to register routes manually
- **Blade template integration** - Full Blade templating support
- **Laravel integration** - Seamless integration with Laravel features

## Directory Structure and Routing

### Basic Routing Patterns
```
resources/views/pages/
├── index.blade.php              → /
├── about.blade.php              → /about
├── contact.blade.php            → /contact
├── products/
│   ├── index.blade.php          → /products
│   ├── [id].blade.php           → /products/{id}
│   └── create.blade.php         → /products/create
└── auth/
    ├── login.blade.php          → /auth/login
    └── register.blade.php       → /auth/register
```

### Dynamic Route Parameters
```php
{{-- resources/views/pages/products/[id].blade.php --}}
<?php
use function Laravel\Folio\name;
use function Laravel\Folio\middleware;

name('products.show');
middleware(['auth', 'verified']);
?>

<x-app-layout>
    <x-slot name="header">
        <h2>Product #{{ $id }}</h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <h1>Product Details</h1>
                    <p>Viewing product with ID: {{ $id }}</p>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
```

### Nested Dynamic Routes
```php
{{-- resources/views/pages/categories/[category]/products/[product].blade.php --}}
{{-- Route: /categories/{category}/products/{product} --}}
<?php
use function Laravel\Folio\name;

name('categories.products.show');
?>

<x-app-layout>
    <h1>Product in Category</h1>
    <p>Category: {{ $category }}</p>
    <p>Product: {{ $product }}</p>
</x-app-layout>
```

## Folio Functions and Features

### Named Routes
```php
<?php
use function Laravel\Folio\name;

name('dashboard');
?>

<x-app-layout>
    <h1>Dashboard</h1>

    {{-- You can now reference this route --}}
    <a href="{{ route('dashboard') }}">Back to Dashboard</a>
</x-app-layout>
```

### Middleware Application
```php
<?php
use function Laravel\Folio\name;
use function Laravel\Folio\middleware;

name('admin.users');
middleware(['auth', 'verified', 'can:manage-users']);
?>

<x-admin-layout>
    <h1>Manage Users</h1>
    {{-- Admin content --}}
</x-admin-layout>
```

### Multiple Middleware with Parameters
```php
<?php
use function Laravel\Folio\middleware;

middleware([
    'auth',
    'verified',
    'throttle:60,1',
    'role:admin|manager'
]);
?>
```

## Creating New Folio Pages

### Using Artisan Commands
```bash
# Create a basic page
php artisan folio:page products

# Create a page with directory structure
php artisan folio:page products/categories

# Create a dynamic route page
php artisan folio:page 'products/[id]'

# Create nested dynamic routes
php artisan folio:page 'categories/[category]/products/[product]'
```

### Manual Page Creation
```php
{{-- resources/views/pages/services/index.blade.php --}}
<?php
use function Laravel\Folio\name;
use function Laravel\Folio\middleware;

name('services.index');
middleware(['web']);
?>

<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Our Services') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    <h1>Available Services</h1>
                    <ul>
                        <li><a href="{{ route('services.web-development') }}">Web Development</a></li>
                        <li><a href="{{ route('services.mobile-apps') }}">Mobile Applications</a></li>
                        <li><a href="{{ route('services.consulting') }}">Technical Consulting</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
```

## Integration with Laravel Features

### Form Handling with Folio
```php
{{-- resources/views/pages/contact.blade.php --}}
<?php
use function Laravel\Folio\name;
use function Laravel\Folio\middleware;

name('contact');
middleware(['web']);
?>

<x-app-layout>
    <h1>Contact Us</h1>

    <form method="POST" action="{{ route('contact.store') }}">
        @csrf
        <div class="mb-4">
            <label for="name">Name</label>
            <input type="text" id="name" name="name"
                   value="{{ old('name') }}"
                   class="form-input">
            @error('name')
                <span class="text-red-500">{{ $message }}</span>
            @enderror
        </div>

        <div class="mb-4">
            <label for="email">Email</label>
            <input type="email" id="email" name="email"
                   value="{{ old('email') }}"
                   class="form-input">
            @error('email')
                <span class="text-red-500">{{ $message }}</span>
            @enderror
        </div>

        <button type="submit" class="btn btn-primary">Send Message</button>
    </form>
</x-app-layout>
```

### Model Binding with Folio
```php
{{-- resources/views/pages/users/[user].blade.php --}}
<?php
use function Laravel\Folio\name;
use function Laravel\Folio\middleware;
use App\Models\User;

name('users.show');
middleware(['auth']);
?>

<x-app-layout>
    <h1>User Profile</h1>

    <div class="user-profile">
        <h2>{{ $user->name }}</h2>
        <p>Email: {{ $user->email }}</p>
        <p>Joined: {{ $user->created_at->diffForHumans() }}</p>

        @can('update', $user)
            <a href="{{ route('users.edit', $user) }}" class="btn">Edit Profile</a>
        @endcan
    </div>
</x-app-layout>
```

## Management and Utilities

### List All Folio Routes
```bash
# List all Folio routes
php artisan folio:list

# Output example:
# GET /                    resources/views/pages/index.blade.php
# GET /about              resources/views/pages/about.blade.php
# GET /products           resources/views/pages/products/index.blade.php
# GET /products/{id}      resources/views/pages/products/[id].blade.php
```

### Route Caching with Folio
```bash
# Cache all routes including Folio routes
php artisan route:cache

# Clear route cache
php artisan route:clear
```

## Best Practices

### Organization Patterns
1. **Group related pages** - Use directories to organize related functionality
2. **Consistent naming** - Follow Laravel naming conventions for files
3. **Middleware placement** - Apply middleware at the page level, not globally
4. **Named routes** - Always name your Folio routes for easier maintenance

### Security Considerations
```php
<?php
// Always apply appropriate middleware
use function Laravel\Folio\middleware;

// Protect admin pages
middleware(['auth', 'verified', 'role:admin']);

// Rate limit contact forms
middleware(['throttle:5,1']);

// Require email verification
middleware(['auth', 'verified']);
?>
```

### Performance Optimization
```php
<?php
// Consider caching for heavy pages
use function Laravel\Folio\middleware;

middleware(['cache.headers:public;max_age=3600']);
?>
```

### Integration with Existing Routes
- **Folio routes** are registered after traditional routes
- **Traditional routes** take precedence over Folio routes
- **Use both systems** - Folio for simple pages, traditional routes for complex logic

### When to Use Folio vs Traditional Routes
- **Use Folio for**: Static pages, simple CRUD views, landing pages
- **Use traditional routes for**: Complex logic, API endpoints, resource controllers
- **Combine both**: Use traditional routes for API and complex logic, Folio for presentation layers