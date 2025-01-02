import { Chart, d3 } from './chart'
// import * as d3 from 'd3'
// import $ from 'jquery'
// import 'datatables.net'

console.log('Running genuary-25-02.ts')

const width = 1080,
  height = 800

type Vector = {
  x: number
  y: number
}

$.when($.ready).then(function () {
  const chart = new Chart({
    // eslint-disable-line
    element: 'day2viz',
    margin: 20,
    width,
    height,
    nav: false,
    renderer: 'canvas',
  })
    .scratchpad(reset_chart)
    .scratchpad((chart) => {
      // public/images/Balatro-red_deck.png
      // Draw this image
      const image = new Image()
      image.src = '/images/Balatro-red_deck.png'
      let vector : Vector = { x: 5, y: 10 }

      // Draw the image on the svg
      chart.svg
        .append('image')
        .attr('href', '/images/Balatro-red_deck.png')
        .attr('x', 20)
        .attr('y', 20)
        // Allow it to be dragged
        .call(
          d3.drag()
          .on('start', function () {
            console.log('dragstart')
            // Randomise vector
            // vector = {
            //   x: (Math.random() -0.5) * 10,
            //   y: Math.random() * 10 + 10,
            // }
          })
          .on('drag', function (event) {
            // d3.select(this).attr('x', event.x).attr('y', event.y)
            const cardPosX = event.x - 1,
              cardPosY = event.y - 1
            d3.select(this).attr('x', cardPosX).attr('y', cardPosY)

            dropCard(cardPosX, cardPosY, chart, image, vector)
          })
        )
    })
})

function dropCard(x: number, y: number, chart: Chart, image: HTMLImageElement, vector: Vector) {
  console.log('Dropped a card at', x, y)
  chart.context.drawImage(image, x, y)
  
  const new_x = x + vector.x,
    new_y = y + vector.y,
    new_vector = { x: vector.x, y: vector.y + 0.1 }
  if (new_y < height) {
    setTimeout(() => {
      dropCard(new_x, new_y, chart, image, new_vector)
    }, 1000 / 60)
  } else {
    console.log('Card has landed')
  }

    // dropCard(x+vector.x, y+vector.y, chart, image, vector)
  // Make the card fall
  // Make the card bounce
}

function reset_chart(chart: Chart) {
  chart.context.fillStyle = '#213'
  chart.context.fillRect(0, 0, width, height)
  chart.svg.selectAll('*').remove()
}






full_size_modal()
function full_size_modal() {
  // Make the #day2viz element take up the whole webpage
  const elem = document.getElementById('day2viz')
  elem.style.width = 'vw'
  elem.style.position = 'fixed'
  elem.style.left = '0'
  elem.style.top = '0'
}