import { Chart, d3 } from './chart'
import RAPIER from '@dimforge/rapier2d'

enum ShapeType {
  Circle,
  Square,
  Triangle,
}

interface Block {
  body: RAPIER.RigidBody
  shape: ShapeType
  radius: number
}

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
      const shape = Math.floor(Math.random() * 3)

      const rigidBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(randX, chart.height / scale / 2)
          .setRotation(Math.random() * Math.PI * 2)
      )

      // Create shape-specific collider
      if (shape === ShapeType.Triangle) {
        // Triangle vertices for isosceles triangle
        const vertices = new Float32Array([
          0,
          randRadius, // top
          -randRadius * 0.8,
          -randRadius * 0.6, // bottom left
          randRadius * 0.8,
          -randRadius * 0.6, // bottom right
        ])
        world.createCollider(
          RAPIER.ColliderDesc.convexHull(vertices),
          rigidBody
        )
      } else {
        world.createCollider(RAPIER.ColliderDesc.ball(0.5), rigidBody)
      }

      blocks.push({
        body: rigidBody,
        shape: shape as ShapeType,
        radius: randRadius,
      })
    }

    function drawShape(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      block: Block
    ) {
      ctx.beginPath()
      ctx.fillStyle = d3.schemeCategory10[blocks.indexOf(block) % 10]

      const angle = block.body.rotation()

      switch (block.shape) {
        case ShapeType.Circle:
          ctx.arc(x, y, block.radius, 0, Math.PI * 2)
          break
        case ShapeType.Square:
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(angle)
          ctx.rect(
            -block.radius,
            -block.radius,
            block.radius * 2,
            block.radius * 2
          )
          ctx.restore()
          break
        case ShapeType.Triangle:
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(angle)
          // Draw isosceles triangle
          ctx.moveTo(0, -block.radius)
          ctx.lineTo(block.radius * 0.8, block.radius * 0.6)
          ctx.lineTo(-block.radius * 0.8, block.radius * 0.6)
          ctx.closePath()
          ctx.restore()
          break
      }
      ctx.fill()
    }

    function render() {
      chart.clear_canvas()
      world.step()
      blocks.forEach((block) => {
        const position = block.body.translation()
        const screenX = position.x * scale + chart.width / 2
        const screenY = chart.height - (position.y * scale + chart.height / 2)
        drawShape(chart.context, screenX, screenY, block)
      })
      requestAnimationFrame(render)
    }

    setInterval(spawnBlock, 1000)
    requestAnimationFrame(render)
  })
