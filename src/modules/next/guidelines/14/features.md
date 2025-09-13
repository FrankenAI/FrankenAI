# Next.js 14 Specific Features

## Turbopack for Development (Stable)

Next.js 14 makes Turbopack stable for development builds:

```bash
# Default in Next.js 14
npm run dev

# Explicitly enable Turbopack
npm run dev -- --turbo

# In package.json
{
  "scripts": {
    "dev": "next dev --turbo"
  }
}
```

## Enhanced Server Actions

Improved Server Actions with better TypeScript support and performance:

```tsx
// app/actions.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  try {
    const post = await db.post.create({
      data: { title, content, published: false }
    })

    revalidatePath('/posts')
    return { success: true, post }
  } catch (error) {
    return { success: false, error: 'Failed to create post' }
  }
}

export async function publishPost(postId: string) {
  await db.post.update({
    where: { id: postId },
    data: { published: true }
  })

  revalidateTag('posts')
  redirect('/posts')
}

// app/posts/new/page.tsx
import { createPost } from '@/app/actions'

export default function NewPost() {
  return (
    <form action={createPost}>
      <input name="title" placeholder="Post title" required />
      <textarea name="content" placeholder="Post content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

## Partial Prerendering (Preview)

Static and dynamic content in the same page:

```tsx
import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'

// app/dashboard/page.tsx
export default async function Dashboard() {
  // Static content (cached)
  const staticData = await getStaticData()

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Static header */}
      <header>
        <h2>{staticData.title}</h2>
      </header>

      {/* Dynamic content with Suspense */}
      <Suspense fallback={<div>Loading user data...</div>}>
        <UserData />
      </Suspense>

      <Suspense fallback={<div>Loading analytics...</div>}>
        <Analytics />
      </Suspense>
    </div>
  )
}

async function UserData() {
  noStore() // Opt out of caching
  const userData = await getCurrentUser()

  return (
    <div>
      <h3>Welcome, {userData.name}!</h3>
      <p>Last login: {userData.lastLogin}</p>
    </div>
  )
}

async function Analytics() {
  noStore() // Dynamic data
  const analytics = await getAnalytics()

  return (
    <div>
      <h3>Analytics</h3>
      <p>Page views: {analytics.pageViews}</p>
      <p>Unique visitors: {analytics.uniqueVisitors}</p>
    </div>
  )
}
```

## Enhanced Caching API

More granular caching control:

```tsx
import { unstable_cache } from 'next/cache'

// Cached function with tags
const getUser = unstable_cache(
  async (id: string) => {
    const response = await fetch(`/api/users/${id}`)
    return response.json()
  },
  ['user-profile'],
  {
    tags: ['user'],
    revalidate: 3600, // 1 hour
  }
)

// Conditional caching
const getProducts = unstable_cache(
  async (category?: string) => {
    const url = category
      ? `/api/products?category=${category}`
      : '/api/products'

    const response = await fetch(url)
    return response.json()
  },
  ['products'],
  {
    tags: ['products'],
    revalidate: 60, // 1 minute
  }
)

// Dynamic cache invalidation
export async function updateProduct(id: string, data: ProductData) {
  await db.product.update({
    where: { id },
    data
  })

  // Invalidate specific cache entries
  revalidateTag('products')
  revalidateTag(`product-${id}`)
}
```

## Improved Dev Overlay

Better error messages and debugging:

```tsx
// Enhanced error boundaries with better dev experience
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="error-boundary">
      <h2>Something went wrong!</h2>

      {process.env.NODE_ENV === 'development' && (
        <details>
          <summary>Error details</summary>
          <pre>{error.stack}</pre>
        </details>
      )}

      <button onClick={reset}>
        Try again
      </button>
    </div>
  )
}
```

## Form Improvements

Enhanced form handling with better UX:

```tsx
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Submitting...' : 'Submit'}
    </button>
  )
}

export default function ContactForm() {
  async function submitForm(formData: FormData) {
    'use server'

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log({ name, email, message })
  }

  return (
    <form action={submitForm}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />
      <SubmitButton />
    </form>
  )
}
```

## Metadata API Enhancements

More flexible metadata generation:

```tsx
import type { Metadata, ResolvingMetadata } from 'next'

