/**
 * World Wealth — Credit Suisse 2019 global wealth by country (MakeoverMonday).
 * Nested treemap: world → region → country. Click a country to zoom its region;
 * click the chart background (or Reset) to return.
 */
import { Chart, decorateTable, classifyName, d3 } from './chart'
import type { Api as DataTablesApi } from 'datatables.net'

type Country = {
  rank: number
  name: string
  region: string
  wealth: number
}

type RegionNode = {
  name: string
  wealth: number
  children: Country[]
}

type WorldNode = {
  name: string
  children: RegionNode[]
}

type HierarchyDatum = WorldNode | RegionNode | Country

const CSV_URL = '/blogposts/WorldWealth.csv?raw=true'
const REGION_COLOURS = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc948',
]

const wealthFormat = d3.format('$,.0f')
const ZOOM_MS = 750

function isCountry(d: HierarchyDatum): d is Country {
  return 'wealth' in d && !('children' in d)
}

function loadCountries(rows: Array<d3.DSVRowString<string>>): Country[] {
  let rank = 1
  const out: Country[] = []
  for (const row of rows) {
    const country = row.country?.trim()
    const region = row.region?.trim()
    if (!country || !region) continue
    const wealth = Number.parseInt(String(row.wealth_b ?? '0').replace(/,/g, ''), 10)
    if (!Number.isFinite(wealth)) continue
    out.push({
      rank: rank++,
      name: country,
      region,
      wealth,
    })
  }
  return out
}

function buildWorld(countries: Country[]): WorldNode {
  const byRegion = new Map<string, RegionNode>()
  for (const country of countries) {
    let region = byRegion.get(country.region)
    if (!region) {
      region = { name: country.region, wealth: 0, children: [] }
      byRegion.set(country.region, region)
    }
    region.wealth += country.wealth
    region.children.push(country)
  }
  for (const region of byRegion.values()) {
    region.children.sort((a, b) => b.wealth - a.wealth)
  }
  return {
    name: 'World',
    children: [...byRegion.values()].sort((a, b) => b.wealth - a.wealth),
  }
}

function updateSummary(countries: Country[], error?: string) {
  const el = document.getElementById('wealth-summary')
  if (!el) return
  if (error) {
    el.textContent = error
    return
  }
  const total = d3.sum(countries, (d) => d.wealth)
  const regions = new Set(countries.map((d) => d.region)).size
  el.innerHTML =
    `<strong>${countries.length}</strong> countries · ` +
    `<strong>${regions}</strong> regions · ` +
    `total <strong>${wealthFormat(total)}</strong> billion USD (2019)`
}

function setZoomLabel(text: string) {
  const el = document.getElementById('wealth-zoom-label')
  if (el) el.textContent = text
}

let countries: Country[] = []
try {
  const raw = await d3.csv(CSV_URL)
  countries = loadCountries(raw)
} catch (err) {
  console.error('Failed to load WorldWealth.csv', err)
  updateSummary([], `Could not load ${CSV_URL}. Is the file under public/blogposts/?`)
}

if (!countries.length) {
  updateSummary([], `No rows parsed from ${CSV_URL}.`)
} else {
  updateSummary(countries)
}

const world = buildWorld(countries)
const color = d3
  .scaleOrdinal<string, string>()
  .domain(world.children.map((d) => d.name))
  .range(REGION_COLOURS)

const datatable = decorateTable(countries, {
  element: '#dataset table',
  paging: true,
  searching: true,
  pageLength: 12,
  order: [[3, 'desc']],
  language: {
    searchPlaceholder: 'Filter countries…',
    search: '',
  },
  columns: [
    { data: 'rank', title: 'Rank' },
    { data: 'name', title: 'Country' },
    { data: 'region', title: 'Region' },
    {
      data: 'wealth',
      title: 'Wealth (US$ bn)',
      render: (d: number) => wealthFormat(d),
    },
  ],
  rowCallback(row, data) {
    const country = data as Country
    d3.select(row)
      .attr('id', `row-${classifyName(country.name)}`)
      .style('background', color(country.region))
      .on('mouseenter', () => {
        d3.select(`#country-${classifyName(country.name)}`).classed('highlight', true)
      })
      .on('mouseleave', () => {
        d3.select(`#country-${classifyName(country.name)}`).classed('highlight', false)
      })
  },
}) as DataTablesApi<Country>

