export type Role = 'fisher' | 'buyer'

export interface Port {
  id: string
  code: string
  name: string
  province: string
  lat: number
  lng: number
}

export interface Species {
  id: string
  name: string
  latin: string
  unit: 'lb' | 'each'
  season: string
  image: 'lobster' | 'crab' | 'scallop' | 'fish' | 'oyster'
}

export interface Buyer {
  id: string
  name: string
  port: string
  type: 'processor' | 'dealer' | 'co-op'
  species: string[]
}

export interface Vessel {
  id: string
  name: string
  fisher: string
  homePort: string
  licenceArea: string
  cfv: string
}

export interface Area {
  id: string
  code: string
  label: string
  lat: number
  lng: number
}

export interface PricePoint {
  buyer: string
  species: string
  date: string // YYYY-MM-DD
  price: number
}

export type CatchStatus = 'verified' | 'pending'

export interface Journey {
  caught: string
  landed: string
  sold?: { at: string; buyer: string }
  delivered?: { at: string; to: string }
}

export interface Catch {
  tag: string
  species: string
  weight: number
  grade?: string
  vessel: string
  fisher: string
  port: string
  area: string
  gps: { lat: number; lng: number }
  landedAt: string
  status: CatchStatus
  journey: Journey
  scans: number
}

export interface Listing {
  tag: string
  askingPrice: number
  availableUntil: string
}
