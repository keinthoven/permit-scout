// Normalizes availability data from all Recreation.gov permit backends into a
// single `zone` shape the Permit Checker UI renders:
//
//   { id, code, name, description, remaining, total, status, releaseDate,
//     quotaUnit, capacityLabel? }
//
// status:
//   'open'         — released; remaining/total are live counts
//   'not-released' — quota exists but the remaining portion is not yet on sale
//                    (carries releaseDate)
//   'no-quota'     — no quota for the selected date (permitinyo omits the cell)
//   'no-data'      — availability not reported (legacy /api/permits backend)
//
// quotaUnit:
//   'entries' — total/remaining are daily entry slots for groups (Yosemite,
//               Inyo, Desolation, Central Cascades — the default).
//   'sites'   — total/remaining are physical campsites at a fixed location
//               (RMNP). Each site has its own capacity; see capacityLabel.

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
      quotaUnit: 'entries',
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
      quotaUnit: 'entries',
    })
  }

  zones.sort((a, b) => a.viewOrder - b.viewOrder || a.name.localeCompare(b.name))
  return zones
}

// Extract a human-readable capacity caption from an RMNP division description.
// Source descriptions contain HTML like:
//   "<p>Number of Sites: 2 (1-7 people per site)</p>"
//   "<p>Number of Sites:  1 Group site (8-12 people)</p>"
// We return just the parenthetical capacity (e.g. "1–7 people per site").
function extractRmnpCapacity(description) {
  if (!description) return null
  // [^(<]* keeps us inside the same "<p>Number of Sites: ...</p>" element —
  // some divisions omit the parenthetical, and without the < bound we'd
  // wander into an Elevation paragraph further down.
  const match = description.match(/Number of Sites:\s*\d+[^(<]*\(([^)]+)\)/i)
  if (!match) return null
  return match[1].trim().replace(/(\d)-(\d)/g, '$1–$2')
}

// permititinerary backend (RMNP wilderness camping).
//
// `perDivisionAvailability` is the { divisionId: payload | null } map produced
// by getPermitItineraryAvailability. Each payload's quota_type_maps has one
// usage map (typically ConstantQuotaUsageDaily) keyed by date.
export function normalizeRmnp(content, perDivisionAvailability, selectedDate) {
  const divisions = content?.divisions || {}
  const zones = []

  for (const [internalId, div] of Object.entries(divisions)) {
    if (div.is_hidden) continue

    const payload = perDivisionAvailability?.[internalId]
    let status, remaining, total, releaseDate

    if (!payload) {
      // Either the call failed or no quota maps exist for this division.
      status = 'no-data'
      remaining = null
      total = null
      releaseDate = null
    } else {
      const quotaMaps = payload.quota_type_maps || {}
      const firstMap = Object.values(quotaMaps)[0] || {}
      const cell = firstMap[selectedDate]
      if (!cell) {
        status = 'no-quota'
        remaining = null
        total = null
        releaseDate = null
      } else {
        remaining = cell.remaining ?? null
        total = cell.total ?? null
        status = 'open'
        releaseDate = null
      }
    }

    const isGroupSite = /\bGroup\b/i.test(div.name || '')

    zones.push({
      id: internalId,
      code: div.code || internalId,
      name: div.name || div.code || internalId,
      description: '',
      remaining,
      total,
      status,
      releaseDate,
      district: div.district || null,
      quotaUnit: 'sites',
      capacityLabel: extractRmnpCapacity(div.description),
      isGroupSite,
      viewOrder: div.view_order ?? 9999,
    })
  }

  // Group by district, then by name within district.
  zones.sort(
    (a, b) =>
      (a.district || '').localeCompare(b.district || '') ||
      a.name.localeCompare(b.name)
  )
  return zones
}
