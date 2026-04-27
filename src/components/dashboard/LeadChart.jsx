const VIEWBOX_WIDTH = 700
const VIEWBOX_HEIGHT = 250
const LEFT_PADDING = 24
const BOTTOM_PADDING = 30
const TOP_PADDING = 16

function buildUsagePoints(usageDetails) {
  if (!usageDetails) {
    return [0, 0, 0, 0, 0]
  }

  return [
    usageDetails.GoogleSearchLimitUtilized || 0,
    usageDetails.LinkedinSearchLimitUtilized || 0,
    usageDetails.FbSearchLimitUtilized || 0,
    usageDetails.InstaSearchLimitUtilized || 0,
    usageDetails.EmailEnrichmentUtilized || 0,
  ]
}

function getDynamicMaxY(points) {
  const maxPoint = Math.max(...points, 0)
  if (maxPoint <= 10) {
    return 10
  }

  return Math.ceil(maxPoint / 10) * 10
}

function buildLinePath(points, maxY) {
  const usableWidth = VIEWBOX_WIDTH - LEFT_PADDING * 2
  const usableHeight = VIEWBOX_HEIGHT - TOP_PADDING - BOTTOM_PADDING

  return points
    .map((point, index) => {
      const x = LEFT_PADDING + (index / (points.length - 1)) * usableWidth
      const y = TOP_PADDING + usableHeight - (point / maxY) * usableHeight
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function buildAreaPath(points, maxY) {
  const linePath = buildLinePath(points, maxY)
  const usableWidth = VIEWBOX_WIDTH - LEFT_PADDING * 2
  const endX = LEFT_PADDING + usableWidth
  const baseY = VIEWBOX_HEIGHT - BOTTOM_PADDING

  return `${linePath} L ${endX} ${baseY} L ${LEFT_PADDING} ${baseY} Z`
}

function LeadChart({ usageDetails }) {
  const usagePoints = buildUsagePoints(usageDetails)
  const maxY = getDynamicMaxY(usagePoints)
  const linePath = buildLinePath(usagePoints, maxY)
  const areaPath = buildAreaPath(usagePoints, maxY)
  const yAxisMarks = [maxY, Math.round(maxY * 0.75), Math.round(maxY * 0.5), Math.round(maxY * 0.25), 0]

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} className="h-64 w-full" role="img" aria-label="Lead accumulation line chart">
        {yAxisMarks.map((label, index) => {
          const y = TOP_PADDING + (index / (yAxisMarks.length - 1)) * (VIEWBOX_HEIGHT - TOP_PADDING - BOTTOM_PADDING)
          return (
            <g key={label}>
              <text x="4" y={y + 4} className="fill-slate-400 text-[11px]">
                {label.toLocaleString()}
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
