# TypeScript Language Guidelines

## Type Definitions and Interfaces

Define clear, reusable types for better code safety and documentation:

```typescript
// Basic interface definitions
interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  createdAt: Date;
  updatedAt?: Date;
  preferences?: UserPreferences;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

// Generic interfaces for API responses
interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Union types for status handling
type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<T> {
  data: T | null;
  status: RequestStatus;
  error: string | null;
}

// Utility types
type PartialUser = Partial<User>;
type UserUpdate = Omit<User, 'id' | 'createdAt'>;
type UserCreate = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Advanced type compositions
type EventHandler<T = unknown> = (event: T) => void | Promise<void>;
type FormFields<T> = Record<keyof T, string | number | boolean>;
```

## Class-Based Architecture

```typescript
// Abstract base classes
abstract class BaseService {
  protected abstract baseUrl: string;
  protected headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  protected async request<T>(
    method: string,
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: this.headers,
      ...options
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return response.json();
  }

  setAuthToken(token: string): void {
    this.headers.Authorization = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.headers.Authorization;
  }
}

// Service implementation
class UserService extends BaseService {
  protected baseUrl = 'https://api.example.com';

  async getUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, String(value));
        }
      });
    }

    const endpoint = `/users${params.toString() ? '?' + params.toString() : ''}`;
    return this.request<PaginatedResponse<User>>('GET', endpoint);
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('GET', `/users/${id}`);
  }

  async createUser(userData: UserCreate): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('POST', '/users', {
      body: JSON.stringify(userData)
    });
  }

  async updateUser(id: number, updates: Partial<UserUpdate>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('PUT', `/users/${id}`, {
      body: JSON.stringify(updates)
    });
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    return this.request<ApiResponse<void>>('DELETE', `/users/${id}`);
  }
}

// Custom error classes
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

## Generic Functions and Utilities

```typescript
// Generic utility functions
function createAsyncState<T>(initialData: T | null = null): AsyncState<T> {
  return {
    data: initialData,
    status: 'idle',
    error: null
  };
}

function isLoading<T>(state: AsyncState<T>): boolean {
  return state.status === 'loading';
}

function isSuccess<T>(state: AsyncState<T>): state is AsyncState<T> & { data: T } {
  return state.status === 'success' && state.data !== null;
}

function isError<T>(state: AsyncState<T>): state is AsyncState<T> & { error: string } {
  return state.status === 'error' && state.error !== null;
}

// Generic API wrapper
class ApiWrapper<T> {
  private state: AsyncState<T> = createAsyncState<T>();
  private listeners: Array<(state: AsyncState<T>) => void> = [];

  constructor(private fetchFn: () => Promise<T>) {}

  getState(): AsyncState<T> {
    return { ...this.state };
  }

  subscribe(listener: (state: AsyncState<T>) => void): () => void {
    this.listeners.push(listener);

    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private setState(updates: Partial<AsyncState<T>>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  async fetch(): Promise<T | null> {
    this.setState({ status: 'loading', error: null });

    try {
      const data = await this.fetchFn();
      this.setState({ status: 'success', data, error: null });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.setState({ status: 'error', error: errorMessage, data: null });
      return null;
    }
  }

  reset(): void {
    this.setState(createAsyncState<T>());
  }
}

// Type guards
function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string' &&
    ['user', 'admin', 'moderator'].includes(obj.role)
  );
}

function isApiResponse<T>(obj: any, validator: (data: any) => data is T): obj is ApiResponse<T> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.success === 'boolean' &&
    (obj.data === null || validator(obj.data))
  );
}

// Usage examples
const userWrapper = new ApiWrapper<User[]>(() => userService.getUsers().then(r => r.data));

userWrapper.subscribe(state => {
  if (isLoading(state)) {
    console.log('Loading users...');
  } else if (isSuccess(state)) {
    console.log('Users loaded:', state.data);
  } else if (isError(state)) {
    console.error('Failed to load users:', state.error);
  }
});

await userWrapper.fetch();
```

## Form Handling and Validation

```typescript
// Form validation schema
interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

class FormValidator<T extends Record<string, any>> {
  constructor(private schema: ValidationSchema<T>) {}

  validate(data: T): ValidationResult<T> {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const [field, rules] of Object.entries(this.schema) as Array<[keyof T, ValidationRule<T[keyof T]>[]]>) {
      const value = data[field];

      for (const rule of rules || []) {
        if (!rule.validate(value)) {
          errors[field] = rule.message;
          break; // Stop at first error for this field
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data
    };
  }
}

interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
  data: T;
}

