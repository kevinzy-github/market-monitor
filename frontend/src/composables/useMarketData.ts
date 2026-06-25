import { ref, onMounted, onUnmounted } from 'vue'
import { usePortfolioStore } from '../stores/portfolio'
import { marketApi, type IndexData } from '../api'

export function useMarketData() {
  const indices = ref<IndexData[]>([])
  const loading = ref(false)
  const portfolioStore = usePortfolioStore()
  let refreshInterval: number

  const fetchIndices = async () => { try { indices.value = await marketApi.getIndices() } catch (e) { console.error('获取指数失败:', e) } }
  const fetchFundData = async (code: string) => { try { portfolioStore.updateFundData(code, await marketApi.getFundData(code)) } catch (e) { console.error(`获取基金 ${code} 失败:`, e) } }

  const refreshAllData = async () => {
    loading.value = true
    try { await fetchIndices(); for (const item of portfolioStore.items) await fetchFundData(item.code) }
    finally { loading.value = false }
  }

  onMounted(() => { portfolioStore.fetchPortfolio(); refreshAllData(); refreshInterval = window.setInterval(refreshAllData, 60000) })
  onUnmounted(() => { if (refreshInterval) clearInterval(refreshInterval) })

  return { indices, loading, fetchIndices, fetchFundData, refreshAllData }
}
