import { Chart, d3 } from './chart'

type Statue = {
  name: string
  type: string
  location: string
  lat: string
  long: string
  artist: string
  owner: string
  source: string
  url: string
  year: string
  form: string
  access: string
  notes: string
}

type FilterMode = 'all' | 'women' | 'goats'

const ukLat = 54.5
const ukLong = -2.0

const TYPE_COLOUR: Record<string, string> = {
  woman: '#c0392b',
  woman_collective: '#e74c3c',
  goat: '#2980b9',
  goat_with_figure: '#8e44ad',
  goat_heraldic: '#16a085',
  goat_relief: '#27ae60',
}

const TYPE_LABEL: Record<string, string> = {
  woman: 'Woman',
  woman_collective: 'Women (collective)',
  goat: 'Goat',
  goat_with_figure: 'Woman with goat',
  goat_heraldic: 'Heraldic goat',
  goat_relief: 'Goat relief',
}

function isWoman(type: string) {
  return type.startsWith('woman')
}

function isGoat(type: string) {
  return type.startsWith('goat')
}

function parseStatue(row: Statue) {
  const lat = parseFloat(row.lat)
  const long = parseFloat(row.long)
  if (!Number.isFinite(lat) || !Number.isFinite(long)) return null
  return { ...row, latNum: lat, longNum: long }
}

function matchesFilter(type: string, mode: FilterMode) {
  if (mode === 'all') return true
  if (mode === 'women') return isWoman(type)
  return isGoat(type)
}

/** Deterministic micro-jitter so overlapping London pins separate slightly. */
function jitter(lat: number, long: number, key: string) {
  let h = 0
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0
  const a = ((h % 1000) / 1000 - 0.5) * 0.012
  const b = ((((h / 1000) | 0) % 1000) / 1000 - 0.5) * 0.012
  return { lat: lat + a, long: long + b }
}

const mapHost = document.getElementById('map')
if (mapHost && !document.getElementById('statues-controls')) {
  const controls = document.createElement('div')
  controls.id = 'statues-controls'
  controls.innerHTML = `
    <div class="statues-toolbar">
      <label>Show
        <select id="statues-filter">
          <option value="all">All</option>
          <option value="women">Women</option>
          <option value="goats">Goats</option>
        </select>
      </label>
      <span id="statues-count" class="statues-count"></span>
      <button type="button" id="statues-reset-zoom">Reset zoom</button>
    </div>
    <div id="statues-panel" class="statues-panel" hidden></div>
    <div id="statues-nearby" class="statues-nearby" hidden></div>
  `
  mapHost.parentElement?.insertBefore(controls, mapHost)
}

