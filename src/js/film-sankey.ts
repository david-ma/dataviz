import { d3 } from './chart'
import * as d3sankey from 'd3-sankey'
import { filmMergers, SankeyData } from './film/film-mergers'

console.log("Running film-sankey.ts");

type SankeyGraph = {
  nodes: Array<{ name: string; category: string }>
  links: Array<{ source: string; target: string; value: number; year: number; label?: string }>
}

const categories = Array.from(new Set(filmMergers.nodes.map((node) => node.category)))

const color = d3
  .scaleOrdinal<string, string>()
  .domain(categories)
  .range(['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#1f78b4'])

const root = document.getElementById('film-sankey')
const tooltip = d3.select('#film-sankey-tooltip')
const notes = d3.select('#film-sankey-notes')

if (root) {
  const width = root.clientWidth > 0 ? root.clientWidth : 1100
  const height = 640

  const svg = d3
    .select(root)
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('role', 'img')
    .attr('aria-label', 'Sankey diagram of major studio and streaming mergers')

  const graph = buildGraph(filmMergers)

  const sankey = d3sankey
    .sankey<any, any>()
    .nodeId((node: any) => node.name)
    .nodeWidth(18)
    .nodePadding(22)
    .size([width - 40, height - 40])
    .nodeAlign(d3sankey.sankeyLeft)

  const layout: d3sankey.SankeyGraph<any, any> = sankey({
    nodes: graph.nodes.map((node) => ({ ...node })),
    links: graph.links.map((link) => ({ ...link })),
  })

  const linkGroup = svg.append('g').attr('transform', 'translate(20,20)').attr('class', 'links')
  const nodeGroup = svg.append('g').attr('transform', 'translate(20,20)').attr('class', 'nodes')

  linkGroup
    .selectAll('path')
    .data(layout.links as d3sankey.SankeyLink<any, any>[])
    .enter()
    .append('path')
    .attr('d', d3sankey.sankeyLinkHorizontal())
    .attr('fill', 'none')
    .attr('stroke', '#888')
    .attr('stroke-width', (link) => Math.max(1, link.width ?? 1))
    .attr('opacity', 0.6)
    .on('mousemove', function (event, link: any) {
      const message = link.label ?? `${link.source.name} → ${link.target.name} (${link.value}B, ${link.year})`
      showTooltip(event, message)
    })
    .on('mouseleave', hideTooltip)

  const node = nodeGroup
    .selectAll('g.node')
    .data(layout.nodes as d3sankey.SankeyNode<any, any>[])
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', (node) => `translate(${node.x0},${node.y0})`)

  node
    .append('rect')
    .attr('height', (node) => Math.max(8, node.y1 - node.y0))
    .attr('width', (node) => Math.max(1, node.x1 - node.x0))
    .attr('fill', (node: any) => color(node.category) ?? '#666')
    .attr('stroke', '#444')
    .on('mousemove', function (event, node: any) {
      const message = `${node.name} (${node.category})`
      showTooltip(event, message)
    })
    .on('mouseleave', hideTooltip)

  node
    .append('text')
    .attr('x', (node) => (node.x0 < width / 2 ? (node.x1 - node.x0) + 8 : -8))
    .attr('y', (node) => (node.y1 - node.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', (node) => (node.x0 < width / 2 ? 'start' : 'end'))
    .text((node: any) => node.name)
    .style('font-size', '12px')
    .style('fill', '#111')

  node
    .append('title')
    .text((node: any) => `${node.name} (${node.category})`)

  notes.html(
    filmMergers.notes
      .map((note) => `<div class="note-item">${note}</div>`)
      .join(''),
  )
}

function buildGraph(data: SankeyData): SankeyGraph {
  const nodes = data.nodes.map((node) => ({
    name: node.name,
    category: node.category,
  }))

  const links = data.links.map((link) => ({
    source: link.source,
    target: link.target,
    value: link.value,
    year: link.year,
    label: link.label,
  }))

  return { nodes, links }
}

function showTooltip(event: MouseEvent, text: string) {
  tooltip
    .html(text)
    .style('left', `${event.pageX + 12}px`)
    .style('top', `${event.pageY + 12}px`)
    .classed('visible', true)
}

function hideTooltip() {
  tooltip.classed('visible', false)
}

