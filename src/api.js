const RIDB_KEY = import.meta.env.VITE_RIDB_API_KEY

function isServerOrProxyFailure(status) {
  return status >= 500
}

function isUserFacingNetworkError(err) {
  return err instanceof Error && err.message.startsWith('Unable to reach ')
}

// Accept a full Recreation.gov URL or a bare permit ID number
export function extractPermitId(input) {
  const match = input.match(/(\d+)/)
  return match ? match[1] : null
}

// Fetch all destination zones + their availability for the given month
// Returns null (not throws) if the permit requires auth or uses a different API
export async function getPermitAvailability(permitId, date) {
  const [year, month] = date.split('-')
  const startDate = `${year}-${month}-01T00:00:00.000Z`
  try {
    const res = await fetch(`/recgov/api/permits/${permitId}/availability/month?start_date=${startDate}`)
    if (!res.ok) {
      if (isServerOrProxyFailure(res.status)) {
        throw new Error('Unable to reach Recreation.gov right now. Please try again in a minute.')
      }
      return null
    }
    const data = await res.json()
    // Some NPS permits return a server error body with 200 status
    if (data?.error) return null
    return data
  } catch (err) {
    if (isUserFacingNetworkError(err)) throw err
    throw new Error('Unable to reach Recreation.gov right now. Please try again in a minute.')
  }
}

// Fetch permit/facility details (name, description) from RIDB
export async function getPermitDetails(permitId) {
  if (!RIDB_KEY) return null
  try {
    const res = await fetch(`/ridb/api/v1/facilities/${permitId}?apikey=${RIDB_KEY}`)
    if (!res.ok) {
      if (isServerOrProxyFailure(res.status)) {
        throw new Error('Unable to reach permit details service right now. Please try again shortly.')
      }
      return null
    }
    return res.json()
  } catch {
    throw new Error('Unable to reach permit details service right now. Please try again shortly.')
  }
}

// Fetch division (zone) names from the Recreation.gov permit endpoint.
export async function getPermitDivisions(permitId) {
  try {
    const res = await fetch(`/recgov/api/permits/${permitId}`)
    if (!res.ok) {
      if (isServerOrProxyFailure(res.status)) {
        throw new Error('Unable to reach Recreation.gov right now. Please try again in a minute.')
      }
      return { map: {} }
    }
    const data = await res.json()
    const divisions = data?.payload?.divisions || {}
    return {
      map: Object.fromEntries(
        Object.entries(divisions).map(([id, div]) => [id, div.name || id])
      ),
    }
  } catch (err) {
    if (isUserFacingNetworkError(err)) throw err
    throw new Error('Unable to reach Recreation.gov right now. Please try again in a minute.')
  }
}

// Fetch photos for the permit area from RIDB
export async function getFacilityMedia(permitId) {
  if (!RIDB_KEY) return []
  try {
    const res = await fetch(`/ridb/api/v1/facilities/${permitId}/media?apikey=${RIDB_KEY}`)
    if (!res.ok) {
      if (isServerOrProxyFailure(res.status)) {
        throw new Error('Unable to reach permit media service right now. Please try again shortly.')
      }
      return []
    }
    const data = await res.json()
    return data.RECDATA || []
  } catch (err) {
    if (isUserFacingNetworkError(err)) throw err
    throw new Error('Unable to reach permit media service right now. Please try again shortly.')
  }
}

// ─── permitinyo backend (Yosemite-style wilderness permits) ─────────────────
//
// Yosemite Wilderness (and the Inyo/SEKI/Whitney permits) are not served by
// the /api/permits/{id} endpoints above. They use /api/permitcontent for
// metadata and /api/permitinyo for availability.

// Fetch permit metadata + entry points (divisions) for a permitinyo permit.
export async function getYosemiteContent(permitId) {
  try {
    const res = await fetch(`/recgov/api/permitcontent/${permitId}`)
    if (!res.ok) {
      if (isServerOrProxyFailure(res.status)) {
        throw new Error('Unable to reach Recreation.gov right now. Please try again in a minute.')
      }
      return null
    }
    const data = await res.json()
    return data?.payload || null
  } catch (err) {
    if (isUserFacingNetworkError(err)) throw err
    throw new Error('Unable to reach Recreation.gov right now. Please try again in a minute.')
  }
}

// Fetch month availability for a permitinyo permit. The API only accepts
// whole-calendar-month ranges, so the selected date is expanded to its month.
export async function getYosemiteAvailability(permitId, date) {
  const [year, month] = date.split('-').map(Number)
  const mm = String(month).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  const startDate = `${year}-${mm}-01`
  const endDate = `${year}-${mm}-${lastDay}`
  try {
    const res = await fetch(
      `/recgov/api/permitinyo/${permitId}/availabilityv2?start_date=${startDate}&end_date=${endDate}&commercial_acct=false`
    )
    if (!res.ok) {
      if (isServerOrProxyFailure(res.status)) {
        throw new Error('Unable to reach Recreation.gov right now. Please try again in a minute.')
      }
      return null
    }
    const data = await res.json()
    if (data?.error) return null
    return data?.payload || null
  } catch (err) {
    if (isUserFacingNetworkError(err)) throw err
    throw new Error('Unable to reach Recreation.gov right now. Please try again in a minute.')
  }
}

// ─── permititinerary backend (RMNP-style per-campsite permits) ──────────────
//
// Rocky Mountain NP uses /api/permitcontent for metadata (same as Yosemite)
// but availability is per-division: one HTTP call per campsite. There is no
// bulk endpoint. Each division returns a month of {date: {total, remaining}}.

// Fetch availability for a single division of a permititinerary permit.
async function getPermitItineraryDivisionAvailability(permitId, divisionId, date) {
  const [year, month] = date.split('-').map(Number)
  const res = await fetch(
    `/recgov/api/permititinerary/${permitId}/division/${divisionId}/availability/month?month=${month}&year=${year}`
  )
  if (!res.ok) {
    if (isServerOrProxyFailure(res.status)) {
      throw new Error('Unable to reach Recreation.gov right now. Please try again in a minute.')
    }
    return null
  }
  const data = await res.json()
  return data?.payload || null
}

// Fan out per-division availability calls with a small concurrency cap.
// Returns a { divisionId: payload | null } map; individual failures yield null
// rather than aborting the whole scan.
export async function getPermitItineraryAvailability(permitId, divisionIds, date, concurrency = 10) {
  const results = {}
  let cursor = 0

  async function worker() {
    while (cursor < divisionIds.length) {
      const idx = cursor++
      const divisionId = divisionIds[idx]
      try {
        results[divisionId] = await getPermitItineraryDivisionAvailability(permitId, divisionId, date)
      } catch (err) {
        if (isUserFacingNetworkError(err)) throw err
        results[divisionId] = null
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, divisionIds.length) }, worker)
  await Promise.all(workers)
  return results
}
