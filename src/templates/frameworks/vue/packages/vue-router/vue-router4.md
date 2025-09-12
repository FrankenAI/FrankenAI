## Vue Router 4 Guidelines

### Key Features & Best Practices

**Composition API Integration**
```typescript
import { useRouter, useRoute } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    const navigateToUser = (userId: string) => {
      router.push(`/users/${userId}`)
    }
    
    // Reactive route params
    const userId = computed(() => route.params.id)
    
    return { navigateToUser, userId }
  }
}
```

**Dynamic Route Matching**
```typescript
const routes = [
  {
    path: '/users/:id(\\d+)',
    component: User,
    props: true,
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'posts', component: UserPosts }
    ]
  },
  // Multiple params
  { path: '/users/:id/posts/:postId', component: Post },
  // Optional params
  { path: '/articles/:slug?', component: Article }
]
```

**Navigation Guards with Composition API**
```typescript
// Global guards
router.beforeEach(async (to, from) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    return { name: 'login' }
  }
})

// Component guards
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

export default {
  setup() {
    onBeforeRouteLeave((to, from) => {
      if (hasUnsavedChanges()) {
        return confirm('You have unsaved changes. Leave anyway?')
      }
    })
    
    onBeforeRouteUpdate(async (to, from) => {
      await fetchUser(to.params.id)
    })
  }
}
```

**Lazy Loading with Better Error Handling**
```typescript
const routes = [
  {
    path: '/admin',
    component: () => import('../views/Admin.vue')
      .catch(() => import('../views/ErrorPage.vue'))
  }
]
```

### Breaking Changes from v3
- `mode: 'history'` → `createWebHistory()`
- `new Router()` → `createRouter()`
- `<router-link tag="li">` removed (use custom component)