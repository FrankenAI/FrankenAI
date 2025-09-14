# Livewire Guidelines

## Livewire Core

- Use the `search-docs` tool to find exact version specific documentation for how to write Livewire & Livewire tests.
- Use the `php artisan make:livewire [Posts\\CreatePost]` artisan command to create new components
- State should live on the server, with the UI reflecting it.
- All Livewire requests hit the Laravel backend, they're like regular HTTP requests. Always validate form data, and run authorization checks in Livewire actions.

## Livewire Best Practices

- Livewire components require a single root element.
- Use `wire:loading` and `wire:dirty` for delightful loading states.
- Add `wire:key` in loops:

```blade
@foreach ($items as $item)
    <div wire:key="item-{{ $item->id }}">
        {{ $item->name }}
    </div>
@endforeach
```

- Prefer lifecycle hooks like `mount()`, `updatedFoo()`) for initialization and reactive side effects:

```php
public function mount(User $user) {
    $this->user = $user;
}

public function updatedSearch() {
    $this->resetPage();
}
```

## Testing Livewire

```php
// Example Livewire component test
Livewire::test(Counter::class)
    ->assertSet('count', 0)
    ->call('increment')
    ->assertSet('count', 1)
    ->assertSee(1)
    ->assertStatus(200);
```

```php
// Testing a Livewire component exists within a page
$this->get('/posts')
    ->assertSeeLivewire('posts.index');
```

## Component Structure

### PHP Component Class
```php
<?php

namespace App\Http\Livewire;

use Livewire\Component;
use Livewire\WithPagination;

class PostIndex extends Component
{
    use WithPagination;

    public $search = '';
    public $perPage = 10;

    protected $queryString = [
        'search' => ['except' => ''],
        'page' => ['except' => 1]
    ];

    public function updatedSearch()
    {
        $this->resetPage();
    }

    public function render()
    {
        return view('livewire.post-index', [
            'posts' => Post::where('title', 'like', '%' . $this->search . '%')
                ->paginate($this->perPage)
        ]);
    }
}
```

### Blade View Template
```blade
<div>
    <div class="mb-4">
        <input
            wire:model.live="search"
            type="text"
            placeholder="Search posts..."
            class="form-control"
        >
    </div>

    <div wire:loading class="text-muted">
        Searching...
    </div>

    @foreach($posts as $post)
        <div wire:key="post-{{ $post->id }}" class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">{{ $post->title }}</h5>
                <p class="card-text">{{ $post->excerpt }}</p>
            </div>
        </div>
    @endforeach

    {{ $posts->links() }}
</div>
```

## Livewire Directives

### Data Binding
- `wire:model` - Two-way data binding
- `wire:model.live` - Real-time binding
- `wire:model.lazy` - Bind on blur/change
- `wire:model.defer` - Defer until form submission

### Event Handling
- `wire:click` - Handle click events
- `wire:submit.prevent` - Handle form submissions
- `wire:keydown.enter` - Handle keyboard events

### Loading States
- `wire:loading` - Show during requests
- `wire:loading.remove` - Hide during requests
- `wire:target="methodName"` - Target specific methods

```blade
<button wire:click="save" wire:loading.attr="disabled">
    <span wire:loading.remove wire:target="save">Save</span>
    <span wire:loading wire:target="save">Saving...</span>
</button>
```

### Conditional Rendering
- `wire:if` - Conditional rendering (deprecated, use @if)
- Use Blade conditionals instead of wire:if

## Forms and Validation

### Form Handling
```php
class ContactForm extends Component
{
    public $name = '';
    public $email = '';
    public $message = '';

    protected $rules = [
        'name' => 'required|min:2',
        'email' => 'required|email',
        'message' => 'required|min:10',
    ];

    public function submit()
    {
        $this->validate();

        // Process form
        Contact::create([
            'name' => $this->name,
            'email' => $this->email,
            'message' => $this->message,
        ]);

        session()->flash('message', 'Message sent successfully!');

        $this->reset();
    }
}
```

```blade
<form wire:submit.prevent="submit">
    @if (session()->has('message'))
        <div class="alert alert-success">
            {{ session('message') }}
        </div>
    @endif

    <div class="form-group">
        <label for="name">Name</label>
        <input wire:model="name" type="text" class="form-control @error('name') is-invalid @enderror">
        @error('name') <span class="invalid-feedback">{{ $message }}</span> @enderror
    </div>

    <div class="form-group">
        <label for="email">Email</label>
        <input wire:model="email" type="email" class="form-control @error('email') is-invalid @enderror">
        @error('email') <span class="invalid-feedback">{{ $message }}</span> @enderror
    </div>

    <div class="form-group">
        <label for="message">Message</label>
        <textarea wire:model="message" class="form-control @error('message') is-invalid @enderror"></textarea>
        @error('message') <span class="invalid-feedback">{{ $message }}</span> @enderror
    </div>

    <button type="submit" class="btn btn-primary" wire:loading.attr="disabled">
        Send Message
    </button>
</form>
```

## Events and Communication

### Emitting Events
```php
// Emit event from component
$this->emit('postCreated', $post->id);

// Emit to specific component
$this->emitTo('post-counter', 'postAdded');

// Emit browser event
$this->emitTo('browser', 'showAlert', 'Post saved!');
```

### Listening to Events
```php
protected $listeners = [
    'postCreated' => 'refreshPosts',
    'postDeleted' => 'handlePostDeleted'
];

public function handlePostDeleted($postId)
{
    // Handle the event
}
```

## File Uploads

```php
class FileUpload extends Component
{
    use WithFileUploads;

    public $photo;

    protected $rules = [
        'photo' => 'image|max:1024', // 1MB Max
    ];

    public function save()
    {
        $this->validate();

        $this->photo->store('photos');
    }
}
```

```blade
<form wire:submit.prevent="save">
    <input type="file" wire:model="photo">

    @error('photo') <span class="error">{{ $message }}</span> @enderror

    @if ($photo)
        <img src="{{ $photo->temporaryUrl() }}" width="200">
    @endif

    <button type="submit">Save Photo</button>
</form>
```

## Performance Optimization

### Lazy Loading
```blade
<div wire:init="loadPosts">
    @if (empty($posts))
        <div>Loading posts...</div>
    @else
        @foreach($posts as $post)
            <!-- Post content -->
        @endforeach
    @endif
</div>
```

### Pagination
```php
use Livewire\WithPagination;

class PostList extends Component
{
    use WithPagination;

    protected $paginationTheme = 'bootstrap';

    public function render()
    {
        return view('livewire.post-list', [
            'posts' => Post::paginate(10)
        ]);
    }
}
```

## Security Best Practices

- Always validate input data
- Use Laravel's authorization gates and policies
- Sanitize data before displaying
- Be cautious with mass assignment

```php
public function updatePost()
{
    $this->authorize('update', $this->post);

    $this->validate([
        'title' => 'required|max:255',
        'content' => 'required'
    ]);

    $this->post->update([
        'title' => $this->title,
        'content' => $this->content
    ]);
}
```