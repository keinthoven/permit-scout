// Wilderness areas data for the Trip Planner page.
//
// Each area has one or more `subLocations`, each with its own bookingWindow.
// This lets us model places like Point Reyes (4 separate campgrounds, each
// reservable individually) or Yosemite (one wilderness, many trailheads).
//
// Booking window types:
//
//   { type: 'rolling', windowDays, releaseTime, timezone, notes? }
//     Daily release: each morning at releaseTime, the booking horizon slides
//     forward by 1 day. To book July 15, be online (releaseTime) on
//     April 15 (windowDays before).
//
//   { type: 'lottery', applicationOpens, applicationCloses, resultsAnnounced,
//     coverage, notes? }
//     Annual or seasonal lottery. User must apply within the application
//     window; results released later. Dates are ISO yyyy-mm-dd or human-readable.
//
//   { type: 'seasonal-release', releaseDate, releaseTime, timezone, coverage,
//     notes? }
//     One-shot release: all season's permits go live on releaseDate.
//
//   { type: 'self-issue', notes? }
//     Walk-up / self-issue at trailhead, no advance booking.
//
// permitType (for top-level filtering): 'quota' | 'lottery' | 'self-issue'

export const AREAS = [
  // ─── California ───────────────────────────────────────────────────────────

  {
    id: 'john-muir-wilderness',
    name: 'John Muir Wilderness',
    state: 'CA',
    region: 'Sierra Nevada',
    managing: 'Inyo & Sierra National Forests',
    permitType: 'quota',
    season: { start: 'May 1', end: 'Nov 1' },
    tags: ['sierra', 'overnight', 'popular', 'jmt'],
    notes:
      'Covers the eastern Sierra from Mono County south to Sequoia. JMT thru-hikers use a separate permit lottery.',
    subLocations: [
      {
        id: 'jmw-inyo',
        name: 'Inyo National Forest entry trailheads',
        recGovId: '445856',
        type: 'permit',
        bookingWindow: {
          type: 'rolling',
          windowDays: 168, // 24 weeks ahead
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
          notes: '60% of daily quota reservable in advance; 40% walk-up day before.',
        },
      },
    ],
  },

  {
    id: 'desolation-wilderness',
    name: 'Desolation Wilderness',
    state: 'CA',
    region: 'Sierra Nevada',
    managing: 'Eldorado National Forest',
    permitType: 'quota',
    season: { start: 'May 15', end: 'Sep 30' },
    tags: ['sierra', 'overnight', 'lake tahoe', 'popular'],
    notes:
      'One of the most heavily used wilderness areas in the US. Day-use requires only a free self-issued permit.',
    subLocations: [
      {
        id: 'desolation-overnight',
        name: 'Overnight Wilderness Permit',
        recGovId: '233261',
        type: 'permit',
        bookingWindow: {
          type: 'rolling',
          windowDays: 180,
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
        },
      },
    ],
  },

  {
    id: 'ansel-adams-wilderness',
    name: 'Ansel Adams Wilderness',
    state: 'CA',
    region: 'Sierra Nevada',
    managing: 'Inyo & Sierra National Forests',
    permitType: 'quota',
    season: { start: 'June 1', end: 'Oct 31' },
    tags: ['sierra', 'overnight', 'popular'],
    notes:
      'Borders Yosemite NP to the south. Popular trailheads include Agnew Meadows, Mammoth Lakes Basin, and Reds Meadow.',
    subLocations: [
      {
        id: 'ansel-adams-inyo',
        name: 'Inyo Trailheads (Agnew, Mammoth, etc.)',
        recGovId: '233267',
        type: 'permit',
        bookingWindow: {
          type: 'rolling',
          windowDays: 168,
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
        },
      },
    ],
  },

  {
    id: 'hoover-wilderness',
    name: 'Hoover Wilderness',
    state: 'CA',
    region: 'Sierra Nevada',
    managing: 'Humboldt-Toiyabe & Inyo National Forests',
    permitType: 'self-issue',
    season: { start: 'June 15', end: 'Oct 15' },
    tags: ['sierra', 'overnight', 'walk-up'],
    notes:
      'Walk-up self-issued permits at trailheads — no reservation required. Quieter alternative to crowded eastern Sierra entries.',
    subLocations: [
      {
        id: 'hoover-walk-up',
        name: 'All trailheads',
        recGovId: null,
        type: 'permit',
        bookingWindow: { type: 'self-issue' },
      },
    ],
  },

  {
    id: 'emigrant-wilderness',
    name: 'Emigrant Wilderness',
    state: 'CA',
    region: 'Sierra Nevada',
    managing: 'Stanislaus National Forest',
    permitType: 'self-issue',
    season: { start: 'June 1', end: 'Oct 31' },
    tags: ['sierra', 'overnight', 'walk-up', 'uncrowded'],
    notes:
      'No quota, no advance permit required — self-issue at the trailhead. One of the last permit-free wilderness areas in the northern Sierra.',
    subLocations: [
      {
        id: 'emigrant-walk-up',
        name: 'All trailheads',
        recGovId: null,
        type: 'permit',
        bookingWindow: { type: 'self-issue' },
      },
    ],
  },

  {
    id: 'dinkey-lakes-wilderness',
    name: 'Dinkey Lakes Wilderness',
    state: 'CA',
    region: 'Sierra Nevada',
    managing: 'Sierra National Forest',
    permitType: 'self-issue',
    season: { start: 'June 1', end: 'Oct 15' },
    tags: ['sierra', 'overnight', 'walk-up', 'uncrowded'],
    notes:
      'Small, relatively uncrowded wilderness south of Yosemite. Self-issue permit at trailhead.',
    subLocations: [
      {
        id: 'dinkey-walk-up',
        name: 'All trailheads',
        recGovId: null,
        type: 'permit',
        bookingWindow: { type: 'self-issue' },
      },
    ],
  },

  {
    id: 'yosemite-wilderness',
    name: 'Yosemite Wilderness',
    state: 'CA',
    region: 'Sierra Nevada',
    managing: 'Yosemite National Park (NPS)',
    permitType: 'quota',
    season: { start: 'May 1', end: 'Oct 31' },
    tags: ['sierra', 'overnight', 'popular', 'nps'],
    notes:
      '60% of daily quota reservable 24 weeks ahead; remaining 40% released as walk-up the day before entry. Half Dome cables require a separate permit.',
    subLocations: [
      {
        id: 'yosemite-wilderness-permit',
        name: 'Wilderness Permit (overnight)',
        recGovId: '445859',
        type: 'permit',
        bookingWindow: {
          type: 'rolling',
          windowDays: 168, // 24 weeks
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
          notes: '60% advance reservable; 40% walk-up at 11am the day before entry.',
        },
      },
      {
        id: 'half-dome-cables',
        name: 'Half Dome Cables (Day Hike)',
        recGovId: '234652',
        type: 'permit',
        bookingWindow: {
          type: 'lottery',
          applicationOpens: 'March 1',
          applicationCloses: 'March 31',
          resultsAnnounced: 'Mid-April',
          coverage: 'Cable season (~late May to mid-October)',
          notes:
            'Preseason lottery. Daily lottery also runs 2 days in advance throughout the season.',
        },
      },
    ],
  },

  {
    id: 'point-reyes-seashore',
    name: 'Point Reyes National Seashore',
    state: 'CA',
    region: 'Bay Area / Coast',
    managing: 'Point Reyes National Seashore (NPS)',
    permitType: 'quota',
    season: { start: 'Year-round', end: null },
    tags: ['coast', 'overnight', 'year-round', 'nps', 'backpacking'],
    notes:
      'Four hike-in campgrounds plus Tomales Bay boat-in sites. Some campsites release on a 3-month rolling window; others on a 14-day window — check Rec.gov for site-specific details.',
    subLocations: [
      {
        id: 'pt-reyes-coast',
        name: 'Coast Campground',
        recGovId: '233359',
        type: 'campground',
        bookingWindow: {
          type: 'rolling',
          windowDays: 90,
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
          notes:
            'Most sites release 3 months ahead; some sites use a 14-day window — see Rec.gov for site-specific info.',
        },
      },
      {
        id: 'pt-reyes-sky',
        name: 'Sky Camp',
        recGovId: '233360',
        type: 'campground',
        bookingWindow: {
          type: 'rolling',
          windowDays: 90,
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
          notes:
            'Most sites release 3 months ahead; some sites use a 14-day window — see Rec.gov for site-specific info.',
        },
      },
      {
        id: 'pt-reyes-glen',
        name: 'Glen Camp',
        recGovId: '233361',
        type: 'campground',
        bookingWindow: {
          type: 'rolling',
          windowDays: 90,
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
          notes:
            'Most sites release 3 months ahead; some sites use a 14-day window — see Rec.gov for site-specific info.',
        },
      },
      {
        id: 'pt-reyes-wildcat',
        name: 'Wildcat Camp',
        recGovId: '233362',
        type: 'campground',
        bookingWindow: {
          type: 'rolling',
          windowDays: 90,
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
          notes:
            'Most sites release 3 months ahead; some sites use a 14-day window — see Rec.gov for site-specific info.',
        },
      },
      {
        id: 'pt-reyes-tomales',
        name: 'Tomales Bay Boat-In',
        recGovId: '247859',
        type: 'campground',
        bookingWindow: {
          type: 'rolling',
          windowDays: 90,
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
        },
      },
    ],
  },

  {
    id: 'lassen-volcanic-backcountry',
    name: 'Lassen Volcanic National Park',
    state: 'CA',
    region: 'Northern California',
    managing: 'Lassen Volcanic National Park (NPS)',
    permitType: 'self-issue',
    season: { start: 'July 1', end: 'Sep 30' },
    tags: ['volcanic', 'overnight', 'walk-up', 'nps', 'uncrowded'],
    notes:
      'Backcountry permits are free and self-issued at park visitor centers. No online reservation system.',
    subLocations: [
      {
        id: 'lassen-walk-up',
        name: 'Backcountry Permit',
        recGovId: null,
        type: 'permit',
        bookingWindow: { type: 'self-issue' },
      },
    ],
  },

  // ─── Pacific Northwest ─────────────────────────────────────────────────────

  {
    id: 'enchantments',
    name: 'The Enchantments (Alpine Lakes Wilderness)',
    state: 'WA',
    region: 'Pacific Northwest',
    managing: 'Okanogan-Wenatchee National Forest',
    permitType: 'lottery',
    season: { start: 'May 15', end: 'Oct 31' },
    tags: ['pnw', 'overnight', 'popular', 'lottery', 'alpine'],
    notes:
      'One of the most competitive permits in the country. Walk-up permits also available daily at the Leavenworth ranger station.',
    subLocations: [
      {
        id: 'enchantments-overnight',
        name: 'Overnight Permit (all zones)',
        recGovId: '233273',
        type: 'permit',
        bookingWindow: {
          type: 'lottery',
          applicationOpens: 'February 15',
          applicationCloses: 'March 2',
          resultsAnnounced: 'Late March',
          coverage: 'May 15 – October 31 trip dates',
          notes:
            'Application is $6.00. Core Enchantment Zone is the most competitive of 5 zones.',
        },
      },
    ],
  },

  {
    id: 'central-cascades',
    name: 'Central Cascades Wilderness',
    state: 'WA',
    region: 'Pacific Northwest',
    managing: 'Mt. Baker-Snoqualmie & Okanogan-Wenatchee National Forests',
    permitType: 'quota',
    season: { start: 'May 25', end: 'Oct 31' },
    tags: ['pnw', 'overnight', 'popular', 'day-use'],
    notes:
      'Covers popular trailheads including Ira Spring, Snow Lake, and Pratt Lake. Initial seasonal release plus 7-day rolling for cancellations.',
    subLocations: [
      {
        id: 'central-cascades-overnight',
        name: 'Overnight Permit',
        recGovId: '4675311',
        type: 'permit',
        bookingWindow: {
          type: 'seasonal-release',
          releaseDate: 'Early April',
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
          coverage: 'May 25 – October 31 trip dates',
          notes:
            'Bulk of permits released early April. Cancellations also available on 7-day rolling.',
        },
      },
    ],
  },

  {
    id: 'three-sisters-wilderness',
    name: 'Three Sisters Wilderness',
    state: 'OR',
    region: 'Pacific Northwest',
    managing: 'Deschutes & Willamette National Forests',
    permitType: 'quota',
    season: { start: 'May 25', end: 'Oct 15' },
    tags: ['pnw', 'overnight', 'oregon', 'popular'],
    notes:
      'South Sister summit, Broken Top, and Green Lakes are peak-demand trailheads. Two-stage release: early-April for the season + 7-day rolling.',
    subLocations: [
      {
        id: 'three-sisters-overnight',
        name: 'Overnight Permit',
        recGovId: '4675334',
        type: 'permit',
        bookingWindow: {
          type: 'seasonal-release',
          releaseDate: 'Early April',
          releaseTime: '07:00',
          timezone: 'America/Los_Angeles',
          coverage: 'May 25 – October 15 trip dates',
          notes:
            'Initial release covers the season. 40% held back for 7-day rolling release.',
        },
      },
    ],
  },

  {
    id: 'glacier-peak-wilderness',
    name: 'Glacier Peak Wilderness',
    state: 'WA',
    region: 'Pacific Northwest',
    managing: 'Mt. Baker-Snoqualmie & Okanogan-Wenatchee National Forests',
    permitType: 'self-issue',
    season: { start: 'July 1', end: 'Sep 30' },
    tags: ['pnw', 'overnight', 'walk-up', 'remote', 'uncrowded'],
    notes:
      'No permit reservation required — self-issue at trailheads. Remote and rugged.',
    subLocations: [
      {
        id: 'glacier-peak-walk-up',
        name: 'All trailheads',
        recGovId: null,
        type: 'permit',
        bookingWindow: { type: 'self-issue' },
      },
    ],
  },

  // ─── Colorado ─────────────────────────────────────────────────────────────

  {
    id: 'indian-peaks-wilderness',
    name: 'Indian Peaks Wilderness',
    state: 'CO',
    region: 'Rocky Mountains',
    managing: 'Arapaho & Roosevelt National Forests',
    permitType: 'quota',
    season: { start: 'June 1', end: 'Sep 15' },
    tags: ['colorado', 'overnight', 'rockies', 'popular'],
    notes:
      'Overnight permits required Jun 1–Sep 15, Fri–Sun and holidays. Free self-issue permits available Mon–Thu.',
    subLocations: [
      {
        id: 'indian-peaks-overnight',
        name: 'Overnight Permit',
        recGovId: '233388',
        type: 'permit',
        bookingWindow: {
          type: 'rolling',
          windowDays: 180,
          releaseTime: '08:00',
          timezone: 'America/Denver',
        },
      },
    ],
  },

  {
    id: 'maroon-bells-snowmass',
    name: 'Maroon Bells–Snowmass Wilderness',
    state: 'CO',
    region: 'Rocky Mountains',
    managing: 'White River National Forest',
    permitType: 'quota',
    season: { start: 'June 15', end: 'Oct 1' },
    tags: ['colorado', 'overnight', 'rockies', 'popular', 'iconic'],
    notes:
      'Home to the famous Maroon Bells. Day-use vehicles restricted in summer; shuttle required.',
    subLocations: [
      {
        id: 'maroon-bells-overnight',
        name: 'Overnight Permit (Conundrum, Maroon-Snowmass loop, etc.)',
        recGovId: '445860',
        type: 'permit',
        bookingWindow: {
          type: 'rolling',
          windowDays: 180,
          releaseTime: '08:00',
          timezone: 'America/Denver',
        },
      },
    ],
  },

  {
    id: 'weminuche-wilderness',
    name: 'Weminuche Wilderness',
    state: 'CO',
    region: 'Rocky Mountains',
    managing: 'San Juan & Rio Grande National Forests',
    permitType: 'self-issue',
    season: { start: 'June 1', end: 'Sep 30' },
    tags: ['colorado', 'overnight', 'walk-up', 'remote', 'uncrowded'],
    notes:
      "Colorado's largest wilderness. Self-issue permit at trailheads.",
    subLocations: [
      {
        id: 'weminuche-walk-up',
        name: 'All trailheads',
        recGovId: null,
        type: 'permit',
        bookingWindow: { type: 'self-issue' },
      },
    ],
  },

  // ─── Southwest ────────────────────────────────────────────────────────────

  {
    id: 'grand-canyon-backcountry',
    name: 'Grand Canyon Backcountry',
    state: 'AZ',
    region: 'Southwest',
    managing: 'Grand Canyon National Park (NPS)',
    permitType: 'lottery',
    season: { start: 'Year-round', end: null },
    tags: ['arizona', 'overnight', 'nps', 'lottery', 'popular', 'iconic'],
    notes:
      'NPS runs the lottery directly (NOT through Recreation.gov). Rolling 4-month availability after the lottery.',
    subLocations: [
      {
        id: 'gc-backcountry-permit',
        name: 'Backcountry Permit',
        recGovId: null,
        type: 'permit',
        bookingWindow: {
          type: 'lottery',
          applicationOpens: 'The 1st of the month, 4 months before trip month',
          applicationCloses: '~3 weeks later',
          resultsAnnounced: 'About 3 weeks after lottery closes',
          coverage: 'Rolling — apply 4 months before trip month',
          notes:
            'For a May 2026 trip, apply Jan 1–~Jan 21, 2026. Apply via NPS portal. Bright Angel, South Kaibab, and North Kaibab corridors most competitive.',
        },
      },
    ],
  },

  {
    id: 'zion-narrows',
    name: 'Zion Narrows (Top-Down)',
    state: 'UT',
    region: 'Southwest',
    managing: 'Zion National Park (NPS)',
    permitType: 'lottery',
    season: { start: 'Apr 1', end: 'Oct 31' },
    tags: ['utah', 'overnight', 'nps', 'popular', 'slot canyon'],
    notes:
      'Top-down through-hike requires permit. Bottom-up day hike does not. Calendar lottery 3 months before trip month.',
    subLocations: [
      {
        id: 'zion-narrows-permit',
        name: 'Top-Down Through Permit',
        recGovId: null,
        type: 'permit',
        bookingWindow: {
          type: 'lottery',
          applicationOpens: '1st of month, 3 months before trip month',
          applicationCloses: '~25th of same month',
          resultsAnnounced: '~5th of following month',
          coverage: 'Rolling calendar lottery',
          notes:
            'For a July trip, apply April 1–25. Cancellation/leftover permits available rolling 1 month ahead via Rec.gov.',
        },
      },
    ],
  },

  {
    id: 'havasupai',
    name: 'Havasupai (Havasu Falls)',
    state: 'AZ',
    region: 'Southwest',
    managing: 'Havasupai Tribe',
    permitType: 'lottery',
    season: { start: 'Feb 1', end: 'Nov 30' },
    tags: ['arizona', 'overnight', 'tribal', 'lottery', 'iconic', 'waterfall'],
    notes:
      'Permits managed by the Havasupai Tribe — NOT through Recreation.gov. Apply at havasupairesortations.com.',
    subLocations: [
      {
        id: 'havasupai-permit',
        name: 'Camping Permit (3-night required)',
        recGovId: null,
        type: 'permit',
        bookingWindow: {
          type: 'lottery',
          applicationOpens: 'February 1 (annually)',
          applicationCloses: 'Mid-February',
          resultsAnnounced: 'Late February',
          coverage: 'Whole season (Feb–Nov)',
          notes:
            'Demand massively exceeds supply. Apply at havasupairesortations.com — not Rec.gov.',
        },
      },
    ],
  },

  // ─── Other ────────────────────────────────────────────────────────────────

  {
    id: 'boundary-waters',
    name: 'Boundary Waters Canoe Area (BWCA)',
    state: 'MN',
    region: 'Midwest',
    managing: 'Superior National Forest',
    permitType: 'quota',
    season: { start: 'May 1', end: 'Sep 30' },
    tags: ['minnesota', 'canoe', 'overnight', 'popular', 'paddle'],
    notes:
      'Single-day annual release. Popular entry points fill within minutes.',
    subLocations: [
      {
        id: 'bwca-overnight',
        name: 'Quota Entry Permit (overnight paddle)',
        recGovId: '233396',
        type: 'permit',
        bookingWindow: {
          type: 'seasonal-release',
          releaseDate: 'Late January (~Jan 28)',
          releaseTime: '09:00',
          timezone: 'America/Chicago',
          coverage: 'May 1 – September 30 trip dates',
          notes:
            'Single annual release. Confirm exact date on Rec.gov each year — has been Jan 28 in recent years.',
        },
      },
    ],
  },

  {
    id: 'bob-marshall-wilderness',
    name: 'Bob Marshall Wilderness Complex',
    state: 'MT',
    region: 'Northern Rockies',
    managing: 'Flathead & Lewis & Clark National Forests',
    permitType: 'self-issue',
    season: { start: 'June 15', end: 'Sep 30' },
    tags: ['montana', 'overnight', 'walk-up', 'remote', 'uncrowded', 'grizzly'],
    notes:
      'Self-issue at trailheads. Grizzly country — bear spray strongly recommended.',
    subLocations: [
      {
        id: 'bob-walk-up',
        name: 'All trailheads',
        recGovId: null,
        type: 'permit',
        bookingWindow: { type: 'self-issue' },
      },
    ],
  },
]

export const STATES = [...new Set(AREAS.map((a) => a.state))].sort()
export const REGIONS = [...new Set(AREAS.map((a) => a.region))].sort()

export const PERMIT_TYPE_LABELS = {
  quota: 'Quota',
  lottery: 'Lottery',
  'self-issue': 'Walk-up / Self-Issue',
}
