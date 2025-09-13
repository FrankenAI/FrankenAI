# Nuxt.js Framework Guidelines

## Core Principles

### Nuxt 3 with Vue 3 and TypeScript

Always use Nuxt 3 for new projects. It provides auto-imports, file-based routing, server-side rendering, and excellent TypeScript support:

```vue
<!-- pages/index.vue - Home page -->
<script setup lang="ts">
// Auto-imported composables - no need to import manually
const { data: posts, pending, error } = await useFetch<Post[]>('/api/posts')

// SEO metadata
useSeoMeta({
  title: 'Welcome to My Blog',
  description: 'A modern blog built with Nuxt 3',
  ogTitle: 'Welcome to My Blog',
  ogDescription: 'A modern blog built with Nuxt 3',
  ogImage: '/og-image.jpg',
})

interface Post {
  id: number
  title: string
  excerpt: string
  slug: string
  publishedAt: string
  author: {
    name: string
    avatar: string
  }
}
</script>

<template>
  <div>
    <Hero
      title="Welcome to My Blog"
      subtitle="Discover amazing content about web development"
    />

    <section class="container mx-auto px-4 py-12">
      <h2 class="text-3xl font-bold mb-8">Latest Posts</h2>

      <!-- Loading state -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PostSkeleton v-for="i in 6" :key="i" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600 mb-4">Failed to load posts</p>
        <button @click="refresh()" class="btn btn-primary">
          Try Again
        </button>
      </div>

      <!-- Posts grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
        />
      </div>
    </section>
  </div>
</template>
```

### File-based Routing and Layouts

```vue
<!-- layouts/default.vue - Default layout -->
<script setup lang="ts">
const route = useRoute()

// Navigation items
const navigation = [
  { name: 'Home', href: '/', current: route.path === '/' },
  { name: 'Blog', href: '/blog', current: route.path.startsWith('/blog') },
  { name: 'About', href: '/about', current: route.path === '/about' },
  { name: 'Contact', href: '/contact', current: route.path === '/contact' }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <NuxtLink to="/" class="text-xl font-bold">
            MyBlog
          </NuxtLink>

          <div class="hidden md:flex space-x-8">
            <NuxtLink
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              :class="[
                'text-gray-600 hover:text-gray-900 transition-colors',
                { 'text-blue-600 font-medium': item.current }
              ]"
            >
              {{ item.name }}
            </NuxtLink>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </nav>

    <!-- Page content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white mt-16">
      <div class="container mx-auto px-4 py-8">
        <p class="text-center text-gray-400">
          © 2024 MyBlog. Built with Nuxt 3.
        </p>
      </div>
    </footer>
  </div>
</template>

<!-- pages/blog/[slug].vue - Dynamic blog post page -->
<script setup lang="ts">
interface BlogPost {
  id: number
  title: string
  content: string
  excerpt: string
  publishedAt: string
  updatedAt: string
  author: {
    name: string
    avatar: string
    bio: string
  }
  tags: string[]
  coverImage: string
  readingTime: number
}

const route = useRoute()
const slug = route.params.slug as string

// Fetch post data with error handling
const { data: post, error } = await useFetch<BlogPost>(`/api/posts/${slug}`)

// Handle 404
if (error.value?.statusCode === 404) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post Not Found'
  })
}

// SEO metadata
if (post.value) {
  useSeoMeta({
    title: post.value.title,
    description: post.value.excerpt,
    ogTitle: post.value.title,
    ogDescription: post.value.excerpt,
    ogImage: post.value.coverImage,
    articleAuthor: post.value.author.name,
    articlePublishedTime: post.value.publishedAt,
    articleModifiedTime: post.value.updatedAt,
  })
}

// Structured data for SEO
useSchemaOrg([
  defineArticle({
    headline: post.value?.title,
    description: post.value?.excerpt,
    image: post.value?.coverImage,
    datePublished: post.value?.publishedAt,
    dateModified: post.value?.updatedAt,
    author: {
      name: post.value?.author.name,
    },
  }),
])
</script>

<template>
  <div v-if="post" class="max-w-4xl mx-auto px-4 py-8">
    <!-- Article header -->
    <article>
      <header class="mb-8">
        <h1 class="text-4xl font-bold mb-4">{{ post.title }}</h1>

        <div class="flex items-center space-x-4 text-gray-600 mb-6">
          <img
            :src="post.author.avatar"
            :alt="post.author.name"
            class="w-10 h-10 rounded-full"
          >
          <div>
            <p class="font-medium">{{ post.author.name }}</p>
            <div class="flex items-center space-x-2 text-sm">
              <time :datetime="post.publishedAt">
                {{ formatDate(post.publishedAt) }}
              </time>
              <span>•</span>
              <span>{{ post.readingTime }} min read</span>
            </div>
          </div>
        </div>

        <img
          :src="post.coverImage"
          :alt="post.title"
          class="w-full h-64 object-cover rounded-lg mb-8"
        >
      </header>

      <!-- Article content -->
      <div
        class="prose prose-lg max-w-none"
        v-html="post.content"
      />

      <!-- Tags -->
      <div v-if="post.tags.length" class="mt-8 pt-8 border-t">
        <h3 class="text-lg font-semibold mb-4">Tags</h3>
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            v-for="tag in post.tags"
            :key="tag"
            :to="`/blog/tags/${tag}`"
            class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            {{ tag }}
          </NuxtLink>
        </div>
      </div>
    </article>

    <!-- Author bio -->
    <aside class="mt-12 p-6 bg-gray-50 rounded-lg">
      <div class="flex items-start space-x-4">
        <img
          :src="post.author.avatar"
          :alt="post.author.name"
          class="w-16 h-16 rounded-full"
        >
        <div>
          <h3 class="text-lg font-semibold">{{ post.author.name }}</h3>
          <p class="text-gray-600 mt-2">{{ post.author.bio }}</p>
        </div>
      </div>
    </aside>
  </div>
</template>
```

