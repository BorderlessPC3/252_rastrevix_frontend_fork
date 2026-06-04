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

const CX = 160
const OUTER_R = 100
const INNER_R = 60
/** Centro do círculo: base reta do semicírculo fica em y = CY */
const CY = OUTER_R + 24
const VIEW_WIDTH = 320
const VIEW_HEIGHT = CY + 28

/** Semicírculo superior (arco): esquerda 270° → topo 0° → direita 90° (180° de arco) */
const ARC_START = 270
const ARC_END = ARC_START + 180
const ARC_SPAN = ARC_END - ARC_START

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  }
}

function describeDonutSegment(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  angleFrom: number,
  angleTo: number,
) {
  const outerStart = polarToCartesian(cx, cy, outerR, angleFrom)
  const outerEnd = polarToCartesian(cx, cy, outerR, angleTo)
  const innerEnd = polarToCartesian(cx, cy, innerR, angleTo)
  const innerStart = polarToCartesian(cx, cy, innerR, angleFrom)
  const clockwise = angleTo > angleFrom
  const sweepDeg = clockwise ? angleTo - angleFrom : angleFrom - angleTo
  const largeArc = sweepDeg > 180 ? 1 : 0
  const outerSweep = clockwise ? 1 : 0
  const innerSweep = clockwise ? 0 : 1

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} ${outerSweep} ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} ${innerSweep} ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ")
}

const MonitoringSemiDonut: React.FC<MonitoringSemiDonutProps> = ({
  segments,
  gapDeg = 1.5,
}) => {
  const active = segments.filter((s) => s.value > 0)
  const total = active.reduce((sum, s) => sum + s.value, 0)

  let currentAngle = ARC_START

  const paths =
    total > 0
      ? active.map((segment) => {
          const proportion = segment.value / total
          const segmentSpan = Math.max(0.5, proportion * ARC_SPAN - gapDeg)
          const angleFrom = currentAngle
          const angleTo = currentAngle + segmentSpan
          currentAngle = angleTo + gapDeg

          return (
            <path
              key={segment.label}
              d={describeDonutSegment(CX, CY, OUTER_R, INNER_R, angleFrom, angleTo)}
              fill={segment.color}
            />
          )
        })
      : [
          <path
            key="empty"
            d={describeDonutSegment(CX, CY, OUTER_R, INNER_R, ARC_START, ARC_END)}
            fill="var(--md-border, #e8eaed)"
            opacity={0.35}
          />,
        ]

  return (
    <div className="monitoring-semidonut">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Distribuição por status (semicírculo)"
      >
        {paths}
      </svg>
      <div className="monitoring-semidonut__legend">
        {segments.map((segment) => (
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
