import { Suspense, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Database, Lock, MoreHorizontal, RotateCcw, Anchor, Store, X } from 'lucide-react'
import { Logo } from './Logo'
import { ComingSoonModal } from './ComingSoonModal'
import { LIVE_NAV, LOCKED } from '@/lib/modules'
import { useApp } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/types'

function SidebarLink({ to, label, icon: Icon, locked }: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; locked?: boolean }) {
  return (
    <NavLink
      to={to}
      end={to === '/app'}
      className={({ isActive }) =>
        cn(
          'group flex h-9 items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors',
          isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('size-[17px] shrink-0', isActive ? 'text-teal-200' : locked ? 'text-white/35' : 'text-white/50 group-hover:text-white/80')} />
          <span className="flex-1 truncate">{label}</span>
          {locked && (
            <span className="flex items-center gap-1 rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white/55 uppercase">
              <Lock className="size-2.5" /> Soon
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

function Sidebar() {
  const { resetDemo } = useApp()
  const navigate = useNavigate()
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-navy-900 lg:flex">
      <Link to="/" className="flex h-16 items-center px-5">
        <Logo light />
      </Link>
      <nav className="scrollbar-none flex-1 overflow-y-auto px-3 pt-2 pb-4">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-[0.08em] text-white/35 uppercase">Live</p>
        <div className="flex flex-col gap-0.5">
          {LIVE_NAV.map((n) => (
            <SidebarLink key={n.to} {...n} />
          ))}
        </div>
        <p className="mt-7 px-3 pb-2 text-[11px] font-semibold tracking-[0.08em] text-white/35 uppercase">In development</p>
        <div className="flex flex-col gap-0.5">
          {LOCKED.map((n) => (
            <SidebarLink key={n.to} to={n.to} label={n.label} icon={n.icon} locked />
          ))}
        </div>
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => {
            resetDemo()
            navigate('/app')
          }}
          className="flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
        >
          <RotateCcw className="size-4" /> Reset demo data
        </button>
        <p className="px-3 pt-2 text-[11px] leading-snug text-white/30">Hackathon build · all figures are illustrative sample data.</p>
      </div>
    </aside>
  )
}

function RoleToggle() {
  const { role, setRole } = useApp()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const change = (r: Role) => {
    if (r === role) return
    setRole(r)
    if (r === 'buyer' && pathname !== '/app') navigate('/app/buyer')
    if (r === 'fisher' && pathname === '/app/buyer') navigate('/app/market')
  }
  return (
    <div className="relative inline-flex rounded-[10px] border border-line bg-surface p-0.5" role="tablist" aria-label="Role">
      {(['fisher', 'buyer'] as Role[]).map((r) => (
        <button key={r} role="tab" aria-selected={role === r} onClick={() => change(r)} className={cn('relative z-10 flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors', role === r ? 'text-ink' : 'text-ink-3 hover:text-ink')}>
          {role === r && <motion.span layoutId="role-pill" className="absolute inset-0 -z-10 rounded-lg bg-white shadow-[0_1px_2px_rgba(11,37,69,0.12)]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
          {r === 'fisher' ? <Anchor className="size-3.5" /> : <Store className="size-3.5" />}
          {r === 'fisher' ? 'Fisher' : 'Buyer'}
        </button>
      ))}
    </div>
  )
}

function TopBar() {
  const { role } = useApp()
  const user = role === 'fisher' ? { name: 'Marc Leblanc', place: 'Shediac', initials: 'ML' } : { name: 'Le Coquillage', place: 'Moncton', initials: 'LC' }
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="lg:hidden">
          <Logo size={28} className="[&>span:last-child]:hidden md:[&>span:last-child]:inline" />
        </Link>
        <RoleToggle />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-pending/30 bg-pending-50 px-2 py-1 text-[11.5px] font-semibold text-[#8A6400] sm:px-2.5">
          <Database className="size-3" /> Sample<span className="hidden sm:inline"> data</span>
        </span>
        <div className="ml-auto flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 rounded-full border border-line bg-white py-1 pr-3 pl-1">
            <span className={cn('grid size-7 place-items-center rounded-full text-[11px] font-bold text-white', role === 'fisher' ? 'bg-navy-800' : 'bg-teal-600')}>{user.initials}</span>
            <span className="hidden text-[13px] leading-tight sm:block">
              <span className="font-semibold text-ink">{user.name}</span>
              <span className="text-ink-3"> · {user.place}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

function MobileNav() {
  const [more, setMore] = useState(false)
  const items = [LIVE_NAV[0], LIVE_NAV[1], LIVE_NAV[2], LIVE_NAV[4]]
  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {items.map(({ to, label, short, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/app'} className={({ isActive }) => cn('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold', isActive ? 'text-teal-600' : 'text-ink-3')}>
              <Icon className="size-[21px]" />
              {short ?? label}
            </NavLink>
          ))}
          <button onClick={() => setMore(true)} className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-semibold text-ink-3">
            <MoreHorizontal className="size-[21px]" /> More
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {more && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div className="absolute inset-0 bg-navy-950/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMore(false)} />
            <motion.div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-navy-900 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }} onClick={() => setMore(false)}>
              <div className="mb-2 flex items-center justify-between px-3">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-white/40 uppercase">More</p>
                <X className="size-4 text-white/50" />
              </div>
              <SidebarLink to="/app/catches" label="My catches" icon={LIVE_NAV[3].icon} />
              <p className="mt-4 px-3 pb-2 text-[11px] font-semibold tracking-[0.08em] text-white/35 uppercase">In development</p>
              {LOCKED.map((n) => (
                <SidebarLink key={n.to} to={n.to} label={n.label} icon={n.icon} locked />
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export function Layout() {
  const { pathname } = useLocation()
  const { role, setRole } = useApp()
  // Role-specific pages keep the role toggle in sync (e.g. opening Buyer view switches to Buyer)
  useEffect(() => {
    const item = LIVE_NAV.find((n) => n.to !== '/app' && pathname.startsWith(n.to))
    if (item?.role && item.role !== role) setRole(item.role)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="min-h-dvh">
      <Sidebar />
      <div className="lg:pl-[248px]">
        <TopBar />
        <main className="mx-auto w-full max-w-[1280px] px-4 pt-6 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
          <motion.div key={pathname} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            <Suspense fallback={<div className="h-[60vh]" />}>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>
      <MobileNav />
      <ComingSoonModal />
    </div>
  )
}
