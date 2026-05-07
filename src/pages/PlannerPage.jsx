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
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-stone-800">Trip Planner</h2>
        <p className="text-stone-500 mt-1 max-w-2xl text-sm">
          Pick a trip date and see exactly when each permit becomes bookable.
        </p>
      </div>

      {/* Soft sage hero with target trip date input */}
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-emerald-700 mb-1.5">
              Target trip date
            </label>
            <input
              type="date"
              value={tripDate}
              min={today}
              onChange={(e) => setTripDate(e.target.value)}
              className="w-full sm:w-64 h-[40px] px-3 text-sm border border-emerald-200 bg-white rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
            />
          </div>
          {tripDate && (
            <button
              onClick={() => setTripDate('')}
              className="h-[40px] px-3 rounded-xl text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {tripDate && (
          <p className="mt-3 text-xs text-emerald-800">
            Booking dates for{' '}
            <span className="font-semibold">
              {new Date(tripDate + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            . Sorted by urgency.
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

      {/* Color legend */}
      <div className="mb-5 bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-3">
          Color guide
        </p>
        <div className="flex flex-col gap-2.5">
          {/* Permit type — top-right badge on each card */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-stone-500 font-medium w-32 shrink-0">
              Permit type
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800">
              Quota
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800">
              Lottery
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
              Walk-up / Self-Issue
            </span>
          </div>

          {/* Region — pastel gradient on the card header */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-stone-500 font-medium w-32 shrink-0">
              Card header (region)
            </span>
            {[
              ['Sierra Nevada', 'from-emerald-100 to-teal-200'],
              ['Bay Area / Coast', 'from-cyan-100 to-sky-200'],
              ['Northern California', 'from-orange-100 to-rose-200'],
              ['Pacific Northwest', 'from-green-100 to-emerald-200'],
              ['Rocky Mountains', 'from-slate-100 to-blue-200'],
              ['Southwest', 'from-amber-100 to-orange-200'],
              ['Midwest', 'from-teal-100 to-cyan-200'],
              ['Northern Rockies', 'from-stone-100 to-amber-100'],
            ].map(([label, gradient]) => (
              <span
                key={label}
                className={`px-2 py-0.5 rounded-full font-semibold text-stone-800 bg-gradient-to-br ${gradient}`}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Urgency — booking rows + map polygons */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-stone-500 font-medium w-32 shrink-0">
              Booking urgency
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-rose-200 text-rose-900">
              Act now (≤ 7 days)
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-amber-200 text-amber-900">
              Soon (≤ 30 days)
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-sky-200 text-sky-900">
              Later
            </span>
            <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-200 text-emerald-900">
              Open now
            </span>
            {!tripDate && (
              <span className="text-stone-400 italic ml-1">
                — set a trip date to activate
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Area grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((area) => (
            <div
              key={area.id}
              id={`area-card-${area.id}`}
              className={`scroll-mt-6 transition-all duration-500 ${
                highlightedAreaId === area.id
                  ? 'ring-4 ring-emerald-300 ring-offset-2 rounded-2xl'
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
