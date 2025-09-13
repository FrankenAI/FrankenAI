# Nuxt 2 Specific Features

## Vue Options API Integration

Nuxt 2 uses Vue 2 with Options API as the primary pattern:

```vue
<template>
  <div class="product-listing">
    <div class="filters">
      <input v-model="searchQuery" placeholder="Search products..." />
      <select v-model="selectedCategory">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <div v-if="$fetchState.pending" class="loading">Loading products...</div>
    <div v-else-if="$fetchState.error" class="error">
      Error: {{ $fetchState.error.message }}
    </div>

    <div v-else class="products-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @add-to-cart="handleAddToCart"
      />
    </div>

    <Pagination
      v-if="totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script>
export default {
  name: 'ProductListing',

  async asyncData({ $axios, query, error }) {
    try {
      const page = parseInt(query.page) || 1
      const category = query.category || ''

      const { data } = await $axios.get('/api/products', {
        params: { page, category, limit: 12 }
      })

      return {
        initialProducts: data.products,
        totalProducts: data.total,
        currentPage: page,
        selectedCategory: category
      }
    } catch (err) {
      error({ statusCode: 500, message: 'Failed to load products' })
    }
  },

  data() {
    return {
      searchQuery: '',
      categories: [],
      products: this.initialProducts || [],
      totalProducts: 0,
      currentPage: 1,
      selectedCategory: ''
    }
  },

  async fetch() {
    try {
      const { data } = await this.$axios.get('/api/categories')
      this.categories = data
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  },

  computed: {
    filteredProducts() {
      if (!this.searchQuery) return this.products

      return this.products.filter(product =>
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },

    totalPages() {
      return Math.ceil(this.totalProducts / 12)
    }
  },

  watch: {
    selectedCategory: 'loadProducts',
    '$route.query.page': 'loadProducts'
  },

  methods: {
    async loadProducts() {
      this.$fetchState.pending = true

      try {
        const { data } = await this.$axios.get('/api/products', {
          params: {
            page: this.currentPage,
            category: this.selectedCategory,
            limit: 12
          }
        })

        this.products = data.products
        this.totalProducts = data.total
      } catch (error) {
        this.$fetchState.error = error
      } finally {
        this.$fetchState.pending = false
      }
    },

    handleAddToCart(product) {
      this.$store.dispatch('cart/addItem', product)
      this.$toast.success(`${product.name} added to cart!`)
    },

    handlePageChange(page) {
      this.$router.push({
        query: { ...this.$route.query, page }
      })
    }
  },

  head() {
    return {
      title: `Products${this.selectedCategory ? ` - ${this.selectedCategory}` : ''}`,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Browse our collection of products'
        }
      ]
    }
  }
}
</script>
```

## Nuxt Modules System

```javascript
// nuxt.config.js
export default {
  // Module configuration
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/auth-next',
    '@nuxtjs/pwa',
    '@nuxtjs/toast',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots'
  ],

  // Axios module configuration
  axios: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
    credentials: true
  },

  // Auth module configuration
  auth: {
    strategies: {
      local: {
        token: {
          property: 'token',
          global: true,
          required: true,
          type: 'Bearer'
        },
        user: {
          property: 'user',
          autoFetch: true
        },
        endpoints: {
          login: { url: '/api/auth/login', method: 'post' },
          logout: { url: '/api/auth/logout', method: 'post' },
          user: { url: '/api/auth/user', method: 'get' }
        }
      }
    }
  },

  // PWA configuration
  pwa: {
    icon: {
      fileName: 'icon.png'
    },
    manifest: {
      name: 'My Nuxt App',
      short_name: 'NuxtApp',
      description: 'My awesome Nuxt application',
      theme_color: '#4285f4'
    }
  }
}
```

## Middleware System

```javascript
// middleware/auth.js
export default function ({ $auth, redirect }) {
  if (!$auth.loggedIn) {
    return redirect('/login')
  }
}

// middleware/guest.js
export default function ({ $auth, redirect }) {
  if ($auth.loggedIn) {
    return redirect('/dashboard')
  }
}

// middleware/admin.js
export default function ({ $auth, redirect }) {
  if (!$auth.loggedIn || $auth.user.role !== 'admin') {
    return redirect('/')
  }
}

// Using middleware in pages
<script>
export default {
  middleware: ['auth', 'admin']
}
</script>
```

