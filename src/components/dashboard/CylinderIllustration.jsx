import { useId } from 'react'
import { CYLINDER_STATUS } from '../../utils/lpgCalculations'

const LEVEL_FILL = {
  [CYLINDER_STATUS.NORMAL]: 'fill-emerald-500',
  [CYLINDER_STATUS.LOW]: 'fill-amber-400',
  [CYLINDER_STATUS.CRITICAL]: 'fill-red-500',
  [CYLINDER_STATUS.OFFLINE]: 'fill-slate-300',
}

// Body geometry (viewBox units)
const BODY = { x: 14, y: 46, width: 92, height: 136, rx: 38 }

/** Drawn LPG cylinder whose gas level fills to `percent`, coloured by status. */
export default function CylinderIllustration({ percent, status, className = 'h-48 w-auto' }) {
  const clipId = useId()
  const level = Number.isFinite(percent) ? Math.min(Math.max(percent, 0), 100) / 100 : 0

  return (
    <svg viewBox="0 0 120 210" className={className} role="img" aria-label={`LPG cylinder, about ${Math.round(level * 100)}% full`}>
      <defs>
        <clipPath id={clipId}>
          <rect {...BODY} />
        </clipPath>
      </defs>

      {/* Handle guard (collar) with a hand hole, and the valve */}
      <path
        d="M36 12a8 8 0 0 1 8-8h32a8 8 0 0 1 8 8v30H36Z M48 13a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h24a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3Z"
        fillRule="evenodd"
        className="fill-brand-500"
      />
      <rect x="53" y="30" width="14" height="14" rx="2" className="fill-slate-400" />

      {/* Body: empty tint, then gas level, then outline */}
      <rect {...BODY} className="fill-brand-50" />
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={BODY.x}
          y={BODY.y}
          width={BODY.width}
          height={BODY.height}
          className={`${LEVEL_FILL[status] ?? 'fill-slate-300'} transition-transform duration-700 ease-out`}
          style={{ transform: `scaleY(${level})`, transformBox: 'fill-box', transformOrigin: 'bottom' }}
        />
      </g>
      <rect {...BODY} fill="none" strokeWidth="4" className="stroke-brand-500" />
      {/* Weld seam */}
      <line x1={BODY.x + 2} x2={BODY.x + BODY.width - 2} y1="114" y2="114" strokeWidth="2" className="stroke-brand-500/40" />

      {/* Foot ring */}
      <path d="M28 180h64v18a4 4 0 0 1-4 4H32a4 4 0 0 1-4-4Z" className="fill-brand-500" />
    </svg>
  )
}
