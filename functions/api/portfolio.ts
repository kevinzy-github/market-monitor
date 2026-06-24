interface Env {
  PORTFOLIO_KV: KVNamespace
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  const PORTFOLIO_KEY = 'portfolio_data'

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
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  }

  return new Response('Method not allowed', { status: 405 })
}
