import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck, CalendarClock, MapPin, Navigation, QrCode, Search, ShieldCheck, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { PageHeader, SampleNote } from '@/components/PageHeader'
import { SpeciesArt } from '@/components/SpeciesArt'
import { ScanModal } from '@/components/ScanModal'
import { BUYER, listings, portById, species, speciesById } from '@/lib/data'
import { fmtDate, relativeDay, toLocalISO } from '@/lib/dates'
import { distanceKm } from '@/lib/geo'
import { bestOffer } from '@/lib/pricing'
import { useApp } from '@/lib/store'
import { TAG_RE, normalizeTag } from '@/lib/tags'
import { cn, fmtMoney, fmtNum } from '@/lib/utils'
import { lockedByKey } from '@/lib/modules'
import { tracePath } from './Home'

export default function Buyer() {
  const { catches, localCatches, openComingSoon } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>('all')
  const [tag, setTag] = useState('')
  const [tagError, setTagError] = useState('')
  const [scan, setScan] = useState(false)
  const closeScan = useCallback(() => setScan(false), [])

  const items = useMemo(() => {
    const fromLocal = localCatches
      .filter((c) => c.status === 'verified')
      .map((c) => {
        const d = new Date()
        d.setDate(d.getDate() + 3)
        return { c, askingPrice: Math.round(bestOffer(c.species).best.price * 1.2 * 100) / 100, availableUntil: toLocalISO(d, false), fresh: true }
      })
    const seeded = listings
      .map((l) => ({ c: catches.find((c) => c.tag === l.tag)!, askingPrice: l.askingPrice, availableUntil: l.availableUntil, fresh: false }))
      .filter((x) => x.c)
    return [...fromLocal, ...seeded]
      .map((x) => ({ ...x, km: distanceKm(BUYER, portById[x.c.port]) }))
      .filter((x) => filter === 'all' || x.c.species === filter)
      .sort((a, b) => Number(b.fresh) - Number(a.fresh) || a.km - b.km)
  }, [catches, localCatches, filter])

  const verify = (e: React.FormEvent) => {
    e.preventDefault()
    const t = normalizeTag(tag)
    if (!t) return setTagError('Enter a tag ID, e.g. CC-25-0412-SHD.')
    if (!TAG_RE.test(t)) return setTagError('Tag IDs look like CC-25-0412-SHD. Check the format and try again.')
    const known = catches.find((c) => c.tag === t)
    navigate(known ? tracePath(known, localCatches.some((l) => l.tag === t)) : `/trace/${t}`)
  }

  const sell = lockedByKey.sell

  return (
    <div>
      <PageHeader title="Verified local supply near you" subtitle={`Traceable catches from Atlantic ports, sorted by distance from ${BUYER.name}, ${BUYER.city}.`} />

      {/* verify a tag */}
      <Card className="mb-6 overflow-hidden">
        <div className="grid md:grid-cols-[1fr_auto]">
          <form onSubmit={verify} noValidate className="p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4.5 text-teal-600" />
              <h2 className="text-[15px] font-semibold text-ink">Verify a tag</h2>
            </div>
            <p className="mt-1 text-[13px] text-ink-3">Check any CatchChain tag before you buy or serve it.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-4" />
                <Input
                  value={tag}
                  onChange={(e) => {
                    setTag(e.target.value)
                    setTagError('')
                  }}
                  invalid={!!tagError}
                  placeholder="CC-25-0412-SHD"
                  className="pl-10 font-mono uppercase placeholder:normal-case"
                  aria-label="Tag ID"
                />
              </div>
              <Button type="submit" variant="navy" className="h-11">
                Verify
              </Button>
              <Button variant="secondary" className="h-11" onClick={() => setScan(true)}>
                <QrCode /> Scan QR
              </Button>
            </div>
            {tagError && <p className="mt-2 text-[12.5px] font-medium text-flag">{tagError}</p>}
          </form>
          <div className="hidden w-[260px] flex-col justify-center gap-2 border-l border-line bg-surface/60 p-6 text-[12.5px] text-ink-3 md:flex">
            <p className="flex items-center gap-2 font-semibold text-ink-2">
              <BadgeCheck className="size-4 text-verified" /> What “verified” means
            </p>
            <p>The vessel is registered and the catch was landed from inside its licensed fishing area.</p>
          </div>
        </div>
      </Card>

      {/* species filter */}
      <div className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {[{ id: 'all', name: 'All species' }, ...species].map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={cn('h-9 shrink-0 rounded-full border px-4 text-[13px] font-semibold transition-colors', filter === s.id ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white text-ink-2 hover:border-line-strong')}
          >
            {s.name}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <p className="font-semibold text-ink">No verified {speciesById[filter]?.name.toLowerCase()} available right now</p>
          <p className="mt-1 text-[13px] text-ink-3">Check back later, or browse other species.</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => setFilter('all')}>
            Show all species
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(({ c, askingPrice, availableUntil, fresh, km }) => {
            const sp = speciesById[c.species]
            return (
              <Card key={c.tag} className="flex flex-col p-5 transition-all hover:-translate-y-px hover:border-line-strong hover:shadow-pop">
                <div className="flex items-start gap-3">
                  <SpeciesArt kind={sp.image} size={52} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[16px] font-bold text-ink">{sp.name}</p>
                      {fresh && (
                        <Badge tone="teal">
                          <Sparkles /> Just landed
                        </Badge>
                      )}
                    </div>
                    <p className="text-[13px] text-ink-3">
                      {fmtNum(c.weight)} lb{c.grade ? ` · ${c.grade}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-[20px] leading-none font-bold text-navy-900">{fmtMoney(askingPrice)}</p>
                    <p className="mt-1 text-[11.5px] text-ink-3">per {sp.unit === 'each' ? 'piece' : 'lb'}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-y-2 text-[12.5px] text-ink-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-ink-4" /> {portById[c.port].name}, {portById[c.port].province}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Navigation className="size-3.5 text-ink-4" /> {Math.round(km)} km away
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 text-ink-4" /> Landed {relativeDay(c.landedAt).toLowerCase()}
                  </span>
                  <span className="flex items-center gap-1.5 text-ink-3">Until {fmtDate(availableUntil, { month: 'short', day: 'numeric' })}</span>
                </div>
                <Link to={tracePath(c, fresh)} className="mt-4 flex items-center justify-between rounded-lg bg-verified-50 px-3 py-2 text-[12.5px] transition-colors hover:bg-verified-50/60">
                  <span className="flex items-center gap-1.5 font-semibold text-verified">
                    <BadgeCheck className="size-3.5" /> Verified
                  </span>
                  <span className="font-mono font-semibold text-ink-2">{c.tag}</span>
                </Link>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button variant="secondary" size="sm" onClick={() => navigate(tracePath(c, fresh))}>
                    Provenance
                  </Button>
                  <Button size="sm" onClick={() => openComingSoon(sell.name, sell.tagline)}>
                    Make offer
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
      <div className="mt-5">
        <SampleNote>Sample listings. Asking prices are illustrative.</SampleNote>
      </div>
      <ScanModal open={scan} onClose={closeScan} />
    </div>
  )
}
