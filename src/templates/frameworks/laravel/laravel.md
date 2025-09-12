## Laravel Guidelines

*Based on [Laravel Boost](https://github.com/laravel/boost) guidelines*

### Development Workflow

**Use Artisan for file creation** - Pass `--no-interaction` to Artisan commands:
```bash
php artisan make:model Post --factory --seed --no-interaction
php artisan make:controller PostController --resource --no-interaction
php artisan make:request StorePostRequest --no-interaction
```

**Database Best Practices**
- Prefer Eloquent relationships over raw queries
- Use eager loading to prevent N+1 query problems
- Create factories and seeders with models

```php
// N+1 Problem Prevention
$posts = Post::with('user', 'comments')->get();

// Model with relationships
class Post extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }
}
```

**Form Requests & Validation**
Create dedicated Form Request classes with validation rules:
```php
class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->user()->can('create', Post::class);
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'published_at' => 'nullable|date',
        ];
    }
    
    public function messages(): array
    {
        return [
            'title.required' => 'A post title is required.',
            'content.required' => 'Post content cannot be empty.',
        ];
    }
}
```

**API Resources**
```php
class PostResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'content' => $this->content,
            'author' => new UserResource($this->whenLoaded('user')),
            'published_at' => $this->published_at?->format('Y-m-d'),
        ];
    }
}
```

**Additional Conventions**
- Use queued jobs for time-consuming operations
- Leverage built-in authentication/authorization features  
- Prefer named routes for URL generation
- Use environment variables only in configuration files
- Prioritize feature tests when writing tests

**Queue Usage**
```php
// Create job
php artisan make:job ProcessPodcast --no-interaction

// Dispatch job
ProcessPodcast::dispatch($podcast);
```