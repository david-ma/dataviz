/**
 * ExtrasChart – legacy recipes (treemap, generalisedLineChart) for archived posts.
 * Prefer scratchpad() in new work; upstream patterns into Chart only when reused.
 */
import * as d3 from 'd3'
import { Chart, classifyName } from './chart'
import { camelize } from './utils'

type TreemapData = {
  children: (TreemapNode | TreemapData)[]
  name: string
  filesize: number
}

type TreemapNode = {
  name: string
  filesize: number
}

export class ExtrasChart extends Chart {
  generalisedLineChart(options: {
    xField: string
    yField: string
    rounding: number
    yFormat?: string
    xFormat?: string
    loggedX?: boolean
    filter: string
    types?: {
      label: string
      color: string
    }[]
  }) {
    const chart = this
    const data = this.data

    // set the ranges
    const x = options.loggedX ? d3.scaleLog() : d3.scaleLinear()
    x.range([0, chart.innerWidth])

    const y = d3.scaleLinear().range([chart.innerHeight, 0])

    // define the line
    const valueline = d3
      .line()
      // .curve(d3.curveBasis)
      .x(function (d: any) {
        return x(d[options.xField])
      })
      .y(function (d: any) {
        return y(d[options.yField])
      })

    x.domain(d3.extent(data, (d) => d[options.xField] as number))
    y.domain([
      0,
      Math.round(
        (1.1 *
          d3.max(data, function (d) {
            return d[options.yField] as number
          })) /
          options.rounding,
      ) * options.rounding,
    ])

    const types = options.types || [
      {
        label: 'Total',
        color: 'black',
      },
    ]

    types.forEach((type) => {
      const typeData = chart.data.filter(
        (d) => d[options.filter] === type.label,
      )
      chart.plot
        .append('path')
        .datum(typeData)
        .attr('class', 'line')
        .style('stroke', type.color)
        .attr(
          'd',
          valueline.x(function (d: any) {
            return x(d[options.xField])
          }),
        )

      const lastPoint = typeData[typeData.length - 1]
      if (lastPoint) {
        chart.plot
          .append('text')
          .datum(lastPoint)
          .text(type.label)
          .attr('fill', type.color)
          .attr('x', (d: any) => x(d[options.xField]) + 10)
          .attr('y', (d: any) => y(d[options.yField]) + 5)
      }
    })

    chart.plot
      .append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + chart.innerHeight + ')')
      .call(d3.axisBottom(x).tickFormat(d3.format(options.xFormat || '')))

