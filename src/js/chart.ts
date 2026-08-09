/**
 * Chart – reusable D3/canvas visualisation stage for Thalia/dataviz.
 *
 * Upstreamable workbench: bind a DOM element, get margins/title/plot (or canvas),
 * then draw via scratchpad() / ready(). Domain helpers live in sibling modules:
 *   chart-map.ts   – MapChart (geo)
 *   chart-extras.ts – ExtrasChart (treemap, generalisedLineChart) for legacy posts
 *   datatable.ts   – decorateTable
 */

import * as d3 from 'd3'
import * as THREE from 'three'

import $ from 'jquery'
import _ from 'lodash'

import { decorateTable, type DataTableConfig, type DataTableDataset } from './datatable'

export type { DataTableConfig, DataTableDataset }

/** Options for the Chart constructor. */
export type ChartOptions = {
  element?: string
  data?: any[] | {}
  title?: string
  xLabel?: string
  yLabel?: string
  width?: number
  height?: number
  margin?: number | { top: number; right: number; bottom: number; left: number }
  colours?: string[]
  nav?: boolean
  renderer?: 'canvas' | 'svg' | 'canvas-webgl2' | 'webgpu' | 'three.js'
  /** When true, draw a skeleton with "<title> loading..." until ready(callback). */
  loading?: boolean
}

/** @internal Alias for backward compatibility. */
type chartOptions = ChartOptions

type Position = {
  x: number
  y: number
}

/*
 * David Ma – Chart workbench (slim core, 2026 rebuild)
 */
export class Chart {
  opts: any
  element: string
  data: any
  title: string
  xLabel: string
  yLabel: string
  width: number
  height: number
  margin: { top: number; right: number; bottom: number; left: number }
  colours: Array<string>
  color?: d3.ScaleOrdinal<string, any>
  innerHeight: number
  innerWidth: number
  fullscreen: boolean
  renderer?: 'canvas' | 'svg' | 'canvas-webgl2' | 'webgpu' | 'three.js'
  mouse_position: Position

  svg: any
  canvas: any
  context: any
  three_renderer: THREE.WebGLRenderer
  plot: any
  // @ts-ignore
  xScale: d3.ScaleLinear<number, number>
  // @ts-ignore
  yBand: d3.ScaleBand<string>

  constructor(opts: chartOptions) {
    this.opts = opts
    this.element = opts.element || 'chart'
    this.renderer = opts.renderer || 'svg'
    this.data = opts.data ?? []

    if (typeof document !== 'undefined' && !document.getElementById(this.element)) {
      console.warn(`Chart: element #${this.element} not found in DOM; chart may not be visible.`)
    }
    this.title = opts.title || ''
    this.xLabel = opts.xLabel || ''
    this.yLabel = opts.yLabel || ''

    this.width = opts.width || 960
    this.height = opts.height || 600
    this.mouse_position = { x: 0, y: 0 }

    if (opts.margin && typeof opts.margin !== 'number') {
      this.margin = opts.margin
    } else if (opts.margin !== null && typeof opts.margin === 'number') {
      this.margin = {
        top: opts.margin,
        right: opts.margin,
        bottom: opts.margin,
        left: opts.margin,
      }
    } else {
      this.margin = { top: 70, right: 70, bottom: 50, left: 70 }
    }

    // Default colours from ColorBrewer 2.0
    // http://colorbrewer2.org/?type=qualitative&scheme=Dark2&n=8
    this.colours = opts.colours || [
      '#1b9e77',
      '#d95f02',
      '#7570b3',
      '#e7298a',
      '#66a61e',
      '#e6ab02',
      '#a6761d',
      '#666666',
    ]

    this.innerHeight = this.height - (this.margin.top + this.margin.bottom)
    this.innerWidth = this.width - (this.margin.right + this.margin.left)

    if (this.renderer === 'canvas') {
      this.canvas = d3
        .select(`#${this.element}`)
        .style('aspect-ratio', `${this.width}/${this.height}`)
        .classed('stacked-canvas', true)
        .classed('chart', true)
        .append('canvas')
        .attr('width', this.width)
        .attr('height', this.height)
        .style('background', 'rgba(0,0,0,0.05)')

      this.context = this.canvas.node().getContext('2d')
    } else if (this.renderer === 'canvas-webgl2') {
      this.canvas = d3
        .select(`#${this.element}`)
        .style('aspect-ratio', `${this.width}/${this.height}`)
        .classed('stacked-canvas', true)
        .classed('chart', true)
        .append('canvas')
        .attr('width', this.width)
        .attr('height', this.height)
        .style('background', 'rgba(0,0,0,0.05)')

      this.context = this.canvas.node().getContext('webgl2')
    } else if (this.renderer === 'webgpu') {
      this.canvas = d3
        .select(`#${this.element}`)
        .style('aspect-ratio', `${this.width}/${this.height}`)
        .classed('stacked-canvas', true)
        .classed('chart', true)
        .append('canvas')
        .attr('width', this.width)
        .attr('height', this.height)
        .style('background', 'rgba(0,0,0,0.05)')

      this.context = this.canvas.node().getContext('webgpu')
    } else if (this.renderer === 'three.js') {
      console.log('Add a three.js renderer & canvas to:', this.element)

      d3.select(`#${this.element}`)
        .style('aspect-ratio', `${this.width}/${this.height}`)
        .classed('stacked-canvas', true)

      this.three_renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      })

