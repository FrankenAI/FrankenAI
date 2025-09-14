# Laravel Pennant - Feature Flags Guidelines

*Based on Laravel Boost methodology - Feature flag management for Laravel applications*

## Laravel Pennant Overview

Laravel Pennant provides a flexible feature flag system for controlling feature availability across different users, organizations, and contexts. It enables safe feature rollouts, A/B testing, and gradual deployment strategies.

### Core Concepts
- **Feature flags** - Boolean toggles for enabling/disabling features
- **Context-aware** - Flags can be scoped to users, teams, or any model
- **Storage flexibility** - Database or cache-based storage options
- **Runtime control** - Toggle features without code deployments

## Basic Setup and Configuration

### Installation and Configuration
```bash
# Install Pennant
composer require laravel/pennant

# Publish and run migrations
php artisan vendor:publish --provider="Laravel\Pennant\PennantServiceProvider"
php artisan migrate
```

### Configuration (config/pennant.php)
```php
return [
    'default' => env('PENNANT_STORE', 'database'),

    'stores' => [
        'database' => [
            'driver' => 'database',
            'connection' => null,
        ],

        'cache' => [
            'driver' => 'cache',
            'store' => null,
        ],

        'array' => [
            'driver' => 'array',
        ],
    ],

    'cache' => [
        'store' => null,
        'prefix' => 'pennant',
        'ttl' => 3600,
    ],
];
```

## Feature Flag Definition

### Basic Feature Definition
```php
// In a Service Provider (e.g., AppServiceProvider)
use Laravel\Pennant\Feature;

public function boot(): void
{
    Feature::define('new-dashboard', function () {
        return auth()->user()?->isAdmin() ?? false;
    });

    Feature::define('beta-features', function (User $user) {
        return $user->hasRole('beta-tester');
    });

    Feature::define('premium-features', function (User $user) {
        return $user->subscription?->isPremium() ?? false;
    });
}
```

### Advanced Feature Definitions
```php
use Laravel\Pennant\Feature;

Feature::define('api-v2', function (User $user) {
    // Gradual rollout - 25% of users
    return hash('sha256', 'api-v2'.$user->id) % 100 < 25;
});

Feature::define('team-collaboration', function (?User $user, ?Team $team) {
    if (!$user || !$team) {
        return false;
    }

    return $team->plan === 'pro' && $user->isTeamMember($team);
});

// Time-based features
Feature::define('holiday-theme', function () {
    return now()->between(
        now()->startOfYear()->addDays(354), // Dec 20
        now()->startOfYear()->addDays(365)  // Dec 31
    );
});

// Percentage rollout with consistent user experience
Feature::define('new-editor', function (User $user) {
    return (crc32($user->email) % 100) < 50; // 50% rollout
});
```

## Using Feature Flags

### Basic Usage in Controllers
```php
use Laravel\Pennant\Facades\Feature;

class DashboardController extends Controller
{
    public function index()
    {
        if (Feature::active('new-dashboard')) {
            return view('dashboard.new');
        }

        return view('dashboard.legacy');
    }

    public function api()
    {
        $user = auth()->user();

        if (Feature::for($user)->active('api-v2')) {
            return response()->json(['version' => 'v2', 'data' => $this->getV2Data()]);
        }

        return response()->json(['version' => 'v1', 'data' => $this->getV1Data()]);
    }
}
```

### Blade Template Usage
```blade
{{-- Simple feature check --}}
@feature('new-dashboard')
    <div class="new-dashboard-widget">
        <h2>Enhanced Dashboard</h2>
        {{-- New dashboard content --}}
    </div>
@else
    <div class="legacy-dashboard">
        <h2>Dashboard</h2>
        {{-- Legacy dashboard content --}}
    </div>
@endfeature

{{-- User-specific features --}}
@feature('premium-features', auth()->user())
    <div class="premium-section">
        <h3>Premium Features</h3>
        <p>Access to advanced analytics and reporting.</p>
    </div>
@endfeature

{{-- Team-based features --}}
@if(Feature::for(auth()->user(), $team)->active('team-collaboration'))
    <div class="collaboration-tools">
        <button>Start Collaboration Session</button>
        <button>Share Workspace</button>
    </div>
@endif
```

