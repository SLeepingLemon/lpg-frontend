import { ChartColumn } from 'lucide-react'
import { useEffect, useState } from 'react'
import { USAGE_RANGE_OPTIONS } from '../../config/constants'
import { averageDailyUsage } from '../../utils/lpgCalculations'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'

const HEIGHT = 220
const MARGIN = { top: 30, right: 8, bottom: 28, left: 40 }
const MAX_BAR = 24
const GAP = 2

/** Width of an element that may mount later (callback ref). */
function useElementWidth() {
  const [element, setElement] = useState(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!element) return undefined
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])
  return [setElement, width]
}

/** Round the axis max up to a clean step so ticks read 0 / 0.1 / 0.2 … */
function niceScale(maxValue) {
  const steps = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5]
  const step = steps.find((s) => maxValue / s <= 5) ?? 10
  const max = Math.max(step, Math.ceil(maxValue / step) * step)
  const ticks = []
  for (let v = 0; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100)
  return { max, ticks }
}

/** Bar path with 4px rounded top, square at the baseline. */
function barPath(x, y, w, h) {
  const r = Math.min(4, w / 2, h)
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
}

const parseDay = (iso) => new Date(`${iso}T00:00:00`)
const shortDate = (iso) => parseDay(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
const longDate = (iso) => parseDay(iso).toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' })

/** Daily LPG usage (kg/day) with the range average, for the last 7/14/30 days. */
export default function UsageChart({ history = [], className = '' }) {
  const [range, setRange] = useState(USAGE_RANGE_OPTIONS.at(-2) ?? 14)
  const [active, setActive] = useState(null)
  const [containerRef, width] = useElementWidth()

  const data = history.slice(-range)
  const average = averageDailyUsage(data)
  const total = data.reduce((sum, d) => sum + (d.usedKg ?? 0), 0)
  const { max, ticks } = niceScale(Math.max(...data.map((d) => d.usedKg), average ?? 0, 0.1))

  const plotW = Math.max(0, width - MARGIN.left - MARGIN.right)
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom
  const band = data.length ? plotW / data.length : 0
  const barW = Math.max(2, Math.min(MAX_BAR, band - GAP))
  const y = (v) => MARGIN.top + plotH - (v / max) * plotH
  const labelEvery = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 5

  const activeDay = active !== null ? data[active] : null

  function onKeyDown(e) {
    if (!data.length) return
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const delta = e.key === 'ArrowRight' ? 1 : -1
      setActive((i) => Math.min(data.length - 1, Math.max(0, (i ?? (delta > 0 ? -1 : data.length)) + delta)))
    }
  }

  const rangeControl = (
    <div role="group" aria-label="Chart range" className="flex rounded-lg bg-slate-100 p-0.5">
      {USAGE_RANGE_OPTIONS.map((days) => (
        <button
          key={days}
          type="button"
          aria-pressed={range === days}
          onClick={() => {
            setRange(days)
            setActive(null)
          }}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            range === days ? 'bg-white text-ink shadow-sm' : 'text-slate-600 hover:text-ink'
          }`}
        >
          {days}d
        </button>
      ))}
    </div>
  )

  return (
    <Card title="Daily usage" icon={ChartColumn} action={rangeControl} className={className}>
      {data.length === 0 ? (
        <EmptyState icon={ChartColumn} title="No usage history yet" message="Daily usage appears after the first full day of readings." />
      ) : (
        <>
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            <p>
              <span className="text-2xl font-bold text-ink">{average?.toFixed(2)}</span>
              <span className="ml-1 text-sm text-slate-500">kg/day average</span>
            </p>
            <p>
              <span className="text-2xl font-bold text-ink">{total.toFixed(1)}</span>
              <span className="ml-1 text-sm text-slate-500">kg used in {data.length} days</span>
            </p>
          </div>

          <div ref={containerRef} className="relative mt-4" style={{ height: HEIGHT }}>
            {width > 0 && (
              <svg
                width={width}
                height={HEIGHT}
                tabIndex={0}
                role="img"
                aria-label={`Bar chart of LPG used per day over the last ${data.length} days. Average ${average} kg per day. Use left and right arrow keys to read each day.`}
                onKeyDown={onKeyDown}
                onBlur={() => setActive(null)}
                onMouseLeave={() => setActive(null)}
                className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
              >
                {/* Gridlines + y ticks */}
                {ticks.map((t) => (
                  <g key={t}>
                    <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(t)} y2={y(t)} className="stroke-slate-100" strokeWidth="1" />
                    <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-500 text-[11px] tabular-nums">
                      {t}
                    </text>
                  </g>
                ))}
                <text x={MARGIN.left - 8} y={10} textAnchor="end" className="fill-slate-500 text-[11px]">
                  kg
                </text>

                {/* Bars + hit targets */}
                {data.map((d, i) => {
                  const x = MARGIN.left + i * band + (band - barW) / 2
                  const h = Math.max(0, MARGIN.top + plotH - y(d.usedKg))
                  return (
                    <g key={d.date}>
                      <path
                        d={barPath(x, y(d.usedKg), barW, h)}
                        className={`transition-colors ${active === i ? 'fill-brand-700' : 'fill-brand-500'}`}
                      />
                      <rect
                        x={MARGIN.left + i * band}
                        y={MARGIN.top}
                        width={band}
                        height={plotH}
                        fill="transparent"
                        onMouseEnter={() => setActive(i)}
                      />
                      {i % labelEvery === (data.length - 1) % labelEvery && (
                        <text
                          x={MARGIN.left + i * band + band / 2}
                          y={HEIGHT - 8}
                          textAnchor="middle"
                          className="fill-slate-500 text-[11px]"
                        >
                          {shortDate(d.date)}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* Baseline */}
                <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(0)} y2={y(0)} className="stroke-slate-300" strokeWidth="1" />

                {/* Average reference line */}
                {average !== null && (
                  <g pointerEvents="none">
                    <line x1={MARGIN.left} x2={width - MARGIN.right} y1={y(average)} y2={y(average)} className="stroke-ink" strokeWidth="1.5" />
                    <text
                      x={width - MARGIN.right}
                      y={y(average) - 6}
                      textAnchor="end"
                      paintOrder="stroke"
                      strokeWidth="4"
                      strokeLinejoin="round"
                      className="fill-ink stroke-white text-[11px] font-semibold"
                    >
                      avg {average.toFixed(2)} kg
                    </text>
                  </g>
                )}
              </svg>
            )}

            {activeDay && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow-lg"
                style={{
                  left: Math.min(Math.max(MARGIN.left + active * band + band / 2, 60), width - 60),
                  top: y(activeDay.usedKg) - 8,
                }}
              >
                <span className="block text-white/70">{longDate(activeDay.date)}</span>
                <span className="font-semibold">{activeDay.usedKg.toFixed(2)} kg used</span>
              </div>
            )}
            <p className="sr-only" aria-live="polite">
              {activeDay ? `${longDate(activeDay.date)}: ${activeDay.usedKg.toFixed(2)} kilograms used` : ''}
            </p>
          </div>

          <table className="sr-only">
            <caption>LPG used per day, last {data.length} days</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">kg used</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.date}>
                  <td>{longDate(d.date)}</td>
                  <td>{d.usedKg.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Card>
  )
}
