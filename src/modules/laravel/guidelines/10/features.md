# Laravel 10 Specific Guidelines

## Laravel 10 Structure

Laravel 10 uses the traditional structure that many projects still maintain:

### Directory Structure

- **Middleware** typically live in `app/Http/Middleware/`
- **Service providers** in `app/Providers/`
- **NO `bootstrap/app.php`** application configuration

### Configuration Files

Laravel 10 uses separate kernel files for configuration:

- **Middleware registration** is in `app/Http/Kernel.php`
- **Exception handling** is in `app/Exceptions/Handler.php`
- **Console commands and schedule registration** is in `app/Console/Kernel.php`
- **Rate limits** likely exist in `RouteServiceProvider` or `app/Http/Kernel.php`

### Middleware Registration

```php
// app/Http/Kernel.php
class Kernel extends HttpKernel
{
    protected $middleware = [
        // Global middleware
        \App\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
    ];

    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Session\Middleware\StartSession::class,
        ],
        'api' => [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
            'throttle:api',
        ],
    ];

    protected $middlewareAliases = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'admin' => \App\Http\Middleware\AdminMiddleware::class,
    ];
}
```

### Exception Handling

```php
// app/Exceptions/Handler.php
class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }
}
```

### Console Commands

```php
// app/Console/Kernel.php
class Kernel extends ConsoleKernel
{
    protected $commands = [
        Commands\ProcessDataCommand::class,
    ];

    protected function schedule(Schedule $schedule): void
    {
        $schedule->command('data:process')->daily();
    }
}
```

## Model Casts

**Important**: In Laravel 10, you must use the `$casts` property, NOT the `casts()` method:

```php
class User extends Model
{
    // ✅ Laravel 10 - Use $casts property
    protected $casts = [
        'email_verified_at' => 'datetime',
        'preferences' => 'array',
        'is_admin' => 'boolean',
    ];

    // ❌ Laravel 10 - casts() method not available
    // protected function casts(): array { ... }
}
```

## Route Service Provider

```php
// app/Providers/RouteServiceProvider.php
class RouteServiceProvider extends ServiceProvider
{
    public const HOME = '/home';

    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }
}
```

## Testing Differences

Laravel 10 testing patterns:

```php
class PostTest extends TestCase
{
    use RefreshDatabase;

    // Laravel 10 - Standard assertions
    public function test_user_can_create_post(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->post(route('posts.store'), [
                'title' => 'Test Post',
                'content' => 'Test content',
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('posts', [
            'title' => 'Test Post',
        ]);
    }
}
```

## Artisan Commands

Laravel 10 command creation:

```bash
# Standard commands available in Laravel 10
php artisan make:model Post --factory --seed --migration
php artisan make:controller PostController --resource
php artisan make:request StorePostRequest

# Note: make:enum and make:class not available in Laravel 10
```

## Migration to Laravel 11

If you're planning to upgrade to Laravel 11:

1. **Keep existing structure** - Laravel 11 supports the Laravel 10 structure
2. **Don't rush migration** - The old structure is perfectly fine
3. **Test thoroughly** before adopting new Laravel 11 features
4. **Consider gradual adoption** of new patterns

## Performance Considerations

Laravel 10 specific optimizations:

```php
// Eager loading relationships
$posts = Post::with(['user:id,name', 'tags:id,name'])->get();

// Query optimization
$users = User::select(['id', 'name', 'email'])
    ->where('active', true)
    ->limit(100)
    ->get();
```

## Important Notes

1. **Stick to Laravel 10 patterns** if you're not upgrading
2. **Use documentation** specific to Laravel 10 for features
3. **Avoid Laravel 11 specific features** until you upgrade
4. **Test middleware thoroughly** in the Kernel-based system