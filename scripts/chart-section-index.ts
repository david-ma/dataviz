import { readFileSync, writeFileSync } from 'node:fs'

const lines = readFileSync('src/js/_chart_monolith.ts', 'utf8').split('\n')
const idx = (pred: (l: string, i: number) => boolean) => lines.findIndex(pred)

const report = {
  total: lines.length,
  export: idx((l) => l.startsWith('export { Chart')),
  classifyName: idx((l) => l.includes('function classifyName')),
  initMap: idx((l) => /^\s+initMap\(\)/.test(l)),
  drawMap: idx((l) => /^\s+drawMap\(options/.test(l)),
  MapLoadingAnimation: idx((l) => l.includes('class MapLoadingAnimation')),
  mapDistance: idx((l) => l.includes('export function mapDistance')),
  initTreemap: idx((l) => /^\s+initTreemap\(/.test(l)),
  treemap: idx((l) => /^\s+treemap\(\)/.test(l)),
  generalisedLineChart: idx((l) => /^\s+generalisedLineChart\(/.test(l)),
  clear_canvas: idx((l) => /^\s+clear_canvas\(/.test(l)),
  scratchpad: idx((l) => /^\s+scratchpad\(callback/.test(l)),
  asyncScratchpad: idx((l) => /^\s+asyncScratchpad\(/.test(l)),
  toggleFullscreen: idx((l) => /^\s+toggleFullscreen\(/.test(l)),
  exportPNG: idx((l) => /^\s+exportPNG\(/.test(l)),
  Coordinates: idx((l) => l.includes('export type Coordinates')),
  LoadingAnimation: idx((l) => l.includes('interface LoadingAnimation')),
}
console.log(report)
writeFileSync('/tmp/chart-sections.json', JSON.stringify(report, null, 2))
