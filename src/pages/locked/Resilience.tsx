import { ArrowRight, CloudLightning, MapPin, Navigation } from 'lucide-react'
import { LockedFeature } from '@/components/LockedFeature'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

const ALTERNATES = [
  { buyer: 'Lamèque Island Fisheries', port: 'Shippagan, NB', km: 21, price: '$5.60/lb', capacity: 'Can take 18,000 lb today' },
  { buyer: 'Côte Acadienne Co-op', port: 'Cap-Pelé, NB', km: 196, price: '$5.45/lb', capacity: 'Truck pickup from Caraquet, 4h' },
]

export default function Resilience() {
  return (
    <LockedFeature module="resilience">
      <Card className="mb-5 overflow-hidden border-flag/30">
        <div className="flex flex-col gap-4 bg-flag-50 p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-flag text-white">
            <CloudLightning className="size-6" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="flag">Disruption detected</Badge>
              <span className="text-[12px] text-ink-3">Updated 07:05</span>
            </div>
            <p className="mt-1.5 text-[18px] font-bold text-navy-900">Caraquet wharf closed: storm surge warning</p>
            <p className="mt-0.5 text-[13.5px] text-ink-2">Expected to reopen Friday morning. 3 vessels and 1 buyer affected; 26,000 lb of snow crab needs a new outlet.</p>
          </div>
        </div>
      </Card>
      <Card>
        <CardHeader title="Suggested alternatives" subtitle="Ranked by distance, price and capacity" />
        <div className="grid gap-3 px-4 pb-4 md:grid-cols-2">
          {ALTERNATES.map((a, i) => (
            <div key={a.buyer} className="rounded-[10px] border border-line p-4">
              <div className="flex items-center justify-between">
                <Badge tone={i === 0 ? 'verified' : 'neutral'}>{i === 0 ? 'Best match' : 'Option 2'}</Badge>
                <span className="tabular text-[15px] font-bold">{a.price}</span>
              </div>
              <p className="mt-3 text-[15px] font-semibold">{a.buyer}</p>
              <div className="mt-1 flex gap-4 text-[12.5px] text-ink-3">
                <span className="flex items-center gap-1"><MapPin className="size-3.5" />{a.port}</span>
                <span className="flex items-center gap-1"><Navigation className="size-3.5" />{a.km} km</span>
              </div>
              <p className="mt-2 text-[12.5px] text-ink-2">{a.capacity}</p>
              <p className="mt-3 flex items-center gap-1 text-[13px] font-semibold text-teal-600">
                Reroute catches <ArrowRight className="size-3.5" />
              </p>
            </div>
          ))}
        </div>
      </Card>
    </LockedFeature>
  )
}