      const container = document.getElementById(this.element)
      if (container) {
        container.appendChild(this.three_renderer.domElement)
      }
      this.three_renderer.setSize(this.width, this.height)

      this.context = this.three_renderer.getContext()
      this.canvas = d3
        .select(`#${this.element} canvas`)
        .style('display', '')
        .style('width', '')
        .style('height', '')
    }

    this.svg = d3
      .select(`#${this.element}`)
      .classed('chart', true)
      .append('svg')
      .on('mousemove', (event) => {
        const [x, y] = d3.pointer(event)
        this.mouse_position = { x, y }
      })
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .style('background', 'rgba(0,0,0,0.05)')

    this.fullscreen = false

    if (this.xLabel) {
      this.addxLabel()
    }

    if (this.yLabel) {
      this.addyLabel()
    }

    this.draw()
  }

  // Draws the plot and individual parts of the plot
  draw() {
    this.plot = this.svg
      .append('g')
      .classed('plot', true)
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`)

    // Add the background
    this.plot
      .append('rect')
      .attr('fill', 'white')
      .attr('x', 0)
      .attr('y', 0)
      .attr('height', this.innerHeight)
      .attr('width', this.innerWidth)
    // .attrs({
    //     fill: "white",
    //     x: 0,
    //     y: 0,
    //     height: this.innerHeight,
    //     width: this.innerWidth
    // });

    if (this.opts.nav !== false) {
      this.drawNav()
    }

    // Add the title
    this.svg
      .append('text')
      .attr('transform', `translate(${this.width / 2},${this.margin.top / 2})`)
      .attr('class', 'chart-title')
      .attr('font-size', '24px')
      .attr('font-weight', '700')
      .attr('text-anchor', 'middle')
      .attr('x', 0)
      .attr('y', 0)
      .text(this.title)

    if (this.opts.loading) {
      const loading = this.plot
        .append('g')
        .attr('class', 'chart-loading')
      loading
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', this.innerWidth)
        .attr('height', this.innerHeight)
        .attr('fill', '#f8f9fa')
      loading
        .append('text')
        .attr('x', this.innerWidth / 2)
        .attr('y', this.innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#6c757d')
        .style('font-size', '16px')
        .text(this.title ? `${this.title} loading…` : 'Loading…')
    }
  }

  /**
   * Remove the loading skeleton and run the callback to draw the real chart.
   * Call after data is loaded when the chart was created with loading: true.
   */
  ready(callback: (chart: this) => void): this {
    this.plot.selectAll('.chart-loading').remove()
    callback(this)
    return this
  }

  drawNav() {
    const nav = d3
      .select(`#${this.element}`)
      .append('div')
      .classed('chart-nav', true)

    nav
      .append('div')
      .datum(this)
      .on('click', this.toggleFullscreen)
      .append('span')
      .classed('expander', true)
      .append('i')
      .classed('fa fa-lg fa-expand', true)

    nav
      .append('div')
      .datum(this)
      .attr('title', 'Download as PNG')
      .classed('chart-download-png', true)
      .on('click', function (this: HTMLElement) {
        const chart = d3.select(this).datum() as Chart
        chart.exportPNG()
      })
      .append('span')
      .append('i')
      .classed('fa fa-download', true)

    $(`#${this.element}`).dblclick(() => this.toggleFullscreen())
  }

  /**
   * Export the chart as a PNG and trigger a download. Works for SVG and canvas renderers.
   * No extra dependencies; uses browser Canvas API. Filename defaults to element id or "chart".
   */
  exportPNG(filename?: string): void {
    const name = filename ?? `${this.element || 'chart'}.png`

    if (this.renderer === 'canvas' && this.canvas?.node()) {
      const dataUrl = (this.canvas.node() as HTMLCanvasElement).toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = name
      a.click()
      return
    }

    const svgEl = this.svg?.node()
    if (!svgEl || !(svgEl instanceof SVGElement)) return

    const serializer = new XMLSerializer()
    const str = serializer.serializeToString(svgEl)
    const blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    const w = this.width
    const h = this.height

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        return
      }
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
    }
    img.onerror = () => URL.revokeObjectURL(url)
    img.src = url
  }

  toggleFullscreen(chart?: Chart) {
    chart = chart || this

    if (chart.fullscreen) {
      shrink()
    } else {
      grow()
    }

    // function keydownHandler(e: JQuery.Event) {
    function keydownHandler(e: any) {
      if (e && e.keyCode && e.keyCode === 27) {
        shrink()
      }
    }

    function shrink() {
      console.log('Already fullscreen, minimise!')
      chart.fullscreen = false

      $('#big-chart svg').detach().appendTo(`#${chart.element}`)
      $('#big-chart').remove()
      $('body').off('keydown.chart', keydownHandler)
    }

    function grow() {
      console.log("Let's make it BIG!")
      chart.fullscreen = true

      $("<div id='big-chart' class='chart'></div>").insertBefore('body header')
      $(`#${chart.element} svg`).detach().appendTo('#big-chart')

      $('body').on('keydown.chart', keydownHandler)
    }
  }

  addxLabel() {
    const x = this.margin.left + this.innerWidth / 2
    const y = this.height - 5

    this.svg
      .append('g')
      .attr('transform', `translate(${x},${y})`)
      .style('text-anchor', 'middle')
      .append('text')
      .text(this.xLabel)
  }

  addyLabel() {
    const x = 5
    const y = this.margin.top + this.innerHeight / 2

    this.svg
      .append('g')
      .attr('transform', `matrix(0,1,-1,0,${x},${y})`)
      .style('text-anchor', 'middle')
      .append('text')
      .text(this.yLabel)
  }


  clear_canvas() {
    // if 2d context
    if (this.canvas) {
      if (this.canvas.node().getContext('2d')) {
        this.context.fillStyle = '#213'
        this.context.fillRect(0, 0, this.width, this.height)
      } else if (this.canvas.node().getContext('webgl2')) {
        this.context.clear(this.context.COLOR_BUFFER_BIT)
        this.context.clearColor(0.129, 0.129, 0.129, 1.0)
        this.canvas.style('background-color', '#213')
      } else if (this.canvas.node().getContext('webgpu')) {
        // this.context.clearColor(0.129, 0.129, 0.129, 1.0)
        // this.context.clear(this.context.COLOR_BUFFER_BIT)
      }
    }

    this.svg.selectAll('*').remove()
    return this
  }

  asyncScratchpad(
    callback: (chart: Chart) => Promise<void> | Promise<Chart>,
  ): Promise<Chart> {
    const that = this
    return callback(this).then(() => this || that)
  }

  /** Run a callback with this chart so the caller can draw into this.plot. Returns this for chaining. */
  scratchpad(callback: (chart: Chart) => Chart | void): Chart {
    return callback(this) || this
  }
}

/**
 * Sanitise a string for use as an HTML id or CSS-friendly class.
 */
export function classifyName(name: string): string {
  return name.replace(/[\/\\!\[\]&\s()\.']/gi, '-')
}

export { decorateTable, $, _, d3 }
