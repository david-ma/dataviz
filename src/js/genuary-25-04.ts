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

type Position = { x: number; y: number }

class Block {
  body: RAPIER.RigidBody
  shape: ShapeType
  radius: number
  physicsRadius: number

  constructor(body: RAPIER.RigidBody, shape: ShapeType, radius: number) {
    this.body = body
    this.shape = shape
    this.radius = radius
    const scale = 50

    // Scale physics colliders to match visual size
    this.physicsRadius = this.radius / scale
  }

  physicsVertices(): Float32Array {
    throw new Error('Method not implemented.')
  }

  initPhysics(world: RAPIER.World) {
    world.createCollider(
      RAPIER.ColliderDesc.convexHull(this.physicsVertices()),
      this.body
    )
  }

  draw(ctx: CanvasRenderingContext2D, position: Position) {
    throw new Error('Method not implemented.')
  }
}

class TriangleBlock extends Block {
  constructor(body: RAPIER.RigidBody, radius: number) {
    super(body, ShapeType.Triangle, radius)
  }

  physicsVertices() {
    const h = (this.radius * Math.sqrt(3)) / 2
    return new Float32Array([
      0,
      this.radius, // top
      (-this.radius * Math.sqrt(3)) / 2,
      -h / 2, // bottom left
      (this.radius * Math.sqrt(3)) / 2,
      -h / 2, // bottom right
    ])
  }

  draw(ctx: CanvasRenderingContext2D, position: Position) {
    const angle = this.body.rotation()
    const h = (this.radius * Math.sqrt(3)) / 2
    ctx.save()
    ctx.translate(position.x, position.y)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.moveTo(0, -this.radius)
    ctx.lineTo(h, this.radius / 2)
    ctx.lineTo(-h, this.radius / 2)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
}

class SquareBlock extends Block {
  constructor(body: RAPIER.RigidBody, radius: number) {
    super(body, ShapeType.Square, radius)
  }

  physicsVertices() {
    return new Float32Array([
      -this.physicsRadius,
      -this.physicsRadius,
      this.physicsRadius,
      -this.physicsRadius,
      this.physicsRadius,
      this.physicsRadius,
      -this.physicsRadius,
      this.physicsRadius,
    ])
  }

  draw(ctx: CanvasRenderingContext2D, position: Position) {
    const angle = this.body.rotation()
    ctx.save()
    ctx.translate(position.x, position.y)
    ctx.rotate(angle)
    ctx.fillRect(-this.radius, -this.radius, this.radius * 2, this.radius * 2)
    ctx.restore()
  }
}

class CircleBlock extends Block {
  constructor(body: RAPIER.RigidBody, radius: number) {
    super(body, ShapeType.Circle, radius)
  }

  initPhysics(world: RAPIER.World) {
    world.createCollider(
      RAPIER.ColliderDesc.ball(this.physicsRadius),
      this.body
    )
  }

