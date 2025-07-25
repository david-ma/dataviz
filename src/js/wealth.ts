// @ts-nocheck

import { Chart, decorateTable, $, d3 } from './chart'

console.log('Running wealth.ts')

let dataset = null

const treemapData = {
  children: [],
  wealth: 0,
  name: 'World',
}

type rawCountry = {
  country: string
  region: string
  wealth_b: string // eslint-disable-line
}
type Country = {
  rank: number
  name: string
  region: string
  wealth: number
}
type Region = {
  name: string
  wealth: number
  children: Country[]
  countries: Country[]
}
let color: d3.ScaleOrdinal<string, unknown>

let rank: number = 1

const regions: {
  [name: string]: Region
} = {}

console.log('Calling csv stuff')
d3.csv('/blogposts/WorldWealth.csv', function (country: rawCountry) {
  if (!country.wealth_b) country.wealth_b = '0'

  if (country.region) {
    const result: Country = {
      rank: rank++,
      name: country.country,
      region: country.region,
      wealth: parseInt(country.wealth_b),
    }

    regions[country.region] = regions[country.region] || {
      name: country.region,
      wealth: 0,
      children: [],
      countries: [],
    }

    regions[country.region].wealth += result.wealth
    regions[country.region].countries.push(result)
    // treemapData.wealth += result.wealth;

    return result
  } else {
    return null
  }
}).then(function (data) {
  dataset = data
  globalThis.data = data

  treemapData.children = Object.keys(regions)
    .map((d) => regions[d])
    .sort((a, b) => b.wealth - a.wealth)

  console.log(Object.keys(regions))
  // prepare a color scale
  color = d3
    .scaleOrdinal()
    .domain(Object.keys(regions))
    .range([
      '#7fc97f',
      '#beaed4',
      '#fdc086',
      '#ffff99',
      '#386cb0',
      '#f0027f',
      '#bf5b17',
    ])

  // Table options:
  const tableOptions = {
    element: '#dataset table',
    paging: true,
    search: true,
    searching: true,
    language: {
      searchPlaceholder: 'Search',
      sLengthMenu: 'Show _MENU_',
    },
    oLanguage: {
      sSearch: '',
    },
    pageLength: 10,
    order: [3, 'desc'],
    columns: [
      {
        data: 'rank',
        title: 'Rank',
      },
      {
        data: 'name',
        title: 'Country',
      },
      {
        data: 'region',
        title: 'Region',
      },
      {
        data: 'wealth',
        title: 'Wealth (Billions USD)',
        render: function (d) {
          return d3.format('$,')(d)
        },
      },
    ],
    rowCallback: function (row, data) {
      d3.select(row)
        .attr('id', `row-${classifyName(data.name)}`)
        .style('background', color(data.region) as string)
        .on('mouseenter', function () {
          d3.select(`#${classifyName(data.name)}`).classed('highlight', true)
        })
        .on('mouseout', function () {
          d3.select(`#${classifyName(data.name)}`).classed('highlight', false)
        })
    },
  }
  const datatable: DataTables.Api = decorateTable(dataset, tableOptions)
  globalThis.datatable = datatable

  drawTreemap(dataset, datatable)
})

