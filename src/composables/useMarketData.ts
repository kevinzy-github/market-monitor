import { ref, onMounted, onUnmounted } from 'vue'
import { usePortfolioStore } from '../stores/portfolio'
import type { IndexData } from '../types'

export function useMarketData() {
  const indices = ref<IndexData[]>([])
  const loading = ref(false)
  const portfolioStore = usePortfolioStore()
  let refreshInterval: number

  const fetchIndices = async () => {
    try {
      const res = await fetch('/api/indices')
      if (res.ok) {
        indices.value = await res.json()
      }
    } catch (err) {
      console.error('Failed to fetch indices:', err)
    }
  }

  const fetchFundData = async (code: string) => {
    try {
      const res = await fetch(`/api/fund/${code}`)
      if (res.ok) {
        const data = await res.json()
        portfolioStore.updateFundData(code, data)
      }
    } catch (err) {
      console.error(`Failed to fetch fund ${code}:`, err)
    }
  }

  const refreshAllData = async () => {
    loading.value = true
    try {
      await fetchIndices()
      for (const item of portfolioStore.items) {
        await fetchFundData(item.code)
      }
    } finally {
      loading.value = false
    }
  }

  const startAutoRefresh = () => {
    refreshAllData()
    refreshInterval = window.setInterval(() => {
      refreshAllData()
    }, 60000)
  }

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
  }

  onMounted(() => {
    portfolioStore.fetchPortfolio()
    startAutoRefresh()
  })

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    indices,
    loading,
    fetchIndices,
    fetchFundData,
    refreshAllData,
    startAutoRefresh,
    stopAutoRefresh
  }
}
