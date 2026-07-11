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

  const jsonMatch = /\{[\s\S]*\}/.exec(textBlock.text)
  if (!jsonMatch) {
    return { error: 'AI analysis response was not valid JSON.', status: 502 }
  }

  try {
    return { data: JSON.parse(jsonMatch[0]) }
  } catch {
    return { error: 'AI analysis response could not be parsed.', status: 502 }
  }
}
