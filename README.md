# 📈 行情监控

实时基金净值查询与持仓盈亏分析工具。

## 项目结构

```
├── frontend/           # Vue 前端 + Pages Functions 后端
│   ├── src/
│   │   ├── api/        #   API 客户端
│   │   ├── components/ #   Vue 组件
│   │   ├── router/     #   Vue Router
│   │   ├── stores/     #   Pinia 状态管理
│   │   ├── views/      #   页面视图
│   │   └── server/     #   Hono 后端（Pages Functions 部署用）
│   ├── functions/      #   Cloudflare Pages Functions
│   ├── public/         #   静态资源 / PWA 图标
│   ├── vite.config.ts
│   └── wrangler.toml
│
├── worker/             # Hono 后端（独立 Worker 部署用）
│   ├── src/
│   │   ├── middleware/ #   认证中间件
│   │   └── routes/     #   API 路由
│   └── wrangler.toml
│
├── .github/workflows/  # CI/CD 自动部署
└── package.json        # 统一脚本
```

## 本地开发

```bash
# 安装依赖
cd frontend && npm install
cd worker && npm install

# 同时启动前端 + 后端
npm run dev
```

- 前端 Vite: `http://localhost:5173`（`/api/*` 自动代理到 Worker）
- API Worker: `http://localhost:8787`

## 部署

```bash
# 部署前端 (Cloudflare Pages)
npm run deploy:frontend

# 部署后端 (Cloudflare Worker)
npm run deploy:worker
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/register | 注册 |
| POST | /api/auth/login | 登录 |
| GET | /api/auth/me | 当前用户 |
| GET/POST | /api/portfolio | 持仓管理 |
| GET | /api/indices | 大盘指数 |
| GET | /api/fund/:code | 基金净值 |
