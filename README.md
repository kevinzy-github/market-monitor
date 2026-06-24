# 行情监控

Vue 3 + Cloudflare Pages 实时股市和基金监控应用

## 功能

- 📊 实时显示中国股市指数（上证、沪深300、深证、创业板）
- 💰 显示自选基金的实时涨跌幅
- 📝 可编辑持仓信息（买入净值、份额、自动计算盈亏）
- ☁️ 部署在 Cloudflare Pages

## 本地开发

```bash
npm install
npm run dev
```

访问 `http://localhost:5173`

## 部署到 Cloudflare

```bash
npm run build
npm run deploy
```

## 配置 KV

1. 在 Cloudflare Dashboard 创建 KV namespace
2. 更新 `wrangler.toml` 中的 KV 绑定 ID
3. 部署

## 数据来源

- 基金实时数据：东方财富
- 股票指数：腾讯财经