## Vuex Store Pattern

```javascript
// store/index.js
export const state = () => ({
  counter: 0
})

export const mutations = {
  increment(state) {
    state.counter++
  },
  decrement(state) {
    state.counter--
  },
  setCounter(state, value) {
    state.counter = value
  }
}

export const actions = {
  async fetchCounter({ commit }) {
    try {
      const { data } = await this.$axios.get('/api/counter')
      commit('setCounter', data.value)
    } catch (error) {
      console.error('Failed to fetch counter:', error)
    }
  }
}

export const getters = {
  doubledCounter: state => state.counter * 2
}

// store/products.js
export const state = () => ({
  items: [],
  loading: false,
  error: null
})

export const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_PRODUCTS(state, products) {
    state.items = products
  },
  SET_ERROR(state, error) {
    state.error = error
  },
  ADD_PRODUCT(state, product) {
    state.items.push(product)
  },
  UPDATE_PRODUCT(state, updatedProduct) {
    const index = state.items.findIndex(p => p.id === updatedProduct.id)
    if (index !== -1) {
      state.items.splice(index, 1, updatedProduct)
    }
  },
  REMOVE_PRODUCT(state, productId) {
    state.items = state.items.filter(p => p.id !== productId)
  }
}

export const actions = {
  async fetchProducts({ commit }) {
    commit('SET_LOADING', true)
    commit('SET_ERROR', null)

    try {
      const { data } = await this.$axios.get('/api/products')
      commit('SET_PRODUCTS', data)
    } catch (error) {
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createProduct({ commit }, productData) {
    try {
      const { data } = await this.$axios.post('/api/products', productData)
      commit('ADD_PRODUCT', data)
      return data
    } catch (error) {
      throw error
    }
  }
}

export const getters = {
  getProductById: (state) => (id) => {
    return state.items.find(product => product.id === id)
  },
  getProductsByCategory: (state) => (category) => {
    return state.items.filter(product => product.category === category)
  }
}
```

## Server-Side Rendering (SSR)

```vue
<!-- pages/blog/_slug.vue -->
<template>
  <article class="blog-post">
    <header>
      <h1>{{ post.title }}</h1>
      <div class="meta">
        <time>{{ formatDate(post.publishedAt) }}</time>
        <span>By {{ post.author.name }}</span>
      </div>
    </header>

    <div class="content" v-html="post.content"></div>

    <footer>
      <div class="tags">
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
      </div>
    </footer>
  </article>
</template>

<script>
export default {
  async asyncData({ params, $axios, error }) {
    try {
      const { data } = await $axios.get(`/api/posts/${params.slug}`)
      return { post: data }
    } catch (err) {
      error({ statusCode: 404, message: 'Post not found' })
    }
  },

  methods: {
    formatDate(date) {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(date))
    }
  },

  head() {
    return {
      title: this.post.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.post.excerpt
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.post.title
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.post.excerpt
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: this.post.featuredImage
        }
      ]
    }
  }
}
</script>
```

## Layouts and Error Pages

```vue
<!-- layouts/default.vue -->
<template>
  <div class="app-layout">
    <Header />

    <main class="main-content">
      <Nuxt />
    </main>

    <Footer />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout'
}
</script>

<!-- layouts/admin.vue -->
<template>
  <div class="admin-layout">
    <AdminSidebar />

    <div class="admin-content">
      <AdminHeader />
      <Nuxt />
    </div>
  </div>
</template>

<script>
export default {
  middleware: ['auth', 'admin']
}
</script>

<!-- layouts/error.vue -->
<template>
  <div class="error-page">
    <h1 v-if="error.statusCode === 404">Page not found</h1>
    <h1 v-else>An error occurred</h1>

    <p>{{ error.message }}</p>

    <NuxtLink to="/">Go to homepage</NuxtLink>
  </div>
</template>

<script>
export default {
  layout: 'error',
  props: ['error']
}
</script>
```

## Plugins System

