## PHP 8.2 Guidelines

### Features Available in PHP 8.2

**Enums (from PHP 8.1 - Still Recommended)**
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

**Readonly Properties (from PHP 8.1)**
```php
class User
{
    public function __construct(
        public readonly string $email,
        public readonly int $id
    ) {}
}
```

**Readonly Classes (New in PHP 8.2)**
```php
readonly class User
{
    public function __construct(
        public string $name,
        public string $email
    ) {}
}
```

**Disjunctive Normal Form Types**
```php
function process(int|string|(Foo&Bar) $input): void
{
    // Enhanced type unions with intersections
}
```

**Sensitive Parameter Attribute**
```php
function login(
    string $username,
    #[\SensitiveParameter] string $password
): bool {
    // Password won't appear in stack traces
}
```

**Array Unpacking with String Keys (from PHP 8.1)**
```php
$array1 = ["a" => 1];
$array2 = ["b" => 2];
$result = [...$array1, ...$array2]; // ["a" => 1, "b" => 2]
```

### Performance Improvements in PHP 8.2
- Random extension improvements
- Locale-independent case conversion
- Iterator optimizations
- Better JIT compilation optimizations

### Deprecated Features to Avoid in PHP 8.2
- `${var}` string interpolation syntax (use `{$var}`)
- Dynamic properties on non-stdClass objects without `#[AllowDynamicProperties]`
- Partially supported callables