## Data Fetching and Server API

### Server API Routes

```typescript
// server/api/posts/index.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string
  const tag = query.tag as string

  try {
    const posts = await getPosts({
      page,
      limit,
      search,
      tag,
    })

    const total = await getPostsCount({ search, tag })

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch posts',
    })
  }
})

// server/api/posts/[slug].get.ts
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  try {
    const post = await getPostBySlug(slug)

    if (!post) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found',
      })
    }

    return post
  } catch (error) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch post',
    })
  }
})

// server/api/posts/index.post.ts
import { z } from 'zod'

const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  slug: z.string().min(1, 'Slug is required'),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().url('Cover image must be a valid URL'),
})

export default defineEventHandler(async (event) => {
  // Check authentication
  const user = await getUserFromEvent(event)
  if (!user || user.role !== 'admin') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const body = await readBody(event)

  try {
    const postData = createPostSchema.parse(body)

    // Check if slug already exists
    const existingPost = await getPostBySlug(postData.slug)
    if (existingPost) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Post with this slug already exists',
      })
    }

    const post = await createPost({
      ...postData,
      authorId: user.id,
    })

    setResponseStatus(event, 201)
    return post
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid post data',
        data: error.errors,
      })
    }

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create post',
    })
  }
})
```

### Composables for Data Management

```typescript
// composables/usePosts.ts
interface Post {
  id: number
  title: string
  excerpt: string
  slug: string
  publishedAt: string
  author: {
    name: string
    avatar: string
  }
}

interface UsePosts {
  posts: Ref<Post[]>
  loading: Ref<boolean>
  error: Ref<Error | null>
  fetchPosts: (params?: PostsParams) => Promise<void>
  createPost: (postData: CreatePostData) => Promise<Post>
  updatePost: (id: number, updates: UpdatePostData) => Promise<Post>
  deletePost: (id: number) => Promise<void>
}

export const usePosts = (): UsePosts => {
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchPosts = async (params: PostsParams = {}) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ posts: Post[] }>('/api/posts', {
        query: params,
      })

      posts.value = data.posts
    } catch (err) {
      error.value = err as Error
      console.error('Failed to fetch posts:', err)
    } finally {
      loading.value = false
    }
  }

  const createPost = async (postData: CreatePostData): Promise<Post> => {
    try {
      const post = await $fetch<Post>('/api/posts', {
        method: 'POST',
        body: postData,
      })

      posts.value.unshift(post)
      return post
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const updatePost = async (id: number, updates: UpdatePostData): Promise<Post> => {
    try {
      const updatedPost = await $fetch<Post>(`/api/posts/${id}`, {
        method: 'PATCH',
        body: updates,
      })

      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        posts.value[index] = updatedPost
      }

      return updatedPost
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  const deletePost = async (id: number): Promise<void> => {
    try {
      await $fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })

      posts.value = posts.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err as Error
      throw err
    }
  }

  return {
    posts: readonly(posts),
    loading: readonly(loading),
    error: readonly(error),
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
  }
}

// composables/useAuth.ts
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  avatar: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth.user', () => null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user: userData, token } = await $fetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: credentials,
      })

      user.value = userData

      // Store token in cookie
      const tokenCookie = useCookie('auth-token', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      tokenCookie.value = token

      await navigateTo('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      const tokenCookie = useCookie('auth-token')
      tokenCookie.value = null
      await navigateTo('/login')
    }
  }

  const refreshUser = async () => {
    try {
      const userData = await $fetch<User>('/api/auth/me')
      user.value = userData
    } catch (error) {
      user.value = null
      const tokenCookie = useCookie('auth-token')
      tokenCookie.value = null
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    refreshUser,
  }
}
```

