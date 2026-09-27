import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Anchor, BadgeCheck, CalendarDays, Clock, MapPin, Scale, Search, Ship, ShieldAlert, Timer, User, Waves } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { SpeciesArt } from '@/components/SpeciesArt'
import { TraceMap } from '@/components/TraceMap'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { areaById, portById, speciesById } from '@/lib/data'
import { dayDiff, fmtDate, fmtDateTime, parseLocal } from '@/lib/dates'
import { useApp } from '@/lib/store'
import { storage } from '@/lib/storage'
import { decodeCatch, normalizeTag } from '@/lib/tags'
import { cn, fmtNum } from '@/lib/utils'
import type { Catch } from '@/lib/types'

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface">
      <header className="bg-navy-900">
        <div className="mx-auto flex h-14 max-w-[520px] items-center justify-between px-4">
          <Link to="/">
            <Logo light size={24} />
          </Link>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70">Provenance</span>
        </div>
      </header>
      <main className="mx-auto max-w-[520px] px-4 pt-5 pb-10">{children}</main>
    </div>
  )
}

function Footer() {
  return (
    <footer className="mt-8 text-center">
      <div className="inline-flex items-center gap-2 text-[13px] font-semibold text-navy-900">
        <Waves className="size-4 text-teal-500" /> Traced by CatchChain
      </div>
      <p className="mx-auto mt-2 max-w-xs text-[11.5px] leading-relaxed text-ink-4">
        Hackathon demo. Fishers, vessels and records shown here are sample data and do not describe real people or catches.
      </p>
    </footer>
  )
}

export default function Trace() {
  const { tagId = '' } = useParams()
  const [params] = useSearchParams()
  const { findCatch } = useApp()
  const tag = normalizeTag(tagId)

  // Resolution order: URL data → local storage → seeded catches → not found
  const c: Catch | undefined = useMemo(() => {
    const d = params.get('d')
    const fromUrl = d ? decodeCatch(d, tag) : null
    const known = findCatch(tag)
    if (fromUrl) return { ...fromUrl, scans: known?.scans ?? fromUrl.scans }
    return known
  }, [params, tag, findCatch])

  const counted = useRef(false)
  useEffect(() => {
    if (c && !counted.current) {
      counted.current = true
      storage.addScan(c.tag)
    }
  }, [c])

  useEffect(() => {
    document.title = c ? `${c.tag} · CatchChain` : 'Tag not found · CatchChain'
    return () => {
      document.title = 'CatchChain'
    }
  }, [c])

  return <Shell>{c ? <Provenance c={c} /> : <NotFoundTag tag={tag} />}</Shell>
}

