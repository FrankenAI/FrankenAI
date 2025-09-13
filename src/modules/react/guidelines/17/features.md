# React 17 Specific Features

## JSX Transform

React 17 introduced the new JSX Transform, eliminating the need to import React in every file:

```jsx
// React 17 - No need to import React for JSX
// import React from 'react' // ← Not needed anymore!

function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>
}

// But you still need to import hooks and other React features
import { useState, useEffect } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}
```

## Event Delegation Changes

React 17 changed event delegation to attach to the root container instead of document:

```jsx
function App() {
  const handleClick = (e) => {
    // e.nativeEvent now points to the root container, not document
    console.log('Event delegation changed in React 17')
  }

  return (
    <div onClick={handleClick}>
      <button>Click me</button>
    </div>
  )
}

// This affects how you might handle outside clicks
function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Be careful with event delegation changes
      if (isOpen && !event.target.closest('.modal-content')) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>
  )
}
```

## Class Components (Still Supported)

React 17 still fully supports class components:

```jsx
class UserProfile extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      loading: true,
      error: null
    }
  }

  componentDidMount() {
    this.fetchUser()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId) {
      this.fetchUser()
    }
  }

  fetchUser = async () => {
    this.setState({ loading: true, error: null })

    try {
      const response = await fetch(`/api/users/${this.props.userId}`)
      const user = await response.json()
      this.setState({ user, loading: false })
    } catch (error) {
      this.setState({ error: error.message, loading: false })
    }
  }

  render() {
    const { user, loading, error } = this.state

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
    if (!user) return <div>User not found</div>

    return (
      <div className="user-profile">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <button onClick={this.fetchUser}>Refresh</button>
      </div>
    )
  }
}
```

## Error Boundaries

Error boundaries work the same in React 17:

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <MainContent />
      <Footer />
    </ErrorBoundary>
  )
}
```

## Hooks in React 17

All hooks work the same as React 16.8+:

```jsx
// Custom hooks for React 17
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue(v => !v)
  }, [])

  return [value, toggle]
}

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue]
}

// Using custom hooks
function Settings() {
  const [isDarkMode, toggleDarkMode] = useToggle(false)
  const [userName, setUserName] = useLocalStorage('userName', '')

  return (
    <div className={`settings ${isDarkMode ? 'dark' : 'light'}`}>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Enter your name"
      />
      <button onClick={toggleDarkMode}>
        Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
      </button>
    </div>
  )
}
```

## Context API

```jsx
// Theme context
const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {}
})

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const value = useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Using context
function ThemedButton({ children, ...props }) {
  const { theme } = useTheme()

  return (
    <button
      className={`btn btn-${theme}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

## React 17 Build Configuration

### Webpack Configuration

```javascript
// webpack.config.js for React 17
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
              ['@babel/preset-react', {
                // Enable new JSX transform
                runtime: 'automatic'
              }]
            ]
          }
        }
      }
    ]
  }
}
```

### Vite Configuration

```javascript
// vite.config.js for React 17
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Enable new JSX transform
      jsxRuntime: 'automatic'
    })
  ]
})
```

## Migration Considerations

### From React 16 to React 17

```jsx
// Before React 17 - Required React import
import React from 'react'

function Component() {
  return <div>Hello</div>
}

// React 17 - No React import needed
function Component() {
  return <div>Hello</div>
}

// But still need React for hooks and other features
import { useState, useEffect } from 'react'

function ComponentWithHooks() {
  const [state, setState] = useState(0)
  return <div>{state}</div>
}
```

### Event System Changes

```jsx
// Be careful with event delegation in portals
function Portal({ children }) {
  return ReactDOM.createPortal(
    children,
    document.getElementById('portal-root')
  )
}

// Event handling might behave differently
function App() {
  const handleDocumentClick = (e) => {
    // Event delegation changed - test thoroughly
    console.log('Document clicked')
  }

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [])

  return (
    <div>
      <Portal>
        <button>Click me</button>
      </Portal>
    </div>
  )
}
```

## Testing in React 17

```jsx
// Testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Counter from './Counter'

describe('Counter', () => {
  test('increments count when button is clicked', () => {
    render(<Counter />)

    const button = screen.getByText('Click me')
    const count = screen.getByText(/You clicked \d+ times/)

    expect(count).toHaveTextContent('You clicked 0 times')

    fireEvent.click(button)

    expect(count).toHaveTextContent('You clicked 1 times')
  })
})

// Enzyme still works but React Testing Library is preferred
import { shallow } from 'enzyme'

describe('Counter with Enzyme', () => {
  test('increments count', () => {
    const wrapper = shallow(<Counter />)

    expect(wrapper.find('p').text()).toBe('You clicked 0 times')

    wrapper.find('button').simulate('click')

    expect(wrapper.find('p').text()).toBe('You clicked 1 times')
  })
})
```

## Performance Optimization

```jsx
// React.memo for component memoization
const ExpensiveComponent = React.memo(function ExpensiveComponent({ data, onUpdate }) {
  const processedData = useMemo(() => {
    // Expensive calculation
    return data.map(item => ({
      ...item,
      processed: true
    }))
  }, [data])

  return (
    <div>
      {processedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
})

// useCallback for function memoization
function Parent({ items }) {
  const [filter, setFilter] = useState('')

  const handleItemClick = useCallback((item) => {
    console.log('Item clicked:', item)
  }, [])

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    )
  }, [items, filter])

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter items..."
      />
      {filteredItems.map(item => (
        <ExpensiveComponent
          key={item.id}
          data={[item]}
          onUpdate={handleItemClick}
        />
      ))}
    </div>
  )
}
```

## React 17 Specific Best Practices

1. **Remove unnecessary React imports** for JSX-only files
2. **Test event handling thoroughly** due to delegation changes
3. **Use functional components and hooks** as the primary pattern
4. **Keep class components** for error boundaries and gradual migration
5. **Update build tools** to support new JSX transform
6. **Be cautious with third-party libraries** that might depend on old event system