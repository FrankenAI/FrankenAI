## React Guidelines

### Key Features & Best Practices

**Functional Components with Hooks**
```tsx
import { useState, useEffect, useCallback } from 'react'

interface UserProfileProps {
  userId: string
  onUserLoaded?: (user: User) => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  onUserLoaded 
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      
      const userData = await response.json()
      setUser(userData)
      onUserLoaded?.(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [userId, onUserLoaded])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return null

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  )
}
```

**Custom Hooks**
```tsx
// hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react'

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      setUser(await response.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, loading, error, refetch: fetchUser }
}
```

**Context Pattern**
```tsx
const UserContext = createContext<{
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
} | null>(null)

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext must be used within UserProvider')
  }
  return context
}
```

### Performance Best Practices
- Use `React.memo` for pure components
- Use `useMemo` and `useCallback` strategically
- Avoid inline object creation in JSX
- Use `Suspense` with lazy loading