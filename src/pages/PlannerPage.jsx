import { useState, useMemo, useCallback } from 'react'
import { AREAS } from '../areas'
import AreaCard, { areaUrgency } from '../components/AreaCard'
import PlannerFilters from '../components/PlannerFilters'
import RegionMap from '../components/RegionMap'

const URGENCY_RANK = { critical: 0, soon: 1, later: 2, none: 3 }

export default function PlannerPage() {
  const [tripDate, setTripDate] = useState('')
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [permitTypeFilter, setPermitTypeFilter] = useState('')
  const [highlightedAreaId, setHighlightedAreaId] = useState(null)

  const handleRegionClick = useCallback((areaId) => {
    const el = document.getElementById(`area-card-${areaId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setHighlightedAreaId(areaId)
    setTimeout(() => setHighlightedAreaId((curr) => (curr === areaId ? null : curr)), 2200)
  }, [])

  const today = new Date().toISOString().split('T')[0]

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return AREAS.filter((area) => {
      if (stateFilter && area.state !== stateFilter) return false
      if (regionFilter && area.region !== regionFilter) return false
      if (permitTypeFilter && area.permitType !== permitTypeFilter) return false
      if (q) {
        const haystack = [area.name, area.state, area.region, area.managing, ...(area.tags ?? [])]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    }).sort((a, b) => {
      // Sort by most-urgent sub-location first when a trip date is set
      const ua = areaUrgency(a, tripDate)
      const ub = areaUrgency(b, tripDate)
      if (URGENCY_RANK[ua] !== URGENCY_RANK[ub]) return URGENCY_RANK[ua] - URGENCY_RANK[ub]
      return a.name.localeCompare(b.name)
    })
  }, [search, stateFilter, regionFilter, permitTypeFilter, tripDate])

  const activeFilterCount =
    [stateFilter, regionFilter, permitTypeFilter, search].filter(Boolean).length

  function clearFilters() {
    setSearch('')
    setStateFilter('')
    setRegionFilter('')
    setPermitTypeFilter('')
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page intro */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800">Trip Planner</h2>
        <p className="text-stone-500 mt-1 max-w-2xl">
          Reservation windows, lottery dates, and "when do I need to book?" guidance for
          popular wilderness areas — all in one place.
        </p>
      </div>

      {/* Trip date input — the core "when should I book?" feature */}
      <div className="bg-gradient-to-br from-green-900 to-emerald-800 rounded-2xl p-6 mb-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wide text-green-200 mb-1.5">
              Target trip date
            </label>
            <p className="text-xs text-green-200/80 mb-2">
              Enter a date and we'll calculate when you need to book each permit.
            </p>
            <input
              type="date"
              value={tripDate}
              min={today}
              onChange={(e) => setTripDate(e.target.value)}
              className="w-full sm:w-64 h-[42px] px-3 text-sm border border-white/20 bg-white/10 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white focus:text-stone-800 [color-scheme:dark]"
            />
          </div>
          {tripDate && (
            <button
              onClick={() => setTripDate('')}
              className="h-[42px] px-4 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 transition-colors"
            >
              Clear trip date
            </button>
          )}
        </div>
        {tripDate && (
          <p className="mt-4 text-sm text-green-100">
            Showing booking dates for{' '}
            <span className="font-semibold text-white">
              {new Date(tripDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            . Areas sorted by urgency.
          </p>
        )}
      </div>

      <PlannerFilters
        search={search}
        onSearch={setSearch}
        state={stateFilter}
        onState={setStateFilter}
        region={regionFilter}
        onRegion={setRegionFilter}
        permitType={permitTypeFilter}
        onPermitType={setPermitTypeFilter}
      />

      {/* Interactive region map — click a shaded region to scroll to its card */}
      <div className="mt-6">
        <RegionMap
          areas={AREAS}
          filteredAreas={filtered}
          tripDate={tripDate}
          onRegionClick={handleRegionClick}
        />
        <p className="mt-2 text-xs text-stone-400 text-center">
          Click a shaded region to jump to its details. Filtered-out areas are dimmed.
        </p>
      </div>

      {/* Results header */}
      <div className="mt-6 mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500">
          Showing <span className="font-semibold text-stone-700">{filtered.length}</span> of{' '}
          {AREAS.length} areas
          {activeFilterCount > 0 && (
            <span className="text-stone-400">
              {' · '}
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </span>
          )}
        </p>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-green-700 hover:text-green-900 font-medium underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Legend */}
      {tripDate && (
        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full font-medium bg-red-500 text-white">
            Act now (≤ 7 days)
          </span>
          <span className="px-2.5 py-1 rounded-full font-medium bg-amber-400 text-amber-900">
            Soon (≤ 30 days)
          </span>
          <span className="px-2.5 py-1 rounded-full font-medium bg-blue-400 text-white">
            Later
          </span>
          <span className="px-2.5 py-1 rounded-full font-medium bg-green-500 text-white">
            Open now
          </span>
        </div>
      )}

      {/* Area grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((area) => (
            <div
              key={area.id}
              id={`area-card-${area.id}`}
              className={`scroll-mt-6 transition-all duration-500 ${
                highlightedAreaId === area.id
                  ? 'ring-4 ring-green-500 ring-offset-2 rounded-2xl'
                  : ''
              }`}
            >
              <AreaCard area={area} tripDate={tripDate} />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-20 text-center text-stone-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-stone-500">No areas match your filters.</p>
          <button
            onClick={clearFilters}
            className="mt-3 text-sm text-green-700 hover:text-green-900 font-medium underline underline-offset-2"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-12 text-center text-xs text-stone-400 max-w-2xl mx-auto">
        Booking windows and lottery dates change year to year. Always confirm current
        information on Recreation.gov or with the managing agency before relying on these dates.
      </p>
    </main>
  )
}
