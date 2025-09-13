# React 19 Specific Features

## Actions - The Biggest New Feature

React 19 introduces Actions for handling async operations with automatic pending states, error handling, and optimistic updates:

```jsx
import { useActionState, useOptimistic } from 'react'

function ContactForm() {
  // useActionState manages form submission state
  const [state, submitAction, isPending] = useActionState(
    async (prevState, formData) => {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error('Failed to submit form')
        }

        return { success: true, message: 'Form submitted successfully!' }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    { success: false, message: '', error: null }
  )

  return (
    <form action={submitAction}>
      <input name="name" placeholder="Your name" required />
      <input name="email" type="email" placeholder="Your email" required />
      <textarea name="message" placeholder="Your message" required />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>

      {state.success && (
        <div className="success">{state.message}</div>
      )}

      {state.error && (
        <div className="error">{state.error}</div>
      )}
    </form>
  )
}
```

## useOptimistic Hook

Implement optimistic UI updates that automatically revert on error:

```jsx
import { useOptimistic, useActionState } from 'react'

function TodoList({ todos: serverTodos }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    serverTodos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  )

  const [, submitAction] = useActionState(
    async (prevState, formData) => {
      const todoText = formData.get('todo')

      // Optimistically add the todo
      addOptimisticTodo({
        id: Math.random(),
        text: todoText,
        completed: false
      })

      try {
        // Simulate API call
        const response = await fetch('/api/todos', {
          method: 'POST',
          body: JSON.stringify({ text: todoText }),
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) throw new Error('Failed to add todo')

        // Success - the optimistic update will be replaced by server data
        return { success: true }
      } catch (error) {
        // Error - optimistic update will be reverted automatically
        return { success: false, error: error.message }
      }
    },
    null
  )

  return (
    <div>
      <form action={submitAction}>
        <input name="todo" placeholder="Add a todo..." required />
        <button type="submit">Add Todo</button>
      </form>

      <ul>
        {optimisticTodos.map(todo => (
          <li
            key={todo.id}
            className={todo.pending ? 'pending' : ''}
          >
            {todo.text}
            {todo.pending && <span> (adding...)</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## useFormStatus Hook

Track form submission status in nested components:

```jsx
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending, data, method, action } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}

function LoginForm() {
  const [state, formAction] = useActionState(
    async (prevState, formData) => {
      const email = formData.get('email')
      const password = formData.get('password')

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) throw new Error('Invalid credentials')

        const user = await response.json()
        return { success: true, user }
      } catch (error) {
        return { success: false, error: error.message }
      }
    },
    null
  )

  return (
    <form action={formAction}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />

      {/* SubmitButton automatically knows about form status */}
      <SubmitButton />

      {state?.error && (
        <div className="error">{state.error}</div>
      )}
    </form>
  )
}
```

## use() Hook

Read resources and promises during rendering:

```jsx
import { use, Suspense } from 'react'

// Resource that can be used with the use() hook
function createUserResource(userId) {
  return fetch(`/api/users/${userId}`).then(res => res.json())
}

function UserProfile({ userPromise }) {
  // use() hook suspends until the promise resolves
  const user = use(userPromise)

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
    </div>
  )
}

function UserContext() {
  // Context value can be a promise
  const userPromise = createUserResource(1)

  return (
    <UserContext.Provider value={userPromise}>
      <UserProfile />
    </UserContext.Provider>
  )
}

function UserProfileWithContext() {
  // use() can also read context
  const userPromise = use(UserContext)
  const user = use(userPromise)

  return <div>Hello, {user.name}!</div>
}

