import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { portById } from '@/lib/data'
import { fmtDate } from '@/lib/dates'
import { fmtMoney } from '@/lib/utils'

export const SERIES_COLORS = ['#13A89E', '#0B2545', '#5B8DEF', '#9B7BD4', '#E58A4E', '#4FB3D9', '#8AA0B8', '#C46FA8']

export function portColor(portIds: string[], id: string) {
  return SERIES_COLORS[portIds.indexOf(id) % SERIES_COLORS.length]
}

interface Props {
  rows: Record<string, number | string>[]
  portIds: string[]
  highlight?: string
  unit: string
  height?: number
}

function ChartTooltip({ active, payload, label, unit }: { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string; unit: string }) {
  if (!active || !payload?.length) return null
  const sorted = [...payload].sort((a, b) => b.value - a.value)
  return (
    <div className="min-w-[180px] rounded-[10px] border border-line bg-white px-3 py-2.5 shadow-pop">
      <p className="mb-1.5 text-[12px] font-semibold text-ink-3">{label && fmtDate(label, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
      {sorted.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5 text-[12.5px]">
          <span className="flex items-center gap-2 text-ink-2">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            {portById[p.dataKey]?.name}
          </span>
          <span className="tabular font-semibold text-ink">
            {fmtMoney(p.value)}
            <span className="font-normal text-ink-4">/{unit}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

export function PriceChart({ rows, portIds, highlight, unit, height = 300 }: Props) {
  const values = rows.flatMap((r) => portIds.map((p) => r[p] as number).filter((v) => typeof v === 'number'))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min) * 0.12 || 0.1
  const span = rows.length
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="#EEF2F6" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8A9BB0', fontSize: 11.5 }}
            tickFormatter={(d: string) => fmtDate(d, { month: 'short', day: 'numeric' })}
            minTickGap={span > 40 ? 40 : 24}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#8A9BB0', fontSize: 11.5 }}
            tickFormatter={(v: number) => `$${v < 2 ? v.toFixed(2) : v.toFixed(v < 10 ? 2 : 0)}`}
            domain={[Math.max(0, min - pad), max + pad]}
            width={56}
          />
          <Tooltip content={<ChartTooltip unit={unit} />} cursor={{ stroke: '#D3DBE4', strokeDasharray: '3 3' }} />
          {portIds.map((p) => (
            <Line
              key={p}
              type="monotone"
              dataKey={p}
              stroke={portColor(portIds, p)}
              strokeWidth={highlight ? (p === highlight ? 2.6 : 1.4) : 2}
              strokeOpacity={highlight && p !== highlight ? 0.45 : 1}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
              isAnimationActive
              animationDuration={600}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