  draw(ctx: CanvasRenderingContext2D, position: Position) {
    ctx.beginPath()
    ctx.arc(position.x, position.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
  }
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
      ctx.fillStyle = '#000'

      block.draw(ctx, { x, y })

      // switch (block.shape) {
      //   case ShapeType.Circle:
      //     ctx.beginPath()
      //     // Black fill
      //     ctx.beginPath()
      //     ctx.arc(x, y, block.radius, 0, Math.PI * 2)
      //     ctx.fill()

      //     // Grey back edge
      //     ctx.beginPath()
      //     ctx.strokeStyle = '#333'
      //     ctx.lineWidth = 2
      //     ctx.arc(
      //       x,
      //       y,
      //       block.radius,
      //       lightAngle + Math.PI * 0.25,
      //       lightAngle - Math.PI * 0.75
      //     )
      //     ctx.stroke()

      //     // White highlight
      //     ctx.beginPath()
      //     ctx.strokeStyle = 'white'
      //     ctx.arc(
      //       x,
      //       y,
      //       block.radius,
      //       lightAngle - Math.PI * 0.75,
      //       lightAngle + Math.PI * 0.25
      //     )
      //     ctx.stroke()
      //     break

      //   case ShapeType.Square:
      //     ctx.save()
      //     ctx.translate(x, y)
      //     ctx.rotate(angle)

      //     // Fill square
      //     ctx.beginPath()
      //     ctx.rect(
      //       -block.radius,
      //       -block.radius,
      //       block.radius * 2,
      //       block.radius * 2
      //     )
      //     ctx.fill()

      //     const edges = [
      //       { start: [-1, -1], end: [1, -1], normal: [0, -1] }, // top
      //       { start: [1, -1], end: [1, 1], normal: [1, 0] }, // right
      //       { start: [1, 1], end: [-1, 1], normal: [0, 1] }, // bottom
      //       { start: [-1, 1], end: [-1, -1], normal: [-1, 0] }, // left
      //     ]

      //     // Draw back edges (grey)
      //     ctx.beginPath()
      //     ctx.strokeStyle = '#333'
      //     ctx.lineWidth = 2
      //     edges.forEach((edge) => {
      //       const rotatedNormal = {
      //         x:
      //           edge.normal[0] * Math.cos(-angle) -
      //           edge.normal[1] * Math.sin(-angle),
      //         y:
      //           edge.normal[0] * Math.sin(-angle) +
      //           edge.normal[1] * Math.cos(-angle),
      //       }
      //       const dotProduct =
      //         rotatedNormal.x * lightDir.x + rotatedNormal.y * lightDir.y

      //       if (dotProduct >= 0) {
      //         ctx.moveTo(
      //           edge.start[0] * block.radius,
      //           edge.start[1] * block.radius
      //         )
      //         ctx.lineTo(edge.end[0] * block.radius, edge.end[1] * block.radius)
      //       }
      //     })
      //     ctx.stroke()

      //     // Draw front edges (white)
      //     ctx.beginPath()
      //     ctx.strokeStyle = 'white'
      //     edges.forEach((edge) => {
      //       const rotatedNormal = {
      //         x:
      //           edge.normal[0] * Math.cos(-angle) -
      //           edge.normal[1] * Math.sin(-angle),
      //         y:
      //           edge.normal[0] * Math.sin(-angle) +
      //           edge.normal[1] * Math.cos(-angle),
      //       }
      //       const dotProduct =
      //         rotatedNormal.x * lightDir.x + rotatedNormal.y * lightDir.y

      //       if (dotProduct < 0) {
      //         ctx.moveTo(
      //           edge.start[0] * block.radius,
      //           edge.start[1] * block.radius
      //         )
      //         ctx.lineTo(edge.end[0] * block.radius, edge.end[1] * block.radius)
      //       }
      //     })
      //     ctx.stroke()
      //     ctx.restore()
      //     break

      //   case ShapeType.Triangle:
      //     ctx.save()
      //     ctx.translate(x, y)
      //     ctx.rotate(angle)

      //     // Fill equilateral triangle
      //     ctx.beginPath()
      //     const h = (block.radius * Math.sqrt(3)) / 2
      //     ctx.moveTo(0, -block.radius)
      //     ctx.lineTo(h, block.radius / 2)
      //     ctx.lineTo(-h, block.radius / 2)
      //     ctx.closePath()
      //     ctx.fill()

      //     const triangleEdges = [
      //       {
      //         start: [0, -block.radius],
      //         end: [h, block.radius / 2],
      //         normal: [-0.866, -0.5], // right edge normal (60° rotated)
      //       },
      //       {
      //         start: [h, block.radius / 2],
      //         end: [-h, block.radius / 2],
      //         normal: [0, 1], // bottom edge normal
      //       },
      //       {
      //         start: [-h, block.radius / 2],
      //         end: [0, -block.radius],
      //         normal: [0.866, -0.5], // left edge normal (60° rotated)
      //       },
      //     ]

      //     // Draw back edges (grey)
      //     ctx.beginPath()
      //     ctx.strokeStyle = '#333'
      //     ctx.lineWidth = 2
      //     triangleEdges.forEach((edge) => {
      //       const rotatedNormal = {
      //         x:
      //           edge.normal[0] * Math.cos(-angle) -
      //           edge.normal[1] * Math.sin(-angle),
      //         y:
      //           edge.normal[0] * Math.sin(-angle) +
      //           edge.normal[1] * Math.cos(-angle),
      //       }
      //       const dotProduct =
      //         rotatedNormal.x * lightDir.x + rotatedNormal.y * lightDir.y

      //       if (dotProduct >= 0) {
      //         ctx.moveTo(edge.start[0], edge.start[1])
      //         ctx.lineTo(edge.end[0], edge.end[1])
      //       }
      //     })
      //     ctx.stroke()

      //     // Draw front edges (white)
      //     ctx.beginPath()
      //     ctx.strokeStyle = 'white'
      //     triangleEdges.forEach((edge) => {
      //       const rotatedNormal = {
      //         x:
      //           edge.normal[0] * Math.cos(-angle) -
      //           edge.normal[1] * Math.sin(-angle),
      //         y:
      //           edge.normal[0] * Math.sin(-angle) +
      //           edge.normal[1] * Math.cos(-angle),
      //       }
      //       const dotProduct =
      //         rotatedNormal.x * lightDir.x + rotatedNormal.y * lightDir.y

      //       if (dotProduct < 0) {
      //         ctx.moveTo(edge.start[0], edge.start[1])
      //         ctx.lineTo(edge.end[0], edge.end[1])
      //       }
      //     })
      //     ctx.stroke()
      //     ctx.restore()
      //     break
      // }
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
