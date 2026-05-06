import { useState, useMemo } from 'react'
import { AREAS } from '../areas'
import AreaCard from '../components/AreaCard'
import PlannerFilters from '../components/PlannerFilters'

// Sort areas by reservation open date so the most time-sensitive appear first.
// Walk-up areas (no reservationOpens) go to the bottom.
const MONTH_ORDER = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  July: 7, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
}

function reservationSortKey(area) {
  if (!area.reservationOpens) return 99
  const match = area.reservationOpens.match(/([A-Za-z]+)\s+(\d+)/)
  if (!match) return 98
  const month = MONTH_ORDER[match[1]] ?? 50
  const day = parseInt(match[2], 10)
  return month * 100 + day
}

export default function PlannerPage() {
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [permitTypeFilter, setPermitTypeFilter] = useState('')

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
    }).sort((a, b) => reservationSortKey(a) - reservationSortKey(b))
  }, [search, stateFilter, regionFilter, permitTypeFilter])

  const activeFilterCount = [stateFilter, regionFilter, permitTypeFilter, search].filter(Boolean).length

  function clearFilters() {
    setSearch('')
    setStateFilter('')
    setRegionFilter('')
    setPermitTypeFilter('')
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page intro */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-800">Trip Planner</h2>
        <p className="text-stone-500 mt-1 max-w-2xl">
          Reservation windows, quota types, and booking details for popular wilderness areas —
          everything you need to plan around permit season before competition opens up.
        </p>
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

      {/* Results header */}
      <div className="mt-6 mb-4 flex items-center justify-between">
        <p className="text-sm text-stone-500">
          Showing <span className="font-semibold text-stone-700">{filtered.length}</span> of{' '}
          {AREAS.length} areas
          {activeFilterCount > 0 && (
            <span className="text-stone-400"> · {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active</span>
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
      <div className="mb-6 flex flex-wrap gap-3 text-xs">
        {[
          { label: 'Quota', style: 'bg-blue-100 text-blue-800' },
          { label: 'Lottery', style: 'bg-amber-100 text-amber-800' },
          { label: 'Walk-up / Self-Issue', style: 'bg-green-100 text-green-800' },
        ].map(({ label, style }) => (
          <span key={label} className={`px-2.5 py-1 rounded-full font-medium ${style}`}>
            {label}
          </span>
        ))}
        <span className="text-stone-400 self-center">Cards sorted by reservation open date ↓</span>
      </div>

      {/* Area grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((area) => (
            <AreaCard key={area.id} area={area} />
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
        Reservation dates and quota details are based on recent seasons and may change year to year.
        Always confirm current-year information on Recreation.gov or with the managing agency before booking.
      </p>
    </main>
  )
}
