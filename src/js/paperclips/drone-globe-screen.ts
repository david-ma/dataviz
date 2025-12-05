import { d3 } from '../chart'
import { HalScreen, HalColors } from './hal-screen-base'
import './hal-screen-types'

type DroneGlobeData = {
  harvesterLevel: number
  wireDroneLevel: number
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

export class DroneGlobeScreen extends HalScreen {
  private projection: d3.GeoProjection | null = null
  private globeGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null = null
  private agents: DroneAgent[] = []
  private solarPatches: SolarPatch[] = []
  private nextAgentId = 0
  private nextPatchId = 0
  private globeRadius = 150
  private centerX = 210
  private centerY = 210
  private lastUpdate = Date.now()
  private timer: d3.Timer | null = null

  constructor(opts: { container: string; colors: HalColors }) {
    super({
      id: 'hal-drone-globe',
      container: opts.container,
      width: 420,
      height: 420,
      colors: opts.colors
    })
    // Use a distinct HAL panel color (teal) so we are not reusing dark navy everywhere
    this.svg.style('background', this.colors.teal || '#1C6B74')
  }

  update(data: DroneGlobeData): void {
    if (!this.globeGroup) {
      this.initializeGlobe()
    }
    this.updateAgents(data)
  }

  private initializeGlobe() {
    this.centerX = this.width / 2
    this.centerY = this.height / 2
    this.globeRadius = Math.min(this.width, this.height) * 0.36

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
      .attr('stroke', 'rgba(255,255,255,0.12)')
      .attr('stroke-width', 1)

    this.globeGroup.append('path')
      .datum(graticule())
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.12)')
      .attr('stroke-width', 0.9)
      .attr('d', path)

    this.globeGroup.append('path')
      .datum({ type: 'Sphere' })
      .attr('fill', 'rgba(255,255,255,0.03)')
      .attr('stroke', 'rgba(255,255,255,0.18)')
      .attr('stroke-width', 1)
      .attr('d', path)

    this.globeGroup.append('g').attr('id', 'globe-patches')
    this.globeGroup.append('g').attr('id', 'globe-agents')
    this.globeGroup.append('g').attr('id', 'globe-factories')

    // Seed patches
    for (let i = 0; i < 4; i++) {
      this.solarPatches.push({
        id: this.nextPatchId++,
        lon: Math.random() * 360 - 180,
        lat: Math.random() * 140 - 70,
        radius: 8 + Math.random() * 10,
        growth: 6 + Math.random() * 8
      })
    }

    this.timer = d3.timer(() => this.tick())
  }

  private updateAgents(data: DroneGlobeData) {
    if (!this.projection || !this.globeGroup) return

    const desiredHarvesters = Math.min(80, Math.max(3, data.harvesterLevel))
    const desiredWire = Math.min(80, Math.max(3, data.wireDroneLevel))
    const desiredFactories = Math.max(1, data.factoryCount || Math.floor((data.harvesterLevel + data.wireDroneLevel) / 2) || 1)

    const syncAgents = (count: number, type: 'harvester' | 'wire') => {
      const current = this.agents.filter(a => a.type === type)
      if (current.length < count) {
        for (let i = 0; i < count - current.length; i++) {
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
    syncAgents(desiredHarvesters, 'harvester')
    syncAgents(desiredWire, 'wire')

    // Factories
    const factories = d3.range(desiredFactories).map((i) => ({
      id: i,
      lon: -160 + (i * 36) % 320 + Math.random() * 4,
      lat: -60 + ((i * 26) % 120) + Math.random() * 4
    }))

    const agentGroup = this.globeGroup.select<SVGGElement>('#globe-agents')
    const patchGroup = this.globeGroup.select<SVGGElement>('#globe-patches')
    const factoryGroup = this.globeGroup.select<SVGGElement>('#globe-factories')

    // Agents
    const agentsSel = agentGroup.selectAll<SVGCircleElement, DroneAgent>('circle.agent').data(this.agents, d => d.id as any)
    agentsSel.enter()
      .append('circle')
      .attr('class', 'agent')
      .attr('r', 3)
      .attr('fill', d => d.type === 'harvester' ? '#74b9ff' : '#ffe66d') // soft blue for harvesters, soft yellow for wire
      .attr('opacity', 0.9)
    agentsSel.exit().remove()

    agentsSel
      .attr('cx', d => {
        const p = this.projection!([d.lon, d.lat]); return p ? p[0] : -999
      })
      .attr('cy', d => {
        const p = this.projection!([d.lon, d.lat]); return p ? p[1] : -999
      })

    // Patches
    const patchesSel = patchGroup.selectAll<SVGCircleElement, SolarPatch>('circle.patch').data(this.solarPatches, d => d.id as any)
    patchesSel.enter()
      .append('circle')
      .attr('class', 'patch')
      .attr('fill', 'rgba(255,255,255,0.22)')
      .attr('opacity', 0.14)
    patchesSel.exit().remove()

    patchesSel
      .attr('cx', d => this.projection!([d.lon, d.lat])![0])
      .attr('cy', d => this.projection!([d.lon, d.lat])![1])
      .attr('r', d => d.radius)
      .attr('opacity', d => 0.16 * (1 - Math.min(1, d.radius / 180)))

    // Factories
    const factorySel = factoryGroup.selectAll<SVGCircleElement, any>('circle.factory').data(factories, d => d.id as any)
    factorySel.enter()
      .append('circle')
      .attr('class', 'factory')
      .attr('r', 5.5)
      .attr('fill', this.colors.burgundy || '#6B2424')
      .attr('stroke', 'rgba(255,255,255,0.6)')
      .attr('stroke-width', 1)
      .attr('opacity', 0.95)
    factorySel.exit().remove()

    factorySel
      .attr('cx', d => this.projection!([d.lon, d.lat])![0])
      .attr('cy', d => this.projection!([d.lon, d.lat])![1])
  }

  private tick() {
    if (!this.projection || !this.globeGroup) return
    const now = Date.now()
    const deltaSec = (now - this.lastUpdate) / 1000
    this.lastUpdate = now

    // Move agents
    this.agents.forEach(agent => {
      const drift = agent.type === 'harvester' ? 16 : 20
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
    this.solarPatches = this.solarPatches.filter(p => p.radius < 190)
    if (this.solarPatches.length < 8) {
      this.solarPatches.push({
        id: this.nextPatchId++,
        lon: Math.random() * 360 - 180,
        lat: Math.random() * 140 - 70,
        radius: 6 + Math.random() * 10,
        growth: 5 + Math.random() * 8
      })
    }

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
      .attr('opacity', d => 0.16 * (1 - Math.min(1, d.radius / 180)))
  }
}

