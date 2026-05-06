// One-shot script to fetch wilderness/park polygons from public sources
// and bundle them as src/wildernessShapes.json.
//
// Run: node scripts/fetch-shapes.mjs
//
// Sources:
//   - USFS EDW Wilderness service (public, no key)
//   - NPS Land Resources Boundary service (public, no key)
//   - Manual approximation for Havasupai (tribal land, no public service)

import { writeFile } from 'node:fs/promises'

const USFS_BASE =
  'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_Wilderness_01/MapServer/0/query'
const NPS_BASE =
  'https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query'
const BLM_BASE =
  'https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_NLCS_WLD_WSA/MapServer/0/query'

// Map our internal area IDs to source records.
const SOURCES = [
  // ─── USFS Wildernesses ───
  { id: 'john-muir-wilderness', usfsName: 'John Muir Wilderness' },
  { id: 'desolation-wilderness', usfsName: 'Desolation Wilderness' },
  { id: 'ansel-adams-wilderness', usfsName: 'Ansel Adams Wilderness' },
  { id: 'hoover-wilderness', usfsName: 'Hoover Wilderness' },
  { id: 'emigrant-wilderness', usfsName: 'Emigrant Wilderness' },
  { id: 'dinkey-lakes-wilderness', usfsName: 'Dinkey Lakes Wilderness' },
  { id: 'enchantments', usfsName: 'Alpine Lakes Wilderness' },
  // Central Oregon Cascades permit (4675311) covers all five wildernesses below.
  // We fetch each and merge into a single MultiPolygon.
  {
    id: 'central-cascades',
    usfsNames: [
      'Three Sisters Wilderness',
      'Mount Jefferson Wilderness',
      'Mount Washington Wilderness',
      'Diamond Peak Wilderness',
      'Waldo Lake Wilderness',
    ],
  },
  { id: 'glacier-peak-wilderness', usfsName: 'Glacier Peak Wilderness' },
  { id: 'indian-peaks-wilderness', usfsName: 'Indian Peaks Wilderness' },
  { id: 'maroon-bells-snowmass', usfsName: 'Maroon Bells-Snowmass Wilderness' },
  { id: 'weminuche-wilderness', usfsName: 'Weminuche Wilderness' },
  { id: 'bob-marshall-wilderness', usfsName: 'Bob Marshall Wilderness' },
  { id: 'boundary-waters', usfsName: 'Boundary Waters Canoe Area Wilderness' },

  // ─── NPS Units ───
  { id: 'yosemite-wilderness', npsName: 'Yosemite National Park' },
  { id: 'point-reyes-seashore', npsName: 'Point Reyes National Seashore' },
  {
    id: 'lassen-volcanic-backcountry',
    npsName: 'Lassen Volcanic National Park',
  },
  { id: 'grand-canyon-backcountry', npsName: 'Grand Canyon National Park' },
  { id: 'zion-narrows', npsName: 'Zion National Park' },
  { id: 'death-valley', npsName: 'Death Valley National Park' },
  { id: 'joshua-tree', npsName: 'Joshua Tree National Park' },
  // SEKI is two adjacent parks managed jointly — fetch and merge
  {
    id: 'sequoia-kings-canyon',
    npsNames: ['Sequoia National Park', 'Kings Canyon National Park'],
  },

  // ─── Forest-wide permits (merge multiple wilderness shapes) ───
  {
    id: 'inyo-national-forest',
    usfsNames: [
      'John Muir Wilderness',
      'Ansel Adams Wilderness',
      'Hoover Wilderness',
      'Inyo Mountains Wilderness',
      'White Mountain Wilderness',
      'South Sierra Wilderness',
      'Golden Trout Wilderness',
    ],
  },
  {
    id: 'sierra-national-forest',
    usfsNames: [
      'John Muir Wilderness',
      'Ansel Adams Wilderness',
      'Dinkey Lakes Wilderness',
      'Kaiser Wilderness',
      'Monarch Wilderness',
    ],
  },

  // ─── BLM-managed wilderness ───
  { id: 'king-range', blmName: 'King Range Wilderness' },

  // ─── Manual approximations (tribal land / no public service) ───
  {
    id: 'havasupai',
    manual: makeCircle(36.255, -112.692, 0.18, 32), // ~12mi radius around Supai
  },
]

