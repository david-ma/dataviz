// import $ from 'jquery';
import 'datatables.net'
declare let jsonPath: any

let stuff = []
const columnNames = { gene: 'string' }

class Variant {
    gene: string;

    constructor (data) {
      Object.keys(data.domainModel.schema)
        .forEach((property) => { columnNames[property] = this[property] = jsonPath(data, data.domainModel.schema[property]) })
      if (!this.gene) throw new RangeError('No Gene')
    }
}

const variants = []

$.ajax('/08007755.json', {
  success: function (d) {
    console.log(d)
    stuff = d
    globalThis.stuff = stuff

    Object.keys(d.okResults).forEach(function (hgvsg) {
      try {
        const v = new Variant(d.okResults[hgvsg])
        variants.push(v)
      } catch (e) {
        if (e.message === 'No Gene') {
          // console.log("Variant had no gene. This is fine.");
        } else {
          console.error(e)
        }
      }
    })

    const columns = Object.keys(columnNames).map(d => ({ data: d, name: d, title: d }))

    $('#myTable').DataTable({
      pageLength: 50,
      data: variants,
      columns: columns
    })
  }
})
