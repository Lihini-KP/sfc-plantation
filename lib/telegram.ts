// Server-only helpers for the CropWatch Telegram bot. Never import into a
// 'use client' component - the bot token must stay server-side.

const TELEGRAM_API = 'https://api.telegram.org'

function getConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return null
  return { token, chatId }
}

export async function sendTelegramMessage(text: string): Promise<number | null> {
  const config = getConfig()
  if (!config) return null

  const res = await fetch(`${TELEGRAM_API}/bot${config.token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: config.chatId, text }),
  })
  const data = await res.json()
  return data.ok ? data.result.message_id : null
}

export async function editTelegramMessage(messageId: number, text: string): Promise<boolean> {
  const config = getConfig()
  if (!config) return false

  const res = await fetch(`${TELEGRAM_API}/bot${config.token}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: config.chatId, message_id: messageId, text }),
  })
  const data = await res.json()
  return !!data.ok
}

function parseDataUrl(dataUrl: string) {
  const match = /^data:image\/[a-zA-Z+]+;base64,(.+)$/.exec(dataUrl)
  return match ? match[1] : null
}

export async function sendTelegramPhoto(dataUrl: string, caption?: string): Promise<boolean> {
  const config = getConfig()
  if (!config) return false
  const base64 = parseDataUrl(dataUrl)
  if (!base64) return false

  const form = new FormData()
  form.append('chat_id', config.chatId)
  if (caption) form.append('caption', caption)
  form.append('photo', new Blob([Buffer.from(base64, 'base64')], { type: 'image/jpeg' }), 'photo.jpg')

  const res = await fetch(`${TELEGRAM_API}/bot${config.token}/sendPhoto`, { method: 'POST', body: form })
  const data = await res.json()
  return !!data.ok
}

export async function sendTelegramDocument(bytes: Uint8Array, filename: string, caption?: string): Promise<{ ok: boolean; messageId?: number; description?: string }> {
  const config = getConfig()
  if (!config) return { ok: false, description: 'Telegram not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID).' }

  const form = new FormData()
  form.append('chat_id', config.chatId)
  if (caption) form.append('caption', caption)
  form.append('document', new Blob([Buffer.from(bytes)], { type: 'application/pdf' }), filename)

  const res = await fetch(`${TELEGRAM_API}/bot${config.token}/sendDocument`, { method: 'POST', body: form })
  const data = await res.json().catch(() => ({ ok: false, description: `Telegram response was not JSON (HTTP ${res.status}).` }))
  return { ok: !!data.ok, messageId: data.result?.message_id, description: data.description }
}

// Replaces the file attached to an already-sent document message (within
// Telegram's ~48h edit window) instead of posting a new message - used to
// keep one tunnel health report per day updated in place rather than
// spamming a fresh PDF every time any tunnel is updated.
export async function editTelegramDocument(messageId: number, bytes: Uint8Array, filename: string, caption?: string): Promise<{ ok: boolean; description?: string }> {
  const config = getConfig()
  if (!config) return { ok: false, description: 'Telegram not configured (missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID).' }

  const form = new FormData()
  form.append('chat_id', config.chatId)
  form.append('message_id', String(messageId))
  form.append('media', JSON.stringify({ type: 'document', media: 'attach://document', caption }))
  form.append('document', new Blob([Buffer.from(bytes)], { type: 'application/pdf' }), filename)

  const res = await fetch(`${TELEGRAM_API}/bot${config.token}/editMessageMedia`, { method: 'POST', body: form })
  const data = await res.json().catch(() => ({ ok: false, description: `Telegram response was not JSON (HTTP ${res.status}).` }))
  return { ok: !!data.ok, description: data.description }
}
