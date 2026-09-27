import rawPrices from '@/data/prices.json'

/** Parse "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS" as local time. */
export function parseLocal(s: string) {
  const [d, t = '00:00:00'] = s.split('T')
  const [y, m, day] = d.split('-').map(Number)
  const [hh, mm, ss] = t.split(':').map(Number)
  return new Date(y, m - 1, day, hh || 0, mm || 0, ss || 0)
}

export function toLocalISO(d: Date, withTime = true) {
  const p = (n: number) => String(n).padStart(2, '0')
  const date = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
  return withTime ? `${date}T${p(d.getHours())}:${p(d.getMinutes())}:00` : date
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000)

// Sample data is generated for a fixed end date. Shift every date so the last data day is today.
const dataEnd = (rawPrices as { date: string }[]).reduce((max, p) => (p.date > max ? p.date : max), '')
export const SHIFT_DAYS = dayDiff(new Date(), parseLocal(dataEnd))

export function shift(s: string) {
  if (!SHIFT_DAYS) return s
  const d = parseLocal(s)
  d.setDate(d.getDate() + SHIFT_DAYS)
  return toLocalISO(d, s.includes('T'))
}

export const todayISO = () => toLocalISO(new Date(), false)

export function fmtDate(s: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) {
  return parseLocal(s).toLocaleDateString('en-CA', opts)
}
export function fmtTime(s: string) {
  return parseLocal(s).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' })
}
export function fmtDateTime(s: string) {
  return `${fmtDate(s, { month: 'short', day: 'numeric' })}, ${fmtTime(s)}`
}

export function relativeDay(s: string) {
  const n = dayDiff(new Date(), parseLocal(s))
  if (n <= 0) return 'Today'
  if (n === 1) return 'Yesterday'
  return `${n} days ago`
}
