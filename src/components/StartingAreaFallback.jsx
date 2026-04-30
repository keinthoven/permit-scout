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

export default function StartingAreaFallback({ permitId, permitName, entrances, facilityMedia, selectedDate }) {
  const imageUrls = facilityMedia
    .filter((m) => m.URL?.match(/\.(jpg|jpeg|png|webp)/i))
    .map((m) => m.URL)

  const formattedDate = selectedDate
    ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })
    : ''

  const bookingUrl = `https://www.recreation.gov/permits/${permitId}/registration/detailed-availability`

  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">{permitName || `Permit ${permitId}`}</h2>
          {formattedDate && <p className="text-stone-500 text-sm mt-1">{formattedDate}</p>}
        </div>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-800 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          View Full Availability on Recreation.gov →
        </a>
      </div>

      {/* Info banner */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex gap-3">
        <span className="text-lg">🔒</span>
        <div>
          <p className="font-semibold">Live availability requires sign-in for this permit</p>
          <p className="mt-0.5 text-amber-700">
            This NPS backcountry permit locks its availability data behind a Recreation.gov login.
            Below are all {entrances.length} starting areas — click any card or use the button above to view real-time availability and book.
          </p>
        </div>
      </div>

      {/* Starting area cards */}
      {entrances.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {entrances.map((entrance, i) => {
            const imageUrl = imageUrls.length > 0 ? imageUrls[i % imageUrls.length] : null
            const gradient = GRADIENTS[i % GRADIENTS.length]
            return (
              <a
                key={entrance.id}
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white hover:shadow-md transition-shadow duration-200 flex flex-col group"
              >
                {/* Image / gradient */}
                <div className={`relative h-40 bg-gradient-to-br ${gradient}`}>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={entrance.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-white font-bold text-sm leading-snug drop-shadow">{entrance.name}</h3>
                  </div>
                </div>

                {/* CTA */}
                <div className="p-3 mt-auto">
                  <div className="w-full text-center py-2 rounded-xl text-sm font-semibold bg-green-800 group-hover:bg-green-700 text-white transition-colors">
                    Check Availability →
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-stone-400">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="font-medium">No starting area data found.</p>
          <a href={bookingUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-green-700 hover:underline text-sm">
            View on Recreation.gov →
          </a>
        </div>
      )}
    </div>
  )
}