// Validation rules
const validationRules = {
  required: <T>(message = 'This field is required'): ValidationRule<T> => ({
    validate: (value) => value !== null && value !== undefined && value !== '',
    message
  }),

  email: (message = 'Please enter a valid email'): ValidationRule<string> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validate: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`
  }),

  oneOf: <T>(options: T[], message?: string): ValidationRule<T> => ({
    validate: (value) => options.includes(value),
    message: message || `Must be one of: ${options.join(', ')}`
  })
};

// Form management
class FormManager<T extends Record<string, any>> {
  private data: T;
  private validator: FormValidator<T>;
  private errors: Partial<Record<keyof T, string>> = {};
  private touched: Set<keyof T> = new Set();

  constructor(
    initialData: T,
    validationSchema: ValidationSchema<T>
  ) {
    this.data = { ...initialData };
    this.validator = new FormValidator(validationSchema);
  }

  getValue<K extends keyof T>(field: K): T[K] {
    return this.data[field];
  }

  setValue<K extends keyof T>(field: K, value: T[K]): void {
    this.data[field] = value;
    this.touched.add(field);
    this.validateField(field);
  }

  setValues(updates: Partial<T>): void {
    Object.entries(updates).forEach(([field, value]) => {
      this.setValue(field as keyof T, value);
    });
  }

  private validateField(field: keyof T): void {
    const result = this.validator.validate(this.data);
    this.errors[field] = result.errors[field];
  }

  validateAll(): ValidationResult<T> {
    const result = this.validator.validate(this.data);
    this.errors = result.errors;

    // Mark all fields as touched
    Object.keys(this.data).forEach(field => {
      this.touched.add(field as keyof T);
    });

    return result;
  }

  getError(field: keyof T): string | undefined {
    return this.touched.has(field) ? this.errors[field] : undefined;
  }

  hasError(field: keyof T): boolean {
    return Boolean(this.getError(field));
  }

  isValid(): boolean {
    return Object.keys(this.errors).length === 0;
  }

  getData(): T {
    return { ...this.data };
  }

  reset(newData?: Partial<T>): void {
    this.data = { ...this.data, ...newData };
    this.errors = {};
    this.touched.clear();
  }
}

// Usage example
interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const contactFormValidator: ValidationSchema<ContactForm> = {
  name: [
    validationRules.required('Name is required'),
    validationRules.minLength(2, 'Name must be at least 2 characters')
  ],
  email: [
    validationRules.required('Email is required'),
    validationRules.email()
  ],
  message: [
    validationRules.required('Message is required'),
    validationRules.minLength(10, 'Message must be at least 10 characters')
  ]
};

const contactForm = new FormManager<ContactForm>(
  {
    name: '',
    email: '',
    subject: '',
    message: ''
  },
  contactFormValidator
);

// Form usage
contactForm.setValue('name', 'John Doe');
contactForm.setValue('email', 'john@example.com');

if (contactForm.isValid()) {
  const formData = contactForm.getData();
  console.log('Submitting form:', formData);
}
```

## Event System and Observers

```typescript
// Event emitter with typed events
type EventMap = {
  'user:login': { user: User };
  'user:logout': {};
  'user:update': { user: User; changes: Partial<User> };
  'api:error': { error: ApiError; endpoint: string };
  'form:submit': { formData: any; formName: string };
};

type EventHandler<T> = (data: T) => void | Promise<void>;

class TypedEventEmitter<T extends Record<string, any> = EventMap> {
  private listeners: Map<keyof T, Set<EventHandler<T[keyof T]>>> = new Map();

  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.listeners.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${String(event)}:`, error);
        }
      });
    }
  }

  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      handler(data);
    });
  }

  removeAllListeners(event?: keyof T): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

// Observer pattern implementation
interface Observer<T> {
  update(data: T): void;
}

class Observable<T> {
  private observers: Set<Observer<T>> = new Set();

  subscribe(observer: Observer<T>): () => void {
    this.observers.add(observer);

    return () => {
      this.observers.delete(observer);
    };
  }

  notify(data: T): void {
    this.observers.forEach(observer => {
      observer.update(data);
    });
  }

  getObserverCount(): number {
    return this.observers.size;
  }
}

// State management with observability
class Store<T> extends Observable<T> {
  constructor(private state: T) {
    super();
  }

  getState(): T {
    return { ...this.state } as T;
  }

  setState(updates: Partial<T> | ((prevState: T) => Partial<T>)): void {
    const stateUpdates = typeof updates === 'function'
      ? updates(this.state)
      : updates;

    this.state = { ...this.state, ...stateUpdates };
    this.notify(this.state);
  }

  select<K extends keyof T>(key: K): T[K] {
    return this.state[key];
  }
}

// Usage examples
const eventBus = new TypedEventEmitter<EventMap>();

