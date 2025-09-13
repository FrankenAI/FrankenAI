# Laravel 11 Specific Guidelines

## Laravel 11 Structure Detection

Laravel 11 introduced a streamlined application structure. Your project may use either:

### New Laravel 11 Structure

If `app/Http/Kernel.php` does NOT exist, you're using the new structure:

- **No middleware directory** - Middleware are registered in `bootstrap/app.php`
- **No Kernel files** - Configuration is in `bootstrap/app.php`
- **Auto-registration** - Commands in `app/Console/Commands/` auto-register
- **Streamlined providers** - Listed in `bootstrap/providers.php`

```php
// bootstrap/app.php - New structure
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            CustomMiddleware::class,
        ]);

        $middleware->alias([
            'admin' => AdminMiddleware::class,
        ]);

        $middleware->priority([
            StartSession::class,
            ShareErrorsFromSession::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->report(function (CustomException $e) {
            // Custom reporting
        });
    })
    ->create();
```

### Upgraded Laravel 10 Structure

If `app/Http/Kernel.php` EXISTS, you upgraded from Laravel 10:

- **This is perfectly fine** - Laravel recommends keeping the old structure
- **Don't migrate** unless explicitly requested
- Follow Laravel 10 patterns for consistency

```php
// app/Http/Kernel.php - Old structure maintained
class Kernel extends HttpKernel
{
    protected $middleware = [
        // Global middleware
    ];

    protected $middlewareGroups = [
        'web' => [
            // Web middleware
        ],
    ];
}
```

## Laravel 11 New Features

### Model Casts Method

Use the `casts()` method instead of `$casts` property:

```php
class User extends Model
{
    // ❌ Old way (still works)
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // ✅ Laravel 11 way
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'preferences' => 'array',
            'is_admin' => 'boolean',
            'metadata' => AsCollection::class,
        ];
    }
}
```

### New Artisan Commands

Laravel 11 introduces new make commands:

```bash
# Create an Enum
php artisan make:enum UserRole --no-interaction

# Create a class
php artisan make:class Services/PaymentService --no-interaction

# Create an interface
php artisan make:interface Contracts/PaymentGateway --no-interaction
```

### Database Improvements

#### Limit Eager Loaded Records

Laravel 11 allows limiting eager loaded records natively:

```php
// ✅ Laravel 11 - Native support
$users = User::with(['posts' => function ($query) {
    $query->latest()->limit(5);
}])->get();

// Even simpler
$users = User::with('posts:id,title,user_id')->get();
```

#### Column Modification Warning

When modifying columns, include ALL attributes:

```php
// ❌ Bad - Loses attributes
Schema::table('users', function (Blueprint $table) {
    $table->string('email')->nullable()->change();
});

// ✅ Good - Preserves all attributes
Schema::table('users', function (Blueprint $table) {
    $table->string('email', 255)->nullable()->unique()->change();
});
```

### Rate Limiting

Configure rate limiting in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        ThrottleRequests::class.':api',
    ]);
})

// Or use RateLimiter
RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});
```

### Exception Handling

Modern exception handling in `bootstrap/app.php`:

```php
->withExceptions(function (Exceptions $exceptions) {
    $exceptions->report(function (ValidationException $e) {
        // Custom validation error reporting
    });

    $exceptions->render(function (NotFoundHttpException $e, Request $request) {
        if ($request->is('api/*')) {
            return response()->json([
                'message' => 'Resource not found.'
            ], 404);
        }
    });

    $exceptions->dontReport([
        TokenMismatchException::class,
    ]);
})
```

### Health Check

Laravel 11 includes built-in health check:

```php
// routes/web.php
Route::middleware('throttle:10,1')->group(function () {
    Route::get('/up', function () {
        Event::dispatch(new DiagnosingHealth);

        return response('OK', 200);
    });
});
```

### Once Method for Expensive Operations

Use the `once` function for memoization:

```php
class ExpensiveService
{
    public function calculate(): int
    {
        return once(function () {
            // Expensive operation only runs once per request
            return $this->performExpensiveCalculation();
        });
    }
}
```

### Graceful Encryption Key Rotation

Laravel 11 supports multiple encryption keys:

```env
APP_KEY=base64:new_key_here
APP_PREVIOUS_KEYS=base64:old_key_1,base64:old_key_2
```

### Improved Testing

#### Fluent Assertion Chains

```php
$response->assertOk()
    ->assertJson(['name' => 'Taylor'])
    ->assertJsonCount(5, 'data')
    ->assertJsonStructure(['data' => ['*' => ['id', 'name']]]);
```

#### Improved Factory Sequences

```php
User::factory()
    ->count(10)
    ->sequence(
        ['role' => 'admin'],
        ['role' => 'editor'],
        ['role' => 'viewer'],
    )
    ->create();
```

## Performance Optimizations

### Defer Loading of Service Providers

```php
// In service provider
public function boot(): void
{
    $this->publishes([
        __DIR__.'/../config/package.php' => config_path('package.php'),
    ], 'config');

    $this->loadMigrationsFrom(__DIR__.'/../database/migrations');

    // Defer loading of views until needed
    $this->callAfterResolving('view', function () {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'package');
    });
}
```

### Optimized Attribute Accessors

```php
class User extends Model
{
    // Laravel 11 - Attribute with caching
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn () => once(
                fn () => "{$this->first_name} {$this->last_name}"
            )
        );
    }
}
```

## Console Commands

### Auto-Registration

Commands in `app/Console/Commands/` automatically register:

```php
// app/Console/Commands/ProcessDataCommand.php
class ProcessDataCommand extends Command
{
    protected $signature = 'app:process-data {--queue}';
    protected $description = 'Process application data';

    public function handle(): int
    {
        // Automatically available as `php artisan app:process-data`
        return Command::SUCCESS;
    }
}
```

### Schedule in routes/console.php

```php
// routes/console.php
Schedule::command('app:process-data')->daily();
Schedule::job(new ProcessPayments)->hourly();
Schedule::call(function () {
    // Custom logic
})->everyMinute();
```

## Important Notes

1. **Check structure first** - Look for `app/Http/Kernel.php` to determine structure
2. **Follow existing patterns** - Don't mix structures
3. **Use new features** when beneficial but maintain consistency
4. **Test compatibility** when using Laravel 11 specific features