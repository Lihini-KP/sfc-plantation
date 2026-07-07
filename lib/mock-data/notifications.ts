import type { AppNotification } from '@/lib/types'

export const notifications: AppNotification[] = [
  { id: 'n-1', title: 'Critical: Fusarium wilt spreading - Passion Fruit', message: 'Fusarium wilt has spread to several passion fruit vines. Immediate fungicide treatment recommended.', category: 'Disease', severity: 'critical', createdAt: '2026-07-06T08:15:00', read: false },
  { id: 'n-2', title: 'Fertilizer overdue - Passion Fruit plot', message: 'Scheduled NPK 15:15:15 application is overdue.', category: 'Fertilizer', severity: 'high', createdAt: '2026-07-06T07:40:00', read: false },
  { id: 'n-3', title: 'Vitamin supplement missed - Batch SFC-B03', message: 'Vitamin AD3E supplement was due 2026-07-02 and has not been logged.', category: 'Vaccination', severity: 'high', createdAt: '2026-07-05T16:00:00', read: false },
  { id: 'n-4', title: 'Low stock: Copper Fungicide', message: 'Only 6kg remaining, below reorder level of 10kg.', category: 'Inventory', severity: 'medium', createdAt: '2026-07-05T09:00:00', read: false },
  { id: 'n-5', title: 'Harvest window approaching - Gurmar South Block', message: 'Gurmar leaf harvest due within 9 days.', category: 'Harvest', severity: 'medium', createdAt: '2026-07-05T06:30:00', read: true },
  { id: 'n-6', title: 'Heavy rain forecast', message: 'Weather service predicts heavy rainfall over the next 48 hours. Consider pausing irrigation and checking drainage on the Soursop & Ginger bed.', category: 'Weather', severity: 'medium', createdAt: '2026-07-04T18:00:00', read: true },
  { id: 'n-7', title: 'Task overdue: Weeding - Soursop & Ginger', message: 'Weeding task assigned to R Thambiraja is 5 days overdue.', category: 'Task', severity: 'low', createdAt: '2026-07-01T09:00:00', read: true },
  { id: 'n-8', title: 'Pest alert - Coffee plot', message: 'Berry borer detected alongside early-stage leaf rust.', category: 'Pest', severity: 'medium', createdAt: '2026-07-03T11:20:00', read: true },
]
