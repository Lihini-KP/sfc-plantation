import Anthropic from '@anthropic-ai/sdk'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { greenhouses } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'
import { sendTelegramMessage, sendTelegramPhoto } from '@/lib/telegram'

interface TunnelLogRow {
  tunnel_id: string
  date: string
  photos: string[] | null
  health_assessment: string | null
  severity: string | null
}

async function writeReport(entries: { tunnel: string; cropName: string; latest: TunnelLogRow | null }[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  const plainList = entries
    .map(({ tunnel, cropName, latest }) => {
      if (!latest) return `${tunnel} (${cropName}): no photo inspection logged yet.`
      return `${tunnel} (${cropName}) - last inspected ${formatDate(latest.date)}, severity: ${latest.severity || 'not assessed'}. ${latest.health_assessment || 'No AI assessment attached to this entry.'}`
    })
    .join('\n\n')

  if (!apiKey) return `Tunnel Health Report:\n\n${plainList}`

  const anthropic = new Anthropic({ apiKey })
  const prompt = `You are writing a short weekly tunnel health report for a plantation team's Telegram group, based on the most recent photo inspection logged for each of the 5 greenhouse tunnels. Write plain prose (no markdown headers), covering each tunnel by name, its current severity/status, and any notable issues. Flag any tunnel with no recent inspection. Be factual - only use what's given below, don't invent anything.

Latest data per tunnel:
${plainList}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    const textBlock = message.content.find((b) => b.type === 'text')
    return textBlock && textBlock.type === 'text' ? textBlock.text.trim() : plainList
  } catch {
    return plainList
  }
}

// Sends a fresh Telegram report covering all 5 tunnels' latest photo
// inspection status - unlike the daily summary this is not edited in place,
// since each trigger (a field officer's tunnel update) is its own report at
// a point in time, not a running tally for a single day.
export async function sendTunnelHealthReport() {
  const supabase = createSupabaseAdminClient()

  const entries = await Promise.all(
    greenhouses.map(async (g) => {
      const { data } = await supabase
        .from('tunnel_photo_logs')
        .select('tunnel_id, date, photos, health_assessment, severity')
        .eq('tunnel_id', g.id)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle()
      return { tunnel: g.tunnel, cropName: g.cropName, latest: data as TunnelLogRow | null }
    })
  )

  const report = await writeReport(entries)
  const messageText = `Tunnel Health Report - ${formatDate(new Date().toISOString().slice(0, 10))}\n\n${report}`

  await sendTelegramMessage(messageText)

  for (const { latest } of entries) {
    const photo = latest?.photos?.[0]
    if (photo) await sendTelegramPhoto(photo)
  }
}
