import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Eye, PlusCircle, Search, SearchX } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Segmented } from '@/components/ui/Field'
import { Badge } from '@/components/ui/Badge'
import { PageHeader, SampleNote } from '@/components/PageHeader'
import { StatusChip } from '@/components/StatusChip'
import { SpeciesArt } from '@/components/SpeciesArt'
import { FISHER, portById, speciesById } from '@/lib/data'
import { fmtDate, fmtTime } from '@/lib/dates'
import { useApp } from '@/lib/store'
import { fmtNum } from '@/lib/utils'
import { tracePath } from './Home'

type Scope = 'all' | 'mine'
type StatusFilter = 'all' | 'verified' | 'pending'

export default function Catches() {
  const { catches, localCatches } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const isLocal = (tag: string) => localCatches.some((l) => l.tag === tag)

  const rows = useMemo(() => {
    const needle = q.trim().toUpperCase().replace(/\s+/g, '')
    return catches.filter(
      (c) =>
        (scope === 'all' || c.vessel === FISHER.vessel) &&
        (status === 'all' || c.status === status) &&
        (!needle || c.tag.replace(/-/g, '').includes(needle.replace(/-/g, ''))),
    )
  }, [catches, q, scope, status])

  return (
    <div>
      <PageHeader
        title="My catches"
        subtitle="Every tagged landing, its verification status and how often buyers have scanned it."
        actions={
          <Link to="/app/catch/new">
            <Button>
              <PlusCircle /> Log catch
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-4" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by tag ID" className="h-10 pl-10 font-mono text-[13.5px]" aria-label="Search by tag ID" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Segmented size="sm" value={scope} onChange={setScope} options={[{ value: 'all', label: 'Co-op network' }, { value: 'mine', label: FISHER.vessel }]} />
            <Segmented size="sm" value={status} onChange={setStatus} options={[{ value: 'all', label: 'All' }, { value: 'verified', label: 'Verified' }, { value: 'pending', label: 'Pending' }]} />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-surface text-ink-4">
              <SearchX className="size-6" />
            </div>
            <p className="mt-3 font-semibold text-ink">No catches match</p>
            <p className="mt-1 text-[13px] text-ink-3">Try a different tag ID or clear the filters.</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => { setQ(''); setStatus('all'); setScope('all') }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            {/* desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-line bg-surface/60 text-[12px] text-ink-3">
                    <th className="px-5 py-2.5 font-semibold">Tag ID</th>
                    <th className="px-5 py-2.5 font-semibold">Species</th>
                    <th className="px-5 py-2.5 text-right font-semibold">Weight</th>
                    <th className="px-5 py-2.5 font-semibold">Port</th>
                    <th className="px-5 py-2.5 font-semibold">Landed</th>
                    <th className="px-5 py-2.5 font-semibold">Status</th>
                    <th className="px-5 py-2.5 text-right font-semibold">Scans</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => {
                    const sp = speciesById[c.species]
                    return (
                      <tr key={c.tag} onClick={() => navigate(tracePath(c, isLocal(c.tag)))} className="group cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-surface/70">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold text-ink">{c.tag}</span>
                            {isLocal(c.tag) && <Badge tone="teal">New</Badge>}
                          </div>
                          <span className="text-[12px] text-ink-3">{c.vessel}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <SpeciesArt kind={sp.image} size={28} rounded="rounded-md" />
                            <span className="text-ink-2">{sp.name}</span>
                          </div>
                        </td>
                        <td className="tabular px-5 py-3 text-right font-semibold text-ink">{fmtNum(c.weight)} lb</td>
                        <td className="px-5 py-3 text-ink-2">{portById[c.port].name}</td>
                        <td className="tabular px-5 py-3 text-ink-2">
                          {fmtDate(c.landedAt, { month: 'short', day: 'numeric' })}
                          <span className="text-ink-4"> · {fmtTime(c.landedAt)}</span>
                        </td>
                        <td className="px-5 py-3">
                          <StatusChip status={c.status} />
                        </td>
                        <td className="tabular px-5 py-3 text-right text-ink-2">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="size-3.5 text-ink-4" /> {c.scans}
                          </span>
                        </td>
                        <td className="pr-4">
                          <ChevronRight className="size-4 text-ink-4 transition-transform group-hover:translate-x-0.5" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* mobile cards */}
            <ul className="divide-y divide-line md:hidden">
              {rows.map((c) => {
                const sp = speciesById[c.species]
                return (
                  <li key={c.tag}>
                    <Link to={tracePath(c, isLocal(c.tag))} className="flex items-center gap-3 px-4 py-3.5 active:bg-surface">
                      <SpeciesArt kind={sp.image} size={40} rounded="rounded-[10px]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[13.5px] font-semibold text-ink">{c.tag}</p>
                        <p className="truncate text-[12.5px] text-ink-3">
                          {sp.name} · {fmtNum(c.weight)} lb · {portById[c.port].name}
                        </p>
                        <p className="mt-0.5 text-[12px] text-ink-4">
                          {fmtDate(c.landedAt, { month: 'short', day: 'numeric' })} · {c.scans} scans
                        </p>
                      </div>
                      <StatusChip status={c.status} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
        <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[12.5px] text-ink-3">
          <span>
            {rows.length} of {catches.length} catches
          </span>
          <SampleNote>Sample data</SampleNote>
        </div>
      </Card>
    </div>
  )
}
