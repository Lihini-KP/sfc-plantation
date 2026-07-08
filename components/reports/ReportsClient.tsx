'use client'

import { useState } from 'react'
import { FileText, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { totalIncome, totalExpenses, totalProfitLoss } from '@/lib/mock-data/finance'
import { totalIncomeByCrop } from '@/lib/mock-data/cropSales'
import { tasks } from '@/lib/mock-data/tasks'
import { formatCurrency } from '@/lib/format'

function buildReports() {
  const income = totalIncome()
  const expenses = totalExpenses()
  const profitLoss = totalProfitLoss()
  const topCrop = totalIncomeByCrop()[0]
  const assignees = new Set(tasks.map((t) => t.assignedTo))

  return [
    { title: 'Plantation Performance', summary: '15 zones mapped from the real estate layout - health scores are illustrative, pending real inspections' },
    { title: 'Crop Health', summary: 'Illustrative sample analysis only - no real vision pipeline connected yet' },
    { title: 'Harvest Yield', summary: 'See Harvest & Sales Income for real recorded sales by crop' },
    { title: 'Revenue', summary: `${formatCurrency(income)} recorded income (16 months, P&L sheet)` },
    { title: 'Expenses', summary: `${formatCurrency(expenses)} recorded expenses (16 months, P&L sheet)` },
    { title: 'Fertilizer Usage', summary: 'Not itemized in any real source yet' },
    { title: 'Water Consumption', summary: 'Not itemized in any real source yet' },
    { title: 'Pest Incidents', summary: 'No real pest tracking source connected yet' },
    { title: 'Employee Productivity', summary: `${assignees.size} staff with real tasks logged (${tasks.length} tasks, from ATLAS/Task Commander history)` },
    { title: 'Chicken Performance', summary: 'Not yet operational - planned to start this month (July 2026)' },
    { title: 'Egg Production', summary: 'No production yet - farm not operational' },
    { title: 'Profitability', summary: `Net ${profitLoss >= 0 ? 'profit' : 'loss'} of ${formatCurrency(Math.abs(profitLoss))} over 16 months - top crop by income: ${topCrop?.cropName}` },
  ]
}

export function ReportsClient() {
  const [toast, setToast] = useState<string | null>(null)
  const reports = buildReports()

  function handleExport(title: string, format: string) {
    setToast(`${title} exported as ${format} (sample — connects to real export once live)`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.title}>
            <p className="text-sm font-semibold text-brand-800">{r.title}</p>
            <p className="mt-1 text-xs text-brand-700/60">{r.summary}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleExport(r.title, 'PDF')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-100 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50"
              >
                <FileText size={13} /> PDF
              </button>
              <button
                onClick={() => handleExport(r.title, 'Excel')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-brand-100 py-2 text-xs font-medium text-brand-700 hover:bg-brand-50"
              >
                <FileSpreadsheet size={13} /> Excel
              </button>
            </div>
          </Card>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-xl bg-brand-800 px-4 py-3 text-sm text-white shadow-lg">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}
    </div>
  )
}
