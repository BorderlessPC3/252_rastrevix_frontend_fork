import type React from "react"

export interface DonutSegment {
  label: string
  value: number
  color: string
}

interface MonitoringSemiDonutProps {
  segments: DonutSegment[]
  gapDeg?: number
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
) {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const startInner = polarToCartesian(cx, cy, innerR, endAngle)
  const endInner = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ")
}

const MonitoringSemiDonut: React.FC<MonitoringSemiDonutProps> = ({
  segments,
  gapDeg = 2,
}) => {
  const active = segments.filter((s) => s.value > 0)
  const total = active.reduce((sum, s) => sum + s.value, 0)

  const cx = 160
  const cy = 155
  const outerR = 110
  const innerR = 68
  const arcStart = 270
  const arcEnd = 90
  const arcSpan = arcStart - arcEnd

  let currentAngle = arcStart

  const paths =
    total > 0
      ? active.map((segment) => {
          const proportion = segment.value / total
          const segmentSpan = proportion * arcSpan - gapDeg
          const start = currentAngle
          const end = currentAngle - segmentSpan
          currentAngle = end - gapDeg

          return (
            <path
              key={segment.label}
              d={describeArc(cx, cy, outerR, innerR, end, start)}
              fill={segment.color}
            />
          )
        })
      : []

  return (
    <div className="monitoring-semidonut">
      <svg viewBox="0 0 320 175" role="img" aria-label="Distribuição por status">
        {paths}
      </svg>
      <div className="monitoring-semidonut__legend">
        {active.map((segment) => (
          <span key={segment.label} className="monitoring-semidonut__legend-item">
            <span
              className="monitoring-semidonut__legend-dot"
              style={{ background: segment.color }}
            />
            {segment.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default MonitoringSemiDonut
