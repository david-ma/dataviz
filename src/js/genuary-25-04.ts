import { Chart, d3 } from './chart'
import RAPIER from '@dimforge/rapier2d'

function initWebGL(chart: Chart) {
  // const gl = chart.canvas.node().getContext('webgl2')
  const gl = chart.context
  if (!gl) throw new Error('WebGL not supported')

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

  const vertexCode = `#version 300 es
    in vec2 position;
    uniform vec2 translate;
    uniform float scale;
    out vec2 vUv;
    
    void main() {
      vUv = position + 0.5; // Convert [-0.5,0.5] to [0,1]
      vec2 pos = (position * scale + translate);
      gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
    }
  `
  const fragmentCode = `#version 300 es
    precision mediump float;
    uniform vec3 lightDir;
    in vec2 vUv;
    out vec4 fragColor;
    
    void main() {
      // Edge detection using UV coordinates
      vec2 uv = vUv;
      float distFromEdge = min(
        min(uv.x, 1.0 - uv.x),
        min(uv.y, 1.0 - uv.y)
      );
      
      // Sharper edge falloff
      float isEdge = 1.0 - smoothstep(0.0, 0.1, distFromEdge);
      
      // Light calculation
      vec3 normal = normalize(vec3(0.0, 0.0, 1.0));
      vec3 light = normalize(lightDir);
      float diffuse = max(dot(normal, light), 0.0);
      
      // Grey base (0.2) with white edge highlight
      float baseColor = 0.2;
      float highlight = isEdge * diffuse * 0.5;
      fragColor = vec4(vec3(baseColor + highlight), 1.0);
    }
  `

  gl.shaderSource(vertexShader, vertexCode)
  gl.shaderSource(fragmentShader, fragmentCode)
  gl.compileShader(vertexShader)
  gl.compileShader(fragmentShader)

  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.useProgram(program)

  // Square vertices
  const vertices = new Float32Array([
    -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
  ])

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

  const positionLocation = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(positionLocation)
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

  return {
    gl,
    program,
    uniforms: {
      translate: gl.getUniformLocation(program, 'translate'),
      scale: gl.getUniformLocation(program, 'scale'),
      lightDir: gl.getUniformLocation(program, 'lightDir'),
    },
  }
}

