# SvelteKit Framework Guidelines

## App Structure and Routing

SvelteKit uses file-based routing with a powerful app structure:

```
src/
├── routes/
│   ├── +layout.svelte          # Root layout
│   ├── +layout.js              # Root layout data
│   ├── +page.svelte            # Home page
│   ├── +page.js                # Home page data
│   ├── about/
│   │   └── +page.svelte        # /about
│   ├── products/
│   │   ├── +page.svelte        # /products
│   │   ├── +page.js            # Products data loader
│   │   └── [id]/
│   │       ├── +page.svelte    # /products/[id]
│   │       └── +page.js        # Product detail loader
│   └── api/
│       ├── products/
│       │   ├── +server.js      # API endpoint /api/products
│       │   └── [id]/
│       │       └── +server.js  # API endpoint /api/products/[id]
├── lib/
│   ├── components/
│   ├── stores/
│   ├── utils/
│   └── server/
├── app.html                    # HTML template
└── hooks.server.js             # Server hooks
```

## Page and Layout Components

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { invalidate } from '$app/navigation';
  import { auth } from '$lib/stores/auth.js';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import '../app.css';

  export let data;

  // Initialize auth state
  onMount(() => {
    if (data.user) {
      auth.setUser(data.user);
    }
  });

  // Reactive page title
  $: pageTitle = getPageTitle($page.route.id, $page.params);

  function getPageTitle(routeId, params) {
    const titles = {
      '/': 'Home',
      '/products': 'Products',
      '/products/[id]': `Product: ${params?.id || 'Loading...'}`,
      '/about': 'About Us',
      '/contact': 'Contact',
      '/cart': 'Shopping Cart'
    };

    return titles[routeId] || 'Our Store';
  }
</script>

<svelte:head>
  <title>{pageTitle} - SvelteKit Store</title>
  <meta name="description" content="Welcome to our SvelteKit store" />
</svelte:head>

<div class="app">
  <Header user={data.user} />

  <main class="main-content">
    <slot />
  </main>

  <Footer />
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
</style>

<!-- src/routes/+layout.js -->
import { browser } from '$app/environment';
import { redirect } from '@sveltejs/kit';

export async function load({ url, fetch, cookies }) {
  // Check for authentication token
  const token = cookies.get('auth_token');

  let user = null;

  if (token) {
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        user = await response.json();
      } else if (response.status === 401) {
        // Invalid token, clear it
        cookies.delete('auth_token', { path: '/' });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  }

  // Protect admin routes
  if (url.pathname.startsWith('/admin') && (!user || user.role !== 'admin')) {
    throw redirect(303, '/login');
  }

  return {
    user,
    pathname: url.pathname
  };
}

<!-- src/routes/products/+page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import ProductCard from '$lib/components/ProductCard.svelte';
  import SearchFilter from '$lib/components/SearchFilter.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  export let data;

  let searchQuery = $page.url.searchParams.get('search') || '';
  let selectedCategory = $page.url.searchParams.get('category') || '';
  let currentPage = parseInt($page.url.searchParams.get('page')) || 1;

  // Reactive URL updates
  $: updateURL(searchQuery, selectedCategory, currentPage);

  function updateURL(search, category, page) {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (page > 1) params.set('page', page.toString());

    const newUrl = `/products${params.toString() ? '?' + params.toString() : ''}`;

    if (newUrl !== $page.url.pathname + $page.url.search) {
      goto(newUrl, { keepfocus: true, replaceState: true });
    }
  }

  function handleSearch(event) {
    searchQuery = event.detail.query;
    selectedCategory = event.detail.category;
    currentPage = 1; // Reset to first page
  }

  function handlePageChange(event) {
    currentPage = event.detail;
  }
</script>

<svelte:head>
  <title>Products - SvelteKit Store</title>
  <meta name="description" content="Browse our collection of products" />
</svelte:head>

