# Vue 3 Specific Features

## Composition API (Native in Vue 3)

Vue 3's Composition API provides better TypeScript support, logic reuse, and organization:

```vue
<template>
  <div class="product-search">
    <div class="search-bar">
      <input
        v-model="searchQuery"
        @input="debouncedSearch"
        placeholder="Search products..."
        class="search-input"
      />
      <select v-model="selectedCategory" @change="search">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <div v-if="loading" class="loading">Searching...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="products.length === 0" class="empty">No products found</div>

    <div v-else class="products-grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @add-to-cart="handleAddToCart"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useDebounceFn, useLocalStorage } from '@vueuse/core'
import ProductCard from './ProductCard.vue'

interface Product {
  id: number
  name: string
  price: number
  category: string
  image: string
}

// Reactive refs
const searchQuery = ref('')
const selectedCategory = ref('')
const products = ref<Product[]>([])
const categories = ref<string[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Composables
const recentSearches = useLocalStorage<string[]>('recent-searches', [])

// Computed properties
const hasFilters = computed(() => searchQuery.value || selectedCategory.value)

// Methods
const search = async () => {
  if (!hasFilters.value) {
    products.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.set('q', searchQuery.value)
    if (selectedCategory.value) params.set('category', selectedCategory.value)

    const response = await fetch(`/api/products/search?${params}`)
    if (!response.ok) throw new Error('Search failed')

    products.value = await response.json()

    // Save to recent searches
    if (searchQuery.value && !recentSearches.value.includes(searchQuery.value)) {
      recentSearches.value.unshift(searchQuery.value)
      recentSearches.value = recentSearches.value.slice(0, 5) // Keep only 5
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Search failed'
  } finally {
    loading.value = false
  }
}

// Debounced search function
const debouncedSearch = useDebounceFn(search, 300)

const handleAddToCart = (product: Product) => {
  // Emit to parent or handle cart logic
  console.log('Adding to cart:', product)
}

// Watchers
watch(selectedCategory, search)

// Lifecycle
onMounted(async () => {
  try {
    const response = await fetch('/api/categories')
    categories.value = await response.json()
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
})
</script>

<style scoped>
.product-search {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #ef4444;
}
</style>
```

## Script Setup Syntax

`<script setup>` is the recommended syntax in Vue 3:

```vue
<template>
  <div class="user-dashboard">
    <UserProfile :user="user" @update="handleUserUpdate" />
    <UserStats :stats="userStats" />
    <UserSettings v-model:preferences="userPreferences" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserProfile from './UserProfile.vue'
import UserStats from './UserStats.vue'
import UserSettings from './UserSettings.vue'

// Props with TypeScript
interface Props {
  userId: number
  initialTab?: string
}

const props = withDefaults(defineProps<Props>(), {
  initialTab: 'profile'
})

// Emits
interface Emits {
  tabChange: [tab: string]
  userUpdate: [user: User]
}

const emit = defineEmits<Emits>()

// Stores and composables
const router = useRouter()
const userStore = useUserStore()

// Reactive state
const user = ref<User | null>(null)
const userPreferences = ref({
  theme: 'light',
  notifications: true,
  language: 'en'
})

// Computed
const userStats = computed(() => ({
  loginCount: user.value?.loginCount || 0,
  lastLogin: user.value?.lastLogin,
  memberSince: user.value?.createdAt
}))

// Methods
const handleUserUpdate = async (updatedUser: User) => {
  user.value = updatedUser
  await userStore.updateUser(updatedUser)
  emit('userUpdate', updatedUser)
}

// Provide/Inject
provide('userContext', {
  user: readonly(user),
  updateUser: handleUserUpdate
})

// Lifecycle
onMounted(async () => {
  user.value = await userStore.fetchUser(props.userId)
})

// Watchers
watch(() => props.userId, async (newId) => {
  user.value = await userStore.fetchUser(newId)
})
</script>
```

## Multiple v-model (Vue 3 Feature)

```vue
<!-- Parent Component -->
<template>
  <UserForm
    v-model:name="user.name"
    v-model:email="user.email"
    v-model:preferences="user.preferences"
    @submit="handleSubmit"
  />
</template>

<script setup>
const user = ref({
  name: '',
  email: '',
  preferences: { theme: 'light' }
})
</script>

<!-- UserForm.vue -->
<template>
  <form @submit.prevent="$emit('submit')">
    <input
      :value="name"
      @input="$emit('update:name', $event.target.value)"
      placeholder="Name"
    />

    <input
      :value="email"
      @input="$emit('update:email', $event.target.value)"
      placeholder="Email"
      type="email"
    />

    <PreferencesEditor
      :modelValue="preferences"
      @update:modelValue="$emit('update:preferences', $event)"
    />

    <button type="submit">Save</button>
  </form>
</template>

<script setup>
interface Props {
  name: string
  email: string
  preferences: UserPreferences
}

interface Emits {
  'update:name': [name: string]
  'update:email': [email: string]
  'update:preferences': [preferences: UserPreferences]
  submit: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>
```

