import { Chart, d3, $ } from 'chart'

console.log('Running go.ts')

type Square = {
  color :string;
  row: number;
  col: number;
}

class Gameboard {
  squares : Square[][]

  /**
   * 
   * @param nCols number of columns
   * @param nRows number of rows
   */
  constructor (nCols :number, nRows: number) {
    var rows = []

    for(var rowNumber = 0; rowNumber < nRows; rowNumber++) {
      var row = []
      for(var colNumber = 0; colNumber < nCols; colNumber++) {
        row.push({
          color: 'white',
          row: rowNumber,
          col: colNumber
        })
      }
      rows.push(row)
    }

    this.squares = rows;
  }
}

$.when($.ready).then(function () {
  const chart = new Chart({ // eslint-disable-line
    element: 'goBoard',
    margin: 10,
    width: 600,
    height: 800,
    nav: false
  }).scratchpad((chart :Chart) => {
    var nCols = 15,
        nRows = 20,
        sWidth = chart.width / nCols,
        sHeight = chart.height / nRows;

    var gameboard = new Gameboard(nCols, nRows)

    var box = chart.svg.append("g")

    console.log("square data", gameboard.squares)

    box.selectAll<SVGGElement, Square[]>(".row")
      .data(gameboard.squares)
      .enter()
      .append("g")
      .classed("row", true)
      .each( (d,i, arr) => {
        d3.select(arr[i])
          .selectAll(".square")
          .data(d)
          .enter()
          .append("rect")
          .classed("square", true)
          .attrs((d, i) => {
            return {
              x: d.col * sWidth,
              y: d.row * sHeight,
              width: sWidth,
              height: sHeight,
              stroke: 'black',
              'stroke-width': 1,
              fill: d.color
            }
          })
          .on('click', function(d,i,arr){
            var rect = d3.select(arr[i])
            rect.attr("fill", "red")
          })
      })

  })
})
