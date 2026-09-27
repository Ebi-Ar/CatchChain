import { Anchor, Snowflake, Thermometer, Truck, Warehouse } from 'lucide-react'
import { LockedFeature } from '@/components/LockedFeature'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SpeciesArt } from '@/components/SpeciesArt'

const STOPS = [
  { icon: Anchor, title: 'Shediac wharf', sub: 'CC-25-0412-SHD · 400 lb lobster', time: '12:30 pickup' },
  { icon: Truck, title: 'Reefer truck NB-4471', sub: 'Maritime Cold Haul · 2 °C · 3 of 8 pallets free', time: '38 min drive' },
  { icon: Warehouse, title: 'Moncton cold storage', sub: 'Dock 3 · live holding tanks', time: 'ETA 13:15' },
]

export default function Logistics() {
  return (
    <LockedFeature module="logistics">
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader title="Matched route" subtitle="Shediac → Moncton · best match of 4 carriers" action={<Badge tone="verified">ETA 13:15</Badge>} />
          <div className="px-5 pb-5">
            <div className="mb-4 flex items-center gap-3 rounded-[10px] bg-surface p-3">
              <SpeciesArt kind="lobster" size={40} rounded="rounded-lg" />
              <div className="text-[13px]">
                <p className="font-semibold">Live lobster, 400 lb</p>
                <p className="text-ink-3">Needs 1–4 °C, delivery within 6h of landing</p>
              </div>
            </div>
            <ol>
              {STOPS.map((s, i) => (
                <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < STOPS.length - 1 && <span className="absolute top-10 left-[19px] h-[calc(100%-32px)] w-0.5 bg-teal-200" />}
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-600">
                    <s.icon className="size-4.5" />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-semibold">{s.title}</p>
                      <span className="tabular text-[12.5px] font-semibold text-ink-2">{s.time}</span>
                    </div>
                    <p className="text-[12.5px] text-ink-3">{s.sub}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Card>
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <p className="flex items-center gap-2 text-[13px] font-medium text-ink-3">
              <Thermometer className="size-4" /> Cold chain
            </p>
            <p className="tabular mt-2 text-[28px] font-bold">2.1 °C</p>
            <p className="text-[12.5px] text-verified">Within range for the whole trip</p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-2 text-[13px] font-medium text-ink-3">
              <Snowflake className="size-4" /> Cold storage near Moncton
            </p>
            <ul className="mt-3 flex flex-col gap-2 text-[13px]">
              <li className="flex justify-between"><span>Moncton Cold Store</span><span className="tabular font-semibold">42 pallets free</span></li>
              <li className="flex justify-between"><span>Dieppe Freezer Hub</span><span className="tabular font-semibold">18 pallets free</span></li>
              <li className="flex justify-between"><span>Shediac Bay Holding</span><span className="tabular font-semibold">6 pallets free</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </LockedFeature>
  )
}
