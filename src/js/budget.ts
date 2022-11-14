// import { Chart, decorateTable, $, d3, _ } from 'chart'
// import { sheets } from './budgetdata.js'

// var categories = {}
// globalThis.categories = categories
// var total = 0

// Promise.all(sheets)
//   .then(([David_anz, David_stgeorge, Grace_anz, Grace_commbank]) => {
//     // console.log(David_anz)
//     // console.log(David_stgeorge)
//     // console.log(Grace_anz)
//     // console.log(Grace_commbank)

//     tallyCategories(David_anz, 'David')
//     tallyCategories(David_stgeorge, 'David')
//     tallyCategories(Grace_anz, 'Grace')
//     tallyCategories(Grace_commbank, 'Grace')

//     return categories
//   })
//   .then((categories) => {
//     console.log(categories)
//     var table = d3.select('table tbody')

//     Object.keys(categories)
//       .sort((a, b) => {
//         return categories[a].total - categories[b].total
//       })
//       .forEach((key) => {
//         var category = categories[key]
//         var data = category.data
//         // var total = category.total
//         var name = category.name

//         var tr = table.append('tr')
//         tr.append('td').text(name)
//         tr.append('td').text(category.total.toFixed(2))
//         tr.append('td').text(data.length)
//         tr.append('td').text((category.total / total).toFixed(2)+"%")
//         tr.append('td').text(category.David.toFixed(2))
//         tr.append('td').text(category.Grace.toFixed(2))
//       })
//   })

// function tallyCategories(sheet, person) {
//   sheet.forEach((row) => {
//     var category = row.Category || "Unknown"
//     category = _.startCase(category).trim()

//     var value = row.Amount || -row.Debit || row.Credit
//     value = parseFloat(value)
//     total += value
//     if (category in categories) {
//       categories[category].data.push(row)
//       categories[category].total += value
//     } else {
//       categories[category] = {
//         name: category,
//         data: [row],
//         total: value,
//         David: 0,
//         Grace: 0,
//       }
//     }
//     switch (person) {
//       case 'David':
//         categories[category].David += value
//         break
//       case 'Grace':
//         categories[category].Grace += value
//         break
//     }
//   })
// }
