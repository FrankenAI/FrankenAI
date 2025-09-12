## TypeScript Guidelines

### Modern TypeScript Best Practices

**Strict Configuration**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Type-First Development**
```typescript
interface User {
  readonly id: string
  name: string
  email: string
  createdAt: Date
}

type CreateUserRequest = Omit<User, 'id' | 'createdAt'>
type UpdateUserRequest = Partial<Pick<User, 'name' | 'email'>>

// Generic constraints
interface Repository<T extends { id: string }> {
  findById(id: string): Promise<T | null>
  create(data: Omit<T, 'id'>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
}
```

**Advanced Patterns**
```typescript
// Conditional types
type NonNullable<T> = T extends null | undefined ? never : T

// Mapped types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Template literal types
type EventName<T extends string> = `on${Capitalize<T>}`
```

### Best Practices
- Enable strict mode for better type safety
- Use interfaces for object shapes
- Leverage utility types (Partial, Pick, Omit)
- Implement proper error handling with typed exceptions
- Use generics for reusable components