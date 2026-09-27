import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Award, Bell, ChevronRight, CloudLightning, DollarSign, Fish, Lock, PlusCircle, QrCode, ScanLine, Store, TrendingUp } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/StatCard'
import { StatusChip } from '@/components/StatusChip'
import { SpeciesArt } from '@/components/SpeciesArt'
import { PageHeader, SampleNote } from '@/components/PageHeader'
import { avgToday, bestOffer, weekChange } from '@/lib/pricing'
import { portById, speciesById } from '@/lib/data'
import { dayDiff, parseLocal, relativeDay } from '@/lib/dates'
import { useApp } from '@/lib/store'
import { traceUrl } from '@/lib/tags'
import { cn, fmtMoney, fmtNum, fmtPct } from '@/lib/utils'
import type { Catch } from '@/lib/types'

export function tracePath(c: Catch, local: boolean) {
  const u = new URL(traceUrl(c, local))
  return u.pathname + u.search
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export default function Home() {
  const { role, catches, localCatches } = useApp()
  const navigate = useNavigate()
  const lob = avgToday('lobster')
  const offer = bestOffer('lobster')
  const thisWeek = catches.filter((c) => dayDiff(new Date(), parseLocal(c.landedAt)) < 7)
  const scans = catches.reduce((s, c) => s + c.scans, 0)
  const crab = weekChange('snow-crab', 'caraquet')
  const isLocal = (c: Catch) => localCatches.some((l) => l.tag === c.tag)

  const alerts = [
    {
      icon: TrendingUp,
      tone: 'up' as const,
      title: `Snow crab ${fmtPct(crab, 0).replace('+', 'up ')} in Caraquet this week`,
      body: 'Baie des Chaleurs Processors raised their dock price 4 days in a row.',
      to: '/app/market?species=snow-crab',
      when: '2h ago',
    },
    {
      icon: DollarSign,
      tone: 'up' as const,
      title: `Cap-Pelé paying ${fmtMoney(offer.gainPerUnit)}/lb more for lobster`,
      body: `${offer.best.buyer} is at ${fmtMoney(offer.best.price)}/lb vs ${fmtMoney(offer.usual.price)} at your usual buyer.`,
      to: '/app/market?species=lobster',
      when: '35m ago',
    },
    {
      icon: CloudLightning,
      tone: 'locked' as const,
      title: 'Storm watch: Caraquet wharf may close Thursday',
      body: 'Supply Resilience will suggest alternate buyers and routes when a port goes down.',
      to: '/app/resilience',
      when: 'Preview',
    },
  ]

  return (
    <div>
      <PageHeader
        title={role === 'fisher' ? `${greeting()}, Marc` : `${greeting()}, Le Coquillage`}
        subtitle={
          role === 'fisher'
            ? 'Here’s what the market is paying today and how your catches are moving.'
            : 'Verified local supply, today’s dock prices and your recent tag checks.'
        }
        actions={
          role === 'fisher' ? (
            <>
              <Button variant="secondary" onClick={() => navigate('/app/market')}>
                <TrendingUp /> Market Pulse
              </Button>
              <Button onClick={() => navigate('/app/catch/new')}>
                <PlusCircle /> Log catch
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate('/app/buyer')}>
              <Store /> Browse local supply
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Avg lobster price today"
          icon={<Fish />}
          value={
            <>
              {fmtMoney(lob.today)}
              <span className="text-[15px] font-semibold text-ink-3">/lb</span>
            </>
          }
          delta={`${fmtMoney(Math.abs(lob.change))} (${fmtPct(lob.changePct)})`}
          deltaTone={lob.change > 0 ? 'up' : lob.change < 0 ? 'down' : 'neutral'}
          sub="vs yesterday"
          onClick={() => navigate('/app/market?species=lobster')}
        />
        <StatCard
          label="Best offer today"
          icon={<Award />}
          value={
            <>
              {fmtMoney(offer.best.price)}
              <span className="text-[15px] font-semibold text-ink-3">/lb</span>
            </>
          }
          sub={`${offer.best.buyer} · ${offer.best.port}`}
          onClick={() => navigate('/app/market?species=lobster')}
        />
        <StatCard label="Catches logged this week" icon={<QrCode />} value={thisWeek.length} delta={`${fmtNum(thisWeek.reduce((s, c) => s + c.weight, 0))} lb`} deltaTone="neutral" sub="across the network" onClick={() => navigate('/app/catches')} />
        <StatCard label="Verified tags scanned" icon={<ScanLine />} value={fmtNum(scans)} delta="+12%" deltaTone="up" sub="vs last week" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader
            title="Recent catches"
            subtitle="Latest tagged landings"
            action={
              <Link to="/app/catches" className="inline-flex items-center gap-1 text-[13px] font-semibold text-teal-600 hover:text-teal-700">
                View all <ArrowRight className="size-3.5" />
              </Link>
            }
          />
          <ul className="px-2 pb-2">
            {catches.slice(0, 5).map((c) => {
              const sp = speciesById[c.species]
              return (
                <li key={c.tag}>
                  <Link to={tracePath(c, isLocal(c))} className="group flex items-center gap-3 rounded-[10px] px-3 py-2.5 transition-colors hover:bg-surface">
                    <SpeciesArt kind={sp.image} size={40} rounded="rounded-[10px]" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[13.5px] font-semibold text-ink">{c.tag}</p>
                      <p className="truncate text-[12.5px] text-ink-3">
                        {sp.name} · {fmtNum(c.weight)} lb · {portById[c.port].name} · {relativeDay(c.landedAt)}
                      </p>
                    </div>
                    <StatusChip status={c.status} />
                    <ChevronRight className="size-4 text-ink-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Alerts" subtitle="Price moves and supply signals" icon={<Bell />} />
          <ul className="flex flex-col gap-2 px-3 pb-3">
            {alerts.map((a) => (
              <li key={a.title}>
                <Link to={a.to} className={cn('group flex gap-3 rounded-[10px] border p-3 transition-all hover:border-line-strong hover:shadow-soft', a.tone === 'locked' ? 'border-dashed border-line-strong bg-surface/60' : 'border-line')}>
                  <div className={cn('grid size-9 shrink-0 place-items-center rounded-lg', a.tone === 'locked' ? 'bg-navy-900 text-teal-200' : 'bg-verified-50 text-verified')}>
                    <a.icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13.5px] leading-snug font-semibold text-ink">{a.title}</p>
                      {a.tone === 'locked' ? (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-navy-900 px-1.5 py-0.5 text-[10px] font-semibold text-white uppercase">
                          <Lock className="size-2.5" /> Soon
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11.5px] text-ink-4">{a.when}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[12.5px] leading-snug text-ink-3">{a.body}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="mt-4">
        <SampleNote>Sample data. All prices, catches and alerts are illustrative.</SampleNote>
      </div>
    </div>
  )
}
