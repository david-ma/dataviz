import RAPIER from '@dimforge/rapier2d-compat'
import { Chart, d3 } from './chart'

await RAPIER.init()
export class RapierChart extends Chart {
  private static readonly PHYSICS_SCALE = 50
  private static readonly WALL_THICKNESS = 0.1

  world: RAPIER.World
  scale: number
  colliders: RAPIER.Collider[] = []

  constructor(options) {
    options.renderer = 'canvas'
    super(options)
    if (!this.context) throw new Error('Canvas context required')

    this.scale = RapierChart.PHYSICS_SCALE
    if (options.gravity) {
      this.initPhysicsWorld(options.gravity)
    } else {
      this.world = new RAPIER.World(new RAPIER.Vector2(0, 0))
    }
  }

  private initPhysicsWorld(gravity) {
    this.world = new RAPIER.World(new RAPIER.Vector2(gravity.x, gravity.y))
    this.createBoundaries()
  }

  private createBoundaries() {
    const groundCollider = RAPIER.ColliderDesc.cuboid(
      this.width / this.scale / 2,
      RapierChart.WALL_THICKNESS,
    )
    const wallCollider = RAPIER.ColliderDesc.cuboid(
      RapierChart.WALL_THICKNESS,
      this.height / this.scale / 2,
    )

    // Create and position boundaries
    this.colliders = [
      this.world.createCollider(groundCollider),
      this.world.createCollider(wallCollider),
      this.world.createCollider(wallCollider),
    ]

    // Position colliders
    this.positionBoundaries()
  }

  private positionBoundaries() {
    const positions = [
      { x: 0, y: -this.height / this.scale / 2 }, // ground
      { x: -this.width / this.scale / 2, y: 0 }, // left wall
      { x: this.width / this.scale / 2, y: 0 }, // right wall
    ]

    this.colliders.forEach((collider, i) =>
      collider.setTranslation(positions[i]),
    )
  }

  dispose() {
    this.world.free()
    this.colliders = []
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

      // Transform context
      this.context.translate(
        position.x * this.scale + this.width / 2,
        this.height - (position.y * this.scale + this.height / 2),
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
            half_height * 2,
          )
        } else if (shape instanceof RAPIER.ConvexPolygon) {
          const vertices = shape.vertices
          if (vertices.length % 2 !== 0) {
            console.error('Invalid vertex count', shape)
            throw new Error('Invalid vertex count')
          }
          if (vertices.length > 0) {
            this.context.moveTo(
              vertices[0] * this.scale,
              vertices[1] * this.scale,
            )
            for (let i = 2; i < vertices.length; i += 2) {
              this.context.lineTo(
                vertices[i] * this.scale,
                vertices[i + 1] * this.scale,
              )
            }
            this.context.closePath()
          }
        } else {
          console.warn('Unknown shape type:', shape)
        }

        // Fill and stroke the path
        this.context.fill()
        this.context.stroke()
      } catch (e) {
        console.error('Error drawing shape:', e)
      }

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
  colour?: string
}

export function blockFactory(options: BlockOptions): Block {
  const position = options.position || { x: 0, y: 0 },
    rotation = options.rotation || 0,
    shape = options.shape || ShapeType.Circle,
    radius = options.radius || 1,
    colour = options.colour || 'black'

  const body = options.world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(position.x, position.y)
      .setRotation(rotation),
  )
  switch (shape) {
    case ShapeType.Circle:
      return new CircleBlock(body, ShapeType.Circle, radius, colour)
    case ShapeType.Square:
      return new SquareBlock(body, ShapeType.Square, radius, colour)
    case ShapeType.Triangle:
      return new TriangleBlock(body, ShapeType.Triangle, radius, colour)
    default:
      return new CircleBlock(body, ShapeType.Circle, radius, colour)
  }
}

type Line = { start: Position; end: Position }

interface ShapeDefinition {
  vertices: [number, number][]
  edges: {
    start: [number, number]
    end: [number, number]
    normal: [number, number]
  }[]
}

export abstract class Block {
  body: RAPIER.RigidBody
  shape: ShapeType
  radius: number
  physicsRadius: number
  colour: string
  vertices: ShapeDefinition

  constructor(
    body: RAPIER.RigidBody,
    shape: ShapeType,
    radius: number,
    colour?: string,
  ) {
    this.body = body
    this.shape = shape
    this.radius = radius
    this.colour = colour || 'black'
    const scale = 50

    // Scale physics colliders to match visual size
    this.physicsRadius = this.radius / scale
  }

  physicsVertices(): Float32Array {
    const vertices = this.vertices ? this.vertices.vertices : []
    return new Float32Array(vertices.flat().map((v) => v * this.physicsRadius))
  }

