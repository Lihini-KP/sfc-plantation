// Shared SPINE/ATLAS agent-run reporter (docs/CONNECT-KIT.md §5). Same shape as
// attendance-system's lib/agentReport.ts - every connected SRV app posts its job
// runs here so health/SLA shows up in the ATLAS Agents tab.
const SPINE = 'https://srv-spine.netlify.app'
const TOKEN = process.env.ATLAS_AGENT_TOKEN

export async function reportAgentRun({
  agent_key,
  status,
  summary,
  metrics = {},
}: {
  agent_key: string
  status: 'running' | 'success' | 'error'
  summary: string
  metrics?: Record<string, number | string>
}): Promise<void> {
  if (!TOKEN) {
    console.log(`[agent-run] ${agent_key} ${status}: ${summary}`, metrics)
    return
  }
  try {
    const res = await fetch(`${SPINE}/.netlify/functions/atlas-agent-run`, {
      method: 'POST',
      headers: { authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
      body: JSON.stringify({ agent_key, status, summary, metrics }),
    })
    if (!res.ok) console.error('[agent-run] failed', res.status, await res.text())
  } catch (err) {
    console.error('[agent-run] fetch error', err)
  }
}
