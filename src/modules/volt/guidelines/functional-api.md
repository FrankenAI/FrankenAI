# Livewire Volt - Functional API Guidelines

*Based on Laravel Boost methodology - Single-file Livewire components with functional and class-based APIs*

## Livewire Volt Overview

Livewire Volt provides a modern approach to building Livewire components using both functional and class-based APIs. It allows PHP logic and Blade templates to co-exist in the same file, creating single-file components that are easier to organize and maintain.

### Core Concepts
- **Single-file components** - PHP logic and Blade templates in one file
- **Dual APIs** - Both functional and class-based approaches supported
- **@volt directive** - Special Blade directive for Volt components
- **Livewire integration** - Full compatibility with Livewire ecosystem

## Component Creation

### Using Artisan Commands
```bash
# Create a new Volt component
php artisan make:volt counter --no-interaction

# Create with test
php artisan make:volt user-profile --test --no-interaction

# Create with Pest test
php artisan make:volt product-form --test --pest --no-interaction
```

### Component Location
Volt components are typically stored in:
- `resources/views/livewire/` - Standard location
- `resources/views/pages/` - If using with Folio
- Custom locations as configured

## Functional API Components

### Basic Functional Component
```php
@volt
<?php
use function Livewire\Volt\{state, computed};

state(['count' => 0]);

$increment = fn () => $this->count++;
$decrement = fn () => $this->count--;

$double = computed(fn () => $this->count * 2);
?>

<div>
    <h1>Count: {{ $count }}</h1>
    <h2>Double: {{ $this->double }}</h2>
    <button wire:click="increment">+</button>
    <button wire:click="decrement">-</button>
</div>
@endvolt
```

### State Management
```php
@volt
<?php
use function Livewire\Volt\{state, computed, on};

// Simple state
state(['name' => '', 'email' => '']);

// State with default values from models
state(['user' => fn () => auth()->user()]);

// Reactive computed properties
$fullName = computed(fn () => $this->user->first_name . ' ' . $this->user->last_name);

// Event listeners
on(['user-updated' => fn () => $this->user->refresh()]);

// Actions
$save = function () {
    $this->user->update([
        'name' => $this->name,
        'email' => $this->email,
    ]);

    $this->dispatch('user-saved');
};
?>

<form wire:submit="save">
    <input wire:model="name" type="text" placeholder="Name">
    <input wire:model="email" type="email" placeholder="Email">
    <button type="submit">Save</button>
</form>
@endvolt
```

### Advanced Functional Patterns
```php
@volt
<?php
use App\Models\Product;
use function Livewire\Volt\{state, computed, mount};

state(['editing' => null, 'search' => '']);

mount(function () {
    // Initialization logic
    $this->search = request('search', '');
});

$products = computed(function () {
    return Product::when($this->search, function ($query) {
        $query->where('name', 'like', "%{$this->search}%");
    })->get();
});

$edit = fn (Product $product) => $this->editing = $product->id;
$delete = fn (Product $product) => $product->delete();
$cancelEdit = fn () => $this->editing = null;

$save = function (Product $product) {
    $product->save();
    $this->editing = null;
    $this->dispatch('product-updated');
};
?>

<div>
    <input wire:model.live.debounce.300ms="search" placeholder="Search products...">

    @foreach($this->products as $product)
        <div class="product-item">
            @if($editing === $product->id)
                <input wire:model="product.name" type="text">
                <button wire:click="save({{ $product->id }})">Save</button>
                <button wire:click="cancelEdit">Cancel</button>
            @else
                <span>{{ $product->name }}</span>
                <button wire:click="edit({{ $product->id }})">Edit</button>
                <button wire:click="delete({{ $product->id }})">Delete</button>
            @endif
        </div>
    @endforeach
</div>
@endvolt
```

## Class-Based API Components

### Basic Class Component
```php
@volt
<?php
use Livewire\Volt\Component;

new class extends Component {
    public $count = 0;

    public function increment()
    {
        $this->count++;
    }

    public function decrement()
    {
        $this->count--;
    }

    public function getDoubleProperty()
    {
        return $this->count * 2;
    }
} ?>

<div>
    <h1>Count: {{ $count }}</h1>
    <h2>Double: {{ $this->double }}</h2>
    <button wire:click="increment">+</button>
    <button wire:click="decrement">-</button>
</div>
@endvolt
```

### Advanced Class Component
```php
@volt
<?php
use App\Models\User;
use Livewire\Volt\Component;
use Livewire\Attributes\{On, Computed, Rule};

new class extends Component {
    #[Rule('required|string|max:255')]
    public string $name = '';

    #[Rule('required|email|unique:users')]
    public string $email = '';

    public User $user;

    public function mount(User $user)
    {
        $this->user = $user;
        $this->name = $user->name;
        $this->email = $user->email;
    }

    #[Computed]
    public function isModified()
    {
        return $this->name !== $this->user->name ||
               $this->email !== $this->user->email;
    }

    public function save()
    {
        $this->validate();

        $this->user->update([
            'name' => $this->name,
            'email' => $this->email,
        ]);

        $this->dispatch('user-updated', $this->user->id);
    }

    #[On('user-updated')]
    public function handleUserUpdate()
    {
        $this->user->refresh();
    }
} ?>

<form wire:submit="save">
    <div>
        <label for="name">Name</label>
        <input wire:model="name" type="text" id="name">
        @error('name') <span class="error">{{ $message }}</span> @enderror
    </div>

    <div>
        <label for="email">Email</label>
        <input wire:model="email" type="email" id="email">
        @error('email') <span class="error">{{ $message }}</span> @enderror
    </div>

    <button type="submit" :disabled="!$isModified">
        <span wire:loading.remove>Save Changes</span>
        <span wire:loading>Saving...</span>
    </button>
</form>
@endvolt
```

