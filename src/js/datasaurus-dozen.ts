/**
 * Datasaurus Dozen — same summary stats, thirteen very different scatter plots.
 * Data: Matejka & Fitzmaurice (Autodesk), inspired by Alberto Cairo’s Datasaurus.
 */
import { Chart, d3 } from './chart'

type Point = { x: number; y: number }
type DatasetStats = {
  name: string
  n: number
  meanX: number
  meanY: number
  sdX: number
  sdY: number
  corr: number
  points: Point[]
}

const CSV_URL = '/dataviz/datasaurus-dozen.csv'

/** Prefer a readable reading order: dinosaur first, then the dozen. */
const DATASET_ORDER = [
  'dino',
  'away',
  'bullseye',
  'circle',
  'dots',
  'h_lines',
  'v_lines',
  'wide_lines',
  'high_lines',
  'slant_up',
  'slant_down',
  'star',
  'x_shape',
] as const

const LABELS: Record<string, string> = {
  dino: 'Datasaurus',
  away: 'Away',
  bullseye: 'Bullseye',
  circle: 'Circle',
  dots: 'Dots',
  h_lines: 'Horizontal lines',
  v_lines: 'Vertical lines',
  wide_lines: 'Wide lines',
  high_lines: 'High lines',
  slant_up: 'Slant up',
  slant_down: 'Slant down',
  star: 'Star',
  x_shape: 'X shape',
}

const fmt2 = d3.format('.2f')

function mean(values: number[]): number {
  return d3.mean(values) ?? 0
}

/** Sample standard deviation (n − 1), matching the Autodesk paper’s reported figures. */
function sampleSd(values: number[]): number {
  const m = mean(values)
  if (values.length < 2) return 0
  const sumSq = d3.sum(values, (v) => (v - m) ** 2)
  return Math.sqrt(sumSq / (values.length - 1))
}

function pearson(xs: number[], ys: number[]): number {
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx
    const b = ys[i] - my
    num += a * b
    dx += a * a
    dy += b * b
  }
  const denom = Math.sqrt(dx * dy)
  return denom === 0 ? 0 : num / denom
}

function labelFor(name: string): string {
  return LABELS[name] ?? name.replace(/_/g, ' ')
}

function summarise(name: string, points: Point[]): DatasetStats {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  return {
    name,
    n: points.length,
    meanX: mean(xs),
    meanY: mean(ys),
    sdX: sampleSd(xs),
    sdY: sampleSd(ys),
    corr: pearson(xs, ys),
    points,
  }
}

function setSummary(text: string, isError = false) {
  const el = document.getElementById('datasaurus-summary')
  if (!el) return
  el.textContent = text
  el.classList.toggle('error', isError)
}

function renderStatsTable(datasets: DatasetStats[]) {
  const host = document.getElementById('datasaurus-stats')
  if (!host) return

  const rows = datasets
    .map(
      (d) => `<tr class="${d.name === 'dino' ? 'is-dino' : ''}">
      <td>${labelFor(d.name)}</td>
      <td>${fmt2(d.meanX)}</td>
      <td>${fmt2(d.meanY)}</td>
      <td>${fmt2(d.sdX)}</td>
      <td>${fmt2(d.sdY)}</td>
      <td>${fmt2(d.corr)}</td>
      <td>${d.n}</td>
    </tr>`,
    )
    .join('')

  host.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Dataset</th>
          <th>Mean X</th>
          <th>Mean Y</th>
          <th>SD X</th>
          <th>SD Y</th>
          <th>Corr.</th>
          <th>n</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`
}

function drawScatter(elementId: string, dataset: DatasetStats, xDomain: [number, number], yDomain: [number, number]) {
  const chart = new Chart({
    element: elementId,
    title: labelFor(dataset.name),
    xLabel: 'x',
    yLabel: 'y',
    width: 320,
    height: 280,
    margin: { top: 48, right: 20, bottom: 40, left: 40 },
    nav: false,
  })

  chart.scratchpad((c) => {
    const x = d3.scaleLinear().domain(xDomain).nice().range([0, c.innerWidth])
    const y = d3.scaleLinear().domain(yDomain).nice().range([c.innerHeight, 0])

    c.plot
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${c.innerHeight})`)
      .call(d3.axisBottom(x).ticks(5))

    c.plot.append('g').attr('class', 'y axis').call(d3.axisLeft(y).ticks(5))

    c.plot
      .selectAll('circle.point')
      .data(dataset.points)
      .join('circle')
      .attr('class', 'point')
      .attr('cx', (d) => x(d.x))
      .attr('cy', (d) => y(d.y))
      .attr('r', 2.4)
      .attr('fill', c.colours[0])
      .attr('fill-opacity', 0.85)
  })
}

const grid = document.getElementById('datasaurus-grid')
if (!grid) {
  setSummary('Missing #datasaurus-grid container.', true)
} else {
  let raw: d3.DSVRowArray<string>
  try {
    raw = await d3.csv(CSV_URL)
  } catch (err) {
    console.error('Failed to load Datasaurus Dozen CSV', err)
    setSummary(`Could not load ${CSV_URL}.`, true)
    throw err
  }

  const grouped = d3.group(
    raw
      .map((row) => ({
        dataset: (row.dataset ?? '').trim(),
        x: Number.parseFloat(String(row.x ?? '')),
        y: Number.parseFloat(String(row.y ?? '')),
      }))
      .filter((row) => row.dataset && Number.isFinite(row.x) && Number.isFinite(row.y)),
    (row) => row.dataset,
  )

  const orderedNames = [
    ...DATASET_ORDER.filter((name) => grouped.has(name)),
    ...[...grouped.keys()].filter((name) => !(DATASET_ORDER as readonly string[]).includes(name)),
  ]

  const datasets = orderedNames.map((name) => {
    const points = (grouped.get(name) ?? []).map(({ x, y }) => ({ x, y }))
    return summarise(name, points)
  })

  if (!datasets.length) {
    setSummary(`No rows parsed from ${CSV_URL}.`, true)
  } else {
    const dino = datasets.find((d) => d.name === 'dino') ?? datasets[0]
    setSummary(
      `${datasets.length} datasets · ${dino.n} points each · ` +
        `mean (x, y) ≈ (${fmt2(dino.meanX)}, ${fmt2(dino.meanY)}) · ` +
        `sd ≈ (${fmt2(dino.sdX)}, ${fmt2(dino.sdY)}) · ` +
        `r ≈ ${fmt2(dino.corr)}`,
    )
    renderStatsTable(datasets)

    const allX = datasets.flatMap((d) => d.points.map((p) => p.x))
    const allY = datasets.flatMap((d) => d.points.map((p) => p.y))
    const xDomain: [number, number] = [d3.min(allX) ?? 0, d3.max(allX) ?? 100]
    const yDomain: [number, number] = [d3.min(allY) ?? 0, d3.max(allY) ?? 100]

    for (const dataset of datasets) {
      const panel = document.createElement('div')
      panel.className = 'datasaurus-panel'
      const chartId = `datasaurus-${dataset.name}`
      const chartEl = document.createElement('div')
      chartEl.id = chartId
      panel.appendChild(chartEl)
      grid.appendChild(panel)
      drawScatter(chartId, dataset, xDomain, yDomain)
    }
  }
}
