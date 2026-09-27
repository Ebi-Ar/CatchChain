import { buyerById, buyers, FISHER, portById, prices } from './data'
import { distanceKm } from './geo'
import { hash } from './utils'
import type { PricePoint } from './types'

const dates = [...new Set(prices.map((p) => p.date))].sort()
export const latestDate = dates[dates.length - 1]
export const allDates = dates

const index = new Map<string, number>()
for (const p of prices) index.set(`${p.buyer}|${p.species}|${p.date}`, p.price)
export const priceOf = (buyer: string, species: string, date: string) => index.get(`${buyer}|${species}|${date}`)

const dateAgo = (n: number) => dates[Math.max(0, dates.length - 1 - n)]

export function buyersFor(species: string) {
  return buyers.filter((b) => b.species.includes(species))
}

/** Marc's usual buyer: Northumberland Seafoods for lobster, otherwise the closest buyer to his home port. */
export function usualBuyer(species: string) {
  const list = buyersFor(species)
  if (species === 'lobster') return buyerById.b01
  const home = portById[FISHER.port]
  return [...list].sort((a, b) => distanceKm(home, portById[a.port]) - distanceKm(home, portById[b.port]))[0]
}

export interface BuyerQuote {
  buyerId: string
  buyer: string
  type: string
  portId: string
  port: string
  price: number
  yesterday: number
  weekAgo: number
  changeWeek: number
  changeWeekPct: number
  distanceKm: number
  updatedAt: string
}

export function todayQuotes(species: string): BuyerQuote[] {
  const home = portById[FISHER.port]
  return buyersFor(species).map((b) => {
    const price = priceOf(b.id, species, latestDate) ?? 0
    const yesterday = priceOf(b.id, species, dateAgo(1)) ?? price
    const weekAgo = priceOf(b.id, species, dateAgo(7)) ?? price
    const h = hash(b.id + species)
    const hh = 6 + (h % 5)
    const mm = (h >> 4) % 60
    return {
      buyerId: b.id,
      buyer: b.name,
      type: b.type,
      portId: b.port,
      port: portById[b.port].name,
      price,
      yesterday,
      weekAgo,
      changeWeek: price - weekAgo,
      changeWeekPct: ((price - weekAgo) / weekAgo) * 100,
      distanceKm: distanceKm(home, portById[b.port]),
      updatedAt: `${latestDate}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`,
    }
  })
}

export function bestOffer(species: string) {
  const quotes = todayQuotes(species)
  const best = quotes.reduce((a, b) => (b.price > a.price ? b : a))
  const usual = quotes.find((q) => q.buyerId === usualBuyer(species).id) ?? best
  return { best, usual, gainPerUnit: best.price - usual.price }
}

export function averageOn(species: string, date: string, portId?: string) {
  const rows = prices.filter((p) => p.species === species && p.date === date && (!portId || buyerById[p.buyer].port === portId))
  if (!rows.length) return undefined
  return rows.reduce((s, p) => s + p.price, 0) / rows.length
}

export function avgToday(species: string) {
  const today = averageOn(species, latestDate) ?? 0
  const yesterday = averageOn(species, dateAgo(1)) ?? today
  return { today, yesterday, change: today - yesterday, changePct: ((today - yesterday) / yesterday) * 100 }
}

/** Average port price relative to the species average today (1.0 = average). */
export function portIndex(species: string) {
  const avg = averageOn(species, latestDate) ?? 0
  const out: Record<string, { price: number; rel: number; buyers: number }> = {}
  for (const b of buyersFor(species)) {
    const v = averageOn(species, latestDate, b.port)
    if (v !== undefined) out[b.port] = { price: v, rel: v / avg, buyers: buyersFor(species).filter((x) => x.port === b.port).length }
  }
  return out
}

/** Rows like { date, shediac: 7.1, 'cap-pele': 7.9, ... } for the trend chart. */
export function trendByPort(species: string, days: number, portFilter?: string) {
  const range = dates.slice(-days)
  const portIds = [...new Set(buyersFor(species).map((b) => b.port))].filter((p) => !portFilter || p === portFilter)
  const bucket = new Map<string, PricePoint[]>()
  for (const p of prices) {
    if (p.species !== species) continue
    const key = `${p.date}|${buyerById[p.buyer].port}`
    if (!bucket.has(key)) bucket.set(key, [])
    bucket.get(key)!.push(p)
  }
  const rows = range.map((date) => {
    const row: Record<string, number | string> = { date }
    for (const pid of portIds) {
      const arr = bucket.get(`${date}|${pid}`)
      if (arr) row[pid] = Math.round((arr.reduce((s, p) => s + p.price, 0) / arr.length) * 100) / 100
    }
    return row
  })
  return { rows, portIds }
}

/** Percent change of a port's average over the last 7 days. */
export function weekChange(species: string, portId: string) {
  const now = averageOn(species, latestDate, portId)
  const then = averageOn(species, dateAgo(7), portId)
  if (!now || !then) return 0
  return ((now - then) / then) * 100
}
