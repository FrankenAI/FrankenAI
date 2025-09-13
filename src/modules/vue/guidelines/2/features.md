# Vue 2 Specific Features

## Options API (Default in Vue 2)

Vue 2 primarily uses the Options API, though Composition API is available via plugin:

```vue
<template>
  <div class="user-profile">
    <h2>{{ user.name }}</h2>
    <p v-if="loading">Loading...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <div v-else>
      <p>Email: {{ user.email }}</p>
      <button @click="refreshUser">Refresh</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfile',

  props: {
    userId: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      user: null,
      loading: false,
      error: null
    }
  },

  computed: {
    isValidUser() {
      return this.user && this.user.email
    },

    displayName() {
      return this.user ? this.user.name : 'Unknown User'
    }
  },

  watch: {
    userId: {
      handler: 'fetchUser',
      immediate: true
    }
  },

  methods: {
    async fetchUser() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`/api/users/${this.userId}`)
        if (!response.ok) throw new Error('Failed to fetch user')
        this.user = await response.json()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    refreshUser() {
      this.fetchUser()
    }
  }
}
</script>
```

## Vue 2 + Composition API Plugin

If using @vue/composition-api plugin:

```vue
<template>
  <div class="todo-list">
    <form @submit.prevent="addTodo">
      <input v-model="newTodo" placeholder="Add a todo..." />
      <button type="submit">Add</button>
    </form>

    <ul>
      <li v-for="todo in todos" :key="todo.id">
        <input
          type="checkbox"
          v-model="todo.completed"
          @change="updateTodo(todo)"
        />
        <span :class="{ completed: todo.completed }">{{ todo.text }}</span>
        <button @click="removeTodo(todo.id)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed, onMounted } from '@vue/composition-api'

export default {
  setup() {
    const todos = ref([])
    const newTodo = ref('')

    const completedTodos = computed(() =>
      todos.value.filter(todo => todo.completed)
    )

    const addTodo = () => {
      if (newTodo.value.trim()) {
        todos.value.push({
          id: Date.now(),
          text: newTodo.value,
          completed: false
        })
        newTodo.value = ''
      }
    }

    const removeTodo = (id) => {
      const index = todos.value.findIndex(todo => todo.id === id)
      if (index > -1) {
        todos.value.splice(index, 1)
      }
    }

    const updateTodo = async (todo) => {
      // Save to API
      try {
        await fetch(`/api/todos/${todo.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed: todo.completed })
        })
      } catch (error) {
        console.error('Failed to update todo:', error)
        // Revert the change
        todo.completed = !todo.completed
      }
    }

    onMounted(async () => {
      try {
        const response = await fetch('/api/todos')
        todos.value = await response.json()
      } catch (error) {
        console.error('Failed to fetch todos:', error)
      }
    })

    return {
      todos,
      newTodo,
      completedTodos,
      addTodo,
      removeTodo,
      updateTodo
    }
  }
}
</script>

<style scoped>
.completed {
  text-decoration: line-through;
  color: #999;
}
</style>
```

## Vue 2 Specific Features

### Global API

```javascript
// main.js
import Vue from 'vue'
import App from './App.vue'

// Global components
Vue.component('BaseButton', {
  template: '<button class="btn"><slot></slot></button>'
})

// Global directives
Vue.directive('focus', {
  inserted(el) {
    el.focus()
  }
})

// Global filters (removed in Vue 3)
Vue.filter('currency', function(value) {
  if (!value) return ''
  return '$' + value.toFixed(2)
})

// Global mixins
Vue.mixin({
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    }
  }
})

new Vue({
  render: h => h(App),
}).$mount('#app')
```

### Event Bus Pattern

```javascript
// eventBus.js
import Vue from 'vue'
export const EventBus = new Vue()

// Component A
export default {
  methods: {
    sendMessage() {
      EventBus.$emit('message-sent', 'Hello from Component A')
    }
  }
}

// Component B
export default {
  mounted() {
    EventBus.$on('message-sent', (message) => {
      console.log('Received:', message)
    })
  },

  beforeDestroy() {
    EventBus.$off('message-sent')
  }
}
```

### Vuex Integration

```javascript
// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    isAuthenticated: false
  },

  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },

    LOGOUT(state) {
      state.user = null
      state.isAuthenticated = false
    }
  },

  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        })

        const user = await response.json()
        commit('SET_USER', user)
        return user
      } catch (error) {
        throw error
      }
    },

    logout({ commit }) {
      commit('LOGOUT')
    }
  },

  getters: {
    userName: state => state.user?.name || 'Guest',
    userRole: state => state.user?.role || 'user'
  }
})

// Using in component
export default {
  computed: {
    ...mapState(['user', 'isAuthenticated']),
    ...mapGetters(['userName', 'userRole'])
  },

  methods: {
    ...mapActions(['login', 'logout'])
  }
}
```

## Vue Router (Vue 2 Style)

```javascript
// router/index.js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/views/About.vue')
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue'),
    props: true
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.state.isAuthenticated) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
```

## Migration Notes from Vue 2 to Vue 3

### Breaking Changes to Avoid
- **Filters are removed** - use computed properties or methods
- **Event bus pattern** - use external libraries like mitt
- **Global API changes** - `createApp` instead of `new Vue`
- **v-model breaking changes** - custom components need updates
- **Functional components** - syntax completely changed

### Vue 2 Specific Patterns
- Use Options API for familiarity
- Event bus for component communication
- Vuex for state management
- Global components, filters, directives
- `this.$refs`, `this.$emit`, `this.$props`

## Testing Vue 2 Components

```javascript
// tests/UserProfile.spec.js
import { shallowMount } from '@vue/test-utils'
import UserProfile from '@/components/UserProfile.vue'

describe('UserProfile.vue', () => {
  it('renders user name when passed', () => {
    const user = { name: 'John Doe', email: 'john@example.com' }
    const wrapper = shallowMount(UserProfile, {
      propsData: { userId: 1 },
      data() {
        return { user }
      }
    })

    expect(wrapper.text()).toMatch('John Doe')
  })

  it('calls fetchUser when userId prop changes', async () => {
    const wrapper = shallowMount(UserProfile)
    const fetchUserSpy = jest.spyOn(wrapper.vm, 'fetchUser')

    await wrapper.setProps({ userId: 2 })

    expect(fetchUserSpy).toHaveBeenCalled()
  })
})
```

## Vue 2 Best Practices

### Performance
- Use `v-show` vs `v-if` appropriately
- Implement `v-once` for static content
- Use functional components for simple presentations
- Lazy load routes and components

### Code Organization
- Keep components small and focused
- Use mixins sparingly (prefer composition in Vue 3)
- Organize by feature, not by file type
- Use proper prop validation

### State Management
- Use Vuex for complex state
- Local component state for simple cases
- Event bus for sibling communication
- Props down, events up pattern