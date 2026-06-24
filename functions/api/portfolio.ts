interface Env {
  PORTFOLIO_KV: KVNamespace
}

function getUsername(request: Request): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.slice(7)
  const userHeader = request.headers.get('X-Username')
  return userHeader || null
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  const username = getUsername(request)
  if (!username) {
    return new Response(JSON.stringify({ error: '未授权' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const PORTFOLIO_KEY = `portfolio_${username}`

  if (request.method === 'GET') {
    try {
      const data = await env.PORTFOLIO_KV.get(PORTFOLIO_KEY, 'json')
      return new Response(JSON.stringify(data || []), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    } catch (error) {
      return new Response(JSON.stringify([]), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  }

  if (request.method === 'POST') {
    try {
      const body = await request.json()

      if (!Array.isArray(body)) {
        return new Response(JSON.stringify({ error: 'Portfolio must be an array' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      await env.PORTFOLIO_KV.put(PORTFOLIO_KEY, JSON.stringify(body))

      return new Response(JSON.stringify({ success: true }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to save portfolio'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Username'
      }
    })
  }

  return new Response('Method not allowed', { status: 405 })
}
