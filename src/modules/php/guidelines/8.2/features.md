# PHP 8.2 Specific Guidelines

## PHP 8.2 Major Features

### Readonly Classes

PHP 8.2 introduces readonly classes - all properties are automatically readonly:

```php
readonly class UserDto
{
    public function __construct(
        public string $id,
        public string $name,
        public string $email,
        public DateTimeImmutable $createdAt
    ) {}

    // All properties are automatically readonly
    // No need to specify 'readonly' for each property
}

// Usage
$user = new UserDto('123', 'John Doe', 'john@example.com', new DateTimeImmutable());
// $user->name = 'Jane'; // ❌ Error: Cannot modify readonly property
```

### Disjunctive Normal Form (DNF) Types

Combine union and intersection types:

```php
class DataProcessor
{
    // (A&B)|(C&D) - Either (A and B) OR (C and D)
    public function process((Loggable&Cacheable)|(Serializable&Validatable) $data): void
    {
        if ($data instanceof Loggable) {
            $data->log();
            $data->cache();
        } else {
            if ($data->validate()) {
                $result = $data->serialize();
            }
        }
    }
}
```

### Constants in Traits

Define constants in traits:

```php
trait HttpStatusCodes
{
    public const HTTP_OK = 200;
    public const HTTP_NOT_FOUND = 404;
    public const HTTP_SERVER_ERROR = 500;
}

class ApiController
{
    use HttpStatusCodes;

    public function success(): Response
    {
        return response()->json([], self::HTTP_OK);
    }
}
```

### New Random Extension

Enhanced random number generation:

```php
// Better random functionality
$randomizer = new \Random\Randomizer();

// Get random integers
$dice = $randomizer->getInt(1, 6);
$percentage = $randomizer->getInt(0, 100);

// Get random bytes
$token = bin2hex($randomizer->getBytes(16));

// Shuffle arrays randomly
$cards = ['A', 'K', 'Q', 'J'];
$shuffled = $randomizer->shuffleArray($cards);

// Pick random elements
$winner = $randomizer->pickArrayKeys(['alice', 'bob', 'charlie'], 1);
```

### Sensitive Parameter Attribute

Hide sensitive data from stack traces:

```php
function authenticate(
    string $username,
    #[\SensitiveParameter] string $password,
    #[\SensitiveParameter] string $apiKey
): bool {
    // If this function throws an exception,
    // $password and $apiKey won't appear in stack traces
    try {
        return $this->auth->verify($username, $password, $apiKey);
    } catch (Exception $e) {
        // Stack trace will show $username but not $password or $apiKey
        throw $e;
    }
}
```

## PHP 8.2 Improvements

### Locale-Independent `strtolower()`/`strtoupper()`

More predictable string case conversion:

```php
// PHP 8.2 - Consistent behavior regardless of locale
$lower = strtolower('HELLO WORLD'); // 'hello world'
$upper = strtoupper('hello world'); // 'HELLO WORLD'

// For locale-specific operations, use mb_strtolower()/mb_strtoupper()
$turkishLower = mb_strtolower('İSTANBUL', 'tr_TR'); // 'istanbul'
```

### Improved Type System

Better type checking and inference:

```php
class Repository
{
    public function find(int $id): ?Model
    {
        return $this->models[$id] ?? null;
    }

    // PHP 8.2 - Better null handling in match expressions
    public function getStatus(?Model $model): string
    {
        return match($model?->status) {
            'active' => 'Active',
            'inactive' => 'Inactive',
            null => 'Unknown',
            default => 'Other'
        };
    }
}
```

## Best Practices for PHP 8.2

### Use Readonly Classes for DTOs

Perfect for data transfer objects:

```php
readonly class CreateUserRequest
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public array $roles = []
    ) {}

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->password,
            'roles' => $this->roles,
        ];
    }
}
```

### Leverage DNF Types for Complex APIs

```php
interface Cacheable
{
    public function getCacheKey(): string;
}

interface Loggable
{
    public function getLogContext(): array;
}

interface Serializable
{
    public function serialize(): string;
}

class DataHandler
{
    // Accept objects that are either:
    // - Both Cacheable AND Loggable, OR
    // - Serializable (standalone)
    public function handle((Cacheable&Loggable)|Serializable $data): void
    {
        if ($data instanceof Serializable && !($data instanceof Cacheable)) {
            // Handle serializable-only data
            $this->process($data->serialize());
        } else {
            // Handle cacheable and loggable data
            $this->cache($data->getCacheKey());
            $this->log($data->getLogContext());
        }
    }
}
```

### Use Sensitive Parameter for Security

```php
class UserService
{
    public function createUser(
        string $username,
        #[\SensitiveParameter] string $password,
        #[\SensitiveParameter] ?string $apiToken = null
    ): User {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        return new User($username, $hashedPassword, $apiToken);
    }

    public function authenticate(
        string $username,
        #[\SensitiveParameter] string $password
    ): ?User {
        $user = $this->findByUsername($username);

        if (!$user || !password_verify($password, $user->password)) {
            return null;
        }

        return $user;
    }
}
```

### Utilize New Random Extension

```php
class TokenGenerator
{
    private \Random\Randomizer $randomizer;

    public function __construct()
    {
        $this->randomizer = new \Random\Randomizer();
    }

    public function generateApiKey(): string
    {
        return base64_encode($this->randomizer->getBytes(32));
    }

    public function generateSessionId(): string
    {
        return bin2hex($this->randomizer->getBytes(16));
    }

    public function pickRandomWinner(array $participants): string
    {
        $keys = $this->randomizer->pickArrayKeys($participants, 1);
        return $participants[$keys[0]];
    }
}
```

## Performance Improvements

PHP 8.2 includes several performance enhancements:

1. **Readonly class optimization** - Better memory usage and performance
2. **Random extension** - Faster random number generation
3. **Improved opcache** - Better code optimization
4. **String function improvements** - Faster string operations

## Migration Considerations

### From PHP 8.1 to PHP 8.2

1. **Convert appropriate classes to readonly** for better immutability
2. **Replace complex type unions** with DNF types where beneficial
3. **Add SensitiveParameter attributes** to security-critical functions
4. **Migrate to new Random extension** for better randomization
5. **Add constants to traits** where it makes sense

### Common Migration Patterns

```php
// Before PHP 8.2
class UserData
{
    public readonly string $id;
    public readonly string $name;
    public readonly string $email;

    public function __construct(string $id, string $name, string $email)
    {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
    }
}

// PHP 8.2
readonly class UserData
{
    public function __construct(
        public string $id,
        public string $name,
        public string $email
    ) {}
}
```

## Compatibility Notes

- **Readonly classes** are PHP 8.2+ only
- **DNF types** require PHP 8.2+
- **Constants in traits** are PHP 8.2+ only
- **Random extension** replaces many mt_rand() use cases
- **SensitiveParameter** is PHP 8.2+ only

Use version checks when needed:

```php
if (PHP_VERSION_ID >= 80200) {
    // Use PHP 8.2 features
    $randomizer = new \Random\Randomizer();
} else {
    // Fallback for older versions
    $value = mt_rand(1, 100);
}
```