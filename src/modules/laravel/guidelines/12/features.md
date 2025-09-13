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