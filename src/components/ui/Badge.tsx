import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'teal' | 'verified' | 'pending' | 'flag' | 'navy'
const tones: Record<Tone, string> = {
  neutral: 'bg-navy-900/[0.05] text-ink-2',
  teal: 'bg-teal-50 text-teal-700',
  verified: 'bg-verified-50 text-verified',
  pending: 'bg-pending-50 text-[#9A6F00]',
  flag: 'bg-flag-50 text-flag',
  navy: 'bg-navy-900 text-white',
}

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11.5px] font-semibold whitespace-nowrap [&_svg]:size-3', tones[tone], className)}
      {...props}
    />
  )
}
