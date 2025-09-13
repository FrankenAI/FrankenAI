# Vue.js Framework Guidelines

## Core Principles

### Composition API First

Always prefer the Composition API over Options API for better TypeScript support and code organization:

```vue
<!-- ✅ Good - Composition API with <script setup> -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])
const searchTerm = ref('')

const filteredUsers = computed(() =>
  users.value.filter(user =>
    user.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
)

onMounted(async () => {
  users.value = await fetchUsers()
})
</script>

<template>
  <div>
    <input v-model="searchTerm" placeholder="Search users..." />
    <div v-for="user in filteredUsers" :key="user.id">
      {{ user.name }} - {{ user.email }}
    </div>
  </div>
</template>
```

### Single File Components (SFC)

Structure your SFC files consistently:

```vue
<!-- 1. Script section first -->
<script setup lang="ts">
// Imports
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import UserCard from '@/components/UserCard.vue'

// Props and Emits
interface Props {
  users: User[]
  loading?: boolean
}

interface Emits {
  select: [user: User]
  delete: [id: number]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// Composables
const router = useRouter()

// Reactive state
const selectedUser = ref<User | null>(null)

// Computed
const hasUsers = computed(() => props.users.length > 0)

// Methods
const selectUser = (user: User) => {
  selectedUser.value = user
  emit('select', user)
}
</script>

<!-- 2. Template second -->
<template>
  <div class="user-list">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="!hasUsers" class="empty">No users found</div>
    <UserCard
      v-for="user in users"
      :key="user.id"
      :user="user"
      :selected="selectedUser?.id === user.id"
      @click="selectUser(user)"
      @delete="emit('delete', user.id)"
    />
  </div>
</template>

<!-- 3. Styles last -->
<style scoped>
.user-list {
  display: grid;
  gap: 1rem;
}

.loading,
.empty {
  padding: 2rem;
  text-align: center;
  color: var(--color-muted);
}
</style>
```

### TypeScript Integration

Always use TypeScript with Vue for better development experience:

```vue
<script setup lang="ts">
// Define interfaces for props
interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
}

interface CartItem extends Product {
  quantity: number
}

// Props with TypeScript
interface Props {
  products: Product[]
  cartItems: CartItem[]
  currency?: 'USD' | 'EUR' | 'GBP'
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'USD'
})

// Emits with TypeScript
interface Emits {
  addToCart: [product: Product, quantity: number]
  removeFromCart: [productId: number]
  updateQuantity: [productId: number, quantity: number]
}

const emit = defineEmits<Emits>()

// Reactive refs with types
const searchQuery = ref<string>('')
const selectedCategory = ref<string>('all')
const sortBy = ref<'name' | 'price'>('name')

// Computed with proper typing
const filteredProducts = computed<Product[]>(() => {
  return props.products
    .filter(product => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
      const matchesCategory = selectedCategory.value === 'all' ||
        product.category === selectedCategory.value
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy.value === 'price') {
        return a.price - b.price
      }
      return a.name.localeCompare(b.name)
    })
})
</script>
```

## Reactivity Best Practices

### Use Reactive References Correctly

```vue
<script setup lang="ts">
// ✅ Use ref() for primitives
const count = ref(0)
const message = ref('')
const isLoading = ref(false)

// ✅ Use reactive() for objects (when you need deep reactivity)
const user = reactive({
  name: '',
  email: '',
  preferences: {
    theme: 'light',
    notifications: true
  }
})

// ✅ Use ref() for objects when you might replace the entire object
const currentUser = ref<User | null>(null)

// ✅ Use shallowRef() for large objects that don't need deep reactivity
const largeDataset = shallowRef<DataPoint[]>([])

// Methods
const updateUser = (newUser: User) => {
  // This triggers reactivity
  currentUser.value = newUser
}

const updateUserName = (name: string) => {
  // This also triggers reactivity
  user.name = name
}
</script>
```

### Watchers and Effects

```vue
<script setup lang="ts">
import { watch, watchEffect, nextTick } from 'vue'

const searchTerm = ref('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref(false)

// ✅ Use watch for specific reactive dependencies
watch(searchTerm, async (newTerm, oldTerm) => {
  if (newTerm.length < 2) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    searchResults.value = await searchApi(newTerm)
  } catch (error) {
    console.error('Search failed:', error)
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}, {
  debounce: 300 // Debounce the search
})

// ✅ Use watchEffect for automatic dependency tracking
watchEffect(async () => {
  // This will re-run whenever any reactive dependency changes
  if (user.value?.id) {
    const preferences = await fetchUserPreferences(user.value.id)
    userPreferences.value = preferences
  }
})

// ✅ Use nextTick for DOM updates
const scrollToBottom = async () => {
  messages.value.push(newMessage)
  await nextTick()
  messagesContainer.value?.scrollToBottom()
}
</script>
```

## Component Communication

### Props and Emits

```vue
<script setup lang="ts">
// Child Component
interface Props {
  modelValue: string
  placeholder?: string
  disabled?: boolean
  rules?: ValidationRule[]
}

interface Emits {
  'update:modelValue': [value: string]
  'validation-change': [isValid: boolean]
  'focus': []
  'blur': []
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Enter text...',
  disabled: false,
  rules: () => []
})

const emit = defineEmits<Emits>()

// Two-way binding helper
const value = computed({
  get: () => props.modelValue,
  set: (newValue: string) => emit('update:modelValue', newValue)
})

// Validation
const errors = ref<string[]>([])
const isValid = computed(() => errors.value.length === 0)

watch(isValid, (valid) => {
  emit('validation-change', valid)
})
</script>

<template>
  <div class="input-field">
    <input
      v-model="value"
      :placeholder="placeholder"
      :disabled="disabled"
      @focus="emit('focus')"
      @blur="emit('blur')"
    />
    <div v-if="errors.length" class="errors">
      <span v-for="error in errors" :key="error">{{ error }}</span>
    </div>
  </div>
</template>
```

