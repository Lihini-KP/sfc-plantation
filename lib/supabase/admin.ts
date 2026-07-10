import { createClient } from '@supabase/supabase-js'

// Server-only client using the service role key - bypasses RLS entirely.
// NEVER import this into a 'use client' component or expose it to the browser.
// The app's own login (SPINE SSO / shared password) is the real gatekeeper;
// Supabase Auth isn't wired up, so RLS can't distinguish real users from
// anonymous requests - all writes go through trusted server routes instead.
export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
