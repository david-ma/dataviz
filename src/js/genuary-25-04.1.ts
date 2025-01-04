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
  color: [number, number, number]
}

const shader = `
struct Uniforms {
  transform: mat4x4f,
  lightDir: vec2f,
  color: vec3f,
  padding: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) worldPos: vec2f,
  @location(1) normal: vec2f,
}

@vertex
fn vertexMain(
  @location(0) position: vec2f,
  @location(1) normal: vec2f
) -> VertexOutput {
  var output: VertexOutput;
  output.position = uniforms.transform * vec4f(position, 0.0, 1.0);
  output.worldPos = position;
  output.normal = normal;
  return output;
}

@fragment
fn fragmentMain(
  @location(0) worldPos: vec2f,
  @location(1) normal: vec2f
) -> @location(0) vec4f {
  let n = normalize(normal);
  let l = normalize(uniforms.lightDir);
  let d = dot(n, l);
  
  // Edge detection
  let isEdge = length(normal) > 0.5;
  
  // Light calculation
  let lightColor = select(vec3f(0.2), vec3f(1.0), d < 0.0);
  let finalColor = select(uniforms.color, lightColor, isEdge);
  
  return vec4f(finalColor, 1.0);
}`

new Chart({
  element: 'datavizChart',
  nav: false,
  renderer: 'webgpu',
}).clear_canvas()
.asyncScratchpad(async (chart) => {
  if (!navigator.gpu) throw new Error('WebGPU not supported')

  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw new Error('No GPU adapter found')

  const device = await adapter.requestDevice()
  const context = chart.canvas.node().getContext('webgpu')
  const format = navigator.gpu.getPreferredCanvasFormat()

  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  })

  // Create pipeline
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({ code: shader }),
      entryPoint: 'vertexMain',
      buffers: [
        {
          arrayStride: 16, // vec2 position + vec2 normal
          attributes: [
            { format: 'float32x2', offset: 0, shaderLocation: 0 }, // position
            { format: 'float32x2', offset: 8, shaderLocation: 1 }, // normal
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({ code: shader }),
      entryPoint: 'fragmentMain',
      targets: [{ format }],
    },
  })

  // Create uniform buffer
  const uniformBuffer = device.createBuffer({
    // size: 64, // mat4 + vec2 + vec3 + padding
    size: 96, // 64 (mat4) + 8 (vec2) + 12 (vec3) + 12 (padding)
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })

  // Create bind group
  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  })

  // Create geometry
  const createCircle = (segments = 32) => {
    const vertices = []
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = Math.cos(angle)
      const y = Math.sin(angle)
      vertices.push(x, y, x, y) // position + normal
    }
    return new Float32Array(vertices)
  }

  const circleVertices = createCircle()
  const squareVertices = new Float32Array([
    -1,
    -1,
    0,
    -1, // top-left
    1,
    -1,
    0,
    -1, // top-right
    1,
    1,
    1,
    0, // bottom-right
    -1,
    1,
    0,
    1, // bottom-left
  ])

  const triangleVertices = new Float32Array([
    0,
    -1,
    0,
    -1, // top
    0.8,
    0.6,
    1,
    0, // right
    -0.8,
    0.6,
    -1,
    0, // left
  ])

  // Create vertex buffers
  const createVertexBuffer = (data: Float32Array) => {
    const buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.VERTEX,
      mappedAtCreation: true,
    })
    new Float32Array(buffer.getMappedRange()).set(data)
    buffer.unmap()
    return buffer
  }

  const vertexBuffers = {
    [ShapeType.Circle]: createVertexBuffer(circleVertices),
    [ShapeType.Square]: createVertexBuffer(squareVertices),
    [ShapeType.Triangle]: createVertexBuffer(triangleVertices),
  }

  // Physics setup
  const scale = 50
  const blocks: Block[] = []
  const gravity = new RAPIER.Vector2(0.0, -9.81)
  const world = new RAPIER.World(gravity)

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
    console.log("Spawning block")
    // const randX = (Math.random() - 0.5) * (chart.width / scale)
    // const randRadius = 15 + Math.random() * 20
    // const shape = Math.floor(Math.random() * 3)
    const randX = 0
    const randRadius = 25  // Fixed size for testing
    const shape = ShapeType.Square // Fixed shape for testing
    
    const color: [number, number, number] = [
      0.2 + Math.random() * 0.6,  // r
      0.2 + Math.random() * 0.6,  // g
      0.2 + Math.random() * 0.6   // b
    ]

    // const rigidBody = world.createRigidBody(
    //   RAPIER.RigidBodyDesc.dynamic()
    //     .setTranslation(randX, chart.height / scale / 2)
    //     .setRotation(Math.random() * Math.PI * 2)
    // )

    const rigidBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.dynamic()
        .setTranslation(randX, -chart.height/scale/4)  // Quarter height up
        .setRotation(0)  // No rotation for testing
    )

    console.log(`Spawning block at: ${randX}, ${-chart.height/scale/4}`)

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
      world.createCollider(RAPIER.ColliderDesc.convexHull(vertices), rigidBody)
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
      color,
    })
  }

  function render() {
    console.log("Rendering frame")
    world.step()

    const commandEncoder = device.createCommandEncoder()
    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    })

    renderPass.setPipeline(pipeline)

    blocks.forEach((block) => {
      const pos = block.body.translation()
      const angle = block.body.rotation()

      // Update uniforms
      // const transform = new Float32Array(16)
      // transform[0] = Math.cos(angle) * block.radius
      // transform[1] = Math.sin(angle) * block.radius
      // transform[4] = -Math.sin(angle) * block.radius
      // transform[5] = Math.cos(angle) * block.radius
      // transform[12] = pos.x * scale + chart.width / 2
      // transform[13] = chart.height - (pos.y * scale + chart.height / 2)
      // transform[15] = 1

      const transform = new Float32Array(16).fill(0)
      transform[0] = block.radius  // Scale X
      transform[5] = block.radius  // Scale Y
      transform[12] = pos.x * scale + chart.width/2   // Translate X
      transform[13] = pos.y * scale + chart.height/2  // Translate Y
      transform[15] = 1
      

      device.queue.writeBuffer(uniformBuffer, 0, transform)
      device.queue.writeBuffer(uniformBuffer, 64, new Float32Array([1, 1]))
      device.queue.writeBuffer(uniformBuffer, 72, new Float32Array(block.color))

      renderPass.setBindGroup(0, bindGroup)
      renderPass.setVertexBuffer(0, vertexBuffers[block.shape])
      renderPass.draw(
        block.shape === ShapeType.Circle
          ? 32
          : block.shape === ShapeType.Square
          ? 4
          : 3
      )
    })

    renderPass.end()
    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(render)
  }

  setInterval(spawnBlock, 1000)
  requestAnimationFrame(render)
})
