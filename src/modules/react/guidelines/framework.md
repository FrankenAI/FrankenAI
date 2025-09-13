# React Framework Guidelines

## Core Principles

### Modern React with Hooks

Always use functional components with hooks instead of class components:

```jsx
// ✅ Good - Functional component with hooks
import React, { useState, useEffect, useCallback } from 'react'

interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

interface UserProfileProps {
  userId: number
  onUserUpdate?: (user: User) => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onUserUpdate }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user')

      const userData = await response.json()
      setUser(userData)
      onUserUpdate?.(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [userId, onUserUpdate])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (loading) return <div className="loading">Loading user...</div>
  if (error) return <div className="error">Error: {error}</div>
  if (!user) return <div className="empty">User not found</div>

  return (
    <div className="user-profile">
      <div className="user-avatar">
        <img src={user.avatar || '/default-avatar.png'} alt={user.name} />
      </div>
      <div className="user-info">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    </div>
  )
}
```

### TypeScript First

Always use TypeScript with React for better development experience:

```tsx
// Define component props interface
interface ProductCardProps {
  product: Product
  onAddToCart: (productId: number, quantity: number) => void
  onToggleFavorite: (productId: number) => void
  isInCart?: boolean
  isFavorite?: boolean
  className?: string
}

// Define data interfaces
interface Product {
  id: number
  name: string
  price: number
  description: string
  images: string[]
  category: string
  inStock: boolean
  rating: number
  reviews: Review[]
}

interface Review {
  id: number
  userId: number
  rating: number
  comment: string
  createdAt: string
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isInCart = false,
  isFavorite = false,
  className = ''
}) => {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const handleAddToCart = useCallback(() => {
    onAddToCart(product.id, quantity)
  }, [product.id, quantity, onAddToCart])

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite(product.id)
  }, [product.id, onToggleFavorite])

  return (
    <div className={`product-card ${className}`}>
      <div className="product-images">
        <img
          src={product.images[selectedImage]}
          alt={product.name}
          onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
        />
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="price">${product.price}</p>
        <p className="description">{product.description}</p>

        <div className="product-actions">
          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={isInCart ? 'in-cart' : ''}
          >
            {isInCart ? 'In Cart' : 'Add to Cart'}
          </button>

          <button
            onClick={handleToggleFavorite}
            className={`favorite ${isFavorite ? 'active' : ''}`}
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  )
}
```

## Custom Hooks for Reusable Logic

### API and Data Fetching Hooks

```tsx
// hooks/useApi.ts
import { useState, useEffect, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T>(
  url: string,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: options.immediate !== false,
    error: null
  })

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setState({ data, loading: false, error: null })
      options.onSuccess?.(data)
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error'
      setState(prev => ({ ...prev, loading: false, error }))
      options.onError?.(error)
    }
  }, [url, options])

  useEffect(() => {
    if (options.immediate !== false) {
      fetchData()
    }
  }, [fetchData, options.immediate])

  return {
    ...state,
    refetch: fetchData
  }
}

// hooks/useLocalStorage.ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
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

// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
```

### Using Custom Hooks in Components