function drawTreemap(data, datatable: DataTables.Api) {
  new Chart({
    element: 'chart',
    data: treemapData,
    width: 1000,
    height: 700,
    nav: false,
    title: 'World Wealth 2019, Billions of $USD',
  }).scratchpad(function (c) {
    globalThis.c = c
    const svg = c.plot
    const width = c.innerWidth
    const height = c.innerHeight

    console.log('treemapData', treemapData)
    // Here the size of each leave is given in the 'value' field in input data
    const root = d3.hierarchy(treemapData).sum((d: any) => d.wealth)

    console.log('root', root)

    const tree = d3.treemap().size([width, height]).padding(2)(root)

    console.log(Math.max(...treemapData.children.map((d) => d.wealth)))
    // And a opacity scale
    const opacity = d3
      .scaleLinear()
      .domain([10, Math.max(...treemapData.children.map((d) => d.wealth))])
      .range([0.5, 1])

    globalThis.tree = tree

    // use this information to add rectangles:
    svg
      .selectAll('rect.region')
      .data(tree.leaves())
      .enter()
      .append('rect')
      .classed('region', true)
      .attr('x', function (d) {
        return d.x0
      })
      .attr('y', function (d) {
        return d.y0
      })
      .attr('width', function (d) {
        return d.x1 - d.x0
      })
      .attr('height', function (d) {
        return d.y1 - d.y0
      })
      .style('stroke', 'black')
      .style('fill', function (d) {
        return color(d.data.name)
      })
      .style('opacity', function (d: any) {
        return d.parent ? opacity.domain([10, d.parent.total])(d.data.value) : 1
      })
      .each(function (d) {
        console.log(d)

        const rWidth = d.x1 - d.x0
        const rHeight = d.y1 - d.y0

        const regionRoot = d3
          .hierarchy({
            name: d.data.name,
            children: d.data.countries,
            wealth: 0,
          })
          .sum((d: any) => d.wealth)

        const myTreemap = d3.treemap().size([rWidth, rHeight]).padding(2)
        const regionTree = myTreemap(regionRoot)

        const regionGroupTranslate = `translate(${d.x0},${d.y0})`

        const regionGroup = svg
          .append('g')
          .attr('id', `${classifyName(d.data.name)}`)
          .attr('transform', regionGroupTranslate)

        regionGroup
          .selectAll('rect.country')
          .data(regionTree.leaves())
          .enter()
          .append('rect')
          .classed('country', true)
          .attr('id', (d) => classifyName(d.data.name))
          .attr('x', function (d) {
            return d.x0
          })
          .attr('y', function (d) {
            return d.y0
          })
          .attr('width', function (d) {
            return d.x1 - d.x0
          })
          .attr('height', function (d) {
            return d.y1 - d.y0
          })
          .style('stroke', 'black')
          .style('fill', color(d.data.name))
          .style('opacity', function (d: any) {
            return d.parent
              ? opacity.domain([10, d.parent.total])(d.data.value)
              : 1
          })
          .on('mouseover', function (d) {
            d3.select(`#row-${classifyName(d.data.name)}`).classed(
              'highlight',
              true,
            )
          })
          .on('mouseout', function (d) {
            d3.select(`#row-${classifyName(d.data.name)}`).classed(
              'highlight',
              false,
            )
          })
          .on('click', function (d) {
            console.log('Zoom in!')

            $('.plot').append($(`#${classifyName(d.data.region)}`).detach())
            datatable.search(d.data.region).draw()

            const zoomedTreemap = d3.treemap().size([width, height]).padding(2)
            const zoomedRegionTree = zoomedTreemap(regionRoot)

            const speed = 1000
            let done = false

            regionGroup
              .transition()
              .duration(speed)
              .attr('transform', 'translate(0,0)')
            regionGroup
              .selectAll('rect.country')
              .data(zoomedRegionTree.leaves())
              .transition()
              .duration(speed)
              .attr('x', function (d) {
                return d.x0
              })
              .attr('y', function (d) {
                return d.y0
              })
              .attr('width', function (d) {
                return d.x1 - d.x0
              })
              .attr('height', function (d) {
                return d.y1 - d.y0
              })
              .on('end', function () {
                if (!done) {
                  done = true
                  console.log('Finished zooming in')

                  // and to add the text labels
                  regionGroup
                    .selectAll('text')
                    .data(zoomedRegionTree.leaves())
                    .enter()
                    .append('text')
                    .classed('tempText', true)
                    .attr('x', function (d) {
                      return d.x0 + 5
                    }) // +10 to adjust position (more right)
                    .attr('y', function (d) {
                      return d.y0 + 20
                    }) // +20 to adjust position (lower)
                    .text(function (d) {
                      return d.data.name
                    })
                    .attr('font-size', '19px')
                    .attr('font-weight', '700')
                    .attr('fill', 'black')
                    .each(function (d) {
                      const width = d.x1 - d.x0
                      const node = d3.select(this).node()
                      if (node != null && width < node.getBBox().width) {
                        d3.select(this).remove()
                      }
                    })

                  // and to add the text labels
                  regionGroup
                    .selectAll('.countryVals')
                    .data(zoomedRegionTree.leaves())
                    .enter()
                    .append('text')
                    .classed('tempText', true)
                    .attr('x', function (d) {
                      return d.x0 + 5
                    }) // +10 to adjust position (more right)
                    .attr('y', function (d) {
                      return d.y0 + 35
                    }) // +20 to adjust position (lower)
                    .text(function (d) {
                      return `${d3.format('$,')(d.data.wealth)} billion`
                    })
                    .attr('font-size', '11px')
                    .attr('fill', 'black')
                    .each(function (d) {
                      const width = d.x1 - d.x0
                      const node = d3.select(this).node()
                      if (node != null && width < node.getBBox().width) {
                        d3.select(this).remove()
                      }
                    })

                  svg
                    .append('rect')
                    .attr('id', 'blocker')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('fill', 'rgba(0,0,0,0)')
                    .on('click', function () {
                      console.log('Reverse time!!!')
                      d3.selectAll('.tempText').remove()
                      datatable.search('').draw()

                      const myTreemap = d3
                        .treemap()
                        .size([rWidth, rHeight])
                        .padding(2)
                      const regionTree = myTreemap(regionRoot)

                      regionGroup
                        .transition()
                        .duration(speed)
                        .attr('transform', regionGroupTranslate)
                      regionGroup
                        .selectAll('rect.country')
                        .data(regionTree.leaves())
                        .transition()
                        .duration(speed)
                        .attr('x', function (d) {
                          return d.x0
                        })
                        .attr('y', function (d) {
                          return d.y0
                        })
                        .attr('width', function (d) {
                          return d.x1 - d.x0
                        })
                        .attr('height', function (d) {
                          return d.y1 - d.y0
                        })

                      d3.select('#blocker').remove()
                    })
                }
              })
          })
      })
      .on('click', function (d) {
        console.log(d)
        datatable.search(d.data.name).draw()

        // console.log(regionTree);
      })

    // and to add the text labels
    svg
      .selectAll('text')
      .data(root.leaves())
      .enter()
      .append('text')
      .attr('x', function (d) {
        return d.x0 + 5
      }) // +10 to adjust position (more right)
      .attr('y', function (d) {
        return d.y0 + 20
      }) // +20 to adjust position (lower)
      .text(function (d) {
        return d.data.name
      })
      .attr('font-size', '19px')
      .attr('font-weight', '700')
      .attr('fill', 'black')

    // and to add the text labels
    svg
      .selectAll('vals')
      .data(root.leaves())
      .enter()
      .append('text')
      .attr('x', function (d) {
        return d.x0 + 5
      }) // +10 to adjust position (more right)
      .attr('y', function (d) {
        return d.y0 + 35
      }) // +20 to adjust position (lower)
      .text(function (d) {
        return `${d3.format('$,')(d.data.wealth)} billion`
      })
      .attr('font-size', '11px')
      .attr('fill', 'black')
  })
}

function classifyName(name: string): string {
  return name.replace(/[ \(\)\.\']/gi, '-') // eslint-disable-line
}
