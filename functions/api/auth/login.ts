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

    const userDataStr = await env.PORTFOLIO_KV.get(`user_${username}`)
    if (!userDataStr) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const userData = JSON.parse(userDataStr)
    const passwordHash = simpleHash(password)

    if (userData.passwordHash !== passwordHash) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const newToken = generateToken()
    userData.token = newToken
    await env.PORTFOLIO_KV.put(`user_${username}`, JSON.stringify(userData))

    return new Response(JSON.stringify({
      token: newToken,
      userId: userData.userId,
      username
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return new Response(JSON.stringify({ error: '登录失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
