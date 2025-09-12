## PHP 8.1 Guidelines

### New Features & Best Practices

**Enums (Recommended)**
```php
enum Status: string
{
    case PENDING = 'pending';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
}

// Usage
$status = Status::PENDING;
```

**Readonly Properties**
```php
class User
{
    public function __construct(
        public readonly string $email,
        public readonly int $id
    ) {}
}
```

**Fibers for Async Programming**
```php
$fiber = new Fiber(function (): void {
    $value = Fiber::suspend('fiber');
    echo "Value is: $value";
});

$value = $fiber->start();
$fiber->resume('test');
```

### Deprecated Features to Avoid
- `$GLOBALS` restrictions in write operations
- Implicit float to int conversions for incompatible values