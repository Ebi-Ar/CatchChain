import { Gavel, Clock } from 'lucide-react'
import { LockedFeature } from '@/components/LockedFeature'
import { Card, CardHeader } from '@/components/ui/Card'
import { Field, Input, Select } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SpeciesArt } from '@/components/SpeciesArt'

const BIDS = [
  { buyer: 'Côte Acadienne Co-op', port: 'Cap-Pelé', price: 8.15, note: 'Pickup at wharf, 2 pm', best: true },
  { buyer: 'Fundy Shore Dealers', port: 'Yarmouth', price: 7.98, note: 'Buyer arranges trucking' },
  { buyer: 'Northumberland Seafoods', port: 'Shediac', price: 7.3, note: 'Pickup today' },
]

export default function Sell() {
  return (
    <LockedFeature module="sell">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <Card className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Gavel className="size-4 text-ink-3" />
            <h3 className="text-[15px] font-semibold">Post a lot</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Catch tag">
              <Select disabled defaultValue="a">
                <option value="a">CC-25-0412-SHD · Lobster 400 lb</option>
              </Select>
            </Field>
            <Field label="Minimum price ($/lb)">
              <Input disabled defaultValue="7.75" />
            </Field>
            <Field label="Bidding closes">
              <Input disabled defaultValue="Today, 1:00 PM" />
            </Field>
            <Field label="Delivery">
              <Select disabled defaultValue="a">
                <option value="a">Buyer picks up at wharf</option>
              </Select>
            </Field>
          </div>
          <Button disabled className="mt-5 w-full">
            Post lot to 6 verified buyers
          </Button>
        </Card>
        <Card>
          <CardHeader
            title="Bids on CC-25-0412-SHD"
            subtitle="400 lb live lobster · LFA 25 · Shediac"
            action={
              <Badge tone="teal">
                <Clock /> Closes in 2h 14m
              </Badge>
            }
          />
          <ul className="px-3 pb-3">
            {BIDS.map((b) => (
              <li key={b.buyer} className={`flex items-center gap-3 rounded-[10px] px-3 py-3 ${b.best ? 'bg-verified-50' : ''}`}>
                <SpeciesArt kind="lobster" size={38} rounded="rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold">
                    {b.buyer} {b.best && <Badge tone="verified" className="ml-1">Top bid</Badge>}
                  </p>
                  <p className="text-[12.5px] text-ink-3">
                    {b.port} · {b.note}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular text-[17px] font-bold">${b.price.toFixed(2)}</p>
                  <p className="tabular text-[12px] text-ink-3">${(b.price * 400).toLocaleString('en-CA', { maximumFractionDigits: 0 })} total</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </LockedFeature>
  )
}
