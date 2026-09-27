import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, BadgeCheck, Camera, Check, Clock, Copy, Crosshair, Download, ExternalLink, ImagePlus, Plus, X } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { PageHeader } from '@/components/PageHeader'
import { QRTag, type QRTagHandle } from '@/components/QRTag'
import { SpeciesArt } from '@/components/SpeciesArt'
import { areaById, areas, FISHER, portById, ports, species, speciesById, verifyStatus } from '@/lib/data'
import { toLocalISO } from '@/lib/dates'
import { useApp } from '@/lib/store'
import { nextTag, publicBase, traceUrl } from '@/lib/tags'
import { cn, fmtNum } from '@/lib/utils'
import type { Catch } from '@/lib/types'

const GRADES: Record<string, string[]> = {
  lobster: ['Canners', 'Market (1–1.5 lb)', 'Selects', 'Jumbo'],
  'snow-crab': ['Small', 'Medium', 'Large'],
  scallops: ['U10', '10/20', '20/30'],
  mackerel: ['Bait', 'Food grade'],
  oysters: ['Standard', 'Choice', 'Fancy'],
}

interface Form {
  species: string
  weight: string
  grade: string
  port: string
  vessel: string
  area: string
  landedAt: string
  lat: string
  lng: string
}
type Errors = Partial<Record<keyof Form, string>>

function validate(f: Form): Errors {
  const e: Errors = {}
  if (!f.species) e.species = 'Choose a species.'
  const w = Number(f.weight)
  if (!f.weight) e.weight = 'How much did you land? Enter the weight in pounds.'
  else if (!Number.isFinite(w) || w <= 0) e.weight = 'Weight needs to be more than 0 lb.'
  else if (w > 50000) e.weight = 'That’s more than 50,000 lb. Double-check the number.'
  if (!f.port) e.port = 'Pick the port you landed at.'
  if (!f.vessel.trim()) e.vessel = 'Enter the vessel name.'
  if (!f.area) e.area = 'Pick the fishing area.'
  if (!f.landedAt) e.landedAt = 'Enter when the catch was landed.'
  else if (new Date(f.landedAt).getTime() > Date.now() + 10 * 60 * 1000) e.landedAt = 'Landing time can’t be in the future.'
  const lat = Number(f.lat)
  const lng = Number(f.lng)
  if (!f.lat || !f.lng) e.lat = 'Add the GPS position of the fishing area, or use the sample location.'
  else if (!(lat > 40 && lat < 53 && lng > -71 && lng < -52)) e.lat = 'That position is outside Atlantic Canada waters.'
  return e
}

