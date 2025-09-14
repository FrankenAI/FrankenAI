# Pest Testing Guidelines

*Based on Laravel Boost methodology - Modern PHP testing with elegant syntax*

## Core Testing Philosophy

### Modern Test Structure
- Use expressive `it()` and `test()` functions instead of classes
- Write tests that read like natural language
- Embrace functional testing approach with closures
- Focus on behavior rather than implementation

### Basic Pest Test Syntax
```php
<?php

// Simple assertion test
it('is true', function () {
    expect(true)->toBeTrue();
});

// Descriptive test function
test('user can be created with valid data', function () {
    $user = User::create([
        'name' => 'John Doe',
        'email' => 'john@example.com'
    ]);

    expect($user->name)->toBe('John Doe');
    expect($user->email)->toBe('john@example.com');
});

// Using describe for grouping
describe('UserService', function () {
    it('creates users successfully', function () {
        $service = new UserService();
        $user = $service->createUser(['name' => 'Jane']);

        expect($user)->toBeInstanceOf(User::class);
    });
});
```

## Pest Expectations (Better than Assertions)

### Use Expressive Expectations
```php
// Pest expectations - preferred
expect($user->isActive())->toBeTrue();
expect($user->email)->toBe('john@example.com');
expect($user->roles)->toHaveCount(3);
expect($user->getErrors())->toBeEmpty();
expect($user->getDeletedAt())->toBeNull();

// Collection expectations
expect($users)
    ->toHaveCount(5)
    ->and($users->first()->name)->toBe('John');

// Type expectations
expect($user)->toBeInstanceOf(User::class);
expect($response)->toBeArray();
expect($config)->toBeString();
```

### Exception Testing
```php
it('throws exception for invalid email', function () {
    expect(fn() => new User(['email' => 'invalid']))
        ->toThrow(InvalidEmailException::class, 'Invalid email format');
});

// Multiple exception tests
it('validates user input', function () {
    expect(fn() => User::create(['name' => '']))
        ->toThrow(ValidationException::class);

    expect(fn() => User::create(['email' => 'invalid']))
        ->toThrow(InvalidEmailException::class);
});
```

## Test Organization with Pest

### File-based Organization
```
tests/
├── Pest.php           # Pest configuration
├── Unit/              # Unit tests
│   ├── UserTest.php
│   └── ServiceTest.php
├── Feature/           # Feature tests
│   ├── AuthTest.php
│   └── ApiTest.php
└── Fixtures/          # Test data
```

### Pest.php Configuration
```php
<?php

uses(
    Tests\TestCase::class,
    Illuminate\Foundation\Testing\RefreshDatabase::class,
)->in('Feature');

uses(Tests\TestCase::class)->in('Unit');

// Custom expectations
expect()->extend('toBeValidEmail', function () {
    return $this->toMatch('/^[^\s@]+@[^\s@]+\.[^\s@]+$/');
});

// Global functions available in all tests
function createUser(array $attributes = []): User
{
    return User::factory()->create($attributes);
}
```

## Datasets (Better than Data Providers)

### Using Datasets
```php
it('validates email formats', function (string $email, bool $isValid) {
    $validator = new EmailValidator();

    expect($validator->isValid($email))->toBe($isValid);
})->with([
    ['john@example.com', true],
    ['invalid-email', false],
    ['john+test@example.com', true],
    ['@example.com', false],
]);

// Named datasets
it('accepts valid emails', function (string $email) {
    expect($email)->toBeValidEmail();
})->with('valid_emails');

// datasets/valid_emails.php
<?php

dataset('valid_emails', [
    'standard' => 'john@example.com',
    'subdomain' => 'john@mail.example.com',
    'plus sign' => 'john+test@example.com',
]);
```

## Pest Hooks and Setup

### Test Hooks
```php
beforeEach(function () {
    // Runs before each test
    $this->user = User::factory()->create();
});

afterEach(function () {
    // Runs after each test
    Cache::flush();
});

beforeAll(function () {
    // Runs once before all tests in file
});

afterAll(function () {
    // Runs once after all tests in file
});
```

## Higher Order Expectations
```php
// Chain expectations elegantly
expect($users)
    ->toHaveCount(3)
    ->each->toBeInstanceOf(User::class)
    ->and($users->first())
    ->name->toBe('John')
    ->email->toBeValidEmail();

// API response testing
expect($response)
    ->status()->toBe(200)
    ->and($response->json())
    ->toHaveKeys(['data', 'meta'])
    ->and($response->json('data'))
    ->toHaveCount(5);
```

## Pest Plugins and Architecture

### Must-Have Plugins
```bash
# Core Pest
composer require pestphp/pest --dev

# Laravel integration
composer require pestphp/pest-plugin-laravel --dev

# Additional useful plugins
composer require pestphp/pest-plugin-faker --dev
composer require pestphp/pest-plugin-mock --dev
```

## Running Pest Tests

### Command Examples
```bash
# Run all tests
./vendor/bin/pest

# Run with coverage
./vendor/bin/pest --coverage

# Run specific directory
./vendor/bin/pest tests/Unit

# Filter by test name
./vendor/bin/pest --filter="user can be created"

# Parallel execution
./vendor/bin/pest --parallel

# Profile slow tests
./vendor/bin/pest --profile
```

### Pest vs PHPUnit
- **Pest**: Modern, expressive, functional approach
- **Use Pest** for new projects and modern codebases
- **Pest is built on PHPUnit** but provides better DX
- **Migration**: Pest and PHPUnit can coexist during transitions