<div class="products-page">
  <h1>Products</h1>

  <SearchFilter
    bind:query={searchQuery}
    bind:category={selectedCategory}
    categories={data.categories}
    on:search={handleSearch}
  />

  {#if data.products.length > 0}
    <div class="products-grid">
      {#each data.products as product (product.id)}
        <ProductCard {product} />
      {/each}
    </div>

    <Pagination
      currentPage={data.pagination.page}
      totalPages={data.pagination.pages}
      on:page-change={handlePageChange}
    />
  {:else}
    <div class="no-products">
      <h2>No products found</h2>
      <p>Try adjusting your search criteria.</p>
    </div>
  {/if}
</div>

<style>
  .products-page {
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    font-size: 2.5rem;
    color: #1f2937;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }

  .no-products {
    text-align: center;
    padding: 4rem 2rem;
  }

  .no-products h2 {
    color: #6b7280;
    margin-bottom: 1rem;
  }

  .no-products p {
    color: #9ca3af;
  }
</style>

<!-- src/routes/products/+page.js -->
import { error } from '@sveltejs/kit';

export async function load({ url, fetch }) {
  const searchParams = url.searchParams;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = 12;

  try {
    // Build API URL with parameters
    const apiParams = new URLSearchParams();
    if (search) apiParams.set('search', search);
    if (category) apiParams.set('category', category);
    apiParams.set('page', page.toString());
    apiParams.set('limit', limit.toString());

    // Fetch products and categories in parallel
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`/api/products?${apiParams}`),
      fetch('/api/categories')
    ]);

    if (!productsResponse.ok) {
      throw error(productsResponse.status, 'Failed to load products');
    }

    if (!categoriesResponse.ok) {
      throw error(categoriesResponse.status, 'Failed to load categories');
    }

    const productsData = await productsResponse.json();
    const categories = await categoriesResponse.json();

    return {
      products: productsData.products,
      categories,
      pagination: {
        page: productsData.page,
        pages: productsData.pages,
        total: productsData.total
      },
      search,
      category
    };
  } catch (err) {
    throw error(500, 'Failed to load page data');
  }
}
```

## API Routes (Server-Side)

```javascript
// src/routes/api/products/+server.js
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/database.js';

export async function GET({ url, setHeaders }) {
  try {
    const searchParams = url.searchParams;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 12;
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(name ILIKE ? OR description ILIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products
      ${whereClause}
    `;
    const countResult = await db.prepare(countQuery).get(...params);
    const total = countResult.total;

    // Get products
    const productsQuery = `
      SELECT id, name, description, price, image, category, in_stock, created_at
      FROM products
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const products = await db.prepare(productsQuery).all(...params, limit, offset);

    const pages = Math.ceil(total / limit);

    // Set cache headers for performance
    setHeaders({
      'Cache-Control': 'public, max-age=300' // 5 minutes
    });

    return json({
      products,
      page,
      pages,
      total,
      limit
    });
  } catch (err) {
    console.error('Products API error:', err);
    throw error(500, 'Failed to fetch products');
  }
}

export async function POST({ request, cookies }) {
  const token = cookies.get('auth_token');

  if (!token) {
    throw error(401, 'Authentication required');
  }

  try {
    // Verify admin access
    const user = await verifyToken(token);
    if (user.role !== 'admin') {
      throw error(403, 'Admin access required');
    }

    const productData = await request.json();

    // Validate required fields
    const { name, description, price, category } = productData;
    if (!name || !description || !price || !category) {
      throw error(400, 'Missing required fields');
    }

    // Insert product
    const insertQuery = `
      INSERT INTO products (name, description, price, category, image, in_stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await db.prepare(insertQuery).run(
      name,
      description,
      price,
      category,
      productData.image || '/images/placeholder.jpg',
      productData.in_stock !== false
    );

    const newProduct = await db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);

    return json(newProduct, { status: 201 });
  } catch (err) {
    console.error('Create product error:', err);
    throw error(500, 'Failed to create product');
  }
}

// src/routes/api/products/[id]/+server.js
import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/database.js';

export async function GET({ params, setHeaders }) {
  try {
    const { id } = params;

    const product = await db.prepare(`
      SELECT id, name, description, price, image, category, in_stock, created_at
      FROM products
      WHERE id = ?
    `).get(id);

    if (!product) {
      throw error(404, 'Product not found');
    }

    // Cache individual products longer
    setHeaders({
      'Cache-Control': 'public, max-age=3600' // 1 hour
    });

    return json(product);
  } catch (err) {
    if (err.status) throw err;
    console.error('Product detail API error:', err);
    throw error(500, 'Failed to fetch product');
  }
}

export async function PUT({ params, request, cookies }) {
  const token = cookies.get('auth_token');

  if (!token) {
    throw error(401, 'Authentication required');
  }

  try {
    const user = await verifyToken(token);
    if (user.role !== 'admin') {
      throw error(403, 'Admin access required');
    }

    const { id } = params;
    const updates = await request.json();

    // Check if product exists
    const existingProduct = await db.prepare('SELECT id FROM products WHERE id = ?').get(id);
    if (!existingProduct) {
      throw error(404, 'Product not found');
    }

    // Build dynamic update query
    const allowedFields = ['name', 'description', 'price', 'category', 'image', 'in_stock'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw error(400, 'No valid fields to update');
    }

    values.push(id); // Add ID for WHERE clause

    await db.prepare(`
      UPDATE products
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values);

    // Return updated product
    const updatedProduct = await db.prepare(`
      SELECT id, name, description, price, image, category, in_stock, created_at
      FROM products
      WHERE id = ?
    `).get(id);

    return json(updatedProduct);
  } catch (err) {
    if (err.status) throw err;
    console.error('Update product error:', err);
    throw error(500, 'Failed to update product');
  }
}

