<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-2xl mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">行情监控</h1>
          <button
            @click="refreshData"
            :disabled="marketData.loading"
            class="text-blue-500 hover:text-blue-600 disabled:text-gray-400"
          >
            ↻
          </button>
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
import { ref } from 'vue'
import { usePortfolioStore } from './stores/portfolio'
import { useMarketData } from './composables/useMarketData'
import IndexPanel from './components/IndexPanel.vue'
import FundList from './components/FundList.vue'
import EditModal from './components/EditModal.vue'
import type { PortfolioItem } from './types'

const portfolioStore = usePortfolioStore()
const marketData = useMarketData()

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
