# React 18 Specific Features

## Concurrent Features

React 18 introduces concurrent rendering, automatic batching, and new APIs for better performance:

```jsx
import { createRoot } from 'react-dom/client'

// React 18 - Use createRoot instead of ReactDOM.render
const container = document.getElementById('root')
const root = createRoot(container)

root.render(<App />)
```

## Automatic Batching

React 18 automatically batches state updates in all scenarios:

```jsx
function AutoBatchingExample() {
  const [count, setCount] = useState(0)
  const [flag, setFlag] = useState(false)

  const handleClick = () => {
    // React 18 automatically batches these updates
    // even in promises, timeouts, and native event handlers
    fetch('/api/data').then(() => {
      setCount(c => c + 1) // Does not re-render yet
      setFlag(f => !f)     // Does not re-render yet
      // React will batch these and re-render once at the end
    })
  }

  // If you need to opt out of automatic batching
  const handleClickWithoutBatching = () => {
    fetch('/api/data').then(() => {
      flushSync(() => {
        setCount(c => c + 1) // Forces re-render
      })
      setFlag(f => !f) // Forces another re-render
    })
  }

  return (
    <div>
      <p>Count: {count}</p>
      <p>Flag: {flag.toString()}</p>
      <button onClick={handleClick}>Update with batching</button>
      <button onClick={handleClickWithoutBatching}>Update without batching</button>
    </div>
  )
}
```

## Suspense for Data Fetching

React 18 improves Suspense support for data fetching:

```jsx
import { Suspense, startTransition } from 'react'

// Resource-like pattern for Suspense
function createResource(promise) {
  let status = 'pending'
  let result = promise.then(
    (resolved) => {
      status = 'resolved'
      result = resolved
    },
    (rejected) => {
      status = 'rejected'
      result = rejected
    }
  )

  return {
    read() {
      if (status === 'pending') throw result
      if (status === 'rejected') throw result
      return result
    }
  }
}

const userResource = createResource(fetch('/api/user').then(r => r.json()))

function UserProfile() {
  const user = userResource.read() // This will suspend if not ready

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}

function App() {
  return (
    <div>
      <h1>My App</h1>
      <Suspense fallback={<div>Loading user...</div>}>
        <UserProfile />
      </Suspense>
    </div>
  )
}
```

## useTransition Hook

Handle expensive state updates without blocking the UI:

```jsx
import { useTransition, useDeferredValue, useState, useMemo } from 'react'

function SearchResults({ query }) {
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState([])

  // Defer the query to make input responsive
  const deferredQuery = useDeferredValue(query)

  // Expensive computation that benefits from being deferred
  const filteredResults = useMemo(() => {
    return largeDataSet.filter(item =>
      item.name.toLowerCase().includes(deferredQuery.toLowerCase())
    )
  }, [deferredQuery])

  const handleSearch = (newQuery) => {
    startTransition(() => {
      // This update is non-urgent and won't block the UI
      setResults(performExpensiveSearch(newQuery))
    })
  }

  return (
    <div>
      <input
        placeholder="Search..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      {isPending && <div className="spinner">Searching...</div>}

      <div className={isPending ? 'dimmed' : ''}>
        {filteredResults.map(result => (
          <div key={result.id}>{result.name}</div>
        ))}
      </div>
    </div>
  )
}
```

## useDeferredValue Hook

Defer non-urgent updates to keep the UI responsive:

```jsx
function ProductSearch() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  // The search results will lag behind the input
  // but the input will stay responsive
  const searchResults = useMemo(() => {
    return searchProducts(deferredQuery)
  }, [deferredQuery])

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
      />

      <div>
        {searchResults.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
```

## useId Hook

Generate stable unique IDs for accessibility and forms:

```jsx
import { useId } from 'react'

function FormField({ label, type = 'text', ...props }) {
  const id = useId()

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} {...props} />
    </div>
  )
}

function ContactForm() {
  const formId = useId()

  return (
    <form>
      <FormField label="Name" name="name" />
      <FormField label="Email" type="email" name="email" />

      {/* Use with aria-describedby */}
      <div>
        <input
          type="password"
          aria-describedby={`${formId}-password-help`}
        />
        <div id={`${formId}-password-help`}>
          Password must be at least 8 characters
        </div>
      </div>
    </form>
  )
}
```

## useSyncExternalStore Hook

Safely subscribe to external data sources:

