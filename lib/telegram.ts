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

export async function sendTelegramDocument(bytes: Uint8Array, filename: string, caption?: string): Promise<boolean> {
  const config = getConfig()
  if (!config) return false

  const form = new FormData()
  form.append('chat_id', config.chatId)
  if (caption) form.append('caption', caption)
  form.append('document', new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }), filename)

  const res = await fetch(`${TELEGRAM_API}/bot${config.token}/sendDocument`, { method: 'POST', body: form })
  const data = await res.json()
  return !!data.ok
}
