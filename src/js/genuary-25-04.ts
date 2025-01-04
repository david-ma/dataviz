import { Chart, d3 } from './chart'
import RAPIER from '@dimforge/rapier2d'

enum ShapeType {
  Circle,
  Square,
  Triangle
}

interface Block {
  body: RAPIER.RigidBody,
  shape: ShapeType,
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
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(chart.width / scale / 2, 0.1)
    world.createCollider(groundColliderDesc).setTranslation({ x: 0, y: -chart.height / scale / 2 })
  
    function spawnBlock() {
      const randX = (Math.random() - 0.5) * (chart.width / scale)
      const randRadius = 15 + Math.random() * 20
      const shape = Math.floor(Math.random() * 3)
      
      const rigidBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(randX, chart.height / scale / 2)
      )
      world.createCollider(RAPIER.ColliderDesc.ball(0.5), rigidBody)
      blocks.push({ 
        body: rigidBody, 
        shape: shape as ShapeType,
        radius: randRadius
      })
    }

    function drawShape(ctx: CanvasRenderingContext2D, x: number, y: number, block: Block) {
      ctx.beginPath()
      ctx.fillStyle = d3.schemeCategory10[blocks.indexOf(block) % 10]

      switch(block.shape) {
        case ShapeType.Circle:
          ctx.arc(x, y, block.radius, 0, Math.PI * 2)
          break
        case ShapeType.Square:
          ctx.rect(x - block.radius, y - block.radius, block.radius * 2, block.radius * 2)
          break
        case ShapeType.Triangle:
          const r = block.radius
          ctx.moveTo(x, y - r)
          ctx.lineTo(x + r * Math.cos(Math.PI * 2/3), y + r * Math.sin(Math.PI * 2/3))
          ctx.lineTo(x + r * Math.cos(Math.PI * 4/3), y + r * Math.sin(Math.PI * 4/3))
          ctx.closePath()
          break
      }
      ctx.fill()
    }
  
    function render() {
      chart.clear_canvas()
      world.step()
      blocks.forEach(block => {
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