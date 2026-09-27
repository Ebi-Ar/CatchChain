import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const base =
  'w-full h-11 rounded-[10px] border bg-white px-3.5 text-[14px] text-ink placeholder:text-ink-4 transition-colors focus:outline-none focus:ring-3 focus:ring-teal-500/15 disabled:bg-surface disabled:text-ink-3'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(({ className, invalid, ...props }, ref) => (
  <input ref={ref} className={cn(base, invalid ? 'border-flag focus:border-flag' : 'border-line hover:border-line-strong focus:border-teal-500', className)} {...props} />
))
Input.displayName = 'Input'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(({ className, invalid, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(base, 'appearance-none pr-9', invalid ? 'border-flag' : 'border-line hover:border-line-strong focus:border-teal-500', className)}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-3" />
  </div>
))
Select.displayName = 'Select'

export function Field({ label, htmlFor, error, hint, optional, children, className }: { label: string; htmlFor?: string; error?: string; hint?: ReactNode; optional?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-ink-4">Optional</span>}
      </label>
      {children}
      {error ? <p className="text-[12.5px] font-medium text-flag">{error}</p> : hint ? <p className="text-[12.5px] text-ink-3">{hint}</p> : null}
    </div>
  )
}

export function Segmented<T extends string | number>({ value, onChange, options, className, size = 'md' }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string; size?: 'sm' | 'md' }) {
  return (
    <div className={cn('inline-flex rounded-[10px] border border-line bg-surface p-0.5', className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-lg font-semibold transition-all',
            size === 'sm' ? 'h-7 px-2.5 text-[12.5px]' : 'h-8 px-3 text-[13px]',
            value === o.value ? 'bg-white text-ink shadow-[0_1px_2px_rgba(11,37,69,0.1)]' : 'text-ink-3 hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
