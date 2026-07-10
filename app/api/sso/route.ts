import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  verifyLaunchToken,
  signSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  APP_SURFACE,
} from '@/lib/spine-auth'
import { resolveSpineUser } from '@/lib/spine-users'

export const runtime = 'nodejs'

// Exchange a SPINE launch token (from the tile) for our own 12h session.
// POST { token } -> sets the sfc_session httpOnly cookie, returns the user.
export async function POST(request: Request) {
  const secret = process.env.ATLAS_BRIDGE_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: 'SSO is not configured. Set ATLAS_BRIDGE_SECRET in the Netlify env.' },
      { status: 503 }
    )
  }

  let token: unknown
  try {
    ;({ token } = await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }
  if (typeof token !== 'string' || !token) {
    return NextResponse.json({ error: 'No launch token provided.' }, { status: 400 })
  }

  const identity = verifyLaunchToken(token, secret)
  if (!identity) {
    return NextResponse.json({ error: 'Invalid or expired launch token.' }, { status: 401 })
  }
  if (identity.surface !== APP_SURFACE) {
    return NextResponse.json({ error: 'Launch token is for a different app.' }, { status: 403 })
  }

  const session = signSession(identity.email, identity.admin, secret)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return NextResponse.json({ user: resolveSpineUser(identity.email, identity.admin) })
}
