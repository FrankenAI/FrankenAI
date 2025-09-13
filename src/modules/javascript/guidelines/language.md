# JavaScript Language Guidelines

## Modern JavaScript Patterns

Use modern ES6+ features for clean, maintainable code:

```javascript
// Destructuring and spread operators
const { name, email, ...userData } = user;
const newUser = { ...userData, isActive: true };

// Arrow functions and concise syntax
const users = await Promise.all(
  userIds.map(async id => {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  })
);

// Template literals for string interpolation
const message = `Welcome ${user.name}! You have ${notifications.length} notifications.`;

// Default parameters and object shorthand
function createUser(name, email, role = 'user') {
  return { name, email, role, createdAt: new Date() };
}

// Array methods for functional programming
const activeUsers = users
  .filter(user => user.isActive)
  .map(user => ({ ...user, displayName: `${user.firstName} ${user.lastName}` }))
  .sort((a, b) => a.displayName.localeCompare(b.displayName));
```

## Async/Await and Promise Handling

```javascript
// Async/await for cleaner asynchronous code
class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Parallel requests with Promise.all
  async getMultiple(endpoints) {
    try {
      const promises = endpoints.map(endpoint => this.get(endpoint));
      return await Promise.all(promises);
    } catch (error) {
      console.error('Multiple API requests failed:', error);
      throw error;
    }
  }

  // Sequential requests with proper error handling
  async getSequential(endpoints) {
    const results = [];

    for (const endpoint of endpoints) {
      try {
        const result = await this.get(endpoint);
        results.push(result);
      } catch (error) {
        console.warn(`Failed to fetch ${endpoint}:`, error);
        results.push(null);
      }
    }

    return results;
  }
}

// Usage example
const api = new ApiService('https://api.example.com');

async function loadUserData(userId) {
  try {
    const [user, posts, comments] = await api.getMultiple([
      `/users/${userId}`,
      `/users/${userId}/posts`,
      `/users/${userId}/comments`
    ]);

    return { user, posts, comments };
  } catch (error) {
    console.error('Failed to load user data:', error);
    return null;
  }
}
```

## Module System and Imports

```javascript
// Named exports and imports
// utils/api.js
export const API_BASE_URL = 'https://api.example.com';

export function buildUrl(endpoint, params = {}) {
  const url = new URL(endpoint, API_BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export class HttpClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
  }

  setAuthToken(token) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  async request(method, endpoint, options = {}) {
    const url = buildUrl(endpoint, options.params);

    const config = {
      method,
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// services/userService.js
import { HttpClient } from '../utils/api.js';

const client = new HttpClient();

export async function getUsers(filters = {}) {
  return client.request('GET', '/users', { params: filters });
}

export async function getUserById(id) {
  return client.request('GET', `/users/${id}`);
}

export async function createUser(userData) {
  return client.request('POST', '/users', { body: userData });
}

export async function updateUser(id, updates) {
  return client.request('PUT', `/users/${id}`, { body: updates });
}

export async function deleteUser(id) {
  return client.request('DELETE', `/users/${id}`);
}

// Dynamic imports for code splitting
export async function loadUserModule() {
  const { UserManager } = await import('./advanced/UserManager.js');
  return new UserManager();
}

// Default export usage
// components/UserList.js
export default class UserList {
  constructor(container) {
    this.container = container;
    this.users = [];
  }

  async render() {
    this.container.innerHTML = this.users
      .map(user => `
        <div class="user-card">
          <h3>${user.name}</h3>
          <p>${user.email}</p>
        </div>
      `)
      .join('');
  }

  async loadUsers() {
    const { getUsers } = await import('../services/userService.js');
    this.users = await getUsers();
    this.render();
  }
}
```

## Error Handling and Validation

```javascript
// Custom error classes
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class ApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
  }
}

// Validation utilities
const validators = {
  required: (value, fieldName) => {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
  },

  email: (value, fieldName) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError(`${fieldName} must be a valid email`, fieldName);
    }
  },

  minLength: (min) => (value, fieldName) => {
    if (value.length < min) {
      throw new ValidationError(`${fieldName} must be at least ${min} characters`, fieldName);
    }
  },

  oneOf: (options) => (value, fieldName) => {
    if (!options.includes(value)) {
      throw new ValidationError(`${fieldName} must be one of: ${options.join(', ')}`, fieldName);
    }
  }
};

// Form validation
class FormValidator {
  constructor(schema) {
    this.schema = schema;
  }

  validate(data) {
    const errors = {};

    for (const [field, rules] of Object.entries(this.schema)) {
      try {
        const value = data[field];

        for (const rule of rules) {
          rule(value, field);
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          errors[error.field] = error.message;
        } else {
          throw error;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.errors = errors;
      throw error;
    }

    return true;
  }
}

// Usage example
const userValidator = new FormValidator({
  name: [validators.required, validators.minLength(2)],
  email: [validators.required, validators.email],
  role: [validators.required, validators.oneOf(['user', 'admin', 'moderator'])]
});

async function createUser(userData) {
  try {
    // Validate input
    userValidator.validate(userData);

    // Create user
    const user = await api.post('/users', userData);

    console.log('User created successfully:', user);
    return user;
  } catch (error) {
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      return { success: false, errors: error.errors };
    } else if (error instanceof ApiError) {
      console.error('API error:', error.message);
      return { success: false, error: error.message };
    } else {
      console.error('Unexpected error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}
```

