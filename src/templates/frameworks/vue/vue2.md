## Vue 2 Guidelines (Legacy)

### Important Notice
Vue 2 reached End of Life on December 31, 2023. Consider migrating to Vue 3.

### Key Patterns (If Still Using Vue 2)

**Options API**
```javascript
export default {
  name: 'UserProfile',
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      user: null,
      loading: false
    }
  },
  async created() {
    await this.fetchUser()
  },
  methods: {
    async fetchUser() {
      this.loading = true
      try {
        this.user = await userApi.get(this.userId)
      } finally {
        this.loading = false
      }
    }
  }
}
```

### Migration Recommendation
Use Vue 3 with Composition API for new projects. Vue 2 should only be maintained, not extended.