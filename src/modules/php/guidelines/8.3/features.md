# PHP 8.3 Specific Guidelines

## PHP 8.3 New Features

### Typed Class Constants

Use typed class constants for better type safety:

```php
class Configuration
{
    // ✅ PHP 8.3 - Typed constants
    public const string APP_NAME = 'MyApplication';
    public const int MAX_RETRIES = 3;
    public const float TAX_RATE = 0.21;
    public const array ALLOWED_TYPES = ['post', 'page', 'product'];

    // Type declarations for interface constants
    interface CacheInterface
    {
        public const int DEFAULT_TTL = 3600;
        public const string CACHE_KEY_PREFIX = 'app:';
    }
}
```

### Readonly Amendments

PHP 8.3 allows modifying readonly properties in `__clone`:

```php
readonly class UserDTO
{
    public function __construct(
        public string $id,
        public string $name,
        public DateTimeImmutable $createdAt
    ) {}

    public function __clone()
    {
        // PHP 8.3 allows this in __clone
        $this->id = uniqid('user_');
        $this->createdAt = new DateTimeImmutable();
    }
}
```

### Dynamic Class Constant Fetch

Access class constants dynamically:

```php
class Status
{
    public const ACTIVE = 'active';
    public const INACTIVE = 'inactive';
    public const PENDING = 'pending';
}

$statusType = 'ACTIVE';

// PHP 8.3 - Dynamic constant access
$value = Status::{$statusType};
```

### The `#[\Override]` Attribute

Use to ensure methods are actually overriding parent methods:

```php
class PaymentService
{
    public function process(Payment $payment): void
    {
        // Base implementation
    }
}

class StripePaymentService extends PaymentService
{
    #[\Override]
    public function process(Payment $payment): void
    {
        // If this doesn't override a parent method, PHP will error
        parent::process($payment);
        // Stripe-specific logic
    }
}
```

### Improved `json_validate()` Function

Validate JSON without decoding:

```php
// ✅ PHP 8.3 - Efficient JSON validation
if (json_validate($jsonString)) {
    $data = json_decode($jsonString, true);
    // Process valid JSON
} else {
    throw new InvalidArgumentException('Invalid JSON provided');
}

// With depth checking
if (json_validate($jsonString, depth: 10)) {
    // JSON is valid and not too deeply nested
}
```

### New `Randomizer` Methods

Enhanced randomization capabilities:

```php
use Random\Randomizer;
use Random\Engine\Mt19937;

$randomizer = new Randomizer(new Mt19937(1234));

// Get random float between 0 and 1
$float = $randomizer->nextFloat();

// Get random float in range
$price = $randomizer->getFloat(10.00, 100.00);

// More secure random bytes
$bytes = $randomizer->getBytes(16);
```

### Anonymous Readonly Classes

Create readonly anonymous classes:

```php
$dto = new readonly class($name, $email) {
    public function __construct(
        public string $name,
        public string $email
    ) {}
};
```

## Performance Improvements

### Optimized Array Functions

PHP 8.3 optimizes array functions:

```php
// These are now more performant in PHP 8.3
$filtered = array_filter($large_array, fn($item) => $item->isActive());
$mapped = array_map(fn($item) => $item->toArray(), $large_array);
$unique = array_unique($large_array, SORT_REGULAR);
```

## Error Handling Improvements

### Better Stack Traces

PHP 8.3 provides more detailed stack traces:

```php
try {
    $result = $this->complexOperation();
} catch (Exception $e) {
    // PHP 8.3 includes more context in stack traces
    logger()->error('Operation failed', [
        'exception' => $e,
        'trace' => $e->getTraceAsString(), // More detailed in 8.3
    ]);
}
```

## Best Practices for PHP 8.3

### Use Typed Constants

Always type your class constants:

```php
class AppConfig
{
    // ✅ Good - Typed constants
    public const string VERSION = '1.0.0';
    public const array FEATURES = ['api', 'webhooks', 'notifications'];
    public const int CACHE_TTL = 3600;

    // ❌ Avoid - Untyped constants
    public const VERSION_OLD = '1.0.0';
}
```

### Leverage json_validate()

Replace json_decode validation:

```php
// ❌ Old way - Decodes unnecessarily
function isValidJson(string $json): bool
{
    json_decode($json);
    return json_last_error() === JSON_ERROR_NONE;
}

// ✅ PHP 8.3 way - More efficient
function isValidJson(string $json): bool
{
    return json_validate($json);
}
```

### Use #[\Override] for Safety

Mark overridden methods explicitly:

```php
abstract class Repository
{
    abstract public function find(int $id): ?Model;
}

class UserRepository extends Repository
{
    #[\Override]
    public function find(int $id): ?Model
    {
        // Implementation
    }

    #[\Override]
    public function findAll(): array  // This will error - not overriding!
    {
        // Implementation
    }
}
```

### Readonly Classes with Cloning

Design immutable objects with controlled cloning:

```php
readonly class OrderLine
{
    public function __construct(
        public string $id,
        public Product $product,
        public int $quantity,
        public Money $price
    ) {}

    public function withQuantity(int $quantity): self
    {
        $clone = clone $this;
        // PHP 8.3 allows this in clone context
        $clone->quantity = $quantity;
        $clone->price = $this->product->price->multiply($quantity);
        return $clone;
    }
}
```

## Deprecations & Warnings

### Avoid Deprecated Features

1. **Don't use** uninitialized properties without declaration
2. **Don't rely on** implicit nullable parameter declarations
3. **Don't use** the `@` error suppression operator
4. **Avoid** dynamic properties without `#[AllowDynamicProperties]`

### Prepare for Future

```php
// Prepare for stricter typing
#[AllowDynamicProperties] // Only if absolutely necessary
class LegacyClass
{
    // Migration path for dynamic properties
}
```

## Migration Tips

### From PHP 8.2 to 8.3

1. **Add typed constants** to improve type safety
2. **Replace json_decode checks** with `json_validate()`
3. **Add #[\Override]** to overridden methods
4. **Review readonly classes** for cloning opportunities
5. **Test randomization code** with new Randomizer methods

### Code Quality

```php
// Leverage all PHP 8.3 features
readonly class UserProfile
{
    public const string ROLE_ADMIN = 'admin';
    public const string ROLE_USER = 'user';

    public function __construct(
        public string $id,
        public string $name,
        public string $role = self::ROLE_USER
    ) {}

    #[\Override]
    public function __toString(): string
    {
        return json_validate($this->name)
            ? $this->name
            : json_encode($this->name);
    }
}
```

## Performance Considerations

1. **json_validate()** is faster than json_decode() for validation
2. **Typed constants** provide better opcache optimization
3. **Readonly properties** enable better JIT optimization
4. **Array functions** are more memory efficient in 8.3