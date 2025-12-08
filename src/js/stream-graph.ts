import { d3 } from './chart'
import {
  BuildSeriesResult,
  MetricKey,
  buildSeries,
  mergers,
  metricConfig,
  streamingRows,
} from './data/streaming'

type RenderState = {
  metric: MetricKey
}

type TooltipRow = {
  company: string
  value: number
}

const colours = d3
  .scaleOrdinal<string, string>()
  .range([
    '#1b9e77',
    '#d95f02',
    '#7570b3',
    '#e7298a',
    '#66a61e',
    '#e6ab02',
    '#a6761d',
    '#666666',
    '#1f78b4',
    '#b2df8a',
  ])

const margin = { top: 24, right: 24, bottom: 42, left: 48 }
const defaultWidth = 1100
const defaultHeight = 640

const renderState: RenderState = {
  metric: 'subscribers',
}

const root = document.getElementById('stream-graph')

if (root) {
  const width = root.clientWidth > 0 ? root.clientWidth : defaultWidth
  const height = defaultHeight
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  const svg = d3
    .select(root)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Stream graph of streaming services over time')

  const plot = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)
  const areaGroup = plot.append('g').attr('class', 'layers')
  const mergerGroup = plot.append('g').attr('class', 'merger-lines')
  const xAxisGroup = plot.append('g').attr('transform', `translate(0, ${innerHeight})`).attr('class', 'x-axis')
  const yAxisGroup = plot.append('g').attr('class', 'y-axis')

  const overlay = plot
    .append('rect')
    .attr('class', 'hover-surface')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .style('fill', 'transparent')

  const tooltip = d3.select('#stream-graph-tooltip')
  const legend = d3.select('#stream-graph-legend')
  const metricLabel = d3.select('#metric-label')

  const renderChart = (metric: MetricKey) => {
    const data: BuildSeriesResult = buildSeries(streamingRows, mergers, metric)
    const stackGenerator = d3
      .stack<BuildSeriesResult['stackInput'][number], string>()
      .keys(data.companies)
      .order(d3.stackOrderInsideOut)
      .offset(d3.stackOffsetWiggle)

    const layers = stackGenerator(data.stackInput)
    const yearsExtent = d3.extent(data.years) as [number, number]
    const xScale = d3.scaleLinear().domain(yearsExtent).range([0, innerWidth])

    const yMin = d3.min(layers, (layer) => d3.min(layer, (point) => point[0])) ?? 0
    const yMax = d3.max(layers, (layer) => d3.max(layer, (point) => point[1])) ?? 0
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]).nice()

    const area = d3
      .area<d3.SeriesPoint<BuildSeriesResult['stackInput'][number]>>()
      .x((point) => xScale(point.data.year))
      .y0((point) => yScale(point[0]))
      .y1((point) => yScale(point[1]))
      .curve(d3.curveCatmullRom)

    colours.domain(data.companies)

    const paths = areaGroup.selectAll<SVGPathElement, d3.Series<BuildSeriesResult['stackInput'][number], string>>(
      'path.layer',
    )

    paths
      .data(layers, (layer) => layer.key)
      .join(
        (enter) =>
          enter
            .append('path')
            .attr('class', 'layer')
            .attr('fill', (layer) => colours(layer.key) ?? '#888')
            .attr('d', area)
            .append('title')
            .text((layer) => layer.key),
        (update) =>
          update
            .attr('fill', (layer) => colours(layer.key) ?? '#888')
            .transition()
            .duration(450)
            .attr('d', area),
        (exit) => exit.transition().duration(250).style('opacity', 0).remove(),
      )

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'))
    xAxisGroup.transition().duration(300).call(xAxis)

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((value) => metricConfig[metric].format(Number(value)).replace(/[^0-9.-]/g, ''))
    yAxisGroup.transition().duration(300).call(yAxis)

    updateLegend(data.companies)
    drawMergers(data.years, xScale, yScale)
    metricLabel.text(metricConfig[metric].label)

    overlay.on('mousemove', (event: MouseEvent) => {
      const position = d3.pointer(event)
      const hoveredYear = Math.round(xScale.invert(position[0]))
      showTooltip(data, hoveredYear, position[0], position[1])
    })

    overlay.on('mouseleave', () => {
      tooltip.classed('visible', false)
    })
  }

  const showTooltip = (data: BuildSeriesResult, year: number, xPosition: number, yPosition: number) => {
    const yearValues = data.stackInput.find((row) => row.year === year)
    if (!yearValues) {
      tooltip.classed('visible', false)
      return
    }

    const rows: TooltipRow[] = data.companies
      .map((company) => ({
        company,
        value: yearValues[company],
      }))
      .filter((row) => row.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)

    const metric = renderState.metric
    const valueFormatter = metricConfig[metric].format

    const html = [
      `<div class="tooltip-year">${year}</div>`,
      ...rows.map(
        (row) =>
          `<div class="tooltip-row"><span class="swatch" style="background:${colours(row.company)}"></span>${row.company}: ${valueFormatter(
            row.value,
          )}</div>`,
      ),
    ].join('')

    tooltip.html(html)
    tooltip
      .style('left', `${margin.left + xPosition + 12}px`)
      .style('top', `${margin.top + yPosition + 12}px`)
      .classed('visible', true)
  }

  const updateLegend = (companies: string[]) => {
    const items = legend.selectAll<HTMLDivElement, string>('div.legend-item').data(companies, (company) => company)

    const entered = items
      .enter()
      .append('div')
      .attr('class', 'legend-item')
      .html((company) => `<span class="swatch" style="background:${colours(company)}"></span>${company}`)

    entered.merge(items as any).attr('aria-label', (company) => `Legend color for ${company}`)
    items.exit().remove()
  }

  const drawMergers = (
    years: number[],
    xScale: d3.ScaleLinear<number, number>,
    yScale: d3.ScaleLinear<number, number>,
  ) => {
    const yearMin = years[0]
    const yearMax = years[years.length - 1]

    const filtered = mergers.filter((merger) => merger.year >= yearMin && merger.year <= yearMax)

    const lines = mergerGroup.selectAll<SVGGElement, typeof mergers[number]>('g.merger').data(filtered, (merger) => {
      return `${merger.acquirer}-${merger.acquiree}-${merger.year}`
    })

    const enter = lines
      .enter()
      .append('g')
      .attr('class', 'merger')
      .attr('transform', (merger) => `translate(${xScale(merger.year)},0)`)

    enter
      .append('line')
      .attr('y1', 0)
      .attr('y2', yScale.range()[0])
      .attr('stroke', '#444')
      .attr('stroke-dasharray', '4 3')
      .attr('stroke-width', 1)

    enter
      .append('text')
      .attr('y', 12)
      .attr('x', 6)
      .attr('class', 'merger-label')
      .text((merger) => `${merger.year}: ${merger.acquiree} → ${merger.acquirer}`)

    lines
      .attr('transform', (merger) => `translate(${xScale(merger.year)},0)`)
      .select('line')
      .attr('y2', yScale.range()[0])

    lines.exit().remove()
  }

  const bindMetricToggle = () => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="metric-choice"]'))
    inputs.forEach((input) => {
      input.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement
        const selectedMetric = target.value as MetricKey
        renderState.metric = selectedMetric
        renderChart(selectedMetric)
      })
    })
  }

  bindMetricToggle()
  renderChart(renderState.metric)
}

