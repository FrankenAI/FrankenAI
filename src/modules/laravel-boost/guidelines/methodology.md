# Laravel Boost - Methodology Guidelines

*Meta-framework methodology for Laravel application development*

## Laravel Boost Overview

Laravel Boost is a comprehensive methodology and tooling suite that provides opinionated patterns, guidelines, and tooling for Laravel applications. It encompasses best practices across the entire Laravel ecosystem.

### Core Philosophy
- **Convention over configuration** - Standardized patterns and structures
- **Integrated toolchain** - Seamless integration of Laravel ecosystem tools
- **Methodology-driven** - Consistent approaches across projects
- **Developer experience** - Optimized workflows and tooling

## Covered Technologies

Laravel Boost methodology includes integrated support for:

### **Core Framework**
- **Laravel Framework** - Application foundation and architecture
- **Livewire** - Full-stack reactive components
- **Blade Templates** - Server-side rendering and components

### **UI and Styling**
- **Tailwind CSS** - Utility-first CSS framework
- **Flux UI Free** - Free component library
- **Flux UI Pro** - Premium component library
- **Alpine.js** - Minimal frontend framework

### **Advanced Features**
- **Laravel Volt** - Functional Livewire components
- **Laravel Folio** - File-based routing
- **Laravel Pennant** - Feature flags and toggles

### **Development Tools**
- **Laravel Pint** - Code styling and formatting
- **Pest PHP** - Testing framework
- **Laravel Telescope** - Debugging and profiling

## Methodology Benefits

### **Consistency**
```php
// Standardized component structure
// resources/views/livewire/user-profile.blade.php
@volt
<?php
use function Livewire\Volt\{state, computed, mount};

state(['user']);

mount(function ($userId) {
    $this->user = User::find($userId);
});

$fullName = computed(fn() => $this->user->first_name . ' ' . $this->user->last_name);
?>

<div class="bg-white shadow rounded-lg p-6">
    <flux:heading size="lg">{{ $fullName }}</flux:heading>
    <flux:text variant="muted">{{ $user->email }}</flux:text>
</div>
@endvolt
```

### **Integrated Workflow**
```bash
# Boost-optimized commands
php artisan boost:make:component UserProfile
php artisan boost:test:feature UserManagement
php artisan boost:deploy:staging
```

### **Standardized Structure**
```
app/
├── Boost/
│   ├── Components/
│   ├── Pages/
│   └── Features/
resources/
├── views/
│   ├── livewire/
│   ├── pages/
│   └── components/
└── boost/
    ├── styles/
    └── scripts/
```

## Best Practices

### **Component Development**
- Use Volt for simple reactive components
- Leverage Flux UI for consistent styling
- Implement proper state management patterns
- Follow naming conventions

### **Feature Management**
```php
// Feature flags with Pennant
Feature::define('advanced-dashboard', function (User $user) {
    return $user->hasRole('premium');
});

// In components
@feature('advanced-dashboard')
    <flux:card>
        <x-advanced-analytics />
    </flux:card>
@endfeature
```

### **Testing Strategy**
```php
// Pest testing with Boost patterns
it('displays user profile correctly', function () {
    $user = User::factory()->create();

    Livewire::test(UserProfile::class, ['userId' => $user->id])
        ->assertSee($user->name)
        ->assertSee($user->email);
});
```

### **Code Style**
- Automated formatting with Pint
- Consistent PHP and Blade formatting
- Integrated with CI/CD pipeline

## Development Workflow

### **Project Setup**
1. Initialize Laravel project with Boost methodology
2. Configure integrated toolchain
3. Set up standardized directory structure
4. Implement base components and patterns

### **Feature Development**
1. Use Boost generators for consistent structure
2. Implement with Volt/Livewire patterns
3. Style with Flux UI components
4. Add feature flags where appropriate
5. Write comprehensive tests

### **Deployment**
1. Run Boost optimization commands
2. Execute full test suite
3. Deploy with methodology-specific configs

## Integration Notes

When Laravel Boost is detected, FrankenAI automatically:
- Excludes redundant module detections
- Provides Boost-specific guidance
- Uses integrated toolchain commands
- Follows methodology patterns

This ensures a cohesive development experience without conflicting recommendations.