import { Hono } from 'hono'
import { authMiddleware } from '../middleware/auth'

const portfolio = new Hono<{ Bindings: { PORTFOLIO_KV: KVNamespace; JWT_SECRET: string }; Variables: { user: { userId: string; username: string } } }>()
portfolio.use('*', authMiddleware)

portfolio.get('/', async (c) => { try { return c.json(await c.env.PORTFOLIO_KV.get(`portfolio:${c.get('user').username}`, 'json') || []) } catch { return c.json([]) } })

portfolio.post('/', async (c) => {
  const body = await c.req.json()
  if (!Array.isArray(body)) return c.json({ error: '持仓数据必须为数组' }, 400)
  await c.env.PORTFOLIO_KV.put(`portfolio:${c.get('user').username}`, JSON.stringify(body))
  return c.json({ success: true })
})

export { portfolio as portfolioRoutes }
