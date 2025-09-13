# Svelte Framework Guidelines

## Component Architecture

Svelte provides a component-based architecture with compile-time optimizations:

```svelte
<!-- ProductCard.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { formatCurrency } from '$lib/utils';

  export let product;
  export let showAddToCart = true;

  const dispatch = createEventDispatcher();

  function handleAddToCart() {
    dispatch('add-to-cart', {
      id: product.id,
      name: product.name,
      price: product.price
    });
  }

  function handleImageError(event) {
    event.target.src = '/images/placeholder.jpg';
  }
</script>

<article class="product-card">
  <div class="image-container">
    <img
      src={product.image}
      alt={product.name}
      on:error={handleImageError}
      loading="lazy"
    />
    {#if product.sale}
      <span class="sale-badge">Sale</span>
    {/if}
  </div>

  <div class="content">
    <h3>{product.name}</h3>
    <p class="description">{product.description}</p>

    <div class="price">
      {#if product.originalPrice && product.originalPrice > product.price}
        <span class="original-price">{formatCurrency(product.originalPrice)}</span>
        <span class="current-price sale">{formatCurrency(product.price)}</span>
      {:else}
        <span class="current-price">{formatCurrency(product.price)}</span>
      {/if}
    </div>

    {#if showAddToCart}
      <button
        class="add-to-cart-btn"
        on:click={handleAddToCart}
        disabled={!product.inStock}
      >
        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    {/if}
  </div>
</article>

<style>
  .product-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .image-container {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .sale-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #ef4444;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .content {
    padding: 1rem;
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .description {
    color: #64748b;
    font-size: 0.875rem;
    margin: 0 0 1rem 0;
    line-height: 1.4;
  }

  .price {
    margin-bottom: 1rem;
  }

  .original-price {
    text-decoration: line-through;
    color: #94a3b8;
    margin-right: 0.5rem;
  }

  .current-price {
    font-weight: 600;
    font-size: 1.125rem;
  }

  .current-price.sale {
    color: #ef4444;
  }

  .add-to-cart-btn {
    width: 100%;
    padding: 0.75rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .add-to-cart-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .add-to-cart-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
</style>
```

## Reactive Statements and Stores

```svelte
<!-- ProductList.svelte -->
<script>
  import { onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import ProductCard from './ProductCard.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';

  // Props
  export let category = '';
  export let sortBy = 'name';

  // Stores
  const products = writable([]);
  const loading = writable(false);
  const searchQuery = writable('');

  // Derived store for filtered products
  const filteredProducts = derived(
    [products, searchQuery],
    ([$products, $searchQuery]) => {
      if (!$searchQuery) return $products;

      return $products.filter(product =>
        product.name.toLowerCase().includes($searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes($searchQuery.toLowerCase())
      );
    }
  );

  // Derived store for sorted products
  const sortedProducts = derived(
    [filteredProducts],
    ([$filteredProducts]) => {
      return [...$filteredProducts].sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return a.price - b.price;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'rating':
            return b.rating - a.rating;
          default:
            return 0;
        }
      });
    }
  );

  // Reactive statement - runs when category changes
  $: if (category) {
    loadProducts(category);
  }

  // Reactive statement for logging
  $: if ($searchQuery) {
    console.log('Searching for:', $searchQuery);
  }

  async function loadProducts(categoryFilter = '') {
    loading.set(true);

    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set('category', categoryFilter);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      products.set(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
      products.set([]);
    } finally {
      loading.set(false);
    }
  }

  function handleAddToCart(event) {
    const product = event.detail;
    console.log('Adding to cart:', product);

    // Dispatch to parent or handle cart logic
    const cartEvent = new CustomEvent('product-added', {
      detail: product
    });

    window.dispatchEvent(cartEvent);
  }

  onMount(() => {
    loadProducts(category);
  });
</script>

<div class="product-list">
  <div class="filters">
    <input
      type="text"
      placeholder="Search products..."
      bind:value={$searchQuery}
      class="search-input"
    />

    <select bind:value={sortBy} class="sort-select">
      <option value="name">Sort by Name</option>
      <option value="price">Sort by Price</option>
      <option value="rating">Sort by Rating</option>
    </select>
  </div>

  {#if $loading}
    <LoadingSpinner />
  {:else if $sortedProducts.length === 0}
    <div class="empty-state">
      <p>No products found.</p>
    </div>
  {:else}
    <div class="products-grid">
      {#each $sortedProducts as product (product.id)}
        <ProductCard
          {product}
          on:add-to-cart={handleAddToCart}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .product-list {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .filters {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .search-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 1rem;
  }

  .sort-select {
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: white;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #6b7280;
  }
</style>
```

