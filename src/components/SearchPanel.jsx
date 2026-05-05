import { PRESETS } from '../presets'

export default function SearchPanel({
  permitInput,
  onPermitInputChange,
  selectedDate,
  onDateChange,
  groupSize,
  onGroupSizeChange,
  onSearch,
  loading,
}) {
  const today = new Date().toISOString().split('T')[0]
  const matchedPreset = PRESETS.find((p) => p.id === permitInput)
  const mode = matchedPreset ? matchedPreset.id : 'custom'

  function handleKeyDown(e) {
    if (e.key === 'Enter') onSearch()
  }

  function handlePermitChange(value) {
    if (value === 'custom') {
      onPermitInputChange('')
    } else {
      onPermitInputChange(value)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-base font-semibold text-stone-700 mb-4">Find Available Permits</h2>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-start">

        {/* Permit selection */}
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Permit
          </label>
          <select
            value={mode}
            onChange={(e) => handlePermitChange(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
            <option value="custom">Other (enter permit ID or URL)</option>
          </select>
          {mode === 'custom' && (
            <>
              <input
                type="text"
                value={permitInput}
                onChange={(e) => onPermitInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 233261"
                className="w-full mt-2 px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              <p className="text-xs text-stone-400 mt-1">
                Found in the Recreation.gov permit URL
              </p>
            </>
          )}
        </div>

        {/* Entry Date */}
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Entry Date
          </label>
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => onDateChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {/* Group Size */}
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Group Size
          </label>
          <input
            type="number"
            value={groupSize}
            min={1}
            max={25}
            onChange={(e) => onGroupSizeChange(Math.max(1, parseInt(e.target.value) || 1))}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {/* Search */}
        <div className="flex flex-col">
          {/* Spacer to align button with the other inputs (matches label height) */}
          <div className="hidden sm:block h-[22px]" aria-hidden="true" />
          <button
            onClick={onSearch}
            disabled={loading}
            className="py-2.5 px-6 bg-green-800 hover:bg-green-700 disabled:bg-stone-300 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Scanning…' : 'Search'}
          </button>
        </div>

      </div>
    </div>
  )
}
