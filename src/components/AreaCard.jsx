import { useState } from 'react'
import { PERMIT_TYPE_LABELS } from '../areas'
import { computeBooking, URGENCY_STYLES } from '../bookingCalculator'

// Soft pastel badge styles for the permit-type chip
const PERMIT_TYPE_STYLES = {
  quota: 'bg-sky-100 text-sky-800',
  lottery: 'bg-amber-100 text-amber-800',
  'self-issue': 'bg-emerald-100 text-emerald-800',
}

// Pastel region gradients — light enough for dark text on top
export const REGION_GRADIENTS = {
  'Sierra Nevada': 'from-emerald-100 to-teal-200',
  'Bay Area / Coast': 'from-cyan-100 to-sky-200',
  'Northern California': 'from-orange-100 to-rose-200',
  'Pacific Northwest': 'from-green-100 to-emerald-200',
  'Rocky Mountains': 'from-slate-100 to-blue-200',
  'Southwest': 'from-amber-100 to-orange-200',
  'Midwest': 'from-teal-100 to-cyan-200',
  'Northern Rockies': 'from-stone-100 to-amber-100',
}

function CountdownPill({ daysUntil, urgency, status }) {
  if (daysUntil == null) return null
  const styles = URGENCY_STYLES[urgency]
  const base =
    'inline-block px-2 py-0.5 text-[11px] font-semibold rounded-full text-center leading-tight'
  if (daysUntil < 0 || status === 'open-now') {
    return <span className={`${base} bg-emerald-200 text-emerald-900`}>Open now</span>
  }
  if (daysUntil === 0) {
    return <span className={`${base} ${styles.badge}`}>Today</span>
  }
  return (
    <span className={`${base} ${styles.badge}`}>
      {daysUntil}d
    </span>
  )
}

function SubLocationRow({ sub, tripDate }) {
  const result = computeBooking(sub.bookingWindow, tripDate ? new Date(tripDate) : null)
  const recGovUrl = sub.recGovId
    ? `https://www.recreation.gov/${sub.type === 'campground' ? 'camping/campgrounds' : 'permits'}/${sub.recGovId}`
    : null

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-stone-700 text-[13px] leading-tight">
          {sub.name}
        </h4>
        <CountdownPill
          daysUntil={result.daysUntil}
          urgency={result.urgency}
          status={result.status}
        />
      </div>

      <p className="text-sm font-semibold text-stone-800">{result.bookOnLabel}</p>
      {result.bookOnDetail && (
        <p className="text-xs text-stone-500 mt-0.5">{result.bookOnDetail}</p>
      )}

      {recGovUrl && (
        <a
          href={recGovUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1.5 text-[11px] font-medium text-emerald-700 hover:text-emerald-900"
        >
          View on Recreation.gov →
        </a>
      )}
    </div>
  )
}

export default function AreaCard({ area, tripDate }) {
  const { name, state, region, season, notes, permitType, subLocations } = area
  const [showNotes, setShowNotes] = useState(false)

  const typeLabel = PERMIT_TYPE_LABELS[permitType]
  const typeBadge = PERMIT_TYPE_STYLES[permitType] || 'bg-stone-100 text-stone-600'
  const seasonText = season.end ? `${season.start} – ${season.end}` : season.start
  const gradient = REGION_GRADIENTS[region] || 'from-stone-100 to-stone-200'

  return (
    <div className="rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      {/* Pastel gradient header */}
      <div className={`px-5 pt-4 pb-3 bg-gradient-to-br ${gradient}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-stone-800 text-base leading-tight">
              {name}
            </h3>
            <p className="text-[11px] text-stone-600/80 mt-0.5">
              {state} · {region} · {seasonText}
            </p>
          </div>
          <span
            className={`shrink-0 px-2 py-0.5 text-[11px] font-semibold rounded-full ${typeBadge}`}
          >
            {typeLabel}
          </span>
        </div>

        {/* Optional details toggle — keeps notes available without cluttering */}
        {notes && (
          <button
            onClick={() => setShowNotes((v) => !v)}
            className="mt-2 text-[11px] text-stone-700/70 hover:text-stone-900"
          >
            {showNotes ? 'Hide details' : 'Show details'}
          </button>
        )}
        {showNotes && notes && (
          <p className="mt-1.5 text-xs text-stone-700 leading-relaxed">{notes}</p>
        )}
      </div>

      {/* Sub-locations — the actionable booking info */}
      <div className="px-5 py-4 flex flex-col gap-2 flex-1">
        {subLocations.map((sub) => (
          <SubLocationRow key={sub.id} sub={sub} tripDate={tripDate} />
        ))}
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
