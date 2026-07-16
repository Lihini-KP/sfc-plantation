import Anthropic from '@anthropic-ai/sdk'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { areas, crops } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'
import { sendTelegramMessage, editTelegramMessage, sendTelegramPhoto } from '@/lib/telegram'

interface DailyUpdateRow {
  date: string
  area_id: string | null
  crop_id: string | null
  crop_ids: string[] | null
  activity: string
  staff: string[]
  weather: string
  watering_details: string
  fertilizer_applied: string
  pesticide_applied: string
  diseases_found: string
  pest_issues: string
  notes: string
  photos: string[] | null
}

async function writeSummary(rows: DailyUpdateRow[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  const plainList = rows
    .map((r, i) => {
      const area = areas.find((a) => a.id === r.area_id)
      const cropIdsForRow = r.crop_ids?.length ? r.crop_ids : r.crop_id ? [r.crop_id] : []
      const cropNames = cropIdsForRow.map((id) => crops.find((c) => c.id === id)?.name).filter(Boolean)
      const detailParts = [
        r.watering_details && `Watering: ${r.watering_details}`,
        r.fertilizer_applied && `Fertilizer: ${r.fertilizer_applied}`,
        r.pesticide_applied && `Pesticide: ${r.pesticide_applied}`,
        r.diseases_found && `Diseases: ${r.diseases_found}`,
        r.pest_issues && `Pests: ${r.pest_issues}`,
        r.notes && `Notes: ${r.notes}`,
      ].filter(Boolean)
      return `${i + 1}. ${r.activity}${[area?.name, cropNames.join(', ')].filter(Boolean).length ? ` (${[area?.name, cropNames.join(', ')].filter(Boolean).join(' - ')})` : ''}${r.staff.length ? ` - by ${r.staff.join(', ')}` : ''}${detailParts.length ? `\n   ${detailParts.join('; ')}` : ''}`
    })
    .join('\n')

  if (!apiKey) {
    // No AI configured - fall back to a plain compiled list rather than blocking the feature.
    return `${rows.length} update${rows.length === 1 ? '' : 's'} logged today:\n\n${plainList}`
  }

  const anthropic = new Anthropic({ apiKey })
  const prompt = `You are writing a short, plain daily summary for a plantation team's Telegram group, based on the individual field update entries logged today. Write 2-4 sentences in plain prose (no markdown headers) covering what was done, where, by whom, and flag any disease/pest issues mentioned. Be factual - only use what's in the entries below, don't invent anything.

Today's logged entries:
${plainList}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })
    const textBlock = message.content.find((b) => b.type === 'text')
    return textBlock && textBlock.type === 'text' ? textBlock.text.trim() : plainList
  } catch {
    return plainList
  }
}

// Regenerates the AI summary for a given day from all of that day's
// daily_updates entries, saves it, and mirrors it to the CropWatch Telegram
// group - editing the existing message in place if one was already sent
// today rather than posting a new one each time. Best-effort throughout:
// callers should not let a failure here block saving the actual update.
export async function regenerateAndNotify(date: string) {
  const supabase = createSupabaseAdminClient()

  const { data: rows, error } = await supabase
    .from('daily_updates')
    .select('date, area_id, crop_id, crop_ids, activity, staff, weather, watering_details, fertilizer_applied, pesticide_applied, diseases_found, pest_issues, notes, photos')
    .eq('date', date)
  if (error || !rows || rows.length === 0) return

  const summary = await writeSummary(rows as DailyUpdateRow[])
  const allPhotos = rows.flatMap((r) => (r.photos as string[] | null) || [])

  const { data: existing } = await supabase.from('daily_summaries').select('*').eq('date', date).maybeSingle()
  const sentPhotos: string[] = existing?.sent_photo_urls || []
  const newPhotos = allPhotos.filter((p) => !sentPhotos.includes(p))

  const messageText = `Daily Plantation Update - ${formatDate(date)}\n\n${summary}`

  let telegramMessageId: number | null = existing?.telegram_message_id || null
  if (telegramMessageId) {
    const edited = await editTelegramMessage(telegramMessageId, messageText)
    if (!edited) telegramMessageId = await sendTelegramMessage(messageText)
  } else {
    telegramMessageId = await sendTelegramMessage(messageText)
  }

  for (const photo of newPhotos.slice(0, 10)) {
    await sendTelegramPhoto(photo)
  }

  await supabase.from('daily_summaries').upsert({
    date,
    summary,
    telegram_message_id: telegramMessageId,
    sent_photo_urls: [...sentPhotos, ...newPhotos],
  })
}
