import type { Catch, Role } from './types'

const KEYS = {
  catches: 'cc.catches',
  role: 'cc.role',
  demo: 'cc.demo',
  pilot: 'cc.pilot',
  scans: 'cc.scans',
} as const

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable (private mode) — keep going in memory */
  }
}

export const storage = {
  getCatches: () => read<Catch[]>(KEYS.catches, []),
  setCatches: (c: Catch[]) => write(KEYS.catches, c),
  getRole: () => read<Role>(KEYS.role, 'fisher'),
  setRole: (r: Role) => write(KEYS.role, r),
  getDemo: () => read<boolean>(KEYS.demo, true),
  setDemo: (d: boolean) => write(KEYS.demo, d),
  getScans: () => read<Record<string, number>>(KEYS.scans, {}),
  addScan(tag: string) {
    const s = read<Record<string, number>>(KEYS.scans, {})
    s[tag] = (s[tag] ?? 0) + 1
    write(KEYS.scans, s)
  },
  addPilotSignup(email: string, feature: string) {
    const list = read<{ email: string; feature: string; at: string }[]>(KEYS.pilot, [])
    list.push({ email, feature, at: new Date().toISOString() })
    write(KEYS.pilot, list)
  },
  resetDemo() {
    write(KEYS.catches, [])
    write(KEYS.scans, {})
  },
}
