import { Hono } from 'hono'

const indices = new Hono()
const INDEX_LIST = [
  { code: 'sh000001', name: '上证指数' }, { code: 'sh000300', name: '沪深300' },
  { code: 'sz399001', name: '深证成指' }, { code: 'sz399006', name: '创业板指' },
]

indices.get('/', async (c) => {
  try {
    const text = await (await fetch(`http://qt.gtimg.cn/q=${INDEX_LIST.map(i => `s_${i.code}`).join(',')}`)).text()
    return c.json(INDEX_LIST.map(idx => { const m = text.match(new RegExp(`v_s_${idx.code}="([^"]*)"`)); if (!m) return null; const v = m[1].split('~'); return { code: idx.code, name: idx.name, price: parseFloat(v[3] || '0'), change: parseFloat(v[4] || '0'), changePercent: parseFloat(v[5] || '0'), updateTime: new Date().toLocaleTimeString('zh-CN', { hour12: false }) } }).filter(Boolean))
  } catch { return c.json({ error: '获取指数数据失败' }, 500) }
})

export { indices as indicesRoutes }
