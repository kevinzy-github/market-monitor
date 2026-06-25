import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: () => import('../components/LoginForm.vue'), meta: { requiresAuth: false } },
    { path: '/oauth/callback', name: 'OAuthCallback', component: () => import('../views/OAuthCallback.vue'), meta: { requiresAuth: false } },
    { path: '/', name: 'Dashboard', component: () => import('../views/Dashboard.vue'), meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    if (authStore.token && !authStore.user) { authStore.checkAuth().then(() => next(authStore.isAuthenticated ? undefined : '/login')) }
    else next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) { next('/') }
  else next()
})

export default router