```jsx
import { useSyncExternalStore } from 'react'

// Custom store
class CounterStore {
  constructor() {
    this.count = 0
    this.listeners = new Set()
  }

  subscribe = (listener) => {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot = () => {
    return this.count
  }

  increment = () => {
    this.count++
    this.listeners.forEach(listener => listener())
  }
}

const counterStore = new CounterStore()

function useCounter() {
  return useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot
  )
}

function Counter() {
  const count = useCounter()

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={counterStore.increment}>
        Increment
      </button>
    </div>
  )
}

// Browser API integration
function useOnlineStatus() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback)
      window.addEventListener('offline', callback)
      return () => {
        window.removeEventListener('online', callback)
        window.removeEventListener('offline', callback)
      }
    },
    () => navigator.onLine
  )
}

function OnlineStatus() {
  const isOnline = useOnlineStatus()

  return (
    <div className={`status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? '🟢 Online' : '🔴 Offline'}
    </div>
  )
}
```

## useInsertionEffect Hook

For CSS-in-JS libraries to inject styles before layout effects:

```jsx
import { useInsertionEffect, useLayoutEffect } from 'react'

function useCSS(css) {
  useInsertionEffect(() => {
    // This runs before all layout effects
    const style = document.createElement('style')
    style.textContent = css
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [css])
}

function StyledComponent({ children }) {
  useCSS(`
    .styled-component {
      background: linear-gradient(45deg, #fe6b8b, #ff8e53);
      border-radius: 8px;
      padding: 16px;
      color: white;
    }
  `)

  return <div className="styled-component">{children}</div>
}
```

## Strict Mode Enhancements

React 18 Strict Mode helps identify side effects:

```jsx
import { StrictMode } from 'react'

// React 18 Strict Mode will double-invoke effects in development
function App() {
  return (
    <StrictMode>
      <MyComponent />
    </StrictMode>
  )
}

function MyComponent() {
  useEffect(() => {
    // This will run twice in development with Strict Mode
    // Make sure your effects are idempotent
    console.log('Effect running')

    return () => {
      console.log('Cleanup running')
    }
  }, [])

  return <div>My Component</div>
}
```

## Concurrent Rendering Example

```jsx
import { startTransition, useTransition, useState } from 'react'

function TodoApp() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')
  const [isPending, startTransition] = useTransition()

  const addTodo = () => {
    // High priority update (keeps input responsive)
    setText('')

    // Low priority update (can be interrupted)
    startTransition(() => {
      setTodos(prev => [
        ...prev,
        { id: Date.now(), text, completed: false }
      ])
    })
  }

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a todo..."
      />
      <button onClick={addTodo} disabled={!text.trim()}>
        Add Todo
      </button>

      {isPending && <div className="spinner">Adding todo...</div>}

      <ul className={isPending ? 'dimmed' : ''}>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  )
}
```

## New Suspense Patterns

```jsx
import { Suspense, lazy, startTransition } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  const [showHeavy, setShowHeavy] = useState(false)

  const handleShowHeavy = () => {
    startTransition(() => {
      setShowHeavy(true)
    })
  }

  return (
    <div>
      <button onClick={handleShowHeavy}>
        Load Heavy Component
      </button>

      <Suspense
        fallback={
          <div className="loading-skeleton">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
        }
      >
        {showHeavy && <HeavyComponent />}
      </Suspense>
    </div>
  )
}
```

## Error Boundaries with Concurrent Features

```jsx
class ConcurrentErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log concurrent rendering errors
    console.error('Concurrent error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Performance Monitoring

```jsx
import { Profiler } from 'react'

function onRenderCallback(id, phase, actualDuration, baseDuration, startTime, commitTime) {
  // Log performance data
  console.log('Component:', id)
  console.log('Phase:', phase) // 'mount' or 'update'
  console.log('Actual duration:', actualDuration)
  console.log('Base duration:', baseDuration)
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Header />
      <Profiler id="MainContent" onRender={onRenderCallback}>
        <MainContent />
      </Profiler>
      <Footer />
    </Profiler>
  )
}
```

## Migration from React 17 to 18

### Update Root Rendering

```jsx
// React 17
import ReactDOM from 'react-dom'
ReactDOM.render(<App />, document.getElementById('root'))

// React 18
import { createRoot } from 'react-dom/client'
const container = document.getElementById('root')
const root = createRoot(container)
root.render(<App />)
```

### Handle Breaking Changes

```jsx
// React 18 removes some legacy APIs
// Update these patterns:

// Before: ReactDOM.render with callback
ReactDOM.render(<App />, container, () => {
  console.log('Rendered')
})

// After: Use useEffect or flushSync
const root = createRoot(container)
root.render(<App />)
// Use useEffect in components for post-render logic
```

## React 18 Best Practices

1. **Use concurrent features** for better user experience
2. **Wrap expensive updates** in startTransition
3. **Leverage useDeferredValue** for search and filtering
4. **Update to createRoot** for new concurrent features
5. **Test with Strict Mode** to catch side effects
6. **Use Suspense** for data fetching patterns
7. **Profile components** to identify performance bottlenecks