```tsx
// components/UserSearch.tsx
import { useState, useMemo } from 'react'
import { useApi, useDebounce } from '../hooks'

interface User {
  id: number
  name: string
  email: string
  avatar: string
}

export const UserSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useLocalStorage<User[]>('selectedUsers', [])

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { data: users, loading, error } = useApi<User[]>(
    `/api/users/search?q=${encodeURIComponent(debouncedSearchTerm)}`,
    {
      immediate: false
    }
  )

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      refetch()
    }
  }, [debouncedSearchTerm, refetch])

  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users.filter(user =>
      !selectedUsers.some(selected => selected.id === user.id)
    )
  }, [users, selectedUsers])

  const handleSelectUser = useCallback((user: User) => {
    setSelectedUsers(prev => [...prev, user])
  }, [setSelectedUsers])

  const handleRemoveUser = useCallback((userId: number) => {
    setSelectedUsers(prev => prev.filter(user => user.id !== userId))
  }, [setSelectedUsers])

  return (
    <div className="user-search">
      <div className="search-input">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <div className="loading">Searching...</div>}
      {error && <div className="error">Error: {error}</div>}

      <div className="search-results">
        {filteredUsers.map(user => (
          <div key={user.id} className="user-item">
            <img src={user.avatar} alt={user.name} />
            <div className="user-info">
              <h4>{user.name}</h4>
              <p>{user.email}</p>
            </div>
            <button onClick={() => handleSelectUser(user)}>
              Select
            </button>
          </div>
        ))}
      </div>

      <div className="selected-users">
        <h3>Selected Users ({selectedUsers.length})</h3>
        {selectedUsers.map(user => (
          <div key={user.id} className="selected-user">
            <span>{user.name}</span>
            <button onClick={() => handleRemoveUser(user.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Context and State Management

### React Context for Global State

```tsx
// contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useCallback } from 'react'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true }
    case 'AUTH_SUCCESS':
      return {
        user: action.payload,
        isAuthenticated: true,
        loading: false
      }
    case 'AUTH_FAILURE':
      return {
        user: null,
        isAuthenticated: false,
        loading: false
      }
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        loading: false
      }
    default:
      return state
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false
  })

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' })

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const { user, token } = await response.json()
      localStorage.setItem('token', token)
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' })
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    dispatch({ type: 'LOGOUT' })
  }, [])

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const user = await response.json()
        dispatch({ type: 'AUTH_SUCCESS', payload: user })
      } else {
        logout()
      }
    } catch (error) {
      logout()
    }
  }, [logout])

  const value = {
    ...state,
    login,
    logout,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

### Using Context in Components

```tsx
// components/LoginForm.tsx
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const { login, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
    } catch (err) {
      setError('Invalid email or password')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

// components/UserProfile.tsx
import { useAuth } from '../contexts/AuthContext'

export const UserProfile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <div>Please log in</div>
  }

  return (
    <div className="user-profile">
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

## Performance Optimization

### Memoization and Optimization

```tsx
import React, { memo, useMemo, useCallback } from 'react'

// Memoize expensive components
interface ExpensiveListProps {
  items: Item[]
  onItemClick: (item: Item) => void
  filter: string
}

export const ExpensiveList = memo<ExpensiveListProps>(({
  items,
  onItemClick,
  filter
}) => {
  // Memoize expensive calculations
  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => a.priority - b.priority)
  }, [items, filter])

  // Memoize expensive computations
  const totalValue = useMemo(() => {
    return filteredItems.reduce((total, item) => total + item.value, 0)
  }, [filteredItems])

  return (
    <div className="expensive-list">
      <div className="list-header">
        <h3>Items ({filteredItems.length})</h3>
        <p>Total Value: ${totalValue}</p>
      </div>

      <div className="list-items">
        {filteredItems.map(item => (
          <ExpensiveListItem
            key={item.id}
            item={item}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  )
})

// Memoize list items to prevent unnecessary re-renders
interface ExpensiveListItemProps {
  item: Item
  onClick: (item: Item) => void
}

const ExpensiveListItem = memo<ExpensiveListItemProps>(({ item, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(item)
  }, [item, onClick])

  return (
    <div className="list-item" onClick={handleClick}>
      <h4>{item.name}</h4>
      <p>{item.description}</p>
      <span className="priority">Priority: {item.priority}</span>
    </div>
  )
})
```

### Lazy Loading and Code Splitting

```tsx
// Lazy load components
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./components/Dashboard'))
const UserSettings = lazy(() => import('./components/UserSettings'))
const AdminPanel = lazy(() => import('./components/AdminPanel'))

export const App: React.FC = () => {
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="app">
      <nav>
        <NavComponent />
      </nav>

      <main>
        <Suspense fallback={<div className="loading">Loading...</div>}>
          {!isAuthenticated ? (
            <LoginForm />
          ) : (
            <>
              {user?.role === 'admin' && <AdminPanel />}
              <Dashboard />
              <UserSettings />
            </>
          )}
        </Suspense>
      </main>
    </div>
  )
}

