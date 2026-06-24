<template>
  <LoginForm v-if="!isLoggedIn" @login="handleLogin" />

  <div v-else class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">行情监控</h1>
            <p class="text-xs text-gray-500 mt-1">用户: {{ currentUser }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="refreshData"
              :disabled="marketData.loading"
              class="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
            >
              ↻
            </button>
            <button
              @click="logout"
              class="text-gray-500 hover:text-gray-600 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
            >
              登出
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 py-6">
      <IndexPanel :indices="marketData.indices" />

      <FundList
        :funds="portfolioStore.getEnrichedItems()"
        @add="openAddModal"
        @edit="openEditModal"
      />
    </main>

    <EditModal
      :is-open="showModal"
      :item="editingItem"
      @close="closeModal"
      @save="saveItem"
      @remove="removeItem"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePortfolioStore } from './stores/portfolio'
import { useMarketData } from './composables/useMarketData'
import LoginForm from './components/LoginForm.vue'
import IndexPanel from './components/IndexPanel.vue'
import FundList from './components/FundList.vue'
import EditModal from './components/EditModal.vue'
import type { PortfolioItem } from './types'

const portfolioStore = usePortfolioStore()
const marketData = useMarketData()

const isLoggedIn = ref(false)
const currentUser = ref('')

onMounted(() => {
  const token = localStorage.getItem('auth_token')
  const username = localStorage.getItem('username')
  if (token && username) {
    isLoggedIn.value = true
    currentUser.value = username
  }
})

const handleLogin = (data: { username: string; token: string }) => {
  localStorage.setItem('auth_token', data.token)
  localStorage.setItem('username', data.username)
  isLoggedIn.value = true
  currentUser.value = data.username
}

const logout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  currentUser.value = ''
  portfolioStore.$reset()
}

const showModal = ref(false)
const editingItem = ref<PortfolioItem | undefined>()
const editingIndex = ref<number>(-1)

const openAddModal = () => {
  editingItem.value = undefined
  editingIndex.value = -1
  showModal.value = true
}

const openEditModal = (index: number) => {
  editingItem.value = { ...portfolioStore.items[index] }
  editingIndex.value = index
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingItem.value = undefined
  editingIndex.value = -1
}

const saveItem = (item: PortfolioItem) => {
  if (editingIndex.value === -1) {
    portfolioStore.addItem(item)
  } else {
    portfolioStore.updateItem(editingIndex.value, item)
  }
}

const removeItem = () => {
  if (editingIndex.value !== -1) {
    portfolioStore.removeItem(editingIndex.value)
  }
}

const refreshData = async () => {
  await marketData.refreshAllData()
}
</script>
