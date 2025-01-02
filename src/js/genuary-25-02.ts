import { Chart, d3 } from './chart'

const width = 1080,
  height = 800,
  card_height = 186,
  card_width = 138,
  gravity = 0.1

interface Vector {
  x: number
  y: number
}

interface Card {
  x: number
  y: number
  vector: Vector
  image: HTMLImageElement
  isAnimating: boolean
}

class CardAnimation {
  private cards: Card[] = []
  private chart: Chart
  private animationId: number | null = null

  constructor(chart: Chart) {
    this.chart = chart
    this.animate = this.animate.bind(this)
  }

  addCard(x: number, y: number, image: HTMLImageElement) {
    const card: Card = {
      x,
      y,
      vector: { x: 5, y: 10 },
      image,
      isAnimating: true,
    }
    this.cards.push(card)

    if (!this.animationId) {
      this.animationId = requestAnimationFrame(this.animate)
    }
  }

  private animate() {
    // Clear canvas
    this.chart.context.fillStyle = '#213'
    this.chart.context.fillRect(0, 0, width, height)

    // Update and draw cards
    this.cards = this.cards.filter((card) => card.isAnimating)
    this.cards.forEach((card) => {
      // Update position
      card.x += card.vector.x
      card.y += card.vector.y
      card.vector.y += gravity

      // Handle bounce
      if (card.y > height - card_height) {
        card.y = height - card_height
        if (Math.abs(card.vector.y) > 0.1) {
          card.vector.y *= -0.4
        } else {
          card.isAnimating = false
        }
      }

      // Draw card
      this.chart.context.drawImage(card.image, card.x, card.y)
    })

    // Continue animation if cards are still moving
    if (this.cards.some((card) => card.isAnimating)) {
      this.animationId = requestAnimationFrame(this.animate)
    } else {
      this.animationId = null
    }
  }
}

$.when($.ready).then(function () {
  const chart = new Chart({
    element: 'day2viz',
    margin: 20,
    width,
    height,
    nav: false,
    renderer: 'canvas',
  }).scratchpad(reset_chart)

  const cardAnimation = new CardAnimation(chart)
  const image = new Image()
  image.src = '/images/Balatro-red_deck.png'

  // Setup drag handlers
  chart.svg
    .append('image')
    .attr('href', '/images/Balatro-red_deck.png')
    .attr('x', 20)
    .attr('y', 20)
    .call(
      d3.drag().on('drag', function (event) {
        const cardPosX = event.x - card_width / 2
        const cardPosY = event.y - card_height / 2
        d3.select(this).attr('x', cardPosX).attr('y', cardPosY)
        cardAnimation.addCard(cardPosX, cardPosY, image)
      })
    )
})

function reset_chart(chart: Chart) {
  chart.context.fillStyle = '#213'
  chart.context.fillRect(0, 0, width, height)
  chart.svg.selectAll('*').remove()
}
