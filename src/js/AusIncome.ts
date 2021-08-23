import { Chart, decorateTable, $, d3 } from 'chart'
import 'datatables.net'

console.log("Australian Income stuff");







d3.csv('/blogposts/AusIncome.csv', function(d:d3.DSVRowString<string>) {

  var blob = {
    percentile: d.Percentile,
    sex: d.Sex,
    count: d['Number of individuals '],
    income: d['Ranged Taxable Income'].replace(/[$,]/g, '').match(/\d+/g).map(d => parseInt(d))
  }
  return blob
}).then((data) => {
  console.log(data)



  new Chart({
    element: 'income',
    title: "Australian Income",
    data: data,
    nav: false,
  }).scratchpad(chart => {

  })
})


// "Number of individuals ": "80274"
// Percentile: "95"
// Ranged Taxable Income: "$164,547 to $176,374"
// Sex: "Male"
