interface Env {
  PORTFOLIO_KV: KVNamespace
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json()
    const { username, password } = body as { username?: string; password?: string }

    if (!username || !password) {
      return new Response(JSON.stringify({ error: '用户名和密码不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (username.length < 3 || password.length < 6) {
      return new Response(JSON.stringify({ error: '用户名至少3个字符，密码至少6个字符' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // 检查用户是否已存在
    const existingUser = await env.PORTFOLIO_KV.get(`user_${username}`)
    if (existingUser) {
      return new Response(JSON.stringify({ error: '用户名已存在' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const passwordHash = simpleHash(password)
    const token = generateToken()

    await env.PORTFOLIO_KV.put(`user_${username}`, JSON.stringify({
      userId,
      username,
      passwordHash,
      token,
      createdAt: new Date().toISOString()
    }))

    return new Response(JSON.stringify({ token, userId, username }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    return new Response(JSON.stringify({ error: '注册失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
