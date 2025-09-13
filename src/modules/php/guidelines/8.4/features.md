# PHP 8.4 Specific Guidelines

## PHP 8.4 New Features

### New Array Functions

PHP 8.4 introduces powerful array functions that simplify code when not using Laravel's collections:

```php
// array_find() - Find first matching element
$users = [
    ['name' => 'John', 'role' => 'admin'],
    ['name' => 'Jane', 'role' => 'user'],
    ['name' => 'Bob', 'role' => 'admin']
];

$firstAdmin = array_find($users, fn($user) => $user['role'] === 'admin');
// Result: ['name' => 'John', 'role' => 'admin']

// array_find_key() - Find first matching key
$firstAdminKey = array_find_key($users, fn($user) => $user['role'] === 'admin');
// Result: 0

// array_any() - Check if any element satisfies condition
$hasAdmin = array_any($users, fn($user) => $user['role'] === 'admin');
// Result: true

// array_all() - Check if all elements satisfy condition
$allAdmins = array_all($users, fn($user) => $user['role'] === 'admin');
// Result: false
```

### Practical Usage Examples

```php
class UserRepository
{
    private array $users;

    public function findByEmail(string $email): ?User
    {
        // PHP 8.4 - Clean and readable
        return array_find(
            $this->users,
            fn($user) => $user->email === $email
        );
    }

    public function hasActiveUsers(): bool
    {
        return array_any(
            $this->users,
            fn($user) => $user->isActive()
        );
    }

    public function areAllVerified(): bool
    {
        return array_all(
            $this->users,
            fn($user) => $user->isVerified()
        );
    }

    public function getFirstUserIndex(string $role): ?int
    {
        return array_find_key(
            $this->users,
            fn($user) => $user->role === $role
        );
    }
}
```

### Cleaner Object Instantiation Chaining

No more parentheses needed when chaining on new instances:

```php
// ❌ Before PHP 8.4 - Required parentheses
$response = (new JsonResponse(['data' => $data]))->setStatusCode(201);
$request = (new HttpRequest($url))->withHeaders($headers)->send();
$builder = (new QueryBuilder())->select('*')->from('users')->where('active', true);

// ✅ PHP 8.4 - Clean chaining without parentheses
$response = new JsonResponse(['data' => $data])->setStatusCode(201);
$request = new HttpRequest($url)->withHeaders($headers)->send();
$builder = new QueryBuilder()->select('*')->from('users')->where('active', true);
```

### Real-World Chaining Examples

```php
class ApiResponse
{
    public function success(array $data): JsonResponse
    {
        return new JsonResponse($data)
            ->setStatusCode(200)
            ->header('Content-Type', 'application/json')
            ->header('Cache-Control', 'no-cache');
    }

    public function error(string $message, int $code = 400): JsonResponse
    {
        return new JsonResponse(['error' => $message])
            ->setStatusCode($code)
            ->header('Content-Type', 'application/json');
    }
}

class DatabaseQuery
{
    public function getUserStats(): array
    {
        return new QueryBuilder()
            ->select(['users.id', 'users.name', 'COUNT(posts.id) as post_count'])
            ->from('users')
            ->leftJoin('posts', 'users.id', '=', 'posts.user_id')
            ->groupBy('users.id')
            ->having('post_count', '>', 0)
            ->orderBy('post_count', 'desc')
            ->limit(10)
            ->get();
    }
}

class HttpClient
{
    public function post(string $url, array $data): Response
    {
        return new Request($url)
            ->method('POST')
            ->header('Content-Type', 'application/json')
            ->header('Accept', 'application/json')
            ->body(json_encode($data))
            ->timeout(30)
            ->send();
    }
}
```

## Best Practices for PHP 8.4

### Prefer Array Functions Over Manual Loops

```php
// ❌ Old way - Manual loops
function findActiveUser(array $users): ?User
{
    foreach ($users as $user) {
        if ($user->isActive()) {
            return $user;
        }
    }
    return null;
}

function hasAdminUser(array $users): bool
{
    foreach ($users as $user) {
        if ($user->isAdmin()) {
            return true;
        }
    }
    return false;
}

// ✅ PHP 8.4 way - Array functions
function findActiveUser(array $users): ?User
{
    return array_find($users, fn($user) => $user->isActive());
}

function hasAdminUser(array $users): bool
{
    return array_any($users, fn($user) => $user->isAdmin());
}
```