function App() {
  const userPromise = createUserResource(1)

  return (
    <Suspense fallback={<div>Loading user...</div>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  )
}
```

## Document Metadata Support

React 19 natively supports rendering metadata in components:

```jsx
function BlogPost({ post }) {
  return (
    <article>
      {/* These will be automatically hoisted to <head> */}
      <title>{post.title}</title>
      <meta name="description" content={post.excerpt} />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt} />
      <meta property="og:image" content={post.coverImage} />
      <link rel="canonical" href={`https://myblog.com/posts/${post.slug}`} />

      <header>
        <h1>{post.title}</h1>
        <p className="excerpt">{post.excerpt}</p>
      </header>

      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}

function ProductPage({ product }) {
  return (
    <div>
      {/* SEO metadata automatically goes to <head> */}
      <title>{product.name} - Our Store</title>
      <meta name="description" content={product.description} />
      <meta property="og:title" content={product.name} />
      <meta property="og:image" content={product.image} />
      <meta property="product:price:amount" content={product.price} />
      <meta property="product:availability" content={product.inStock ? 'in stock' : 'out of stock'} />

      <div className="product-details">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="price">${product.price}</p>
      </div>
    </div>
  )
}
```

## React Compiler

React 19 includes a compiler that optimizes your code automatically:

```jsx
// Before: Manual optimization needed
function ExpensiveComponent({ items, filter }) {
  // You had to manually memoize this
  const filteredItems = useMemo(() => {
    return items.filter(item => item.name.includes(filter))
  }, [items, filter])

  // And this
  const handleClick = useCallback((item) => {
    console.log('Clicked:', item.name)
  }, [])

  return (
    <div>
      {filteredItems.map(item => (
        <div key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  )
}

// React 19: Compiler automatically optimizes
function ExpensiveComponent({ items, filter }) {
  // No manual memoization needed - compiler handles it
  const filteredItems = items.filter(item => item.name.includes(filter))

  const handleClick = (item) => {
    console.log('Clicked:', item.name)
  }

  return (
    <div>
      {filteredItems.map(item => (
        <div key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

## Resource Loading APIs

Better control over when resources load:

```jsx
import { preload, preinit } from 'react-dom'

function App() {
  // Preload resources
  useEffect(() => {
    // Preload data
    preload('/api/user-data', { as: 'fetch' })

    // Preload and initialize scripts
    preinit('/js/analytics.js', { as: 'script' })

    // Preload stylesheets
    preload('/css/theme.css', { as: 'style' })
  }, [])

  return (
    <div>
      <Header />
      <MainContent />
    </div>
  )
}

// In Server Components
function ServerComponent() {
  // Preload resources on the server
  preload('https://fonts.googleapis.com/css2?family=Inter', { as: 'style' })

  return (
    <div>
      <h1>Server-rendered content</h1>
    </div>
  )
}
```

## Enhanced Ref Handling

```jsx
// React 19: ref as a prop (no more forwardRef needed)
function CustomInput({ ref, ...props }) {
  return <input ref={ref} {...props} className="custom-input" />
}

// Usage - just works!
function App() {
  const inputRef = useRef()

  return (
    <div>
      <CustomInput ref={inputRef} placeholder="Enter text..." />
      <button onClick={() => inputRef.current?.focus()}>
        Focus Input
      </button>
    </div>
  )
}

// Compare with React 18 (still works but not needed)
const CustomInputOld = forwardRef(function CustomInput(props, ref) {
  return <input ref={ref} {...props} className="custom-input" />
})
```

## Server Components Integration

```jsx
// Server Component (runs on server)
async function UserDashboard({ userId }) {
  // This runs on the server
  const user = await fetch(`/api/users/${userId}`).then(r => r.json())
  const posts = await fetch(`/api/users/${userId}/posts`).then(r => r.json())

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>

      {/* Mix server and client components */}
      <UserStats user={user} />
      <InteractivePostList posts={posts} />
    </div>
  )
}

// Client Component (runs in browser)
'use client'
function InteractivePostList({ posts }) {
  const [filter, setFilter] = useState('')

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter posts..."
      />

      {filteredPosts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

## Migration from React 18

### Update React Version

```bash
npm install react@19 react-dom@19
```

### Update Root Rendering (if not done in React 18)

```jsx
// React 19 - same as React 18
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
```

### Replace Manual Optimizations

```jsx
// React 18 approach
function Component({ data, filter }) {
  const expensiveValue = useMemo(() => {
    return data.filter(item => item.category === filter)
  }, [data, filter])

  const handleClick = useCallback((item) => {
    onClick(item)
  }, [onClick])

  return (
    <div>
      {expensiveValue.map(item => (
        <div key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  )
}

// React 19 - let compiler handle optimization
function Component({ data, filter, onClick }) {
  const expensiveValue = data.filter(item => item.category === filter)

  const handleClick = (item) => {
    onClick(item)
  }

  return (
    <div>
      {expensiveValue.map(item => (
        <div key={item.id} onClick={() => handleClick(item)}>
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

## React 19 Best Practices

1. **Use Actions for async operations** instead of manual useEffect + useState
2. **Leverage useOptimistic** for better UX during async operations
3. **Remove manual memoization** when using React Compiler
4. **Use native metadata support** instead of react-helmet
5. **Adopt Server Components** for better performance
6. **Use ref as prop** instead of forwardRef
7. **Preload resources** with new Resource Loading APIs
8. **Embrace the use() hook** for cleaner async code