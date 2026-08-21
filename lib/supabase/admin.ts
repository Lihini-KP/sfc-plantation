import { createClient } from '@supabase/supabase-js'

// Server-only client using the service role key - bypasses RLS entirely.
// NEVER import this into a 'use client' component or expose it to the browser.
// The app's own login (SPINE SSO / shared password) is the real gatekeeper;
// Supabase Auth isn't wired up, so RLS can't distinguish real users from
// anonymous requests - all writes go through trusted server routes instead.
//
// Real data lives in the "plantation" schema of the Silki Supabase project,
// but Silki's PostgREST config won't recognize that schema (confirmed stuck
// even after re-saving the setting and two project restarts). As a
// workaround, plantation_* views in the already-exposed "inventory" schema
// mirror the real tables - hence targeting "inventory" here and callers
// using the "plantation_" prefix on table names (see lib/data.ts etc).
export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured.')
  }
  return createClient(url, key, { auth: { persistSession: false }, db: { schema: 'inventory' } })
}
