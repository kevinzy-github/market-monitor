<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-4">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-4xl mb-2">📈</div>
        <h1 class="text-3xl font-bold text-gray-900">行情监控</h1>
        <p class="text-sm text-gray-500 mt-1">实时基金净值 · 盈亏一目了然</p>
        <p v-if="!isRegister" class="text-xs text-amber-500 mt-2 bg-amber-50 py-1 px-3 rounded inline-block">首次使用？切换「注册」创建账号</p>
      </div>

      <!-- OAuth 按钮 -->
      <div class="flex gap-3 mb-2">
        <button type="button" @click="startOAuth('google')" class="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-700">
          <span class="text-lg font-bold" style="background:linear-gradient(135deg,#4285f4,#34a853);-webkit-background-clip:text;-webkit-text-fill-color:transparent">G</span>
          <span class="hidden sm:inline">Google</span>
        </button>
        <button type="button" @click="startOAuth('github')" class="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all text-sm font-medium text-gray-700">
          <svg class="w-5 h-5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          <span class="hidden sm:inline">GitHub</span>
        </button>
      </div>

      <div class="flex items-center gap-3 my-4"><div class="flex-1 border-t border-gray-200"></div><span class="text-xs text-gray-400">或</span><div class="flex-1 border-t border-gray-200"></div></div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-2">用户名</label><input v-model="form.username" type="text" placeholder="输入用户名" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required minlength="2" /></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-2">密码</label><input v-model="form.password" type="password" placeholder="输入密码" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required minlength="4" /></div>
        <div v-if="isRegister"><label class="block text-sm font-medium text-gray-700 mb-2">确认密码</label><input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" required /></div>
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{{ error }}</div>
        <button :disabled="submitting" class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2">
          <span v-if="submitting" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>{{ submitting ? '处理中...' : isRegister ? '注册' : '登录' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <button @click="isRegister = !isRegister" class="text-blue-500 hover:text-blue-700 text-sm font-medium">{{ isRegister ? '已有账户？去登录' : '没有账户？去注册' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const isRegister = ref(false)
const submitting = ref(false)
const error = ref('')
const form = ref({ username: '', password: '', confirmPassword: '' })

function startOAuth(provider: string) { window.location.assign(`/api/auth/oauth/${provider}`) }

async function handleSubmit() {
  error.value = ''; submitting.value = true
  try {
    if (isRegister.value) {
      if (form.value.password !== form.value.confirmPassword) { error.value = '两次输入的密码不一致'; submitting.value = false; return }
      await authStore.register(form.value.username, form.value.password)
    } else { await authStore.login(form.value.username, form.value.password) }
    router.push('/')
  } catch (err: any) { error.value = err.message || '操作失败，请重试' }
  finally { submitting.value = false }
}
</script>
