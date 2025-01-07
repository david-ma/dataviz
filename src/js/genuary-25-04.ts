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
  gravity: { x: 0, y: -9.81 },
})
  .clear_canvas()
  .scratchpad((chart: RapierChart) => {
    const blocks: Block[] = []

    function spawnBlock() {
      const randX = (Math.random() - 0.5) * (chart.width / chart.scale)
      const top_of_chart = chart.height / chart.scale / 2
      const randRadius = 15 + Math.random() * 20

      // Random shape
      const shape: ShapeType = Math.floor(Math.random() * 3)
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

    globalThis.blockSpawner = setInterval(spawnBlock, 20)
    requestAnimationFrame(render)
  })

window.setTimeout(() => {
  clearInterval(globalThis.blockSpawner)
}, 5000)