## Real-Time Features

### Live Updates
```php
@volt
<?php
use function Livewire\Volt\{state};

state(['search' => '', 'results' => []]);

$searchProducts = function () {
    $this->results = Product::where('name', 'like', "%{$this->search}%")
        ->limit(10)
        ->get();
};
?>

<div>
    <input
        wire:model.live.debounce.300ms="search"
        wire:keyup="searchProducts"
        placeholder="Search products..."
    >

    <div wire:loading.delay wire:target="searchProducts">
        Searching...
    </div>

    @foreach($results as $product)
        <div>{{ $product->name }}</div>
    @endforeach
</div>
@endvolt
```

### Loading States
```php
@volt
<?php
use function Livewire\Volt\{state};

state(['processing' => false]);

$save = function () {
    $this->processing = true;

    // Simulate processing
    sleep(2);

    $this->processing = false;
    $this->dispatch('saved');
};
?>

<div>
    <button
        wire:click="save"
        wire:loading.attr="disabled"
        :disabled="$processing"
    >
        <span wire:loading.remove wire:target="save">Save</span>
        <span wire:loading wire:target="save">Saving...</span>
    </button>
</div>
@endvolt
```

## Integration with Flux UI

### Flux Components in Volt
```php
@volt
<?php
use function Livewire\Volt\{state};

state(['name' => '', 'email' => '', 'submitted' => false]);

$submit = function () {
    // Validation and processing
    $this->submitted = true;
};
?>

<flux:card>
    <flux:heading size="lg">Contact Form</flux:heading>

    <form wire:submit="submit" class="space-y-4">
        <flux:field>
            <flux:label>Name</flux:label>
            <flux:input wire:model="name" placeholder="Enter your name" />
        </flux:field>

        <flux:field>
            <flux:label>Email</flux:label>
            <flux:input wire:model="email" type="email" placeholder="Enter your email" />
        </flux:field>

        <flux:button type="submit" wire:loading.attr="disabled">
            <span wire:loading.remove>Submit</span>
            <span wire:loading>Submitting...</span>
        </flux:button>
    </form>

    @if($submitted)
        <flux:callout variant="success">
            Form submitted successfully!
        </flux:callout>
    @endif
</flux:card>
@endvolt
```

## Testing Volt Components

### Basic Component Testing
```php
use Livewire\Volt\Volt;

test('counter increments', function () {
    Volt::test('counter')
        ->assertSee('Count: 0')
        ->call('increment')
        ->assertSee('Count: 1')
        ->call('increment')
        ->assertSee('Count: 2');
});

test('counter decrements', function () {
    Volt::test('counter')
        ->call('increment')
        ->call('increment')
        ->assertSee('Count: 2')
        ->call('decrement')
        ->assertSee('Count: 1');
});
```

### Advanced Testing
```php
use App\Models\{User, Product};
use Livewire\Volt\Volt;

test('product form creates product', function () {
    $user = User::factory()->create();

    Volt::test('pages.products.create')
        ->actingAs($user)
        ->set('form.name', 'Test Product')
        ->set('form.description', 'Test Description')
        ->set('form.price', 99.99)
        ->call('create')
        ->assertHasNoErrors();

    expect(Product::where('name', 'Test Product')->exists())->toBeTrue();
});

test('search filters products', function () {
    $products = Product::factory()->count(5)->create();
    $searchTerm = $products->first()->name;

    Volt::test('product-search')
        ->set('search', $searchTerm)
        ->call('searchProducts')
        ->assertSee($searchTerm);
});
```

## Best Practices

### Choosing Between APIs
- **Use Functional API** for simple components with minimal logic
- **Use Class-Based API** for complex components requiring Laravel features
- **Consistency** - Pick one approach per project/team preference

### Performance Optimization
```php
@volt
<?php
use function Livewire\Volt\{state, computed};

// Cache expensive computations
$expensiveCalculation = computed(function () {
    return cache()->remember(
        "calculation-{$this->userId}",
        300,
        fn () => $this->performExpensiveCalculation()
    );
});
?>
```

### Security Considerations
```php
@volt
<?php
use function Livewire\Volt\{state, rules, authorize};

// Always validate input
rules(['email' => 'required|email']);

// Authorization checks
authorize(fn () => auth()->user()->can('update-profile'));

$save = function () {
    $this->validate();
    // Safe to proceed
};
?>
```

### Component Organization
- **Single responsibility** - Each component should handle one specific feature
- **Reusable patterns** - Extract common logic into traits or shared methods
- **Clear naming** - Use descriptive names for components and their files
- **Proper directory structure** - Organize components logically