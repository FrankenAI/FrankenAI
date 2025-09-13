# PHP 8.1 Specific Guidelines

## PHP 8.1 Key Features

### Enums

PHP 8.1 introduced native Enums - a major addition to the language:

```php
enum Status: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';

    public function label(): string
    {
        return match($this) {
            self::PENDING => 'Pending Review',
            self::PROCESSING => 'In Progress',
            self::COMPLETED => 'Completed',
            self::FAILED => 'Failed',
        };
    }

    public function isTerminal(): bool
    {
        return match($this) {
            self::COMPLETED, self::FAILED => true,
            default => false,
        };
    }
}

// Usage
$status = Status::PENDING;
echo $status->value; // 'pending'
echo $status->label(); // 'Pending Review'
```

### Readonly Properties

Individual properties can be marked as readonly:

```php
class User
{
    public function __construct(
        public readonly string $id,
        public readonly string $email,
        public readonly DateTimeImmutable $createdAt,
        public string $name // This can still be modified
    ) {}

    public function updateName(string $name): void
    {
        $this->name = $name; // ✅ Allowed
        // $this->email = 'new@email.com'; // ❌ Error: readonly property
    }
}
```

### Intersection Types

Combine multiple types with the `&` operator:

```php
interface Loggable
{
    public function log(): void;
}

interface Cacheable
{
    public function cache(): void;
}

class DataProcessor
{
    public function process(Loggable&Cacheable $object): void
    {
        $object->log();   // Available from Loggable
        $object->cache(); // Available from Cacheable
    }
}

// Class must implement both interfaces
class User implements Loggable, Cacheable
{
    public function log(): void { /* implementation */ }
    public function cache(): void { /* implementation */ }
}
```

### Never Return Type

Use `never` for functions that never return:

```php
function abort(string $message): never
{
    throw new RuntimeException($message);
}

function redirect(string $url): never
{
    header("Location: $url");
    exit;
}
```

### Final Class Constants

Prevent overriding of class constants:

```php
class BaseConfig
{
    final public const VERSION = '1.0.0';
    public const ENVIRONMENT = 'production';
}

class ExtendedConfig extends BaseConfig
{
    // ❌ Error: Cannot override final constant
    // public const VERSION = '2.0.0';

    // ✅ OK: Can override non-final constant
    public const ENVIRONMENT = 'staging';
}
```

### New in_array() Checks

Stricter array value checking:

```php
$haystack = ['1', '2', '3'];

// PHP 8.1 - More predictable behavior
var_dump(in_array(1, $haystack, true)); // false (strict type checking)
var_dump(in_array('1', $haystack, true)); // true

// Use array_search() for finding keys
$key = array_search('2', $haystack, true); // returns 1
```

## Best Practices for PHP 8.1

### Use Enums for Fixed Sets of Values

Replace class constants with enums:

```php
// ❌ Old way - Class constants
class OrderStatus
{
    public const PENDING = 'pending';
    public const SHIPPED = 'shipped';
    public const DELIVERED = 'delivered';
}

// ✅ PHP 8.1 way - Enums
enum OrderStatus: string
{
    case PENDING = 'pending';
    case SHIPPED = 'shipped';
    case DELIVERED = 'delivered';

    public function canBeCancelled(): bool
    {
        return $this === self::PENDING;
    }
}
```

### Leverage Readonly Properties

Use readonly for immutable data:

```php
class ValueObject
{
    public function __construct(
        public readonly string $id,
        public readonly string $value,
        public readonly DateTimeImmutable $timestamp
    ) {}

    // No need for getters - properties are public but immutable
}
```

### Intersection Types for Complex Dependencies

```php
interface Serializable
{
    public function serialize(): string;
}

interface Validatable
{
    public function validate(): bool;
}

class DataExporter
{
    public function export(Serializable&Validatable $data): string
    {
        if (!$data->validate()) {
            throw new InvalidArgumentException('Invalid data');
        }

        return $data->serialize();
    }
}
```

### Never Type for Control Flow

```php
class Router
{
    public function handleNotFound(): never
    {
        http_response_code(404);
        include '404.php';
        exit;
    }

    public function handleError(\Throwable $e): never
    {
        error_log($e->getMessage());
        http_response_code(500);
        include '500.php';
        exit;
    }
}
```

## Migration Tips

### From PHP 8.0 to PHP 8.1

1. **Replace constants with enums** where appropriate
2. **Add readonly to immutable properties**
3. **Use intersection types** for complex type requirements
4. **Apply never return type** for functions that don't return
5. **Test enum integration** with existing code

### Common Upgrade Patterns

```php
// Before PHP 8.1
class Status
{
    public const ACTIVE = 'active';
    public const INACTIVE = 'inactive';

    private string $value;

    public function __construct(string $value)
    {
        $this->value = $value;
    }

    public function getValue(): string
    {
        return $this->value;
    }
}

// PHP 8.1
enum Status: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';

    public function isActive(): bool
    {
        return $this === self::ACTIVE;
    }
}
```

## Performance Improvements

PHP 8.1 includes several performance optimizations:

1. **Improved enum performance** - Faster than class constants
2. **Readonly property optimization** - Better memory usage
3. **Intersection type checking** - Optimized type validation
4. **JIT improvements** - Better just-in-time compilation

## Compatibility Notes

- **Enums** are not available in PHP 8.0 and below
- **Intersection types** require PHP 8.1+
- **Readonly properties** work differently than readonly classes (PHP 8.2+)
- **Never type** is PHP 8.1+ only

Use feature detection or version checks when necessary:

```php
if (PHP_VERSION_ID >= 80100) {
    // Use PHP 8.1 features
} else {
    // Fallback for older versions
}
```