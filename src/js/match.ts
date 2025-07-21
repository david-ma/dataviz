// A simple memory matching game.
// A board of X by X cards, with pairs of cards.
// The cards are randomised, and have unique colours on the back.
// The player flips two cards at a time.
// If the cards match, they are removed from the board.
// If they don't match, they are flipped back over.


import { d3, Chart } from './chart'

class Card {
  public id: number
  public color: string
  public flipped: boolean = false
  public matched: boolean = false
  public view: any

  constructor(id: number, color: string) {
    this.id = id
    this.color = color
  }

  public flip() {
    this.flipped = !this.flipped
    this.view.classed("flipped", this.flipped)
  }

  public setView(view: any) {
    this.view = view
  }
}

class MatchGame {
  public svg: d3.Selection<SVGSVGElement, any, HTMLElement, any>
  public cards: Card[]

  constructor(cards: Card[], svg: d3.Selection<SVGSVGElement, any, HTMLElement, any>) {
    this.cards = cards
    this.svg = svg
  }

  public draw() {
    this.svg.selectAll("rect.card")
      .remove()
      .data(this.cards)
      .enter()
      .append("g")
      .attr("id", (d) => `card-${d.id}`)
      .classed("card", true)
      .attr("transform", (d) => {
        const x = (d.id % 4) * 220 + 20
        const y = Math.floor(d.id / 4) * 220 + 20
        return `translate(${x}, ${y})`
      })
      .each(function(d) {
        d.setView(d3.select(this))

        d.view.append("text")
          .text(d.id)
          .classed("card-text", true)
          .attr("x", 50)
          .attr("y", 50)
          .attr("text-anchor", "middle")
          .attr("font-size", "40px")
      })
      .append("rect")
      .attr("width", 200)
      .attr("height", 200)
      .attr("fill", (d) => d.color)
      .attr("rx", 10)
      .attr("ry", 10)
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        console.log(d)
        d.flip()
      })
  }
}

const chart = new Chart({
  title: "Matching Game",
  width: 1200,
  height: 1200,
  nav: false,
}).scratchpad((chart) => {

  // Get 8 pairs of cards
  const colors = d3.scaleOrdinal(d3.schemeCategory10)
  const limit = 8
  let cards = []
  for (let i = 0; i < limit; i++) {
    const color = colors(i.toString())
    cards.push(new Card(i, color))
    cards.push(new Card(i+limit, color))
  }

  // cards = shuffle(cards)

  const game = new MatchGame(cards, chart.plot)
  game.draw()

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
