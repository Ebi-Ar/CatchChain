import L from 'leaflet'
import { AlertTriangle, Radar, Satellite } from 'lucide-react'
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip } from 'react-leaflet'
import { LockedFeature } from '@/components/LockedFeature'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TILE_ATTR, TILE_URL } from '@/components/PortMap'

type Track = { name: string; pts: [number, number][]; flagged?: boolean }
const TRACKS: Track[] = [
  { name: 'Marie-Claire II', pts: [[46.22, -64.54], [46.3, -64.42], [46.36, -64.3], [46.32, -64.2]] },
  { name: 'Lady Chaleur', pts: [[47.79, -64.94], [47.9, -64.6], [48.05, -64.2], [48.15, -63.85]] },
  { name: 'Island Pride', pts: [[46.35, -62.25], [46.5, -62.05], [46.65, -61.95]] },
  { name: 'Belle Acadienne', pts: [[46.23, -64.28], [46.35, -64.05], [46.42, -63.9]] },
  { name: 'Unidentified vessel', pts: [[47.35, -63.2], [47.22, -63.45], [47.08, -63.72]], flagged: true },
]

const flagIcon = L.divIcon({
  className: '',
  iconSize: [0, 0],
  html: `<div style="transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#D64545;border:3px solid #fff;box-shadow:0 0 0 8px rgba(214,69,69,.22)"></div>`,
})

const ALERTS = [
  { title: 'Unidentified vessel, AIS gap 6h', body: 'Transponder off 6h inside CFA 12, 24 km from active snow crab grounds.', tone: 'flag' as const, when: '06:40' },
  { title: 'Loitering near closed area', body: 'Vessel speed under 2 kn for 3h beside a seasonal closure line.', tone: 'pending' as const, when: 'Yesterday' },
  { title: 'Transshipment pattern cleared', body: 'Two vessels met at sea; both registered and within licence area.', tone: 'verified' as const, when: '2 days ago' },
]

export default function VesselWatch() {
  return (
    <LockedFeature module="vessel-watch">
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader icon={<Radar />} title="Gulf of St. Lawrence · last 24h" subtitle="5 vessels tracked · 1 flagged" />
          <div className="px-4 pb-4">
            <div className="h-[380px] overflow-hidden rounded-[10px] border border-line">
              <MapContainer center={[47.0, -63.6]} zoom={7} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false} className="h-full w-full">
                <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
                {TRACKS.map((t) => (
                  <Polyline key={t.name} positions={t.pts} pathOptions={{ color: t.flagged ? '#D64545' : '#0B2545', weight: t.flagged ? 3 : 2, opacity: t.flagged ? 0.95 : 0.55, dashArray: t.flagged ? '6 6' : undefined }} />
                ))}
                {TRACKS.filter((t) => !t.flagged).map((t) => (
                  <CircleMarker key={t.name} center={t.pts[t.pts.length - 1]} radius={5} pathOptions={{ color: '#fff', weight: 2, fillColor: '#13A89E', fillOpacity: 1 }} />
                ))}
                <Marker position={[47.08, -63.72]} icon={flagIcon}>
                  <Tooltip permanent direction="right" offset={[12, 0]} className="cc-tip">
                    <span className="text-[12px] font-semibold text-flag">Unidentified vessel, AIS gap 6h</span>
                  </Tooltip>
                </Marker>
              </MapContainer>
            </div>
            <p className="mt-3 flex items-start gap-2 text-[12px] text-ink-3">
              <Satellite className="mt-px size-3.5 shrink-0" />
              Illustrative tracks. The pilot will use public vessel-tracking data (AIS via Global Fishing Watch) to flag gaps, loitering and transshipment near catch zones.
            </p>
          </div>
        </Card>
        <Card>
          <CardHeader icon={<AlertTriangle />} title="Activity flags" subtitle="Near CatchChain catch zones" />
          <ul className="flex flex-col gap-2 px-3 pb-3">
            {ALERTS.map((a) => (
              <li key={a.title} className="rounded-[10px] border border-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={a.tone}>{a.tone === 'flag' ? 'High risk' : a.tone === 'pending' ? 'Review' : 'Cleared'}</Badge>
                  <span className="text-[11.5px] text-ink-4">{a.when}</span>
                </div>
                <p className="mt-2 text-[13.5px] font-semibold">{a.title}</p>
                <p className="mt-0.5 text-[12.5px] text-ink-3">{a.body}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </LockedFeature>
  )
}