```javascript
// plugins/axios.js
export default function ({ $axios, redirect, $auth }) {
  $axios.onRequest(config => {
    console.log('Making request to ' + config.url)
  })

  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status)

    if (code === 401) {
      $auth.logout()
      redirect('/login')
    }

    if (code === 500) {
      redirect('/error')
    }
  })
}

// plugins/vue-plugins.js
import Vue from 'vue'
import VueGtag from 'vue-gtag'

Vue.use(VueGtag, {
  config: {
    id: process.env.GOOGLE_ANALYTICS_ID
  }
})

// plugins/global-components.js
import Vue from 'vue'
import BaseButton from '~/components/BaseButton.vue'
import BaseInput from '~/components/BaseInput.vue'
import BaseModal from '~/components/BaseModal.vue'

Vue.component('BaseButton', BaseButton)
Vue.component('BaseInput', BaseInput)
Vue.component('BaseModal', BaseModal)
```

## Static Site Generation (SSG)

```javascript
// nuxt.config.js
export default {
  target: 'static',

  generate: {
    async routes() {
      const { $axios } = require('@nuxt/http')

      // Generate routes for dynamic pages
      const posts = await $axios.$get('/api/posts')
      const categories = await $axios.$get('/api/categories')

      const postRoutes = posts.map(post => `/blog/${post.slug}`)
      const categoryRoutes = categories.map(cat => `/category/${cat.slug}`)

      return [...postRoutes, ...categoryRoutes]
    },

    fallback: true // Enable SPA fallback
  }
}

// pages/blog/_slug.vue with static generation
export default {
  async asyncData({ params, $axios }) {
    const { data } = await $axios.get(`/api/posts/${params.slug}`)
    return { post: data }
  },

  // This ensures the page is generated at build time
  validate({ params }) {
    return /^[a-zA-Z0-9-]+$/.test(params.slug)
  }
}
```

## Build and Deployment

```javascript
// nuxt.config.js
export default {
  build: {
    // Analyze bundle
    analyze: {
      analyzerMode: 'static'
    },

    // Optimize vendor bundle
    vendor: ['axios', 'lodash'],

    // Extend webpack config
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  },

  // Environment variables
  env: {
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  },

  // Runtime config
  publicRuntimeConfig: {
    apiBaseURL: process.env.API_BASE_URL
  },

  privateRuntimeConfig: {
    apiSecret: process.env.API_SECRET
  }
}
```

## Performance Optimization

```vue
<template>
  <div>
    <!-- Lazy load images -->
    <img
      v-for="image in images"
      :key="image.id"
      v-lazy="image.url"
      :alt="image.alt"
    />

    <!-- Lazy load components -->
    <LazyHydrate when-idle>
      <HeavyComponent />
    </LazyHydrate>

    <!-- Prefetch links -->
    <NuxtLink to="/products" prefetch>
      View Products
    </NuxtLink>
  </div>
</template>

<script>
export default {
  components: {
    // Lazy load components
    HeavyComponent: () => import('~/components/HeavyComponent.vue')
  }
}
</script>
```

## Testing in Nuxt 2

```javascript
// test/components/Header.spec.js
import { mount, createLocalVue } from '@vue/test-utils'
import Header from '@/components/Header.vue'

const localVue = createLocalVue()

describe('Header', () => {
  test('renders navigation links', () => {
    const wrapper = mount(Header, {
      localVue,
      mocks: {
        $auth: {
          loggedIn: false
        }
      }
    })

    expect(wrapper.find('.nav-link[href="/"]').text()).toBe('Home')
    expect(wrapper.find('.nav-link[href="/products"]').text()).toBe('Products')
  })

  test('shows user menu when logged in', () => {
    const wrapper = mount(Header, {
      localVue,
      mocks: {
        $auth: {
          loggedIn: true,
          user: { name: 'John Doe' }
        }
      }
    })

    expect(wrapper.find('.user-menu').exists()).toBe(true)
    expect(wrapper.find('.user-name').text()).toBe('John Doe')
  })
})
```

## Nuxt 2 Best Practices

1. **Use asyncData** for SSR data fetching
2. **Implement proper error handling** with error pages
3. **Leverage Vuex** for state management
4. **Use middleware** for route protection
5. **Optimize images** with lazy loading
6. **Implement proper SEO** with head() method
7. **Use modules** for common functionality
8. **Configure proper build optimization**
9. **Test components** with Vue Test Utils
10. **Follow Vue 2 patterns** and conventions