// Dynamic imports for conditional loading
const ConditionalComponent: React.FC<{ shouldLoad: boolean }> = ({ shouldLoad }) => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    if (shouldLoad && !Component) {
      import('./HeavyComponent').then(module => {
        setComponent(() => module.default)
      })
    }
  }, [shouldLoad, Component])

  if (!shouldLoad) return null
  if (!Component) return <div>Loading component...</div>

  return <Component />
}
```

## Testing Best Practices

### Component Testing with React Testing Library

```tsx
// components/__tests__/UserProfile.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { UserProfile } from '../UserProfile'
import { AuthProvider } from '../../contexts/AuthContext'

// Mock the auth context
const mockAuthContext = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user' as const
  },
  isAuthenticated: true,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshUser: vi.fn()
}

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

describe('UserProfile', () => {
  it('displays user information when authenticated', () => {
    render(<UserProfile />)

    expect(screen.getByText('Welcome, John Doe!')).toBeInTheDocument()
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Role: user')).toBeInTheDocument()
  })

  it('calls logout when logout button is clicked', async () => {
    render(<UserProfile />)

    const logoutButton = screen.getByText('Logout')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(mockAuthContext.logout).toHaveBeenCalledTimes(1)
    })
  })

  it('shows login message when not authenticated', () => {
    mockAuthContext.isAuthenticated = false
    mockAuthContext.user = null

    render(<UserProfile />)

    expect(screen.getByText('Please log in')).toBeInTheDocument()
  })
})
```

### Hook Testing

```tsx
// hooks/__tests__/useApi.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useApi } from '../useApi'

// Mock fetch
global.fetch = vi.fn()

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test User' }

    ;(fetch as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    })

    const { result } = renderHook(() => useApi('/api/users/1'))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBe(null)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
  })

  it('handles fetch errors', async () => {
    ;(fetch as vi.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useApi('/api/users/1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe(null)
    expect(result.current.error).toBe('Network error')
  })
})
```

## Common Patterns

### Form Handling with Validation

```tsx
// hooks/useForm.ts
import { useState, useCallback } from 'react'

interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => Promise<void> | void
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }, [errors])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validate ? validate(values) : {}
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      // Handle submit errors
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate, onSubmit])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    handleSubmit,
    reset
  }
}

// components/ContactForm.tsx
interface ContactFormData {
  name: string
  email: string
  message: string
}

const validateContactForm = (values: ContactFormData) => {
  const errors: Partial<Record<keyof ContactFormData, string>> = {}

  if (!values.name.trim()) {
    errors.name = 'Name is required'
  } else if (values.name.length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email is invalid'
  }

  if (!values.message.trim()) {
    errors.message = 'Message is required'
  } else if (values.message.length < 10) {
    errors.message = 'Message must be at least 10 characters'
  }

  return errors
}

export const ContactForm: React.FC = () => {
  const { values, errors, isSubmitting, setValue, handleSubmit, reset } = useForm({
    initialValues: {
      name: '',
      email: '',
      message: ''
    },
    validate: validateContactForm,
    onSubmit: async (data) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      reset()
      alert('Message sent successfully!')
    }
  })

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={values.name}
          onChange={(e) => setValue('name', e.target.value)}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={values.email}
          onChange={(e) => setValue('email', e.target.value)}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          value={values.message}
          onChange={(e) => setValue('message', e.target.value)}
          className={errors.message ? 'error' : ''}
          rows={5}
        />
        {errors.message && <span className="error-message">{errors.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
```

## What NOT to Do

1. **Don't use class components** for new development - use functional components with hooks
2. **Don't mutate state directly** - always use setState or reducer actions
3. **Don't forget to memoize expensive calculations** - use useMemo for heavy computations
4. **Don't create functions inside render** without useCallback - causes unnecessary re-renders
5. **Don't skip dependency arrays** in useEffect, useMemo, useCallback
6. **Don't use index as key** for dynamic lists - use stable unique identifiers
7. **Don't forget to handle loading and error states** in data fetching
8. **Don't ignore TypeScript warnings** - they prevent runtime errors
9. **Don't create too many context providers** - use composition and keep contexts focused
10. **Don't skip testing** - especially for complex logic and user interactions