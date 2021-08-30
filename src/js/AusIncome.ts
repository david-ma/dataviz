import { Chart, _, d3 } from 'chart'
import 'datatables.net'

console.log('Australian Income stuff')

var total = {}

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
  }

  blob.income = blob.rawIncome[1]
    ? (blob.rawIncome[0] + blob.rawIncome[1]) / 2
    : blob.rawIncome[0]

  if (total[blob.percentile]) {
    total[blob.percentile].count += blob.count
  } else {
    total[blob.percentile] = _.cloneDeep(blob)
    total[blob.percentile].sex = 'Total'
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
      yFormat: "$,",
    })

    return data
  })

// "Number of individuals ": "80274"
// Percentile: "95"
// Ranged Taxable Income: "$164,547 to $176,374"
// Sex: "Male"
