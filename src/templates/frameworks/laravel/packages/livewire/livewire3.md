## Livewire 3 Guidelines

*Based on [Laravel Boost](https://github.com/laravel/boost) security-focused approach*

### Security First Approach

**State should live on the server** - Keep sensitive data server-side:
```php
class UserProfile extends Component
{
    public User $user;
    
    #[Validate('required|email')]
    public string $email = '';
    
    public function mount(User $user)
    {
        $this->authorize('update', $user);
        $this->user = $user;
        $this->email = $user->email;
    }
    
    public function updateEmail()
    {
        $this->authorize('update', $this->user);
        $this->validate();
        
        $this->user->update(['email' => $this->email]);
        $this->dispatch('profile-updated');
    }
}
```

**Always validate and authorize**:
```php
class DeletePost extends Component
{
    public Post $post;
    
    public function delete()
    {
        $this->authorize('delete', $this->post);
        
        $this->post->delete();
        return redirect()->route('posts.index');
    }
}
```

### Modern Livewire 3 Patterns

**Use Attributes for validation**:
```php
class CreatePost extends Component
{
    #[Validate('required|max:255')]
    public string $title = '';
    
    #[Validate('required')]
    public string $content = '';
    
    public function save()
    {
        $this->validate();
        $this->authorize('create', Post::class);
        
        Post::create($this->only('title', 'content') + ['user_id' => auth()->id()]);
        $this->dispatch('post-created');
    }
}
```

**Form Objects for complex forms**:
```php
use Livewire\Form;

class PostForm extends Form
{
    #[Validate('required|max:255')]
    public string $title = '';
    
    #[Validate('required')]
    public string $content = '';
    
    public function store()
    {
        $this->validate();
        return Post::create($this->all() + ['user_id' => auth()->id()]);
    }
}
```

**Real-time validation with wire:model.live**:
```html
<input wire:model.live="email" type="email" />
@error('email') <span class="text-red-500">{{ $message }}</span> @enderror
```

### Performance Patterns

**Lazy loading for heavy components**:
```php
class ExpensiveReport extends Component
{
    public function placeholder()
    {
        return view('components.skeleton');
    }
    
    public function render()
    {
        return view('reports.expensive', [
            'data' => $this->generateReport()
        ]);
    }
}
```

**Optimize with wire:key for collections**:
```html
@foreach($posts as $post)
    <livewire:post-item :post="$post" wire:key="post-{{ $post->id }}" />
@endforeach
```

### Migration from v2
- `$this->emit()` → `$this->dispatch()`
- `wire:model.defer` → `wire:model.blur`
- `$listeners` → `#[On('event')]` attribute