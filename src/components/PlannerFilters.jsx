import { STATES, REGIONS, PERMIT_TYPE_LABELS } from '../areas'

export default function PlannerFilters({ search, onSearch, state, onState, region, onRegion, permitType, onPermitType }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-base font-semibold text-stone-700 mb-4">Filter Areas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-4 items-start">

        {/* Text search */}
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Area name, state, or keyword…"
            className="w-full h-[42px] px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            State
          </label>
          <select
            value={state}
            onChange={(e) => onState(e.target.value)}
            className="h-[42px] px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
          >
            <option value="">All States</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Region */}
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Region
          </label>
          <select
            value={region}
            onChange={(e) => onRegion(e.target.value)}
            className="h-[42px] px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
          >
            <option value="">All Regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Permit type */}
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Permit Type
          </label>
          <select
            value={permitType}
            onChange={(e) => onPermitType(e.target.value)}
            className="h-[42px] px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
          >
            <option value="">All Types</option>
            {Object.entries(PERMIT_TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  )
}
