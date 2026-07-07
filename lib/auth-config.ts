// TEMPORARY shared access password for the prototype login page. There's no
// real backend yet, so this is a single shared password (not per-person)
// checked entirely client-side - fine for an internal demo, not real
// security. Replace this whole mechanism with Supabase Auth (real per-user
// passwords, hashed server-side) before this goes anywhere near production
// or real company data with restricted access needs.
export const SHARED_ACCESS_PASSWORD = 'SilkFood@2026'
