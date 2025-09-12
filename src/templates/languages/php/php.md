## PHP Guidelines (Common)

### Core Best Practices

**Type Declarations**
```php
<?php

declare(strict_types=1);

class UserService
{
    public function createUser(string $name, string $email): User
    {
        return new User($name, $email);
    }
    
    public function getUsers(): array
    {
        return $this->repository->findAll();
    }
}
```

**Object-Oriented Patterns**
```php
// Value Objects
class Email
{
    public function __construct(private string $value)
    {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Invalid email');
        }
    }
    
    public function getValue(): string
    {
        return $this->value;
    }
}

// Dependency Injection
class UserController
{
    public function __construct(
        private UserService $userService,
        private LoggerInterface $logger
    ) {}
}
```

**Error Handling**
```php
try {
    $user = $this->userService->findById($id);
} catch (UserNotFoundException $e) {
    $this->logger->warning('User not found', ['id' => $id]);
    return $this->errorResponse('User not found', 404);
} catch (Exception $e) {
    $this->logger->error('Unexpected error', ['exception' => $e]);
    return $this->errorResponse('Internal error', 500);
}
```

**Database Best Practices**
```php
// Use prepared statements
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);

// Never concatenate user input
// ❌ Bad
$query = "SELECT * FROM users WHERE name = '{$_POST['name']}'";

// ✅ Good
$stmt = $pdo->prepare('SELECT * FROM users WHERE name = :name');
$stmt->execute(['name' => $_POST['name']]);
```

### Security Guidelines
- Always validate and sanitize input
- Use prepared statements for database queries
- Implement proper authentication and authorization
- Never store passwords in plain text (use `password_hash()`)
- Validate file uploads and restrict file types

### Performance Tips
- Use proper caching strategies
- Optimize database queries
- Use lazy loading where appropriate
- Implement proper error logging