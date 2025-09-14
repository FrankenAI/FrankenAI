# SolidJS - Component Guidelines

*Based on Laravel Boost methodology - Reactive JavaScript framework with fine-grained reactivity*

## SolidJS Overview

SolidJS is a declarative JavaScript framework for building user interfaces with fine-grained reactivity. It compiles away the framework at build time, resulting in highly optimized vanilla JavaScript.

### Core Concepts
- **Fine-grained reactivity** - Updates only what needs to change
- **No Virtual DOM** - Direct DOM updates for better performance
- **Compile-time optimizations** - Framework compiles away
- **JSX-based** - Familiar syntax with reactive enhancements

## Basic Component Usage

### Function Components
```tsx
import { createSignal } from 'solid-js';

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)}>
        Increment
      </button>
    </div>
  );
}

export default Counter;
```

### Props and Children
```tsx
interface UserCardProps {
  name: string;
  email: string;
  children?: any;
}

function UserCard(props: UserCardProps) {
  return (
    <div class="card">
      <h3>{props.name}</h3>
      <p>{props.email}</p>
      <div class="actions">
        {props.children}
      </div>
    </div>
  );
}

// Usage
<UserCard name="John Doe" email="john@example.com">
  <button>Edit</button>
  <button>Delete</button>
</UserCard>
```

## Reactivity System

### Signals (State Management)
```tsx
import { createSignal, createEffect } from 'solid-js';

function TodoApp() {
  const [todos, setTodos] = createSignal([]);
  const [newTodo, setNewTodo] = createSignal('');

  // Derived state
  const completedCount = () => todos().filter(todo => todo.completed).length;

  // Side effects
  createEffect(() => {
    console.log(`${completedCount()} todos completed`);
  });

  const addTodo = () => {
    if (newTodo().trim()) {
      setTodos([...todos(), {
        id: Date.now(),
        text: newTodo(),
        completed: false
      }]);
      setNewTodo('');
    }
  };

  return (
    <div>
      <h1>Todos ({completedCount()}/{todos().length})</h1>
      <input
        value={newTodo()}
        onInput={(e) => setNewTodo(e.target.value)}
        placeholder="Add todo..."
      />
      <button onClick={addTodo}>Add</button>
    </div>
  );
}
```

### Stores (Complex State)
```tsx
import { createStore } from 'solid-js/store';

function UserProfile() {
  const [user, setUser] = createStore({
    profile: {
      name: '',
      email: '',
      preferences: {
        theme: 'light',
        notifications: true
      }
    }
  });

  const updateProfile = (field: string, value: any) => {
    setUser('profile', field, value);
  };

  const toggleTheme = () => {
    setUser('profile', 'preferences', 'theme',
      theme => theme === 'light' ? 'dark' : 'light'
    );
  };

  return (
    <div>
      <input
        value={user.profile.name}
        onInput={(e) => updateProfile('name', e.target.value)}
      />
      <p>Theme: {user.profile.preferences.theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## Control Flow Components

### Conditional Rendering
```tsx
import { Show, Match, Switch } from 'solid-js';

function UserDashboard() {
  const [user, setUser] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [userType, setUserType] = createSignal('guest');

  return (
    <div>
      <Show when={!loading()} fallback={<div>Loading...</div>}>
        <Show when={user()} fallback={<div>Please log in</div>}>
          <h1>Welcome, {user()?.name}</h1>

          <Switch>
            <Match when={userType() === 'admin'}>
              <AdminPanel />
            </Match>
            <Match when={userType() === 'moderator'}>
              <ModeratorPanel />
            </Match>
            <Match when={userType() === 'user'}>
              <UserPanel />
            </Match>
          </Switch>
        </Show>
      </Show>
    </div>
  );
}
```

### Lists and Iteration
```tsx
import { For, Index } from 'solid-js';

function ProductList() {
  const [products, setProducts] = createSignal([
    { id: 1, name: 'Laptop', price: 999 },
    { id: 2, name: 'Phone', price: 699 },
    { id: 3, name: 'Tablet', price: 399 }
  ]);

  return (
    <div>
      {/* For: Keyed by reference (efficient for dynamic lists) */}
      <For each={products()}>
        {(product) => (
          <div class="product">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        )}
      </For>

      {/* Index: Keyed by index (efficient for static lists) */}
      <Index each={products()}>
        {(product, index) => (
          <div class="product-item">
            {index() + 1}. {product().name}
          </div>
        )}
      </Index>
    </div>
  );
}
```

## Event Handling and Forms

### Event Handling
```tsx
function InteractiveForm() {
  const [formData, setFormData] = createStore({
    name: '',
    email: '',
    preferences: []
  });

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handlePreferenceChange = (preference: string, checked: boolean) => {
    setFormData('preferences', prev =>
      checked
        ? [...prev, preference]
        : prev.filter(p => p !== preference)
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onInput={(e) => setFormData('name', e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onInput={(e) => setFormData('email', e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={formData.preferences.includes('newsletter')}
          onChange={(e) => handlePreferenceChange('newsletter', e.target.checked)}
        />
        Subscribe to newsletter
      </label>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Best Practices

### Performance Optimization
- Use signals for primitive values
- Use stores for complex nested objects
- Avoid creating signals in render functions
- Use `For` and `Index` appropriately for lists

### Component Design
- Keep components small and focused
- Use TypeScript for better development experience
- Implement proper error boundaries
- Follow consistent naming conventions

### State Management
- Lift state up when needed across components
- Use context for deeply nested prop passing
- Consider external state management for complex apps
- Implement proper cleanup in effects