## Form Handling and Validation

```svelte
<!-- ContactForm.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let formData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  let errors = {};
  let isSubmitting = false;
  let isSubmitted = false;

  // Reactive validation
  $: {
    errors = {};

    if (formData.name && formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.message && formData.message.length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }
  }

  $: isValid = Object.keys(errors).length === 0 &&
               formData.name &&
               formData.email &&
               formData.message;

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  async function handleSubmit() {
    if (!isValid) return;

    isSubmitting = true;

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      isSubmitted = true;
      dispatch('submit-success', { formData });

      // Reset form
      formData = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
    } catch (error) {
      console.error('Submission error:', error);
      dispatch('submit-error', { error: error.message });
    } finally {
      isSubmitting = false;
    }
  }

  function handleReset() {
    formData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
    errors = {};
    isSubmitted = false;
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="contact-form">
  {#if isSubmitted}
    <div class="success-message">
      <h3>Thank you for your message!</h3>
      <p>We'll get back to you as soon as possible.</p>
      <button type="button" on:click={handleReset} class="btn-secondary">
        Send Another Message
      </button>
    </div>
  {:else}
    <div class="form-group">
      <label for="name">Name *</label>
      <input
        id="name"
        type="text"
        bind:value={formData.name}
        class:error={errors.name}
        required
      />
      {#if errors.name}
        <span class="error-message">{errors.name}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="email">Email *</label>
      <input
        id="email"
        type="email"
        bind:value={formData.email}
        class:error={errors.email}
        required
      />
      {#if errors.email}
        <span class="error-message">{errors.email}</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="subject">Subject</label>
      <input
        id="subject"
        type="text"
        bind:value={formData.subject}
      />
    </div>

    <div class="form-group">
      <label for="message">Message *</label>
      <textarea
        id="message"
        bind:value={formData.message}
        rows="5"
        class:error={errors.message}
        required
      ></textarea>
      {#if errors.message}
        <span class="error-message">{errors.message}</span>
      {/if}
    </div>

    <div class="form-actions">
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        class="btn-primary"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>

      <button
        type="button"
        on:click={handleReset}
        class="btn-secondary"
      >
        Reset
      </button>
    </div>
  {/if}
</form>

<style>
  .contact-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    background: white;
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

  .form-actions {
    display: flex;
    gap: 1rem;
  }

  .btn-primary {
    flex: 1;
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .btn-secondary {
    padding: 0.75rem 1.5rem;
    background: transparent;
    color: #6b7280;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .success-message {
    text-align: center;
    padding: 2rem;
  }

  .success-message h3 {
    color: #059669;
    margin-bottom: 0.5rem;
  }

  .success-message p {
    color: #6b7280;
    margin-bottom: 1.5rem;
  }
</style>
```

## Store Management