if (!countries.length) {
  // Still draw an empty chart shell message rather than treemap of nothing useful.
  const host = document.getElementById('chart')
  if (host) {
    host.innerHTML = `<p class="wealth-empty">No wealth data to plot.</p>`
  }
} else {
  const host = document.getElementById('chart')
  const chartWidth = Math.max(640, Math.min(1000, (host?.clientWidth || 800) - 8))

  new Chart({
    element: 'chart',
    width: chartWidth,
    height: Math.round(chartWidth * 0.68),
    margin: { top: 8, right: 8, bottom: 8, left: 8 },
    nav: false,
    title: '',
  }).scratchpad((chart) => {
  const svg = chart.plot
  const width = chart.innerWidth
  const height = chart.innerHeight

  const treemap = d3.treemap<HierarchyDatum>().size([width, height]).paddingInner(2).paddingOuter(2).round(true)

  const countryOpacity = d3.scaleLinear<number, number>().range([0.55, 1])

  let zoomedRegion: string | null = null

  const layers = {
    cells: svg.append('g').attr('class', 'wealth-cells'),
    labels: svg.append('g').attr('class', 'wealth-labels').style('pointer-events', 'none'),
  }

  const resetBtn = document.getElementById('wealth-reset')
  resetBtn?.addEventListener('click', () => {
    if (zoomedRegion) resetView()
  })

  function highlightRow(name: string, on: boolean) {
    d3.select(`#row-${classifyName(name)}`).classed('highlight', on)
  }

  function fitLabel(selection: d3.Selection<SVGTextElement, unknown, null, undefined>, maxWidth: number) {
    const node = selection.node()
    if (node && node.getBBox().width > maxWidth - 6) selection.remove()
  }

  function hierarchyForView(): d3.HierarchyNode<HierarchyDatum> {
    if (!zoomedRegion) {
      return d3.hierarchy<HierarchyDatum>(world).sum((d) => (isCountry(d) ? d.wealth : 0))
    }
    const region = world.children.find((r) => r.name === zoomedRegion)
    if (!region) {
      zoomedRegion = null
      return d3.hierarchy<HierarchyDatum>(world).sum((d) => (isCountry(d) ? d.wealth : 0))
    }
    return d3.hierarchy<HierarchyDatum>(region).sum((d) => (isCountry(d) ? d.wealth : 0))
  }

  function regionNameOf(leaf: d3.HierarchyRectangularNode<HierarchyDatum>): string {
    const data = leaf.data
    if (isCountry(data)) return data.region
    if (leaf.parent && 'name' in leaf.parent.data) return String(leaf.parent.data.name)
    return zoomedRegion || 'World'
  }

  function render(animate: boolean) {
    const root = treemap(hierarchyForView())
    const leaves = root.leaves() as d3.HierarchyRectangularNode<HierarchyDatum>[]
    const values = leaves.map((d) => d.value || 0)
    countryOpacity.domain([d3.min(values) || 0, d3.max(values) || 1])

    const cell = layers.cells.selectAll('rect.country').data(
      leaves,
      (d: d3.HierarchyRectangularNode<HierarchyDatum>) =>
        isCountry(d.data) ? d.data.name : String(d.data.name),
    )

    cell.exit().remove()

    const cellEnter = cell
      .enter()
      .append('rect')
      .classed('country', true)
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', 0)
      .attr('height', 0)

    const cellMerge = cellEnter.merge(cell)

    cellMerge
      .attr('id', (d) => (isCountry(d.data) ? `country-${classifyName(d.data.name)}` : `node-${classifyName(String(d.data.name))}`))
      .attr('fill', (d) => color(regionNameOf(d)))
      .attr('fill-opacity', (d) => countryOpacity(d.value || 0))
      .attr('stroke', '#1a1a1a')
      .attr('stroke-width', 1)
      .on('mouseenter', (_event, d) => {
        if (isCountry(d.data)) highlightRow(d.data.name, true)
      })
      .on('mouseleave', (_event, d) => {
        if (isCountry(d.data)) highlightRow(d.data.name, false)
      })
      .on('click', (event, d) => {
        event.stopPropagation()
        if (!isCountry(d.data)) return
        const region = d.data.region
        datatable.search(region).draw()
        if (zoomedRegion === region) return
        zoomedRegion = region
        setZoomLabel(`Region: ${region}`)
        resetBtn?.removeAttribute('hidden')
        render(true)
      })

    const transition = animate ? cellMerge.transition().duration(ZOOM_MS) : cellMerge
    transition
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => Math.max(0, d.x1 - d.x0))
      .attr('height', (d) => Math.max(0, d.y1 - d.y0))

    layers.labels.selectAll('*').remove()

    for (const leaf of leaves) {
      if (!isCountry(leaf.data)) continue
      const w = leaf.x1 - leaf.x0
      const h = leaf.y1 - leaf.y0
      if (w < 36 || h < 28) continue

      const nameText = layers.labels
        .append('text')
        .attr('class', 'wealth-label-name')
        .attr('x', leaf.x0 + 4)
        .attr('y', leaf.y0 + 16)
        .text(leaf.data.name)
      fitLabel(nameText, w)

      if (h >= 42) {
        const valueText = layers.labels
          .append('text')
          .attr('class', 'wealth-label-value')
          .attr('x', leaf.x0 + 4)
          .attr('y', leaf.y0 + 30)
          .text(`${wealthFormat(leaf.data.wealth)} bn`)
        fitLabel(valueText, w)
      }
    }
  }

  function resetView() {
    zoomedRegion = null
    datatable.search('').draw()
    setZoomLabel('All regions')
    resetBtn?.setAttribute('hidden', '')
    render(true)
  }

  svg.on('click', () => {
    if (zoomedRegion) resetView()
  })

  // Legend
  const legendHost = document.getElementById('wealth-legend')
  if (legendHost) {
    legendHost.replaceChildren()
    for (const region of world.children) {
      const item = document.createElement('button')
      item.type = 'button'
      item.className = 'wealth-legend-item'
      item.innerHTML = `<span class="swatch" style="background:${color(region.name)}"></span>${region.name}`
      item.addEventListener('click', () => {
        datatable.search(region.name).draw()
        zoomedRegion = region.name
        setZoomLabel(`Region: ${region.name}`)
        resetBtn?.removeAttribute('hidden')
        render(true)
      })
      legendHost.appendChild(item)
    }
  }

  setZoomLabel('All regions')
  render(false)
  })
}
