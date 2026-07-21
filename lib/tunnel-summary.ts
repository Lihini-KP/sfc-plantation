import Anthropic from '@anthropic-ai/sdk'
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { greenhouses } from '@/lib/mock-data'
import { formatDate } from '@/lib/format'
import { sendTelegramDocument, editTelegramDocument } from '@/lib/telegram'

interface TunnelLogRow {
  tunnel_id: string
  date: string
  photos: string[] | null
  health_assessment: string | null
  severity: string | null
}

type TunnelEntry = { tunnel: string; cropName: string; latest: TunnelLogRow | null }

async function writeReport(entries: TunnelEntry[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  const plainList = entries
    .map(({ tunnel, cropName, latest }) => {
      if (!latest) return `${tunnel} (${cropName}): no photo inspection logged yet.`
      return `${tunnel} (${cropName}) - last inspected ${formatDate(latest.date)}, severity: ${latest.severity || 'not assessed'}. ${latest.health_assessment || 'No AI assessment attached to this entry.'}`
    })
    .join('\n\n')

  if (!apiKey) return `Tunnel Health Report:\n\n${plainList}`

  const anthropic = new Anthropic({ apiKey })
  const prompt = `You are writing a short weekly tunnel health report for a plantation team, based on the most recent photo inspection logged for each of the 5 greenhouse tunnels. Write plain prose (no markdown headers), covering each tunnel by name, its current severity/status, and any notable issues. Flag any tunnel with no recent inspection. Be factual - only use what's given below, don't invent anything.

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

const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 50
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split('\n')) {
    let line = ''
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = candidate
      }
    }
    lines.push(line)
  }
  return lines
}

async function buildReportPdf(entries: TunnelEntry[], reportText: string, dateLabel: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  let page: PDFPage = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
  let y = PAGE_HEIGHT - MARGIN

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      y = PAGE_HEIGHT - MARGIN
    }
  }

  function drawText(text: string, size: number, useFont: PDFFont, color = rgb(0.09, 0.15, 0.11)) {
    for (const line of wrapText(text, useFont, size, CONTENT_WIDTH)) {
      ensureSpace(size + 5)
      page.drawText(line, { x: MARGIN, y, size, font: useFont, color })
      y -= size + 5
    }
  }

  drawText('Tunnel Health Report', 20, boldFont)
  drawText(dateLabel, 11, font, rgb(0.4, 0.4, 0.4))
  y -= 10

  drawText(reportText, 11, font)
  y -= 15

  for (const { tunnel, cropName, latest } of entries) {
    ensureSpace(24)
    drawText(`${tunnel} (${cropName})`, 14, boldFont)

    if (!latest) {
      drawText('No photo inspection logged yet.', 10, font, rgb(0.5, 0.5, 0.5))
      y -= 10
      continue
    }

    drawText(`${formatDate(latest.date)} - severity: ${latest.severity || 'not assessed'}`, 10, font)
    if (latest.health_assessment) {
      drawText(latest.health_assessment, 9, font, rgb(0.3, 0.3, 0.3))
    }

    const photo = latest.photos?.[0]
    if (photo) {
      const match = /^data:image\/(jpeg|jpg|png);base64,(.+)$/.exec(photo)
      if (match) {
        try {
          const bytes = Buffer.from(match[2], 'base64')
          const image = match[1] === 'png' ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes)
          const maxWidth = 220
          const scale = Math.min(1, maxWidth / image.width)
          const w = image.width * scale
          const h = image.height * scale
          ensureSpace(h + 10)
          page.drawImage(image, { x: MARGIN, y: y - h, width: w, height: h })
          y -= h + 15
        } catch { /* skip an unreadable image rather than fail the whole report */ }
      }
    }
    y -= 10
  }

  return pdfDoc.save()
}

// Compiles the latest photo-inspection status for all 5 greenhouse tunnels
// into a single PDF (write-up plus each tunnel's latest photo) and posts it
// to the CropWatch Telegram group - one report per day, edited in place
// (replacing the attached PDF on the same message) if any tunnel is updated
// again later the same day, rather than posting a fresh document each time.
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

  const today = new Date().toISOString().slice(0, 10)
  const dateLabel = formatDate(today)
  const report = await writeReport(entries)
  const pdfBytes = await buildReportPdf(entries, report, dateLabel)
  const filename = `Tunnel-Health-Report-${dateLabel.replace(/\s+/g, '-')}.pdf`
  const caption = `Tunnel Health Report - ${dateLabel}`

  const { data: existing } = await supabase.from('tunnel_reports').select('*').eq('date', today).maybeSingle()

  let result: { ok: boolean; messageId?: number; description?: string }
  if (existing?.telegram_message_id) {
    const edited = await editTelegramDocument(existing.telegram_message_id, pdfBytes, filename, caption)
    result = edited.ok ? { ok: true, messageId: existing.telegram_message_id } : await sendTelegramDocument(pdfBytes, filename, caption)
  } else {
    result = await sendTelegramDocument(pdfBytes, filename, caption)
  }

  await supabase.from('tunnel_reports').upsert({
    date: today,
    telegram_message_id: result.messageId ?? existing?.telegram_message_id ?? null,
  })

  return result
}