new Chart({
  element: 'map',
  width: 800,
  height: 900,
  margin: 0,
  nav: false,
}).scratchpad((chart) => {
  const w = chart.width
  const h = chart.height

  const projection = d3
    .geoMercator()
    .center([ukLong, ukLat])
    .translate([w / 2, h / 2])
    .scale(2200)

  const path = d3.geoPath().projection(projection)
  const svg = chart.svg
  const root = svg.append('g').attr('id', 'zoom-root')
  const shapes = root.append('g').attr('id', 'shapes')
  const markersG = root.append('g').attr('id', 'statues')

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 12])
    .on('zoom', (event) => {
      root.attr('transform', event.transform)
    })

  svg.call(zoom as any)

  document.getElementById('statues-reset-zoom')?.addEventListener('click', () => {
    svg.transition().duration(300).call(zoom.transform as any, d3.zoomIdentity)
  })

  const panel = document.getElementById('statues-panel')
  const nearbyEl = document.getElementById('statues-nearby')
  const countEl = document.getElementById('statues-count')
  const filterEl = document.getElementById('statues-filter') as HTMLSelectElement | null

  let allStatues: ReturnType<typeof parseStatue>[] = []
  let filterMode: FilterMode = 'all'

  function showPanel(d: NonNullable<ReturnType<typeof parseStatue>>) {
    if (!panel) return
    panel.hidden = false
    const colour = TYPE_COLOUR[d.type] || '#7f8c8d'
    panel.innerHTML = `
      <strong style="color:${colour}">${escapeHtml(d.name)}</strong>
      <div>${escapeHtml(TYPE_LABEL[d.type] || d.type)} · ${escapeHtml(d.form || '')}</div>
      <div>${escapeHtml(d.location)}</div>
      <div class="muted">${escapeHtml(d.artist || 'Artist unknown')}${d.year ? ` · ${escapeHtml(d.year)}` : ''}</div>
      ${d.url ? `<a href="${escapeAttr(d.url)}" target="_blank" rel="noopener">Source</a>` : ''}
      <button type="button" id="statues-panel-close">Close</button>
    `
    document.getElementById('statues-panel-close')?.addEventListener('click', () => {
      panel.hidden = true
    })
  }

  function showNearby(list: NonNullable<ReturnType<typeof parseStatue>>[]) {
    if (!nearbyEl) return
    if (list.length < 2) {
      nearbyEl.hidden = true
      nearbyEl.innerHTML = ''
      return
    }
    nearbyEl.hidden = false
    nearbyEl.innerHTML = `<div class="nearby-title">Nearby (${list.length})</div>` +
      list
        .slice(0, 8)
        .map(
          (d, i) =>
            `<button type="button" data-i="${i}" class="nearby-item">${escapeHtml(d.name)} <span class="muted">${escapeHtml(TYPE_LABEL[d.type] || d.type)}</span></button>`,
        )
        .join('')
    nearbyEl.querySelectorAll('button[data-i]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number((btn as HTMLElement).dataset.i)
        const d = list[i]
        if (d) showPanel(d)
      })
    })
  }

  function drawMarkers() {
    const visible = allStatues.filter(
      (s): s is NonNullable<typeof s> => !!s && matchesFilter(s.type, filterMode),
    )

    const womenN = visible.filter((s) => isWoman(s.type)).length
    const goatsN = visible.filter((s) => isGoat(s.type)).length
    if (countEl) {
      countEl.textContent = `${visible.length} shown · ${womenN} women · ${goatsN} goats`
    }
    const liveWomen = document.getElementById('live-women-count')
    const liveGoats = document.getElementById('live-goats-count')
    const liveTotal = document.getElementById('live-total-count')
    if (liveWomen) liveWomen.textContent = String(allStatues.filter((s) => s && isWoman(s.type)).length)
    if (liveGoats) liveGoats.textContent = String(allStatues.filter((s) => s && isGoat(s.type)).length)
    if (liveTotal) liveTotal.textContent = String(allStatues.filter(Boolean).length)

    const nodes = markersG
      .selectAll('circle')
      .data(visible, (d: any) => d.name + d.location)

    nodes.exit().remove()

    const enter = nodes
      .enter()
      .append('circle')
      .attr('r', 5)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.85)
      .style('cursor', 'pointer')

    enter
      .merge(nodes as any)
      .attr('fill', (d: any) => TYPE_COLOUR[d.type] || '#95a5a6')
      .attr('cx', (d: any) => {
        const j = jitter(d.latNum, d.longNum, d.name)
        return projection([j.long, j.lat])?.[0] || 0
      })
      .attr('cy', (d: any) => {
        const j = jitter(d.latNum, d.longNum, d.name)
        return projection([j.long, j.lat])?.[1] || 0
      })
      .on('mouseover', function (this: SVGCircleElement) {
        d3.select(this).attr('r', 8).attr('opacity', 1)
      })
      .on('mouseout', function (this: SVGCircleElement) {
        d3.select(this).attr('r', 5).attr('opacity', 0.85)
      })
      .on('click', (event: MouseEvent, d: any) => {
        event.stopPropagation()
        showPanel(d)
        const near = visible.filter((o) => {
          const dlat = o.latNum - d.latNum
          const dlon = o.longNum - d.longNum
          return dlat * dlat + dlon * dlon < 0.015 * 0.015
        })
        showNearby(near)
      })
  }

  filterEl?.addEventListener('change', () => {
    filterMode = (filterEl.value as FilterMode) || 'all'
    drawMarkers()
  })

  Promise.all([
    d3.json('/dataviz/uk.geojson').catch(() => d3.json('/dataviz/uk.50m.geojson')),
    d3.csv('/dataviz/statues.csv') as Promise<Statue[]>,
  ]).then(([ukGeoJson, statues]: [any, Statue[]]) => {
    shapes
      .selectAll('path')
      .data(ukGeoJson.features)
      .enter()
      .append('path')
      .attr('d', path as any)
      .style('stroke', '#9aa0a6')
      .style('stroke-width', 0.6)
      .attr('fill', '#eef1f4')

    // Legend
    const legend = svg.append('g').attr('id', 'legend').attr('transform', `translate(${w - 170}, 16)`)
    legend
      .append('rect')
      .attr('width', 155)
      .attr('height', 118)
      .attr('fill', 'rgba(255,255,255,0.92)')
      .attr('stroke', '#ccc')
      .attr('rx', 3)

    const legendItems = [
      ['woman', 'Woman'],
      ['woman_collective', 'Collective'],
      ['goat', 'Goat'],
      ['goat_with_figure', 'With figure'],
      ['goat_heraldic', 'Heraldic'],
      ['goat_relief', 'Relief'],
    ] as const

    legendItems.forEach(([key, label], i) => {
      const y = 18 + i * 16
      legend
        .append('circle')
        .attr('cx', 14)
        .attr('cy', y)
        .attr('r', 5)
        .attr('fill', TYPE_COLOUR[key])
        .attr('stroke', '#fff')
      legend
        .append('text')
        .attr('x', 26)
        .attr('y', y + 4)
        .attr('font-size', '11px')
        .text(label)
    })

    allStatues = statues.map(parseStatue).filter(Boolean)
    drawMarkers()
  })
})

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, '&#39;')
}
