import { useState } from 'react'
import { PERMIT_TYPE_LABELS } from '../areas'
import { computeBooking, URGENCY_STYLES } from '../bookingCalculator'

const PERMIT_TYPE_STYLES = {
  quota: 'bg-blue-100 text-blue-800',
  lottery: 'bg-amber-100 text-amber-800',
  'self-issue': 'bg-green-100 text-green-800',
}

const REGION_GRADIENTS = {
  'Sierra Nevada': 'from-emerald-800 to-teal-900',
  'Bay Area / Coast': 'from-cyan-700 to-teal-900',
  'Northern California': 'from-orange-700 to-red-900',
  'Pacific Northwest': 'from-green-700 to-emerald-900',
  'Rocky Mountains': 'from-slate-600 to-blue-900',
  'Southwest': 'from-orange-600 to-red-800',
  'Midwest': 'from-teal-700 to-cyan-900',
  'Northern Rockies': 'from-stone-600 to-slate-800',
}

function CountdownPill({ daysUntil, urgency }) {
  if (daysUntil == null) return null
  const styles = URGENCY_STYLES[urgency]
  if (daysUntil < 0) {
    return (
      <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-green-500 text-white">
        Open now
      </span>
    )
  }
  if (daysUntil === 0) {
    return (
      <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${styles.badge}`}>
        Today!
      </span>
    )
  }
  return (
    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full ${styles.badge}`}>
      in {daysUntil} day{daysUntil === 1 ? '' : 's'}
    </span>
  )
}

function SubLocationRow({ sub, tripDate }) {
  const result = computeBooking(sub.bookingWindow, tripDate ? new Date(tripDate) : null)
  const styles = URGENCY_STYLES[result.urgency]
  const recGovUrl = sub.recGovId
    ? `https://www.recreation.gov/${sub.type === 'campground' ? 'camping/campgrounds' : 'permits'}/${sub.recGovId}`
    : null

  return (
    <div className={`rounded-xl border p-3 ${styles.bg} ${styles.border}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="font-semibold text-stone-800 text-sm leading-tight">{sub.name}</h4>
        <CountdownPill daysUntil={result.daysUntil} urgency={result.urgency} />
      </div>

      <p className={`text-sm font-medium ${styles.text}`}>{result.bookOnLabel}</p>
      {result.bookOnDetail && (
        <p className="text-xs text-stone-500 leading-relaxed mt-1">{result.bookOnDetail}</p>
      )}

      {recGovUrl && (
        <a
          href={recGovUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs font-medium text-green-700 hover:text-green-900 underline underline-offset-2"
        >
          View on Recreation.gov →
        </a>
      )}
    </div>
  )
}

export default function AreaCard({ area, tripDate }) {
  const { name, state, region, managing, permitType, season, notes, subLocations } = area
  const [expanded, setExpanded] = useState(true)

  const gradient = REGION_GRADIENTS[region] || 'from-green-700 to-stone-800'
  const typeLabel = PERMIT_TYPE_LABELS[permitType]
  const typeBadge = PERMIT_TYPE_STYLES[permitType] || 'bg-stone-100 text-stone-600'
  const seasonText = season.end ? `${season.start} – ${season.end}` : season.start

  // Compute the most urgent sub-location for the collapsed-state summary
  const computed = subLocations.map((sub) =>
    computeBooking(sub.bookingWindow, tripDate ? new Date(tripDate) : null),
  )
  const URGENCY_RANK = { critical: 0, soon: 1, later: 2, none: 3 }
  const mostUrgent = computed.reduce(
    (best, r) => (URGENCY_RANK[r.urgency] < URGENCY_RANK[best.urgency] ? r : best),
    computed[0],
  )

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Header bar */}
      <div className={`bg-gradient-to-br ${gradient} px-5 py-4`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-white font-bold text-base leading-snug drop-shadow">{name}</h3>
            <p className="text-white/70 text-xs mt-0.5">
              {state} · {region}
            </p>
          </div>
          <span className={`shrink-0 mt-0.5 px-2.5 py-1 text-xs font-semibold rounded-full ${typeBadge}`}>
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Top-line area details */}
      <div className="px-5 pt-4 pb-2 flex flex-col gap-1.5">
        <p className="text-xs text-stone-500">
          <span className="text-stone-400">Managed by</span>{' '}
          <span className="font-medium text-stone-700">{managing}</span>
        </p>
        <p className="text-xs text-stone-500">
          <span className="text-stone-400">Season</span>{' '}
          <span className="font-medium text-stone-700">{seasonText}</span>
        </p>
        {notes && <p className="text-xs text-stone-500 leading-relaxed mt-1">{notes}</p>}
      </div>

      {/* Sub-locations (always shown — these contain the actionable booking info) */}
      <div className="px-5 pb-5 pt-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wide font-semibold text-stone-500">
            Booking{subLocations.length > 1 ? ` (${subLocations.length} options)` : ''}
          </p>
          {subLocations.length > 1 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-green-700 hover:text-green-900 font-medium"
            >
              {expanded ? 'Collapse' : 'Show all'}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {(expanded ? subLocations : [subLocations[0]]).map((sub, i) => (
            <SubLocationRow key={sub.id} sub={sub} tripDate={tripDate} />
          ))}
          {!expanded && subLocations.length > 1 && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-stone-500 hover:text-stone-700 self-start mt-1"
            >
              + {subLocations.length - 1} more
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function areaUrgency(area, tripDate) {
  const URGENCY_RANK = { critical: 0, soon: 1, later: 2, none: 3 }
  return area.subLocations.reduce((best, sub) => {
    const r = computeBooking(sub.bookingWindow, tripDate ? new Date(tripDate) : null)
    return URGENCY_RANK[r.urgency] < URGENCY_RANK[best] ? r.urgency : best
  }, 'none')
}
