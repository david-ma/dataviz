/**
 * MapChart – geographic helpers on top of Chart (upstreamable with chart.ts).
 */
import * as d3 from 'd3'
import { camelize } from './utils'
import { Chart } from './chart'

export type Coordinates = {
  latitude: number
  longitude: number
  type?: string
  url?: string
  distance?: number
  label?: string
  draggable?: boolean
}
type GeoipNames = {
  [key: string]: string
}
export type Geoip = {
  city: {
    names: GeoipNames
  }
  continent: {
    code: string
    geoname_id: number
    names: GeoipNames
  }
  country: {
    geoname_id: number
    is_in_european_union: boolean
    iso_code: string
    names: GeoipNames
  }
  location: Coordinates
  subdivisions: {
    names: GeoipNames
  }
}

export class MapChart extends Chart {
  projection?: d3.GeoProjection
  calculate?: (chart: Chart, marker: Coordinates) => Coordinates[]
  loadingAnimation?: LoadingAnimation

  initMap() {
    return new Promise((resolve) => {
      const projection = d3
        .geoMercator()
        .center([0, 0])
        .translate([this.width / 2, this.height / 2])
        .scale(100)

      const path = d3.geoPath().projection(projection)

      this.svg.classed('map', true)

      d3.json('/ne_110m_land.json')
        .then((json: any) => {
          this.svg
            .selectAll('path.map-outlines')
            .data(json.features)
            .enter()
            .append('path')
            .classed('continent map-outlines', true)
            .attr('d', path)
            .attr('fill', 'rgba(0,0,0,0)')

          this.loadingAnimation = new MapLoadingAnimation({
            chart: this,
            features: json.features,
            projectionPath: path,
          })

          this.loadingAnimation.animate()

          return this
        })
        .then(resolve)
    })
  }

