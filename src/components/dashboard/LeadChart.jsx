import { useState } from 'react'

const VIEWBOX_WIDTH = 700
const VIEWBOX_HEIGHT = 220
const LEFT_PADDING = 24
const BOTTOM_PADDING = 30
const TOP_PADDING = 16
const TOOLTIP_WIDTH = 150
const TOOLTIP_HEIGHT = 68

function buildUsageSeries(usageDetails) {
  const labels = ['Google', 'LinkedIn', 'Facebook', 'Instagram', 'Email']

  if (!usageDetails) {
    return labels.map((label) => ({
      label,
      value: 0,
      max: 0,
    }))
  }

  return [
    {
      label: 'Google',
      value: usageDetails.GoogleSearchLimitUtilized || 0,
      max: usageDetails.TotalGoogleSearchLimit || 0,
    },
    {
      label: 'LinkedIn',
      value: usageDetails.LinkedinSearchLimitUtilized || 0,
      max: usageDetails.TotalLinkedinSearchLimit || 0,
    },
    {
      label: 'Facebook',
      value: usageDetails.FbSearchLimitUtilized || 0,
      max: usageDetails.TotalFbSearchLimit || 0,
    },
    {
      label: 'Instagram',
      value: usageDetails.InstaSearchLimitUtilized || 0,
      max: usageDetails.TotalInstaSearchLimit || 0,
    },
    {
      label: 'Email',
      value: usageDetails.EmailEnrichmentUtilized || 0,
      max: usageDetails.TotalEmailEnrichment || 0,
    },
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

function getPointPosition(point, index, totalPoints, maxY) {
  const usableWidth = VIEWBOX_WIDTH - LEFT_PADDING * 2
  const usableHeight = VIEWBOX_HEIGHT - TOP_PADDING - BOTTOM_PADDING

  return {
    x: LEFT_PADDING + (index / (totalPoints - 1)) * usableWidth,
    y: TOP_PADDING + usableHeight - (point / maxY) * usableHeight,
  }
}

function getTooltipPosition(pointPosition) {
  const preferredX = pointPosition.x - TOOLTIP_WIDTH / 2
  const x = Math.min(Math.max(preferredX, LEFT_PADDING), VIEWBOX_WIDTH - LEFT_PADDING - TOOLTIP_WIDTH)
  const y = pointPosition.y > TOP_PADDING + TOOLTIP_HEIGHT + 16 ? pointPosition.y - TOOLTIP_HEIGHT - 14 : pointPosition.y + 14

  return { x, y }
}

function LeadChart({ usageDetails }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const usageSeries = buildUsageSeries(usageDetails)
  const usagePoints = usageSeries.map((item) => item.value)
  const maxY = getDynamicMaxY(usagePoints)
  const linePath = buildLinePath(usagePoints, maxY)
  const areaPath = buildAreaPath(usagePoints, maxY)
  const yAxisMarks = [maxY, Math.round(maxY * 0.75), Math.round(maxY * 0.5), Math.round(maxY * 0.25), 0]
  const activeItem = activeIndex === null ? null : usageSeries[activeIndex]
  const activePosition = activeIndex === null ? null : getPointPosition(activeItem.value, activeIndex, usageSeries.length, maxY)
  const tooltipPosition = activePosition ? getTooltipPosition(activePosition) : null
  const activePercent = activeItem?.max > 0 ? Math.round((activeItem.value / activeItem.max) * 100) : 0

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="h-48 w-full overflow-visible"
        role="img"
        aria-label="Lead accumulation line chart"
        onMouseLeave={() => setActiveIndex(null)}
      >
        <defs>
          <linearGradient id="lead-area-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.03" />
          </linearGradient>
        </defs>
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
        <path d={areaPath} fill="url(#lead-area-gradient)" />
        <path d={linePath} className="fill-none stroke-cyan-500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {activePosition ? (
          <line
            x1={activePosition.x}
            x2={activePosition.x}
            y1={TOP_PADDING}
            y2={VIEWBOX_HEIGHT - BOTTOM_PADDING}
            className="stroke-cyan-400"
            strokeDasharray="4 5"
            strokeWidth="1.5"
          />
        ) : null}
        {usageSeries.map((item, index) => {
          const { x, y } = getPointPosition(item.value, index, usageSeries.length, maxY)
          const isActive = activeIndex === index

          return (
            <g key={item.label}>
              <circle
                cx={x}
                cy={y}
                r={isActive ? '7' : '4'}
                className={isActive ? 'fill-cyan-500 stroke-white' : 'fill-white stroke-cyan-500'}
                strokeWidth="2"
              />
              <circle
                cx={x}
                cy={y}
                r="16"
                className="cursor-pointer fill-transparent"
                tabIndex="0"
                role="button"
                aria-label={`${item.label}: ${item.value.toLocaleString()} used of ${item.max.toLocaleString()}`}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
              />
            </g>
          )
        })}
        {activeItem && tooltipPosition ? (
          <g className="pointer-events-none">
            <rect
              x={tooltipPosition.x}
              y={tooltipPosition.y}
              width={TOOLTIP_WIDTH}
              height={TOOLTIP_HEIGHT}
              rx="8"
              className="fill-white stroke-cyan-100 drop-shadow-sm"
            />
            <text x={tooltipPosition.x + 12} y={tooltipPosition.y + 20} className="fill-slate-900 text-[12px] font-semibold">
              {activeItem.label}
            </text>
            <text x={tooltipPosition.x + 12} y={tooltipPosition.y + 40} className="fill-slate-500 text-[11px]">
              Used
            </text>
            <text x={tooltipPosition.x + 56} y={tooltipPosition.y + 40} className="fill-slate-900 text-[11px] font-semibold">
              {activeItem.value.toLocaleString()} / {activeItem.max.toLocaleString()}
            </text>
            <text x={tooltipPosition.x + 12} y={tooltipPosition.y + 58} className="fill-cyan-700 text-[11px] font-semibold">
              {activePercent}% utilized
            </text>
          </g>
        ) : null}
      </svg>
      <div className="grid grid-cols-5 gap-1 px-2 text-center text-[10px] font-medium text-slate-400">
        {usageSeries.map((item, index) => (
          <span key={item.label} className={activeIndex === index ? 'truncate text-cyan-700' : 'truncate'}>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default LeadChart
