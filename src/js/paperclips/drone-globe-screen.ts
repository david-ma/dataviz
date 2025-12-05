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
  velLon: number
  velLat: number
}

export class DroneGlobeScreen extends HalScreen {
  private projection: d3.GeoProjection | null = null
  private globeGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null = null
  private landGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null = null
  private statesGroup: d3.Selection<SVGGElement, unknown, HTMLElement, any> | null = null
  private agents: DroneAgent[] = []
  private factories: { id: number; lon: number; lat: number }[] = []
  private nextAgentId = 0
  private globeRadius = 150
  private centerX = 210
  private centerY = 210
  private lastUpdate = Date.now()
  private timer: d3.Timer | null = null
  private landData: any = null
  private usaData: any = null
  private mapLoading = false

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
    this.ensureMapLoaded()
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

    this.landGroup = this.globeGroup.append('g').attr('id', 'globe-land')
    this.statesGroup = this.globeGroup.append('g').attr('id', 'globe-states')
    this.globeGroup.append('g').attr('id', 'globe-agents')
    this.globeGroup.append('g').attr('id', 'globe-factories')

    this.timer = d3.timer(() => this.tick())
  }

  private ensureMapLoaded() {
    if (this.mapLoading || this.landData) return
    this.mapLoading = true
    d3.json('/world-50.geo.json')
      .then((world) => {
        this.landData = world
        return d3.json('/gz_2010_us_040_00_5m.json')
      })
      .then((usa) => {
        this.usaData = usa
        this.renderMap()
      })
      .catch((err) => {
        console.warn('[DroneGlobe] Failed to load map data', err)
      })
      .finally(() => {
        this.mapLoading = false
      })
  }

  private renderMap() {
    if (!this.projection || !this.globeGroup || !this.landData) return
    const path = d3.geoPath(this.projection)

    if (this.landGroup) {
      const landSel = this.landGroup.selectAll<SVGPathElement, any>('path.land').data(this.landData.features || [])
      landSel.enter()
        .append('path')
        .attr('class', 'land')
        .attr('fill', 'rgba(255,255,255,0.18)')
        .attr('stroke', 'rgba(255,255,255,0.25)')
        .attr('stroke-width', 0.4)
        .attr('d', path)
      landSel
        .attr('d', path)
      landSel.exit().remove()
    }

    if (this.statesGroup && this.usaData && this.usaData.features) {
      const stateSel = this.statesGroup.selectAll<SVGPathElement, any>('path.state').data(this.usaData.features)
      stateSel.enter()
        .append('path')
        .attr('class', 'state')
        .attr('fill', 'none')
        .attr('stroke', 'rgba(255,255,255,0.18)')
        .attr('stroke-width', 0.35)
        .attr('d', path)
      stateSel
        .attr('d', path)
      stateSel.exit().remove()
    }
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
            type,
            velLon: (Math.random() * 8 + 4) * (Math.random() < 0.5 ? 1 : -1),
            velLat: (Math.random() * 2 - 1) * 0.6
          })
        }
      } else if (current.length > count) {
        const removeIds = current.slice(0, current.length - count).map(a => a.id)
        this.agents = this.agents.filter(a => !removeIds.includes(a.id))
      }
    }
    syncAgents(desiredHarvesters, 'harvester')
    syncAgents(desiredWire, 'wire')

    // Factories (static positions; don't move once created)
    if (this.factories.length < desiredFactories) {
      const toAdd = desiredFactories - this.factories.length
      for (let i = 0; i < toAdd; i++) {
        const idx = this.factories.length + i
        this.factories.push({
          id: idx,
          lon: -160 + (idx * 36) % 320 + Math.random() * 4,
          lat: -60 + ((idx * 26) % 120) + Math.random() * 4
        })
      }
    } else if (this.factories.length > desiredFactories) {
      this.factories = this.factories.slice(0, desiredFactories)
    }

    const agentGroup = this.globeGroup.select<SVGGElement>('#globe-agents')
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

    // Factories
    const factorySel = factoryGroup.selectAll<SVGCircleElement, any>('circle.factory').data(this.factories, d => d.id as any)
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

    // Move agents steadily along arcs (no per-tick random jitter)
    this.agents.forEach(agent => {
      const speedFactor = agent.type === 'harvester' ? 0.45 : 0.6
      agent.lon += agent.velLon * speedFactor * deltaSec
      agent.lat += agent.velLat * speedFactor * deltaSec
      if (agent.lon > 180) agent.lon -= 360
      if (agent.lon < -180) agent.lon += 360
      agent.lat = Math.max(-85, Math.min(85, agent.lat))
    })

    // Update positions
    const agentGroup = this.globeGroup.select<SVGGElement>('#globe-agents')
    agentGroup.selectAll<SVGCircleElement, DroneAgent>('circle.agent')
      .attr('cx', d => {
        const p = this.projection!([d.lon, d.lat]); return p ? p[0] : -999
      })
      .attr('cy', d => {
        const p = this.projection!([d.lon, d.lat]); return p ? p[1] : -999
      })

  }
}