### Service and Model Integration
```php
class UserService
{
    public function getRecommendations(User $user)
    {
        if (Feature::for($user)->active('ai-recommendations')) {
            return $this->getAIRecommendations($user);
        }

        return $this->getBasicRecommendations($user);
    }

    public function processPayment(User $user, $amount)
    {
        if (Feature::for($user)->active('new-payment-gateway')) {
            return $this->processWithNewGateway($amount);
        }

        return $this->processWithLegacyGateway($amount);
    }
}

// In your User model
class User extends Model
{
    public function canAccessFeature(string $feature): bool
    {
        return Feature::for($this)->active($feature);
    }

    public function hasAdvancedFeatures(): bool
    {
        return $this->canAccessFeature('advanced-analytics') ||
               $this->canAccessFeature('premium-reports');
    }
}
```

## Dynamic Feature Management

### Runtime Feature Control
```php
use Laravel\Pennant\Facades\Feature;

class FeatureController extends Controller
{
    public function toggle(Request $request)
    {
        $user = $request->user();
        $feature = $request->input('feature');

        if (Feature::for($user)->active($feature)) {
            Feature::for($user)->deactivate($feature);
            $message = "Feature '{$feature}' disabled";
        } else {
            Feature::for($user)->activate($feature);
            $message = "Feature '{$feature}' enabled";
        }

        return response()->json(['message' => $message]);
    }

    public function bulkUpdate(Request $request)
    {
        $user = $request->user();
        $features = $request->input('features', []);

        foreach ($features as $feature => $enabled) {
            if ($enabled) {
                Feature::for($user)->activate($feature);
            } else {
                Feature::for($user)->deactivate($feature);
            }
        }

        return redirect()->back()->with('success', 'Features updated successfully');
    }
}
```

### Admin Feature Management
```blade
{{-- Admin feature toggle interface --}}
<div class="feature-management">
    <h2>Feature Flag Management</h2>

    @foreach($availableFeatures as $featureKey => $featureName)
        <div class="feature-toggle">
            <label>
                <input
                    type="checkbox"
                    wire:model="features.{{ $featureKey }}"
                    wire:change="toggleFeature('{{ $featureKey }}')"
                    @if(Feature::for($selectedUser)->active($featureKey)) checked @endif
                >
                {{ $featureName }}
            </label>
            <span class="text-sm text-gray-500">
                {{ $featureDescriptions[$featureKey] ?? '' }}
            </span>
        </div>
    @endforeach
</div>
```

## Advanced Patterns

### Conditional Service Registration
```php
// In a Service Provider
public function register(): void
{
    if (Feature::active('new-payment-service')) {
        $this->app->singleton(PaymentService::class, NewPaymentService::class);
    } else {
        $this->app->singleton(PaymentService::class, LegacyPaymentService::class);
    }
}

public function boot(): void
{
    if (Feature::active('enhanced-logging')) {
        Log::listen(function ($message) {
            // Enhanced logging implementation
        });
    }
}
```

### Feature Flag Middleware
```php
class RequireFeatureMiddleware
{
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        if (!Feature::for($request->user())->active($feature)) {
            abort(404); // Or redirect to appropriate page
        }

        return $next($request);
    }
}

// In routes/web.php
Route::middleware(['auth', 'feature:new-dashboard'])->group(function () {
    Route::get('/dashboard/v2', [DashboardController::class, 'newDashboard']);
    Route::get('/analytics/advanced', [AnalyticsController::class, 'advanced']);
});
```

### A/B Testing Implementation
```php
Feature::define('checkout-flow-v2', function (User $user) {
    // Split users into two groups based on user ID
    return $user->id % 2 === 0;
});

class CheckoutController extends Controller
{
    public function show()
    {
        $user = auth()->user();

        if (Feature::for($user)->active('checkout-flow-v2')) {
            // Track A/B test group
            Analytics::track('checkout_variant_viewed', [
                'user_id' => $user->id,
                'variant' => 'v2'
            ]);

            return view('checkout.v2');
        }

        Analytics::track('checkout_variant_viewed', [
            'user_id' => $user->id,
            'variant' => 'v1'
        ]);

        return view('checkout.v1');
    }
}
```