  // Todo, draw markers?
  // Add more geoip helper stuff?
  // Great resource: https://www.d3indepth.com/geographic/
  drawMap(options: {
    center?: Coordinates
    json?: string
    usa?: string
    aus?: string
    zoom?: number
    markers?: Coordinates[]
    calculate?: (chart: Chart, marker: Coordinates) => Coordinates[]
    projection?: d3.GeoProjection
    /** Optional hook when a dragged marker lands inside a tracked feature (e.g. Georgia polygons). */
    onContain?: (feature: any, coords: Coordinates) => void
  }) {
    let chart: MapChart = this
    chart.calculate = options.calculate
    let lat = options.center ? options.center.latitude : 0
    let long = options.center ? options.center.longitude : 0
    // let place = options.place || 'Somewhere'
    // let json = '/ne_110m_land.json'
    let json = options.json || '/world-50.geo.json' // https://geojson-maps.kyd.au/
    let aus = options.aus || '/aust.json' // https://github.com/tonywr71/GeoJson-Data
    let usa = options.usa || '/gz_2010_us_040_00_5m.json' // https://eric.clst.org/tech/usgeojson/
    let zoom = options.zoom || 100

    // Width and height
    const w = this.width
    const h = this.height

    // Define map projection
    const projection = options.projection || d3.geoMercator()

    // const projection = d3
    //   // .geoEqualEarth()
    //   // .geoConicConformal()
    //   // .geoAlbersUsa()
    //   // .geoAzimuthalEqualArea()
    //   // .geoProjection()
    //   // .geoOrthographic()
    //   // .geoGnomonic()
    //   .geoMercator()
    projection
      .center([Math.floor(long), Math.floor(lat)])
      .translate([w / 2, h / 2])
      .scale(zoom)

    // Define path generator

    this.projection = projection

    const path = d3.geoPath().projection(projection)

    // Create SVG
    const svg = this.svg

    // Load in GeoJSON data
    return Promise.all([d3.json(json), d3.json(usa), d3.json(aus)]).then(
      ([json, usa, aus]: any) => {
        // Bind data and create one path per GeoJSON feature
        const georgias = []

        svg.selectAll('.continent').remove()

        svg
          .selectAll('path.map-outlines')
          .data([...json.features, ...usa.features, ...aus.features])
          // .data(json.features)
          .enter()
          .append('path')
          .attr('class', (d) => {
            if (
              // d.properties.name === 'S. Geo. and the Is.' ||
              d.properties.NAME === 'Georgia' ||
              d.properties.name === 'Georgia'
            ) {
              georgias.push(d)
              return 'map-outlines georgia'
            } else {
              // name_en
              const name =
                d.properties.name ||
                d.properties.NAME ||
                d.properties.STATE_NAME
              return `map-outlines ${camelize(name)}`
            }
          })
          // .classed('map-outlines', true)
          .attr('d', path)
          .attr('stroke-width', 1)
          .attr('stroke', 'black')
          .attr('fill', 'rgba(0,0,0,0)')

        // States
        svg
          .selectAll('text.map-labels')
          .data(json.features)
          .enter()
          .append('text')
          .classed('map-labels', true)
          // .attr('fill', 'darkslategray')
          .attr('transform', function (d: any) {
            return 'translate(' + path.centroid(d) + ')'
          })
          .attr('text-anchor', 'middle')
          .attr('dy', '.35em')
          .style('opacity', 0.5)
          .text(function (d: any) {
            return d.properties.STATE_NAME
          })

        // var marks = [{long: -75, lat: 43},{long: -78, lat: 41},{long: -70, lat: 53}];

        // svg.selectAll(".mark")
        //     .data(marks)
        //     .enter()
        //     .append("image")
        //     .attr('class','mark')
        //     .attr('width', 20)
        //     .attr('height', 20)
        //     .attr("xlink:href",'https://cdn3.iconfinder.com/data/icons/softwaredemo/PNG/24x24/DrawingPin1_Blue.png')
        //     .attr("transform", d => `translate(${projection([d.long,d.lat])}`);

        if (options.markers) {
          const [start, end] = options.markers

          this.loadingAnimation
            .stop({
              goto: chart.projection([start.longitude, start.latitude]),
            })
            .then(() => {
              svg
                .selectAll('.mark')
                .data(options.markers, (d: Coordinates) => d.type)
                .join(
                  function (enter) {
                    enter.each((d: any, i, nodes) => {
                      const node = d3
                        .select(nodes[i])
                        .insert('g', 'g.mark')
                        .classed('mark', true)
                        .attr(
                          'transform',
                          (d: Coordinates) =>
                            `translate(${projection([
                              d.longitude,
                              d.latitude,
                            ])})`,
                        )

                      const marker = node.append('g').classed('marker', true)

                      marker
                        .append('rect')
                        .attr('width', 100)
                        .attr('height', 80)
                        .attr('x', -50)
                        .attr('y', -40)
                        .attr('rx', 50)
                        .attr('fill', 'rgba(0,0,0,0.01)')

                      if (
                        d.type !== 'Country' &&
                        d.type !== 'State' &&
                        d.type !== 'Island'
                      ) {
                        marker
                          .append('circle')
                          .attr('r', 10)
                          .attr('cx', 0)
                          .attr('cy', 0)

                        marker
                          .append('line')
                          .attr('x1', 0)
                          .attr('y1', -10)
                          .attr('x2', 0)
                          .attr('y2', 10)

                        marker
                          .append('line')
                          .attr('x1', -10)
                          .attr('y1', 0)
                          .attr('x2', 10)
                          .attr('y2', 0)
                      }

                      var label: d3.Selection<
                        Element,
                        unknown,
                        null,
                        undefined
                      > = node
                      if (d.url) {
                        label = label.append('a').attr('xlink:href', d.url)
                      }

                      if (d.label)
                        label
                          .append('text')
                          .classed('mark-label', true)
                          .attr('x', 0)
                          .attr('y', -15)
                          .text(d.label)

                      if (d.draggable) {
                        node.call(
                          d3
                            .drag()
                            .on('start', function (d: DragEvent, data: object) {
                              node.classed('active', true)
                              d3.select('path.travel-line').classed(
                                'active',
                                true,
                              )
                            })
                            .on('drag', function (d: DragEvent, data: object) {
                              node.attr('transform', `translate(${d.x},${d.y})`)
                            })
                            .on(
                              'end',
                              function (d: DragEvent, data: Coordinates) {
                                const [longitude, latitude] = projection.invert(
                                  [d.x, d.y],
                                )

                                node.classed('active', false).datum({
                                  ...data,
                                  longitude,
                                  latitude,
                                })

                                georgias.forEach((feature) => {
                                  if (
                                    d3.geoContains(feature, [
                                      longitude,
                                      latitude,
                                    ])
                                  )
                                    options.onContain?.(feature, { latitude, longitude })
                                })

                                const newMarkers = chart.calculate?.(chart, {
                                  ...data,
                                  longitude,
                                  latitude,
                                })
                                if (!newMarkers) return

                                svg
                                  .selectAll('.mark')
                                  .data(newMarkers, (d: Coordinates) => d.type)
                                  .each((d: Coordinates, i: number, nodes) => {
                                    d3.select(nodes[i])
                                      .select('.mark-label')
                                      .text(d.label)
                                  })

                                d3.select('path.travel-line')
                                  .classed('active', false)
                                  .attr(
                                    'd',
                                    path({
                                      type: 'LineString',
                                      coordinates: [
                                        [
                                          newMarkers[0].longitude,
                                          newMarkers[0].latitude,
                                        ],
                                        [
                                          newMarkers[1].longitude,
                                          newMarkers[1].latitude,
                                        ],
                                      ],
                                    }),
                                  )
                              },
                            ),
                        )
                      }
                    })
                    return d3.selectAll('.mark')
                  },
                  function (update) {
                    update.each((d: any, i, nodes) => {
                      const node = d3
                        .select(nodes[i])
                        .attr(
                          'transform',
                          (d: Coordinates) =>
                            `translate(${projection([
                              d.longitude,
                              d.latitude,
                            ])})`,
                        )
                      node.select('.mark-label').text(d.label)
                    })
                    return d3.selectAll('.mark')
                  },
                  function (exit) {
                    exit.each((d: any, i, nodes) => {
                      console.log('removing node', i)
                      d3.select(nodes[i]).remove()
                    })
                    return d3.selectAll('.mark')
                  },
                )

              // this.loadingAnimation.animate

              svg
                .append('path')
                .classed('travel-line', true)
                .attr(
                  'd',
                  path({
                    type: 'LineString',
                    coordinates: [
                      [start.longitude, start.latitude],
                      [end.longitude, end.latitude],
                    ],
                  }),
                )
                .attr('stroke', 'red')
                .attr('stroke-width', 2)
            })
        }
      },
    )
  }

}

