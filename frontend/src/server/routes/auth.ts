import { Hono } from 'hono'
import { hashPassword, verifyPassword, generateToken, authMiddleware } from '../middleware/auth'

const auth = new Hono<{ Bindings: { PORTFOLIO_KV: KVNamespace; JWT_SECRET: string }; Variables: { user: { userId: string; username: string } } }>()

auth.post('/register', async (c) => {
  const { username, password } = await c.req.json()
  if (!username || !password) return c.json({ error: '用户名和密码不能为空' }, 400)
  if (username.length < 2 || password.length < 4) return c.json({ error: '用户名至少2个字符，密码至少4个字符' }, 400)
  if (await c.env.PORTFOLIO_KV.get(`user:${username}`, 'json')) return c.json({ error: '用户名已被注册' }, 409)

  const passwordHash = await hashPassword(password)
  const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  await c.env.PORTFOLIO_KV.put(`user:${username}`, JSON.stringify({ userId, username, passwordHash, createdAt: new Date().toISOString() }))
  const token = await generateToken({ userId, username }, c.env.JWT_SECRET)
  return c.json({ token, userId, username }, 201)
})

auth.post('/login', async (c) => {
  const { username, password } = await c.req.json()
  if (!username || !password) return c.json({ error: '用户名和密码不能为空' }, 400)
  const ud = await c.env.PORTFOLIO_KV.get(`user:${username}`, 'json') as any
  if (!ud || !(await verifyPassword(password, ud.passwordHash))) return c.json({ error: '用户名或密码错误' }, 401)
  const token = await generateToken({ userId: ud.userId, username }, c.env.JWT_SECRET)
  return c.json({ token, userId: ud.userId, username })
})

auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user')
  return c.json({ userId: user.userId, username: user.username })
})

export { auth as authRoutes }
