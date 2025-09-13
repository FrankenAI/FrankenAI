# Nuxt 3 Specific Features

## Composition API and Script Setup

Nuxt 3 uses Vue 3 with Composition API as the default pattern:

```vue
<template>
  <div class="product-dashboard">
    <div class="search-section">
      <input
        v-model="searchQuery"
        placeholder="Search products..."
        class="search-input"
      />
      <select v-model="selectedCategory">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <div v-if="pending" class="loading">Loading products...</div>
    <div v-else-if="error" class="error">Error: {{ error.message }}</div>

    <div v-else class="products-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @add-to-cart="handleAddToCart"
      />
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: page === currentPage }"
        @click="navigateToPage(page)"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image: string
}

interface ProductResponse {
  products: Product[]
  total: number
  page: number
  pages: number
}

// Define page meta
definePageMeta({
  layout: 'default',
  middleware: ['auth']
})

// Route parameters
const route = useRoute()
const router = useRouter()

// Reactive state
const searchQuery = ref('')
const selectedCategory = ref(route.query.category as string || '')
const currentPage = ref(parseInt(route.query.page as string) || 1)

// Computed values
const queryParams = computed(() => ({
  page: currentPage.value,
  category: selectedCategory.value,
  limit: 12
}))

// Data fetching
const { data: productData, pending, error, refresh } = await useFetch<ProductResponse>('/api/products', {
  query: queryParams,
  server: true,
  key: 'products'
})

const { data: categories } = await useFetch<string[]>('/api/categories', {
  server: true,
  default: () => []
})

// Computed properties
const filteredProducts = computed(() => {
  if (!productData.value?.products) return []

  if (!searchQuery.value) return productData.value.products

  return productData.value.products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalPages = computed(() => productData.value?.pages || 0)

// Methods
const handleAddToCart = (product: Product) => {
  const cartStore = useCartStore()
  cartStore.addItem(product)

  // Show toast notification
  const toast = useToast()
  toast.add({
    title: 'Success',
    description: `${product.name} added to cart!`,
    color: 'green'
  })
}

const navigateToPage = (page: number) => {
  router.push({
    query: { ...route.query, page: page.toString() }
  })
}

// Watchers
watch(selectedCategory, (newCategory) => {
  router.push({
    query: { ...route.query, category: newCategory, page: '1' }
  })
})

// SEO and meta
useSeoMeta({
  title: `Products${selectedCategory.value ? ` - ${selectedCategory.value}` : ''}`,
  ogTitle: 'Our Products',
  description: 'Browse our amazing collection of products',
  ogDescription: 'Discover high-quality products at great prices',
  ogImage: '/images/products-og.jpg'
})
</script>
```

## Auto Imports and Utils

Nuxt 3 provides extensive auto-imports:

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const token = useCookie('auth-token', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  })

  const login = async (credentials: LoginCredentials) => {
    try {
      const { data } = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      user.value = data.user
      token.value = data.token

      await navigateTo('/dashboard')
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })

    user.value = null
    token.value = null

    await navigateTo('/login')
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      const userData = await $fetch<User>('/api/auth/user', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      user.value = userData
    } catch (error) {
      token.value = null
      user.value = null
    }
  }

  return {
    user: readonly(user),
    login,
    logout,
    fetchUser
  }
}

// composables/useApi.ts
export const useApi = <T>(url: string, options?: any) => {
  return useFetch<T>(url, {
    baseURL: useRuntimeConfig().public.apiBase,
    onRequest({ request, options }) {
      const token = useCookie('auth-token')
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    },
    onRequestError({ request, options, error }) {
      console.error('Request error:', error)
    },
    onResponseError({ request, response, options }) {
      if (response.status === 401) {
        navigateTo('/login')
      }
    },
    ...options
  })
}

// utils/formatters.ts (auto-imported)
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

## Server API Routes

