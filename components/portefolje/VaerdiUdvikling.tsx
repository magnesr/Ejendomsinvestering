'use client'

import { formaterKroner } from '@/lib/utils/formattering'

interface VaerdiDatapunkt {
  label: string
  vaerdi: number
}

interface VaerdiUdviklingProps {
  data: VaerdiDatapunkt[]
  title?: string
}

export function VaerdiUdvikling({ data, title = 'Porteføljeværdi' }: VaerdiUdviklingProps) {
  if (data.length === 0) return null

  const maxVaerdi = Math.max(...data.map(d => d.vaerdi))
  const minVaerdi = Math.min(...data.map(d => d.vaerdi))
  const range = maxVaerdi - minVaerdi || 1

  const width = 600
  const height = 160
  const padding = { top: 20, right: 20, bottom: 30, left: 20 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth
    const y = padding.top + chartHeight - ((d.vaerdi - minVaerdi) / range) * chartHeight
    return { x, y, ...d }
  })

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: '280px' }}>
          <defs>
            <linearGradient id="vaerdiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#vaerdiGradient)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
              <text
                x={p.x}
                y={height - 5}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{formaterKroner(minVaerdi)}</span>
        <span className="font-medium text-blue-700">{formaterKroner(maxVaerdi)}</span>
      </div>
    </div>
  )
}
