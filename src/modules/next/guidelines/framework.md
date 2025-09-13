# Next.js Framework Guidelines

## Core Principles

### App Router (Next.js 13+)

Always use the App Router for new projects. It provides better performance, improved developer experience, and modern React features:

```tsx
// app/layout.tsx - Root layout
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Next.js App',
  description: 'Built with Next.js App Router',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}

// app/page.tsx - Home page
export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Next.js</h1>
      <p className="text-lg text-gray-600">
        This is the home page using the App Router.
      </p>
    </main>
  )
}

// app/about/page.tsx - About page
export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">About Us</h1>
      <p className="text-lg text-gray-600">
        Learn more about our company and mission.
      </p>
    </main>
  )
}
```

### File-based Routing with App Router

```tsx
// Directory structure
app/
├── layout.tsx          // Root layout
├── page.tsx           // Home page (/)
├── about/
│   └── page.tsx       // About page (/about)
├── blog/
│   ├── page.tsx       // Blog listing (/blog)
│   └── [slug]/
│       └── page.tsx   // Blog post (/blog/[slug])
├── products/
│   ├── page.tsx       // Products listing (/products)
│   ├── [id]/
│   │   └── page.tsx   // Product detail (/products/[id])
│   └── categories/
│       └── [category]/
│           └── page.tsx // Products by category (/products/categories/[category])
└── api/
    ├── auth/
    │   └── route.ts   // Auth API routes
    └── products/
        └── route.ts   // Products API routes

// app/blog/[slug]/page.tsx - Dynamic route
interface BlogPostProps {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function BlogPost({ params, searchParams }: BlogPostProps) {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return <div>Post not found</div>
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-600">
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString()}
          </time>
          <span className="mx-2">•</span>
          <span>{post.author}</span>
        </div>
      </header>

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

// Generate static params for SSG
export async function generateStaticParams() {
  const posts = await getAllBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}
```

## Data Fetching Patterns

### Server Components and Client Components

```tsx
// app/products/page.tsx - Server Component (default)
import { ProductList } from './ProductList'
import { SearchBar } from './SearchBar'

interface ProductsPageProps {
  searchParams: { category?: string; search?: string }
}

// This runs on the server
async function getProducts(filters: { category?: string; search?: string }) {
  const url = new URL('/api/products', process.env.NEXT_PUBLIC_BASE_URL)

  if (filters.category) url.searchParams.set('category', filters.category)
  if (filters.search) url.searchParams.set('search', filters.search)

  const response = await fetch(url, {
    next: { revalidate: 60 } // Revalidate every 60 seconds
  })

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  return response.json()
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Server-side data fetching
  const products = await getProducts(searchParams)
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      {/* Client Component for interactivity */}
      <SearchBar categories={categories} />

      {/* Server Component for rendering */}
      <ProductList products={products} />
    </div>
  )
}

// app/products/SearchBar.tsx - Client Component
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface SearchBarProps {
  categories: Category[]
}

export function SearchBar({ categories }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [category, setCategory] = useState(searchParams.get('category') ?? '')

  const handleSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)

      router.push(`/products?${params.toString()}`)
    })
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          disabled={isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Searching...' : 'Search'}
        </button>
      </div>
    </div>
  )
}

// app/products/ProductList.tsx - Server Component
interface ProductListProps {
  products: Product[]
}

export function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### API Routes with App Router

```tsx
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const searchSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = searchSchema.parse({
      category: searchParams.get('category'),
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    const products = await getProducts(params)
    const totalCount = await getProductCount(params)

    return NextResponse.json({
      products,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: totalCount,
        pages: Math.ceil(totalCount / params.limit),
      },
    })
  } catch (error) {
    console.error('Products API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const productData = productSchema.parse(body)

    // Create product
    const product = await createProduct(productData)

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid product data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

// app/api/products/[id]/route.ts
interface Context {
  params: { id: string }
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const product = await getProductById(params.id)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const body = await request.json()
    const updateData = partialProductSchema.parse(body)

    const product = await updateProduct(params.id, updateData)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Update product error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    const deleted = await deleteProduct(params.id)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
```

## Authentication and Middleware

### Middleware for Route Protection

```tsx
// middleware.ts (in root directory)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // API routes authentication
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization')

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]

    try {
      const payload = await verifyJWT(token)

      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-id', payload.userId)
      requestHeaders.set('x-user-role', payload.role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  // Protected page routes
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await verifyJWT(token)
    return NextResponse.next()
  } catch (error) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/api/protected/:path*',
  ],
}
```

### Authentication with Server Actions

```tsx
// app/auth/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { signJWT, hashPassword, verifyPassword } from '@/lib/auth'
import { getUserByEmail, createUser } from '@/lib/database'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function loginAction(formData: FormData) {
  try {
    const data = loginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const user = await getUserByEmail(data.email)

    if (!user || !await verifyPassword(data.password, user.hashedPassword)) {
      return { error: 'Invalid email or password' }
    }

    const token = await signJWT({ userId: user.id, role: user.role })

    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    redirect('/dashboard')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data', details: error.errors }
    }

    console.error('Login error:', error)
    return { error: 'Login failed. Please try again.' }
  }
}

