// Computes "when do I need to book?" for a given booking window rule
// and an optional target trip date.
//
// Returns a normalized result shape that the UI can render directly:
// {
//   type: 'rolling' | 'lottery' | 'seasonal-release' | 'self-issue',
//   status: 'past' | 'open-now' | 'upcoming' | 'walk-up' | 'no-trip-date'
//                    | 'unknown',
//   bookOnLabel: string,    // human-readable "when to book"
//   bookOnDetail: string,   // sub-line with time/timezone or extra context
//   daysUntil: number|null, // days from today until the action moment
//   urgency: 'critical'|'soon'|'later'|'none', // for color-coding
// }

const MS_PER_DAY = 24 * 60 * 60 * 1000

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function daysBetween(from, to) {
  return Math.round((startOfDay(to) - startOfDay(from)) / MS_PER_DAY)
}

function urgencyFromDays(days) {
  if (days == null) return 'none'
  if (days < 0) return 'none'
  if (days <= 7) return 'critical'
  if (days <= 30) return 'soon'
  return 'later'
}

function formatLongDate(d) {
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function timezoneAbbr(timezone, date) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short',
    }).formatToParts(date)
    return parts.find((p) => p.type === 'timeZoneName')?.value || ''
  } catch {
    return ''
  }
}

function formatTimeWithTz(timeStr, timezone, date) {
  // timeStr like "07:00"
  const [h, m] = timeStr.split(':').map(Number)
  const hh = ((h + 11) % 12) + 1
  const ampm = h < 12 ? 'AM' : 'PM'
  const tz = timezoneAbbr(timezone, date)
  return `${hh}:${m.toString().padStart(2, '0')} ${ampm} ${tz}`.trim()
}

// ─── Rolling release ────────────────────────────────────────────────────────
function calcRolling(bw, tripDate, today) {
  if (!tripDate) {
    return {
      type: 'rolling',
      status: 'no-trip-date',
      bookOnLabel: `${bw.windowDays}-day rolling window`,
      bookOnDetail: `Opens ${formatTimeWithTz(bw.releaseTime, bw.timezone, today)}, ${bw.windowDays} days before each trip date.`,
      daysUntil: null,
      urgency: 'none',
    }
  }

  const trip = startOfDay(tripDate)
  const bookOn = new Date(trip.getTime() - bw.windowDays * MS_PER_DAY)
  const days = daysBetween(today, bookOn)

  let status = 'upcoming'
  if (days < 0) status = 'open-now'

  return {
    type: 'rolling',
    status,
    bookOnLabel: status === 'open-now'
      ? `Open now (since ${formatLongDate(bookOn)})`
      : `Book ${formatLongDate(bookOn)}`,
    bookOnDetail: `${formatTimeWithTz(bw.releaseTime, bw.timezone, bookOn)} • ${bw.windowDays}-day rolling`,
    daysUntil: days,
    urgency: urgencyFromDays(days),
  }
}

// ─── Lottery ────────────────────────────────────────────────────────────────
function calcLottery(bw, tripDate, today) {
  // Lottery dates are usually descriptive strings (e.g. "February 15").
  // We don't always have a parseable year, so we do best-effort parsing.
  const parsed = parseHumanDate(bw.applicationOpens, today)

  let daysUntil = null
  let status = 'upcoming'
  if (parsed) {
    daysUntil = daysBetween(today, parsed)
    if (daysUntil < 0) status = 'open-now'
  } else {
    status = 'unknown'
  }

  return {
    type: 'lottery',
    status,
    bookOnLabel: `Apply ${bw.applicationOpens}`
      + (bw.applicationCloses ? ` – ${bw.applicationCloses}` : ''),
    bookOnDetail: bw.resultsAnnounced
      ? `Results: ${bw.resultsAnnounced}`
      : (bw.coverage || ''),
    daysUntil,
    urgency: urgencyFromDays(daysUntil),
  }
}

// ─── Seasonal release ──────────────────────────────────────────────────────
function calcSeasonalRelease(bw, tripDate, today) {
  const parsed = parseHumanDate(bw.releaseDate, today)
  let daysUntil = null
  let status = 'upcoming'
  if (parsed) {
    daysUntil = daysBetween(today, parsed)
    if (daysUntil < 0) status = 'open-now'
  } else {
    status = 'unknown'
  }

  const timePart = bw.releaseTime
    ? ` at ${formatTimeWithTz(bw.releaseTime, bw.timezone, parsed || today)}`
    : ''

  return {
    type: 'seasonal-release',
    status,
    bookOnLabel: `Releases ${bw.releaseDate}${timePart}`,
    bookOnDetail: bw.coverage ? `Covers ${bw.coverage}` : '',
    daysUntil,
    urgency: urgencyFromDays(daysUntil),
  }
}

// ─── Self-issue ────────────────────────────────────────────────────────────
function calcSelfIssue() {
  return {
    type: 'self-issue',
    status: 'walk-up',
    bookOnLabel: 'No advance booking needed',
    bookOnDetail: 'Self-issue at the trailhead.',
    daysUntil: null,
    urgency: 'none',
  }
}

// Best-effort parse of human-readable dates like "February 15", "Late January (~Jan 28)",
// "Early April". Returns a Date in the current or next year (whichever is upcoming),
// or null if we can't parse it.
function parseHumanDate(str, today) {
  if (!str) return null
  // Try to find "Month Day"
  const match = str.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})/i)
  if (!match) return null
  const month = new Date(`${match[1]} 1, 2000`).getMonth()
  const day = parseInt(match[2], 10)

  const thisYear = new Date(today.getFullYear(), month, day)
  if (thisYear >= startOfDay(today)) return thisYear
  return new Date(today.getFullYear() + 1, month, day)
}

export function computeBooking(bookingWindow, tripDate = null, today = new Date()) {
  if (!bookingWindow) {
    return {
      type: 'unknown',
      status: 'unknown',
      bookOnLabel: 'Booking info unavailable',
      bookOnDetail: '',
      daysUntil: null,
      urgency: 'none',
    }
  }

  switch (bookingWindow.type) {
    case 'rolling':
      return calcRolling(bookingWindow, tripDate, today)
    case 'lottery':
      return calcLottery(bookingWindow, tripDate, today)
    case 'seasonal-release':
      return calcSeasonalRelease(bookingWindow, tripDate, today)
    case 'self-issue':
      return calcSelfIssue(bookingWindow)
    default:
      return {
        type: 'unknown',
        status: 'unknown',
        bookOnLabel: 'Booking info unavailable',
        bookOnDetail: '',
        daysUntil: null,
        urgency: 'none',
      }
  }
}

// Soft, pastel palette — easy on the eye, low contrast tints with darker
// text. The `mapFill` colors are used by the Leaflet polygon styling.
export const URGENCY_STYLES = {
  critical: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    badge: 'bg-rose-200 text-rose-900',
    mapFill: '#FDA4AF', // rose-300
    label: 'Act now',
  },
  soon: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-200 text-amber-900',
    mapFill: '#FCD34D', // amber-300
    label: 'Soon',
  },
  later: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    badge: 'bg-sky-200 text-sky-900',
    mapFill: '#7DD3FC', // sky-300
    label: 'Later',
  },
  none: {
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    text: 'text-stone-700',
    badge: 'bg-stone-200 text-stone-700',
    mapFill: '#A7C9A4', // soft sage
    label: '',
  },
}
