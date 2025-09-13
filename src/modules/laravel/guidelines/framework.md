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