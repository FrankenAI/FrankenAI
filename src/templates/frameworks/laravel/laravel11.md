## Laravel 11 Guidelines

*Based on [Laravel Boost](https://github.com/laravel/boost) guidelines*

### File Structure Changes

**New Configuration Location**
- Use `bootstrap/app.php` for middleware, exception, and routing registration
- Service providers go in `bootstrap/providers.php`
- Console commands auto-register from `app/Console/Commands/`
- **No more:** `app/Http/Middleware/` or `app/Console/Kernel.php`

```php
// bootstrap/app.php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: ['webhooks/*']);
    })
    ->create();
```

### Database Improvements

**Migration Column Modifications**
When modifying columns, include all previous column attributes:
```php
Schema::table('users', function (Blueprint $table) {
    $table->string('email')->unique()->nullable(false)->change();
});
```

**Enhanced Eager Loading**
Native support for limiting eagerly loaded records:
```php
$users = User::with([
    'posts' => function ($query) {
        $query->latest()->limit(10);
    }
])->get();
```

### Model Enhancements

**New Casts Method**
Consider using `casts()` method instead of `$casts` property:
```php
class Post extends Model
{
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'meta' => 'collection',
            'status' => PostStatus::class,
        ];
    }
}
```

### New Artisan Commands

```bash
php artisan make:enum PostStatus --no-interaction
php artisan make:class UserService --no-interaction  
php artisan make:interface PaymentGateway --no-interaction
```

### Migration Strategy

**For Upgraded Projects:**
It's "perfectly fine" to maintain the existing Laravel 10 file structure if your project was upgraded from Laravel 10.

**For New Projects:**
Use the streamlined Laravel 11 structure for better organization.

### Follow Existing Conventions
Always check and follow existing patterns from other models and controllers in the application.