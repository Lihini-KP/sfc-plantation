import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  NotebookPen,
  Map,
  Leaf,
  ListChecks,
  Wheat,
  Bird,
  Boxes,
  BarChart3,
  Bell,
  Sparkles,
  Settings,
  Tent,
  FileSpreadsheet,
  LineChart,
} from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/updates', label: 'Daily Updates', icon: NotebookPen },
  { href: '/map', label: 'Plantation Map', icon: Map },
  { href: '/crops', label: 'Crop Management', icon: Leaf },
  { href: '/tunnels', label: 'Tunnels', icon: Tent },
  { href: '/crop-plan', label: 'Crop Plan', icon: FileSpreadsheet },
  { href: '/tasks', label: 'Task Management', icon: ListChecks },
  { href: '/harvests', label: 'Harvest Management', icon: Wheat },
  { href: '/chicken-farm', label: 'Chicken Farm', icon: Bird },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/ai-insights', label: 'AI Insights', icon: Sparkles },
  { href: '/settings', label: 'Roles & Settings', icon: Settings },
  { href: '/harti-market', label: 'HARTI Market Intelligence', icon: LineChart },
]