## Fragments and Multiple Root Nodes

```vue
<template>
  <!-- Multiple root nodes allowed in Vue 3 -->
  <header class="page-header">
    <h1>{{ title }}</h1>
  </header>

  <main class="page-content">
    <slot />
  </main>

  <footer class="page-footer">
    <p>&copy; 2024 My App</p>
  </footer>
</template>

<script setup>
interface Props {
  title: string
}

defineProps<Props>()
</script>
```

## Teleport (Vue 3 Feature)

```vue
<template>
  <div class="modal-container">
    <button @click="showModal = true">Open Modal</button>

    <!-- Teleport modal to body -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="showModal = false">
        <div class="modal-content" @click.stop>
          <h2>Modal Title</h2>
          <p>Modal content goes here...</p>
          <button @click="showModal = false">Close</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const showModal = ref(false)
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 90%;
}
</style>
```

## Suspense (Vue 3 Feature)

```vue
<template>
  <div class="app">
    <Suspense>
      <template #default>
        <AsyncUserDashboard :user-id="userId" />
      </template>

      <template #fallback>
        <div class="loading-skeleton">
          <div class="skeleton-header"></div>
          <div class="skeleton-content"></div>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import AsyncUserDashboard from './AsyncUserDashboard.vue'

const userId = ref(1)
</script>

<!-- AsyncUserDashboard.vue -->
<template>
  <div class="dashboard">
    <h1>Welcome, {{ user.name }}!</h1>
    <UserStats :stats="userStats" />
  </div>
</template>

<script setup>
interface Props {
  userId: number
}

const props = defineProps<Props>()

// This makes the component async
const { data: user } = await useFetch(`/api/users/${props.userId}`)
const { data: userStats } = await useFetch(`/api/users/${props.userId}/stats`)
</script>
```

## Custom Directives (Vue 3 API)

```javascript
// directives/focus.js
export const vFocus = {
  mounted(el, binding) {
    if (binding.value !== false) {
      el.focus()
    }
  },

  updated(el, binding) {
    if (binding.value && !binding.oldValue) {
      el.focus()
    }
  }
}

// directives/clickOutside.js
export const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el._clickOutside)
  },

  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
    delete el._clickOutside
  }
}

// Using in component
<template>
  <div v-click-outside="closeDropdown" class="dropdown">
    <button @click="isOpen = !isOpen">Toggle</button>
    <ul v-if="isOpen" class="dropdown-menu">
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>
```

## Composables Pattern

```typescript
// composables/useCounter.ts
import { ref, computed } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue

  const isPositive = computed(() => count.value > 0)
  const isZero = computed(() => count.value === 0)

  return {
    count: readonly(count),
    increment,
    decrement,
    reset,
    isPositive,
    isZero
  }
}

// composables/useApi.ts
import { ref, computed } from 'vue'

export function useApi<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const loading = ref(false)

  const execute = async (options?: RequestInit) => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(url, options)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      data.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  const isSuccess = computed(() => data.value !== null && error.value === null)

  return {
    data: readonly(data),
    error: readonly(error),
    loading: readonly(loading),
    isSuccess,
    execute
  }
}

// Using composables
<script setup>
const { count, increment, decrement, isPositive } = useCounter(5)
const { data: users, loading, execute: fetchUsers } = useApi('/api/users')

onMounted(() => {
  fetchUsers()
})
</script>
```

## Global Properties (Vue 3 Style)

```javascript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// Global properties
app.config.globalProperties.$http = axios
app.config.globalProperties.$formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US').format(date)
}

// Global components
app.component('BaseButton', BaseButton)
app.component('BaseInput', BaseInput)

// Global directives
app.directive('focus', vFocus)
app.directive('click-outside', vClickOutside)

app.mount('#app')
```

## Vue 3 Performance Features

### Ref vs Reactive Performance

```typescript
// Prefer ref for primitives (better performance)
const count = ref(0)
const name = ref('')
const isLoading = ref(false)

// Use reactive for objects when you need deep reactivity
const user = reactive({
  name: '',
  email: '',
  preferences: {
    theme: 'light'
  }
})

// Use shallowRef for large objects
const largeDataSet = shallowRef([])

// Use shallowReactive for large objects with shallow reactivity
const cache = shallowReactive(new Map())
```

## Migration Benefits from Vue 2

### Better TypeScript Support
- Full TypeScript support out of the box
- Better type inference
- Generic components support

### Performance Improvements
- Smaller bundle size
- Faster runtime performance
- Better tree-shaking

### Developer Experience
- Better debugging with Vue DevTools
- Composition API for better code organization
- Multiple root nodes support
- Better IDE support