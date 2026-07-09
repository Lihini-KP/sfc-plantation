# SPINE / ATLAS connection

This app is a tile in **SPINE** (the SRV nerve system). People sign in by
clicking the tile — SPINE hands the app a short-lived launch token and the app
mints its own session. No per-user passwords live here.

Connected at: **Rung 1 — Tile + SSO** (see `CliveSilk/spine` → `docs/PLAYBOOK.md`).
Later rungs (two-way ATLAS tasks, agent-run reporting, daily P&L pulse) are
planned but not wired yet.

## How sign-in works

1. SPINE opens the app at `https://<app>/#srv_token=<token>`.
2. `lib/role-context.tsx` reads `#srv_token` on boot, strips it from the URL,
   and POSTs it to `app/api/sso/route.ts`.
3. `/api/sso` verifies the token's HMAC with `ATLAS_BRIDGE_SECRET`
   (`lib/spine-auth.ts`), checks `surface === 'module_plantation'`, and mints a
   **12-hour** session in an httpOnly cookie (`sfc_session`).
4. On reload there's no token in the URL, so the app calls `/api/session` to
   restore the cookie session — no second login.
5. `lib/spine-users.ts` maps the SPINE email → an app user + role. The token's
   `admin` flag grants Admin; known people get their role; anyone else SPINE
   admits enters as a Field Officer.

The old shared-password login (`app/login/page.tsx`) is kept only as a
**direct-access fallback** for local/dev use. Once everyone reaches the app via
the SPINE tile, retire it.

## SPINE-managed secrets (set in the Netlify site env — values from Sahan)

| Secret | Purpose | Status |
|---|---|---|
| `ATLAS_BRIDGE_SECRET` | Verify the SPINE launch token + sign the app session | **Required for SSO** |
| `ANTHROPIC_API_KEY` | Claude assistant (`/api/ai-chat`) + tunnel-photo vision | Already used |
| `APP_TASK_SECRET` | Push tasks into ATLAS (`app-task`) — for the next rung | Not needed yet |

Never commit these. `ATLAS_BRIDGE_SECRET` must match the value SPINE signs
launch tokens with, or every sign-in returns 401.

## SPINE side (owned in `CliveSilk/spine`, not this repo)

- Tile registered in `src/lib/apps.ts` as `module_plantation`.
- People granted in **App access** (Lihini = Admin/builder; Arushika, Dhanusha,
  Sahan = User).
