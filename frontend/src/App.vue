<template><router-view /></template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
const authStore = useAuthStore()
const router = useRouter()
onMounted(() => {
  if (location.pathname === '/oauth/callback') return // OAuth回调页自己处理
  authStore.checkAuth().then(() => { if (!authStore.isAuthenticated) router.push('/login') })
})
</script>
