# Flux UI Free - Component Guidelines

*Based on Laravel Boost methodology - Free UI component library for Livewire applications*

## Flux UI Free Overview

Flux UI Free is the free edition of the Flux component library, providing a robust set of hand-crafted UI components for Livewire applications. Built using Tailwind CSS, it offers essential components for building modern web interfaces.

### Core Concepts
- **Free tier components** - Access to essential UI components
- **Livewire integration** - Seamless integration with Livewire components
- **Tailwind CSS based** - Utility-first styling approach
- **Easy customization** - Components can be styled and customized

### Available Components (Free Tier)

The free edition includes these components:
- **avatar** - User profile images and placeholders
- **badge** - Status indicators and labels
- **brand** - Logo and brand elements
- **breadcrumbs** - Navigation hierarchy
- **button** - Interactive buttons with variants
- **callout** - Important messages and alerts
- **checkbox** - Form checkboxes
- **dropdown** - Dropdown menus and selects
- **field** - Form field containers
- **heading** - Heading elements with sizes
- **icon** - Icon components
- **input** - Text inputs and form controls
- **modal** - Modal dialogs and overlays
- **navbar** - Navigation bars
- **profile** - User profile components
- **radio** - Radio button inputs
- **select** - Select dropdown inputs
- **separator** - Visual dividers
- **switch** - Toggle switches
- **text** - Text components with styling
- **textarea** - Multi-line text inputs
- **tooltip** - Contextual tooltips

## Basic Component Usage

### Buttons
```blade
{{-- Primary button --}}
<flux:button variant="primary">Save Changes</flux:button>

{{-- Secondary button --}}
<flux:button variant="secondary">Cancel</flux:button>

{{-- Danger button --}}
<flux:button variant="danger">Delete</flux:button>

{{-- Button with icon --}}
<flux:button>
    <flux:icon name="plus" />
    Add Item
</flux:button>

{{-- Loading state --}}
<flux:button wire:loading.attr="disabled">
    <span wire:loading.remove>Submit</span>
    <span wire:loading>Processing...</span>
</flux:button>
```

### Form Components
```blade
{{-- Input field with label --}}
<flux:field>
    <flux:label>Full Name</flux:label>
    <flux:input wire:model="name" placeholder="Enter your name" />
</flux:field>

{{-- Email input --}}
<flux:field>
    <flux:label>Email Address</flux:label>
    <flux:input wire:model="email" type="email" placeholder="user@example.com" />
    @error('email') <flux:text variant="error">{{ $message }}</flux:text> @enderror
</flux:field>

{{-- Textarea --}}
<flux:field>
    <flux:label>Description</flux:label>
    <flux:textarea wire:model="description" rows="4" placeholder="Enter description..." />
</flux:field>

{{-- Select dropdown --}}
<flux:field>
    <flux:label>Category</flux:label>
    <flux:select wire:model="category">
        <option value="">Select a category</option>
        <option value="tech">Technology</option>
        <option value="design">Design</option>
        <option value="marketing">Marketing</option>
    </flux:select>
</flux:field>

{{-- Checkbox --}}
<flux:checkbox wire:model="agreed">
    I agree to the terms and conditions
</flux:checkbox>

{{-- Radio buttons --}}
<flux:field>
    <flux:label>Plan Type</flux:label>
    <flux:radio wire:model="plan" value="basic">Basic Plan</flux:radio>
    <flux:radio wire:model="plan" value="pro">Pro Plan</flux:radio>
</flux:field>

{{-- Switch toggle --}}
<flux:switch wire:model="notifications">
    Enable notifications
</flux:switch>
```

### Navigation Components
```blade
{{-- Navbar --}}
<flux:navbar>
    <flux:brand href="/">
        <flux:icon name="logo" />
        My Application
    </flux:brand>

    <flux:dropdown>
        <flux:button slot="trigger">
            Menu
        </flux:button>

        <flux:dropdown.item href="/dashboard">Dashboard</flux:dropdown.item>
        <flux:dropdown.item href="/profile">Profile</flux:dropdown.item>
        <flux:dropdown.item href="/settings">Settings</flux:dropdown.item>
    </flux:dropdown>
</flux:navbar>

{{-- Breadcrumbs --}}
<flux:breadcrumbs>
    <flux:breadcrumbs.item href="/">Home</flux:breadcrumbs.item>
    <flux:breadcrumbs.item href="/products">Products</flux:breadcrumbs.item>
    <flux:breadcrumbs.item>{{ $product->name }}</flux:breadcrumbs.item>
</flux:breadcrumbs>
```

