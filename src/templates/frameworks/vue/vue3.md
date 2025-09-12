## Vue 3 Guidelines

### Key Features & Best Practices

**Composition API (Recommended)**
```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface User {
  id: string
  name: string
  email: string
}

const props = defineProps<{
  userId: string
}>()

const emit = defineEmits<{
  userLoaded: [user: User]
}>()

const user = ref<User | null>(null)
const loading = ref(false)

const isLoaded = computed(() => user.value !== null)

const fetchUser = async () => {
  loading.value = true
  try {
    const response = await fetch(`/api/users/${props.userId}`)
    user.value = await response.json()
    emit('userLoaded', user.value)
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)
</script>
```

**Composables Pattern**
```typescript
// composables/useUser.ts
import { ref, computed } from 'vue'

export function useUser(userId: string) {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoaded = computed(() => user.value !== null)

  const fetchUser = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      user.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading.value = false
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error),
    isLoaded,
    fetchUser
  }
}
```

**Teleport for Modals**
```vue
<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay">
      <div class="modal">
        <slot />
      </div>
    </div>
  </Teleport>
</template>
```

### Performance Optimizations
- Use `v-memo` for expensive list items
- Prefer `shallowRef` for large objects
- Use `defineAsyncComponent` for code splitting