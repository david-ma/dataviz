import { Chart, d3 } from './chart'

// var table = d3.select("#gameboard table")

// for (let row = 0; row < 6; row++) {
//   table.append("tr")
//   table.append('td').text(row)
//   for (let col = 0; col < 7; col++) {
//     table.append("td").classed("cell", true).attr("id", `cell-${row}-${col}`)
//   }
// }

// var tr = table.append("tr").classed("actions", true)
// tr.append("td")
// for (let col = 0; col < 7; col++) {
//   tr.append("td").append("a").text("Drop").attr("href", "#").attr("onclick", `drop(${col})`)
// }

// var player = "X"

// function drop(column: number, row: number = 5) {
//   if(row < 0) {
//     alert("Column is full")
//     return
//   }

//   var cell = d3.select(`#cell-${row}-${column}`)
//   var value = cell.text()
//   if(value == "") {
//     cell.text(player)
//     player = player == "X" ? "O" : "X"
//   } else {
//     row--
//     drop(column, row)
//   }

// }

// globalThis.drop = drop

class ConnectFour {
  public currentPlayer: string
  public table: d3.Selection<HTMLTableElement, unknown, HTMLElement, any>
  public gameboard: string[][]

  public cols: number
  public rows: number

  constructor() {
    this.table = d3.select('#gameboard table')
    this.currentPlayer = 'X'
    this.gameboard = Array.from({ length: 6 }, () => Array(7).fill(''))
    this.cols = 7
    this.rows = 6
    this.drawGameboard()
  }

  private drawGameboard() {
    this.table.selectAll('tr').remove()
    for (let row = 0; row < this.rows; row++) {
      var tr = this.table.append('tr')
      tr.append('td').text(row)
      for (let col = 0; col < this.cols; col++) {
        tr.append('td').classed('cell', true).attr('id', `cell-${row}-${col}`)
      }
    }
    var tr = this.table.append('tr').classed('actions', true)
    tr.append('td')
    for (let col = 0; col < this.cols; col++) {
      tr.append('td')
        .append('a')
        .text('Drop')
        .attr('href', '#')
        .on('click', () => this.drop(col))
    }
  }

  public drop(col: number) {
    var row = this.rows - 1
    var cell = this.table.select(`#cell-${row}-${col}`)
    while (row >= 0 && cell.text() != '') {
      row--
      cell = this.table.select(`#cell-${row}-${col}`)
    }

    if (cell.text() == '') {
      cell.text(this.currentPlayer)
      this.currentPlayer = this.currentPlayer == 'X' ? 'O' : 'X'
    }

    if (row < 0) {
      alert('Column is full')
      return
    }
  }
}

new ConnectFour()
