import { Chart, d3 } from './chart'
import RAPIER from '@dimforge/rapier2d'

export enum ShapeType {
  Circle,
  Square,
  Triangle,
}

export interface Block {
  body: RAPIER.RigidBody
  shape: ShapeType
  radius: number
}

export type Position = { x: number; y: number }

export class Block {
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

  draw(
    ctx: CanvasRenderingContext2D,
    position: Position,
    lightPoint: Position
  ) {
    throw new Error('Method not implemented.')
  }

  rotation() {
    return this.body ? this.body.rotation() : 0
  }

  lightAngle(lightPoint: Position) {
    const position = this.body.translation()
    const lightVector = {
      x: lightPoint.x - position.x,
      y: lightPoint.y - position.y,
    }
    const naiveLightAngle = Math.atan2(lightVector.y, lightVector.x)
    // This is the angle between the light vector and the body's x-axis

    const bodyAngle = this.body.rotation()
    // This is the body's rotation angle

    // return naiveLightAngle - bodyAngle
    // This is the angle between the light vector and the body's normal vector

    return naiveLightAngle
  }
}

export class TriangleBlock extends Block {
  constructor(body: RAPIER.RigidBody, radius: number) {
    super(body, ShapeType.Triangle, radius)
  }

  physicsVertices() {
    const h = (this.physicsRadius * Math.sqrt(3)) / 2
    return new Float32Array([
      0,
      this.physicsRadius, // top
      (-this.physicsRadius * Math.sqrt(3)) / 2,
      -h / 2, // bottom left
      (this.physicsRadius * Math.sqrt(3)) / 2,
      -h / 2, // bottom right
    ])
  }
  draw(
    ctx: CanvasRenderingContext2D,
    position: Position,
    lightPoint: Position
  ) {
    const angle = this.body.rotation()
    const h = (this.radius * Math.sqrt(3)) / 2
    const lightAngle = this.lightAngle(lightPoint)

    ctx.save()
    ctx.translate(position.x, position.y)
    ctx.rotate(angle)

    // Base triangle
    ctx.beginPath()
    ctx.moveTo(0, -this.radius)
    ctx.lineTo(h, this.radius / 2)
    ctx.lineTo(-h, this.radius / 2)
    ctx.closePath()
    ctx.fillStyle = '#000'
    ctx.fill()

    const triangleEdges = [
      {
        start: [0, -this.radius],
        end: [h, this.radius / 2],
        normal: [-0.866, -0.5], // right edge normal (60° rotated)
      },
      {
        start: [h, this.radius / 2],
        end: [-h, this.radius / 2],
        normal: [0, 1], // bottom edge normal
      },
      {
        start: [-h, this.radius / 2],
        end: [0, -this.radius],
        normal: [0.866, -0.5], // left edge normal (60° rotated)
      },
    ]

    // Draw back edges (grey)
    ctx.beginPath()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    triangleEdges.forEach((edge) => {
      const rotatedNormal = {
        x:
          edge.normal[0] * Math.cos(-angle) - edge.normal[1] * Math.sin(-angle),
        y:
          edge.normal[0] * Math.sin(-angle) + edge.normal[1] * Math.cos(-angle),
      }
      const dotProduct = Math.cos(lightAngle) * rotatedNormal.x + Math.sin(lightAngle) * rotatedNormal.y

      if (dotProduct >= 0) {
        ctx.moveTo(edge.start[0], edge.start[1])
        ctx.lineTo(edge.end[0], edge.end[1])
      }
    })
    ctx.stroke()

    // Draw front edges (white)
    ctx.beginPath()
    ctx.strokeStyle = 'white'
    triangleEdges.forEach((edge) => {
      const rotatedNormal = {
        x:
          edge.normal[0] * Math.cos(-angle) - edge.normal[1] * Math.sin(-angle),
        y:
          edge.normal[0] * Math.sin(-angle) + edge.normal[1] * Math.cos(-angle),
      }
      const dotProduct = Math.cos(lightAngle) * rotatedNormal.x + Math.sin(lightAngle) * rotatedNormal.y

      if (dotProduct < 0) {
        ctx.moveTo(edge.start[0], edge.start[1])
        ctx.lineTo(edge.end[0], edge.end[1])
      }
    })
    ctx.stroke()

    ctx.restore()
  }
}

