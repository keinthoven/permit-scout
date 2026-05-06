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
      bookOnLabel: `Rolling ${bw.windowDays}-day window`,
      bookOnDetail: `Releases at ${formatTimeWithTz(bw.releaseTime, bw.timezone, today)}, ${bw.windowDays} days before each trip date.`,
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
      ? `Open now — bookable since ${formatLongDate(bookOn)}`
      : `Book on ${formatLongDate(bookOn)}`,
    bookOnDetail: `Set an alarm for ${formatTimeWithTz(bw.releaseTime, bw.timezone, bookOn)} sharp. ${bw.windowDays}-day rolling window.${bw.notes ? ' ' + bw.notes : ''}`,
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
    bookOnLabel: `Lottery: apply ${bw.applicationOpens}`
      + (bw.applicationCloses ? ` – ${bw.applicationCloses}` : ''),
    bookOnDetail: [
      bw.resultsAnnounced ? `Results: ${bw.resultsAnnounced}.` : null,
      bw.coverage ? `Coverage: ${bw.coverage}.` : null,
      bw.notes,
    ].filter(Boolean).join(' '),
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
    bookOnDetail: [
      bw.coverage ? `Covers: ${bw.coverage}.` : null,
      bw.notes,
    ].filter(Boolean).join(' '),
    daysUntil,
    urgency: urgencyFromDays(daysUntil),
  }
}

// ─── Self-issue ────────────────────────────────────────────────────────────
function calcSelfIssue(bw) {
  return {
    type: 'self-issue',
    status: 'walk-up',
    bookOnLabel: 'No advance booking needed',
    bookOnDetail: 'Self-issue permit at the trailhead. Just show up.' + (bw.notes ? ' ' + bw.notes : ''),
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

export const URGENCY_STYLES = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-500 text-white',
    label: 'Act now',
  },
  soon: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-400 text-amber-900',
    label: 'Soon',
  },
  later: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    badge: 'bg-blue-400 text-white',
    label: 'Later',
  },
  none: {
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    text: 'text-stone-700',
    badge: 'bg-stone-200 text-stone-700',
    label: '',
  },
}