## Middleware and Route Protection

### Authentication Middleware

```typescript
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/', '/blog']
  const isPublicRoute = publicRoutes.some(route =>
    to.path === route || to.path.startsWith(`${route}/`)
  )

  if (!isAuthenticated.value && !isPublicRoute) {
    return navigateTo('/login')
  }
})

// middleware/admin.ts
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()

  if (!user.value || user.value.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied'
    })
  }
})

// middleware/guest.ts
export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})
```

### Page-specific Middleware

```vue
<!-- pages/admin/index.vue -->
<script setup lang="ts">
// Protect admin routes
definePageMeta({
  middleware: ['auth', 'admin']
})

const { data: stats } = await useFetch('/api/admin/stats')

useSeoMeta({
  title: 'Admin Dashboard',
  robots: 'noindex, nofollow' // Don't index admin pages
})
</script>

<template>
  <div>
    <h1>Admin Dashboard</h1>
    <!-- Admin content -->
  </div>
</template>

<!-- pages/login.vue -->
<script setup lang="ts">
// Redirect if already authenticated
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
})
</script>

<template>
  <div>
    <LoginForm />
  </div>
</template>
```

## Plugins and Modules

### Custom Plugins

```typescript
// plugins/api.client.ts
export default defineNuxtPlugin(() => {
  const { $fetch } = useNuxtApp()

  // Add auth token to all requests
  $fetch.create({
    onRequest({ request, options }) {
      const token = useCookie('auth-token')
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        // Clear auth and redirect to login
        const { logout } = useAuth()
        logout()
      }
    }
  })
})

// plugins/theme.client.ts
export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()

  // Apply theme class to body
  watch(() => colorMode.value, (newMode) => {
    document.body.className = newMode
  }, { immediate: true })
})

// plugins/toast.client.ts
import { createApp } from 'vue'
import Toast from '~/components/Toast.vue'

export default defineNuxtPlugin((nuxtApp) => {
  const toast = {
    show(message: string, type: 'success' | 'error' | 'info' = 'info') {
      const toastApp = createApp(Toast, { message, type })
      const toastElement = document.createElement('div')
      document.body.appendChild(toastElement)
      toastApp.mount(toastElement)

      setTimeout(() => {
        toastApp.unmount()
        document.body.removeChild(toastElement)
      }, 3000)
    }
  }

  return {
    provide: {
      toast
    }
  }
})
```

### Module Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: true
  },

  // CSS and styling
  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@vueuse/nuxt'
  ],

  // Color mode configuration
  colorMode: {
    preference: 'system',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storageKey: 'nuxt-color-mode'
  },

  // Image optimization
  image: {
    quality: 80,
    format: ['webp'],
    domains: ['example.com'],
    densities: [1, 2],
    sizes: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    }
  },

  // SEO configuration
  site: {
    url: 'https://myblog.com',
    name: 'My Blog',
    description: 'A modern blog built with Nuxt 3',
    defaultLocale: 'en',
  },

  // Runtime configuration
  runtimeConfig: {
    // Private keys (only available on server-side)
    jwtSecret: process.env.JWT_SECRET,
    databaseUrl: process.env.DATABASE_URL,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,

    // Public keys (exposed to client-side)
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:3000',
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '/api',
    }
  },

  // Nitro configuration
  nitro: {
    experimental: {
      wasm: true
    }
  },

  // Build configuration
  build: {
    transpile: ['trpc-nuxt']
  },

  // App configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
})
```

## State Management with Pinia

```typescript
// stores/posts.ts
import { defineStore } from 'pinia'

interface Post {
  id: number
  title: string
  content: string
  slug: string
  publishedAt: string
}

interface PostsState {
  posts: Post[]
  currentPost: Post | null
  loading: boolean
  error: string | null
}

