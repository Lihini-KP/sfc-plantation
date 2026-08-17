// Shared SPINE/ATLAS task pusher (docs/CONNECT-KIT.md §4/§4b). Same shape as
// attendance-system's lib/atlasTask.ts - never write atlas.tasks directly,
// always go through app-task with APP_TASK_SECRET.
const SPINE = 'https://srv-spine.netlify.app'
const SECRET = process.env.APP_TASK_SECRET

export async function pushTask(body: {
  source: string
  title: string
  description: string
  assignee: { email?: string; role?: string }
  dedup_key: string
  upsert?: boolean
  business_critical?: boolean
  status?: string
  ref_url?: string
}): Promise<void> {
  if (!SECRET) {
    console.log('[atlas-task] APP_TASK_SECRET not set - skipping push', body.title)
    return
  }
  try {
    const res = await fetch(`${SPINE}/.netlify/functions/app-task`, {
      method: 'POST',
      headers: { 'x-app-secret': SECRET, 'content-type': 'application/json' },
      body: JSON.stringify({ upsert: true, notify: true, ...body }),
    })
    if (!res.ok) console.error('[atlas-task] push failed', res.status, await res.text())
  } catch (err) {
    console.error('[atlas-task] fetch error', err)
  }
}
