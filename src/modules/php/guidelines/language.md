# PHP Core Guidelines

## Strict Typing

- **Always use strict typing** at the head of every `.php` file:
  ```php
  <?php

  declare(strict_types=1);
  ```

## Control Structures

- **Always use curly braces** for control structures, even for single lines:
  ```php
  // ❌ Bad
  if ($condition) return true;

  // ✅ Good
  if ($condition) {
      return true;
  }
  ```

## Constructors

### Property Promotion

Use PHP 8 constructor property promotion:

```php
// ❌ Old way
class UserService
{
    private UserRepository $repository;
    private LoggerInterface $logger;

    public function __construct(UserRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
    }
}

// ✅ Modern way
class UserService
{
    public function __construct(
        private UserRepository $repository,
        private LoggerInterface $logger
    ) {}
}
```

### No Empty Constructors

Don't allow empty `__construct()` methods with zero parameters - they serve no purpose.

## Type Declarations

### Return Types

**Always use explicit return type declarations:**

```php
// ❌ Bad - No return type
public function getName()
{
    return $this->name;
}

// ✅ Good - Explicit return type
public function getName(): string
{
    return $this->name;
}

// ✅ Good - Nullable return type
public function findUser(int $id): ?User
{
    return $this->users[$id] ?? null;
}

// ✅ Good - Void return type
public function logActivity(string $message): void
{
    $this->logger->info($message);
}

// ✅ Good - Union types (PHP 8)
public function getId(): int|string
{
    return $this->id;
}
```

### Parameter Types

**Use appropriate type hints for method parameters:**

```php
// ✅ Good - Full type hints
protected function processPayment(
    Payment $payment,
    ?string $currency = null,
    bool $sendNotification = true
): PaymentResult {
    // Implementation
}

// ✅ Good - Mixed type when truly needed
public function cache(string $key, mixed $value): void
{
    $this->store[$key] = $value;
}
```

## Comments & Documentation

### Avoid Inline Comments

Prefer PHPDoc blocks over comments. Never use comments within code unless something is **very** complex:

```php
// ❌ Bad - Unnecessary comment
public function calculateTotal(): float
{
    // Add all items
    $total = 0;
    foreach ($this->items as $item) {
        // Add item price to total
        $total += $item->price;
    }
    // Return the total
    return $total;
}

// ✅ Good - Self-documenting code
public function calculateTotal(): float
{
    return array_sum(array_column($this->items, 'price'));
}
```

### PHPDoc Blocks

Add useful PHPDoc blocks with array shapes when appropriate:

```php
/**
 * Process user registration data
 *
 * @param array{
 *     name: string,
 *     email: string,
 *     password: string,
 *     terms_accepted: bool,
 *     referral_code?: string
 * } $data
 * @return User
 * @throws ValidationException
 */
public function register(array $data): User
{
    // Implementation
}

/**
 * @return Collection<int, User>
 */
public function getActiveUsers(): Collection
{
    return User::where('active', true)->get();
}
```

## Enums

### Enum Naming

Keys in an Enum should typically be TitleCase:

```php
enum UserRole: string
{
    case Admin = 'admin';
    case Editor = 'editor';
    case Viewer = 'viewer';
}

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Completed = 'completed';
    case Failed = 'failed';
    case Refunded = 'refunded';
}
```

However, follow existing application Enum conventions if they differ.

## Modern PHP Features

### Named Arguments

Use named arguments for clarity with multiple parameters:

```php
// ✅ Good - Clear what each parameter means
$user = User::create(
    name: 'John Doe',
    email: 'john@example.com',
    emailVerified: true,
    role: UserRole::Editor
);
```

### Match Expressions

Prefer `match` over `switch` when appropriate:

```php
// ✅ Modern approach
$message = match($status) {
    PaymentStatus::Pending => 'Payment is being processed',
    PaymentStatus::Completed => 'Payment successful',
    PaymentStatus::Failed => 'Payment failed',
    default => 'Unknown status'
};
```

### Null Safe Operator

Use the null safe operator for cleaner code:

```php
// ❌ Old way
$country = null;
if ($user !== null) {
    $address = $user->getAddress();
    if ($address !== null) {
        $country = $address->getCountry();
    }
}

// ✅ Modern way
$country = $user?->getAddress()?->getCountry();
```

