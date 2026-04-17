import { leadChartPoints } from '../../data/dashboardData'

const MAX_Y_VALUE = 20000
const VIEWBOX_WIDTH = 700
const VIEWBOX_HEIGHT = 250
const LEFT_PADDING = 24
const BOTTOM_PADDING = 30
const TOP_PADDING = 16

function buildLinePath(points) {
  const usableWidth = VIEWBOX_WIDTH - LEFT_PADDING * 2
  const usableHeight = VIEWBOX_HEIGHT - TOP_PADDING - BOTTOM_PADDING

  return points
    .map((point, index) => {
      const x = LEFT_PADDING + (index / (points.length - 1)) * usableWidth
      const y = TOP_PADDING + usableHeight - (point / MAX_Y_VALUE) * usableHeight
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function buildAreaPath(points) {
  const linePath = buildLinePath(points)
  const usableWidth = VIEWBOX_WIDTH - LEFT_PADDING * 2
  const endX = LEFT_PADDING + usableWidth
  const baseY = VIEWBOX_HEIGHT - BOTTOM_PADDING

  return `${linePath} L ${endX} ${baseY} L ${LEFT_PADDING} ${baseY} Z`
}

function LeadChart() {
  const linePath = buildLinePath(leadChartPoints)
  const areaPath = buildAreaPath(leadChartPoints)
  const yAxisMarks = ['20k', '15k', '10k', '5k', '0']

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="h-64 w-full" role="img" aria-label="Lead accumulation line chart">
        {yAxisMarks.map((label, index) => {
          const y = TOP_PADDING + (index / (yAxisMarks.length - 1)) * (VIEWBOX_HEIGHT - TOP_PADDING - BOTTOM_PADDING)
          return (
            <g key={label}>
              <text x="4" y={y + 4} className="fill-slate-400 text-[11px]">
                {label}
              </text>
              <line x1={LEFT_PADDING} y1={y} x2={VIEWBOX_WIDTH - LEFT_PADDING} y2={y} className="stroke-slate-200" strokeDasharray="4 6" />
            </g>
          )
        })}
        <path d={areaPath} className="fill-cyan-100/80" />
        <path d={linePath} className="fill-none stroke-cyan-500" strokeWidth="3" />
      </svg>
    </div>
  )
}

export default LeadChart
