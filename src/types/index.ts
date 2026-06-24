export interface PortfolioItem {
  code: string
  name: string
  buyNav: number
  shares: number
}

export interface FundData {
  code: string
  name: string
  currentNav: number
  changePercent: number
  lastTime: string
}

export interface FundWithProfit extends FundData {
  buyNav?: number
  shares?: number
  profit?: number
  profitPercent?: number
}

export interface IndexData {
  code: string
  name: string
  price: number
  change: number
  changePercent: number
  updateTime: string
}
