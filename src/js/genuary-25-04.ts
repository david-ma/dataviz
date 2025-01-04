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

      // Scale physics colliders to match visual size
      const physicsRadius = randRadius / scale

      if (shape === ShapeType.Triangle) {
        const vertices = new Float32Array([
          0,
          physicsRadius, // top
          -physicsRadius * 0.8,
          -physicsRadius * 0.6, // bottom left
          physicsRadius * 0.8,
          -physicsRadius * 0.6, // bottom right
        ])
        world.createCollider(
          RAPIER.ColliderDesc.convexHull(vertices),
          rigidBody
        )
      } else if (shape === ShapeType.Square) {
        world.createCollider(
          RAPIER.ColliderDesc.cuboid(physicsRadius, physicsRadius),
          rigidBody
        )
      } else {
        world.createCollider(RAPIER.ColliderDesc.ball(physicsRadius), rigidBody)
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
      const angle = block.body.rotation()
      const lightDir = { x: 1, y: 1 } // Top-right light source
      const lightAngle = Math.atan2(lightDir.y, lightDir.x)

      ctx.beginPath()
      ctx.fillStyle = "black"

      switch (block.shape) {
        case ShapeType.Circle:
          ctx.beginPath()
          ctx.arc(x, y, block.radius, 0, Math.PI * 2)
          ctx.fillStyle = "black"
          ctx.fill()

          // Calculate visible arc based on light direction
          ctx.beginPath()
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2
          const lightAngle = Math.atan2(lightDir.y, lightDir.x)
          const visibleArcStart = lightAngle - Math.PI * 0.75
          const visibleArcEnd = lightAngle + Math.PI * 0.25
          ctx.arc(x, y, block.radius, visibleArcStart, visibleArcEnd)
          ctx.stroke()
          break

        case ShapeType.Square:
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(angle)

          // Fill square
          ctx.beginPath()
          ctx.rect(
            -block.radius,
            -block.radius,
            block.radius * 2,
            block.radius * 2
          )
          ctx.fillStyle = "black"
          ctx.fill()

          // Edge highlighting
          ctx.beginPath()
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2

          const edges = [
            { start: [-1, -1], end: [1, -1], normal: [0, -1] }, // top
            { start: [1, -1], end: [1, 1], normal: [1, 0] }, // right
            { start: [1, 1], end: [-1, 1], normal: [0, 1] }, // bottom
            { start: [-1, 1], end: [-1, -1], normal: [-1, 0] }, // left
          ]

          edges.forEach((edge) => {
            const rotatedNormal = {
              x:
                edge.normal[0] * Math.cos(-angle) -
                edge.normal[1] * Math.sin(-angle),
              y:
                edge.normal[0] * Math.sin(-angle) +
                edge.normal[1] * Math.cos(-angle),
            }
            const dotProduct =
              rotatedNormal.x * lightDir.x + rotatedNormal.y * lightDir.y

            if (dotProduct < 0) {
              ctx.moveTo(
                edge.start[0] * block.radius,
                edge.start[1] * block.radius
              )
              ctx.lineTo(edge.end[0] * block.radius, edge.end[1] * block.radius)
            }
          })
          ctx.stroke()
          ctx.restore()
          break

        case ShapeType.Triangle:
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(angle)

          // Fill triangle
          ctx.beginPath()
          ctx.moveTo(0, -block.radius)
          ctx.lineTo(block.radius * 0.8, block.radius * 0.6)
          ctx.lineTo(-block.radius * 0.8, block.radius * 0.6)
          ctx.closePath()
          ctx.fillStyle = "black"
          ctx.fill()

          // Draw visible edges
          ctx.beginPath()
          ctx.strokeStyle = 'white'
          ctx.lineWidth = 2

          const triangleEdges = [
            {
              start: [0, -block.radius],
              end: [block.radius * 0.8, block.radius * 0.6],
              normal: [-0.6, -0.8], // right edge normal
            },
            {
              start: [block.radius * 0.8, block.radius * 0.6],
              end: [-block.radius * 0.8, block.radius * 0.6],
              normal: [0, 1], // bottom edge normal
            },
            {
              start: [-block.radius * 0.8, block.radius * 0.6],
              end: [0, -block.radius],
              normal: [0.6, -0.8], // left edge normal
            },
          ]

          triangleEdges.forEach((edge) => {
            const rotatedNormal = {
              x:
                edge.normal[0] * Math.cos(-angle) -
                edge.normal[1] * Math.sin(-angle),
              y:
                edge.normal[0] * Math.sin(-angle) +
                edge.normal[1] * Math.cos(-angle),
            }

            const dotProduct =
              rotatedNormal.x * lightDir.x + rotatedNormal.y * lightDir.y

            if (dotProduct < 0) {
              ctx.moveTo(edge.start[0], edge.start[1])
              ctx.lineTo(edge.end[0], edge.end[1])
            }
          })

          ctx.stroke()
          ctx.restore()
          break
      }
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
