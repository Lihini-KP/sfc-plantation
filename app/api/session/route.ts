import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE } from '@/lib/spine-auth'
import { resolveSpineUser } from '@/lib/spine-users'

export const runtime = 'nodejs'

// Restore an existing SPINE session on reload (no launch token in the URL).
// GET -> { user } if the sfc_session cookie is valid, else 401.
export async function GET() {
  const secret = process.env.ATLAS_BRIDGE_SECRET
  if (!secret) return NextResponse.json({ user: null }, { status: 503 })

  const cookieStore = await cookies()
  const session = verifySession(cookieStore.get(SESSION_COOKIE)?.value, secret)
  if (!session) return NextResponse.json({ user: null }, { status: 401 })

  return NextResponse.json({ user: resolveSpineUser(session.email, session.admin) })
}
