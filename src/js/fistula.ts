import { Chart, decorateTable } from './chart'
import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'
import { parse } from 'path'

console.log('Running fistula.ts')

type RawFistulaDataPoint = {
  'Patient ID': string
  Country: string
  Age: string
  'Patient symptoms': string
  'Years leaking': string
  'Outcome of surgery': string
  'Years lost': string
  'Years gained': string
  'Surgery cost (USD)': string
}

type FistulaDataPoint = {
  PatientID: string
  Country: string
  Age: number
  PatientSymptoms: string
  YearsLeaking: number
  OutcomeOfSurgery: string
  YearsLost: number
  YearsGained: number
  Cost: number
}

const data: {
  Continent: FistulaDataPoint[]
  Incontinent: FistulaDataPoint[]
  Partial: FistulaDataPoint[]
} = {
  Continent: [],
  Incontinent: [],
  Partial: [],
}

let maxYears: number = 0

$.when($.ready).then(function () {
  const chart = new Chart({
    // eslint-disable-line
    element: 'exampleDiv',
    margin: 20,
    width: 800,
    height: 600,
    nav: false,
  }).scratchpad((chart: Chart) => {
    d3.csv(
      '/dataviz/fistula.csv',
      function (row: RawFistulaDataPoint): FistulaDataPoint {
        // console.log(row);

        let cleanData: FistulaDataPoint = {
          PatientID: row['Patient ID'],
          Country: row.Country,
          Age: parseInt(row.Age),
          PatientSymptoms: row['Patient symptoms'],
          YearsLeaking: parseInt(row['Years leaking']),
          OutcomeOfSurgery: row['Outcome of surgery'],
          YearsLost: parseFloat(row['Years lost']),
          YearsGained: parseFloat(row['Years gained']),
          Cost: parseInt(row['Surgery cost (USD)']),
        }

        // row["Years lost"] = parseFloat(row["Years lost"])

        if (cleanData.YearsLost > maxYears) {
          maxYears = cleanData.YearsLost
        }
        if (cleanData.YearsGained > maxYears) {
          maxYears = cleanData.YearsGained
        }

        if (row['Outcome of surgery'] === 'Continent') {
          data.Continent.push(cleanData)
        } else if (row['Outcome of surgery'] === 'Incontinent') {
          data.Incontinent.push(cleanData)
        } else if (row['Outcome of surgery'] === 'Partial Continence') {
          data.Partial.push(cleanData)
        }

        return cleanData
      },
    ).then((d) => {
      console.log('maxYears', maxYears)

      chart.svg.append('line').attrs({
        x1: chart.width * 0.2,
        y1: chart.height / 2,
        x2: chart.width * 0.9,
        y2: chart.height / 2,
        stroke: 'black',
      })

      chart.svg.append('line').attrs({
        x1: chart.width * 0.2,
        y1: chart.height * 0.1,
        x2: chart.width * 0.2,
        y2: chart.height * 0.9,
        stroke: 'black',
      })

      // Draw a box plot.
      data.Continent = data.Continent.sort((a, b) => {
        return b.YearsGained - a.YearsGained
      })
      var length = data.Continent.length
      var height = chart.height * 0.45
      var ratio = height / maxYears
      var top = data.Continent[Math.floor(length / 4)].YearsGained * ratio
      var bottom =
        data.Continent[Math.floor((3 * length) / 4)].YearsGained * ratio
      var midpoint = chart.height / 2
      chart.svg.append('rect').attrs({
        x: chart.width * 0.3,
        width: chart.width * 0.05,
        y: midpoint - top,
        height: top - bottom,
        fill: 'white',
        stroke: 'black',
      })

      var median = data.Continent[Math.floor(length / 2)].YearsGained * ratio
      chart.svg.append('line').attrs({
        x1: chart.width * 0.3,
        x2: chart.width * 0.35,
        y1: midpoint - median,
        y2: midpoint - median,
        stroke: 'black',
      })

      // Draw a box plot.
      data.Incontinent = data.Incontinent.sort((a, b) => {
        return b.YearsGained - a.YearsGained
      })
      var length = data.Incontinent.length
      var height = chart.height * 0.45
      var ratio = height / maxYears
      var top = data.Incontinent[Math.floor(length / 4)].YearsGained * ratio
      var bottom =
        data.Incontinent[Math.floor((3 * length) / 4)].YearsGained * ratio
      var midpoint = chart.height / 2
      chart.svg.append('rect').attrs({
        x: chart.width * 0.4,
        width: chart.width * 0.05,
        y: midpoint - top,
        height: top - bottom,
        fill: 'white',
        stroke: 'black',
      })

      var median = data.Incontinent[Math.floor(length / 2)].YearsGained * ratio
      chart.svg.append('line').attrs({
        x1: chart.width * 0.4,
        x2: chart.width * 0.45,
        y1: midpoint - median,
        y2: midpoint - median,
        stroke: 'black',
      })

      // Draw a box plot.
      data.Partial = data.Partial.sort((a, b) => {
        return b.YearsGained - a.YearsGained
      })
      var length = data.Partial.length
      var height = chart.height * 0.45
      var ratio = height / maxYears
      var top = data.Partial[Math.floor(length / 4)].YearsGained * ratio
      var bottom =
        data.Partial[Math.floor((3 * length) / 4)].YearsGained * ratio
      var midpoint = chart.height / 2
      chart.svg.append('rect').attrs({
        x: chart.width * 0.5,
        width: chart.width * 0.05,
        y: midpoint - top,
        height: top - bottom,
        fill: 'white',
        stroke: 'black',
      })

      var median = data.Partial[Math.floor(length / 2)].YearsGained * ratio
      chart.svg.append('line').attrs({
        x1: chart.width * 0.5,
        x2: chart.width * 0.55,
        y1: midpoint - median,
        y2: midpoint - median,
        stroke: 'black',
      })

      // years lost:

      // Draw a box plot.
      data.Continent = data.Continent.sort((a, b) => {
        return b.YearsLost - a.YearsLost
      })
      var length = data.Continent.length
      var height = chart.height * 0.45
      var ratio = height / maxYears
      var top = data.Continent[Math.floor(length / 4)].YearsLost * ratio
      var bottom =
        data.Continent[Math.floor((3 * length) / 4)].YearsLost * ratio
      var midpoint = chart.height / 2
      chart.svg.append('rect').attrs({
        x: chart.width * 0.3,
        width: chart.width * 0.05,
        y: midpoint + bottom,
        height: top - bottom,
        fill: 'white',
        stroke: 'black',
      })

      var median = data.Continent[Math.floor(length / 2)].YearsLost * ratio
      chart.svg.append('line').attrs({
        x1: chart.width * 0.3,
        x2: chart.width * 0.35,
        y1: midpoint + median,
        y2: midpoint + median,
        stroke: 'black',
      })

      // Draw a box plot.
      data.Incontinent = data.Incontinent.sort((a, b) => {
        return b.YearsLost - a.YearsLost
      })
      var length = data.Incontinent.length
      var height = chart.height * 0.45
      var ratio = height / maxYears
      var top = data.Incontinent[Math.floor(length / 4)].YearsLost * ratio
      var bottom =
        data.Incontinent[Math.floor((3 * length) / 4)].YearsLost * ratio
      var midpoint = chart.height / 2
      chart.svg.append('rect').attrs({
        x: chart.width * 0.4,
        width: chart.width * 0.05,
        y: midpoint + bottom,
        height: top - bottom,
        fill: 'white',
        stroke: 'black',
      })

      var median = data.Incontinent[Math.floor(length / 2)].YearsLost * ratio
      chart.svg.append('line').attrs({
        x1: chart.width * 0.4,
        x2: chart.width * 0.45,
        y1: midpoint + median,
        y2: midpoint + median,
        stroke: 'black',
      })

      // Draw a box plot.
      data.Partial = data.Partial.sort((a, b) => {
        return b.YearsLost - a.YearsLost
      })
      var length = data.Partial.length
      var height = chart.height * 0.45
      var ratio = height / maxYears
      var top = data.Partial[Math.floor(length / 4)].YearsLost * ratio
      var bottom = data.Partial[Math.floor((3 * length) / 4)].YearsLost * ratio
      var midpoint = chart.height / 2
      chart.svg.append('rect').attrs({
        x: chart.width * 0.5,
        width: chart.width * 0.05,
        y: midpoint + bottom,
        height: top - bottom,
        fill: 'white',
        stroke: 'black',
      })

      var median = data.Partial[Math.floor(length / 2)].YearsLost * ratio
      chart.svg.append('line').attrs({
        x1: chart.width * 0.5,
        x2: chart.width * 0.55,
        y1: midpoint + median,
        y2: midpoint + median,
        stroke: 'black',
      })

      console.log(data)
    })
  })
})
