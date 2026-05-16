const GRADIENTS = [
  'from-emerald-800 to-teal-900',
  'from-green-700 to-emerald-900',
  'from-slate-700 to-green-900',
  'from-stone-600 to-emerald-800',
  'from-teal-700 to-cyan-900',
  'from-green-600 to-slate-800',
  'from-lime-700 to-green-900',
  'from-cyan-700 to-teal-900',
]

function formatReleaseDate(releaseDate) {
  if (!releaseDate) return null
  const d = new Date(releaseDate)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Badge({ zone, groupSize }) {
  const { status, remaining } = zone

  if (status === 'no-quota')
    return (
      <span className="px-2.5 py-1 text-xs font-semibold bg-stone-200 text-stone-500 rounded-full">
        Unavailable
      </span>
    )
  if (status === 'not-released')
    return (
      <span className="px-2.5 py-1 text-xs font-semibold bg-sky-100 text-sky-700 rounded-full">
        Not yet released
      </span>
    )
  if (status === 'no-data' || remaining === null)
    return (
      <span className="px-2.5 py-1 text-xs font-medium bg-stone-100 text-stone-500 rounded-full">
        No data
      </span>
    )
  if (remaining === 0)
    return (
      <span className="px-2.5 py-1 text-xs font-semibold bg-red-500 text-white rounded-full">
        Full
      </span>
    )
  if (remaining < groupSize)
    return (
      <span className="px-2.5 py-1 text-xs font-semibold bg-amber-400 text-amber-900 rounded-full">
        Limited
      </span>
    )
  return (
    <span className="px-2.5 py-1 text-xs font-semibold bg-green-400 text-green-900 rounded-full">
      Available
    </span>
  )
}

export default function TrailheadCard({ zone, groupSize, permitId, selectedDate, imageUrl, gradientIndex }) {
  const { name, description, remaining, total, unlimited, status, releaseDate } = zone
  const gradient = GRADIENTS[gradientIndex % GRADIENTS.length]

  const isUnavailable = status === 'no-quota'
  const isNotReleased = status === 'not-released'
  const isFull = status === 'open' && remaining === 0
  const isDimmed = isUnavailable || isFull
  const isBookable = !isUnavailable && !isNotReleased && !isFull

  const releaseLabel = formatReleaseDate(releaseDate)
  const bookingUrl = `https://www.recreation.gov/permits/${permitId}/registration/detailed-availability?type=permit&date=${selectedDate}`

  let ctaLabel = 'Book on Recreation.gov →'
  if (isUnavailable) ctaLabel = 'No quota on this date'
  else if (isNotReleased) ctaLabel = releaseLabel ? `Releases ${releaseLabel}` : 'Not yet released'
  else if (isFull) ctaLabel = 'Sold Out'

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white flex flex-col transition-shadow duration-200 hover:shadow-md ${
        isDimmed ? 'opacity-60' : ''
      }`}
    >
      {/* Image / gradient header */}
      <div className={`relative h-44 bg-gradient-to-br ${gradient}`}>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        )}
        {/* Overlay so text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between gap-2">
          <h3 className="text-white font-bold text-sm leading-snug drop-shadow">{name}</h3>
          <Badge zone={zone} groupSize={groupSize} />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {description && (
          <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">{description}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-6">
          {isNotReleased ? (
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Remaining quota</p>
              <p className="text-sm font-semibold text-sky-700">
                Releases {releaseLabel || 'soon'}
              </p>
            </div>
          ) : (
            remaining !== null && (
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide">Available</p>
                {unlimited ? (
                  <p className="text-2xl font-bold text-green-600">Unlimited</p>
                ) : (
                  <p
                    className={`text-2xl font-bold ${
                      remaining === 0
                        ? 'text-red-500'
                        : remaining < groupSize
                        ? 'text-amber-500'
                        : 'text-green-600'
                    }`}
                  >
                    {remaining}
                  </p>
                )}
              </div>
            )
          )}
          {total !== null && !unlimited && (
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wide">Daily Quota</p>
              <p className="text-2xl font-bold text-stone-700">{total}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              isBookable
                ? 'bg-green-800 hover:bg-green-700 text-white'
                : 'bg-stone-100 text-stone-400 pointer-events-none'
            }`}
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </div>
  )
}
