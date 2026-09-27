import type { ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card } from './ui/Card'
import { cn } from '@/lib/utils'

export function StatCard({ label, value, delta, deltaTone, sub, icon, onClick }: { label: string; value: ReactNode; delta?: string; deltaTone?: 'up' | 'down' | 'neutral'; sub?: ReactNode; icon?: ReactNode; onClick?: () => void }) {
  return (
    <Card onClick={onClick} className={cn('p-5 transition-all', onClick && 'cursor-pointer hover:-translate-y-px hover:border-line-strong hover:shadow-pop')}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink-3">{label}</p>
        {icon && <div className="grid size-8 place-items-center rounded-lg bg-teal-50 text-teal-600 [&_svg]:size-4">{icon}</div>}
      </div>
      <p className="tabular mt-3 text-[28px] leading-none font-bold tracking-[-0.03em] text-ink">{value}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px]">
        {delta && (
          <span className={cn('tabular inline-flex items-center gap-0.5 font-semibold', deltaTone === 'up' ? 'text-verified' : deltaTone === 'down' ? 'text-flag' : 'text-ink-3')}>
            {deltaTone === 'up' && <ArrowUpRight className="size-3.5" />}
            {deltaTone === 'down' && <ArrowDownRight className="size-3.5" />}
            {delta}
          </span>
        )}
        {sub && <span className="text-ink-3">{sub}</span>}
      </div>
    </Card>
  )
}
