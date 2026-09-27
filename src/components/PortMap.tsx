import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { ports } from '@/lib/data'
import { fmtMoney } from '@/lib/utils'

export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
export const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

type Info = Record<string, { price: number; rel: number; buyers: number }>

function tone(rel: number) {
  if (rel >= 1.02) return { bg: '#1E9E5A', label: 'Above avg' }
  if (rel <= 0.98) return { bg: '#D64545', label: 'Below avg' }
  return { bg: '#0B2545', label: 'Near avg' }
}

// Ports that sit close together get their labels pushed to one side, with a dot marking the real spot.
const SIDE: Record<string, 'left' | 'right'> = { shediac: 'left', 'cap-pele': 'right', caraquet: 'left', shippagan: 'right' }

function pill(text: string, bg: string, selected: boolean, muted: boolean, side?: 'left' | 'right') {
  const shift = side === 'left' ? 'translate(calc(-100% - 7px),-50%)' : side === 'right' ? 'translate(7px,-50%)' : 'translate(-50%,-50%)'
  const dot = side ? `<div style="position:absolute;left:0;top:0;transform:translate(-50%,-50%);width:9px;height:9px;border-radius:50%;background:${muted ? '#9AAABB' : bg};border:2px solid #fff;box-shadow:0 1px 3px rgba(11,37,69,.3)"></div>` : ''
  return L.divIcon({
    className: '',
    iconSize: [0, 0],
    html: `<div style="position:relative">${dot}<div style="position:absolute;left:0;top:0;transform:${shift}${selected ? ' scale(1.1)' : ''};transform-origin:${side === 'left' ? 'right' : side === 'right' ? 'left' : 'center'} center;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;
      padding:${muted ? '3px 6px' : '4px 8px'};border-radius:999px;font:600 ${muted ? 10.5 : 12}px Inter,system-ui,sans-serif;font-variant-numeric:tabular-nums;
      color:${muted ? '#6B7F96' : '#fff'};background:${muted ? '#fff' : bg};border:${muted ? '1px solid #D3DBE4' : '2px solid #fff'};
      box-shadow:${selected ? `0 0 0 3px ${bg}55, 0 4px 12px rgba(11,37,69,.25)` : '0 2px 6px rgba(11,37,69,.18)'}">${text}</div></div>`,
  })
}

function FitBounds() {
  const map = useMap()
  useEffect(() => {
    const fit = () => {
      map.invalidateSize()
      map.fitBounds(L.latLngBounds(ports.map((p) => [p.lat, p.lng])), { padding: [40, 40] })
    }
    fit()
    const t = setTimeout(fit, 300) // after the page transition settles
    return () => clearTimeout(t)
  }, [map])
  return null
}

export function PortMap({ info, selected, onSelect, height = 340 }: { info: Info; selected?: string; onSelect: (portId: string | undefined) => void; height?: number }) {
  const markers = useMemo(
    () =>
      ports.map((p) => {
        const i = info[p.id]
        const t = i ? tone(i.rel) : { bg: '#9AAABB', label: '' }
        return { p, i, t, icon: pill(i ? fmtMoney(i.price) : p.name, t.bg, selected === p.id, !i, SIDE[p.id]) }
      }),
    [info, selected],
  )

  return (
    <div className="relative overflow-hidden rounded-[10px] border border-line" style={{ height }}>
      <MapContainer center={[46, -64]} zoom={6} zoomSnap={0.25} scrollWheelZoom={false} className="h-full w-full" attributionControl>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <FitBounds />
        {markers.map(({ p, i, t, icon }) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={icon}
            eventHandlers={{ click: () => i && onSelect(selected === p.id ? undefined : p.id) }}
          >
            <Tooltip direction="top" offset={[0, -14]} className="cc-tip">
              <div className="text-[12.5px]">
                <div className="font-semibold">
                  {p.name}, {p.province}
                </div>
                {i ? (
                  <div className="text-ink-3">
                    Avg {fmtMoney(i.price)} · {i.buyers} buyer{i.buyers > 1 ? 's' : ''} · {t.label}
                  </div>
                ) : (
                  <div className="text-ink-3">No buyers for this species</div>
                )}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <div className="pointer-events-none absolute top-2 right-2 z-[5] flex gap-2.5 rounded-lg border border-line bg-white/95 px-2.5 py-1.5 text-[11px] font-medium text-ink-2">
        <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-verified" />Above avg</span>
        <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-navy-900" />Near</span>
        <span className="flex items-center gap-1"><i className="size-2 rounded-full bg-flag" />Below</span>
      </div>
    </div>
  )
}
