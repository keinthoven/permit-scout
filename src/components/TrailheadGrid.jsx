import { useMemo } from 'react'
import TrailheadCard from './TrailheadCard'

export default function TrailheadGrid({
  availability,
  divisions,
  permitName,
  facilityMedia,
  selectedDate,
  groupSize,
  permitId,
  mapImage,
  mapEmbed,
}) {
  const imageUrls = useMemo(
    () =>
      facilityMedia
        .filter((m) => m.URL?.match(/\.(jpg|jpeg|png|webp)/i))
        .map((m) => m.URL),
    [facilityMedia]
  )

  const zones = useMemo(() => {
    const raw = availability?.payload?.availability
    if (!raw) return []

    // API uses date_availability (not availability) and doesn't include zone names
    const sampleDiv = Object.values(raw)[0]
    const dateKey = Object.keys(sampleDiv?.date_availability || {}).find((k) =>
      k.startsWith(selectedDate)
    )

    return Object.values(raw)
      .map((div) => {
        const dayData = dateKey ? div.date_availability?.[dateKey] : null
        return {
          id: div.division_id,
          name: divisions?.[div.division_id] || div.division_id,
          description: '',
          remaining: dayData?.remaining ?? null,
          total: dayData?.total ?? null,
        }
      })
      .sort((a, b) => {
        // Sort: available for group → limited → full → no data
        const rank = (d) => {
          if (d.remaining === null) return 3
          if (d.remaining === 0) return 2
          if (d.remaining < groupSize) return 1
          return 0
        }
        return rank(a) - rank(b) || a.name.localeCompare(b.name)
      })
  }, [availability, selectedDate, groupSize])

  const availableForGroup = zones.filter(
    (z) => z.remaining !== null && z.remaining >= groupSize
  ).length
  const totalZones = zones.length

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
            {formattedDate} · Group of {groupSize} · {totalZones} destination zones
          </p>
        </div>
        <div className="text-left sm:text-right">
          <span className="text-3xl font-bold text-green-700">{availableForGroup}</span>
          <span className="text-stone-500 text-sm">
            {' '}of {totalZones} zones available for your group
          </span>
        </div>
      </div>

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
            className="w-full h-auto block"
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {zones.map((zone, i) => (
            <TrailheadCard
              key={zone.id}
              division={zone}
              groupSize={groupSize}
              permitId={permitId}
              selectedDate={selectedDate}
              imageUrl={imageUrls.length > 0 ? imageUrls[i % imageUrls.length] : null}
              gradientIndex={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
