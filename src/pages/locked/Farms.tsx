import { BadgeCheck, MapPin } from 'lucide-react'
import { LockedFeature } from '@/components/LockedFeature'
import { Card } from '@/components/ui/Card'

function FarmArt({ kind }: { kind: 'blueberry' | 'potato' | 'maple' }) {
  const bg = { blueberry: '#ECEFFB', potato: '#F6F0E6', maple: '#FBEFE6' }[kind]
  return (
    <div className="grid size-[52px] place-items-center rounded-xl" style={{ background: bg }}>
      <svg viewBox="0 0 64 64" width="40" height="40" aria-hidden>
        {kind === 'blueberry' && (
          <g>
            <circle cx="24" cy="36" r="11" fill="#4B5BA8" />
            <circle cx="41" cy="38" r="10" fill="#5A6BC0" />
            <circle cx="33" cy="22" r="9.5" fill="#3F4E96" />
            <path d="M30 20l3 2 3-2M21 34l3 2 3-2M38 36l3 2 3-2" stroke="#fff" strokeOpacity=".6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </g>
        )}
        {kind === 'potato' && (
          <g>
            <path d="M14 34c-2-10 8-18 20-18s18 6 17 15-9 17-21 17-14-6-16-14z" fill="#B98A52" />
            <circle cx="26" cy="28" r="1.6" fill="#8A6236" />
            <circle cx="38" cy="36" r="1.6" fill="#8A6236" />
            <circle cx="30" cy="40" r="1.3" fill="#8A6236" />
          </g>
        )}
        {kind === 'maple' && (
          <g>
            <rect x="22" y="18" width="20" height="34" rx="6" fill="#C0692B" />
            <rect x="27" y="10" width="10" height="9" rx="2" fill="#7A4318" />
            <rect x="22" y="30" width="20" height="12" fill="#F4E3CF" />
            <path d="M32 32l1.4 2.8 2.6-.8-1 2.6 2 .8-2.6 1.2.6 2.4-3-1-3 1 .6-2.4-2.6-1.2 2-.8-1-2.6 2.6.8z" fill="#C0392B" />
          </g>
        )}
      </svg>
    </div>
  )
}

const PRODUCTS = [
  { kind: 'blueberry' as const, name: 'Wild blueberries', farm: 'Acadian Peninsula Berry Farm', place: 'Tracadie, NB', qty: '2,400 lb', tag: 'LR-NB-0187-TRC', price: '$3.10/lb' },
  { kind: 'potato' as const, name: 'Russet potatoes', farm: 'Saint John River Growers', place: 'Grand Falls, NB', qty: '18,000 lb', tag: 'LR-NB-0192-GFL', price: '$0.42/lb' },
  { kind: 'maple' as const, name: 'Amber maple syrup', farm: 'Érablière des Collines', place: 'Saint-Quentin, NB', qty: '320 L', tag: 'LR-NB-0201-SQN', price: '$14.50/L' },
]

export default function Farms() {
  return (
    <LockedFeature module="farms">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PRODUCTS.map((p) => (
          <Card key={p.tag} className="p-5">
            <div className="flex items-start gap-3">
              <FarmArt kind={p.kind} />
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-bold">{p.name}</p>
                <p className="text-[13px] text-ink-3">{p.qty} available</p>
              </div>
              <p className="tabular text-[16px] font-bold text-navy-900">{p.price}</p>
            </div>
            <p className="mt-4 text-[13px] font-medium">{p.farm}</p>
            <p className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
              <MapPin className="size-3.5" /> {p.place}
            </p>
            <div className="mt-4 flex items-center justify-between rounded-lg bg-verified-50 px-3 py-2 text-[12.5px]">
              <span className="flex items-center gap-1.5 font-semibold text-verified">
                <BadgeCheck className="size-3.5" /> Verified local
              </span>
              <span className="font-mono font-semibold text-ink-2">{p.tag}</span>
            </div>
          </Card>
        ))}
      </div>
    </LockedFeature>
  )
}
