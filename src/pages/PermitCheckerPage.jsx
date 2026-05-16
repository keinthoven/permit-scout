import { useState, useCallback } from 'react'
import SearchPanel from '../components/SearchPanel'
import TrailheadGrid from '../components/TrailheadGrid'
import {
  extractPermitId,
  getPermitAvailability,
  getPermitDetails,
  getPermitDivisions,
  getFacilityMedia,
  getYosemiteContent,
  getYosemiteAvailability,
} from '../api'
import { getPreset } from '../presets'
import { normalizeRecgov, normalizeYosemite } from '../normalize'

export default function PermitCheckerPage() {
  const [permitInput, setPermitInput] = useState('233261')
  const [selectedDate, setSelectedDate] = useState('')
  const [groupSize, setGroupSize] = useState(1)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activePermitId, setActivePermitId] = useState(null)

  const handleSearch = useCallback(async () => {
    const permitId = extractPermitId(permitInput)
    if (!permitId) {
      setError('Please enter a valid permit ID or Recreation.gov permit URL.')
      return
    }
    if (!selectedDate) {
      setError('Please select an entry date.')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const preset = getPreset(permitId)

      if (preset?.apiType === 'permitinyo') {
        const [content, availability] = await Promise.all([
          getYosemiteContent(permitId),
          getYosemiteAvailability(permitId, selectedDate),
        ])

        if (!content) {
          setError('Permit not found. Double-check your permit ID.')
          return
        }

        setResults({
          zones: availability ? normalizeYosemite(content, availability, selectedDate) : null,
          permitName: content.name,
          media: (preset.images || []).map((url) => ({ url })),
          mapImage: preset.mapImage || null,
          mapEmbed: preset.mapEmbed || null,
          showFilters: true,
          accessible: !!availability,
        })
        setActivePermitId(permitId)
      } else {
        const [availability, details, divisions, media] = await Promise.all([
          getPermitAvailability(permitId, selectedDate),
          getPermitDetails(permitId),
          getPermitDivisions(permitId),
          getFacilityMedia(permitId),
        ])

        const hasZones = divisions?.map && Object.keys(divisions.map).length > 0
        if (!details && !hasZones && !availability) {
          setError('Permit not found. Double-check your permit ID.')
          return
        }

        setResults({
          zones: availability ? normalizeRecgov(availability, divisions?.map, selectedDate) : null,
          permitName: details?.FacilityName,
          media: media || [],
          mapImage: preset?.mapImage || null,
          mapEmbed: preset?.mapEmbed || null,
          showFilters: false,
          accessible: !!availability,
        })
        setActivePermitId(permitId)
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [permitInput, selectedDate])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SearchPanel
        permitInput={permitInput}
        onPermitInputChange={setPermitInput}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        groupSize={groupSize}
        onGroupSizeChange={setGroupSize}
        onSearch={handleSearch}
        loading={loading}
      />

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="mt-20 flex flex-col items-center gap-4 text-stone-400">
          <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Scanning all destination zones…</p>
        </div>
      )}

      {results && !loading && results.accessible && (
        <TrailheadGrid
          zones={results.zones || []}
          permitName={results.permitName}
          facilityMedia={results.media}
          selectedDate={selectedDate}
          groupSize={groupSize}
          permitId={activePermitId}
          mapImage={results.mapImage}
          mapEmbed={results.mapEmbed}
          showFilters={results.showFilters}
        />
      )}

      {results && !loading && !results.accessible && (
        <div className="mt-20 text-center text-stone-400">
          <p className="text-4xl mb-3">🔒</p>
          <p className="font-medium text-stone-500">Availability data is not accessible for this permit.</p>
          <p className="text-sm mt-2">Try a different permit ID or check Recreation.gov directly.</p>
        </div>
      )}

      {!results && !loading && !error && (
        <div className="mt-20 text-center text-stone-400">
          <p className="text-5xl mb-4">🌲</p>
          <p className="text-lg font-medium text-stone-500">
            Enter a permit ID, date, and group size to get started.
          </p>
          <p className="text-sm mt-2 max-w-md mx-auto">
            Paste a Recreation.gov permit URL or just the ID number — the app scans every
            destination zone and shows availability on one screen.
          </p>
        </div>
      )}

      <footer className="mt-16 pb-4 text-center text-xs text-stone-400">
        Heads up: Permit Checker works with trailhead- and entry-point-based wilderness permits — like Yosemite, Desolation, and the Central Cascades — where Recreation.gov has you choose a starting zone.
      </footer>
    </main>
  )
}