export const usePostsStore = defineStore('posts', {
  state: (): PostsState => ({
    posts: [],
    currentPost: null,
    loading: false,
    error: null,
  }),

  getters: {
    publishedPosts: (state) =>
      state.posts.filter(post => new Date(post.publishedAt) <= new Date()),

    getPostBySlug: (state) => (slug: string) =>
      state.posts.find(post => post.slug === slug),

    postsCount: (state) => state.posts.length,
  },

  actions: {
    async fetchPosts() {
      this.loading = true
      this.error = null

      try {
        const { posts } = await $fetch<{ posts: Post[] }>('/api/posts')
        this.posts = posts
      } catch (error) {
        this.error = 'Failed to fetch posts'
        console.error('Fetch posts error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchPost(slug: string) {
      this.loading = true
      this.error = null

      try {
        const post = await $fetch<Post>(`/api/posts/${slug}`)
        this.currentPost = post

        // Add to posts array if not already there
        if (!this.posts.find(p => p.id === post.id)) {
          this.posts.push(post)
        }
      } catch (error) {
        this.error = 'Failed to fetch post'
        console.error('Fetch post error:', error)
      } finally {
        this.loading = false
      }
    },

    async createPost(postData: Omit<Post, 'id'>) {
      try {
        const post = await $fetch<Post>('/api/posts', {
          method: 'POST',
          body: postData,
        })

        this.posts.unshift(post)
        return post
      } catch (error) {
        this.error = 'Failed to create post'
        throw error
      }
    },

    async updatePost(id: number, updates: Partial<Post>) {
      try {
        const updatedPost = await $fetch<Post>(`/api/posts/${id}`, {
          method: 'PATCH',
          body: updates,
        })

        const index = this.posts.findIndex(p => p.id === id)
        if (index !== -1) {
          this.posts[index] = updatedPost
        }

        if (this.currentPost?.id === id) {
          this.currentPost = updatedPost
        }

        return updatedPost
      } catch (error) {
        this.error = 'Failed to update post'
        throw error
      }
    },

    async deletePost(id: number) {
      try {
        await $fetch(`/api/posts/${id}`, {
          method: 'DELETE',
        })

        this.posts = this.posts.filter(p => p.id !== id)

        if (this.currentPost?.id === id) {
          this.currentPost = null
        }
      } catch (error) {
        this.error = 'Failed to delete post'
        throw error
      }
    },

    clearError() {
      this.error = null
    },
  },
})

// Usage in components
export default defineComponent({
  setup() {
    const postsStore = usePostsStore()

    onMounted(() => {
      postsStore.fetchPosts()
    })

    return {
      posts: storeToRefs(postsStore).posts,
      loading: storeToRefs(postsStore).loading,
      error: storeToRefs(postsStore).error,
      createPost: postsStore.createPost,
      deletePost: postsStore.deletePost,
    }
  }
})
```

## Performance and SEO Optimization

### Image Optimization

```vue
<template>
  <div>
    <!-- Responsive images with Nuxt Image -->
    <NuxtImg
      :src="post.coverImage"
      :alt="post.title"
      width="800"
      height="400"
      densities="x1 x2"
      loading="lazy"
      class="w-full h-64 object-cover rounded-lg"
    />

    <!-- Placeholder while loading -->
    <NuxtImg
      :src="product.image"
      :alt="product.name"
      width="400"
      height="300"
      placeholder
      loading="lazy"
      class="w-full h-48 object-cover"
    />

    <!-- Background image optimization -->
    <div class="hero">
      <NuxtImg
        src="/hero-background.jpg"
        alt=""
        width="1920"
        height="1080"
        densities="x1 x2"
        preload
        format="webp"
        class="hero-bg"
      />
    </div>
  </div>
</template>
```

### Advanced SEO

```vue
<script setup lang="ts">
// Advanced SEO with useSchemaOrg
const post = await $fetch<BlogPost>(`/api/posts/${route.params.slug}`)

// Multiple schema types
useSchemaOrg([
  defineWebPage({
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'My Blog',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
  }),

  defineBreadcrumb({
    itemListElement: [
      { name: 'Home', item: '/' },
      { name: 'Blog', item: '/blog' },
      { name: post.title, item: `/blog/${post.slug}` },
    ],
  }),
])

// Dynamic meta tags
useSeoMeta({
  title: () => `${post.value?.title} | My Blog`,
  description: () => post.value?.excerpt,
  ogTitle: () => post.value?.title,
  ogDescription: () => post.value?.excerpt,
  ogImage: () => post.value?.coverImage,
  ogType: 'article',
  articleAuthor: () => post.value?.author.name,
  articlePublishedTime: () => post.value?.publishedAt,
  articleModifiedTime: () => post.value?.updatedAt,
  twitterCard: 'summary_large_image',
  twitterSite: '@myblog',
  twitterCreator: () => `@${post.value?.author.twitter}`,
})
</script>
```

## What NOT to Do

1. **Don't use Options API** - use Composition API with `<script setup>`
2. **Don't manually import composables** - Nuxt auto-imports them
3. **Don't use client-side routing for SEO-critical pages** - leverage SSR/SSG
4. **Don't skip error handling** in server routes and composables
5. **Don't forget to use TypeScript** - it's essential for large Nuxt apps
6. **Don't ignore loading states** - provide good UX during data fetching
7. **Don't skip SEO optimization** - use useSeoMeta and useSchemaOrg
8. **Don't use heavy libraries on client-side** without lazy loading
9. **Don't forget middleware for route protection** and authentication
10. **Don't ignore Nuxt DevTools** - they're incredibly helpful for debugging