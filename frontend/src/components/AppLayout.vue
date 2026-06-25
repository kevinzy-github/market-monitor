<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <router-link to="/" class="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">行情监控</router-link>
          <span class="text-xs text-gray-400 hidden sm:inline">实时基金净值</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500 hidden sm:inline">{{ authStore.user?.username }}</span>
          <button @click="$emit('refresh')" :disabled="loading" class="text-blue-500 hover:text-blue-700 disabled:text-gray-300 transition-colors p-1" title="刷新数据">
            <svg :class="{ 'animate-spin': loading }" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button @click="handleLogout" class="text-sm text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">退出</button>
        </div>
      </div>
    </header>
    <main class="max-w-2xl mx-auto px-4 py-6"><slot /></main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

defineProps<{ loading?: boolean }>()
defineEmits<{ refresh: [] }>()
const authStore = useAuthStore()
const router = useRouter()
const handleLogout = () => { authStore.logout(); router.push('/login') }
</script>
