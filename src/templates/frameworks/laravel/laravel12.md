## Laravel 12 Guidelines

### Key Features & Best Practices (Released Feb 2025)

**New Starter Kits**
```bash
# Install with starter kits
composer create-project laravel/laravel my-app --prefer-dist --dev

# Choose from:
# - React + Inertia 2 + TypeScript + shadcn/ui
# - Vue + Inertia 2 + TypeScript + shadcn/ui  
# - Livewire + Flux UI + Volt
# - WorkOS AuthKit variants (SSO, passkeys, social auth)
```

**Asynchronous Caching**
```php
// Background cache operations (non-blocking)
Cache::async()->put('heavy-data', $expensiveOperation);
Cache::async()->remember('user-stats', 3600, fn() => $heavyComputation);

// Traditional blocking cache still available
Cache::put('immediate-data', $data);
```

**Enhanced Query Builder**
```php
// New nestedWhere() method
User::where('status', 'active')
    ->nestedWhere(function ($query) {
        $query->where('type', 'premium')
              ->orWhere('credits', '>', 100);
    })
    ->get();

// Stronger validation
validator($data, [
    'email' => 'required|email|secureValidate:email',
    'password' => 'required|secureValidate:password'
]);
```

**Domain-Driven Design Structure**
```
app/
├── Domain/
│   ├── User/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── Events/
│   └── Order/
│       ├── Models/
│       ├── Services/
│       └── ValueObjects/
├── Application/
│   ├── Controllers/
│   └── Middleware/
└── Infrastructure/
    ├── Persistence/
    └── External/
```

**Native Health Checks**
```php
// bootstrap/app.php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    health: '/health' // Built-in health endpoint
)

// Custom health checks
use Illuminate\Support\Facades\Health;

Health::checks([
    Health::check('Database', fn() => DB::connection()->getPdo()),
    Health::check('Redis', fn() => Redis::ping()),
    Health::check('Queue', fn() => Queue::size() < 1000),
]);
```

**Enhanced Job Batching**
```php
Bus::batch([
    new ProcessOrder($order1),
    new ProcessOrder($order2),
    new ProcessOrder($order3),
])
->then(function (Batch $batch) {
    // All jobs completed successfully
    Log::info('Batch completed', ['batch_id' => $batch->id]);
})
->catch(function (Batch $batch, Throwable $e) {
    // First job failure
    Log::error('Batch failed', ['error' => $e->getMessage()]);
})
->finally(function (Batch $batch) {
    // Batch finished (success or failure)
    Cache::forget('processing-batch-' . $batch->id);
})
->dispatch();
```

**Route Attributes Support**
```php
#[Route('/users', methods: ['GET'])]
#[Middleware('auth')]
class UserController extends Controller
{
    #[Route('/{id}', methods: ['GET'], where: ['id' => '[0-9]+'])]
    public function show(User $user): JsonResponse
    {
        return response()->json(new UserResource($user));
    }
}
```

### Zero Breaking Changes
- First major Laravel version with zero breaking changes
- Most Laravel 11 applications can upgrade without code changes
- Symfony 7 components (faster, less memory usage)
- PHP 8.1+ required (PHP 8.3+ recommended for JIT compilation)

### Laravel Boost Integration
- Built-in AI assistant for development
- Versioned documentation
- Laravel-curated AI rules and templates