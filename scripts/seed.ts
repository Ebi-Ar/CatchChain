/**
 * Generates the sample data the app runs on: prices.json, catches.json and listings.json.
 * Deterministic (seeded PRNG), so re-running produces the same numbers for a given end date.
 * The app re-anchors all dates to "today" at runtime, so the data never looks stale.
 *
 *   npm run seed            # end date = today
 *   npm run seed 2026-09-26 # explicit end date
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import buyers from '../src/data/buyers.json' with { type: 'json' }
import areas from '../src/data/areas.json' with { type: 'json' }
import vessels from '../src/data/vessels.json' with { type: 'json' }
import ports from '../src/data/ports.json' with { type: 'json' }
import type { Catch, Listing, PricePoint } from '../src/lib/types'

const DAYS = 90
const OUT = resolve(import.meta.dirname, '../src/data')
const end = process.argv[2] ? new Date(process.argv[2] + 'T12:00:00') : new Date()
end.setHours(12, 0, 0, 0)

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260926)
const round2 = (n: number) => Math.round(n * 100) / 100
const dayISO = (daysAgo: number) => {
  const d = new Date(end)
  d.setDate(d.getDate() - daysAgo)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const stamp = (daysAgo: number, hh: number, mm: number) => `${dayISO(daysAgo)}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`

/* ------------------------------------------------------------------ prices */

// Today's price per buyer/species. Lobster values drive the demo:
// Marc's usual buyer (Northumberland Seafoods, Shediac) pays $7.25, best offer is $8.10 in Cap-Pelé.
const TODAY: Record<string, Record<string, number>> = {
  lobster: { b01: 7.25, b02: 7.4, b03: 8.1, b04: 7.6, b05: 7.85, b06: 7.95 },
  'snow-crab': { b07: 5.85, b08: 5.6 },
  scallops: { b04: 11.8, b06: 12.6, b08: 11.4, b10: 12.95 },
  mackerel: { b02: 0.78, b03: 0.82, b07: 0.74, b08: 0.71, b09: 0.86 },
  oysters: { b01: 0.88, b03: 0.95, b05: 1.02, b09: 1.08 },
}

const prices: PricePoint[] = []
for (const [species, byBuyer] of Object.entries(TODAY)) {
  for (const [buyerId, final] of Object.entries(byBuyer)) {
    const buyer = buyers.find((b) => b.id === buyerId)!
    if (!buyer.species.includes(species)) throw new Error(`${buyerId} does not buy ${species}`)
    // smooth noise: random walk that is pulled back toward zero
    let walk = 0
    const phase = rand() * Math.PI * 2
    const series: number[] = []
    for (let i = 0; i < DAYS; i++) {
      const daysAgo = DAYS - 1 - i
      walk = walk * 0.8 + (rand() - 0.5) * (species === 'lobster' ? 0.008 : 0.018)
      const settle = Math.min(1, daysAgo / 4) // noise fades out so today lands exactly on target
      let base: number
      if (species === 'lobster') base = final * (1 - 0.075 * (daysAgo / (DAYS - 1)))
      else base = final * (1 + 0.03 * Math.sin(phase + i / 9) - 0.03 * Math.sin(phase + (DAYS - 1) / 9))
      series.push(base * (1 + walk * settle))
    }
    series[DAYS - 1] = final
    if (species === 'lobster') series[DAYS - 2] = final * 0.991
    // Alert in the demo: "Snow crab up 6% in Caraquet this week"
    if (species === 'snow-crab' && buyerId === 'b07') {
      const start = final / 1.06
      for (let k = 0; k <= 7; k++) series[DAYS - 1 - 7 + k] = start + ((final - start) * k) / 7
      for (let i = 0; i < DAYS - 8; i++) series[i] = start * (series[i] / series[DAYS - 8])
    }
    series.forEach((p, i) => prices.push({ buyer: buyerId, species, date: dayISO(DAYS - 1 - i), price: round2(p) }))
  }
}

/* ----------------------------------------------------------------- catches */

type Seed = {
  seq: number
  species: string
  weight: number
  grade?: string
  vessel: string
  port: string
  area: string
  daysAgo: number
  landed: [number, number]
  sold?: string
  delivered?: string
  scans: number
}

