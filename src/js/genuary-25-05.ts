import { Chart, d3 } from './chart'
import { Position, ShapeType, Block, SquareBlock } from './genuary-25-04'

const blocks : Block[] = []
const scale = 50

new Chart({
  element: 'datavizChart',
  nav: false,
  renderer: 'canvas',
})
  .clear_canvas()
  .scratchpad((chart) => {

    blocks.push(new SquareBlock(null, 2))

    function drawLightSource(ctx: CanvasRenderingContext2D, position: Position) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(position.x, position.y, 10, 0, Math.PI * 2)
      ctx.fillStyle = 'white'
      
      ctx.fill()
      ctx.restore()
    }

    function drawShape(
      ctx: CanvasRenderingContext2D,
      position: Position,
      lightPosition: Position,
      block: Block
    ) {

      ctx.beginPath()
      ctx.fillStyle = 'green'

      block.draw(ctx, position, lightPosition)
    }

    function render() {
      chart.clear_canvas()

      // Get the mouse position and use it as lightPosition
      const lightPosition = chart.mouse_position

      // Draw light source
      drawLightSource(chart.context, lightPosition)

      blocks.forEach((block) => {
        // const position = block.body.translation()
        const position = { x: chart.width / 2, y: chart.height / 2 }
        const screenPosition = {
          x: position.x * scale + chart.width / 2,
          y: chart.height - (position.y * scale + chart.height / 2),
        }
        drawShape(chart.context, screenPosition, lightPosition, block)
      })
      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
  })
