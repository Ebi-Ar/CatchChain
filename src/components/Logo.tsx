import { cn } from '@/lib/utils'

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#13A89E" />
      <path d="M6 19c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2.2 5-1.2" fill="none" stroke="#0B2545" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M6 13c2.5-3 5-3 7.5 0s5 3 7.5 0 3.5-2.2 5-1.2" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ light = false, size = 28, className }: { light?: boolean; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      <span className={cn('text-[17px] font-bold tracking-[-0.02em]', light ? 'text-white' : 'text-navy-900')}>
        Catch<span className={light ? 'text-teal-200' : 'text-teal-500'}>Chain</span>
      </span>
    </span>
  )
}
