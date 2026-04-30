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

  function handleKeyDown(e) {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
      <h2 className="text-base font-semibold text-stone-700 mb-4">Find Available Permits</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">

        {/* Permit ID */}
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Permit ID or URL
          </label>
          <input
            type="text"
            value={permitInput}
            onChange={(e) => onPermitInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 233261"
            className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
          <p className="text-xs text-stone-400 mt-1">
            Found in the Recreation.gov permit URL
          </p>
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

        {/* Group Size + Search */}
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Group Size
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={groupSize}
              min={1}
              max={25}
              onChange={(e) => onGroupSizeChange(Math.max(1, parseInt(e.target.value) || 1))}
              onKeyDown={handleKeyDown}
              className="w-20 px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
            <button
              onClick={onSearch}
              disabled={loading}
              className="flex-1 py-2.5 px-5 bg-green-800 hover:bg-green-700 disabled:bg-stone-300 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {loading ? 'Scanning…' : 'Search'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
