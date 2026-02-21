import { Chart } from './chart'
import * as d3 from 'd3'

console.log("Six Seven")


// Load data from: /twitterAnonymized.tdf

type TwitterData = {
  Follower_Count: string,
  Friend_Count: string,
  Status_Count: string,
  UserID: string,
}

d3.tsv('/twitterAnonymized.tdf')
  .then((data) => {
    const rows = data as unknown as TwitterData[]
    console.log(rows)
    // Draw scatterplot

    new Chart({
      element: 'twitter-scatter',
      title: 'Twitter Follower vs Friend Count',
      xLabel: 'Follower Count',
      yLabel: 'Friend Count',
      data: rows,
    })
  })
  .catch(error => {
    console.error(error)
  })