## DOM Manipulation and Event Handling

```javascript
// Modern DOM utilities
class DOMHelper {
  static $(selector, context = document) {
    return context.querySelector(selector);
  }

  static $$(selector, context = document) {
    return Array.from(context.querySelectorAll(selector));
  }

  static create(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, value);
      } else {
        element[key] = value;
      }
    });

    // Add children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.textContent = child;
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });

    return element;
  }

  static on(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);

    // Return cleanup function
    return () => element.removeEventListener(event, handler, options);
  }

  static delegate(container, selector, event, handler) {
    const delegatedHandler = (e) => {
      const target = e.target.closest(selector);
      if (target && container.contains(target)) {
        handler.call(target, e);
      }
    };

    container.addEventListener(event, delegatedHandler);

    return () => container.removeEventListener(event, delegatedHandler);
  }
}

// Component-based architecture
class Component {
  constructor(element) {
    this.element = element;
    this.cleanupFunctions = [];
    this.init();
  }

  init() {
    // Override in subclasses
  }

  on(event, handler, options) {
    const cleanup = DOMHelper.on(this.element, event, handler, options);
    this.cleanupFunctions.push(cleanup);
    return cleanup;
  }

  delegate(selector, event, handler) {
    const cleanup = DOMHelper.delegate(this.element, selector, event, handler);
    this.cleanupFunctions.push(cleanup);
    return cleanup;
  }

  destroy() {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
  }
}

// Example component
class TodoList extends Component {
  init() {
    this.todos = [];
    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    // Add new todo
    this.delegate('.add-todo-form', 'submit', (e) => {
      e.preventDefault();
      const input = e.target.querySelector('input[name="todo"]');
      this.addTodo(input.value.trim());
      input.value = '';
    });

    // Toggle todo completion
    this.delegate('.todo-item .toggle', 'click', (e) => {
      const todoId = parseInt(e.target.dataset.id);
      this.toggleTodo(todoId);
    });

    // Delete todo
    this.delegate('.todo-item .delete', 'click', (e) => {
      const todoId = parseInt(e.target.dataset.id);
      this.deleteTodo(todoId);
    });
  }

  addTodo(text) {
    if (!text) return;

    const todo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date()
    };

    this.todos.push(todo);
    this.render();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.render();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.render();
  }

  render() {
    this.element.innerHTML = `
      <form class="add-todo-form">
        <input type="text" name="todo" placeholder="Add a new todo..." required>
        <button type="submit">Add</button>
      </form>

      <ul class="todo-list">
        ${this.todos.map(todo => `
          <li class="todo-item ${todo.completed ? 'completed' : ''}">
            <input type="checkbox" class="toggle" data-id="${todo.id}" ${todo.completed ? 'checked' : ''}>
            <span class="text">${todo.text}</span>
            <button class="delete" data-id="${todo.id}">Delete</button>
          </li>
        `).join('')}
      </ul>

      <div class="stats">
        Total: ${this.todos.length} |
        Completed: ${this.todos.filter(t => t.completed).length} |
        Pending: ${this.todos.filter(t => !t.completed).length}
      </div>
    `;
  }
}

// Auto-initialize components
document.addEventListener('DOMContentLoaded', () => {
  DOMHelper.$$('[data-component="todo-list"]').forEach(element => {
    new TodoList(element);
  });
});
```

## Local Storage and State Management

