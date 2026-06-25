// Server entry for Cloudflare Pages Functions
// Re-exports the canonical Hono app from the worker package

import app from '../../../worker/src/index'
export type { Env } from '../../../worker/src/index'
export default app