export default function CatchNew() {
  const [params] = useSearchParams()
  const { addCatch, catches, demo, localCatches } = useApp()
  const [form, setForm] = useState<Form>(() => ({
    species: params.get('species') ?? 'lobster',
    weight: params.get('weight') ?? (demo ? '400' : ''),
    grade: demo ? 'Market (1–1.5 lb)' : '',
    port: FISHER.port,
    vessel: FISHER.vessel,
    area: FISHER.area,
    landedAt: toLocalISO(new Date()).slice(0, 16),
    lat: '',
    lng: '',
  }))
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [saved, setSaved] = useState<Catch | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    const next = { ...form, [k]: v }
    setForm(next)
    if (touched) setErrors(validate(next))
  }

  const previewTag = useMemo(() => nextTag(form.area, form.port, localCatches), [form.area, form.port, localCatches])
  const willVerify = verifyStatus(form.vessel, form.area) === 'verified'

  const useSample = () => {
    const a = areaById[form.area] ?? areaById['LFA 25']
    const j = () => (Math.random() - 0.5) * 0.08
    const next = { ...form, lat: (a.lat + j()).toFixed(4), lng: (a.lng + j()).toFixed(4) }
    setForm(next)
    if (touched) setErrors(validate(next))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0]
      document.getElementById(`f-${first}`)?.focus()
      return
    }
    const landed = form.landedAt.length === 16 ? `${form.landedAt}:00` : form.landedAt
    const caught = new Date(landed)
    caught.setHours(caught.getHours() - 4)
    const c: Catch = {
      tag: nextTag(form.area, form.port, catches),
      species: form.species,
      weight: Number(form.weight),
      grade: form.grade || undefined,
      vessel: form.vessel.trim(),
      fisher: FISHER.name,
      port: form.port,
      area: form.area,
      gps: { lat: Number(Number(form.lat).toFixed(4)), lng: Number(Number(form.lng).toFixed(4)) },
      landedAt: landed,
      status: verifyStatus(form.vessel, form.area),
      journey: { caught: toLocalISO(caught), landed },
      scans: 0,
    }
    addCatch(c)
    setSaved(c)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (saved) return <Success c={saved} onAnother={() => { setSaved(null); setTouched(false); setErrors({}); setPhoto(null); setForm((f) => ({ ...f, weight: '', lat: '', lng: '', landedAt: toLocalISO(new Date()).slice(0, 16) })) }} />

  const err = (k: keyof Form) => (touched ? errors[k] : undefined)
  const sp = speciesById[form.species]

  return (
    <div>
      <PageHeader title="Log a catch" subtitle="Record your landing and get a CatchChain tag with a QR code buyers can scan." />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card className="p-5 sm:p-6">
          <form onSubmit={submit} noValidate className="grid gap-5 sm:grid-cols-2">
            <Field label="Species" htmlFor="f-species" error={err('species')}>
              <Select id="f-species" value={form.species} invalid={!!err('species')} onChange={(e) => set('species', e.target.value)}>
                {species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Weight" htmlFor="f-weight" error={err('weight')}>
              <div className="relative">
                <Input id="f-weight" type="number" inputMode="decimal" min={0} placeholder="400" value={form.weight} invalid={!!err('weight')} onChange={(e) => set('weight', e.target.value)} className="tabular pr-10" />
                <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[13px] text-ink-3">lb</span>
              </div>
            </Field>
            <Field label="Grade / size" htmlFor="f-grade" optional>
              <Select id="f-grade" value={form.grade} onChange={(e) => set('grade', e.target.value)}>
                <option value="">Not graded</option>
                {(GRADES[form.species] ?? []).map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </Select>
            </Field>
            <Field label="Landing port" htmlFor="f-port" error={err('port')}>
              <Select id="f-port" value={form.port} invalid={!!err('port')} onChange={(e) => set('port', e.target.value)}>
                {ports.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}, {p.province}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Vessel" htmlFor="f-vessel" error={err('vessel')} hint="From your profile">
              <Input id="f-vessel" value={form.vessel} invalid={!!err('vessel')} onChange={(e) => set('vessel', e.target.value)} />
            </Field>
            <Field label="Fishing area" htmlFor="f-area" error={err('area')}>
              <Select id="f-area" value={form.area} invalid={!!err('area')} onChange={(e) => set('area', e.target.value)}>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Landed" htmlFor="f-landedAt" error={err('landedAt')}>
              <Input id="f-landedAt" type="datetime-local" value={form.landedAt} invalid={!!err('landedAt')} onChange={(e) => set('landedAt', e.target.value)} />
            </Field>
            <Field label="GPS of fishing area" htmlFor="f-lat" error={err('lat')}>
              <div className="flex gap-2">
                <Input id="f-lat" inputMode="decimal" placeholder="Lat" value={form.lat} invalid={!!err('lat')} onChange={(e) => set('lat', e.target.value)} className="tabular min-w-0 px-3" />
                <Input id="f-lng" inputMode="decimal" placeholder="Lng" value={form.lng} invalid={!!err('lat')} onChange={(e) => set('lng', e.target.value)} className="tabular min-w-0 px-3" />
              </div>
              <button type="button" onClick={useSample} className="mt-0.5 inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-teal-600 hover:text-teal-700">
                <Crosshair className="size-3.5" /> Use sample location
              </button>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Photo" optional>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setPhoto(URL.createObjectURL(f))
                  }}
                />
                {photo ? (
                  <div className="relative w-fit">
                    <img src={photo} alt="Catch preview" className="h-32 w-48 rounded-[10px] border border-line object-cover" />
                    <button type="button" onClick={() => setPhoto(null)} className="absolute -top-2 -right-2 grid size-6 place-items-center rounded-full border border-line bg-white text-ink-3 shadow-soft hover:text-ink" aria-label="Remove photo">
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex h-24 w-full flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-line-strong bg-surface/50 text-[13px] text-ink-3 transition-colors hover:border-teal-500 hover:bg-teal-50/40 hover:text-teal-700">
                    <ImagePlus className="size-5" />
                    Add a photo of the catch (preview only)
                  </button>
                )}
              </Field>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12.5px] text-ink-3">Your catch is saved in this browser. The QR code carries the details so any phone can open it.</p>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Generate tag
              </Button>
            </div>
          </form>
        </Card>

        {/* live preview */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <p className="text-[12px] font-semibold tracking-wide text-ink-3 uppercase">Tag preview</p>
            <div className="mt-3 flex items-center gap-3">
              <SpeciesArt kind={sp.image} size={48} />
              <div className="min-w-0">
                <p className="tabular truncate font-mono text-[16px] font-bold text-navy-900">{previewTag}</p>
                <p className="text-[13px] text-ink-3">
                  {sp.name}
                  {form.weight && Number(form.weight) > 0 ? ` · ${fmtNum(Number(form.weight))} lb` : ''} · {portById[form.port]?.name}
                </p>
              </div>
            </div>
            <div className={cn('mt-4 flex items-start gap-2.5 rounded-[10px] p-3 text-[13px]', willVerify ? 'bg-verified-50 text-verified' : 'bg-pending-50 text-[#8A6400]')}>
              {willVerify ? <BadgeCheck className="mt-px size-4 shrink-0" /> : <Clock className="mt-px size-4 shrink-0" />}
              <span>
                {willVerify ? (
                  <>
                    <b>Auto-verified.</b> Registered vessel fishing inside its licence area ({form.area}).
                  </>
                ) : (
                  <>
                    <b>Will be pending.</b> The vessel isn’t registered for {form.area}; a port officer will review it.
                  </>
                )}
              </span>
            </div>
          </Card>
          <Card className="p-5 text-[13px] text-ink-3">
            <p className="font-semibold text-ink">How the tag works</p>
            <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-4">
              <li>We generate a unique tag like <span className="font-mono text-ink-2">CC-25-0412-SHD</span>.</li>
              <li>Print it or attach it to the crate.</li>
              <li>Buyers and diners scan it to see where and when it was caught.</li>
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Success({ c, onAnother }: { c: Catch; onAnother: () => void }) {
  const qr = useRef<QRTagHandle>(null)
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const url = traceUrl(c)
  const internal = url.replace(publicBase(), '')
  const pointsToLocal = /localhost|127\.0\.0\.1/.test(publicBase())
  const sp = speciesById[c.species]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const t = document.createElement('textarea')
      t.value = url
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      t.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <Card className="relative overflow-hidden p-6 text-center sm:p-8">
        {/* burst */}
        <div className="pointer-events-none absolute inset-x-0 top-10 flex justify-center">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="absolute size-1.5 rounded-full"
              style={{ background: i % 3 === 0 ? '#13A89E' : i % 3 === 1 ? '#1E9E5A' : '#0B2545' }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
              animate={{ x: Math.cos((i / 12) * Math.PI * 2) * 70, y: Math.sin((i / 12) * Math.PI * 2) * 70, opacity: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
            />
          ))}
        </div>
        <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 360, damping: 16 }} className="mx-auto grid size-14 place-items-center rounded-full bg-verified text-white">
          <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.2 }} />
          </svg>
        </motion.div>
        <h1 className="mt-4 text-[24px] font-bold tracking-[-0.025em] text-navy-900">Catch logged</h1>
        <p className="mt-1 text-[14px] text-ink-3">
          {fmtNum(c.weight)} lb {sp.name.toLowerCase()} · {c.vessel} · {portById[c.port].name}
        </p>

        <motion.div initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.35, duration: 0.4, ease: 'easeOut' }} className="mx-auto mt-6 w-fit rounded-2xl border border-line bg-white p-5 shadow-pop">
          <QRTag ref={qr} c={c} url={url} size={220} />
          <p className="tabular mt-4 font-mono text-[22px] font-bold tracking-tight text-navy-900">{c.tag}</p>
          <div className="mt-1.5 flex justify-center">
            {c.status === 'verified' ? (
              <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-verified">
                <BadgeCheck className="size-3.5" /> Verified local catch
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[#8A6400]">
                <Clock className="size-3.5" /> Pending verification
              </span>
            )}
          </div>
        </motion.div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-ink-3">
          <Camera className="size-3.5" /> Scan with any phone camera to open the provenance page
        </p>
        {pointsToLocal && (
          <p className="mx-auto mt-3 flex max-w-sm items-start gap-2 rounded-lg bg-pending-50 p-2.5 text-left text-[12px] text-[#8A6400]">
            <AlertTriangle className="mt-px size-3.5 shrink-0" />
            This QR points to {publicBase()}. Set VITE_PUBLIC_URL to your deployed URL so other phones can open it.
          </p>
        )}

        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          <Button variant="secondary" onClick={() => qr.current?.download()}>
            <Download /> Download tag
          </Button>
          <Button variant="secondary" onClick={copy}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={String(copied)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="inline-flex items-center gap-2">
                {copied ? <Check className="text-verified" /> : <Copy />} {copied ? 'Copied' : 'Copy link'}
              </motion.span>
            </AnimatePresence>
          </Button>
          <Button onClick={() => navigate(internal)}>
            <ExternalLink /> View provenance
          </Button>
        </div>
      </Card>
      <div className="mt-4 flex justify-center gap-5 text-[13.5px] font-semibold">
        <button onClick={onAnother} className="inline-flex items-center gap-1.5 text-teal-600 hover:text-teal-700">
          <Plus className="size-4" /> Log another catch
        </button>
        <Link to="/app/catches" className="text-ink-3 hover:text-ink">
          Go to My catches
        </Link>
      </div>
    </div>
  )
}
