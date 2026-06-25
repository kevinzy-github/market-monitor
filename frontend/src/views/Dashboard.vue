<template>
  <AppLayout :loading="marketData.loading.value" @refresh="marketData.refreshAllData()">
    <IndexPanel :indices="marketData.indices.value" />
    <FundList :funds="portfolioStore.getEnrichedItems()" @add="openAddModal" @edit="openEditModal" />
    <EditModal :is-open="showModal" :item="editingItem" @close="closeModal" @save="saveItem" @remove="removeItem" />
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePortfolioStore } from '../stores/portfolio'
import { useMarketData } from '../composables/useMarketData'
import AppLayout from '../components/AppLayout.vue'
import IndexPanel from '../components/IndexPanel.vue'
import FundList from '../components/FundList.vue'
import EditModal from '../components/EditModal.vue'
import type { PortfolioItem } from '../api'

const portfolioStore = usePortfolioStore()
const marketData = useMarketData()
const showModal = ref(false)
const editingItem = ref<PortfolioItem>()
const editingIndex = ref(-1)

const openAddModal = () => { editingItem.value = undefined; editingIndex.value = -1; showModal.value = true }
const openEditModal = (index: number) => { editingItem.value = { ...portfolioStore.items[index] }; editingIndex.value = index; showModal.value = true }
const closeModal = () => { showModal.value = false; editingItem.value = undefined; editingIndex.value = -1 }
const saveItem = (item: PortfolioItem) => { editingIndex.value === -1 ? portfolioStore.addItem(item) : portfolioStore.updateItem(editingIndex.value, item) }
const removeItem = () => { if (editingIndex.value !== -1) portfolioStore.removeItem(editingIndex.value) }
</script>