```javascript
// stores/auth.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

function createAuthStore() {
  const { subscribe, set, update } = writable({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  });

  return {
    subscribe,

    async login(credentials) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        const { user, token } = await response.json();

        if (browser) {
          localStorage.setItem('auth_token', token);
        }

        update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));

        return user;
      } catch (error) {
        update(state => ({
          ...state,
          error: error.message,
          isLoading: false
        }));
        throw error;
      }
    },

    async logout() {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (error) {
        console.error('Logout error:', error);
      }

      if (browser) {
        localStorage.removeItem('auth_token');
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    },

    async checkAuth() {
      if (!browser) return;

      const token = localStorage.getItem('auth_token');
      if (!token) return;

      update(state => ({ ...state, isLoading: true }));

      try {
        const response = await fetch('/api/auth/user', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Invalid token');
        }

        const user = await response.json();

        update(state => ({
          ...state,
          user,
          isAuthenticated: true,
          isLoading: false
        }));
      } catch (error) {
        localStorage.removeItem('auth_token');
        update(state => ({
          ...state,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error.message
        }));
      }
    },

    clearError() {
      update(state => ({ ...state, error: null }));
    }
  };
}

export const auth = createAuthStore();

// Derived stores
export const isAuthenticated = derived(auth, $auth => $auth.isAuthenticated);
export const currentUser = derived(auth, $auth => $auth.user);

// stores/cart.js
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

function createCartStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,

    addItem(product) {
      update(items => {
        const existingIndex = items.findIndex(item => item.id === product.id);

        if (existingIndex >= 0) {
          items[existingIndex].quantity += 1;
          return [...items];
        } else {
          return [...items, { ...product, quantity: 1 }];
        }
      });

      this.saveToStorage();
    },

    removeItem(productId) {
      update(items => items.filter(item => item.id !== productId));
      this.saveToStorage();
    },

    updateQuantity(productId, quantity) {
      if (quantity <= 0) {
        this.removeItem(productId);
        return;
      }

      update(items => {
        const index = items.findIndex(item => item.id === productId);
        if (index >= 0) {
          items[index].quantity = quantity;
        }
        return [...items];
      });

      this.saveToStorage();
    },

    clear() {
      set([]);
      this.saveToStorage();
    },

    saveToStorage() {
      if (browser) {
        this.subscribe(items => {
          localStorage.setItem('cart', JSON.stringify(items));
        })();
      }
    },

    loadFromStorage() {
      if (browser) {
        const stored = localStorage.getItem('cart');
        if (stored) {
          set(JSON.parse(stored));
        }
      }
    }
  };
}

export const cart = createCartStore();

// Derived stores for computed values
export const cartTotal = derived(cart, $cart =>
  $cart.reduce((total, item) => total + (item.price * item.quantity), 0)
);

export const cartItemCount = derived(cart, $cart =>
  $cart.reduce((count, item) => count + item.quantity, 0)
);

export const cartIsEmpty = derived(cart, $cart => $cart.length === 0);
```

## Routing and Navigation

```svelte
<!-- routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { auth, cart } from '$lib/stores';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Toast from '$lib/components/Toast.svelte';

  // Initialize auth and cart on app load
  onMount(() => {
    auth.checkAuth();
    cart.loadFromStorage();
  });

  // Reactive page title
  $: pageTitle = getPageTitle($page.route.id);

  function getPageTitle(routeId) {
    const titles = {
      '/': 'Home',
      '/products': 'Products',
      '/about': 'About Us',
      '/contact': 'Contact',
      '/cart': 'Shopping Cart',
      '/login': 'Login',
      '/register': 'Register'
    };

    return titles[routeId] || 'Our Store';
  }
</script>

<svelte:head>
  <title>{pageTitle} - Our Store</title>
  <meta name="description" content="Welcome to our amazing store" />
</svelte:head>

<div class="app">
  <Header />

  <main class="main-content">
    <slot />
  </main>

  <Footer />

  <Toast />
</div>

<style>
  :global(html) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #f8fafc;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding: 2rem 0;
  }
</style>

<!-- routes/products/[id]/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { cart } from '$lib/stores';
  import { formatCurrency } from '$lib/utils';
  import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';

  export let data;

  let product = data.product;
  let loading = false;
  let selectedQuantity = 1;
  let addingToCart = false;

  // Reactive statement for product ID changes
  $: productId = $page.params.id;
  $: if (productId) {
    loadProduct(productId);
  }

  async function loadProduct(id) {
    if (product && product.id === id) return;

    loading = true;

    try {
      const response = await fetch(`/api/products/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          goto('/products');
          return;
        }
        throw new Error('Failed to load product');
      }

      product = await response.json();
    } catch (error) {
      console.error('Error loading product:', error);
      goto('/products');
    } finally {
      loading = false;
    }
  }

  async function handleAddToCart() {
    if (!product || addingToCart) return;

    addingToCart = true;

    try {
      for (let i = 0; i < selectedQuantity; i++) {
        cart.addItem(product);
      }

      // Show success message
      const event = new CustomEvent('show-toast', {
        detail: {
          message: `${product.name} added to cart!`,
          type: 'success'
        }
      });

      window.dispatchEvent(event);
    } finally {
      addingToCart = false;
    }
  }

  onMount(() => {
    if (!product && productId) {
      loadProduct(productId);
    }
  });
