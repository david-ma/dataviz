import { d3 } from '../chart'
import { HalScreen, HalColors } from './hal-screen-base'
import './hal-screen-types'

type DroneMetrics = {
  harvesterLevel: number
  wireDroneLevel: number
  harvesterCost: number
  wireDroneCost: number
  availableMatter: number
  unusedClips: number
  droneRatio: number
  factoryCount?: number
}

export class DroneOperationsScreen extends HalScreen {
  private initialized = false

  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-drone-operations',
      container: opts.container,
      width: 800,
      height: 240,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.grey || '#7B7B7B')
  }

  update(data: DroneMetrics): void {
    if (!this.initialized) {
      this.initializeLayout()
      this.initialized = true
    }

    this.updateMetrics(data)
    this.updateBars(data)
  }

  private initializeLayout() {
    // Title
    this.svg.append('text')
      .attr('x', 20).attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18).attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('DRONE OPERATIONS')

    // Metric labels
    const rowY = 70
    const colX = [20, 220, 420, 620]
    const labels = ['Harvesters', 'Wire Drones', 'Matter', 'Unused Clips']
    labels.forEach((label, i) => {
      this.svg.append('text')
        .attr('id', `metric-label-${i}`)
        .attr('x', colX[i]).attr('y', rowY)
        .attr('fill', this.colors.labelGrey || this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 11)
        .text(label)

      this.svg.append('text')
        .attr('id', `metric-value-${i}`)
        .attr('x', colX[i]).attr('y', rowY + 20)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 16).attr('font-weight', 'bold')
        .text('—')
    })

    // Costs
    const costY = 130
    const costLabels = ['Harvester Cost', 'Wire Drone Cost', 'Drone Ratio', 'Max Level']
    const costColX = [20, 220, 420, 620]
    costLabels.forEach((label, i) => {
      this.svg.append('text')
        .attr('id', `cost-label-${i}`)
        .attr('x', costColX[i]).attr('y', costY)
        .attr('fill', this.colors.labelGrey || this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 11)
        .text(label)

      this.svg.append('text')
        .attr('id', `cost-value-${i}`)
        .attr('x', costColX[i]).attr('y', costY + 20)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 16).attr('font-weight', 'bold')
        .text('—')
    })

    // Bars placeholders
    this.svg.append('rect').attr('id', 'bar-harvesters')
    this.svg.append('rect').attr('id', 'bar-wiredrones')
    this.svg.append('text').attr('id', 'bar-label-harvesters')
    this.svg.append('text').attr('id', 'bar-label-wiredrones')

  }

  private updateMetrics(data: DroneMetrics) {
    const values = [
      `LVL ${data.harvesterLevel.toLocaleString()}`,
      `LVL ${data.wireDroneLevel.toLocaleString()}`,
      `${Math.max(0, data.availableMatter || 0).toLocaleString()}`,
      `${Math.max(0, data.unusedClips || 0).toLocaleString()}`
    ]
    values.forEach((val, i) => {
      this.svg.select(`#metric-value-${i}`).text(val)
    })

    const maxLevel = data.harvesterLevel + data.wireDroneLevel
    const costValues = [
      `$${(data.harvesterCost || 0).toLocaleString()}`,
      `$${(data.wireDroneCost || 0).toLocaleString()}`,
      `${(data.droneRatio || 0).toFixed(2)} : 1`,
      `${maxLevel.toLocaleString()}`
    ]
    costValues.forEach((val, i) => {
      this.svg.select(`#cost-value-${i}`).text(val)
    })
  }

  private updateBars(data: DroneMetrics) {
    const colX = [20, 220]
    const barY = 230
    const barMaxWidth = 180
    const maxLevelValue = Math.max(1, data.harvesterLevel + data.wireDroneLevel)
    const harvesterWidth = barMaxWidth * (data.harvesterLevel / maxLevelValue)
    const wireWidth = barMaxWidth * (data.wireDroneLevel / maxLevelValue)

    this.drawBar(colX[0], barY, harvesterWidth, this.colors.primary || '#4ecdc4', 'harvesters')
    this.drawBar(colX[1], barY, wireWidth, this.colors.secondary || '#ffe66d', 'wiredrones')
  }

  private drawBar(x: number, y: number, width: number, color: string, labelKey: string) {
    const barHeight = 14
    this.svg.select(`#bar-${labelKey}`)
      .attr('x', x).attr('y', y - barHeight)
      .attr('width', Math.max(2, width))
      .attr('height', barHeight)
      .attr('fill', color)
      .attr('opacity', 0.85)

    this.svg.select(`#bar-label-${labelKey}`)
      .attr('x', x).attr('y', y + 16)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 11)
      .text(labelKey === 'harvesters' ? 'Harvesters' : 'Wire Drones')
  }
}