// Dynamic metadata with parent resolution
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPost(params.slug)

  // Optionally access and extend parent metadata
  const previousImages = (await parent).openGraph?.images || []

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
    alternates: {
      canonical: `https://example.com/posts/${post.slug}`,
      languages: {
        'en-US': `https://example.com/en/posts/${post.slug}`,
        'es-ES': `https://example.com/es/posts/${post.slug}`,
      },
    },
  }
}

// Viewport metadata (separate export)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}
```

## Performance Optimizations

Built-in performance improvements:

```tsx
import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'

// Optimized image loading
import Image from 'next/image'

export default function Gallery({ images }: { images: ImageData[] }) {
  return (
    <div className="gallery">
      {images.map((image, index) => (
        <Image
          key={image.id}
          src={image.url}
          alt={image.alt}
          width={300}
          height={200}
          priority={index < 3} // Prioritize first 3 images
          placeholder="blur"
          blurDataURL={image.blurDataURL}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ))}
    </div>
  )
}

// Streaming with better loading states
export default async function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails id={params.id} />
      </Suspense>

      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews id={params.id} />
      </Suspense>

      <Suspense fallback={<RecommendationsSkeleton />}>
        <ProductRecommendations id={params.id} />
      </Suspense>
    </div>
  )
}

async function ProductDetails({ id }: { id: string }) {
  const product = await getProduct(id)

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p className="price">${product.price}</p>
    </div>
  )
}

async function ProductReviews({ id }: { id: string }) {
  noStore() // Always fresh reviews
  const reviews = await getReviews(id)

  return (
    <div>
      <h2>Reviews</h2>
      {reviews.map(review => (
        <div key={review.id}>
          <p>{review.comment}</p>
          <span>Rating: {review.rating}/5</span>
        </div>
      ))}
    </div>
  )
}
```

## TypeScript Improvements

Better TypeScript integration:

```tsx
// Enhanced type safety for params and search params
interface PageProps {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function BlogPost({ params, searchParams }: PageProps) {
  const post = await getPost(params.slug)
  const page = Number(searchParams.page) || 1
  const sort = searchParams.sort === 'desc' ? 'desc' : 'asc'

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}

// Better typed server actions
export async function createUser(prevState: any, formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
  }

  try {
    const user = await db.user.create({ data })
    return { success: true, user }
  } catch (error) {
    return { success: false, error: 'Failed to create user' }
  }
}
```

## Configuration Enhancements

```javascript
// next.config.js - Next.js 14 optimizations
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true, // Partial Prerendering
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // Enhanced image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Improved bundle analyzer
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.default = {
        minChunks: 2,
        priority: -20,
        reuseExistingChunk: true,
      }
    }
    return config
  },
}

module.exports = nextConfig
```

## Migration from Next.js 13

### Update Dependencies

```bash
npm install next@14 react@latest react-dom@latest
```

### Configuration Updates

```javascript
// Update next.config.js
const nextConfig = {
  // Remove experimental.appDir (now stable)
  // experimental: {
  //   appDir: true, // Remove this
  // },

  // Add new experimental features
  experimental: {
    ppr: true, // Enable Partial Prerendering
  },
}
```

### Code Updates

```tsx
// Update imports for new features
import { unstable_noStore as noStore } from 'next/cache'
import { useFormStatus } from 'react-dom'

// Replace old patterns
// Before: export const dynamic = 'force-dynamic'
// After: Use noStore() in components
```

## Next.js 14 Best Practices

1. **Enable Turbopack** for faster development builds
2. **Use Partial Prerendering** for mixed static/dynamic content
3. **Leverage Server Actions** for form handling and mutations
4. **Implement granular caching** with tags and revalidation
5. **Optimize images** with priority loading and proper sizing
6. **Use Suspense boundaries** for better loading states
7. **Type your API routes** and server actions properly
8. **Monitor Core Web Vitals** with built-in analytics