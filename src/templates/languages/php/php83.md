## PHP 8.3 Guidelines

### Features Available in PHP 8.3

**Enums (from PHP 8.1 - Still Recommended)**
```php
enum Status: string
{
    case PENDING = 'pending';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
}

// Usage with match expressions
$message = match($status) {
    Status::PENDING => 'Waiting for approval',
    Status::COMPLETED => 'Task finished',
    Status::CANCELLED => 'Task cancelled',
};
```

**Readonly Properties & Classes (from PHP 8.1 & 8.2)**
```php
readonly class User
{
    public function __construct(
        public string $name,
        public string $email,
        public int $id
    ) {}
}
```

**Typed Class Constants (New in PHP 8.3)**
```php
class MathConstants 
{
    public const float PI = 3.14159;
    public const int MAX_SIZE = 1000;
    private const array ALLOWED_TYPES = ['int', 'string', 'float'];
}
```

**Dynamic Class Constant Fetch (New in PHP 8.3)**
```php
class Config
{
    public const string APP_NAME = 'MyApp';
    public const string APP_VERSION = '1.0.0';
}

// Dynamic access
$constantName = 'APP_NAME';
$value = Config::{$constantName}; // 'MyApp'
```

**Anonymous Readonly Classes (New in PHP 8.3)**
```php
$userDto = new readonly class($name, $email) {
    public function __construct(
        public string $name,
        public string $email
    ) {}
};
```

**Override Attribute (New in PHP 8.3)**
```php
class BaseRepository
{
    public function save(Model $model): bool
    {
        return true;
    }
}

class UserRepository extends BaseRepository
{
    #[Override]
    public function save(Model $model): bool
    {
        // Compiler ensures this actually overrides parent method
        return parent::save($model);
    }
}
```

**json_validate() Function (New in PHP 8.3)**
```php
// Before PHP 8.3
$isValid = json_decode($jsonString) !== null && json_last_error() === JSON_ERROR_NONE;

// PHP 8.3+
$isValid = json_validate($jsonString);
```

### Performance Improvements in PHP 8.3
- Significant performance gains in array operations
- Improved garbage collection efficiency
- Better opcache optimization
- Enhanced JIT compilation for more scenarios

### Deprecated Features to Avoid in PHP 8.3
- `${var}` string interpolation syntax (use `{$var}`)
- Dynamic properties without `#[AllowDynamicProperties]`
- Some MT_RAND_* constants (use proper random functions)
- Unserialize() with classes that don't implement __unserialize()

### Migration from PHP 8.2
- Update type declarations to use typed constants where beneficial
- Add `#[Override]` attributes for better code safety
- Replace custom JSON validation with `json_validate()`
- Review class inheritance for override attribute opportunities