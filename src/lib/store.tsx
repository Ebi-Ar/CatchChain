import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { seedCatches } from './data'
import { storage } from './storage'
import type { Catch, Role } from './types'

interface ComingSoon {
  feature: string
  description?: string
}

interface AppState {
  role: Role
  setRole: (r: Role) => void
  demo: boolean
  setDemo: (d: boolean) => void
  catches: Catch[] // seeded + locally logged, newest first
  localCatches: Catch[]
  addCatch: (c: Catch) => void
  findCatch: (tag: string) => Catch | undefined
  resetDemo: () => void
  comingSoon: ComingSoon | null
  openComingSoon: (feature: string, description?: string) => void
  closeComingSoon: () => void
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(storage.getRole)
  const [demo, setDemoState] = useState<boolean>(storage.getDemo)
  const [localCatches, setLocal] = useState<Catch[]>(storage.getCatches)
  const [scans, setScans] = useState(storage.getScans)
  const [comingSoon, setComingSoon] = useState<ComingSoon | null>(null)

  const setRole = useCallback((r: Role) => {
    storage.setRole(r)
    setRoleState(r)
  }, [])
  const setDemo = useCallback((d: boolean) => {
    storage.setDemo(d)
    setDemoState(d)
  }, [])

  const addCatch = useCallback((c: Catch) => {
    setLocal((prev) => {
      const next = [c, ...prev.filter((p) => p.tag !== c.tag)]
      storage.setCatches(next)
      return next
    })
  }, [])

  const resetDemo = useCallback(() => {
    storage.resetDemo()
    setLocal([])
    setScans({})
    setRole('fisher')
  }, [setRole])

  const catches = useMemo(() => {
    const all = [...localCatches, ...seedCatches.filter((s) => !localCatches.some((l) => l.tag === s.tag))]
    return all
      .map((c) => ({ ...c, scans: c.scans + (scans[c.tag] ?? 0) }))
      .sort((a, b) => b.landedAt.localeCompare(a.landedAt) || b.tag.localeCompare(a.tag))
  }, [localCatches, scans])

  const findCatch = useCallback((tag: string) => catches.find((c) => c.tag === tag), [catches])

  const value: AppState = {
    role,
    setRole,
    demo,
    setDemo,
    catches,
    localCatches,
    addCatch,
    findCatch,
    resetDemo,
    comingSoon,
    openComingSoon: (feature, description) => setComingSoon({ feature, description }),
    closeComingSoon: () => setComingSoon(null),
  }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useApp outside AppProvider')
  return v
}