```typescript
// server/api/products/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const category = query.category as string || ''

  try {
    const products = await getProducts({
      page,
      limit,
      category
    })

    setHeader(event, 'Cache-Control', 's-maxage=60')

    return {
      products: products.data,
      total: products.total,
      page,
      pages: Math.ceil(products.total / limit)
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch products'
    })
  }
})

// server/api/products/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }

  try {
    const product = await getProductById(id)

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    return product
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch product'
    })
  }
})

// server/api/auth/login.post.ts
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, password } = body

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required'
    })
  }

  try {
    const user = await authenticateUser(email, password)
    const token = generateJWT(user)

    setCookie(event, 'auth-token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }
})

// server/api/auth/logout.post.ts
export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth-token')

  return { message: 'Logged out successfully' }
})
```

## Middleware System

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  if (!user.value) {
    return navigateTo('/login')
  }
})

// middleware/guest.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  if (user.value) {
    return navigateTo('/dashboard')
  }
})

// middleware/admin.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  const adminRoutes = ['/admin', '/admin/users', '/admin/settings']

  if (adminRoutes.includes(to.path)) {
    if (!user.value || user.value.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }
  }
})
```

## Pinia Store Integration

```typescript
// stores/cart.ts
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  )

  const addItem = (product: Product) => {
    const existingItem = items.value.find(item => item.id === product.id)

    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      })
    }

    // Persist to localStorage
    if (process.client) {
      localStorage.setItem('cart', JSON.stringify(items.value))
    }
  }

  const removeItem = (productId: number) => {
    const index = items.value.findIndex(item => item.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId: number, quantity: number) => {
    const item = items.value.find(item => item.id === productId)
    if (item) {
      item.quantity = Math.max(0, quantity)
      if (item.quantity === 0) {
        removeItem(productId)
      }
    }
  }

  const clearCart = () => {
    items.value = []
    if (process.client) {
      localStorage.removeItem('cart')
    }
  }

  // Hydrate from localStorage on client
  const hydrateFromStorage = () => {
    if (process.client) {
      const stored = localStorage.getItem('cart')
      if (stored) {
        items.value = JSON.parse(stored)
      }
    }
  }

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    hydrateFromStorage
  }
})

// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const preferences = ref({
    theme: 'light',
    language: 'en',
    notifications: true
  })

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const setUser = (userData: User) => {
    user.value = userData
  }

  const updatePreferences = async (newPreferences: Partial<UserPreferences>) => {
    preferences.value = { ...preferences.value, ...newPreferences }

    if (user.value) {
      await $fetch('/api/user/preferences', {
        method: 'PUT',
        body: preferences.value
      })
    }
  }

  const logout = () => {
    user.value = null
    preferences.value = {
      theme: 'light',
      language: 'en',
      notifications: true
    }
  }

  return {
    user,
    preferences,
    isAuthenticated,
    isAdmin,
    setUser,
    updatePreferences,
    logout
  }
})
```

## Layouts and Pages

```vue
<!-- layouts/default.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <main class="container mx-auto px-4 py-8">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Auto-imported composables
const cartStore = useCartStore()

// Hydrate cart from localStorage on client
onMounted(() => {
  cartStore.hydrateFromStorage()
})
</script>

<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <AdminSidebar />

    <div class="admin-content">
      <AdminHeader />
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin'
})
</script>