async function initWebGPU(chart: Chart) {
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

  const shader = `
  struct Material {
    baseColor: vec3f,
    shininess: f32,
    ambient: f32,
    specular: f32,
    padding: vec2f,
  }

  struct Uniforms {
    translate: vec2f,
    scale: f32,
    padding: f32,
  }
  
  struct Light {
    position: vec3f,  // Point light position
    intensity: f32,   // Light strength
  }
  
  @group(0) @binding(0) var<uniform> uniforms: Uniforms;
  @group(0) @binding(1) var<uniform> light: Light;
  @group(0) @binding(2) var<uniform> material: Material;

  struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
  }

  @vertex
  fn vertexMain(@location(0) pos: vec2f) -> VertexOutput {
    var output: VertexOutput;
    output.uv = pos + 0.5;
    let scaledPos = pos * uniforms.scale + uniforms.translate;
    output.position = vec4f(scaledPos * 2.0 - 1.0, 0.0, 1.0);
    return output;
  }

  @fragment
  fn fragmentMain(@location(0) uv: vec2f) -> @location(0) vec4f {
    let distFromEdge = min(
      min(uv.x, 1.0 - uv.x),
      min(uv.y, 1.0 - uv.y)
    );
    
    // Calculate fragment position in world space
    let fragPos = vec3f((uv - 0.5) * 2.0, 0.0);
    
    // Vector from fragment to light
    
    let isEdge = 1.0 - smoothstep(0.0, 0.1, distFromEdge);
    let normal = normalize(vec3f(0.0, 0.0, 1.0));

    let lightDir = normalize(light.position - fragPos);
    let viewDir = normalize(vec3f(0.0, 0.0, 1.0) - fragPos);
    let reflectDir = reflect(-lightDir, normal);
    
    // Ambient
    let ambient = material.ambient * material.baseColor;
    
    // Diffuse
    let diff = max(dot(normal, lightDir), 0.0);
    let diffuse = diff * material.baseColor;
    
    // Specular
    let spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    let specular = material.specular * spec * vec3f(1.0);
    



    // Distance attenuation
    let dist = length(light.position - fragPos);
    let attenuation = 1.0 / (1.0 + 0.1 * dist * dist);
    
    // let diffuse = max(dot(normal, lightDir), 0.0) * attenuation * light.intensity;
    
    let baseColor = 0.2;
    let highlight = isEdge * diffuse * 0.5;
    // return vec4f(vec3f(baseColor + highlight), 1.0);

    let result = ambient + diffuse + specular;
    return vec4f(result * isEdge, 1.0);    


  }`

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({ code: shader }),
      entryPoint: 'vertexMain',
      buffers: [
        {
          arrayStride: 8,
          attributes: [
            {
              format: 'float32x2',
              offset: 0,
              shaderLocation: 0,
            },
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

  return { device, context, pipeline, format }
}

new Chart({
  element: 'datavizChart',
  nav: false,
  renderer: 'webgpu',
})
  .clear_canvas()
  .asyncScratchpad(async (chart) => {
    const { device, context, pipeline } = await initWebGPU(chart)

    // Create vertex buffer
    const vertices = new Float32Array([
      -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5,
    ])
    const vertexBuffer = device.createBuffer({
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(vertexBuffer.getMappedRange()).set(vertices)
    vertexBuffer.unmap()

    // Create uniform buffer
    const uniformBuffer = device.createBuffer({
      size: 16, // vec2 translate + float scale + padding
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const lightBuffer = device.createBuffer({
      size: 16, // vec3 lightDir
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const materialBuffer = device.createBuffer({
      size: 32, // vec3 + float + float + float + vec2 padding
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: uniformBuffer } },
        { binding: 1, resource: { buffer: lightBuffer } },
        { binding: 2, resource: { buffer: materialBuffer } },
      ],
    })

    // Physics setup
    const scale = 50
    const blocks = []
    const gravity = new RAPIER.Vector2(0.0, 9.81)
    const world = new RAPIER.World(gravity)

    const groundCollider = RAPIER.ColliderDesc.cuboid(
      chart.width / scale / 2,
      0.1
    )
    world.createCollider(groundCollider).setTranslation({
      x: 0,
      y: chart.height / scale / 2,
    })

    function spawnBlock() {
      const randX = (Math.random() - 0.5) * (chart.width / scale)
      const rigidBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(
          randX,
          -chart.height / scale / 2
        )
      )
      world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5), rigidBody)
      blocks.push(rigidBody)
    }

    function render() {
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
      renderPass.setVertexBuffer(0, vertexBuffer)

      // Update light direction
      device.queue.writeBuffer(
        lightBuffer,
        0,
        new Float32Array([
          1.0, // x: right side
          1.0, // y: top
          -0.5, // z: slightly in front
          2.0, // intensity
        ])
      )

      blocks.forEach((block) => {
        const pos = block.translation()
        const uniforms = new Float32Array([
          (pos.x * scale) / chart.width + 0.5,
          1.0 - ((pos.y * scale) / chart.height + 0.5),
          50 / chart.width,
          0, // padding
        ])
        device.queue.writeBuffer(uniformBuffer, 0, uniforms)

        renderPass.setBindGroup(0, bindGroup)
        renderPass.draw(6, 1, 0, 0)
      })

      renderPass.end()
      device.queue.submit([commandEncoder.finish()])
      requestAnimationFrame(render)
    }

    setInterval(spawnBlock, 1000)
    requestAnimationFrame(render)
  })
