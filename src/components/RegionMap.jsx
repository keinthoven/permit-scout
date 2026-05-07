import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import { useEffect, useMemo } from 'react'
import 'leaflet/dist/leaflet.css'
import shapes from '../wildernessShapes.json'
import { areaUrgency } from './AreaCard'
import { URGENCY_STYLES } from '../bookingCalculator'

function styleFor(urgency, isVisible) {
  const color = URGENCY_STYLES[urgency]?.mapFill || URGENCY_STYLES.none.mapFill
  if (!isVisible) {
    return {
      color: '#9ca3af',
      weight: 1,
      fillColor: '#cbd5d1',
      fillOpacity: 0.15,
      opacity: 0.3,
    }
  }
  return {
    color,
    weight: 1.5,
    fillColor: color,
    fillOpacity: 0.5,
    opacity: 0.85,
  }
}

// Hook to fit the map bounds to all visible features when filters change.
function FitBounds({ visibleIds }) {
  const map = useMap()
  useEffect(() => {
    if (!visibleIds.length) return
    const bounds = visibleIds
      .map((id) => shapes[id])
      .filter(Boolean)
      .reduce((acc, feature) => {
        const coords =
          feature.geometry.type === 'Polygon'
            ? feature.geometry.coordinates.flat()
            : feature.geometry.coordinates.flat(2)
        coords.forEach(([lng, lat]) => {
          acc.push([lat, lng])
        })
        return acc
      }, [])
    if (bounds.length) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8, animate: true })
    }
  }, [visibleIds, map])
  return null
}

export default function RegionMap({ areas, filteredAreas, tripDate, onRegionClick }) {
  const filteredIds = useMemo(
    () => new Set(filteredAreas.map((a) => a.id)),
    [filteredAreas],
  )
  const visibleIds = useMemo(() => filteredAreas.map((a) => a.id), [filteredAreas])

  // Build a stable key so GeoJSON re-renders when filters or trip date change
  const geoJsonKey = `${[...filteredIds].sort().join(',')}|${tripDate || ''}`

  // Layer-by-layer style + interactivity
  const onEachFeature = (feature, layer) => {
    const id = feature.properties.areaId
    const area = areas.find((a) => a.id === id)
    if (!area) return

    layer.bindTooltip(area.name, {
      direction: 'top',
      sticky: true,
      className: 'region-tooltip',
    })

    layer.on({
      click: () => onRegionClick?.(id),
      mouseover: (e) => {
        e.target.setStyle({ weight: 3, fillOpacity: 0.6 })
      },
      mouseout: (e) => {
        const isVisible = filteredIds.has(id)
        const u = areaUrgency(area, tripDate)
        e.target.setStyle(styleFor(u, isVisible))
      },
    })
  }

  // Build a single FeatureCollection — one feature per area we have a shape for
  const featureCollection = useMemo(() => {
    const features = []
    for (const area of areas) {
      const shape = shapes[area.id]
      if (!shape) continue
      features.push({
        ...shape,
        properties: { ...shape.properties, areaId: area.id, name: area.name },
      })
    }
    return { type: 'FeatureCollection', features }
  }, [areas])

  const styleFn = (feature) => {
    const id = feature.properties.areaId
    const area = areas.find((a) => a.id === id)
    if (!area) return styleFor('none', false)
    const isVisible = filteredIds.has(id)
    const u = areaUrgency(area, tripDate)
    return styleFor(u, isVisible)
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white">
      <MapContainer
        center={[42, -110]} // Roughly centered on Western US
        zoom={4}
        scrollWheelZoom={false}
        style={{ height: 460, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoJSON
          key={geoJsonKey}
          data={featureCollection}
          style={styleFn}
          onEachFeature={onEachFeature}
        />
        <FitBounds visibleIds={visibleIds} />
      </MapContainer>
    </div>
  )
}
