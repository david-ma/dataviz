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
}

export class DroneOperationsScreen extends HalScreen {
  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-drone-operations',
      container: opts.container,
      width: 800,
      height: 260,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.grey || this.colors.darkNavy || '#243447')
  }

  update(data: DroneMetrics): void {
    this.clear()

    // Title
    this.svg.append('text')
      .attr('x', 20).attr('y', 30)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Futura, "Trebuchet MS", Arial, sans-serif')
      .attr('font-size', 18).attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('DRONE OPERATIONS')

    // Summary row
    const rowY = 70
    const colX = [20, 220, 420, 620]
    const labels = ['Harvesters', 'Wire Drones', 'Matter', 'Unused Clips']
    const values = [
      `LVL ${data.harvesterLevel.toLocaleString()}`,
      `LVL ${data.wireDroneLevel.toLocaleString()}`,
      `${Math.max(0, data.availableMatter || 0).toLocaleString()}`,
      `${Math.max(0, data.unusedClips || 0).toLocaleString()}`
    ]
    labels.forEach((label, i) => {
      this.svg.append('text')
        .attr('x', colX[i]).attr('y', rowY)
        .attr('fill', this.colors.labelGrey || this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 11)
        .text(label)

      this.svg.append('text')
        .attr('x', colX[i]).attr('y', rowY + 20)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 16).attr('font-weight', 'bold')
        .text(values[i])
    })

    // Costs row
    const costY = 130
    const costLabels = ['Harvester Cost', 'Wire Drone Cost', 'Drone Ratio', 'Max Level']
    const maxLevel = data.harvesterLevel + data.wireDroneLevel
    const costValues = [
      `$${(data.harvesterCost || 0).toLocaleString()}`,
      `$${(data.wireDroneCost || 0).toLocaleString()}`,
      `${(data.droneRatio || 0).toFixed(2)} : 1`,
      `${maxLevel.toLocaleString()}`
    ]

    costLabels.forEach((label, i) => {
      this.svg.append('text')
        .attr('x', colX[i]).attr('y', costY)
        .attr('fill', this.colors.labelGrey || this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 11)
        .text(label)

      this.svg.append('text')
        .attr('x', colX[i]).attr('y', costY + 20)
        .attr('fill', this.colors.text)
        .attr('font-family', 'Consolas, "Fira Mono", monospace')
        .attr('font-size', 16).attr('font-weight', 'bold')
        .text(costValues[i])
    })

    // Simple bars for level comparison
    const barY = 200
    const barMaxWidth = 180
    const maxLevelValue = Math.max(1, data.harvesterLevel + data.wireDroneLevel)
    const harvesterWidth = barMaxWidth * (data.harvesterLevel / maxLevelValue)
    const wireWidth = barMaxWidth * (data.wireDroneLevel / maxLevelValue)

    this.drawBar(colX[0], barY, harvesterWidth, this.colors.primary || '#4ecdc4', 'Harvesters')
    this.drawBar(colX[1], barY, wireWidth, this.colors.secondary || '#ffe66d', 'Wire Drones')
  }

  private drawBar(x: number, y: number, width: number, color: string, label: string) {
    const barHeight = 14
    this.svg.append('rect')
      .attr('x', x).attr('y', y - barHeight)
      .attr('width', Math.max(2, width))
      .attr('height', barHeight)
      .attr('fill', color)
      .attr('opacity', 0.85)

    this.svg.append('text')
      .attr('x', x).attr('y', y + 16)
      .attr('fill', this.colors.text)
      .attr('font-family', 'Consolas, "Fira Mono", monospace')
      .attr('font-size', 11)
      .text(label)
  }
}

