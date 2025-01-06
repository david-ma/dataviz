import { Chart, d3 } from './chart'
import RAPIER from '@dimforge/rapier2d'

import {
  Block,
  CircleBlock,
  SquareBlock,
  TriangleBlock,
  ShapeType,
  Position,
} from './blocks'

new Chart({
  element: 'datavizChart',
  nav: false,
  renderer: 'canvas',
})
  .clear_canvas()
  .scratchpad((chart) => {
    const scale = 50
    const blocks: Block[] = []
    const gravity = new RAPIER.Vector2(0.0, -9.81)
    let world = new RAPIER.World(gravity)
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(
      chart.width / scale / 2, // half width
      0.1 // height
    )
    let leftWallColliderDesc = RAPIER.ColliderDesc.cuboid(
      0.1, // width
      chart.height / scale / 2 // half height
    )
    let rightWallColliderDesc = RAPIER.ColliderDesc.cuboid(
      0.1, // width
      chart.height / scale / 2 // half height
    )
    world
      .createCollider(leftWallColliderDesc)
      .setTranslation({ x: -chart.width / scale / 2, y: 0 })
    world
      .createCollider(rightWallColliderDesc)
      .setTranslation({ x: chart.width / scale / 2, y: 0 })
    world
      .createCollider(groundColliderDesc)
      .setTranslation({ x: 0, y: -chart.height / scale / 2 })

    function spawnBlock() {
      const randX = (Math.random() - 0.5) * (chart.width / scale)
      const randRadius = 15 + Math.random() * 20

      const rigidBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(randX, chart.height / scale / 2)
          .setRotation(Math.random() * Math.PI * 2)
      )

      // Random shape
      const shape = Math.floor(Math.random() * 3)
      const block = (() => {
        switch (shape) {
          case ShapeType.Circle:
            return new CircleBlock(rigidBody, randRadius)
          case ShapeType.Square:
            return new SquareBlock(rigidBody, randRadius)
          case ShapeType.Triangle:
            return new TriangleBlock(rigidBody, randRadius)
        }
      })()

      block.initPhysics(world)
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
      world.step()

      // Get the mouse position and use it as lightPosition
      const lightPosition = chart.mouse_position

      // Draw light source
      drawLightSource(chart.context, lightPosition)

      blocks.forEach((block) => {
        const position = block.body.translation()
        const screenPosition = {
          x: position.x * scale + chart.width / 2,
          y: chart.height - (position.y * scale + chart.height / 2),
        }
        drawShape(chart.context, screenPosition, lightPosition, block)
      })
      requestAnimationFrame(render)
    }

    setInterval(spawnBlock, 1000)
    requestAnimationFrame(render)
  })