export async function registerAction(formData: FormData) {
  try {
    const data = registerSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    })

    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      return { error: 'User already exists with this email' }
    }

    const hashedPassword = await hashPassword(data.password)
    const user = await createUser({
      name: data.name,
      email: data.email,
      hashedPassword,
    })

    const token = await signJWT({ userId: user.id, role: user.role })

    cookies().set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
    })

    redirect('/dashboard')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid form data', details: error.errors }
    }

    console.error('Registration error:', error)
    return { error: 'Registration failed. Please try again.' }
  }
}

export async function logoutAction() {
  cookies().delete('auth-token')
  redirect('/login')
}

// app/login/page.tsx
import { loginAction } from '@/app/auth/actions'
import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <LoginForm action={loginAction} />
      </div>
    </div>
  )
}

// app/login/LoginForm.tsx
'use client'

import { useFormState } from 'react-dom'
import { useFormStatus } from 'react-dom'

interface LoginFormProps {
  action: (formData: FormData) => Promise<{ error?: string; details?: any }>
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  )
}

export function LoginForm({ action }: LoginFormProps) {
  const [state, formAction] = useFormState(action, {})

  return (
    <form action={formAction} className="mt-8 space-y-6">
      <div className="rounded-md shadow-sm -space-y-px">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>
      </div>

      {state.error && (
        <div className="text-red-600 text-sm text-center">
          {state.error}
        </div>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  )
}
```

## Performance and Optimization

### Image Optimization

```tsx
import Image from 'next/image'

// Optimized images with Next.js Image component
export function ProductGallery({ product }: { product: Product }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Hero image with priority loading */}
      <div className="col-span-2">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={800}
          height={600}
          priority
          className="w-full h-auto rounded-lg"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
        />
      </div>

      {/* Additional images */}
      {product.images.slice(1).map((image, index) => (
        <Image
          key={index}
          src={image}
          alt={`${product.name} view ${index + 2}`}
          width={400}
          height={300}
          className="w-full h-auto rounded-lg"
          loading="lazy"
        />
      ))}
    </div>
  )
}

// Responsive images with different sizes
export function ResponsiveHero({ title, backgroundImage }: HeroProps) {
  return (
    <section className="relative h-screen">
      <Image
        src={backgroundImage}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center">
          {title}
        </h1>
      </div>
    </section>
  )
}
```

### Loading UI and Streaming

```tsx
// app/products/loading.tsx - Loading UI
export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-8 w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// app/products/error.tsx - Error UI
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold text-red-600 mb-4">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-8">
        {error.message || 'Failed to load products'}
      </p>
      <button
        onClick={reset}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  )
}

// Streaming with Suspense
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <SalesChart />
          </Suspense>
        </div>

        <div>
          <Suspense fallback={<StatsSkeleton />}>
            <StatsCards />
          </Suspense>
        </div>
      </div>

      <div className="mt-8">
        <Suspense fallback={<TableSkeleton />}>
          <RecentOrders />
        </Suspense>
      </div>
    </div>
  )
}
```

## Configuration and Best Practices

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Environment Variables

```typescript
// lib/env.ts - Type-safe environment variables
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
})

export const env = envSchema.parse(process.env)

// .env.local
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## What NOT to Do

1. **Don't use Pages Router** for new projects - use App Router
2. **Don't fetch data in useEffect** for SSG/SSR - use server components
3. **Don't forget to use Next.js Image** for optimized images
4. **Don't skip error boundaries** - use error.tsx files
5. **Don't ignore loading states** - use loading.tsx files
6. **Don't put sensitive data in environment variables** starting with NEXT_PUBLIC_
7. **Don't use client components unnecessarily** - prefer server components
8. **Don't forget middleware for route protection**
9. **Don't skip TypeScript** - it's essential for large Next.js apps
10. **Don't ignore Core Web Vitals** - use Next.js built-in optimizations