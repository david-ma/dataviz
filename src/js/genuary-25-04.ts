import { Chart, d3 } from './chart'
import RAPIER from '@dimforge/rapier2d'

import {
  Block,
  Position,
  RapierChart,
  BlockOptions,
  blockFactory,
} from './blocks'

new RapierChart({
  element: 'datavizChart',
  nav: false,
  renderer: 'canvas',
})
  .clear_canvas()
  .scratchpad((chart: RapierChart) => {
    const blocks: Block[] = []
    // const world = this.world

    function spawnBlock() {
      const randX = (Math.random() - 0.5) * (chart.width / chart.scale)
      const top_of_chart = chart.height / chart.scale / 2
      const randRadius = 15 + Math.random() * 20

      // Random shape
      const shape = Math.floor(Math.random() * 3)
      const block_options: BlockOptions = {
        world: chart.world,
        position: { x: randX, y: top_of_chart },
        radius: randRadius,
        rotation: Math.random() * Math.PI * 2,
        shape: shape,
      }

      const block = blockFactory(block_options)

      block.initPhysics(chart.world)
      blocks.push(block)
    }

    function drawLightSource(
      ctx: CanvasRenderingContext2D,
      position: Position
    ) {
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
      const angle = block.body.rotation()
      const lightDir = { x: 1, y: 1 } // Top-right light source
      const lightAngle = Math.atan2(lightDir.y, lightDir.x)

      ctx.beginPath()
      ctx.fillStyle = '#000'

      block.draw(ctx, position, lightPosition)
    }

    function render() {
      chart.clear_canvas()
      chart.world.step()
      chart.draw_colliders()

      // Get the mouse position and use it as lightPosition
      const lightPosition = chart.mouse_position

      // Draw light source
      drawLightSource(chart.context, lightPosition)

      blocks.forEach((block) => {
        const position = block.body.translation()
        const screenPosition = {
          x: position.x * chart.scale + chart.width / 2,
          y: chart.height - (position.y * chart.scale + chart.height / 2),
        }
        drawShape(chart.context, screenPosition, lightPosition, block)
      })
      requestAnimationFrame(render)
    }

    globalThis.blockSpawner = setInterval(spawnBlock, 1)
    requestAnimationFrame(render)
  })

window.setTimeout(() => {
  clearInterval(globalThis.blockSpawner)
}, 1000)