export async function DELETE({ params, cookies }) {
  const token = cookies.get('auth_token');

  if (!token) {
    throw error(401, 'Authentication required');
  }

  try {
    const user = await verifyToken(token);
    if (user.role !== 'admin') {
      throw error(403, 'Admin access required');
    }

    const { id } = params;

    const result = await db.prepare('DELETE FROM products WHERE id = ?').run(id);

    if (result.changes === 0) {
      throw error(404, 'Product not found');
    }

    return json({ success: true });
  } catch (err) {
    if (err.status) throw err;
    console.error('Delete product error:', err);
    throw error(500, 'Failed to delete product');
  }
}
```

## Form Actions and Data Mutations

```svelte
<!-- src/routes/contact/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';

  export let form;

  let loading = false;
</script>

<svelte:head>
  <title>Contact Us - SvelteKit Store</title>
</svelte:head>

<div class="contact-page">
  <h1>Contact Us</h1>

  <form
    method="POST"
    use:enhance={({ formData, cancel }) => {
      // Pre-submission logic
      loading = true;

      return async ({ result, update }) => {
        // Post-submission logic
        loading = false;

        if (result.type === 'success') {
          // Handle success
          console.log('Message sent successfully!');
        } else if (result.type === 'failure') {
          // Handle validation errors
          console.log('Validation errors:', result.data);
        }

        // Update the page with the result
        update();
      };
    }}
    class="contact-form"
  >
    <div class="form-group">
      <label for="name">Name *</label>
      <input
        id="name"
        name="name"
        type="text"
        value={form?.data?.name ?? ''}
        class:error={form?.errors?.name}
        required
      />
      {#if form?.errors?.name}
        <span class="error-message">{form.errors.name}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="email">Email *</label>
      <input
        id="email"
        name="email"
        type="email"
        value={form?.data?.email ?? ''}
        class:error={form?.errors?.email}
        required
      />
      {#if form?.errors?.email}
        <span class="error-message">{form.errors.email}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="subject">Subject</label>
      <input
        id="subject"
        name="subject"
        type="text"
        value={form?.data?.subject ?? ''}
      />
    </div>

    <div class="form-group">
      <label for="message">Message *</label>
      <textarea
        id="message"
        name="message"
        rows="5"
        class:error={form?.errors?.message}
        required
      >{form?.data?.message ?? ''}</textarea>
      {#if form?.errors?.message}
        <span class="error-message">{form.errors.message}</span>
      {/if}
    </div>

    <button type="submit" disabled={loading} class="submit-btn">
      {loading ? 'Sending...' : 'Send Message'}
    </button>

    {#if form?.success}
      <div class="success-message">
        Thank you for your message! We'll get back to you soon.
      </div>
    {/if}
  </form>
</div>

<style>
  .contact-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #1f2937;
  }

  .contact-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  input.error,
  textarea.error {
    border-color: #ef4444;
  }

  .error-message {
    display: block;
    margin-top: 0.25rem;
    color: #ef4444;
    font-size: 0.875rem;
  }

  .submit-btn {
    width: 100%;
    padding: 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.125rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .submit-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .submit-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .success-message {
    margin-top: 1rem;
    padding: 1rem;
    background: #d1fae5;
    border: 1px solid #10b981;
    border-radius: 4px;
    color: #065f46;
    text-align: center;
  }
</style>

<!-- src/routes/contact/+page.server.js -->
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export const actions = {
  default: async ({ request }) => {
    try {
      const data = await request.formData();
      const formData = {
        name: data.get('name'),
        email: data.get('email'),
        subject: data.get('subject'),
        message: data.get('message')
      };

      // Validate form data
      const result = contactSchema.safeParse(formData);

      if (!result.success) {
        const errors = {};
        result.error.errors.forEach(error => {
          errors[error.path[0]] = error.message;
        });

        return fail(400, {
          data: formData,
          errors,
          success: false
        });
      }

      // Process the contact form (send email, save to database, etc.)
      await sendContactEmail(result.data);
      await saveContactMessage(result.data);

      return {
        success: true
      };
    } catch (error) {
      console.error('Contact form error:', error);

      return fail(500, {
        data: formData,
        error: 'Failed to send message. Please try again.',
        success: false
      });
    }
  }
};

async function sendContactEmail(data) {
  // Implementation for sending email
  console.log('Sending email:', data);
}

async function saveContactMessage(data) {
  // Implementation for saving to database
  console.log('Saving message:', data);
}
```

## Hooks and Middleware

```javascript
// src/hooks.server.js
import { sequence } from '@sveltejs/kit/hooks';
import { redirect, error } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

// Authentication hook
async function handleAuth({ event, resolve }) {
  const token = event.cookies.get('auth_token');

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      event.locals.user = await getUserById(decoded.userId);
    } catch (err) {
      // Invalid token, clear it
      event.cookies.delete('auth_token', { path: '/' });
    }
  }

  return resolve(event);
}

// Security headers
async function handleSecurity({ event, resolve }) {
  const response = await resolve(event);

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // CSP for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    );
  }

  return response;
}

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map();

async function handleRateLimit({ event, resolve }) {
  const ip = event.getClientAddress();
  const key = `${ip}:${event.url.pathname}`;

  // Only rate limit API endpoints
  if (event.url.pathname.startsWith('/api/')) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 60; // 60 requests per minute

    const requests = rateLimitMap.get(key) || [];
    const validRequests = requests.filter(time => now - time < windowMs);

    if (validRequests.length >= maxRequests) {
      throw error(429, 'Too many requests');
    }

    validRequests.push(now);
    rateLimitMap.set(key, validRequests);
  }

  return resolve(event);
}