// Subscribe to events
const unsubscribeLogin = eventBus.on('user:login', ({ user }) => {
  console.log('User logged in:', user.name);
});

const unsubscribeError = eventBus.on('api:error', ({ error, endpoint }) => {
  console.error(`API error on ${endpoint}:`, error.message);
});

// Emit events
eventBus.emit('user:login', {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    createdAt: new Date()
  }
});

// Store usage
interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
}

const appStore = new Store<AppState>({
  user: null,
  isAuthenticated: false,
  theme: 'light'
});

const unsubscribeStore = appStore.subscribe(state => {
  console.log('App state changed:', state);
});

appStore.setState({ isAuthenticated: true });
appStore.setState(prevState => ({
  theme: prevState.theme === 'light' ? 'dark' : 'light'
}));
```

## Advanced Type Patterns

```typescript
// Conditional types
type IsArray<T> = T extends any[] ? true : false;
type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Mapped types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequireOnly<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

// Template literal types
type EventName<T extends string> = `on${Capitalize<T>}`;
type ApiEndpoint<T extends string> = `/api/${T}`;

// Recursive types
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Function overloads
class DataProcessor {
  process(data: string): string;
  process(data: number): number;
  process(data: User): User;
  process(data: User[]): User[];
  process(data: string | number | User | User[]): string | number | User | User[] {
    if (typeof data === 'string') {
      return data.toUpperCase();
    } else if (typeof data === 'number') {
      return data * 2;
    } else if (Array.isArray(data)) {
      return data.map(user => ({ ...user, processed: true }));
    } else {
      return { ...data, processed: true };
    }
  }
}

// Discriminated unions
interface LoadingState {
  status: 'loading';
}

interface SuccessState<T> {
  status: 'success';
  data: T;
}

interface ErrorState {
  status: 'error';
  error: string;
}

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

function handleAsyncState<T>(state: AsyncState<T>): string {
  switch (state.status) {
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Loaded: ${JSON.stringify(state.data)}`;
    case 'error':
      return `Error: ${state.error}`;
    default:
      // TypeScript ensures this is never reached
      const _exhaustive: never = state;
      return _exhaustive;
  }
}

// Brand types for type safety
type UserId = number & { readonly brand: unique symbol };
type ProductId = number & { readonly brand: unique symbol };

function createUserId(id: number): UserId {
  return id as UserId;
}

function createProductId(id: number): ProductId {
  return id as ProductId;
}

// This prevents mixing up different ID types
function getUserById(id: UserId): User | null {
  // Implementation
  return null;
}

const userId = createUserId(123);
const productId = createProductId(456);

getUserById(userId); // ✓ Valid
// getUserById(productId); // ✗ TypeScript error

// Utility type helpers
type NonNullable<T> = T extends null | undefined ? never : T;
type ValueOf<T> = T[keyof T];
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Usage examples
type UserStringKeys = KeysOfType<User, string>; // 'name' | 'email'
type UserPreferenceValues = ValueOf<UserPreferences>; // string | boolean | object
```

## Module Declaration and Ambient Types

```typescript
// Declare global extensions
declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    dataLayer: any[];
  }

  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      API_URL: string;
      DATABASE_URL: string;
    }
  }
}

// Module augmentation
declare module 'express' {
  interface Request {
    user?: User;
  }
}

// Type definitions for external libraries
declare module 'my-custom-library' {
  export interface Config {
    apiKey: string;
    baseUrl: string;
  }

  export function initialize(config: Config): void;
  export function makeRequest<T>(endpoint: string): Promise<T>;
}

// Ambient module declarations
declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.css' {
  const styles: Record<string, string>;
  export default styles;
}

// Environment-specific types
interface Environment {
  NODE_ENV: string;
  API_URL: string;
  DEBUG: boolean;
}

declare const process: {
  env: Environment;
};

// Export types for consumption
export type {
  User,
  UserPreferences,
  ApiResponse,
  PaginatedResponse,
  AsyncState,
  EventMap,
  ValidationResult,
  FormManager
};

export {
  UserService,
  ApiWrapper,
  FormValidator,
  TypedEventEmitter,
  Store,
  validationRules
};
```

## TypeScript Best Practices

1. **Use strict TypeScript configuration** with strict mode enabled
2. **Define clear interfaces** for all data structures
3. **Leverage generic types** for reusable components
4. **Use type guards** to safely narrow types
5. **Implement proper error handling** with typed errors
6. **Use discriminated unions** for state management
7. **Create utility types** for common patterns
8. **Declare ambient types** for external libraries
9. **Use branded types** for type safety with primitives
10. **Prefer composition over inheritance** with interfaces