import { d3 } from './chart'
import {
  Block,
  Position,
  RapierChart,
  BlockOptions,
  blockFactory,
  ShapeType,
} from './blocks'

new RapierChart({
  element: 'datavizChart',
  nav: false,
  renderer: 'canvas',
})
  .clear_canvas()
  .scratchpad((chart: RapierChart) => {
    const blocks: Block[] = []
    const lines: {
      start: Position
      end: Position
    }[] = []

    for (let i = 0; i < 10; i++) {
      lines.push({
        start: {
          x: Math.random() * chart.width,
          y: Math.random() * chart.height,
        },
        end: {
          x: Math.random() * chart.width,
          y: Math.random() * chart.height,
        },
      })
    }

    function drawLine(
      ctx: CanvasRenderingContext2D,
      line: { start: Position; end: Position },
      lightPosition: Position,
      colour: string = 'white',
    ) {
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(line.start.x, line.start.y)
      ctx.lineTo(line.end.x, line.end.y)
      ctx.lineWidth = 2
      ctx.strokeStyle = colour

      if (
        Math.sign(
          (line.end.x - line.start.x) * (lightPosition.y - line.start.y) -
            (line.end.y - line.start.y) * (lightPosition.x - line.start.x),
        ) === 1
      ) {
        ctx.globalAlpha = 0.5
      }
      ctx.stroke()
      // Draw arrow at end
      ctx.beginPath()
      ctx.translate(line.end.x, line.end.y)
      ctx.rotate(
        Math.atan2(line.end.y - line.start.y, line.end.x - line.start.x),
      )
      ctx.moveTo(0, 0)
      ctx.lineTo(-10, -5)
      ctx.lineTo(-10, 5)
      ctx.lineTo(0, 0)
      ctx.fillStyle = colour
      ctx.fill()

      ctx.restore()
    }

    function spawnBlock() {
      const block_options: BlockOptions = {
        world: chart.world,
        radius: 60,
        // rotation: Math.random() * Math.PI * 2,
        shape: ShapeType.Square,
        colour: 'maroon',
      }

      const block = blockFactory(block_options)

      block.initPhysics(chart.world)
      blocks.push(block)
    }

    function drawLightSource(
      ctx: CanvasRenderingContext2D,
      position: Position,
    ) {
      ctx.save()
      ctx.beginPath()
      ctx.arc(position.x, position.y, 10, 0, Math.PI * 2)
      ctx.fillStyle = 'white'

      ctx.fill()
      ctx.restore()
    }

    function render() {
      chart.clear_canvas()
      chart.world.step()
      chart.draw_colliders()

      // Get the mouse position and use it as lightPosition
      const lightPosition = chart.mouse_position

      // Draw light source
      drawLightSource(chart.context, lightPosition)

      chart.draw_blocks(blocks)
      lines.forEach((line, i) =>
        drawLine(
          chart.context,
          line,
          lightPosition,
          d3.color(d3.schemeCategory10[i % 10]).toString(),
        ),
      )

      requestAnimationFrame(render)
    }

    spawnBlock()
    // globalThis.blockSpawner = setInterval(spawnBlock, 1)
    requestAnimationFrame(render)
  })

window.setTimeout(() => {
  clearInterval(globalThis.blockSpawner)
}, 1)