</script>

<svelte:head>
  {#if product}
    <title>{product.name} - Our Store</title>
    <meta name="description" content={product.description} />
    <meta property="og:title" content={product.name} />
    <meta property="og:description" content={product.description} />
    <meta property="og:image" content={product.image} />
  {/if}
</svelte:head>

{#if loading}
  <LoadingSpinner />
{:else if product}
  <div class="product-detail">
    <div class="product-images">
      <img src={product.image} alt={product.name} />
    </div>

    <div class="product-info">
      <h1>{product.name}</h1>
      <p class="price">{formatCurrency(product.price)}</p>
      <p class="description">{product.description}</p>

      {#if product.inStock}
        <div class="quantity-selector">
          <label for="quantity">Quantity:</label>
          <select id="quantity" bind:value={selectedQuantity}>
            {#each Array(10) as _, i}
              <option value={i + 1}>{i + 1}</option>
            {/each}
          </select>
        </div>

        <button
          class="add-to-cart-btn"
          on:click={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? 'Adding...' : 'Add to Cart'}
        </button>
      {:else}
        <p class="out-of-stock">Out of Stock</p>
      {/if}
    </div>
  </div>
{:else}
  <div class="error">
    <h1>Product not found</h1>
    <p>The product you're looking for doesn't exist.</p>
    <a href="/products">Back to Products</a>
  </div>
{/if}

<style>
  .product-detail {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }

  .product-images img {
    width: 100%;
    height: auto;
    border-radius: 8px;
  }

  .product-info h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .price {
    font-size: 1.5rem;
    font-weight: bold;
    color: #059669;
    margin-bottom: 1rem;
  }

  .description {
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .quantity-selector {
    margin-bottom: 1rem;
  }

  .quantity-selector label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .quantity-selector select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
  }

  .add-to-cart-btn {
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

  .add-to-cart-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .add-to-cart-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .out-of-stock {
    color: #ef4444;
    font-weight: 500;
    font-size: 1.125rem;
  }

  .error {
    text-align: center;
    padding: 3rem;
  }

  .error h1 {
    color: #ef4444;
  }

  .error a {
    color: #3b82f6;
    text-decoration: none;
  }

  @media (max-width: 768px) {
    .product-detail {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
  }
</style>
```

## Performance and Best Practices

```svelte
<!-- LazyImage.svelte - Performance optimized image component -->
<script>
  import { onMount } from 'svelte';

  export let src;
  export let alt;
  export let placeholder = '/images/placeholder.jpg';
  export let threshold = 0.1;

  let imageElement;
  let loaded = false;
  let error = false;
  let observer;

  function handleLoad() {
    loaded = true;
  }

  function handleError() {
    error = true;
  }

  onMount(() => {
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = src;
              observer.unobserve(img);
            }
          });
        },
        { threshold }
      );

      observer.observe(imageElement);
    } else {
      // Fallback for browsers without IntersectionObserver
      imageElement.src = src;
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  });
</script>

<img
  bind:this={imageElement}
  src={error ? placeholder : (loaded ? src : placeholder)}
  {alt}
  on:load={handleLoad}
  on:error={handleError}
  class:loaded
  class:error
  {...$$restProps}
/>

<style>
  img {
    transition: opacity 0.3s ease;
    opacity: 0.5;
  }

  img.loaded {
    opacity: 1;
  }

  img.error {
    opacity: 0.7;
    filter: grayscale(100%);
  }
</style>
```

## Svelte Best Practices

1. **Use reactive statements** (`$:`) for computed values and side effects
2. **Leverage stores** for global state management
3. **Implement proper component communication** with events and props
4. **Use bind directives** for two-way data binding
5. **Optimize performance** with lazy loading and code splitting
6. **Handle loading and error states** appropriately
7. **Use TypeScript** for better type safety
8. **Follow Svelte naming conventions** for components and files
9. **Implement proper form validation** with reactive statements
10. **Use CSS custom properties** for theming and consistency