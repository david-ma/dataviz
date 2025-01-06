import RAPIER from '@dimforge/rapier2d'
import { Chart, d3 } from './chart'

export class RapierChart extends Chart {
  world: RAPIER.World
  scale: number
  colliders: RAPIER.Collider[] = []

  constructor(options) {
    super(options)
    console.log('RapierChart constructor, with gravity and ground')

    const scale = (this.scale = 50)
    const gravity = new RAPIER.Vector2(0.0, -9.81)
    this.world = new RAPIER.World(gravity)

    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(
      this.width / scale / 2, // half width
      0.1 // height
    )
    let wallColliderDesc = RAPIER.ColliderDesc.cuboid(
      0.1, // width
      this.height / scale / 2 // half height
    )

    this.colliders.push(
      this.world.createCollider(groundColliderDesc),
      this.world.createCollider(wallColliderDesc),
      this.world.createCollider(wallColliderDesc)
    )
    this.colliders[0].setTranslation({ x: 0, y: -this.height / scale / 2 })
    this.colliders[1].setTranslation({ x: -this.width / scale / 2, y: 0 })
    this.colliders[2].setTranslation({ x: this.width / scale / 2, y: 0 })
  }

  draw_colliders() {
    this.colliders.forEach((collider, i) => {
      this.context.save()
      this.context.lineWidth = 4
      this.context.strokeStyle = d3.schemeCategory10[i % 10]
      this.context.fillStyle = d3.schemeCategory10[i % 10]

      const shape: RAPIER.Shape = collider.shape
      const position = collider.translation()
      const angle = collider.rotation()
      this.context.translate(
        position.x * this.scale + this.width / 2,
        this.height - (position.y * this.scale + this.height / 2)
      )
      this.context.rotate(angle)
      this.context.beginPath()
      try {
        if (shape instanceof RAPIER.Ball) {
          const radius = shape.radius * this.scale
          this.context.arc(0, 0, radius, 0, Math.PI * 2)
        } else if (shape instanceof RAPIER.Cuboid) {
          const half_width = shape.halfExtents.x * this.scale
          const half_height = shape.halfExtents.y * this.scale
          this.context.rect(
            -half_width,
            -half_height,
            half_width * 2,
            half_height * 2
          )
        } else if (shape instanceof RAPIER.ConvexPolygon) {
          const vertices: Float32Array = shape.vertices
          if (vertices.length < 2 || vertices.length % 2 !== 0) {
            console.error('Invalid vertices:', vertices)
          }
          for (let i = 0; i < vertices.length; i += 2) {
            this.context.lineTo(
              vertices[i] * this.scale,
              vertices[i + 1] * this.scale
            )
          }
          this.context.closePath()
        }
      } catch (e) {
        console.error('Error drawing shape:', e)
      }
      this.context.stroke()
      this.context.restore()
    })
  }

  draw_blocks(blocks: Block[]) {
    const lightPosition = this.mouse_position
    blocks.forEach((block) => {
      const position = block.body.translation()
      const screenPosition = {
        x: position.x * this.scale + this.width / 2,
        y: this.height - (position.y * this.scale + this.height / 2),
      }
      block.draw(this.context, screenPosition, lightPosition)
    })
  }
}

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

export type BlockOptions = {
  world: RAPIER.World
  position?: Position
  radius?: number
  rotation?: number
  shape?: ShapeType
}

export function blockFactory(options: BlockOptions): Block {
  const body = options.world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(
      options.position.x,
      options.position.y
    )
  )
  switch (options.shape) {
    case ShapeType.Circle:
      return new CircleBlock(body, options.radius || 1)
    case ShapeType.Square:
      return new SquareBlock(body, options.radius || 1)
    case ShapeType.Triangle:
      return new TriangleBlock(body, options.radius || 1)
    default:
      return new CircleBlock(body, options.radius || 1)
  }
}

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
      const dotProduct =
        Math.cos(lightAngle) * rotatedNormal.x +
        Math.sin(lightAngle) * rotatedNormal.y

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
      const dotProduct =
        Math.cos(lightAngle) * rotatedNormal.x +
        Math.sin(lightAngle) * rotatedNormal.y

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
      const dotProduct =
        Math.cos(light_direction) * rotatedNormal.x +
        Math.sin(light_direction) * rotatedNormal.y

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