function Provenance({ c }: { c: Catch }) {
  const sp = speciesById[c.species]
  const port = portById[c.port]
  const area = areaById[c.area]
  const verified = c.status === 'verified'
  const days = Math.max(0, dayDiff(new Date(), parseLocal(c.landedAt)))
  const now = Date.now()
  const reached = (at?: string) => !!at && parseLocal(at).getTime() <= now

  const steps = [
    { label: 'Caught', at: c.journey.caught, detail: `${c.vessel} · ${area?.label.split(' · ')[0] ?? c.area}` },
    { label: 'Landed', at: c.journey.landed, detail: `${port?.name}, ${port?.province}` },
    { label: 'Sold to buyer', at: c.journey.sold?.at, detail: c.journey.sold?.buyer },
    { label: 'Delivered', at: c.journey.delivered?.at, detail: c.journey.delivered?.to },
  ]

  const facts = [
    { icon: User, label: 'Caught by', value: c.fisher, sub: c.vessel },
    { icon: Anchor, label: 'Fishing area', value: c.area, sub: area?.label.split(' · ')[1] },
    { icon: MapPin, label: 'Landing port', value: port?.name, sub: port && `${port.province}, Canada` },
    { icon: CalendarDays, label: 'Landed', value: fmtDate(c.landedAt, { month: 'short', day: 'numeric', year: 'numeric' }), sub: fmtDateTime(c.landedAt).split(', ')[1] },
    { icon: Scale, label: 'Weight', value: `${fmtNum(c.weight)} lb`, sub: c.grade },
    { icon: Timer, label: 'Since landing', value: days === 0 ? 'Today' : `${days} day${days > 1 ? 's' : ''}`, sub: days <= 2 ? 'Fresh' : undefined },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* hero */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="flex items-center gap-4 p-5">
          <SpeciesArt kind={sp.image} size={76} rounded="rounded-2xl" />
          <div className="min-w-0">
            <p className="font-mono text-[12.5px] font-semibold tracking-tight text-ink-3">{c.tag}</p>
            <h1 className="mt-0.5 text-[26px] leading-tight font-bold tracking-[-0.025em] text-navy-900">{sp.name}</h1>
            <p className="text-[13px] text-ink-3 italic">{sp.latin}</p>
          </div>
        </div>
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 22 }}
          className={cn('mx-4 mb-4 flex items-center gap-3 rounded-xl px-4 py-3.5', verified ? 'bg-verified text-white' : 'bg-pending text-navy-950')}
        >
          {verified ? <BadgeCheck className="size-7 shrink-0" /> : <Clock className="size-7 shrink-0" />}
          <div>
            <p className="text-[17px] leading-tight font-bold">{verified ? 'Verified local catch' : 'Pending verification'}</p>
            <p className={cn('text-[12.5px]', verified ? 'text-white/80' : 'text-navy-950/70')}>
              {verified ? 'Registered vessel, fished inside its licence area' : 'Landing recorded; licence check in progress'}
            </p>
          </div>
        </motion.div>
      </section>

      {/* facts */}
      <section className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {facts.map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-white p-4">
            <p className="flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
              <Icon className="size-3.5" /> {label}
            </p>
            <p className="mt-1.5 text-[15.5px] leading-snug font-semibold text-ink">{value}</p>
            {sub && <p className="mt-0.5 text-[12.5px] text-ink-3">{sub}</p>}
          </div>
        ))}
      </section>

      {/* map */}
      <section className="mt-4">
        <h2 className="mb-2.5 flex items-center gap-2 text-[14px] font-semibold text-navy-900">
          <Ship className="size-4 text-ink-3" /> Where it came from
        </h2>
        {port && <TraceMap gps={c.gps} port={port} areaLabel={c.area} portLabel={port.name} />}
        <p className="tabular mt-2 text-[12px] text-ink-4">
          Fishing position {c.gps.lat.toFixed(3)}°N, {Math.abs(c.gps.lng).toFixed(3)}°W
        </p>
      </section>

      {/* journey */}
      <section className="mt-5 rounded-2xl border border-line bg-white p-5">
        <h2 className="text-[14px] font-semibold text-navy-900">Journey</h2>
        <ol className="mt-4">
          {steps.map((s, i) => {
            const done = reached(s.at)
            const nextDone = i < steps.length - 1 && reached(steps[i + 1].at)
            return (
              <li key={s.label} className="relative flex gap-3.5 pb-5 last:pb-0">
                {i < steps.length - 1 && <span className={cn('absolute top-6 left-[11px] h-[calc(100%-18px)] w-0.5 rounded-full', nextDone ? 'bg-verified' : 'bg-line')} />}
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className={cn('relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2', done ? 'border-verified bg-verified text-white' : 'border-line-strong bg-white')}
                >
                  {done && (
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </motion.span>
                <div className={cn('min-w-0', !done && 'opacity-50')}>
                  <p className="text-[14px] font-semibold text-ink">{s.label}</p>
                  <p className="text-[12.5px] text-ink-3">{done ? `${fmtDateTime(s.at!)}${s.detail ? ` · ${s.detail}` : ''}` : 'Not yet'}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      <Footer />
    </motion.div>
  )
}

function NotFoundTag({ tag }: { tag: string }) {
  const [value, setValue] = useState('')
  const navigate = useNavigate()
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <section className="rounded-2xl border border-line bg-white p-6 text-center shadow-soft">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-flag-50 text-flag">
          <ShieldAlert className="size-7" />
        </div>
        <h1 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-navy-900">Tag not found</h1>
        <p className="mt-1 font-mono text-[13px] font-semibold text-ink-3">{tag || 'No tag ID'}</p>
        <div className="mt-4 rounded-xl border border-flag/20 bg-flag-50 p-4 text-left text-[13.5px] leading-relaxed text-[#9B2C2C]">
          <p className="font-semibold">This product may be unverified.</p>
          <p className="mt-1 text-[#9B2C2C]/85">
            CatchChain has no record of this tag. It could be mistyped, or the product may not come from a registered fisher. Ask your supplier for proof of origin before buying or serving it.
          </p>
        </div>
        <form
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (value.trim()) navigate(`/trace/${normalizeTag(value)}`)
          }}
        >
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Re-enter tag, e.g. CC-25-0412-SHD" className="font-mono text-[13.5px]" aria-label="Tag ID" />
          <Button type="submit" variant="navy" className="h-11">
            <Search /> Check
          </Button>
        </form>
      </section>
      <Footer />
    </motion.div>
  )
}
