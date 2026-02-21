import { Chart } from "chart"

console.log("Six Seven")


// Load data from: /twitterAnonymized.tdf

type TwitterData = {
  Follower_Count: string,
  Friend_Count: string,
  Status_Count: string,
  UserID: string,
}

d3.tsv<TwitterData>('/twitterAnonymized.tdf')
  .then((data) => {
    console.log(data)
    // Draw scatterplot

    new Chart({
      element: 'twitter-scatter',
      title: 'Twitter Follower vs Friend Count',
      xLabel: 'Follower Count',
      yLabel: 'Friend Count',
      data: data,
    })
  })
  .catch(error => {
    console.error(error)
  })