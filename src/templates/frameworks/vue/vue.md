## Vue.js Guidelines (Common)

### Core Principles & Best Practices

**Component Architecture**
- Single File Components (.vue files)
- Composition API preferred over Options API
- Proper component naming (PascalCase)
- Clear separation of concerns

**Reactivity System**
```vue
<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

// Reactive references
const count = ref(0)
const user = reactive({ name: '', email: '' })

// Computed properties
const displayName = computed(() => user.name || 'Anonymous')

// Lifecycle
onMounted(() => {
  console.log('Component mounted')
})
</script>
```

**Component Communication**
```vue
<!-- Parent to child: Props -->
<script setup>
defineProps<{
  title: string
  items?: string[]
}>()
</script>

<!-- Child to parent: Emits -->
<script setup>
const emit = defineEmits<{
  update: [value: string]
  delete: [id: number]
}>()

const handleClick = () => {
  emit('update', 'new value')
}
</script>
```

**Template Best Practices**
```vue
<template>
  <!-- Use v-for with key -->
  <div v-for="item in items" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- Conditional rendering -->
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="hasError">Error occurred</div>
  <div v-else>{{ content }}</div>
  
  <!-- Event handling -->
  <button @click="handleClick">Click me</button>
</template>
```

**Directives & Modifiers**
```vue
<template>
  <!-- Form handling -->
  <input v-model.trim="username" type="text">
  <input v-model.number="age" type="number">
  
  <!-- Event modifiers -->
  <form @submit.prevent="handleSubmit">
    <button @click.stop="handleClick">Button</button>
  </form>
</template>
```