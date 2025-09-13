# FrankenAI Configuration


[//]: # (franken-ai:stack:start)
## Detected Stack: Laravel

### Project Information
- **Runtime**: php
- **Languages**: PHP
- **Frameworks**: Laravel
- **Laravel Version**: 12
- **PHP Version**: 8.4
[//]: # (franken-ai:stack:end)

[//]: # (franken-ai:commands:start)
## Commands

### Development
- `php artisan serve` - Start development server
- `php artisan tinker` - Interactive REPL

### Build
- `npm run build` - Build assets for production
- `npm run dev` - Build assets for development

### Testing
- `php artisan test` - Run tests
- `vendor/bin/phpunit` - Run PHPUnit tests

### Linting
- `./vendor/bin/pint` - Run Laravel Pint (if installed)
- `composer run lint` - Run linter

### Package Management
- `composer install` - Install PHP dependencies
- `npm install` - Install Node.js dependencies

[//]: # (franken-ai:commands:end)

[//]: # (franken-ai:workflow:start)
## FrankenAI Workflow

### Discovery Phase (Gemini CLI)
Use for large-scale codebase analysis:

```bash
# Architecture overview
gemini -p "@src/ @app/ What's the overall architecture?"

# Feature verification
gemini -p "@src/ Is user authentication implemented?"

# Pattern detection
gemini -p "@./ Show me all async functions with file locations"
```

### Implementation Phase (Claude Code)
Use for precise development:

- **File Editing**: Read/Write/Edit tools for code changes
- **Framework Tools**: Use framework-specific commands
- **Testing**: Run and debug tests
- **Real-time Problem Solving**: Debug and validate implementations
[//]: # (franken-ai:workflow:end)

[//]: # (franken-ai:guidelines:start)

# Laravel Core Guidelines

## Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (migrations, controllers, models, etc.)
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input
- Always pass the correct `--options` to ensure correct behavior
- For generic PHP classes, use `php artisan make:class`

## Database

### Eloquent Over Everything

- **Always use Eloquent relationships** with proper return type hints
- **Avoid `DB::`** - Prefer `Model::query()` to leverage Laravel's ORM capabilities
- **Prevent N+1 queries** by using eager loading with `with()` method
- **Use query builder** only for very complex database operations that Eloquent can't handle elegantly

### Model Creation Best Practices

When creating new models, always create comprehensive scaffolding:

```bash
php artisan make:model Product --factory --seed --migration --resource --no-interaction
```

Ask the user if they need additional options - check available options with `php artisan make:model --help`

### Relationships

```php
class Post extends Model
{
    // Always include return type hints
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)
            ->withPivot('featured')
            ->withTimestamps();
    }
}
```

### Eager Loading

```php
// ❌ Bad - N+1 problem
$posts = Post::all();
foreach ($posts as $post) {
    echo $post->user->name; // Queries database on each iteration
}

// ✅ Good - Eager loading
$posts = Post::with(['user', 'comments.author'])->get();

// ✅ Good - Conditional eager loading
$posts = Post::with(['user:id,name,email'])->get();
```

## Validation

### Form Requests

**Always create Form Request classes** rather than inline validation:

```php
class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Post::class);
    }

    public function rules(): array
    {
        // Check sibling Form Requests for array vs string syntax
        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', Rule::unique('posts')->ignore($this->post)],
            'content' => ['required', 'string', 'min:100'],
            'tags' => ['array'],
            'tags.*' => ['integer', 'exists:tags,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'A post title is required.',
            'content.min' => 'Post content must be at least 100 characters.',
        ];
    }
}
```

## APIs & Resources

### Eloquent API Resources

For APIs, default to using Eloquent API Resources and API versioning:

```php
class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'excerpt' => Str::limit($this->content, 200),
            'content' => $this->when(!$request->routeIs('posts.index'), $this->content),
            'author' => UserResource::make($this->whenLoaded('user')),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
            'published_at' => $this->published_at?->toISOString(),
            'meta' => $this->when($request->user()?->isAdmin(), [
                'views' => $this->views_count,
                'internal_notes' => $this->internal_notes,
            ]),
        ];
    }
}
```

### API Versioning

Unless existing API routes don't use versioning, implement it:

```php
// routes/api.php
Route::prefix('v1')->group(function () {
    Route::apiResource('posts', Api\V1\PostController::class);
});
```

## Queues

### Job Implementation

Use queued jobs for time-consuming operations:

```php
class ProcessPayment implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $maxExceptions = 2;
    public int $timeout = 120;

    public function __construct(
        public Payment $payment
    ) {}

    public function handle(PaymentService $service): void
    {
        $service->process($this->payment);
    }

    public function failed(?Throwable $exception): void
    {
        $this->payment->markAsFailed($exception?->getMessage());
        Log::error('Payment processing failed', [
            'payment_id' => $this->payment->id,
            'error' => $exception?->getMessage(),
        ]);
    }
}

// Dispatching
ProcessPayment::dispatch($payment)->onQueue('payments');
ProcessPayment::dispatchAfterResponse($payment);
ProcessPayment::dispatchSync($payment); // For testing
```

## Authentication & Authorization

### Use Built-in Features

- Leverage Laravel's authentication scaffolding (Breeze, Jetstream, Fortify)
- Use Sanctum for API authentication
- Implement Gates and Policies for authorization

### Policies

```php
class PostPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function update(User $user, Post $post): bool
    {
        return $user->id === $post->user_id || $user->hasRole('admin');
    }

    public function delete(User $user, Post $post): bool
    {
        return $this->update($user, $post) && $post->comments()->doesntExist();
    }
}
```

## URL Generation

### Named Routes

Always prefer named routes and the `route()` function:

```php
// ❌ Bad
return redirect('/posts/' . $post->id);
url('/posts/' . $post->id);

// ✅ Good
return to_route('posts.show', $post);
route('posts.show', $post);
```

## Configuration

### Environment Variables

- **Use environment variables only in configuration files**
- **Never use `env()` directly in application code**

```php
// ❌ Bad - Won't work with config caching
$apiKey = env('STRIPE_KEY');

// ✅ Good
// config/services.php
'stripe' => [
    'key' => env('STRIPE_KEY'),
    'secret' => env('STRIPE_SECRET'),
],

// In application
$apiKey = config('services.stripe.key');
```

## Testing

### Test Creation

```bash
# Feature test (default)
php artisan make:test PostControllerTest --no-interaction

# Unit test
php artisan make:test Services/PostServiceTest --unit --no-interaction
```

### Factory Usage

- **Always use factories** for creating test models
- **Check for custom states** before manually setting attributes
- **Use Faker** following existing conventions (`$this->faker` or `fake()`)

```php
// Check for existing states
$publishedPost = Post::factory()->published()->create();
$draftPost = Post::factory()->draft()->for($user)->create();

// With relationships
$post = Post::factory()
    ->for($user)
    ->has(Comment::factory()->count(3))
    ->create();
```

### Test Structure

```php
class PostControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_post(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->postJson(route('posts.store'), [
                'title' => 'Test Post',
                'content' => fake()->paragraphs(3, true),
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Test Post');

        $this->assertDatabaseHas('posts', [
            'title' => 'Test Post',
            'user_id' => $user->id,
        ]);
    }
}
```

## Common Issues & Solutions

### Vite Manifest Error

If you receive "Unable to locate file in Vite manifest" error:
- Run `npm run build` for production
- Run `npm run dev` for development
- Ask user to run `composer run dev` if available

### Migration Column Changes

When modifying columns, include ALL previously defined attributes:

```php
// ❌ Bad - Will lose other attributes
$table->string('email')->nullable()->change();

// ✅ Good - Preserves all attributes
$table->string('email', 255)->nullable()->unique()->change();
```

### Service Classes Pattern

```php
class PostService
{
    public function __construct(
        private PostRepository $repository,
        private CacheManager $cache
    ) {}

    public function create(array $validated): Post
    {
        $post = $this->repository->create([
            ...$validated,
            'slug' => Str::slug($validated['title']),
        ]);

        $this->cache->tags('posts')->flush();

        event(new PostCreated($post));

        return $post;
    }
}
```

## What NOT to Do

1. **Don't use `DB::` facade** - Use Eloquent instead
2. **Don't use `env()` outside config** - Will break with config caching
3. **Don't inline validation** - Use Form Request classes
4. **Don't skip eager loading** - Causes N+1 problems
5. **Don't create verification scripts** - Write tests instead
6. **Don't change dependencies** without explicit approval
7. **Don't create new base folders** without explicit approval
8. **Don't create documentation** unless explicitly requested

# Laravel 12 Specific Guidelines

## Laravel 12 Structure Detection

Laravel 12 maintains the streamlined structure introduced in Laravel 11, with potential enhancements. Your project may use either the new or legacy structure:

### New Laravel 12 Structure

If `app/Http/Kernel.php` does NOT exist, you're using the streamlined structure:

- **No middleware directory** - Middleware are registered in `bootstrap/app.php`
- **No Kernel files** - Configuration is in `bootstrap/app.php`
- **Auto-registration** - Commands in `app/Console/Commands/` auto-register
- **Streamlined providers** - Listed in `bootstrap/providers.php`

```php
// bootstrap/app.php - Laravel 12 structure
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            CustomMiddleware::class,
        ]);

        $middleware->alias([
            'admin' => AdminMiddleware::class,
            'verified' => VerifyEmailMiddleware::class,
        ]);

        $middleware->priority([
            StartSession::class,
            ShareErrorsFromSession::class,
            AuthenticateSession::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->report(function (CustomException $e) {
            // Custom reporting logic
        });

        $exceptions->render(function (ApiException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'code' => $e->getCode(),
                ], $e->getStatusCode());
            }
        });
    })
    ->create();
```

### Legacy Structure (Upgraded from Laravel 10)

If `app/Http/Kernel.php` EXISTS, you're using the legacy structure:

- **This is perfectly fine** and recommended by Laravel
- **Follow existing Laravel 10 patterns** for consistency
- **No need to migrate** unless explicitly requested

## Laravel 12 Enhanced Features

### Advanced Model Casting

Laravel 12 enhances the `casts()` method with better type inference:

```php
class User extends Model
{
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'preferences' => 'collection:' . UserPreferences::class,
            'metadata' => AsEncryptedCollection::class,
            'settings' => AsArrayObject::class,
            'permissions' => 'array',
        ];
    }
}
```

### Enhanced Database Features

#### Improved Eager Loading Limits

```php
// Laravel 12 - Enhanced eager loading
$users = User::with([
    'posts' => fn($q) => $q->latest()->limit(5),
    'comments' => fn($q) => $q->where('approved', true)->latest()->limit(3),
])->get();

// Conditional eager loading with limits
$users = User::with([
    'posts' => function ($query) use ($includePublished) {
        $query->when($includePublished, fn($q) => $q->where('published', true))
              ->latest()
              ->limit(10);
    }
])->get();
```

#### Advanced Query Optimization

```php
// Laravel 12 - Optimized queries
$products = Product::query()
    ->select(['id', 'name', 'price'])
    ->with(['category:id,name', 'reviews' => fn($q) => $q->latest()->limit(5)])
    ->whereBelongsTo($currentUser, 'favorites')
    ->get();
```

### Enhanced Validation

```php
class UpdateProductRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'decimal:2', 'min:0'],
            'category_id' => ['required', 'exists:categories,id'],
            'tags' => ['array', 'max:10'],
            'tags.*' => ['string', 'max:50'],
            'attributes' => ['array'],
            'attributes.*.key' => ['required', 'string'],
            'attributes.*.value' => ['required'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($this->price > 10000) {
                    $validator->errors()->add('price', 'Price cannot exceed $10,000');
                }
            }
        ];
    }
}
```

### Enhanced Job Handling

```php
class ProcessLargeDataset implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $maxExceptions = 3;
    public int $timeout = 300;
    public int $backoff = 60;

    public function __construct(
        public Dataset $dataset,
        public array $options = []
    ) {}

    public function handle(DataProcessor $processor): void
    {
        $processor->process($this->dataset, $this->options);
    }

    public function retryUntil(): DateTime
    {
        return now()->addHours(2);
    }

    public function failed(?Throwable $exception): void
    {
        Log::error('Dataset processing failed', [
            'dataset_id' => $this->dataset->id,
            'error' => $exception?->getMessage(),
            'attempts' => $this->attempts(),
        ]);

        $this->dataset->markAsFailed($exception?->getMessage());
    }
}
```

### Enhanced Testing Features

```php
class ProductControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_product_with_validation(): void
    {
        $user = User::factory()->admin()->create();
        $category = Category::factory()->create();

        $productData = [
            'name' => 'Test Product',
            'price' => 99.99,
            'category_id' => $category->id,
            'tags' => ['electronics', 'gadget'],
        ];

        $response = $this->actingAs($user)
            ->postJson(route('products.store'), $productData);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'Test Product')
            ->assertJsonPath('data.price', 99.99)
            ->assertJsonStructure([
                'data' => [
                    'id', 'name', 'price', 'category', 'tags', 'created_at'
                ]
            ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Test Product',
            'price' => 9999, // Stored in cents
            'category_id' => $category->id,
        ]);
    }
}
```

### Enhanced Console Commands

```php
// app/Console/Commands/ProcessDataCommand.php
class ProcessDataCommand extends Command
{
    protected $signature = 'data:process
                           {--type= : Type of data to process}
                           {--batch=100 : Batch size}
                           {--async : Run asynchronously}';

    protected $description = 'Process application data with enhanced options';

    public function handle(): int
    {
        $this->components->info('Starting data processing...');

        $type = $this->option('type');
        $batchSize = (int) $this->option('batch');
        $async = $this->option('async');

        if ($async) {
            ProcessLargeDataset::dispatch($type, $batchSize);
            $this->components->task('Queued for processing', fn() => true);
        } else {
            $this->processData($type, $batchSize);
        }

        return Command::SUCCESS;
    }

    private function processData(string $type, int $batchSize): void
    {
        $this->withProgressBar(
            range(1, 10),
            fn() => sleep(1) // Simulate processing
        );

        $this->components->info('Processing completed successfully');
    }
}
```

## Performance Enhancements

### Advanced Caching

```php
class ProductService
{
    public function getFeaturedProducts(): Collection
    {
        return Cache::remember('featured-products', 3600, function () {
            return Product::with(['category', 'reviews' => fn($q) => $q->latest()->limit(3)])
                ->where('featured', true)
                ->latest()
                ->limit(10)
                ->get();
        });
    }

    public function clearProductCache(Product $product): void
    {
        Cache::forget("product.{$product->id}");
        Cache::tags(['products', 'featured'])->flush();
    }
}
```

### Database Optimization

```php
// Enhanced database operations in Laravel 12
class OrderRepository
{
    public function getOrdersWithDetails(User $user): Collection
    {
        return $user->orders()
            ->with([
                'items:id,order_id,product_id,quantity,price',
                'items.product:id,name,sku',
                'shipping:id,order_id,method,cost',
            ])
            ->latest()
            ->limit(50)
            ->get();
    }

    public function bulkUpdateStatus(array $orderIds, string $status): int
    {
        return Order::whereIn('id', $orderIds)
            ->update(['status' => $status, 'updated_at' => now()]);
    }
}
```

## Migration Notes

### From Laravel 11 to Laravel 12

1. **Enhanced features** are backward compatible
2. **Existing code** continues to work without changes
3. **Gradual adoption** of new features recommended
4. **Test thoroughly** before deploying new features

### Recommended Upgrades

```php
// Upgrade model casts to use enhanced features
protected function casts(): array
{
    return [
        'settings' => AsArrayObject::class,  // New in Laravel 12
        'metadata' => AsEncryptedCollection::class,  // Enhanced
        'preferences' => 'collection:' . UserPreferences::class,  // Improved
    ];
}
```

## Important Notes

1. **Structure detection** - Check for `app/Http/Kernel.php` to determine structure
2. **Backward compatibility** - All Laravel 11 features work in Laravel 12
3. **Enhanced performance** - New features offer better optimization
4. **Testing improvements** - Better assertion methods and helpers available

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

[//]: # (franken-ai:guidelines:end)