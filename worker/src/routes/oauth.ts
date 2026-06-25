import { Hono } from 'hono'
import { generateToken } from '../middleware/auth'

const OAUTH_CONFIGS: Record<string, (env: any) => any | null> = {
  google: (env) => env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET,
    scope: 'openid email profile',
    extractUser: (data: any) => ({ providerId: data.id, email: data.email, name: data.name || data.email?.split('@')[0] || 'Google用户' }),
  } : null,
  github: (env) => env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET ? {
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET,
    scope: 'read:user user:email',
    extractUser: async (data: any, env: any, config: any) => {
      let email = data.email || ''
      if (!email) {
        try {
          const r = await fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${data._accessToken}`, 'User-Agent': 'market-monitor' } })
          const emails = await r.json() as any[]
          const p = emails.find((e: any) => e.primary)
          if (p) email = p.email
        } catch {}
      }
      return { providerId: String(data.id), email: email || `github-${data.id}@placeholder.com`, name: data.name || data.login || 'GitHub用户' }
    },
  } : null,
}

function getBaseUrl(env: any, req: Request): string {
  return env.BASE_URL || req.url.split('/').slice(0, 3).join('/')
}

const oauth = new Hono<{ Bindings: { PORTFOLIO_KV: KVNamespace; JWT_SECRET: string; BASE_URL?: string; GOOGLE_CLIENT_ID?: string; GOOGLE_CLIENT_SECRET?: string; GITHUB_CLIENT_ID?: string; GITHUB_CLIENT_SECRET?: string } }>()

oauth.get('/oauth/:provider', async (c) => {
  const provider = c.req.param('provider')
  const config = OAUTH_CONFIGS[provider]?.(c.env)
  if (!config) return c.json({ error: `${provider} 登录尚未配置` }, 501)

  const baseUrl = getBaseUrl(c.env, c.req.raw)
  const state = crypto.randomUUID()
  const stateStr = `${state}:${provider}`
  const params = new URLSearchParams({ client_id: config.clientId, redirect_uri: `${baseUrl}/api/auth/oauth/${provider}/callback`, response_type: 'code', scope: config.scope, state: stateStr })

  return new Response(null, { status: 302, headers: { Location: `${config.authorizeUrl}?${params}`, 'Set-Cookie': `oauth_state=${encodeURIComponent(stateStr)}; Max-Age=600; Path=/; HttpOnly; SameSite=Lax` } })
})

oauth.get('/oauth/:provider/callback', async (c) => {
  const provider = c.req.param('provider')
  const config = OAUTH_CONFIGS[provider]?.(c.env)
  if (!config) return c.json({ error: 'OAuth 未配置' }, 501)

  const baseUrl = getBaseUrl(c.env, c.req.raw)
  const { code, state: stateParam, error: oauthError } = c.req.query()
  if (oauthError) return c.redirect(`${baseUrl}/oauth/callback?oauth_error=${encodeURIComponent(oauthError)}`)
  if (!code || !stateParam) return c.json({ error: '缺少认证参数' }, 400)

  const cookies = Object.fromEntries((c.req.header('Cookie') || '').split(';').filter(Boolean).map(c => { const [k, ...v] = c.trim().split('='); return [k, decodeURIComponent(v.join('='))] }))
  if (cookies['oauth_state'] !== stateParam) return c.json({ error: 'state 验证失败' }, 400)

  try {
    const tokenRes = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, code, redirect_uri: `${baseUrl}/api/auth/oauth/${provider}/callback`, grant_type: 'authorization_code' }).toString(),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) return c.redirect(`${baseUrl}/oauth/callback?oauth_error=token_exchange_failed`)

    let userData = await fetch(config.userInfoUrl, { headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'market-monitor' } }).then(r => r.json())
    if (provider === 'github') userData._accessToken = tokenData.access_token

    const userInfo = await config.extractUser(userData, c.env, config)
    const linkKey = `oauth_link:${provider}:${userInfo.providerId}`
    const existingLink = await c.env.PORTFOLIO_KV.get(linkKey, 'json') as any

    let username: string, userId: string
    if (existingLink) {
      username = existingLink.username
      const ud = await c.env.PORTFOLIO_KV.get(`user:${username}`, 'json') as any
      userId = ud?.userId || `user_oauth_${Date.now()}`
    } else {
      username = userInfo.email
      userId = `user_oauth_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
      const existing = await c.env.PORTFOLIO_KV.get(`user:${username}`, 'json')
      if (existing) username = `${userInfo.email.split('@')[0]}+${provider}@${userInfo.email.split('@')[1]}`
      await c.env.PORTFOLIO_KV.put(`user:${username}`, JSON.stringify({ userId, username, passwordHash: `oauth:${provider}`, createdAt: new Date().toISOString() }))
      await c.env.PORTFOLIO_KV.put(linkKey, JSON.stringify({ username }))
    }

    const jwt = await generateToken({ userId, username }, c.env.JWT_SECRET)
    return c.redirect(`${baseUrl}/oauth/callback?token=${jwt}`)
  } catch (err: any) {
    console.error('OAuth callback error:', err)
    return c.redirect(`${baseUrl}/oauth/callback?oauth_error=server_error`)
  }
})

export { oauth as oauthRoutes }
