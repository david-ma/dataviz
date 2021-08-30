import { Chart, _, d3 } from 'chart'
import 'datatables.net'

console.log('Australian Income stuff')

var total = {}
var cumulativePopulation = {
  Male: 0,
  Female: 0,
  Total: 0,
}

d3.csv('/blogposts/AusIncome.csv', function (d: d3.DSVRowString<string>) {
  var blob = {
    percentile: parseInt(d.Percentile),
    sex: d.Sex,
    count: parseInt(d['Number of individuals ']),
    rawIncome: d['Ranged Taxable Income']
      .replace(/[$,]/g, '')
      .match(/\d+/g)
      .map((d) => parseInt(d)),
    income: 0,
    cumulativePopulation: 0,
  }

  blob.income = blob.rawIncome[1]
    ? (blob.rawIncome[0] + blob.rawIncome[1]) / 2
    : blob.rawIncome[0]

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
  .then((data) => {
    data = _.union(data, _.flatMap(total)) as any

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
      data: data.filter(d => d.sex !== 'Total'),
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
        // {
        //   label: 'Total',
        //   color: 'black',
        // },
      ],
    })

    return data
  })
  .then((data) => {
    new Chart({
      element: 'population',
      title: 'Australian population by income',
      yLabel: 'Cumulative Population',
      xLabel: 'Income',
      // data: data,
      data: data.filter(d => d.sex !== 'Total'),
      nav: false,
    }).generalisedLineChart({
      xField: 'income',
      yField: 'cumulativePopulation',
      filter: 'sex',
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
        // {
        //   label: 'Total',
        //   color: 'black',
        // },
      ],
    })

    return data
  })
  .then((data) => {
    console.log(data)

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
            options.rounding
        ) * options.rounding,
      ])

      const types = options.types || [
        {
          label: 'Total',
          color: 'black',
        },
      ]

      types.forEach((type) => {
        var data = chart.data.filter((d) => d[options.filter] === type.label)

        chart.plot
          .append('path')
          .datum(data)
          .attr('class', 'line')
          .style('stroke', type.color)
          .attr(
            'd',
            valueline.x(function (d: any) {
              return x( 100 * d.cumulativePopulation / cumulativePopulation[type.label] )
            })
          )

        chart.plot
          .append('text')
          .datum(data.pop())
          .text(type.label)
          .attr('fill', type.color)
          .attrs((d) => {
            return {
              x: x(d[options.xField]) + 10,
              y: y(d[options.yField]) + 5,
            }
          })
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
  })

// "Number of individuals ": "80274"
// Percentile: "95"
// Ranged Taxable Income: "$164,547 to $176,374"
// Sex: "Male"