interface LoadingAnimation {
  animate: () => void
  stop: (options?: { goto?: [number, number] }) => Promise<any>
}

// https://css-tricks.com/svg-line-animation-works/
class MapLoadingAnimation implements LoadingAnimation {
  chart: Chart
  loadingSvg: any
  horizontalLine: any
  verticalLine: any
  speed: number

  constructor({
    chart,
    features,
    projectionPath,
    speed = 2000,
  }: {
    chart: Chart
    features: any
    projectionPath: any
    speed?: number
  }) {
    this.chart = chart
    this.speed = speed
    this.loadingSvg = chart.svg.append('g').classed('loading', true)

    this.loadingSvg
      .selectAll('path.map-outlines')
      .data(features)
      .enter()
      .append('path')
      .classed('continent map-outlines', true)
      .attr('d', projectionPath)
      .attr('fill', 'rgba(0,0,0,0)')

    this.horizontalLine = this.loadingSvg
      .append('line')
      .classed('loading', true)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', chart.width)
      .attr('y2', 0)
      .attr('stroke', 'rgba(0,255,0,0.5)')
      .attr('stroke-width', 1)

    this.verticalLine = this.loadingSvg
      .append('line')
      .classed('loading', true)
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 0)
      .attr('y2', chart.height)
      .attr('stroke', 'rgba(0,255,0,0.5)')
      .attr('stroke-width', 1)
  }

  animateTo([x, y]: [number, number]) {
    this.horizontalLine
      .transition()
      .ease(d3.easeLinear)
      .duration(300)
      .attr('y1', y)
      .attr('y2', y)

    return this.verticalLine
      .transition()
      .ease(d3.easeLinear)
      .duration(300)
      .attr('x1', x)
      .attr('x2', x)
  }

  stop({ goto }: { goto?: [number, number] }) {
    return new Promise((resolve) => {
      var that = this
      this.horizontalLine.interrupt()
      this.verticalLine.interrupt()
      if (goto) {
        this.animateTo(goto).on('end', () => {
          that.loadingSvg.selectAll('.loading').remove()
          resolve(true)
        })
      } else {
        this.loadingSvg.selectAll('.loading').remove()
        resolve(true)
      }
    })
  }

  animate() {
    this.animateForwards()
  }

  animateForwards() {
    this.horizontalLine
      .transition()
      .ease(d3.easeLinear)
      .duration(this.speed)
      .attr('y1', this.chart.height)
      .attr('y2', this.chart.height)

    this.verticalLine
      .transition()
      .ease(d3.easeLinear)
      .duration(this.speed)
      .attr('x1', this.chart.width)
      .attr('x2', this.chart.width)
      .on('end', () => {
        this.animateBackwards()
      })
  }

  animateBackwards() {
    this.horizontalLine
      .transition()
      .ease(d3.easeLinear)
      .duration(this.speed)
      .attr('y1', 0)
      .attr('y2', 0)

    this.verticalLine
      .transition()
      .ease(d3.easeLinear)
      .duration(this.speed)
      .attr('x1', 0)
      .attr('x2', 0)
      .on('end', () => {
        this.animateRandom()
      })
  }

  animateRandom() {
    const randomY = (0.1 + Math.random()) * 0.8 * this.chart.height
    const randomX = (0.1 + Math.random()) * 0.8 * this.chart.width

    this.horizontalLine
      .transition()
      .ease(d3.easeLinear)
      .duration(this.speed)
      .attr('y1', randomY)
      .attr('y2', randomY)

    this.verticalLine
      .transition()
      .ease(d3.easeLinear)
      .duration(this.speed)
      .attr('x1', randomX)
      .attr('x2', randomX)
      .on('end', () => {
        this.animateRandom()
      })
  }
}

export function mapDistance(a: Coordinates, b: Coordinates): number {
  const lat1 = a.latitude,
    lon1 = a.longitude,
    lat2 = b.latitude,
    lon2 = b.longitude

  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1) // deg2rad below
  const dLon = deg2rad(lon2 - lon1)

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180)
}

export { MapChart as default, d3 }
