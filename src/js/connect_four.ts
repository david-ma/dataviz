import { Chart, d3 } from './chart'

var table = d3.select("#gameboard table")

for (let row = 0; row < 6; row++) {
  table.append("tr")
  table.append('td').text(row)
  for (let col = 0; col < 7; col++) {
    table.append("td").classed("cell", true).attr("id", `cell-${row}-${col}`)
  }
}

var tr = table.append("tr").classed("actions", true)
tr.append("td")
for (let col = 0; col < 7; col++) {
  tr.append("td").append("a").text("Drop").attr("href", "#").attr("onclick", `drop(${col})`)
}

var player = "X"

function drop(column: number, row: number = 5) {
  if(row < 0) {
    alert("Column is full")
    return
  }

  var cell = d3.select(`#cell-${row}-${column}`)
  var value = cell.text()
  if(value == "") {
    cell.text(player)
    player = player == "X" ? "O" : "X"  
  } else {
    row--
    drop(column, row)
  }
  
}

globalThis.drop = drop