```javascript
// Storage utilities
class StorageManager {
  constructor(prefix = 'app') {
    this.prefix = prefix;
  }

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(`${this.prefix}:${key}`);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Failed to get ${key} from storage:`, error);
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set ${key} in storage:`, error);
      return false;
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(`${this.prefix}:${key}`);
      return true;
    } catch (error) {
      console.warn(`Failed to remove ${key} from storage:`, error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage)
        .filter(key => key.startsWith(`${this.prefix}:`));

      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.warn('Failed to clear storage:', error);
      return false;
    }
  }
}

// Simple state management
class Store {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.listeners = [];
    this.storage = new StorageManager('store');

    // Load persisted state
    this.loadPersistedState();
  }

  getState() {
    return { ...this.state };
  }

  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Persist state
    this.persistState();

    // Notify listeners
    this.listeners.forEach(listener => {
      listener(this.state, prevState);
    });
  }

  subscribe(listener) {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  persistState() {
    this.storage.set('state', this.state);
  }

  loadPersistedState() {
    const persistedState = this.storage.get('state');
    if (persistedState) {
      this.state = { ...this.state, ...persistedState };
    }
  }

  // Action creators
  createAction(type) {
    return (payload) => {
      this.setState({
        [`${type}State`]: payload,
        lastAction: { type, payload, timestamp: Date.now() }
      });
    };
  }
}

// Usage example
const store = new Store({
  user: null,
  isAuthenticated: false,
  todos: [],
  filter: 'all'
});

// Actions
const setUser = store.createAction('user');
const setAuthenticated = store.createAction('authenticated');
const setTodos = store.createAction('todos');
const setFilter = store.createAction('filter');

// Subscribe to state changes
const unsubscribe = store.subscribe((newState, prevState) => {
  console.log('State changed:', { newState, prevState });

  // React to authentication changes
  if (newState.isAuthenticated !== prevState.isAuthenticated) {
    if (newState.isAuthenticated) {
      console.log('User logged in');
      loadUserData();
    } else {
      console.log('User logged out');
      clearUserData();
    }
  }
});

async function loadUserData() {
  try {
    const user = await api.get('/user');
    setUser(user);
    setAuthenticated(true);
  } catch (error) {
    console.error('Failed to load user data:', error);
    setAuthenticated(false);
  }
}

function clearUserData() {
  setUser(null);
  setTodos([]);
  store.storage.clear();
}
```

## Performance and Optimization

```javascript
// Debouncing and throttling
function debounce(func, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function throttle(func, delay) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      return func.apply(this, args);
    }
  };
}

// Memoization
function memoize(func, keyGenerator = (...args) => JSON.stringify(args)) {
  const cache = new Map();

  return function (...args) {
    const key = keyGenerator(...args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func.apply(this, args);
    cache.set(key, result);

    return result;
  };
}

// Lazy loading with Intersection Observer
class LazyLoader {
  constructor(options = {}) {
    this.options = {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    };

    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
  }

  observe(element) {
    this.observer.observe(element);
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;

        // Load image
        if (element.dataset.src) {
          element.src = element.dataset.src;
          element.removeAttribute('data-src');
        }

        // Load component
        if (element.dataset.component) {
          this.loadComponent(element, element.dataset.component);
        }

        // Trigger custom load event
        element.dispatchEvent(new CustomEvent('lazy-load'));

        this.observer.unobserve(element);
      }
    });
  }

  async loadComponent(element, componentName) {
    try {
      const { default: Component } = await import(`./components/${componentName}.js`);
      new Component(element);
    } catch (error) {
      console.error(`Failed to load component ${componentName}:`, error);
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  static measure(name, fn) {
    return async function (...args) {
      const start = performance.now();

      try {
        const result = await fn.apply(this, args);
        const duration = performance.now() - start;

        console.log(`${name} took ${duration.toFixed(2)}ms`);

        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`${name} failed after ${duration.toFixed(2)}ms:`, error);
        throw error;
      }
    };
  }

  static logMemoryUsage() {
    if (performance.memory) {
      const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory;

      console.log('Memory Usage:', {
        used: `${(usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
}

// Usage examples
const debouncedSearch = debounce(async (query) => {
  const results = await api.get('/search', { q: query });
  displayResults(results);
}, 300);

const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 16); // ~60fps

const memoizedCalculation = memoize((a, b, c) => {
  // Expensive calculation
  return Math.pow(a, b) + Math.sqrt(c);
});

// Initialize lazy loading
const lazyLoader = new LazyLoader();
document.querySelectorAll('[data-src], [data-component]').forEach(element => {
  lazyLoader.observe(element);
});
```

## JavaScript Best Practices

1. **Use modern ES6+ syntax** for cleaner, more readable code
2. **Handle promises properly** with async/await and error catching
3. **Implement proper error handling** with custom error classes
4. **Use modules** for better code organization and reusability
5. **Validate input data** before processing
6. **Optimize performance** with debouncing, throttling, and memoization
7. **Handle DOM events efficiently** with delegation
8. **Implement proper state management** for complex applications
9. **Use lazy loading** for better initial page performance
10. **Monitor and measure performance** in production applications