const SEEDS: Seed[] = [
  { seq: 398, species: 'lobster', weight: 320, grade: 'Market (1–1.5 lb)', vessel: 'v2', port: 'cap-pele', area: 'LFA 25', daysAgo: 12, landed: [10, 20], sold: 'b03', delivered: 'Le Homard Bleu, Dieppe', scans: 14 },
  { seq: 399, species: 'scallops', weight: 180, grade: 'U10', vessel: 'v6', port: 'yarmouth', area: 'LFA 34', daysAgo: 11, landed: [14, 5], sold: 'b10', delivered: 'Harbourfront Grill, Halifax', scans: 9 },
  { seq: 400, species: 'snow-crab', weight: 1250, vessel: 'v5', port: 'caraquet', area: 'CFA 12', daysAgo: 10, landed: [9, 45], sold: 'b07', delivered: 'Marché Acadien, Moncton', scans: 22 },
  { seq: 401, species: 'lobster', weight: 410, grade: 'Canners', vessel: 'v3', port: 'pictou', area: 'LFA 26A', daysAgo: 9, landed: [11, 30], scans: 5 },
  { seq: 402, species: 'oysters', weight: 450, grade: 'Choice', vessel: 'v4', port: 'north-rustico', area: 'LFA 24', daysAgo: 8, landed: [13, 10], scans: 0 },
  { seq: 403, species: 'lobster', weight: 280, grade: 'Market (1–1.5 lb)', vessel: 'v1', port: 'shediac', area: 'LFA 25', daysAgo: 7, landed: [10, 55], sold: 'b01', delivered: 'Le Coquillage, Moncton', scans: 11 },
  { seq: 404, species: 'mackerel', weight: 900, vessel: 'v2', port: 'cap-pele', area: 'LFA 25', daysAgo: 6, landed: [8, 40], scans: 2 },
  { seq: 405, species: 'lobster', weight: 355, grade: 'Selects', vessel: 'v4', port: 'souris', area: 'LFA 26A', daysAgo: 5, landed: [12, 15], scans: 6 },
  { seq: 406, species: 'scallops', weight: 210, grade: 'U10', vessel: 'v6', port: 'yarmouth', area: 'SFA 29', daysAgo: 4, landed: [15, 20], scans: 1 },
  { seq: 407, species: 'lobster', weight: 390, grade: 'Market (1–1.5 lb)', vessel: 'v2', port: 'cap-pele', area: 'LFA 25', daysAgo: 3, landed: [10, 5], scans: 3 },
  { seq: 408, species: 'lobster', weight: 300, grade: 'Selects', vessel: 'v1', port: 'shediac', area: 'LFA 25', daysAgo: 2, landed: [11, 0], sold: 'b01', scans: 4 },
  { seq: 409, species: 'snow-crab', weight: 980, vessel: 'v5', port: 'shippagan', area: 'CFA 12', daysAgo: 2, landed: [9, 10], scans: 0 },
  { seq: 410, species: 'lobster', weight: 260, grade: 'Canners', vessel: 'v3', port: 'pictou', area: 'LFA 26A', daysAgo: 1, landed: [11, 40], scans: 1 },
  { seq: 411, species: 'oysters', weight: 520, grade: 'Standard', vessel: 'v4', port: 'souris', area: 'LFA 26A', daysAgo: 1, landed: [14, 0], scans: 0 },
  // The demo tag
  { seq: 412, species: 'lobster', weight: 400, grade: 'Market (1–1.5 lb)', vessel: 'v1', port: 'shediac', area: 'LFA 25', daysAgo: 0, landed: [7, 40], scans: 3 },
]

const catches: Catch[] = SEEDS.map((s) => {
  const vessel = vessels.find((v) => v.id === s.vessel)!
  const area = areas.find((a) => a.id === s.area)!
  const port = ports.find((p) => p.id === s.port)!
  const [hh, mm] = s.landed
  const caughtH = Math.max(3, hh - 5)
  const jitter = () => round2((rand() - 0.5) * 0.16 * 100) / 100
  return {
    tag: `CC-${area.code}-${String(s.seq).padStart(4, '0')}-${port.code}`,
    species: s.species,
    weight: s.weight,
    grade: s.grade,
    vessel: vessel.name,
    fisher: vessel.fisher,
    port: s.port,
    area: s.area,
    gps: { lat: Math.round((area.lat + jitter()) * 1000) / 1000, lng: Math.round((area.lng + jitter()) * 1000) / 1000 },
    landedAt: stamp(s.daysAgo, hh, mm),
    status: vessel.licenceArea === s.area ? 'verified' : 'pending',
    journey: {
      caught: stamp(s.daysAgo, caughtH, 15),
      landed: stamp(s.daysAgo, hh, mm),
      ...(s.sold && { sold: { at: stamp(s.daysAgo, hh + 1, 10), buyer: buyers.find((b) => b.id === s.sold)!.name } }),
      ...(s.delivered && { delivered: { at: stamp(Math.max(0, s.daysAgo - 1), 9, 30), to: s.delivered } }),
    },
    scans: s.scans,
  }
})

/* ---------------------------------------------------------------- listings */

const ASK: Record<string, number> = { lobster: 9.75, 'snow-crab': 7.4, scallops: 15.5, mackerel: 1.35, oysters: 1.45 }
const listings: Listing[] = catches
  .filter((c) => c.status === 'verified' && !c.journey.sold)
  .slice(-8)
  .map((c) => {
    const daysAgo = SEEDS.find((s) => c.tag.includes(String(s.seq).padStart(4, '0')))!.daysAgo
    return {
      tag: c.tag,
      askingPrice: round2(ASK[c.species] * (0.96 + rand() * 0.08)),
      availableUntil: dayISO(daysAgo - 3),
    }
  })

writeFileSync(`${OUT}/prices.json`, JSON.stringify(prices))
writeFileSync(`${OUT}/catches.json`, JSON.stringify(catches, null, 2))
writeFileSync(`${OUT}/listings.json`, JSON.stringify(listings, null, 2))
console.log(`Seeded ${prices.length} prices, ${catches.length} catches, ${listings.length} listings (end date ${dayISO(0)})`)
