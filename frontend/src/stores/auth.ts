import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type UserInfo } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(true)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function checkAuth() {
    loading.value = true
    if (!token.value) { loading.value = false; return }
    try { user.value = await authApi.getMe() }
    catch { token.value = null; user.value = null; localStorage.removeItem('auth_token'); localStorage.removeItem('username') }
    finally { loading.value = false }
  }

  async function login(username: string, password: string) {
    const res = await authApi.login(username, password)
    token.value = res.token
    localStorage.setItem('auth_token', res.token)
    localStorage.setItem('username', res.username)
    try { user.value = await authApi.getMe() } catch { user.value = { userId: res.userId, username: res.username } }
    return res
  }

  async function register(username: string, password: string) {
    const res = await authApi.register(username, password)
    token.value = res.token
    localStorage.setItem('auth_token', res.token)
    localStorage.setItem('username', res.username)
    user.value = { userId: res.userId, username: res.username }
    return res
  }

  function logout() { token.value = null; user.value = null; localStorage.removeItem('auth_token'); localStorage.removeItem('username') }

  return { user, token, loading, isAuthenticated, checkAuth, login, register, logout }
})