<!-- pages/products/[id].vue -->
<template>
  <div v-if="pending" class="loading">Loading product...</div>

  <div v-else-if="error" class="error">
    <h1>Product not found</h1>
    <p>The product you're looking for doesn't exist.</p>
    <NuxtLink to="/products">Back to products</NuxtLink>
  </div>

  <div v-else class="product-detail">
    <div class="product-images">
      <NuxtImg
        :src="product.image"
        :alt="product.name"
        width="600"
        height="400"
        class="main-image"
      />
    </div>

    <div class="product-info">
      <h1>{{ product.name }}</h1>
      <p class="price">{{ formatCurrency(product.price) }}</p>
      <p class="description">{{ product.description }}</p>

      <button
        @click="addToCart"
        class="add-to-cart-btn"
        :disabled="addingToCart"
      >
        {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const cartStore = useCartStore()

const addingToCart = ref(false)

// Fetch product data
const { data: product, pending, error } = await useFetch<Product>(`/api/products/${route.params.id}`)

// Handle add to cart
const addToCart = async () => {
  addingToCart.value = true

  try {
    cartStore.addItem(product.value!)

    // Show success message
    const toast = useToast()
    toast.add({
      title: 'Success',
      description: 'Product added to cart!',
      color: 'green'
    })
  } finally {
    addingToCart.value = false
  }
}

// SEO
useSeoMeta({
  title: product.value?.name,
  description: product.value?.description,
  ogTitle: product.value?.name,
  ogDescription: product.value?.description,
  ogImage: product.value?.image
})

// Breadcrumbs
definePageMeta({
  breadcrumbs: [
    { title: 'Home', to: '/' },
    { title: 'Products', to: '/products' },
    { title: () => product.value?.name || 'Product' }
  ]
})
</script>
```

## Image Optimization

```vue
<template>
  <div class="gallery">
    <!-- Optimized images with Nuxt Image -->
    <NuxtImg
      v-for="image in images"
      :key="image.id"
      :src="image.url"
      :alt="image.alt"
      width="400"
      height="300"
      format="webp"
      quality="80"
      loading="lazy"
      placeholder
      class="gallery-image"
    />

    <!-- Picture element with multiple formats -->
    <NuxtPicture
      src="/hero-image.jpg"
      alt="Hero Image"
      width="1200"
      height="600"
      format="webp,avif,jpg"
      quality="85"
      sizes="sm:100vw md:50vw lg:400px"
      preload
    />
  </div>
</template>
```

## Build and Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  // CSS framework
  css: ['~/assets/css/main.css'],

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/google-fonts',
    '@vueuse/nuxt'
  ],

  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: process.env.JWT_SECRET,
    databaseUrl: process.env.DATABASE_URL,

    // Public keys (exposed to client-side)
    public: {
      apiBase: process.env.API_BASE_URL || '/api',
      appUrl: process.env.APP_URL || 'http://localhost:3000'
    }
  },

  // App configuration
  app: {
    head: {
      title: 'My Nuxt App',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Image optimization
  image: {
    format: ['webp', 'avif'],
    quality: 80,
    densities: [1, 2],
    domains: ['example.com']
  },

  // Nitro configuration
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // Experimental features
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: false
  }
})
```

## Testing in Nuxt 3

```typescript
// test/components/ProductCard.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '~/components/ProductCard.vue'

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 29.99,
    image: '/test-image.jpg',
    description: 'Test description'
  }

  it('renders product information correctly', () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct }
    })

    expect(wrapper.text()).toContain('Test Product')
    expect(wrapper.text()).toContain('$29.99')
    expect(wrapper.find('img').attributes('src')).toBe('/test-image.jpg')
  })

  it('emits add-to-cart event when button is clicked', async () => {
    const wrapper = mount(ProductCard, {
      props: { product: mockProduct }
    })

    await wrapper.find('.add-to-cart').trigger('click')

    expect(wrapper.emitted('add-to-cart')).toBeTruthy()
    expect(wrapper.emitted('add-to-cart')?.[0]).toEqual([mockProduct])
  })
})

// test/api/products.test.ts
import { describe, it, expect } from 'vitest'
import { $fetch } from '@nuxt/test-utils'

describe('/api/products', () => {
  it('returns products list', async () => {
    const response = await $fetch('/api/products')

    expect(response).toHaveProperty('products')
    expect(response).toHaveProperty('total')
    expect(Array.isArray(response.products)).toBe(true)
  })

  it('filters products by category', async () => {
    const response = await $fetch('/api/products?category=electronics')

    expect(response.products.every(p => p.category === 'electronics')).toBe(true)
  })
})
```

## Nuxt 3 Best Practices

1. **Use Composition API** with `<script setup>` syntax
2. **Leverage auto-imports** for composables and utilities
3. **Implement proper TypeScript** typing throughout
4. **Use Pinia** for state management instead of Vuex
5. **Optimize images** with Nuxt Image module
6. **Implement server API routes** for backend functionality
7. **Use middleware** for route protection and logic
8. **Configure proper SEO** with useSeoMeta
9. **Test components and APIs** with Vitest
10. **Follow Vue 3 and Nuxt 3** conventions and patterns