var seq = require('../db_bootstrap').seq
var csv = require('csv/sync')

// @ts-ignore
let fs = require('fs')

var stuff = fs.readFileSync('data/melbourne_export_all.csv', {
  encoding: 'utf8',
})

// console.log(thing)

const records = csv.parse(stuff, {
  delimiter: ',',
  columns: true,
  skip_empty_lines: true,
})

// console.log(records[0])
records.forEach((record) => {
  seq.AwesomeProject.findOne({
    where: {
      id: record.id,
    },
  }).then((d) => {
    if (d) {
      console.log('Found existing record', d.id)
      d.update(record)
    } else {
      console.log('Creating new record', record.id)

      seq.AwesomeProject.create(record).catch((error) => {
        console.log('Error', error)
      })
    }
  })
})

// seq.AwesomeProject.findAll({})
//   .then(function (d) {
//     console.log("Here are all the things")
//     console.log(d.length)
//   })