    // Add the Y Axis
    chart.plot
      .append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).tickFormat(d3.format(options.yFormat || '')))
  }

  /**
   * Draw a simple pie (or donut) chart from an array of { label, value }.
   * Data can be this.data or passed in options. Colours from options or this.colours.
   */

  treemap() {
    const width = this.innerWidth
    const height = this.innerHeight
    // margin = this.margin,
    // data = this.data,
    const svg = this.plot

    const fader = function (color: any) {
      return d3.interpolateRgb(color, '#fff')(0.2)
    }
    const color = d3.scaleOrdinal(d3.schemeCategory10.map(fader))
    const format = d3.format(',d')

    // console.log('this data is....', this.data)

    const data = {
      name: 'cluster',
      children: this.data.map(function (d: any) {
        return {
          name: d.name,
          size: parseInt(d.values[0]),
          blob: d.blob,
        }
      }),
    }

    const treemap = d3
      .treemap()
      .tile(d3.treemapResquarify)
      .size([width, height])
      .round(true)
      .paddingInner(1)

    const root = d3
      .hierarchy(data)
      .eachBefore(function (d: any) {
        d.data.id =
          (d.parent ? d.parent.data.id + '.' : '') + camelize(d.data.name)
      })
      .sum(sumBySize)
      .sort(function (a, b) {
        return b.height - a.height || b.value - a.value
      })

    treemap(root)

    // console.log('Root leaves are..?', root.leaves())

    const cell = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', function (d: any) {
        return 'translate(' + d.x0 + ',' + d.y0 + ')'
      })

    cell
      .append('rect')
      .attr('id', (d: any) => `rect-${d.data.id}`)
      .attr('width', (d: any) => d.x1 - d.x0)
      .attr('height', (d: any) => d.y1 - d.y0)
      .attr('fill', function (d: any) {
        return color(d.parent.data.id)
      })

    cell
      .append('image')
      .attr('id', (d: any) => `image-${d.data.id}`)
      .attr('x', 3)
      .attr('y', 3)
      // .attr("width", (d) => Math.max(d.x1 - d.x0, d.y1 - d.y0))
      // .attr("height", (d) => Math.max(d.x1 - d.x0, d.y1 - d.y0))
      .attr('width', (d: any) => d.x1 - d.x0 - 6)
      .attr('height', (d: any) => d.y1 - d.y0 - 6)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      // .attr("meetOrSlice", "meet")
      .attr(
        'xlink:href',
        (d: any) => `/data/mm/2018-05-28/photos/${d.data.blob.photo}`,
      )
    // .attr("fill", function(d) { return color(d.parent.data.id); });

    cell
      .append('clipPath')
      .attr('id', function (d: any) {
        return 'clip-' + d.data.id
      })
      .append('use')
      .attr('xlink:href', function (d: any) {
        return '#' + d.data.id
      })

    cell
      .append('text')
      .attr('clip-path', function (d: any) {
        return 'url(#clip-' + d.data.id + ')'
      })
      .selectAll('tspan')
      .data(function (d: any) {
        return d.data.name.split(/(?=[A-Z][^A-Z])/g)
      })
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', function (d: any, i: number) {
        return 13 + i * 10
      })
      .text(function (d: any) {
        return d
      })

    cell.append('title').text(function (d: any) {
      return d.data.id + '\n' + format(d.value)
    })

    d3.selectAll('input')
      .data([sumBySize, sumByCount], function (d: any) {
        return d.name
      })
      // .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value; })
      .on('change', changed)

    const timeout = d3.timeout(function () {
      d3.select('input[value="sumByCount"]')
        .property('checked', true)
        .dispatch('change')
    }, 2000)

    function changed(sum: any) {
      timeout.stop()

      treemap(root.sum(sum))

      cell
        .transition()
        .duration(750)
        .attr('transform', function (d: any) {
          return 'translate(' + d.x0 + ',' + d.y0 + ')'
        })
        .select('rect')
        .attr('width', function (d: any) {
          return d.x1 - d.x0
        })
        .attr('height', function (d: any) {
          return d.y1 - d.y0
        })
    }
  }

  /**
   * Initialise a treemap
   */
  initTreemap(options: {
    hierarchy: d3.HierarchyNode<any>
    target: string
    color?: d3.ScaleOrdinal<string, any>
    maxDepth?: number
  }) {
    // console.log('initTreemap with TreemapData', this.data)

    const width = this.innerWidth,
      height = this.innerHeight,
      svg = this.plot,
      maxDepth = options.maxDepth || 8

    // svg.append('text').text(this.title)

    // const root = options.data.sum((d: any) => d[options.target])
    const root = options.hierarchy

    // console.log('Root', root)

    // tree is of type d3.HierarchyRectangularNode<any>
    const treemap = d3
      .treemap()
      .tile(d3.treemapBinary)
      .size([width, height])
      .padding(0)(root)

    const opacity = d3
      .scaleLinear()
      .domain([
        10,
        Math.max(...options.hierarchy.children.map((d) => d[options.target])),
      ])
      .range([0.5, 1])

    const color = (this.color =
      options.color || d3.scaleOrdinal().range(d3.schemeCategory10))

    // use this information to add rectangles:
    svg
      .selectAll('rect.leaf')
      .data(treemap.leaves().filter((d) => d.depth < maxDepth))
      .enter()
      .append('rect')
      .classed('leaf', true)
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .style('stroke', 'black')
      .style('fill', (d) => color(d.data.filetype))
      .style('opacity', function (d: any) {
        return d.parent ? opacity.domain([10, d.parent.total])(d.data.value) : 1
      })
      .each((d) => {
        // console.log('Hey, drawing a leaf', d)
        if (d.data.filetype === 'folder') {
          console.log('This is a folder!', d)
        }
      })

    // console.log('descendants', treemap.descendants())
    const folders = treemap
      .descendants()
      .filter((d) => d.children)
      .filter((d) => d.depth < maxDepth)
    // .filter((d) => d.depth === 2)
    // console.log('Folders', folders)

    svg
      .append('g')
      .classed('hoverOver', true)
      .selectAll('rect.folder')
      .data(folders)
      .enter()
      .append('rect')
      .classed('folder', true)
      .attr('id', (d) => `folder-${classifyName(d.id)}`)
      .attr('x', (d) => d.x0)
      .attr('y', (d) => d.y0)
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .style('stroke', 'black')
      .style('fill', 'rgba(0,0,0,0.05)')
      .style('opacity', 0.5)
      .on('mouseover', function (event, d) {
        d3.select(this).classed('mouseover', true)
        // console.log('hey, mousing over folder', d)
        // console.log(d.data.name)
        // d3.select(`#rect-${d.data.id}`).attr('fill', 'red')
      })
      .on('mouseout', function (event, d) {
        d3.select(this).classed('mouseover', false)
      })

    return this
  }
}

function sumByCount(d: any) {
  return d.children ? 0 : 1
}

function sumBySize(d: any) {
  return d.filesize || d.size || 0
}

export { ExtrasChart as default }
