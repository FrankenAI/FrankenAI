# PHPUnit Testing Guidelines

## Core Testing Principles

### Test Structure
- Follow AAA pattern: Arrange, Act, Assert
- Use descriptive test method names that explain what is being tested
- Group related tests in test classes
- Use `setUp()` and `tearDown()` methods for common test setup

### PHPUnit Test Classes
```php
<?php

use PHPUnit\Framework\TestCase;

class UserTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Common setup code
    }

    public function testUserCanBeCreatedWithValidData(): void
    {
        // Arrange
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ];

        // Act
        $user = new User($userData);

        // Assert
        $this->assertEquals('John Doe', $user->getName());
        $this->assertEquals('john@example.com', $user->getEmail());
    }
}
```

## Assertions Best Practices

### Use Specific Assertions
```php
// Good - specific assertions
$this->assertTrue($user->isActive());
$this->assertFalse($user->isBlocked());
$this->assertNull($user->getDeletedAt());
$this->assertEmpty($user->getErrors());
$this->assertCount(3, $user->getRoles());

// Avoid - generic assertions
$this->assertEquals(true, $user->isActive());
$this->assertEquals(false, $user->isBlocked());
```

### Exception Testing
```php
public function testThrowsExceptionForInvalidEmail(): void
{
    $this->expectException(InvalidEmailException::class);
    $this->expectExceptionMessage('Invalid email format');

    new User(['email' => 'invalid-email']);
}
```

## Test Organization

### Directory Structure
```
tests/
├── Unit/           # Unit tests for individual classes
│   ├── Models/
│   ├── Services/
│   └── Utils/
├── Integration/    # Integration tests
├── Fixtures/       # Test data and fixtures
└── bootstrap.php   # Test bootstrap
```

### Data Providers
```php
/**
 * @dataProvider validEmailProvider
 */
public function testAcceptsValidEmails(string $email): void
{
    $user = new User(['email' => $email]);
    $this->assertEquals($email, $user->getEmail());
}

public function validEmailProvider(): array
{
    return [
        'standard email' => ['john@example.com'],
        'email with subdomain' => ['john@mail.example.com'],
        'email with plus sign' => ['john+test@example.com'],
    ];
}
```

## Mocking and Test Doubles

### Using PHPUnit Mocks
```php
public function testSendsEmailNotification(): void
{
    $mailer = $this->createMock(MailerInterface::class);
    $mailer->expects($this->once())
           ->method('send')
           ->with($this->isInstanceOf(EmailMessage::class));

    $service = new UserService($mailer);
    $service->createUser(['name' => 'John', 'email' => 'john@example.com']);
}
```

### Stub vs Mock
```php
// Stub - provides canned responses
$repository = $this->createStub(UserRepository::class);
$repository->method('find')->willReturn(new User());

// Mock - verifies behavior
$repository = $this->createMock(UserRepository::class);
$repository->expects($this->once())->method('save');
```

## Test Configuration

### PHPUnit Configuration (phpunit.xml)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="tests/bootstrap.php"
         colors="true"
         stopOnFailure="false">
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory>tests/Integration</directory>
        </testsuite>
    </testsuites>
    <coverage>
        <include>
            <directory>src</directory>
        </include>
        <exclude>
            <directory>src/Config</directory>
        </exclude>
    </coverage>
</phpunit>
```

## Running Tests

### Basic Commands
```bash
# Run all tests
vendor/bin/phpunit

# Run specific test suite
vendor/bin/phpunit --testsuite=Unit

# Run tests with coverage
vendor/bin/phpunit --coverage-html coverage

# Run tests and stop on first failure
vendor/bin/phpunit --stop-on-failure

# Filter tests by name
vendor/bin/phpunit --filter=testUserCanBeCreated
```

### Test Performance
- Keep tests fast and focused
- Use database transactions for integration tests
- Mock external dependencies
- Group slow tests in separate suites

## Laravel Integration

### Laravel TestCase
```php
use Illuminate\Foundation\Testing\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    public function testCreatesUserInDatabase(): void
    {
        $userData = [
            'name' => 'John Doe',
            'email' => 'john@example.com'
        ];

        $user = User::create($userData);

        $this->assertDatabaseHas('users', $userData);
        $this->assertInstanceOf(User::class, $user);
    }
}
```