// Error handling
async function handleError({ event, resolve }) {
  try {
    return await resolve(event);
  } catch (err) {
    console.error('Request error:', {
      error: err,
      url: event.url.pathname,
      user: event.locals.user?.id
    });

    throw err;
  }
}

export const handle = sequence(
  handleAuth,
  handleSecurity,
  handleRateLimit,
  handleError
);

// Global error handler
export function handleError({ error, event }) {
  console.error('Application error:', {
    error,
    url: event.url.pathname,
    user: event.locals.user?.id
  });

  return {
    message: 'Internal error occurred'
  };
}

// src/hooks.client.js
import { handleErrorWithSentry, sentryInit } from '$lib/sentry';

// Initialize Sentry for client-side error tracking
sentryInit();

export const handleError = handleErrorWithSentry;
```

## Database Integration

```javascript
// src/lib/server/database.js
import Database from 'better-sqlite3';
import { DATABASE_URL } from '$env/static/private';

const db = new Database(DATABASE_URL || 'data.db');

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price DECIMAL(10, 2) NOT NULL,
      image TEXT,
      category TEXT,
      in_stock BOOLEAN DEFAULT true,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total DECIMAL(10, 2) NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (product_id) REFERENCES products (id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `);
}

initDatabase();

export { db };

// Database utilities
export class UserRepository {
  static async create({ email, password_hash, name, role = 'user' }) {
    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(email, password_hash, name, role);
    return this.findById(result.lastInsertRowid);
  }

  static async findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  static async findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  static async update(id, updates) {
    const allowedFields = ['name', 'email', 'role'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) return this.findById(id);

    values.push(id);

    db.prepare(`
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values);

    return this.findById(id);
  }
}

