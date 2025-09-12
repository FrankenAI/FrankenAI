## Laravel 10 Guidelines

### Key Features & Best Practices

**Artisan Commands**
```bash
# Project setup
php artisan install:api          # Setup API routes and middleware
php artisan install:broadcasting # Setup broadcasting

# Development
php artisan serve               # Development server
php artisan tinker             # REPL environment
php artisan route:list         # List all routes
php artisan config:cache       # Cache configuration

# Database
php artisan migrate            # Run migrations
php artisan migrate:fresh --seed # Fresh migration with seeds
php artisan db:seed           # Run seeders

# Queue & Jobs
php artisan queue:work        # Process queued jobs
php artisan queue:failed      # List failed jobs
```

**Process Interaction**
```php
use Illuminate\Support\Facades\Process;

$result = Process::run('ls -la');
echo $result->output();

// Asynchronous processes
Process::pool(fn ($pool) => [
    $pool->command('php artisan migrate'),
    $pool->command('php artisan queue:work'),
])->start();
```

**Modern Eloquent Patterns**
```php
class User extends Model
{
    protected $fillable = ['name', 'email'];
    
    protected $casts = [
        'settings' => 'collection',
        'is_admin' => 'boolean',
        'email_verified_at' => 'datetime',
    ];
    
    // Relationship
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
    
    // Scope
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }
}
```

**API Resources & Validation**
```php
// Form Request
class CreateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', 'min:8', 'confirmed'],
        ];
    }
}

// API Resource
class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'created_at' => $this->created_at,
        ];
    }
}
```

### Project Structure
```
app/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   └── Requests/
├── Models/
├── Services/       # Business logic
└── Jobs/          # Queue jobs

config/            # Configuration files
database/
├── migrations/
├── seeders/
└── factories/

resources/
├── views/         # Blade templates
└── js/           # Frontend assets

routes/
├── web.php       # Web routes
├── api.php       # API routes
└── console.php   # Artisan commands
```