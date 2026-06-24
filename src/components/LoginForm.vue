<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <h1 class="text-3xl font-bold text-center text-gray-900 mb-8">行情监控</h1>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">用户名</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="输入用户名"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="输入密码"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div v-if="isRegister">
          <label class="block text-sm font-medium text-gray-700 mb-2">确认密码</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="再次输入密码"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ error }}
        </div>

        <button
          :disabled="loading"
          class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2 rounded-lg transition"
        >
          {{ loading ? '加载中...' : (isRegister ? '注册' : '登录') }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <button
          @click="isRegister = !isRegister"
          class="text-blue-500 hover:text-blue-600 text-sm"
        >
          {{ isRegister ? '已有账户？去登录' : '没有账户？去注册' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  login: [data: { username: string; token: string }]
}>()

const isRegister = ref(false)
const loading = ref(false)
const error = ref('')

const form = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    if (isRegister.value) {
      if (form.value.password !== form.value.confirmPassword) {
        error.value = '两次输入的密码不一致'
        loading.value = false
        return
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.value.username,
          password: form.value.password
        })
      })

      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || '注册失败'
        return
      }

      emit('login', { username: form.value.username, token: data.token })
    } else {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.value.username,
          password: form.value.password
        })
      })

      const data = await res.json()
      if (!res.ok) {
        error.value = data.error || '登录失败'
        return
      }

      emit('login', { username: form.value.username, token: data.token })
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '发生错误'
  } finally {
    loading.value = false
  }
}
</script>