### Provide/Inject for Deep Nesting

```vue
<!-- Parent Component -->
<script setup lang="ts">
import { provide } from 'vue'

interface AppConfig {
  theme: 'light' | 'dark'
  apiUrl: string
  features: string[]
}

const config = reactive<AppConfig>({
  theme: 'light',
  apiUrl: '/api',
  features: ['notifications', 'analytics']
})

// Provide configuration to all descendants
provide('appConfig', config)

// Provide methods
provide('updateTheme', (theme: 'light' | 'dark') => {
  config.theme = theme
})
</script>

<!-- Child Component (any level deep) -->
<script setup lang="ts">
import { inject } from 'vue'

// Inject with type safety
const config = inject<AppConfig>('appConfig')
const updateTheme = inject<(theme: 'light' | 'dark') => void>('updateTheme')

if (!config) {
  throw new Error('appConfig not provided')
}
</script>
```

## Composables (Custom Hooks)

### Creating Reusable Logic

```typescript
// composables/useApi.ts
import { ref, computed } from 'vue'

export function useApi<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const execute = async (options?: RequestInit) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      data.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  const isSuccess = computed(() => data.value !== null && error.value === null)

  return {
    data: readonly(data),
    error: readonly(error),
    isLoading: readonly(isLoading),
    isSuccess,
    execute
  }
}

// composables/useLocalStorage.ts
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = localStorage.getItem(key)
  const initialValue = storedValue ? JSON.parse(storedValue) : defaultValue

  const value = ref<T>(initialValue)

  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return value
}
```

### Using Composables in Components

```vue
<script setup lang="ts">
import { useApi } from '@/composables/useApi'
import { useLocalStorage } from '@/composables/useLocalStorage'

interface User {
  id: number
  name: string
  email: string
}

// Use API composable
const { data: users, isLoading, error, execute } = useApi<User[]>('/api/users')

// Use localStorage composable
const userPreferences = useLocalStorage('userPreferences', {
  theme: 'light',
  pageSize: 10
})

onMounted(() => {
  execute()
})
</script>
```

## Performance Optimization

### Lazy Loading and Code Splitting

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue') // Lazy loaded
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})
```

### Component Optimization

```vue
<script setup lang="ts">
// ✅ Use defineAsyncComponent for heavy components
const HeavyChart = defineAsyncComponent(() => import('@/components/HeavyChart.vue'))

// ✅ Use shallowRef for large datasets that don't need deep reactivity
const largeList = shallowRef<Item[]>([])

// ✅ Use computed for expensive calculations
const expensiveCalculation = computed(() => {
  return largeList.value.reduce((acc, item) => {
    return acc + item.complexCalculation()
  }, 0)
})

// ✅ Use v-memo for expensive list rendering
</script>

<template>
  <div>
    <!-- Use v-memo to cache expensive renders -->
    <div
      v-for="item in largeList"
      :key="item.id"
      v-memo="[item.name, item.price]"
    >
      <ExpensiveComponent :item="item" />
    </div>

    <!-- Lazy load heavy components -->
    <Suspense>
      <HeavyChart :data="chartData" />
      <template #fallback>
        <div>Loading chart...</div>
      </template>
    </Suspense>
  </div>
</template>
```

## Testing Best Practices

### Component Testing

```typescript
// tests/components/UserCard.spec.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UserCard from '@/components/UserCard.vue'

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  }

  it('renders user information correctly', () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser }
    })

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('john@example.com')
  })

  it('emits select event when clicked', async () => {
    const wrapper = mount(UserCard, {
      props: { user: mockUser }
    })

    await wrapper.find('[data-testid="user-card"]').trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual([mockUser])
  })
})
```

## Common Patterns

### Form Handling

```vue
<script setup lang="ts">
interface FormData {
  name: string
  email: string
  message: string
}

const form = reactive<FormData>({
  name: '',
  email: '',
  message: ''
})

const errors = reactive<Partial<Record<keyof FormData, string>>>({})
const isSubmitting = ref(false)

const validateField = (field: keyof FormData, value: string): string | null => {
  switch (field) {
    case 'name':
      return value.length < 2 ? 'Name must be at least 2 characters' : null
    case 'email':
      return !value.includes('@') ? 'Invalid email address' : null
    case 'message':
      return value.length < 10 ? 'Message must be at least 10 characters' : null
    default:
      return null
  }
}

const submitForm = async () => {
  // Validate all fields
  Object.keys(form).forEach(key => {
    const field = key as keyof FormData
    const error = validateField(field, form[field])
    if (error) {
      errors[field] = error
    } else {
      delete errors[field]
    }
  })

  if (Object.keys(errors).length > 0) return

  isSubmitting.value = true
  try {
    await submitToApi(form)
    // Reset form
    Object.assign(form, { name: '', email: '', message: '' })
  } catch (error) {
    console.error('Submit failed:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

## What NOT to Do

1. **Don't use Options API** for new components - use Composition API
2. **Don't mutate props directly** - use emits or v-model
3. **Don't overuse reactive()** - prefer ref() for most cases
4. **Don't forget to handle loading and error states**
5. **Don't skip TypeScript** - it catches bugs early
6. **Don't create massive components** - break them down
7. **Don't ignore Vue DevTools** - use them for debugging