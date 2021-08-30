import { Chart, decorateTable, $, d3 } from 'chart'
import 'datatables.net'
import _ from 'lodash';

console.log("Australian Income stuff");


var total = {};

d3.csv('/blogposts/AusIncome.csv', function(d:d3.DSVRowString<string>) {
  var blob = {
    percentile: parseInt(d.Percentile),
    sex: d.Sex,
    count: parseInt(d['Number of individuals ']),
    income: d['Ranged Taxable Income'].replace(/[$,]/g, '').match(/\d+/g).map(d => parseInt(d))
  }

  if(total[blob.percentile]) {
    total[blob.percentile].count += blob.count;
  } else {
    total[blob.percentile] = {
      percentile: parseInt(d.Percentile),
      sex: "Total",
      count: parseInt(d['Number of individuals ']),
      income: d['Ranged Taxable Income'].replace(/[$,]/g, '').match(/\d+/g).map(d => parseInt(d))
    };
  }

  return blob
}).then((data) => {

  data = _.union(data, _.flatMap(total)) as any;

  new Chart({
    element: 'income',
    title: "Australian Income line graph",
    xLabel: "Percentile",
    yLabel: "Count",
    data: data,
    nav: false,
  }).generalisedLineChart({
    yField: "count",
    xField: "percentile",
    filter: "sex",
    types: [{
      label: "Male",
      color: "Blue"
    },{
      label: "Female",
      color: "Red"
    },{
      label: "Total",
      color: "black"
    }]
  });

  return data;
}).then(data => {
  console.log("data", data)
})


// "Number of individuals ": "80274"
// Percentile: "95"
// Ranged Taxable Income: "$164,547 to $176,374"
// Sex: "Male"
