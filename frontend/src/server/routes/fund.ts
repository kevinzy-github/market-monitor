import { Hono } from 'hono'

const fund = new Hono()
fund.get('/:code', async (c) => {
  const code = c.req.param('code')
  if (!code) return c.json({ error: '基金代码不能为空' }, 400)
  try {
    const estText = await (await fetch(`http://fundgz.1234567.com.cn/js/${code}.js?rt=${Date.now()}`)).text()
    const estMatch = estText.match(/jsonpgz\((.*)\)/)
    const est = estMatch ? JSON.parse(estMatch[1]) : {}
    let name = ''
    try { const d = await (await fetch(`http://fund.eastmoney.com/pingzhongdata/${code}.js`)).text(); const n = d.match(/var fS_name = "([^"]+)"/); if (n) name = n[1] } catch {}
    return c.json({ code: est.fundcode || code, name: name || est.name || 'Unknown', currentNav: parseFloat(est.dwjz || '0'), changePercent: parseFloat(est.gszzl?.replace('%', '') || '0'), lastTime: est.gztime || new Date().toLocaleTimeString('zh-CN') })
  } catch { return c.json({ error: '获取基金数据失败' }, 500) }
})
export { fund as fundRoutes }
