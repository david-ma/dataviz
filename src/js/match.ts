// A simple memory matching game.
// A board of X by X cards, with pairs of cards.
// The cards are randomised, and have unique colours on the back.
// The player flips two cards at a time.
// If the cards match, they are removed from the board.
// If they don't match, they are flipped back over.


import { d3, Chart } from './chart'

const chart = new Chart({
  title: "Matching Game",
  width: 600,
  height: 600,
  nav: false,
}).scratchpad((chart) => {

  // Get 8 pairs of cards
  const colors = d3.scaleOrdinal(d3.schemeCategory10)
  const cards = []
  for (let i = 0; i < 8; i++) {
    const color = colors(i.toString())
    cards.push({
      color,
      id: i,
    })
    cards.push({
      color,
      id: i+1,
    })
  }

  // Draw the cards
  const board = chart.plot.append("g")
  board.selectAll("rect")
    .data(shuffle(cards))
    .enter()
    .append("rect")
    .attr("width", 100)
    .attr("height", 100)
    .attr("fill", (d) => d.color)
    .attr("x", (d, i) => (i % 4) * 110 + 10)
    .attr("y", (d, i) => Math.floor(i / 4) * 110 + 10)
    .attr("rx", 10)
    .attr("ry", 10)
    .attr("cursor", "pointer")
    .on("click", (d) => {
      console.log(d)
    })
})

function shuffle(array: any[]) {
  const result = []
  while (array.length > 0) {
    const index = Math.floor(Math.random() * array.length)
    result.push(array[index])
    array.splice(index, 1)
  }
  return result
}