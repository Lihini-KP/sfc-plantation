import type { AiCropAnalysis, ChatMessage } from '@/lib/types'

// No real AI vision pipeline is connected yet (weekly area photos aren't
// being sent to a vision model and parsed into structured findings). The
// previous contents here were entirely invented sample output - left empty
// rather than fabricated, per the same policy as notifications.ts/inventory.ts.
export const aiAnalyses: AiCropAnalysis[] = []

export function getAnalysisForArea(areaId: string) {
  return aiAnalyses.find((a) => a.areaId === areaId)
}

export const chatHistory: ChatMessage[] = []
