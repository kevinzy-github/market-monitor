interface Env {
  CACHE_CONTROL?: string
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const indices = [
    { code: 'sh000001', name: '上证指数' },
    { code: 'sh000300', name: '沪深300' },
    { code: 'sz399001', name: '深证成指' },
    { code: 'sz399006', name: '创业板指' }
  ]

  const indexCodes = indices.map(i => `s_${i.code}`).join(',')

  try {
    const res = await fetch(`http://qt.gtimg.cn/q=${indexCodes}`)
    const text = await res.text()

    const data = indices.map((idx) => {
      const regex = new RegExp(`v_s_${idx.code}="([^"]*)"`)
      const match = text.match(regex)
      if (!match) return null

      const values = match[1].split('~')
      return {
        code: idx.code,
        name: idx.name,
        price: parseFloat(values[3] || '0'),
        change: parseFloat(values[4] || '0'),
        changePercent: parseFloat(values[5] || '0'),
        updateTime: new Date().toLocaleTimeString('zh-CN', { hour12: false })
      }
    }).filter(Boolean)

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=60'
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch indices' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
