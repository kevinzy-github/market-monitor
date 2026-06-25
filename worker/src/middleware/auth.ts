import { createMiddleware } from 'hono/factory'
import { jwtVerify, SignJWT } from 'jose'

async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256)
  return new Uint8Array(bits)
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const hash = await deriveKey(password, salt)
  const combined = new Uint8Array(salt.length + hash.length)
  combined.set(salt); combined.set(hash, salt.length)
  return btoa(String.fromCharCode(...combined))
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const combined = Uint8Array.from(atob(stored), c => c.charCodeAt(0))
    const salt = combined.slice(0, 16)
    const hash = await deriveKey(password, salt)
    return hash.every((v, i) => v === combined[16 + i])
  } catch { return false }
}

function getSecret(secret: string): Uint8Array {
  return new TextEncoder().encode(secret)
}

export async function generateToken(payload: { userId: string; username: string }, secret: string): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d')
    .sign(getSecret(secret))
}

export interface JwtPayload { userId: string; username: string }

export const authMiddleware = createMiddleware<{
  Bindings: { JWT_SECRET: string }
  Variables: { user: JwtPayload }
}>(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return c.json({ error: '未提供认证令牌' }, 401)
  try {
    const { payload } = await jwtVerify(authHeader.slice(7), getSecret(c.env.JWT_SECRET), { algorithms: ['HS256'] })
    c.set('user', payload as unknown as JwtPayload)
    await next()
  } catch { return c.json({ error: '令牌无效或已过期' }, 401) }
})