  initPhysics(world: RAPIER.World) {
    world.createCollider(
      RAPIER.ColliderDesc.convexHull(this.physicsVertices()),
      this.body,
    )
  }

  draw(
    ctx: CanvasRenderingContext2D,
    position: Position,
    lightPoint: Position,
  ) {
    const angle = this.body.rotation()

    // Get shape-specific vertices and edges
    const { vertices, edges } = this.vertices

    // Draw filled shape
    ctx.beginPath()
    const firstVertex = {
      x:
        position.x +
        (vertices[0][0] * Math.cos(angle) - vertices[0][1] * Math.sin(angle)) *
          this.radius,
      y:
        position.y +
        (vertices[0][0] * Math.sin(angle) + vertices[0][1] * Math.cos(angle)) *
          this.radius,
    }

    ctx.moveTo(firstVertex.x, firstVertex.y)

    for (let i = 1; i < vertices.length; i++) {
      const transformedVertex = {
        x:
          position.x +
          (vertices[i][0] * Math.cos(angle) -
            vertices[i][1] * Math.sin(angle)) *
            this.radius,
        y:
          position.y +
          (vertices[i][0] * Math.sin(angle) +
            vertices[i][1] * Math.cos(angle)) *
            this.radius,
      }
      ctx.lineTo(transformedVertex.x, transformedVertex.y)
    }

    ctx.closePath()
    ctx.fillStyle = 'black'
    ctx.fill()

    // Draw edges with highlights
    edges.forEach((edge) => {
      const rotatedEdge = {
        start: {
          x: edge.start[0] * Math.cos(angle) - edge.start[1] * Math.sin(angle),
          y: edge.start[0] * Math.sin(angle) + edge.start[1] * Math.cos(angle),
        },
        end: {
          x: edge.end[0] * Math.cos(angle) - edge.end[1] * Math.sin(angle),
          y: edge.end[0] * Math.sin(angle) + edge.end[1] * Math.cos(angle),
        },
      }

      const scaledEdge = {
        start: {
          x: rotatedEdge.start.x * this.radius,
          y: rotatedEdge.start.y * this.radius,
        },
        end: {
          x: rotatedEdge.end.x * this.radius,
          y: rotatedEdge.end.y * this.radius,
        },
      }

      const translatedEdge = {
        start: {
          x: position.x + scaledEdge.start.x,
          y: position.y + scaledEdge.start.y,
        },
        end: {
          x: position.x + scaledEdge.end.x,
          y: position.y + scaledEdge.end.y,
        },
      }

      this.drawHighlightedLine(ctx, translatedEdge, lightPoint)
    })
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

  drawHighlightedLine(
    ctx: CanvasRenderingContext2D,
    line: Line,
    lightPoint: Position,
  ) {
    ctx.save()
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.moveTo(line.start.x, line.start.y)
    ctx.lineTo(line.end.x, line.end.y)
    ctx.strokeStyle = 'white'

    if (
      Math.sign(
        (line.end.x - line.start.x) * (lightPoint.y - line.start.y) -
          (line.end.y - line.start.y) * (lightPoint.x - line.start.x),
      ) === 1
    ) {
      ctx.strokeStyle = '#333'
    }
    ctx.stroke()
    ctx.restore()
  }
}

export class TriangleBlock extends Block {
  vertices: ShapeDefinition = {
    vertices: [
      [0, -1],
      [0.866, 0.5],
      [-0.866, 0.5],
    ],
    edges: [
      { start: [0, -1], end: [0.866, 0.5], normal: [0.866, -0.5] },
      { start: [0.866, 0.5], end: [-0.866, 0.5], normal: [0, 1] },
      { start: [-0.866, 0.5], end: [0, -1], normal: [-0.866, -0.5] },
    ],
  }
}

export class SquareBlock extends Block {
  vertices: ShapeDefinition = {
    vertices: [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ],
    edges: [
      { start: [-1, -1], end: [1, -1], normal: [0, -1] },
      { start: [1, -1], end: [1, 1], normal: [1, 0] },
      { start: [1, 1], end: [-1, 1], normal: [0, 1] },
      { start: [-1, 1], end: [-1, -1], normal: [-1, 0] },
    ],
  }
}

export class CircleBlock extends Block {
  initPhysics(world: RAPIER.World) {
    world.createCollider(
      RAPIER.ColliderDesc.ball(this.physicsRadius),
      this.body,
    )
  }

  draw(
    ctx: CanvasRenderingContext2D,
    position: Position,
    lightPoint: Position,
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
      lightAngle + Math.PI / 2,
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
      lightAngle + (3 * Math.PI) / 2,
    )
    ctx.stroke()

    ctx.restore()
  }
}
