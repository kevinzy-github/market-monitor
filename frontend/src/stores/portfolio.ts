import { defineStore } from 'pinia'
import { ref } from 'vue'
import { portfolioApi, type PortfolioItem, type FundData } from '../api'

export const usePortfolioStore = defineStore('portfolio', () => {
  const items = ref<PortfolioItem[]>([])
  const fundDataMap = ref<Record<string, FundData>>({})

  const fetchPortfolio = async () => { try { items.value = await portfolioApi.getAll() } catch (e) { console.error('加载持仓失败:', e) } }
  const savePortfolio = async () => { try { await portfolioApi.save(items.value) } catch (e) { console.error('保存持仓失败:', e) } }
  const addItem = (item: PortfolioItem) => { items.value.push(item); savePortfolio() }
  const updateItem = (index: number, item: PortfolioItem) => { items.value[index] = item; savePortfolio() }
  const removeItem = (index: number) => { items.value.splice(index, 1); savePortfolio() }
  const updateFundData = (code: string, data: FundData) => { fundDataMap.value[code] = data }

  const getEnrichedItems = () => items.value.map(item => {
    const fd = fundDataMap.value[item.code]
    const nav = fd?.currentNav || 0
    return { code: item.code, name: item.name, currentNav: nav, changePercent: fd?.changePercent || 0, lastTime: fd?.lastTime || '', buyNav: item.buyNav, shares: item.shares, profit: fd ? (nav - item.buyNav) * item.shares : 0, profitPercent: fd ? ((nav - item.buyNav) / item.buyNav) * 100 : 0 }
  })

  return { items, fundDataMap, fetchPortfolio, savePortfolio, addItem, updateItem, removeItem, updateFundData, getEnrichedItems }
})
