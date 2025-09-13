# Next.js 13 Specific Features

## App Router Introduction

Next.js 13 introduced the App Router as a major architectural change, co-existing with Pages Router:

```typescript
// app/layout.tsx - Root layout
import './globals.css'

export const metadata = {
  title: 'My Next.js 13 App',
  description: 'Built with the new App Router',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

// app/page.tsx - Home page
export default function HomePage() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold">Welcome to Next.js 13</h1>
      <p>This page uses the new App Router.</p>
    </main>
  )
}

// app/dashboard/page.tsx - Dashboard page
export default function DashboardPage() {
  return <h1>Dashboard</h1>
}

// app/dashboard/layout.tsx - Nested layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <nav className="sidebar">
        <a href="/dashboard">Overview</a>
        <a href="/dashboard/analytics">Analytics</a>
        <a href="/dashboard/settings">Settings</a>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  )
}
```

## Server Components (Stable)

Next.js 13 makes React Server Components stable:

```tsx
// app/posts/page.tsx - Server Component (default)
import { getPosts } from '@/lib/api'
import PostCard from './PostCard'

// This runs on the server
export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div className="posts-grid">
      <h1>All Posts</h1>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

// app/posts/PostCard.tsx - Client Component
'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PostCardProps {
  post: {
    id: string
    title: string
    excerpt: string
    slug: string
    publishedAt: string
  }
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false)

  return (
    <article className="post-card">
      <h2>
        <Link href={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>
      <p>{post.excerpt}</p>
      <div className="post-meta">
        <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
        <button
          onClick={() => setLiked(!liked)}
          className={liked ? 'liked' : ''}
        >
          {liked ? '❤️' : '🤍'} Like
        </button>
      </div>
    </article>
  )
}
```

## Data Fetching in App Router

```tsx
// app/products/page.tsx - Server-side data fetching
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    // Next.js 13 extends fetch with caching options
    next: { revalidate: 3600 } // Cache for 1 hour
  })

  if (!res.ok) {
    throw new Error('Failed to fetch products')
  }

  return res.json()
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="products">
      <h1>Products</h1>
      <div className="products-grid">
        {products.map((product: any) => (
          <div key={product.id} className="product-card">
            <h3>{product.name}</h3>
            <p>${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// app/products/[id]/page.tsx - Dynamic routes with data fetching
interface ProductPageProps {
  params: { id: string }
}

async function getProduct(id: string) {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    next: { revalidate: 60 } // Revalidate every minute
  })

  if (!res.ok) {
    throw new Error('Product not found')
  }

  return res.json()
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProduct(params.id)

  return (
    <div className="product-detail">
      <h1>{product.name}</h1>
      <img src={product.image} alt={product.name} />
      <p>{product.description}</p>
      <p className="price">${product.price}</p>
    </div>
  )
}

// Generate static params for dynamic routes
export async function generateStaticParams() {
  const products = await fetch('https://api.example.com/products').then(res => res.json())

  return products.map((product: any) => ({
    id: product.id.toString(),
  }))
}
```

## Loading and Error Handling

```tsx
// app/posts/loading.tsx - Loading UI
export default function Loading() {
  return (
    <div className="loading">
      <div className="skeleton">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
    </div>
  )
}

// app/posts/error.tsx - Error UI
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="error">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}

// app/posts/not-found.tsx - 404 UI
export default function NotFound() {
  return (
    <div className="not-found">
      <h2>Not Found</h2>
      <p>Could not find the requested post.</p>
    </div>
  )
}
```

## Route Groups and Organization

```typescript
// Route groups for organization without affecting URL structure
// app/(marketing)/about/page.tsx -> /about
// app/(marketing)/contact/page.tsx -> /contact
// app/(dashboard)/analytics/page.tsx -> /analytics
// app/(dashboard)/settings/page.tsx -> /settings

// app/(marketing)/layout.tsx - Marketing layout
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-layout">
      <header className="marketing-header">
        <nav>
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>
      {children}
    </div>
  )
}

// app/(dashboard)/layout.tsx - Dashboard layout
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <a href="/analytics">Analytics</a>
        <a href="/settings">Settings</a>
      </aside>
      <main>{children}</main>
    </div>
  )
}
```