function makeCircle(lat, lng, radiusDeg, points) {
  const coords = []
  for (let i = 0; i <= points; i++) {
    const a = (i / points) * Math.PI * 2
    coords.push([lng + Math.cos(a) * radiusDeg, lat + Math.sin(a) * radiusDeg])
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: { source: 'manual' },
  }
}

async function fetchUsfs(name) {
  const url =
    `${USFS_BASE}?where=wildernessname%3D'${encodeURIComponent(name)}'` +
    `&outFields=wildernessname&geometryPrecision=3&f=geojson` +
    `&returnGeometry=true&maxAllowableOffset=0.005`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.features?.length) {
    console.warn(`  ⚠️  No USFS feature found for "${name}"`)
    return null
  }
  // Combine multiple features (for wildernesses split across forests) into one
  const feature = mergeFeatures(data.features)
  feature.properties = { source: 'USFS', name }
  return feature
}

async function fetchNps(name) {
  const url =
    `${NPS_BASE}?where=UNIT_NAME%3D'${encodeURIComponent(name)}'` +
    `&outFields=UNIT_NAME&geometryPrecision=3&f=geojson` +
    `&returnGeometry=true&maxAllowableOffset=0.005`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.features?.length) {
    console.warn(`  ⚠️  No NPS feature found for "${name}"`)
    return null
  }
  const feature = mergeFeatures(data.features)
  feature.properties = { source: 'NPS', name }
  return feature
}

async function fetchBlm(name) {
  // BLM service doesn't speak GeoJSON natively, so request Esri JSON in WGS84
  // and convert to GeoJSON ourselves.
  const url =
    `${BLM_BASE}?where=NLCS_NAME%3D'${encodeURIComponent(name)}'` +
    `&outFields=NLCS_NAME&outSR=4326&f=json&returnGeometry=true` +
    `&maxAllowableOffset=0.005`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.features?.length) {
    console.warn(`  ⚠️  No BLM feature found for "${name}"`)
    return null
  }
  // Convert Esri rings → GeoJSON polygon coordinates
  const polygons = data.features.map((f) => {
    const rings = f.geometry?.rings || []
    return rings.map((ring) =>
      ring.map(([x, y]) => [
        Math.round(x * 1000) / 1000,
        Math.round(y * 1000) / 1000,
      ]),
    )
  })
  return {
    type: 'Feature',
    geometry:
      polygons.length === 1
        ? { type: 'Polygon', coordinates: polygons[0] }
        : { type: 'MultiPolygon', coordinates: polygons },
    properties: { source: 'BLM', name },
  }
}

// Merge a list of features into a single MultiPolygon
function mergeFeatures(features) {
  const polygons = []
  for (const f of features) {
    if (f.geometry.type === 'Polygon') {
      polygons.push(f.geometry.coordinates)
    } else if (f.geometry.type === 'MultiPolygon') {
      polygons.push(...f.geometry.coordinates)
    }
  }
  return {
    type: 'Feature',
    geometry:
      polygons.length === 1
        ? { type: 'Polygon', coordinates: polygons[0] }
        : { type: 'MultiPolygon', coordinates: polygons },
    properties: {},
  }
}

async function main() {
  const out = {}
  for (const src of SOURCES) {
    process.stdout.write(`Fetching ${src.id}…`)
    let feature = null
    if (src.usfsName) feature = await fetchUsfs(src.usfsName)
    else if (src.usfsNames) {
      const features = []
      for (const n of src.usfsNames) {
        const f = await fetchUsfs(n)
        if (f) features.push(f)
      }
      if (features.length) {
        feature = mergeFeatures(features)
        feature.properties = { source: 'USFS (merged)', names: src.usfsNames }
      }
    }
    else if (src.npsName) feature = await fetchNps(src.npsName)
    else if (src.npsNames) {
      const features = []
      for (const n of src.npsNames) {
        const f = await fetchNps(n)
        if (f) features.push(f)
      }
      if (features.length) {
        feature = mergeFeatures(features)
        feature.properties = { source: 'NPS (merged)', names: src.npsNames }
      }
    }
    else if (src.blmName) feature = await fetchBlm(src.blmName)
    else if (src.manual) feature = src.manual

    if (feature) {
      out[src.id] = feature
      console.log(' ✓')
    } else {
      console.log(' ✗ (skipped)')
    }
  }

  await writeFile(
    new URL('../src/wildernessShapes.json', import.meta.url),
    JSON.stringify(out, null, 0),
  )
  console.log(`\nWrote ${Object.keys(out).length} shapes to src/wildernessShapes.json`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
