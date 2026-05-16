// Pre-selected permits exposed in the SearchPanel dropdown.
// Each preset can optionally include either:
//   - `mapEmbed`: a URL to an interactive map / PDF shown in an iframe, OR
//   - `mapImage`: a static image path (served from /public) shown as <img>.
// If both are set, mapEmbed takes precedence.
//
// `images` is an optional pool of photo URLs cycled across the result cards
// (used when the permit's API carries no media of its own).
//
// `apiType` selects the Recreation.gov backend:
//   - 'recgov'     — legacy /api/permits endpoints (the default)
//   - 'permitinyo' — /api/permitcontent + /api/permitinyo (Yosemite-style)
export const PRESETS = [
  {
    id: '233261',
    name: 'Desolation Wilderness Permit',
    apiType: 'recgov',
    mapEmbed: 'https://caltopo.com/m/4JC9',
  },
  {
    id: '4675311',
    name: 'Central Cascades Wilderness Overnight Permits',
    apiType: 'recgov',
    mapEmbed: 'https://caltopo.com/m/097ATKF',
  },
  {
    id: '445859',
    name: 'Yosemite Wilderness Permits',
    apiType: 'permitinyo',
    // Rasterized from the NPS Yosemite Wilderness Trailheads PDF.
    mapImage: '/yosemite-trailhead-map.jpg',
    images: [
      'https://cdn.recreation.gov/public/2019/04/24/13/33/2991_b3781171-16fd-49d5-ae65-3dab8e8dad81_700.webp',
      'https://cdn.recreation.gov/public/2021/10/21/16/43/445859_15fe8254-4154-4a38-8b47-7aa848744a3f_700.webp',
      'https://cdn.recreation.gov/public/2022/06/03/00/56/10083567_4af2cf9e-6129-48ca-a0bb-3272769f8ad9_700.webp',
      'https://cdn.recreation.gov/public/2022/02/28/23/28/10083840_e985580d-31e5-4d71-81d2-cc8d371602a2_1440.webp',
      'https://cdn.recreation.gov/public/2023/06/20/23/48/10083831_00dacff0-5463-4c04-a7ce-5207e4a2fc75_700.webp',
      'https://cdn.recreation.gov/public/2025/08/05/05/50/232448_422d8aa3-1071-4e8b-984c-96c5ffca38a9_700.webp',
    ],
  },
  {
    id: '445856',
    name: 'Hoover Wilderness Permits',
    apiType: 'permitinyo',
    images: [
      'https://cdn.recreation.gov/public/2020/03/05/14/44/445856_34f5b311-f22f-406a-af64-2e3712127b5e_700.webp',
      'https://cdn.recreation.gov/public/2024/08/21/20/12/10291355_a46e45bf-25b2-4459-aa0c-ef1ec489ddc2_700.webp',
      'https://cdn.recreation.gov/public/2023/10/15/20/58/232119_0a3f76e0-4b7d-4f04-bad7-a8d4611b518a_1440.webp',
      'https://cdn.recreation.gov/public/2024/10/10/17/59/10291460_ad86a78d-4f76-45a0-a7b6-1bf38e1c81a9_700.webp',
      'https://cdn.recreation.gov/public/2023/10/15/19/59/232090_fb018077-d1cf-48be-8778-675fada51ac0_700.webp',
      'https://cdn.recreation.gov/public/2023/10/17/21/56/232117_eab8030d-df89-4f60-a875-5dc6329ec7a1_700.webp',
      'https://cdn.recreation.gov/public/2023/03/01/21/17/232422_5dc5cf56-b39b-40cb-90c8-26737923bf51_700.webp',
    ],
  },
]

export function getPreset(permitId) {
  return PRESETS.find((p) => p.id === permitId) || null
}