export class SquareBlock extends Block {
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
  draw(
    ctx: CanvasRenderingContext2D,
    position: Position,
    lightPoint: Position
  ) {
    const angle = this.rotation()

    // Calculate vector from square to light
    const lightVector = {
      x: lightPoint.x - position.x,
      y: lightPoint.y - position.y,
    }
    const light_direction = Math.atan2(lightVector.y, lightVector.x)

    ctx.save()
    ctx.translate(position.x, position.y)
    ctx.rotate(angle)

    // Base square
    ctx.beginPath()
    ctx.rect(-this.radius, -this.radius, this.radius * 2, this.radius * 2)
    ctx.fillStyle = '#000'
    ctx.fill()

    // Define edges with normals
    const edges = [
      { start: [-1, -1], end: [1, -1], normal: [0, -1] }, // top
      { start: [1, -1], end: [1, 1], normal: [1, 0] }, // right
      { start: [-1, 1], end: [1, 1], normal: [0, 1] }, // bottom
      { start: [-1, -1], end: [-1, 1], normal: [-1, 0] }, // left
    ]


    // Draw edges, in their correct colours
    ctx.beginPath()
    ctx.lineWidth = 2
    edges.forEach((edge) => {
      const rotatedNormal = {
        x:
          edge.normal[0] * Math.cos(-angle) - edge.normal[1] * Math.sin(-angle),
        y:
          edge.normal[0] * Math.sin(-angle) + edge.normal[1] * Math.cos(-angle),
      }
      const normal_direction = Math.atan2(rotatedNormal.y, rotatedNormal.x)
      const dotProduct = Math.cos(light_direction) * rotatedNormal.x + Math.sin(light_direction) * rotatedNormal.y
    
      // Set color based on whether edge faces light
      ctx.strokeStyle = dotProduct < 0 ? 'white' : '#333'
    
      // Draw edge scaled by radius
      ctx.moveTo(edge.start[0] * this.radius, edge.start[1] * this.radius)
      ctx.lineTo(edge.end[0] * this.radius, edge.end[1] * this.radius)
    })
    ctx.stroke()
    ctx.restore()

    // // Draw back edges (grey)
    // ctx.beginPath()
    // ctx.strokeStyle = '#333'
    // edges.forEach((edge) => {
    //   const rotatedNormal = {
    //     x:
    //       edge.normal[0] * Math.cos(-angle) - edge.normal[1] * Math.sin(-angle),
    //     y:
    //       edge.normal[0] * Math.sin(-angle) + edge.normal[1] * Math.cos(-angle),
    //   }
    //   const dotProduct =
    //     rotatedNormal.x * lightVector.x + rotatedNormal.y * lightVector.y

    //   if (dotProduct < 0) {
    //     ctx.moveTo(edge.start[0] * this.radius, edge.start[1] * this.radius)
    //     ctx.lineTo(edge.end[0] * this.radius, edge.end[1] * this.radius)
    //   }
    // })
    // ctx.stroke()

    // ctx.restore()
  }
}

export class CircleBlock extends Block {
  constructor(body: RAPIER.RigidBody, radius: number) {
    super(body, ShapeType.Circle, radius)
  }

  initPhysics(world: RAPIER.World) {
    world.createCollider(
      RAPIER.ColliderDesc.ball(this.physicsRadius),
      this.body
    )
  }

  draw(
    ctx: CanvasRenderingContext2D,
    position: Position,
    lightPoint: Position
  ) {
    const angle = this.body.rotation()

    // Calculate vector from circle to light
    const lightVector = {
      x: lightPoint.x - position.x,
      y: lightPoint.y - position.y,
    }
    const lightAngle = Math.atan2(lightVector.y, lightVector.x)

    ctx.save()
    ctx.translate(position.x, position.y)

    // Base circle
    ctx.beginPath()
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = '#000'
    ctx.fill()

    // Front edge (white)
    ctx.beginPath()
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 2
    ctx.arc(
      0,
      0,
      this.radius,
      lightAngle - Math.PI / 2,
      lightAngle + Math.PI / 2
    )
    ctx.stroke()

    // Back edge (grey)
    ctx.beginPath()
    ctx.strokeStyle = '#333'
    ctx.arc(
      0,
      0,
      this.radius,
      lightAngle + Math.PI / 2,
      lightAngle + (3 * Math.PI) / 2
    )
    ctx.stroke()

    ctx.restore()
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