### Content Components
```blade
{{-- Headings --}}
<flux:heading size="xl">Page Title</flux:heading>
<flux:heading size="lg">Section Title</flux:heading>
<flux:heading size="md">Subsection</flux:heading>

{{-- Text components --}}
<flux:text>Regular paragraph text</flux:text>
<flux:text variant="muted">Muted text for less important content</flux:text>
<flux:text variant="success">Success message text</flux:text>
<flux:text variant="error">Error message text</flux:text>

{{-- Callouts --}}
<flux:callout variant="info">
    <flux:heading size="sm">Information</flux:heading>
    This is an informational message for users.
</flux:callout>

<flux:callout variant="warning">
    Please review your settings before proceeding.
</flux:callout>

<flux:callout variant="success">
    Your changes have been saved successfully!
</flux:callout>

<flux:callout variant="danger">
    There was an error processing your request.
</flux:callout>
```

### User Interface Elements
```blade
{{-- Avatar --}}
<flux:avatar src="{{ $user->avatar_url }}" alt="{{ $user->name }}" />
<flux:avatar>{{ $user->initials }}</flux:avatar>

{{-- Badge --}}
<flux:badge variant="primary">New</flux:badge>
<flux:badge variant="success">Active</flux:badge>
<flux:badge variant="warning">Pending</flux:badge>
<flux:badge variant="danger">Inactive</flux:badge>

{{-- Profile component --}}
<flux:profile>
    <flux:avatar slot="avatar" src="{{ auth()->user()->avatar }}" />
    <flux:heading slot="name">{{ auth()->user()->name }}</flux:heading>
    <flux:text slot="email">{{ auth()->user()->email }}</flux:text>
</flux:profile>

{{-- Separator --}}
<flux:separator />

{{-- Tooltip --}}
<flux:tooltip content="This is helpful information">
    <flux:button>Hover me</flux:button>
</flux:tooltip>
```

## Modal Components

### Basic Modal
```blade
{{-- Trigger --}}
<flux:button @click="$wire.showModal = true">Open Modal</flux:button>

{{-- Modal --}}
<flux:modal wire:model="showModal">
    <flux:heading>Confirm Action</flux:heading>

    <flux:text>
        Are you sure you want to proceed with this action?
    </flux:text>

    <div class="flex gap-2 mt-6">
        <flux:button variant="primary" wire:click="confirm">
            Confirm
        </flux:button>
        <flux:button variant="secondary" @click="$wire.showModal = false">
            Cancel
        </flux:button>
    </div>
</flux:modal>
```

### Form Modal
```blade
<flux:modal wire:model="editModal">
    <flux:heading>Edit User</flux:heading>

    <form wire:submit="save">
        <div class="space-y-4">
            <flux:field>
                <flux:label>Name</flux:label>
                <flux:input wire:model="form.name" />
                @error('form.name') <flux:text variant="error">{{ $message }}</flux:text> @enderror
            </flux:field>

            <flux:field>
                <flux:label>Email</flux:label>
                <flux:input wire:model="form.email" type="email" />
                @error('form.email') <flux:text variant="error">{{ $message }}</flux:text> @enderror
            </flux:field>
        </div>

        <div class="flex gap-2 mt-6">
            <flux:button type="submit">Save Changes</flux:button>
            <flux:button variant="secondary" @click="$wire.editModal = false">
                Cancel
            </flux:button>
        </div>
    </form>
</flux:modal>
```

## Livewire Integration

### Form Handling
```blade
<form wire:submit="save">
    <div class="space-y-4">
        <flux:field>
            <flux:label>Product Name</flux:label>
            <flux:input wire:model="product.name" />
            @error('product.name')
                <flux:text variant="error">{{ $message }}</flux:text>
            @enderror
        </flux:field>

        <flux:field>
            <flux:label>Category</flux:label>
            <flux:select wire:model="product.category_id">
                <option value="">Select category</option>
                @foreach($categories as $category)
                    <option value="{{ $category->id }}">{{ $category->name }}</option>
                @endforeach
            </flux:select>
        </flux:field>

        <flux:field>
            <flux:label>Description</flux:label>
            <flux:textarea wire:model="product.description" rows="4" />
        </flux:field>

        <flux:checkbox wire:model="product.is_active">
            Active product
        </flux:checkbox>
    </div>

    <div class="flex gap-2 mt-6">
        <flux:button type="submit" wire:loading.attr="disabled">
            <span wire:loading.remove>Save Product</span>
            <span wire:loading>Saving...</span>
        </flux:button>

        <flux:button variant="secondary" type="button">
            Cancel
        </flux:button>
    </div>
</form>
```