## New Metadata API

```typescript
// Static metadata
export const metadata = {
  title: 'My Page',
  description: 'This is my page description',
  keywords: ['next.js', 'react', 'web development'],
  authors: [{ name: 'John Doe', url: 'https://johndoe.com' }],
  openGraph: {
    title: 'My Page',
    description: 'This is my page description',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'My Page',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Page',
    description: 'This is my page description',
    images: ['/twitter-image.jpg'],
  },
}

// Dynamic metadata
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug)

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
```

## API Routes in App Router

```typescript
// app/api/users/route.ts - API routes
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  // Fetch users logic
  const users = await getUsers(query)

  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Create user logic
  const user = await createUser(body)

  return NextResponse.json(user, { status: 201 })
}

// app/api/users/[id]/route.ts - Dynamic API routes
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser(params.id)

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const user = await updateUser(params.id, body)

  return NextResponse.json(user)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deleteUser(params.id)

  return NextResponse.json({ message: 'User deleted' })
}
```

## Streaming and Suspense

```tsx
import { Suspense } from 'react'

// app/dashboard/page.tsx - Streaming with Suspense
export default function DashboardPage() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="dashboard-grid">
        <Suspense fallback={<WidgetSkeleton />}>
          <RevenueWidget />
        </Suspense>

        <Suspense fallback={<WidgetSkeleton />}>
          <UserStatsWidget />
        </Suspense>

        <Suspense fallback={<WidgetSkeleton />}>
          <RecentOrdersWidget />
        </Suspense>
      </div>
    </div>
  )
}

// Each widget can load independently
async function RevenueWidget() {
  const revenue = await getRevenue()

  return (
    <div className="widget">
      <h3>Revenue</h3>
      <p className="metric">${revenue.total}</p>
    </div>
  )
}

async function UserStatsWidget() {
  const stats = await getUserStats()

  return (
    <div className="widget">
      <h3>Users</h3>
      <p className="metric">{stats.total}</p>
    </div>
  )
}
```

## Turbopack (Dev Mode)

Next.js 13 introduced Turbopack for faster development:

```bash
# Enable Turbopack for development
npm run dev -- --turbo

# Or add to package.json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

## Font Optimization

```tsx
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <h1 className={robotoMono.className}>
          This uses Roboto Mono
        </h1>
        {children}
      </body>
    </html>
  )
}
```

## Image Component Improvements

```tsx
import Image from 'next/image'

export default function Gallery() {
  return (
    <div className="gallery">
      <Image
        src="/hero.jpg"
        alt="Hero image"
        width={800}
        height={400}
        priority
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />

      <Image
        src="/product.jpg"
        alt="Product"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
      />
    </div>
  )
}
```

## Migration Considerations

### Gradual Migration
You can use both App Router and Pages Router simultaneously:

```
my-app/
├── app/                 # New App Router
│   ├── layout.tsx
│   ├── page.tsx
│   └── dashboard/
│       └── page.tsx
└── pages/              # Legacy Pages Router
    ├── api/
    ├── _app.tsx
    └── old-page.tsx
```

### Key Differences from Pages Router

1. **File-based routing** - `page.tsx` instead of `index.tsx`
2. **Layouts** - Nested and shared layouts with `layout.tsx`
3. **Server Components** - Default instead of opt-in
4. **Data fetching** - `async` components instead of `getServerSideProps`
5. **Metadata** - Export `metadata` object instead of `<Head>`

### Breaking Changes

1. `getServerSideProps`, `getStaticProps` not available in App Router
2. `_app.tsx` and `_document.tsx` replaced by `layout.tsx`
3. Different file naming conventions
4. API routes have new syntax