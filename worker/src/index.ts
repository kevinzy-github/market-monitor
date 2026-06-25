import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRoutes } from './routes/auth'
import { portfolioRoutes } from './routes/portfolio'
import { indicesRoutes } from './routes/indices'
import { fundRoutes } from './routes/fund'
import { oauthRoutes } from './routes/oauth'

export interface Env {
  PORTFOLIO_KV: KVNamespace
  JWT_SECRET: string
  BASE_URL?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  GITHUB_CLIENT_ID?: string
  GITHUB_CLIENT_SECRET?: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', logger())
app.use('*', cors({ origin: '*', credentials: true, allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }))

app.get('/api/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))
app.route('/api/auth', authRoutes)
app.route('/api/auth', oauthRoutes)
app.route('/api/portfolio', portfolioRoutes)
app.route('/api/indices', indicesRoutes)
app.route('/api/fund', fundRoutes)

app.notFound((c) => c.json({ error: '接口不存在' }, 404))
app.onError((err, c) => { console.error(err); return c.json({ error: err.message || '服务器内部错误' }, 500) })

export default app
