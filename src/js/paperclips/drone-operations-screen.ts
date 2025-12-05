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

type DroneAgent = {
  id: number
  lon: number
  lat: number
  type: 'harvester' | 'wire'
}

type SolarPatch = {
  id: number
  lon: number
  lat: number
  radius: number
  growth: number
}

export class DroneOperationsScreen extends HalScreen {
  private initialized = false
  private projection: d3.GeoProjection | null = null
  private globeGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null = null
  private agents: DroneAgent[] = []
  private solarPatches: SolarPatch[] = []
  private nextAgentId = 0
  private nextPatchId = 0
  private globeRadius = 110
  private centerX = 600
  private centerY = 140
  private timer: d3.Timer | null = null
  private lastUpdate = Date.now()

  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-drone-operations',
      container: opts.container,
      width: 800,
      height: 320,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.grey || this.colors.darkNavy || '#243447')
  }

  update(data: DroneMetrics): void {
    if (!this.initialized) {
      this.initializeLayout()
      this.initialized = true
    }

    this.updateMetrics(data)
    this.updateBars(data)
    this.updateGlobeAgents(data)
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

    // Globe
    this.centerX = 600
    this.centerY = 180
    this.globeRadius = 110
    this.projection = d3.geoOrthographic()
      .scale(this.globeRadius)
      .center([0, 0])
      .rotate([0, -20])
      .translate([this.centerX, this.centerY])

    this.globeGroup = this.svg.append('g').attr('id', 'drone-globe')

    const graticule = d3.geoGraticule()
    const path = d3.geoPath(this.projection)

    this.globeGroup.append('circle')
      .attr('cx', this.centerX).attr('cy', this.centerY).attr('r', this.globeRadius)
      .attr('fill', '#0b1022')
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 1)

    this.globeGroup.append('path')
      .datum(graticule())
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .attr('stroke-width', 0.8)
      .attr('d', path)

    this.globeGroup.append('path')
      .datum({ type: 'Sphere' })
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.15)')
      .attr('stroke-width', 1)
      .attr('d', path)

    this.globeGroup.append('g').attr('id', 'globe-patches')
    this.globeGroup.append('g').attr('id', 'globe-agents')
    this.globeGroup.append('g').attr('id', 'globe-factories')

    // Seed initial rings/patches
    this.solarPatches.push({
      id: this.nextPatchId++,
      lon: 0,
      lat: 0,
      radius: 12,
      growth: 8
    })

    // Timer to animate agents/patches
    this.timer = d3.timer(() => this.tickAgents())
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

  private updateGlobeAgents(data: DroneMetrics) {
    if (!this.projection || !this.globeGroup) return

    const desiredHarvesters = Math.min(60, Math.max(2, data.harvesterLevel))
    const desiredWire = Math.min(60, Math.max(2, data.wireDroneLevel))
    const desiredFactories = Math.max(1, data.factoryCount || Math.floor((data.harvesterLevel + data.wireDroneLevel) / 2) || 1)

    const adjustAgents = (count: number, type: 'harvester' | 'wire') => {
      const current = this.agents.filter(a => a.type === type)
      if (current.length < count) {
        const toAdd = count - current.length
        for (let i = 0; i < toAdd; i++) {
          this.agents.push({
            id: this.nextAgentId++,
            lon: Math.random() * 360 - 180,
            lat: Math.random() * 180 - 90,
            type
          })
        }
      } else if (current.length > count) {
        const removeIds = current.slice(0, current.length - count).map(a => a.id)
        this.agents = this.agents.filter(a => !removeIds.includes(a.id))
      }
    }
    adjustAgents(desiredHarvesters, 'harvester')
    adjustAgents(desiredWire, 'wire')

    // Maintain solar patches up to 8
    if (this.solarPatches.length < 8) {
      this.solarPatches.push({
        id: this.nextPatchId++,
        lon: Math.random() * 360 - 180,
        lat: Math.random() * 140 - 70,
        radius: 6 + Math.random() * 8,
        growth: 6 + Math.random() * 10
      })
    }

    // Factories (static dots)
    const factories = d3.range(desiredFactories).map((i) => ({
      id: i,
      lon: -150 + (i * 40) % 300 + Math.random() * 5,
      lat: -50 + ((i * 22) % 100) + Math.random() * 3
    }))

    const path = d3.geoPath(this.projection)
    const agentGroup = this.globeGroup.select<SVGGElement>('#globe-agents')
    const patchGroup = this.globeGroup.select<SVGGElement>('#globe-patches')
    const factoryGroup = this.globeGroup.select<SVGGElement>('#globe-factories')

    // Agents
    const agentsSel = agentGroup.selectAll<SVGCircleElement, DroneAgent>('circle.agent').data(this.agents, d => d.id as any)
    agentsSel.enter()
      .append('circle')
      .attr('class', 'agent')
      .attr('r', 3)
      .attr('fill', d => d.type === 'harvester' ? (this.colors.primary || '#4ecdc4') : (this.colors.secondary || '#ffe66d'))
      .attr('opacity', 0.85)
    agentsSel.exit().remove()

    agentsSel
      .attr('cx', d => {
        const p = this.projection!([d.lon, d.lat])
        return p ? p[0] : -999
      })
      .attr('cy', d => {
        const p = this.projection!([d.lon, d.lat])
        return p ? p[1] : -999
      })

    // Solar patches
    const patchesSel = patchGroup.selectAll<SVGCircleElement, SolarPatch>('circle.patch').data(this.solarPatches, d => d.id as any)
    patchesSel.enter()
      .append('circle')
      .attr('class', 'patch')
      .attr('fill', this.colors.violet || 'rgba(255,255,255,0.3)')
      .attr('opacity', 0.12)
    patchesSel.exit().remove()

    patchesSel
      .attr('cx', d => this.projection!([d.lon, d.lat])![0])
      .attr('cy', d => this.projection!([d.lon, d.lat])![1])
      .attr('r', d => d.radius)
      .attr('opacity', d => 0.18 * (1 - Math.min(1, d.radius / 140)))

    // Factories
    const factorySel = factoryGroup.selectAll<SVGCircleElement, any>('circle.factory').data(factories, d => d.id as any)
    factorySel.enter()
      .append('circle')
      .attr('class', 'factory')
      .attr('r', 4.5)
      .attr('fill', this.colors.burgundy || '#6B2424')
      .attr('stroke', 'rgba(255,255,255,0.5)')
      .attr('stroke-width', 1)
      .attr('opacity', 0.9)
    factorySel.exit().remove()

    factorySel
      .attr('cx', d => this.projection!([d.lon, d.lat])![0])
      .attr('cy', d => this.projection!([d.lon, d.lat])![1])
  }

  private tickAgents() {
    if (!this.projection || !this.globeGroup) return
    const now = Date.now()
    const deltaSec = (now - this.lastUpdate) / 1000
    this.lastUpdate = now

    // Move agents
    this.agents.forEach(agent => {
      const drift = agent.type === 'harvester' ? 14 : 18
      agent.lon += (Math.random() - 0.5) * drift * deltaSec
      agent.lat += (Math.random() - 0.5) * drift * deltaSec
      if (agent.lon > 180) agent.lon -= 360
      if (agent.lon < -180) agent.lon += 360
      agent.lat = Math.max(-85, Math.min(85, agent.lat))
    })

    // Grow patches
    this.solarPatches.forEach(p => {
      p.radius += p.growth * deltaSec
    })
    this.solarPatches = this.solarPatches.filter(p => p.radius < 160)

    // Update positions
    const agentGroup = this.globeGroup.select<SVGGElement>('#globe-agents')
    agentGroup.selectAll<SVGCircleElement, DroneAgent>('circle.agent')
      .attr('cx', d => {
        const p = this.projection!([d.lon, d.lat]); return p ? p[0] : -999
      })
      .attr('cy', d => {
        const p = this.projection!([d.lon, d.lat]); return p ? p[1] : -999
      })

    const patchGroup = this.globeGroup.select<SVGGElement>('#globe-patches')
    patchGroup.selectAll<SVGCircleElement, SolarPatch>('circle.patch')
      .attr('cx', d => this.projection!([d.lon, d.lat])![0])
      .attr('cy', d => this.projection!([d.lon, d.lat])![1])
      .attr('r', d => d.radius)
      .attr('opacity', d => 0.18 * (1 - Math.min(1, d.radius / 140)))
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

