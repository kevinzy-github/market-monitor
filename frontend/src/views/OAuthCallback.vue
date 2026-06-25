<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
      <div class="text-4xl mb-4 animate-bounce">📈</div>
      <p class="text-gray-600">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const message = ref('登录中...')

onMounted(async () => {
  const token = route.query.token as string
  const oauthError = route.query.oauth_error as string
  if (oauthError) { message.value = '登录失败: ' + oauthError; return setTimeout(() => router.replace('/login'), 3000) }
  if (token) {
    localStorage.setItem('auth_token', token)
    authStore.token = token
    try { await authStore.checkAuth(); if (authStore.isAuthenticated) { message.value = '登录成功'; router.replace('/'); return } } catch {}
  }
  message.value = '登录失败，请重试'
  setTimeout(() => router.replace('/login'), 1500)
})
</script>
