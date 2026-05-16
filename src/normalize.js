// Normalizes availability data from both Recreation.gov permit backends into a
// single `zone` shape the Permit Checker UI renders:
//
//   { id, code, name, description, remaining, total, status, releaseDate }
//
// status:
//   'open'         — released; remaining/total are live counts
//   'not-released' — quota exists but the remaining portion is not yet on sale
//                    (carries releaseDate)
//   'no-quota'     — no quota for the selected date (permitinyo omits the cell)
//   'no-data'      — availability not reported (legacy /api/permits backend)

// Legacy /api/permits backend (Desolation, Central Cascades, …).
export function normalizeRecgov(availability, divisions, selectedDate) {
  const raw = availability?.payload?.availability
  if (!raw) return []

  // The API keys date_availability by full timestamp, not the bare date.
  const sampleDiv = Object.values(raw)[0]
  const dateKey = Object.keys(sampleDiv?.date_availability || {}).find((k) =>
    k.startsWith(selectedDate)
  )

  return Object.values(raw).map((div) => {
    const dayData = dateKey ? div.date_availability?.[dateKey] : null
    const remaining = dayData?.remaining ?? null
    return {
      id: div.division_id,
      code: div.division_id,
      name: divisions?.[div.division_id] || div.division_id,
      description: '',
      remaining,
      total: dayData?.total ?? null,
      status: remaining === null ? 'no-data' : 'open',
      releaseDate: null,
    }
  })
}

// Recreation.gov reports this sentinel value for entry points with no quota
// cap (self-issue trailheads); it should display as "Unlimited", not a number.
const UNLIMITED_QUOTA = 999999

// permitinyo backend (Yosemite Wilderness, …). `availability` is the payload
// from getYosemiteAvailability: a { date: { divisionId: cell } } map.
export function normalizeYosemite(content, availability, selectedDate) {
  const divisions = content?.divisions || {}
  const dayMap = availability?.[selectedDate] || {}
  const zones = []

  for (const [internalId, div] of Object.entries(divisions)) {
    // is_hidden covers winter-only trailheads and non-public admin entries.
    if (div.is_hidden) continue

    const cell = dayMap[internalId]
    let status, remaining, total, releaseDate
    let unlimited = false

    if (!cell) {
      status = 'no-quota'
      remaining = null
      total = null
      releaseDate = null
    } else {
      const quota = cell.quota_usage_by_member_daily || {}
      remaining = quota.remaining ?? null
      total = quota.total ?? null
      unlimited = total !== null && total >= UNLIMITED_QUOTA
      if (cell.not_yet_released) {
        status = 'not-released'
        releaseDate = cell.release_date || null
      } else {
        status = 'open'
        releaseDate = null
      }
    }

    zones.push({
      id: internalId,
      code: div.code || internalId,
      name: div.name || div.code || internalId,
      description: '',
      remaining,
      total,
      unlimited,
      status,
      releaseDate,
      viewOrder: div.view_order ?? 9999,
    })
  }

  zones.sort((a, b) => a.viewOrder - b.viewOrder || a.name.localeCompare(b.name))
  return zones
}