## Arrays

### Array Unpacking

Use array unpacking for cleaner array operations:

```php
$defaultConfig = ['timeout' => 30, 'retries' => 3];
$userConfig = ['timeout' => 60];

// ✅ Good - Array unpacking
$finalConfig = [...$defaultConfig, ...$userConfig];
```

### Array Type Hints

Be specific with array type hints:

```php
/**
 * @param string[] $tags
 * @param array<int, User> $users
 * @param array{id: int, name: string} $data
 */
public function process(array $tags, array $users, array $data): void
{
    // Implementation
}
```

## Exception Handling

### Specific Exceptions

Catch specific exceptions and handle them appropriately:

```php
try {
    $result = $this->paymentGateway->charge($amount);
} catch (InsufficientFundsException $e) {
    $this->logger->warning('Payment failed: insufficient funds', [
        'user_id' => $user->id,
        'amount' => $amount
    ]);
    throw new PaymentFailedException('Insufficient funds', previous: $e);
} catch (GatewayTimeoutException $e) {
    $this->queueForRetry($payment);
    throw new PaymentPendingException('Payment is being processed', previous: $e);
} catch (Exception $e) {
    $this->logger->error('Unexpected payment error', [
        'exception' => $e,
        'user_id' => $user->id
    ]);
    throw new PaymentFailedException('Payment processing failed', previous: $e);
}
```

## Value Objects

Create value objects for domain concepts:

```php
final class Email
{
    private string $value;

    public function __construct(string $email)
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Invalid email: {$email}");
        }

        $this->value = strtolower($email);
    }

    public function getValue(): string
    {
        return $this->value;
    }

    public function getDomain(): string
    {
        return substr($this->value, strpos($this->value, '@') + 1);
    }

    public function equals(Email $other): bool
    {
        return $this->value === $other->value;
    }

    public function __toString(): string
    {
        return $this->value;
    }
}
```

## Readonly Properties

Use readonly properties for immutable values:

```php
class User
{
    public function __construct(
        public readonly int $id,
        public readonly string $email,
        public readonly DateTimeImmutable $createdAt,
        private string $name
    ) {}

    public function getName(): string
    {
        return $this->name;
    }

    public function changeName(string $name): void
    {
        $this->name = $name;
    }
}
```

## Performance Best Practices

### Generators for Large Datasets

Use generators for memory-efficient iteration:

```php
/**
 * @return Generator<int, User>
 */
public function getLargeUserSet(): Generator
{
    $offset = 0;
    $limit = 100;

    while (true) {
        $users = User::query()
            ->offset($offset)
            ->limit($limit)
            ->get();

        if ($users->isEmpty()) {
            break;
        }

        foreach ($users as $user) {
            yield $user;
        }

        $offset += $limit;
    }
}
```

## Security

### Input Validation

Always validate and sanitize input:

```php
public function sanitizeInput(mixed $input): string
{
    if (!is_string($input)) {
        throw new InvalidArgumentException('Input must be a string');
    }

    return htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
}
```

### SQL Injection Prevention

Never concatenate user input in SQL queries:

```php
// ❌ NEVER do this
$query = "SELECT * FROM users WHERE email = '{$_POST['email']}'";

// ✅ Use prepared statements
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $_POST['email']]);
```

### Password Handling

```php
// ✅ Hashing passwords
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// ✅ Verifying passwords
if (password_verify($password, $hashedPassword)) {
    // Password is correct
}

// ✅ Check if rehashing is needed
if (password_needs_rehash($hashedPassword, PASSWORD_DEFAULT)) {
    $newHash = password_hash($password, PASSWORD_DEFAULT);
    // Update stored hash
}
```

## Common Anti-Patterns to Avoid

1. **Don't use `@` error suppression** - Handle errors properly
2. **Don't use `eval()`** - It's dangerous and slow
3. **Don't use `global` variables** - Use dependency injection
4. **Don't mix HTML and PHP** - Use templates or view files
5. **Don't ignore return values** - Handle them appropriately
6. **Don't use magic numbers** - Define constants
7. **Don't write long methods** - Break them into smaller pieces
8. **Don't ignore type safety** - Use strict types and type hints