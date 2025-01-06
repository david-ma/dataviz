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

    function spawnBlock() {
      const block_options: BlockOptions = {
        world: chart.world,
        radius: 60,
        // rotation: Math.random() * Math.PI * 2,
        shape: ShapeType.Square,
        colour: 'red',
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

    function render() {
      chart.clear_canvas()
      chart.world.step()
      chart.draw_colliders()

      // Get the mouse position and use it as lightPosition
      const lightPosition = chart.mouse_position

      // Draw light source
      drawLightSource(chart.context, lightPosition)

      chart.draw_blocks(blocks)

      requestAnimationFrame(render)
    }

    globalThis.blockSpawner = setInterval(spawnBlock, 1)
    requestAnimationFrame(render)
  })

window.setTimeout(() => {
  clearInterval(globalThis.blockSpawner)
}, 1)