### Real-time Search
```blade
<div>
    <flux:field>
        <flux:input
            wire:model.live.debounce.300ms="search"
            placeholder="Search users..."
        />
    </flux:field>

    <div wire:loading.delay>
        <flux:text variant="muted">Searching...</flux:text>
    </div>

    @if($users->count())
        <div class="space-y-2">
            @foreach($users as $user)
                <div class="flex items-center gap-3 p-3 border rounded">
                    <flux:avatar src="{{ $user->avatar }}" />
                    <div>
                        <flux:heading size="sm">{{ $user->name }}</flux:heading>
                        <flux:text variant="muted">{{ $user->email }}</flux:text>
                    </div>
                    <flux:badge variant="success">Active</flux:badge>
                </div>
            @endforeach
        </div>
    @else
        <flux:callout variant="info">
            No users found matching your search.
        </flux:callout>
    @endif
</div>
```

## Styling and Customization

### Component Variants
```blade
{{-- Button variants --}}
<flux:button variant="primary">Primary</flux:button>
<flux:button variant="secondary">Secondary</flux:button>
<flux:button variant="success">Success</flux:button>
<flux:button variant="warning">Warning</flux:button>
<flux:button variant="danger">Danger</flux:button>

{{-- Sizes --}}
<flux:button size="sm">Small</flux:button>
<flux:button size="md">Medium</flux:button>
<flux:button size="lg">Large</flux:button>

{{-- Badge variants --}}
<flux:badge variant="primary">Primary</flux:badge>
<flux:badge variant="secondary">Secondary</flux:badge>
<flux:badge variant="success">Success</flux:badge>
<flux:badge variant="warning">Warning</flux:badge>
<flux:badge variant="danger">Danger</flux:badge>
```

### Custom Classes
```blade
{{-- Adding custom Tailwind classes --}}
<flux:button class="shadow-lg hover:shadow-xl transition-shadow">
    Custom Styled Button
</flux:button>

<flux:input class="border-blue-300 focus:border-blue-500" />

<flux:callout class="border-l-4 border-l-blue-500 bg-blue-50">
    Custom callout styling
</flux:callout>
```

## Best Practices

### Component Organization
```blade
{{-- Use field containers for form elements --}}
<flux:field>
    <flux:label>Email</flux:label>
    <flux:input wire:model="email" type="email" />
    @error('email') <flux:text variant="error">{{ $message }}</flux:text> @enderror
</flux:field>

{{-- Group related components --}}
<div class="space-y-4">
    <flux:field>
        <flux:label>First Name</flux:label>
        <flux:input wire:model="firstName" />
    </flux:field>

    <flux:field>
        <flux:label>Last Name</flux:label>
        <flux:input wire:model="lastName" />
    </flux:field>
</div>
```

### Accessibility
```blade
{{-- Proper labeling --}}
<flux:field>
    <flux:label for="user-email">Email Address</flux:label>
    <flux:input id="user-email" wire:model="email" type="email" />
</flux:field>

{{-- Descriptive tooltips --}}
<flux:tooltip content="Your password must be at least 8 characters long">
    <flux:input type="password" wire:model="password" />
</flux:tooltip>
```

### Error Handling
```blade
{{-- Consistent error display --}}
<flux:field>
    <flux:label>Name</flux:label>
    <flux:input
        wire:model="name"
        :class="$errors->has('name') ? 'border-red-300' : ''"
    />
    @error('name')
        <flux:text variant="error" class="mt-1">{{ $message }}</flux:text>
    @enderror
</flux:field>
```

### Fallback Strategy
```blade
{{-- Fallback to standard HTML if Flux is not available --}}
@if(class_exists('Flux\\Components\\Button'))
    <flux:button variant="primary">Save</flux:button>
@else
    <button type="submit" class="btn btn-primary">Save</button>
@endif
```

## Migration Considerations

### From Standard HTML
```blade
{{-- Before: Standard HTML --}}
<div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" class="form-control">
</div>

{{-- After: Flux UI Free --}}
<flux:field>
    <flux:label>Name</flux:label>
    <flux:input wire:model="name" />
</flux:field>
```

### Performance
- **Component overhead**: Flux components have minimal overhead
- **Tailwind optimization**: Ensure proper Tailwind purging
- **Lazy loading**: Use wire:loading for better UX