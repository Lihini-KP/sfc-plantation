import Anthropic from '@anthropic-ai/sdk'

type HartiAiResult = { data: unknown } | { error: string; status: 503 | 502 }

// Shared helper for the two HARTI analysis routes - keeps each individual
// Claude call scoped/fast enough to finish inside Netlify's function timeout
// (a single combined call was measured at 30+ seconds and got killed with a
// 504 in production, even though it worked fine locally with no such limit).
export async function generateHartiJSON(systemPrompt: string, userMessage: string, maxTokens: number): Promise<HartiAiResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { error: 'AI analysis is not configured. Add ANTHROPIC_API_KEY to .env.local (and Netlify env vars for production).', status: 503 }
  }

  const anthropic = new Anthropic({ apiKey })
  let message
  try {
    message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: maxTokens,
      thinking: { type: 'disabled' },
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })
  } catch (err) {
    return { error: `AI analysis request failed: ${err instanceof Error ? err.message : 'Unknown error'}`, status: 502 }
  }

  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    return { error: 'AI analysis returned no readable response.', status: 502 }
  }

  // A cut-off response is the most common real cause of "invalid JSON" - the
  // model runs out of max_tokens mid-object, so the greedy brace match below
  // grabs a truncated, unparseable fragment. Surface this distinctly instead
  // of the generic parse-failure message so it's obvious what actually
  // happened (and that raising maxTokens, not retrying, is the fix).
  if (message.stop_reason === 'max_tokens') {
    return { error: 'AI analysis was cut off because it ran out of response length (max_tokens) - try again, or this route needs a higher token limit.', status: 502 }
  }

  const raw = textBlock.text.trim()

  // Try the whole response first (expected shape, given the "no markdown
  // fences, no extra text" instruction), then fall back to stripping a
  // markdown code fence if the model added one anyway, before resorting to
  // greedy brace-matching as a last resort.
  const candidates = [
    raw,
    raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim(),
    /\{[\s\S]*\}/.exec(raw)?.[0],
  ].filter((c): c is string => Boolean(c))

  for (const candidate of candidates) {
    try {
      return { data: JSON.parse(candidate) }
    } catch { /* try next candidate */ }
  }

  console.error('HARTI AI response could not be parsed as JSON:', raw.slice(0, 2000))
  return { error: 'AI analysis response could not be parsed.', status: 502 }
}
