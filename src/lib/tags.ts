import { areaById, portById, seedCatches } from './data'
import { parseLocal, toLocalISO } from './dates'
import type { Catch } from './types'

/** CC-[LFA]-[4-digit sequence]-[PORT3], e.g. CC-25-0412-SHD */
export const TAG_RE = /^CC-([0-9]{1,2}[A-Z]?)-(\d{4})-([A-Z]{3})$/

export const seqOf = (tag: string) => Number(TAG_RE.exec(tag)?.[2] ?? 0)

export function nextTag(areaId: string, portId: string, existing: Catch[]) {
  const max = Math.max(...seedCatches.map((c) => seqOf(c.tag)), ...existing.map((c) => seqOf(c.tag)))
  const seq = String(max + 1).padStart(4, '0')
  return `CC-${areaById[areaId]?.code ?? '00'}-${seq}-${portById[portId]?.code ?? 'XXX'}`
}

export function normalizeTag(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}

/* ---- URL encoding: the QR carries the catch so it opens on any device ---- */

// [tag, species, weight, grade, vessel, fisher, port, area, lat, lng, landedAt(no seconds), verified, minutes caught→landed, soldAt?, soldTo?]
type Compact = [string, string, number, string, string, string, string, string, number, number, string, 0 | 1, number, string?, string?]

const trimSec = (iso: string) => iso.replace(/:00$/, '')
const addSec = (iso: string) => (iso.length === 16 ? `${iso}:00` : iso)

function toB64Url(s: string) {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromB64Url(s: string) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  const bin = atob(b64)
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function encodeCatch(c: Catch) {
  const mins = Math.round((parseLocal(c.journey.landed).getTime() - parseLocal(c.journey.caught).getTime()) / 60000)
  const compact: Compact = [
    c.tag, c.species, c.weight, c.grade ?? '', c.vessel, c.fisher, c.port, c.area,
    c.gps.lat, c.gps.lng, trimSec(c.landedAt), c.status === 'verified' ? 1 : 0, mins,
    c.journey.sold && trimSec(c.journey.sold.at), c.journey.sold?.buyer,
  ]
  while (compact[compact.length - 1] === undefined) compact.pop()
  return toB64Url(JSON.stringify(compact))
}

export function decodeCatch(d: string, expectedTag: string): Catch | null {
  try {
    const a = JSON.parse(fromB64Url(d)) as Compact
    if (!Array.isArray(a) || a[0] !== expectedTag) return null
    const landed = addSec(a[10])
    const caught = new Date(parseLocal(landed).getTime() - (Number(a[12]) || 0) * 60000)
    return {
      tag: a[0], species: a[1], weight: a[2], grade: a[3] || undefined, vessel: a[4], fisher: a[5], port: a[6], area: a[7],
      gps: { lat: a[8], lng: a[9] }, landedAt: landed, status: a[11] ? 'verified' : 'pending',
      journey: { caught: toLocalISO(caught), landed, ...(a[13] && a[14] ? { sold: { at: addSec(a[13]), buyer: a[14] } } : {}) },
      scans: 0,
    }
  } catch {
    return null
  }
}

export function publicBase() {
  const env = import.meta.env.VITE_PUBLIC_URL as string | undefined
  return (env || window.location.origin).replace(/\/$/, '')
}

export function traceUrl(c: Catch, withData = true) {
  const path = `/trace/${c.tag}`
  return `${publicBase()}${path}${withData ? `?d=${encodeCatch(c)}` : ''}`
}
