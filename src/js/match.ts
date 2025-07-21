// A simple memory matching game.
// A board of X by X cards, with pairs of cards.
// The cards are randomised, and have unique colours on the back.
// The player flips two cards at a time.
// If the cards match, they are removed from the board.
// If they don't match, they are flipped back over.


import { d3, Chart } from './chart'

class Card {
  public flipped: boolean = false
  public matched: boolean = false
  public view: any

  constructor(
    public id: number,
    public color: string,
    public name: string = "",
  ) {}

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
      .attr("transform", (d, i) => {
        const x = (i % 4) * 220 + 20
        const y = Math.floor(i / 4) * 220 + 20
        return `translate(${x}, ${y})`
      })
      .each(function(d) {
        d.setView(d3.select(this))

        d.view.append("text")
          .text(d.name)
          .classed("card-text", true)
          .attr("x", 10)
          .attr("y", 50)
          .attr("text-anchor", "left")
          .attr("font-size", "40px")

        d.view.append("text")
          .text(d.color)
          .classed("card-text", true)
          .attr("x", 10)
          .attr("y", 100)
          .attr("text-anchor", "left")
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

const colourSchemes = {
  "Easy": [
    {
      name: "Red",
      color: "#d62728",
    },
    {
      name: "Blue",
      color: "#1f77b4",
    },
    {
      name: "Green",
      color: "#2ca02c",
    },
    {
      name: "Yellow",
      color: "#ff7f0e",
    },
    {
      name: "Purple",
      color: "#9467bd",
    },
    {
      name: "Brown",
      color: "#8c564b",
    },
    {
      name: "Pink",
      color: "#e377c2",
    },
    {
      name: "Grey",
      color: "#7f7f7f",
    },
  ]
}

const chart = new Chart({
  title: "Matching Game",
  width: 1200,
  height: 1200,
  nav: false,
}).scratchpad((chart) => {

  // Get 8 pairs of cards
  const colors = colourSchemes["Easy"]
  const limit = colors.length
  let cards = []
  for (let i = 0; i < limit; i++) {
    const color = colors[i].color
    cards.push(new Card(i, color, colors[i].name))
    cards.push(new Card(i+limit, color, colors[i].name))
  }

  const game = new MatchGame(shuffle(cards), chart.plot)
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
