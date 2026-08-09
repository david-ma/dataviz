/**
 * Build slim chart.ts + chart-map.ts + chart-extras.ts from _chart_monolith.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'

const lines = readFileSync('src/js/_chart_monolith.ts', 'utf8').split('\n')
const L = (a: number, b: number) => lines.slice(a, b).join('\n') // 0-based, end exclusive

const coreHeader = `/**
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

`

// Class body pieces from monolith (0-based indices from chart-section-index)
// class Chart starts at line 110 (index 110)
// constructor through toggleFullscreen: 145-465 (indices 145-465)
// But we need fields 111-143 and constructor from 145

const classStart = `/*
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

`

// constructor is indices 145-276 (through end of constructor), draw 278-338, ready 344-348, drawNav-exportPNG-toggleFullscreen 350-465
// clear_canvas 1439-1457, asyncScratchpad 1459-1465, scratchpad 1467-1470

const constructorThruFullscreen = L(145, 465) // constructor ... toggleFullscreen closing brace
const clearScratch = L(1439, 1470)

const coreFooter = `
}

/**
 * Sanitise a string for use as an HTML id or CSS-friendly class.
 */
export function classifyName(name: string): string {
  return name.replace(/[\\/\\\\!\\[\\]&\\s()\\.']/gi, '-')
}

export { Chart as default, decorateTable, $, d3, classifyName }
`

// Fix: we're exporting Chart twice - class is export class Chart, footer shouldn't re-export Chart as named from itself oddly
const coreFooter2 = `
}

/**
 * Sanitise a string for use as an HTML id or CSS-friendly class.
 */
export function classifyName(name: string): string {
  return name.replace(/[\\/\\\\!\\[\\]&\\s()\\.']/gi, '-')
}

export { decorateTable, $, d3 }
`

const axisLabels = L(953, 977)

writeFileSync(
  'src/js/chart.ts',
  coreHeader +
    classStart +
    constructorThruFullscreen +
    '\n\n' +
    axisLabels +
    '\n\n' +
    clearScratch +
    coreFooter2,
)

console.log('wrote chart.ts', readFileSync('src/js/chart.ts', 'utf8').split('\n').length)
