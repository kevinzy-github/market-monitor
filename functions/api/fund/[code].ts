export const onRequest: PagesFunction = async (context) => {
  const { params } = context
  const code = params.code as string

  if (!code) {
    return new Response(JSON.stringify({ error: 'Fund code is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const estimateUrl = `http://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`
    const estimateRes = await fetch(estimateUrl)
    const estimateText = await estimateRes.text()

    const estimateMatch = estimateText.match(/jsonpgz\((.*)\)/)
    let estimateData: any = {}

    if (estimateMatch) {
      estimateData = JSON.parse(estimateMatch[1])
    }

    let detailData: any = {}
    try {
      const detailUrl = `http://fund.eastmoney.com/pingzhongdata/${code}.js`
      const detailRes = await fetch(detailUrl)
      const detailText = await detailRes.text()

      const nameMatch = detailText.match(/var fS_name = "([^"]+)"/)
      if (nameMatch) {
        detailData.name = nameMatch[1]
      }
    } catch (e) {
      console.warn('Detail fetch failed:', e)
    }

    const response = {
      code: estimateData.fundcode || code,
      name: detailData.name || estimateData.name || 'Unknown',
      currentNav: parseFloat(estimateData.dwjz || '0'),
      changePercent: parseFloat(estimateData.gszzl?.replace('%', '') || '0'),
      lastTime: estimateData.gztime || new Date().toLocaleTimeString('zh-CN')
    }

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=60'
      }
    })
  } catch (error) {
    console.error('Fund fetch error:', error)
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to fetch fund data'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
}
