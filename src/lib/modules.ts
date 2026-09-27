import { Home, LineChart, ListChecks, PlusCircle, Radar, Route, ShieldAlert, Sprout, Store, Gavel, type LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  short?: string
  icon: LucideIcon
  role?: 'fisher' | 'buyer'
}

export const LIVE_NAV: NavItem[] = [
  { to: '/app', label: 'Home', icon: Home },
  { to: '/app/market', label: 'Market Pulse', short: 'Market', icon: LineChart, role: 'fisher' },
  { to: '/app/catch/new', label: 'Log catch', short: 'Log', icon: PlusCircle, role: 'fisher' },
  { to: '/app/catches', label: 'My catches', short: 'Catches', icon: ListChecks, role: 'fisher' },
  { to: '/app/buyer', label: 'Buyer view', short: 'Buyer', icon: Store, role: 'buyer' },
]

export interface LockedModule extends NavItem {
  key: string
  name: string
  tagline: string
}

export const LOCKED: LockedModule[] = [
  { key: 'sell', to: '/app/sell', label: 'Sell to buyer', name: 'Sell to buyer', icon: Gavel, tagline: 'Post a lot once and let verified buyers bid on it.' },
  { key: 'vessel-watch', to: '/app/vessel-watch', label: 'Vessel Watch', name: 'Vessel Watch', icon: Radar, tagline: 'Flags suspicious vessel activity near catch zones using public vessel-tracking data.' },
  { key: 'logistics', to: '/app/logistics', label: 'Logistics', name: 'Logistics', icon: Route, tagline: 'Matches catches with refrigerated trucks and cold storage nearby.' },
  { key: 'resilience', to: '/app/resilience', label: 'Supply Resilience', name: 'Supply Resilience', icon: ShieldAlert, tagline: 'Alerts when a port, buyer or route goes down and suggests alternatives.' },
  { key: 'farms', to: '/app/farms', label: 'Farm produce', name: 'Farm produce (LocalRoots)', icon: Sprout, tagline: 'Extends verified tags and price intelligence to farms and produce.' },
]

export const lockedByKey = Object.fromEntries(LOCKED.map((m) => [m.key, m])) as Record<string, LockedModule>
