import { useMemo, useState } from 'react'
import TrailheadCard from './TrailheadCard'

// Sort rank: available for group → limited → full → not-released → no data.
function rankZone(zone, groupSize) {
  if (zone.status === 'no-quota' || zone.status === 'no-data') return 4
  if (zone.status === 'not-released') return 3
  if (zone.remaining === 0) return 2
  if (zone.remaining !== null && zone.remaining < groupSize) return 1
  return 0
}

export default function TrailheadGrid({
  zones,
  permitName,
  facilityMedia,
  selectedDate,
  groupSize,
  permitId,
  mapImage,
  mapEmbed,
  showFilters,
}) {
  const [search, setSearch] = useState('')
  const [showUnavailable, setShowUnavailable] = useState(false)

  const imageUrls = useMemo(
    () =>
      (facilityMedia || [])
        .map((m) => m.URL || m.url)
        .filter((url) => url && /\.(jpg|jpeg|png|webp)/i.test(url)),
    [facilityMedia]
  )

  const sorted = useMemo(
    () =>
      [...zones].sort(
        (a, b) => rankZone(a, groupSize) - rankZone(b, groupSize) || a.name.localeCompare(b.name)
      ),
    [zones, groupSize]
  )

  const query = search.trim().toLowerCase()
  const searched = query
    ? sorted.filter((z) => z.name.toLowerCase().includes(query))
    : sorted

  // "no-quota" entry points (no quota at all for the selected date) are hidden
  // behind a toggle; everything else renders in the main grid.
  const available = searched.filter((z) => z.status !== 'no-quota')
  const unavailable = searched.filter((z) => z.status === 'no-quota')

  const availableForGroup = zones.filter(
    (z) => z.status === 'open' && z.remaining !== null && z.remaining >= groupSize
  ).length
  const totalZones = zones.length
  const noun = showFilters ? 'entry points' : 'destination zones'

  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mt-10">
      {/* Summary header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">
            {permitName || `Permit ${permitId}`}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {formattedDate} · Group of {groupSize} · {totalZones} {noun}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-3xl font-bold text-green-700">{availableForGroup}</span>
          <span className="text-stone-500 text-sm">
            {' '}of {totalZones} {noun} available for your group
          </span>
        </div>
      </div>

      {/* Search (entry-point heavy permits only) */}
      {showFilters && (
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entry points by name…"
            className="w-full sm:max-w-sm h-[42px] px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>
      )}

      {/* Zone map (only for presets that include one). Interactive embed
          takes precedence over static image. */}
      {mapEmbed ? (
        <div className="mb-8 rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm">
          <iframe
            src={mapEmbed}
            title={`${permitName || 'Permit'} zone map`}
            className="w-full block aspect-[16/10]"
            loading="lazy"
          />
        </div>
      ) : mapImage ? (
        <div className="mb-8 rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-sm">
          <img
            src={mapImage}
            alt={`${permitName || 'Permit'} zone map`}
            className="max-h-[78vh] w-auto mx-auto block"
          />
        </div>
      ) : null}

      {zones.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-lg font-medium">No zone data found.</p>
          <p className="text-sm mt-1">
            Try a different date or check that the permit ID is correct.
          </p>
        </div>
      ) : available.length === 0 && unavailable.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-medium">No entry points match “{search.trim()}”.</p>
        </div>
      ) : available.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-lg font-medium">No entry points are open for this date.</p>
          <p className="text-sm mt-1 max-w-md mx-auto">
            Permits release 24 weeks to 3 days before the entry date. Try a date at least 3 days out.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {available.map((zone, i) => (
            <TrailheadCard
              key={zone.id}
              zone={zone}
              groupSize={groupSize}
              permitId={permitId}
              selectedDate={selectedDate}
              imageUrl={imageUrls.length > 0 ? imageUrls[i % imageUrls.length] : null}
              gradientIndex={i}
            />
          ))}
        </div>
      )}

      {/* Unavailable entry points — hidden behind a toggle */}
      {showFilters && unavailable.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowUnavailable((v) => !v)}
            className="text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors"
          >
            {showUnavailable ? '▾' : '▸'} {showUnavailable ? 'Hide' : 'Show'} {unavailable.length}{' '}
            unavailable entry point{unavailable.length === 1 ? '' : 's'}
          </button>
          {showUnavailable && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {unavailable.map((zone, i) => (
                <TrailheadCard
                  key={zone.id}
                  zone={zone}
                  groupSize={groupSize}
                  permitId={permitId}
                  selectedDate={selectedDate}
                  imageUrl={null}
                  gradientIndex={i}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