### Use Method Chaining Effectively

```php
class RequestBuilder
{
    private array $headers = [];
    private array $params = [];
    private string $method = 'GET';

    public function header(string $key, string $value): self
    {
        $this->headers[$key] = $value;
        return $this;
    }

    public function param(string $key, string $value): self
    {
        $this->params[$key] = $value;
        return $this;
    }

    public function method(string $method): self
    {
        $this->method = $method;
        return $this;
    }

    public function build(): Request
    {
        return new Request($this->method, $this->headers, $this->params);
    }
}

// PHP 8.4 - Clean instantiation and chaining
$request = new RequestBuilder()
    ->method('POST')
    ->header('Authorization', 'Bearer ' . $token)
    ->header('Content-Type', 'application/json')
    ->param('limit', '50')
    ->param('offset', '100')
    ->build();
```

### Combine Array Functions for Complex Logic

```php
class OrderProcessor
{
    public function processOrders(array $orders): array
    {
        // Find first order that needs processing
        $nextOrder = array_find(
            $orders,
            fn($order) => $order->status === 'pending' && $order->priority === 'high'
        );

        // Check if any orders are overdue
        $hasOverdue = array_any(
            $orders,
            fn($order) => $order->dueDate < now() && !$order->isComplete()
        );

        // Verify all orders have valid payments
        $allPaid = array_all(
            $orders,
            fn($order) => $order->payment?->isValid() ?? false
        );

        return [
            'next_order' => $nextOrder,
            'has_overdue' => $hasOverdue,
            'all_paid' => $allPaid,
        ];
    }
}
```

## Laravel Integration

When working with Laravel, consider when to use PHP arrays vs Collections:

```php
class UserController
{
    public function search(Request $request): JsonResponse
    {
        $users = User::all()->toArray(); // Convert to array for PHP 8.4 functions

        // Use PHP 8.4 array functions for simple operations
        $activeUser = array_find($users, fn($user) => $user['is_active']);
        $hasAdmin = array_any($users, fn($user) => $user['role'] === 'admin');

        // Use Collections for complex operations
        $userStats = collect($users)
            ->groupBy('role')
            ->map(fn($group) => $group->count());

        return new JsonResponse([
            'first_active' => $activeUser,
            'has_admin' => $hasAdmin,
            'stats' => $userStats,
        ])->header('Cache-Control', 'no-cache'); // PHP 8.4 chaining
    }
}
```

## Performance Benefits

PHP 8.4 improvements provide several performance benefits:

1. **Array functions** are optimized at the C level, faster than PHP loops
2. **Cleaner chaining** reduces object creation overhead
3. **Better memory usage** with native array functions
4. **Reduced code complexity** leads to better optimization

## Migration Tips

### From PHP 8.3 to PHP 8.4

1. **Replace manual loops** with array functions where appropriate
2. **Remove unnecessary parentheses** in method chaining
3. **Use native functions** instead of helper libraries for simple operations
4. **Test thoroughly** - behavior should be identical but performance improved

### Refactoring Examples

```php
// Before PHP 8.4
function validateUsers(array $users): bool
{
    foreach ($users as $user) {
        if (!$user->isValid()) {
            return false;
        }
    }
    return true;
}

$result = (new ValidationService())->validate($data)->getResult();

// PHP 8.4
function validateUsers(array $users): bool
{
    return array_all($users, fn($user) => $user->isValid());
}

$result = new ValidationService()->validate($data)->getResult();
```

## Compatibility Notes

- **Array functions** are PHP 8.4+ only
- **Chaining without parentheses** is PHP 8.4+ only
- Use feature detection or version checks for backward compatibility:

```php
if (function_exists('array_find')) {
    // Use PHP 8.4 array functions
    $result = array_find($array, $callback);
} else {
    // Fallback for older versions
    foreach ($array as $item) {
        if ($callback($item)) {
            $result = $item;
            break;
        }
    }
}
```

## When to Use PHP 8.4 Features

✅ **Use array functions when:**
- Working with simple arrays (not Laravel Collections)
- Need basic find/filter operations
- Performance is critical
- Code readability is important

✅ **Use method chaining when:**
- Building objects with fluent interfaces
- Creating configuration objects
- Working with response builders
- Setting up API clients

❌ **Don't use when:**
- Already using Laravel Collections effectively
- Need complex data transformations (use Collections)
- Backward compatibility with older PHP versions is required