import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, Award, MapPin, Navigation, PlusCircle, TrendingUp } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select, Segmented } from '@/components/ui/Field'
import { PageHeader, SampleNote } from '@/components/PageHeader'
import { PriceChart, portColor } from '@/components/PriceChart'
import { PortMap } from '@/components/PortMap'
import { SpeciesArt } from '@/components/SpeciesArt'
import { bestOffer, buyersFor, portIndex, todayQuotes, trendByPort, type BuyerQuote } from '@/lib/pricing'
import { FISHER, portById, species as allSpecies, speciesById } from '@/lib/data'
import { fmtTime } from '@/lib/dates'
import { cn, fmtMoney, fmtMoney0, fmtNum, fmtPct } from '@/lib/utils'

type SortKey = 'buyer' | 'port' | 'price' | 'changeWeekPct' | 'updatedAt'

export default function Market() {
  const [params, setParams] = useSearchParams()
  const speciesId = params.get('species') ?? 'lobster'
  const [portFilter, setPortFilter] = useState<string | undefined>()
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const [qty, setQty] = useState(400)
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'price', dir: -1 })

  const sp = speciesById[speciesId]
  const unit = sp.unit
  const offer = useMemo(() => bestOffer(speciesId), [speciesId])
  const quotes = useMemo(() => todayQuotes(speciesId), [speciesId])
  const idx = useMemo(() => portIndex(speciesId), [speciesId])
  const trend = useMemo(() => trendByPort(speciesId, range), [speciesId, range])
  const portOptions = useMemo(() => [...new Set(buyersFor(speciesId).map((b) => b.port))], [speciesId])

  const setSpecies = (id: string) => {
    setParams({ species: id }, { replace: true })
    setPortFilter(undefined)
  }

  const rows = useMemo(() => {
    const list = quotes.filter((q) => !portFilter || q.portId === portFilter)
    return [...list].sort((a, b) => {
      const va = a[sort.key]
      const vb = b[sort.key]
      return (typeof va === 'number' ? (va as number) - (vb as number) : String(va).localeCompare(String(vb))) * sort.dir
    })
  }, [quotes, portFilter, sort])

  const topPrice = Math.max(...quotes.map((q) => q.price))
  const gain = offer.gainPerUnit * qty
  const home = portById[FISHER.port]

  return (
    <div>
      <PageHeader
        title="Market Pulse"
        subtitle="Today's dock prices across Atlantic Canada, by species, port and buyer."
        actions={
          <>
            <Select value={portFilter ?? ''} onChange={(e) => setPortFilter(e.target.value || undefined)} className="h-9 w-[170px] text-[13px]" aria-label="Port">
              <option value="">All ports</option>
              {portOptions.map((p) => (
                <option key={p} value={p}>
                  {portById[p].name}
                </option>
              ))}
            </Select>
            <Segmented value={range} onChange={setRange} options={[{ value: 7, label: '7D' }, { value: 30, label: '30D' }, { value: 90, label: '90D' }]} />
          </>
        }
      />

      {/* species tabs */}
      <div className="scrollbar-none -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {allSpecies.map((s) => (
          <button
            key={s.id}
            onClick={() => setSpecies(s.id)}
            className={cn(
              'flex h-11 shrink-0 items-center gap-2.5 rounded-xl border pr-4 pl-1.5 text-[13.5px] font-semibold transition-all',
              s.id === speciesId ? 'border-navy-900 bg-navy-900 text-white' : 'border-line bg-white text-ink-2 hover:border-line-strong',
            )}
          >
            <SpeciesArt kind={s.image} size={32} rounded="rounded-lg" />
            {s.name}
          </button>
        ))}
      </div>

      {/* Best offer */}
      <Card className="mb-5 overflow-hidden border-teal-200">
        <div className="grid lg:grid-cols-[1.1fr_1fr]">
          <div className="relative p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Badge tone="teal">
                <Award /> Best offer today
              </Badge>
              <span className="text-[12.5px] text-ink-3">{sp.name}</span>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="tabular text-[44px] leading-none font-extrabold tracking-[-0.04em] text-navy-900">{fmtMoney(offer.best.price)}</span>
              <span className="mb-1 text-[15px] font-medium text-ink-3">/{unit}</span>
            </div>
            <p className="mt-3 text-[15px] font-semibold text-ink">{offer.best.buyer}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-3">
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {offer.best.port}, {portById[offer.best.portId].province}
              </span>
              <span className="flex items-center gap-1.5">
                <Navigation className="size-3.5" />
                {offer.best.distanceKm < 1 ? 'Your home port' : `${Math.round(offer.best.distanceKm)} km from ${home.name}`}
              </span>
              <span className="capitalize">{offer.best.type}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center border-t border-teal-100 bg-teal-50/60 p-5 sm:p-6 lg:border-t-0 lg:border-l">
            {offer.gainPerUnit > 0.001 ? (
              <>
                <p className="text-[14px] text-ink-2">
                  You’d earn <span className="tabular text-[22px] font-extrabold tracking-[-0.02em] text-verified">+{fmtMoney0(gain)}</span>
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[14px] text-ink-2">
                  on a
                  <label className="inline-flex h-9 items-center rounded-lg border border-line bg-white pr-2.5 focus-within:border-teal-500 focus-within:ring-3 focus-within:ring-teal-500/15">
                    <input
                      type="number"
                      min={0}
                      value={qty}
                      onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
                      className="tabular w-[72px] bg-transparent pl-2.5 text-[14px] font-semibold text-ink outline-none"
                      aria-label="Catch size"
                    />
                    <span className="text-[13px] text-ink-3">{unit === 'each' ? 'pcs' : 'lb'}</span>
                  </label>
                  catch vs your usual buyer
                </div>
                <p className="mt-3 text-[13px] text-ink-3">
                  {offer.usual.buyer} ({offer.usual.port}) is paying <span className="tabular font-semibold text-ink-2">{fmtMoney(offer.usual.price)}/{unit}</span> today,{' '}
                  <span className="tabular">{fmtMoney(offer.gainPerUnit)}</span> less.
                </p>
              </>
            ) : (
              <p className="text-[14px] text-ink-2">Your usual buyer is already paying the best price today. Nice.</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={`/app/catch/new?species=${speciesId}&weight=${qty}`}>
                <Button size="sm">
                  <PlusCircle /> Log this catch
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader
            icon={<TrendingUp />}
            title="Price trend by port"
            subtitle={`Average dock price, last ${range} days`}
            action={portFilter && (
              <button onClick={() => setPortFilter(undefined)} className="text-[12.5px] font-semibold text-teal-600 hover:underline">
                Show all ports
              </button>
            )}
          />
          <div className="px-3 pb-3 sm:px-4">
            <PriceChart rows={trend.rows} portIds={trend.portIds} highlight={portFilter} unit={unit} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line px-5 py-3">
            {trend.portIds.map((p) => (
              <button key={p} onClick={() => setPortFilter(portFilter === p ? undefined : p)} className={cn('flex items-center gap-1.5 text-[12.5px] font-medium transition-opacity', portFilter && portFilter !== p ? 'opacity-40 hover:opacity-80' : 'text-ink-2')}>
                <span className="h-0.5 w-3.5 rounded-full" style={{ background: portColor(trend.portIds, p) }} />
                {portById[p].name}
              </button>
            ))}
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader icon={<MapPin />} title="Port map" subtitle="Tap a port to filter buyers" />
          <div className="px-4 pb-4">
            <PortMap info={idx} selected={portFilter} onSelect={setPortFilter} height={332} />
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader
          title="Buyers"
          subtitle={
            portFilter
              ? `${rows.length} buyer${rows.length === 1 ? '' : 's'} in ${portById[portFilter].name}`
              : `${quotes.length} buyers reporting ${sp.name.toLowerCase()} prices today across ${new Set(quotes.map((q) => q.portId)).size} ports`
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead>
              <tr className="border-y border-line bg-surface/60 text-[12px] text-ink-3">
                {(
                  [
                    ['buyer', 'Buyer'],
                    ['port', 'Port'],
                    ['price', `Today ($/${unit})`],
                    ['changeWeekPct', 'vs last week'],
                    ['updatedAt', 'Last updated'],
                  ] as [SortKey, string][]
                ).map(([key, label]) => (
                  <th key={key} className={cn('px-5 py-2.5 font-semibold', (key === 'price' || key === 'changeWeekPct') && 'text-right')}>
                    <button
                      onClick={() => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : key === 'buyer' || key === 'port' ? 1 : -1 }))}
                      className={cn('inline-flex items-center gap-1 hover:text-ink', sort.key === key && 'text-ink')}
                    >
                      {label}
                      {sort.key === key ? sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((q: BuyerQuote) => {
                const best = q.price === topPrice
                const usual = q.buyerId === offer.usual.buyerId
                return (
                  <tr key={q.buyerId} className={cn('border-b border-line transition-colors last:border-0 hover:bg-surface/70', best && 'bg-verified-50/50 hover:bg-verified-50')}>
                    <td className={cn('px-5 py-3.5', best && 'shadow-[inset_3px_0_0_#1E9E5A]')}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink">{q.buyer}</span>
                        {best && <Badge tone="verified">Best price</Badge>}
                        {usual && <Badge>Your usual</Badge>}
                      </div>
                      <div className="mt-0.5 text-[12px] text-ink-3 capitalize">{q.type}</div>
                    </td>
                    <td className="px-5 py-3.5 text-ink-2">
                      {q.port}
                      <span className="block text-[12px] text-ink-4">{Math.round(q.distanceKm) < 1 ? 'Home port' : `${fmtNum(Math.round(q.distanceKm))} km`}</span>
                    </td>
                    <td className={cn('tabular px-5 py-3.5 text-right text-[15px] font-bold', best ? 'text-verified' : 'text-ink')}>{fmtMoney(q.price)}</td>
                    <td className={cn('tabular px-5 py-3.5 text-right font-semibold', q.changeWeekPct > 0.05 ? 'text-verified' : q.changeWeekPct < -0.05 ? 'text-flag' : 'text-ink-3')}>
                      {fmtPct(q.changeWeekPct)}
                    </td>
                    <td className="tabular px-5 py-3.5 text-ink-3">Today, {fmtTime(q.updatedAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-5 py-3">
          <SampleNote />
        </div>
      </Card>
    </div>
  )
}
