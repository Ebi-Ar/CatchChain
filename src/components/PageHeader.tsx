import type { ReactNode } from 'react'

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-2">{eyebrow}</div>}
        <h1 className="text-[24px] leading-tight font-bold tracking-[-0.025em] text-navy-900 sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-[14px] text-ink-3">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function SampleNote({ children = 'Sample data. Pilot will integrate buyer price reports.' }: { children?: ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[12px] text-ink-4">
      <span className="inline-block size-1.5 rounded-full bg-pending" />
      {children}
    </p>
  )
}
