import type { TunnelPhotoEntry } from '@/lib/types'

// Real entries only. The Oregano entry below is a genuine visual assessment
// of two real photos shared on 2026-07-08 (not a specialized trained
// plant-pathology model - a general LLM visual read, flagged as such).
// Actual image files aren't stored here since they were shared in chat, not
// uploaded through the app - new uploads via the Tunnel page's Images tab
// store real photo data (client-side only, pending real object storage).
export const tunnelPhotoLogs: TunnelPhotoEntry[] = [
  {
    id: 'tpl-oregano-2026-07-08',
    tunnelId: 'gh-oregano',
    date: '2026-07-08',
    photos: [],
    healthAssessment:
      'Strong fruit set with a good mix of green and ripe (red) chilies. Significant yellowing (chlorosis) in the older, lower leaves, consistent across the whole row rather than one plant - suggests a nutrient deficiency (nitrogen or magnesium are the usual cause when older leaves yellow first) rather than a localized pest or disease. Some leaf-edge browning worth watching but likely natural senescence given the heavy fruit load. Canopy is dense at the top, sparse lower down - typical of a mature, heavily-fruiting plant.',
    detectedIssues: ['Lower-leaf chlorosis (likely nutrient deficiency)', 'Minor leaf-edge browning/necrosis - monitor'],
    recommendedActions: [
      'Check fertilizer schedule for nitrogen/magnesium adequacy at this fruiting stage',
      'Inspect a few of the worst-affected leaves closely to rule out early leaf spot disease',
      'Continue current harvest schedule - fruiting is healthy',
    ],
    severity: 'medium',
    analyzedBy: 'Claude vision - manual review (not an automated pipeline yet)',
  },
]

export function getPhotoLogsForTunnel(tunnelId: string) {
  return tunnelPhotoLogs.filter((p) => p.tunnelId === tunnelId).sort((a, b) => b.date.localeCompare(a.date))
}
