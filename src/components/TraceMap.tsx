import { useEffect } from 'react'
import L from 'leaflet'
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { TILE_ATTR, TILE_URL } from './PortMap'

const portIcon = L.divIcon({
  className: '',
  iconSize: [0, 0],
  html: `<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center">
    <div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0B2545;border:3px solid #fff;box-shadow:0 3px 8px rgba(11,37,69,.35);display:grid;place-items:center">
      <div style="width:8px;height:8px;border-radius:50%;background:#13A89E;transform:rotate(45deg)"></div>
    </div></div>`,
})
const boatIcon = L.divIcon({
  className: '',
  iconSize: [0, 0],
  html: `<div style="transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:#13A89E;border:3px solid #fff;box-shadow:0 0 0 6px rgba(19,168,158,.25)"></div>`,
})

function Fit({ a, b }: { a: [number, number]; b: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    const fit = () => {
      map.invalidateSize()
      map.fitBounds(L.latLngBounds([a, b]).pad(0.6), { maxZoom: 9.5 })
    }
    fit()
    const t = setTimeout(fit, 300)
    return () => clearTimeout(t)
  }, [map, a[0], a[1], b[0], b[1]]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export function TraceMap({ gps, port, areaLabel, portLabel, height = 240 }: { gps: { lat: number; lng: number }; port: { lat: number; lng: number }; areaLabel: string; portLabel: string; height?: number }) {
  const a: [number, number] = [gps.lat, gps.lng]
  const b: [number, number] = [port.lat, port.lng]
  return (
    <div className="overflow-hidden rounded-[12px] border border-line" style={{ height }}>
      <MapContainer center={a} zoom={8} zoomSnap={0.25} scrollWheelZoom={false} zoomControl={false} className="h-full w-full">
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        <Fit a={a} b={b} />
        <Circle center={a} radius={12000} pathOptions={{ color: '#13A89E', weight: 1.5, fillColor: '#13A89E', fillOpacity: 0.14, dashArray: '4 4' }} />
        <Polyline positions={[a, b]} pathOptions={{ color: '#0B2545', weight: 2, opacity: 0.55, dashArray: '2 6', lineCap: 'round' }} />
        <Marker position={a} icon={boatIcon}>
          <Tooltip direction="top" offset={[0, -10]} permanent className="cc-tip">
            <span className="text-[11.5px]">Fishing area · {areaLabel}</span>
          </Tooltip>
        </Marker>
        <Marker position={b} icon={portIcon}>
          <Tooltip direction="right" offset={[10, -18]} permanent className="cc-tip">
            <span className="text-[11.5px]">Landed · {portLabel}</span>
          </Tooltip>
        </Marker>
      </MapContainer>
    </div>
  )
}