export class ProductRepository {
  static async findAll({ search = '', category = '', limit = 10, offset = 0 } = {}) {
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      conditions.push('category = ?');
      params.push(category);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const products = db.prepare(`
      SELECT * FROM products
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    const total = db.prepare(`
      SELECT COUNT(*) as count FROM products ${whereClause}
    `).get(...params).count;

    return { products, total };
  }

  static async findById(id) {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  }

  static async create(productData) {
    const { name, description, price, image, category, in_stock } = productData;

    const stmt = db.prepare(`
      INSERT INTO products (name, description, price, image, category, in_stock)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, description, price, image, category, in_stock);
    return this.findById(result.lastInsertRowid);
  }
}
```

## Authentication and Authorization

```svelte
<!-- src/routes/login/+page.svelte -->
<script>
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  export let form;

  let loading = false;

  // Redirect after successful login
  $: if (form?.success) {
    const redirectTo = $page.url.searchParams.get('redirectTo') || '/';
    goto(redirectTo);
  }
</script>

<svelte:head>
  <title>Login - SvelteKit Store</title>
</svelte:head>

<div class="login-page">
  <div class="login-form">
    <h1>Sign In</h1>

    <form
      method="POST"
      use:enhance={({ formData }) => {
        loading = true;

        return ({ result, update }) => {
          loading = false;
          update();
        };
      }}
    >
      <div class="form-group">
        <label for="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form?.data?.email ?? ''}
          class:error={form?.errors?.email}
          required
        />
        {#if form?.errors?.email}
          <span class="error-message">{form.errors.email}</span>
        {/if}
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          class:error={form?.errors?.password}
          required
        />
        {#if form?.errors?.password}
          <span class="error-message">{form.errors.password}</span>
        {/if}
      </div>

      <button type="submit" disabled={loading} class="login-btn">
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      {#if form?.error}
        <div class="general-error">
          {form.error}
        </div>
      {/if}
    </form>

    <p class="signup-link">
      Don't have an account?
      <a href="/register">Sign up here</a>
    </p>
  </div>
</div>

<style>
  .login-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
    padding: 2rem;
  }

  .login-form {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
  }

  h1 {
    text-align: center;
    margin-bottom: 2rem;
    color: #1f2937;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 1rem;
  }

  input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  input.error {
    border-color: #ef4444;
  }

  .error-message {
    display: block;
    margin-top: 0.25rem;
    color: #ef4444;
    font-size: 0.875rem;
  }

  .login-btn {
    width: 100%;
    padding: 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.125rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .login-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .login-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .general-error {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 4px;
    color: #dc2626;
    text-align: center;
  }

  .signup-link {
    text-align: center;
    margin-top: 2rem;
    color: #6b7280;
  }

  .signup-link a {
    color: #3b82f6;
    text-decoration: none;
  }

  .signup-link a:hover {
    text-decoration: underline;
  }
</style>

<!-- src/routes/login/+page.server.js -->
import { redirect, fail } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserRepository } from '$lib/server/database.js';
import { JWT_SECRET } from '$env/static/private';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function load({ locals, url }) {
  // Redirect if already authenticated
  if (locals.user) {
    throw redirect(302, '/');
  }

  return {
    redirectTo: url.searchParams.get('redirectTo')
  };
}

export const actions = {
  default: async ({ request, cookies }) => {
    try {
      const data = await request.formData();
      const formData = {
        email: data.get('email'),
        password: data.get('password')
      };

      // Validate form data
      const result = loginSchema.safeParse(formData);

      if (!result.success) {
        const errors = {};
        result.error.errors.forEach(error => {
          errors[error.path[0]] = error.message;
        });

        return fail(400, {
          data: formData,
          errors
        });
      }

      // Find user by email
      const user = await UserRepository.findByEmail(result.data.email);

      if (!user) {
        return fail(400, {
          data: formData,
          error: 'Invalid email or password'
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(result.data.password, user.password_hash);

      if (!validPassword) {
        return fail(400, {
          data: formData,
          error: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set secure cookie
      cookies.set('auth_token', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return fail(500, {
        data: formData,
        error: 'An error occurred during login'
      });
    }
  }
};
```

## SvelteKit Best Practices

1. **Use file-based routing** for clean URL structure
2. **Implement proper data loading** with `+page.js` and `+page.server.js`
3. **Handle form actions** with progressive enhancement
4. **Use stores for client-state** management
5. **Implement proper authentication** with server-side sessions
6. **Add comprehensive error handling** with hooks
7. **Optimize performance** with proper caching headers
8. **Use TypeScript** for better development experience
9. **Implement security measures** with CSP and validation
10. **Follow SvelteKit conventions** for file organization and naming