## Testing with Feature Flags

### Feature Flag Testing
```php
use Laravel\Pennant\Facades\Feature;

class FeatureTest extends TestCase
{
    public function test_new_dashboard_for_admin()
    {
        $admin = User::factory()->admin()->create();

        Feature::for($admin)->activate('new-dashboard');

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertSee('Enhanced Dashboard');
    }

    public function test_legacy_dashboard_for_regular_user()
    {
        $user = User::factory()->create();

        Feature::for($user)->deactivate('new-dashboard');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertSee('Dashboard');
        $response->assertDontSee('Enhanced Dashboard');
    }

    public function test_premium_features_require_subscription()
    {
        $user = User::factory()->withPremiumSubscription()->create();

        $this->assertTrue(Feature::for($user)->active('premium-features'));

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertSee('Premium Features');
    }
}
```

### Test Setup Helpers
```php
// In tests/TestCase.php
protected function enableFeature(string $feature, $scope = null): void
{
    Feature::for($scope)->activate($feature);
}

protected function disableFeature(string $feature, $scope = null): void
{
    Feature::for($scope)->deactivate($feature);
}

protected function withFeatures(array $features, $scope = null): void
{
    foreach ($features as $feature => $enabled) {
        if ($enabled) {
            $this->enableFeature($feature, $scope);
        } else {
            $this->disableFeature($feature, $scope);
        }
    }
}

// Usage in tests
public function test_api_v2_response()
{
    $user = User::factory()->create();

    $this->enableFeature('api-v2', $user);

    $response = $this->actingAs($user)->get('/api/data');

    $response->assertJson(['version' => 'v2']);
}
```

## Management Commands

### Pennant Artisan Commands
```bash
# Clear all feature flag cache
php artisan pennant:clear

# Clear specific feature cache
php artisan pennant:clear --feature=new-dashboard

# Clear for specific scope
php artisan pennant:clear --scope="App\Models\User:1"

# Purge stale feature flags
php artisan pennant:purge

# List all defined features
php artisan pennant:features
```

### Custom Management Commands
```php
class FeatureRolloutCommand extends Command
{
    protected $signature = 'features:rollout {feature} {percentage}';
    protected $description = 'Gradually roll out a feature to a percentage of users';

    public function handle(): void
    {
        $feature = $this->argument('feature');
        $percentage = (int) $this->argument('percentage');

        $users = User::all();
        $enabledCount = 0;

        foreach ($users as $user) {
            if ((crc32($user->email) % 100) < $percentage) {
                Feature::for($user)->activate($feature);
                $enabledCount++;
            } else {
                Feature::for($user)->deactivate($feature);
            }
        }

        $this->info("Feature '{$feature}' enabled for {$enabledCount}/{$users->count()} users ({$percentage}%)");
    }
}
```

## Best Practices

### Feature Flag Naming
```php
// Good - descriptive and consistent
Feature::define('new-user-onboarding', $resolver);
Feature::define('enhanced-search-v2', $resolver);
Feature::define('premium-analytics-dashboard', $resolver);

// Bad - vague or inconsistent
Feature::define('flag1', $resolver);
Feature::define('newFeature', $resolver);
Feature::define('TEMP_FIX', $resolver);
```

### Performance Considerations
```php
// Cache feature flags for better performance
public function expensiveOperation(User $user)
{
    $useNewAlgorithm = cache()->remember(
        "feature-flag:{$user->id}:new-algorithm",
        3600,
        fn() => Feature::for($user)->active('new-algorithm')
    );

    if ($useNewAlgorithm) {
        return $this->newAlgorithm();
    }

    return $this->legacyAlgorithm();
}
```

### Feature Flag Cleanup
```php
// Document feature flags with removal dates
Feature::define('legacy-support', function () {
    // TODO: Remove after 2024-06-01 when all users migrated
    return false;
});

// Use configuration for temporary flags
Feature::define('maintenance-mode', function () {
    return config('app.maintenance_mode', false);
});
```

### Security Considerations
- **Validate scope** - Ensure users can only toggle appropriate features
- **Audit trails** - Log feature flag changes for security auditing
- **Access control** - Restrict admin feature management to authorized users
- **Sensitive features** - Use additional authentication for critical features