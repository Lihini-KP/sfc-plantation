// SPINE / ATLAS single-sign-on glue (server-only).
//
// Two token systems live here:
//  1. The SPINE *launch token* — a 90-second, single-use key that rides in the
//     URL hash (`#srv_token=...`) when someone opens this app from its SPINE
//     tile. We verify it with ATLAS_BRIDGE_SECRET and trust the email inside.
//     (Connect Kit §2.)
//  2. Our *own session token* — because the launch token expires in 90s, we
//     mint a longer-lived (12h) session of our own (same HMAC scheme) and store
//     it in an httpOnly cookie, so the person stays signed in across reloads.
//     (Playbook Step 2 pattern A + Step 3.)
//
// This module must never be imported into client code — it reads the secret
// from the server environment.
import crypto from 'node:crypto'

const SESSION_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours
export const SESSION_COOKIE = 'sfc_session'
export const APP_SURFACE = 'module_plantation'

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

export interface LaunchIdentity {
  email: string
  surface: string
  admin: boolean
}

// Verify a SPINE launch token: base64url(JSON).base64url(HMAC).
// Returns the identity, or null if the token is invalid/expired/tampered.
export function verifyLaunchToken(
  token: string | undefined | null,
  secret: string | undefined | null,
  now: number = Date.now()
): LaunchIdentity | null {
  if (!token || !secret) return null
  const dot = token.indexOf('.')
  if (dot < 1 || dot === token.length - 1) return null
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const expected = sign(payload, secret)
  if (!safeEqual(sig, expected)) return null
  let obj: Record<string, unknown>
  try {
    obj = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!obj?.email || !obj?.surface || !obj?.exp || now > Number(obj.exp)) return null
  return {
    email: String(obj.email).toLowerCase(),
    surface: String(obj.surface),
    admin: !!obj.admin,
  }
}

export interface AppSession {
  email: string
  admin: boolean
  exp: number
}

// Mint our own 12h session token (same HMAC scheme, keyed by ATLAS_BRIDGE_SECRET).
export function signSession(
  email: string,
  admin: boolean,
  secret: string,
  now: number = Date.now()
): string {
  const payload = b64url(JSON.stringify({ email: email.toLowerCase(), admin, exp: now + SESSION_TTL_MS }))
  return `${payload}.${sign(payload, secret)}`
}

// Verify our own session cookie. Returns the session, or null if missing/expired.
export function verifySession(
  token: string | undefined | null,
  secret: string | undefined | null,
  now: number = Date.now()
): AppSession | null {
  if (!token || !secret) return null
  const dot = token.indexOf('.')
  if (dot < 1 || dot === token.length - 1) return null
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  if (!safeEqual(sig, sign(payload, secret))) return null
  let obj: Record<string, unknown>
  try {
    obj = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!obj?.email || !obj?.exp || now > Number(obj.exp)) return null
  return { email: String(obj.email).toLowerCase(), admin: !!obj.admin, exp: Number(obj.exp) }
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000
