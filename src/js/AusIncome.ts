import { ExtrasChart as Chart } from './chart-extras'
import { _, d3 } from './chart'
import 'datatables.net'

console.log('Australian Income stuff')

const colors: Record<string, string> = {
  Male: '#31a885',
  Female: '#fd9e83',
  Total: '#1e1e1e',
}

type IncomeRow = {
  percentile: number
  sex: string
  count: number
  rawIncome: number[]
  income: number
  cumulativePopulation: number
}

const total: Record<number, IncomeRow> = {}
const cumulativePopulation: Record<string, number> = {
  Male: 0,
  Female: 0,
  Total: 0,
}

function parseIncomeRange(raw: string | undefined): number[] {
  if (raw == null || raw === '') return [0]
  const matches = raw.replace(/[$,]/g, '').match(/\d+/g)
  if (!matches) return [0]
  return matches.map((s) => parseInt(s, 10))
}

d3.csv('/blogposts/AusIncome.csv', function (d: d3.DSVRowString<string>) {
  const rawIncome = parseIncomeRange(d['Ranged Taxable Income'])
  const blob: IncomeRow = {
    percentile: parseInt(d.Percentile, 10),
    sex: d.Sex,
    count: parseInt(d['Number of individuals '], 10) || 0,
    rawIncome,
    income: 0,
    cumulativePopulation: 0,
  }

  blob.income =
    rawIncome.length > 1 ? (rawIncome[0] + rawIncome[1]) / 2 : rawIncome[0] ?? 0

  blob.cumulativePopulation = cumulativePopulation[blob.sex] += blob.count

  if (total[blob.percentile]) {
    total[blob.percentile].count += blob.count
    total[blob.percentile].cumulativePopulation = cumulativePopulation.Total +=
      blob.count
  } else {
    total[blob.percentile] = _.cloneDeep(blob)
    total[blob.percentile].sex = 'Total'
    total[blob.percentile].cumulativePopulation = cumulativePopulation.Total +=
      blob.count
  }

  return blob
})
  .then((data: IncomeRow[]) => {
    const totalRows = Object.values(total)
    data = _.union(data, totalRows) as IncomeRow[]

    new Chart({
      element: 'income',
      title: 'Australians in each income percentile',
      xLabel: 'Percentile',
      yLabel: 'Count',
      data: data,
      nav: false,
    }).generalisedLineChart({
      yField: 'count',
      xField: 'percentile',
      filter: 'sex',
      rounding: 10000,
      types: [
        {
          label: 'Male',
          color: 'Blue',
        },
        {
          label: 'Female',
          color: 'Red',
        },
        {
          label: 'Total',
          color: 'black',
        },
      ],
    })

    return data
  })
  .then((data) => {
    // Median income vs percentile

    new Chart({
      element: 'median',
      title: 'Australian income by percentile',
      xLabel: 'Percentile',
      yLabel: 'Income',
      data: data,
      nav: false,
    }).generalisedLineChart({
      yField: 'income',
      xField: 'percentile',
      filter: 'sex',
      rounding: 10000,
      yFormat: '$,',
    })

    return data
  })
  .then((data) => {
    new Chart({
      element: 'cumulative',
      title: 'Australian income by cumulative population',
      xLabel: 'Cumulative Population',
      yLabel: 'Income',
      // data: data,
      data: data.filter((d) => d.sex !== 'Total'),
      nav: false,
    }).generalisedLineChart({
      yField: 'income',
      xField: 'cumulativePopulation',
      filter: 'sex',
      rounding: 10000,
      xFormat: ',',
      yFormat: '$,',
      types: [
        {
          label: 'Male',
          color: 'Blue',
        },
        {
          label: 'Female',
          color: 'Red',
        },
      ],
    })

    return data
  })
  .then((data) => {
    new Chart({
      element: 'cumulativePopulation',
      title: 'Australian Cumulative Population by income',
      yLabel: 'Cumulative Population',
      xLabel: 'Income (log scale)',
      // data: data,
      data: data.filter((d) => d.sex !== 'Total'),
      nav: false,
    }).generalisedLineChart({
      xField: 'income',
      yField: 'cumulativePopulation',
      filter: 'sex',
      loggedX: true,
      rounding: 10000,
      yFormat: ',',
      xFormat: '$,',
      types: [
        {
          label: 'Male',
          color: 'Blue',
        },
        {
          label: 'Female',
          color: 'Red',
        },
      ],
    })

    return data
  })
  .then((data) => {
    new Chart({
      element: 'population',
      title: 'Australian Population by income',
      yLabel: 'Population',
      xLabel: 'Income (log scale)',
      // data: data,
      data: data.filter((d) => d.sex !== 'Total'),
      nav: false,
    }).generalisedLineChart({
      xField: 'income',
      yField: 'count',
      filter: 'sex',
      rounding: 10000,
      loggedX: true,
      yFormat: ',',
      xFormat: '$,',
      types: [
        {
          label: 'Male',
          color: 'Blue',
        },
        {
          label: 'Female',
          color: 'Red',
        },
      ],
    })

    return data
  })
  .then((data) => {
    new Chart({
      element: 'percentile',
      title: 'Australian income by percentile',
      xLabel: 'Percentile',
      yLabel: 'Income',
      data: data,
      nav: false,
    }).scratchpad((chart) => {
      var options = {
        yField: 'income',
        xField: 'percentile',
        filter: 'sex',
        rounding: 10000,
        xFormat: ',',
        yFormat: '$,',
        types: [
          {
            label: 'Male',
            color: 'Blue',
          },
          {
            label: 'Female',
            color: 'Red',
          },
          {
            label: 'Total',
            color: 'black',
          },
        ],
      }

      // set the ranges
      const x = d3.scaleLinear().range([0, chart.innerWidth])
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
        const filteredData = chart.data.filter(
          (d) => d[options.filter as keyof IncomeRow] === type.label
        )

        chart.plot
          .append('path')
          .datum(filteredData)
          .attr('class', 'line')
          .style('stroke', type.color)
          .attr(
            'd',
            valueline.x(function (d: any) {
              return x(
                (100 * d.cumulativePopulation) /
                  cumulativePopulation[type.label],
              )
            }),
          )

        const lastPoint = filteredData[filteredData.length - 1]
        if (lastPoint) {
          chart.plot
            .append('text')
            .datum(lastPoint)
            .text(type.label)
          .attr('fill', type.color)
          .attr('x', (d: IncomeRow) => x(Number((d as unknown as Record<string, number>)[options.xField])) + 10)
          .attr('y', (d: IncomeRow) => y(Number((d as unknown as Record<string, number>)[options.yField])) + 5)
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
    })
    return data
  })
  .then((data) => {
    // Draw a pie chart

    var pieData = {
      Male: 0,
      Female: 0,
    }

    data
      .filter((d) => d.sex !== 'Total')
      .forEach((d) => {
        pieData[d.sex] += d.income * d.count
      })

    new Chart({
      element: 'pie',
      title: 'Income going to Men vs Women',
      data: data,
      nav: false,
    }).scratchpad((chart) => {
      const midX = chart.innerWidth / 2,
        midY = chart.innerHeight / 2

      const svg = chart.plot
        .append('g')
        .attr('transform', `translate(${midX},${midY})`)
      const height = chart.innerHeight

      const radius = height / 2.5

      // Compute the position of each group on the pie:
      const pie = d3
        .pie()
        .sort(null) // Do not sort group by size
        .value(function (d: any) {
          return d
        })
      const dataReady = pie([pieData.Male, pieData.Female])

      console.log('dataReady', dataReady)

      // The arc generator
      const arc = d3
        .arc()
        .innerRadius(radius * 0) // This is the size of the donut hole
        .outerRadius(radius * 0.8)

      // Another arc that won't be drawn. Just for labels positioning
      const outerArc = d3
        .arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9)

      // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
      svg
        .selectAll('allSlices')
        .data(dataReady)
        .enter()
        .append('path')
        //                .style("display", (d) => d.index % 2 == 0 ? "none" : '')
        .attr('d', arc)
        .attr('fill', (d) => colors[d.index ? 'Female' : 'Male'])
        .attr('stroke', 'white')
        .style('stroke-width', '2px')

      // Legend
      chart.plot
        .append('text')
        .text('Legend')
        .attr('x', 30)
        .attr('y', 30)
        .style('font-size', '24px')

      chart.plot
        .append('rect')
        .attr('x', 30)
        .attr('y', 50)
        .attr('width', 50)
        .attr('height', 50)
        .attr('fill', colors.Male)

      chart.plot
        .append('text')
        .text('Male')
        .attr('x', 90)
        .attr('y', 80)
        .style('font-size', '24px')

      chart.plot
        .append('rect')
        .attr('x', 30)
        .attr('y', 110)
        .attr('width', 50)
        .attr('height', 50)
        .attr('fill', colors.Female)

      chart.plot
        .append('text')
        .text('Female')
        .attr('x', 90)
        .attr('y', 140)
        .style('font-size', '24px')
    })
  })

// "Number of individuals ": "80274"
// Percentile: "95"
// Ranged Taxable Income: "$164,547 to $176,374"
// Sex: "Male"
