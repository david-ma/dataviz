import { Chart, d3 } from './chart'
import RAPIER from '@dimforge/rapier2d'

function initWebGL(chart: Chart) {
  // const gl = chart.canvas.node().getContext('webgl2')
  const gl = chart.context
  if (!gl) throw new Error('WebGL not supported')

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)

  const vertexCode = `
    attribute vec2 position;
    uniform vec2 translate;
    uniform float scale;
    void main() {
      vec2 pos = (position * scale + translate);
      gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
    }
  `

  const fragmentCode = `
    precision mediump float;
    uniform vec3 lightDir;
    void main() {
      vec3 normal = normalize(vec3(0.5, 0.5, 1.0));
      float diffuse = max(dot(normal, lightDir), 0.0);
      gl_FragColor = vec4(0.1 + 0.2 * diffuse);
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

new Chart({
  element: 'datavizChart',
  nav: false,
  renderer: 'canvas-webgl2',
})
  .clear_canvas()
  .scratchpad((chart) => {
    const webgl = initWebGL(chart)
    const { gl, program, uniforms } = webgl

    const scale = 50
    const blocks = []
    const gravity = new RAPIER.Vector2(0.0, -9.81)
    const world = new RAPIER.World(gravity)

    // Create ground
    const groundCollider = RAPIER.ColliderDesc.cuboid(
      chart.width / scale / 2,
      0.1
    )
    world
      .createCollider(groundCollider)
      .setTranslation({
        x: 0,
        y: -chart.height / scale / 2,
      })

    function spawnBlock() {
      const randX = (Math.random() - 0.5) * (chart.width / scale)
      const rigidBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(
          randX,
          chart.height / scale / 2
        )
      )
      world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5), rigidBody)
      blocks.push(rigidBody)
    }

    function render() {
      gl.clearColor(0.05, 0.05, 0.05, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)

      world.step()

      gl.useProgram(program)
      gl.uniform3f(uniforms.lightDir, 1.0, 1.0, -1.0)

      blocks.forEach((block) => {
        const pos = block.translation()
        gl.uniform2f(
          uniforms.translate,
          (pos.x * scale) / chart.width + 0.5,
          1.0 - ((pos.y * scale) / chart.height + 0.5)
        )
        gl.uniform1f(uniforms.scale, 50 / chart.width)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      })

      requestAnimationFrame(render)
    }

    setInterval(spawnBlock, 1000)
    requestAnimationFrame(render)
  })
