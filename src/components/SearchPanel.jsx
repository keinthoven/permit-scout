import { useState } from 'react'
import { PRESETS } from '../presets'

const MIN_GROUP = 1
const MAX_GROUP = 25

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

  const [groupText, setGroupText] = useState(String(groupSize))

  function handleKeyDown(e) {
    if (e.key === 'Enter') onSearch()
  }

  function commitGroup(value) {
    const clamped = Math.min(MAX_GROUP, Math.max(MIN_GROUP, value))
    setGroupText(String(clamped))
    onGroupSizeChange(clamped)
  }

  function handleGroupChange(e) {
    const raw = e.target.value
    setGroupText(raw)
    const n = parseInt(raw, 10)
    if (!Number.isNaN(n) && n >= MIN_GROUP && n <= MAX_GROUP) {
      onGroupSizeChange(n)
    }
  }

  function handleGroupBlur() {
    const n = parseInt(groupText, 10)
    commitGroup(Number.isNaN(n) ? MIN_GROUP : n)
  }

  function stepGroup(delta) {
    const base = parseInt(groupText, 10)
    commitGroup((Number.isNaN(base) ? groupSize : base) + delta)
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
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 items-start">

        {/* Permit selection */}
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Permit
          </label>
          <select
            value={mode}
            onChange={(e) => handlePermitChange(e.target.value)}
            className="w-full h-[42px] px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent bg-white"
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
            className="w-full h-[42px] px-3 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
          />
        </div>

        {/* Group Size */}
        <div>
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wide mb-1.5">
            Group Size
          </label>
          <div className="flex items-stretch h-[42px] border border-stone-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-green-600 focus-within:border-transparent">
            <button
              type="button"
              onClick={() => stepGroup(-1)}
              disabled={groupSize <= MIN_GROUP}
              aria-label="Decrease group size"
              className="w-10 shrink-0 flex items-center justify-center text-lg text-stone-500 hover:bg-stone-50 disabled:text-stone-300 disabled:hover:bg-transparent"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              value={groupText}
              min={MIN_GROUP}
              max={MAX_GROUP}
              onChange={handleGroupChange}
              onBlur={handleGroupBlur}
              onKeyDown={handleKeyDown}
              className="no-spinner min-w-0 flex-1 text-center text-sm border-x border-stone-200 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => stepGroup(1)}
              disabled={groupSize >= MAX_GROUP}
              aria-label="Increase group size"
              className="w-10 shrink-0 flex items-center justify-center text-lg text-stone-500 hover:bg-stone-50 disabled:text-stone-300 disabled:hover:bg-transparent"
            >
              +
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col">
          {/* Spacer to align button with the other inputs (matches label height) */}
          <div className="hidden sm:block h-[22px]" aria-hidden="true" />
          <button
            onClick={onSearch}
            disabled={loading}
            className="h-[42px] px-6 bg-green-800 hover:bg-green-700 disabled:bg-stone-300 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {loading ? 'Scanning…' : 'Search'}
          </button>
        </div>

      </div>
    </div>
  )
}
