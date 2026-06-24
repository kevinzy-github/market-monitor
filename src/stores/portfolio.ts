import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PortfolioItem, FundWithProfit } from '../types'

export const usePortfolioStore = defineStore('portfolio', () => {
  const items = ref<PortfolioItem[]>([])
  const fundDataMap = ref<Record<string, any>>({})

  const getAuthHeaders = () => {
    const token = localStorage.getItem('auth_token')
    const username = localStorage.getItem('username')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Username': username || ''
    }
  }

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio', {
        headers: getAuthHeaders()
      })
      if (res.ok) {
        items.value = await res.json()
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error)
    }
  }

  const savePortfolio = async () => {
    try {
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(items.value)
      })
    } catch (error) {
      console.error('Failed to save portfolio:', error)
    }
  }

  const addItem = (item: PortfolioItem) => {
    items.value.push(item)
    savePortfolio()
  }

  const updateItem = (index: number, item: PortfolioItem) => {
    items.value[index] = item
    savePortfolio()
  }

  const removeItem = (index: number) => {
    items.value.splice(index, 1)
    savePortfolio()
  }

  const updateFundData = (code: string, data: any) => {
    fundDataMap.value[code] = data
  }

  const getEnrichedItems = (): FundWithProfit[] => {
    return items.value.map(item => {
      const fundData = fundDataMap.value[item.code]
      return {
        code: item.code,
        name: item.name,
        currentNav: fundData?.currentNav || 0,
        changePercent: fundData?.changePercent || 0,
        lastTime: fundData?.lastTime || '',
        buyNav: item.buyNav,
        shares: item.shares,
        profit: fundData ? (fundData.currentNav - item.buyNav) * item.shares : 0,
        profitPercent: fundData ? ((fundData.currentNav - item.buyNav) / item.buyNav) * 100 : 0
      }
    })
  }

  return {
    items,
    fundDataMap,
    fetchPortfolio,
    savePortfolio,
    addItem,
    updateItem,
    removeItem,
    updateFundData,
    getEnrichedItems
  }
})
