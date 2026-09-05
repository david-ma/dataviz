/**
 * Build chart-map.ts (MapChart) and chart-extras.ts from monolith.
 */
import { readFileSync, writeFileSync } from 'node:fs'

const lines = readFileSync('src/js/_chart_monolith.ts', 'utf8').split('\n')
const L = (a: number, b: number) => lines.slice(a, b).join('\n')

// Types Coordinates + Geoip from monolith (63-94)
const geoTypes = L(63, 95)

// initMap + drawMap: 1582 .. before function sumByCount at 1952
const mapMethods = L(1582, 1952)
  .replace(
    /alert\('You are in Georgia!'\)/,
    `options.onContain?.(feature, { latitude, longitude })`,
  )
  // Fix the forEach variable - was georgias.forEach((georgia) => - need feature name
  .replace(
    /georgias\.forEach\(\(georgia\) => \{\s*if \(\s*d3\.geoContains\(georgia,/,
    `georgias.forEach((feature) => {\n                                  if (\n                                    d3.geoContains(feature,`,
  )

// MapLoadingAnimation block: interface + class 1987-2142
const loadingAnim = L(1987, 2142)

// mapDistance + deg2rad 2144-2168
const mapDistance = L(2144, 2168)

const chartMap = `/**
 * MapChart – geographic helpers on top of Chart (upstreamable with chart.ts).
 */
import * as d3 from 'd3'
import { camelize } from './utils'
import { Chart } from './chart'

${geoTypes}

export class MapChart extends Chart {
  projection?: d3.GeoProjection
  calculate?: (chart: Chart, marker: Coordinates) => Coordinates[]
  loadingAnimation?: LoadingAnimation

${mapMethods}
}

${loadingAnim}

${mapDistance}

export { MapChart as default }
`

// Fix onContain - drawMap options type needs the callback; patch options type in extracted method
let chartMapFixed = chartMap.replace(
  /calculate\?: \(chart: Chart, marker: Coordinates\) => Coordinates\[\]\n    projection\?: d3\.GeoProjection\n  \)/,
  `calculate?: (chart: Chart, marker: Coordinates) => Coordinates[]
    projection?: d3.GeoProjection
    onContain?: (feature: any, coords: Coordinates) => void
  )`,
)

writeFileSync('src/js/chart-map.ts', chartMapFixed)
console.log('wrote chart-map.ts', chartMapFixed.split('\n').length)

// Extras: generalisedLineChart 539-636 approx, treemap 1289-1438, initTreemap 1472-1580
const generalised = L(539, 636)
const treemapMethod = L(1289, 1438)
const updateTreemap = L(1472, 1476)
const initTreemap = L(1478, 1580)
const treemapTypes = L(96, 106)

const chartExtras = `/**
 * ExtrasChart – legacy recipes (treemap, generalisedLineChart) for archived posts.
 * Prefer scratchpad() in new work; upstream patterns into Chart only when reused.
 */
import * as d3 from 'd3'
import { Chart } from './chart'

${treemapTypes}

export class ExtrasChart extends Chart {
${generalised}

${treemapMethod}

${updateTreemap}

${initTreemap}
}

export { ExtrasChart as default }
`

writeFileSync('src/js/chart-extras.ts', chartExtras)
console.log('wrote chart-extras.ts', chartExtras.split('\n').length)
