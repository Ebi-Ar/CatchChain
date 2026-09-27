import type { ReactNode } from 'react'
import { FlaskConical, Lock, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { PageHeader } from './PageHeader'
import { lockedByKey } from '@/lib/modules'
import { useApp } from '@/lib/store'

/** Wraps a locked module's preview: in-development banner + dimmed, non-interactive sample layout. */
export function LockedFeature({ module, children }: { module: string; children: ReactNode }) {
  const m = lockedByKey[module]
  const { openComingSoon } = useApp()
  const Icon = m.icon

  return (
    <div>
      <PageHeader
        eyebrow={
          <Badge tone="navy">
            <Lock /> In development
          </Badge>
        }
        title={m.name}
        subtitle={m.tagline}
      />

      <div className="mb-6 flex flex-col gap-4 overflow-hidden rounded-[12px] bg-navy-900 p-5 text-white sm:flex-row sm:items-center sm:p-6">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-teal-200">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold">
            {m.name} is in development. Planned for the pilot phase.
          </p>
          <p className="mt-1 text-[13.5px] text-white/65">{m.tagline}</p>
        </div>
        <Button onClick={() => openComingSoon(m.name, m.tagline)} className="w-full sm:w-auto">
          <Sparkles /> Join the pilot
        </Button>
      </div>

      <div className="relative">
        <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold tracking-wide text-ink-3 uppercase">
          <FlaskConical className="size-3.5" /> Preview · invented sample data
        </div>
        <div aria-hidden className="pointer-events-none select-none opacity-[0.72] saturate-[0.85]">
          {children}
        </div>
      </div>
    </div>
  )
}
