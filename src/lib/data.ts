import portsJson from '@/data/ports.json'
import speciesJson from '@/data/species.json'
import buyersJson from '@/data/buyers.json'
import vesselsJson from '@/data/vessels.json'
import areasJson from '@/data/areas.json'
import pricesJson from '@/data/prices.json'
import catchesJson from '@/data/catches.json'
import listingsJson from '@/data/listings.json'
import { shift } from './dates'
import type { Area, Buyer, Catch, Listing, Port, PricePoint, Species, Vessel } from './types'

export const ports = portsJson as Port[]
export const species = speciesJson as Species[]
export const buyers = buyersJson as Buyer[]
export const vessels = vesselsJson as Vessel[]
export const areas = areasJson as Area[]

export const prices: PricePoint[] = (pricesJson as PricePoint[]).map((p) => ({ ...p, date: shift(p.date) }))

function shiftCatch(c: Catch): Catch {
  const j = c.journey
  return {
    ...c,
    landedAt: shift(c.landedAt),
    journey: {
      caught: shift(j.caught),
      landed: shift(j.landed),
      ...(j.sold && { sold: { ...j.sold, at: shift(j.sold.at) } }),
      ...(j.delivered && { delivered: { ...j.delivered, at: shift(j.delivered.at) } }),
    },
  }
}
export const seedCatches: Catch[] = (catchesJson as Catch[]).map(shiftCatch)
export const listings: Listing[] = (listingsJson as Listing[]).map((l) => ({ ...l, availableUntil: shift(l.availableUntil) }))

const byId = <T extends { id: string }>(arr: T[]) => Object.fromEntries(arr.map((x) => [x.id, x])) as Record<string, T>
export const portById = byId(ports)
export const speciesById = byId(species)
export const buyerById = byId(buyers)
export const areaById = byId(areas)

export const vesselByName = (name: string) => vessels.find((v) => v.name.toLowerCase() === name.trim().toLowerCase())

/** The signed-in demo profiles. */
export const FISHER = { name: 'Marc Leblanc', port: 'shediac', vessel: 'Marie-Claire II', area: 'LFA 25' }
export const BUYER = { name: 'Le Coquillage', city: 'Moncton', lat: 46.0878, lng: -64.7782 }

/** A catch is auto-verified when the vessel is registered and fished inside its licence area. */
export function verifyStatus(vesselName: string, area: string): Catch['status'] {
  const v = vesselByName(vesselName)
  return v && v.licenceArea === area ? 'verified' : 'pending'
}
