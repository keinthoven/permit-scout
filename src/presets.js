// Pre-selected permits exposed in the SearchPanel dropdown.
// Each preset can optionally include either:
//   - `mapEmbed`: a URL to an interactive map (e.g. CalTopo) shown in an iframe, OR
//   - `mapImage`: a static image path (served from /public) shown as <img>.
// If both are set, mapEmbed takes precedence.
export const PRESETS = [
  {
    id: '233261',
    name: 'Desolation Wilderness Permit',
    mapEmbed: 'https://caltopo.com/m/4JC9',
  },
  {
    id: '4675311',
    name: 'Central Cascades Wilderness Overnight Permits',
  },
]

export function getPreset(permitId) {
  return PRESETS.find((p) => p.id === permitId) || null
}
