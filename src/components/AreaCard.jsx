import { PERMIT_TYPE_LABELS } from '../areas'

const PERMIT_TYPE_STYLES = {
  quota: 'bg-blue-100 text-blue-800',
  lottery: 'bg-amber-100 text-amber-800',
  'first-come': 'bg-purple-100 text-purple-800',
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

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-stone-400 shrink-0 w-36">{label}</span>
      <span className="text-stone-700 font-medium">{value}</span>
    </div>
  )
}

export default function AreaCard({ area }) {
  const {
    name, state, region, managing, permitType, season, reservationOpens,
    bookingHorizon, dailyQuota, recGovId, notes,
  } = area

  const gradient = REGION_GRADIENTS[region] || 'from-green-700 to-stone-800'
  const typeLabel = PERMIT_TYPE_LABELS[permitType]
  const typeBadge = PERMIT_TYPE_STYLES[permitType] || 'bg-stone-100 text-stone-600'

  const seasonText = season.end
    ? `${season.start} – ${season.end}`
    : season.start

  const recGovUrl = recGovId
    ? `https://www.recreation.gov/permits/${recGovId}`
    : null

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Header bar */}
      <div className={`bg-gradient-to-br ${gradient} px-5 py-4`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-white font-bold text-base leading-snug drop-shadow">{name}</h3>
            <p className="text-white/70 text-xs mt-0.5">{state} · {region}</p>
          </div>
          <span className={`shrink-0 mt-0.5 px-2.5 py-1 text-xs font-semibold rounded-full ${typeBadge}`}>
            {typeLabel}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col gap-2.5 flex-1">
        <InfoRow label="Managed by" value={managing} />
        <InfoRow label="Season" value={seasonText} />
        <InfoRow
          label="Reservations open"
          value={reservationOpens ?? 'Walk-up / self-issue only'}
        />
        {bookingHorizon && <InfoRow label="Booking window" value={bookingHorizon} />}
        {dailyQuota && <InfoRow label="Daily quota" value={dailyQuota} />}

        {notes && (
          <p className="text-xs text-stone-500 leading-relaxed mt-1 pt-2 border-t border-stone-100">
            {notes}
          </p>
        )}

        {/* Footer actions */}
        <div className="mt-auto pt-3 flex gap-2">
          {recGovUrl ? (
            <a
              href={recGovUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-green-800 hover:bg-green-700 text-white transition-colors"
            >
              Book on Recreation.gov →
            </a>
          ) : (
            <div className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium bg-stone-100 text-stone-400">
              No online booking
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
