import { Chart, d3 } from './chart'
import RAPIER from '@dimforge/rapier2d-compat'

await RAPIER.init()

new Chart({
  element: 'datavizChart',
  nav: false,
  renderer: 'canvas',
})
  .clear_canvas()
  .scratchpad((chart) => {
    const scale = 50
    const blocks = []
    const gravity = new RAPIER.Vector2(0.0, -9.81)
    let world = new RAPIER.World(gravity)
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(
      chart.width / scale / 2,
      0.1,
    )
    world
      .createCollider(groundColliderDesc)
      .setTranslation({ x: 0, y: -chart.height / scale / 2 })

    function spawnBlock() {
      const randX = (Math.random() - 0.5) * (chart.width / scale)
      const rigidBody = world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic().setTranslation(
          randX,
          chart.height / scale / 2,
        ),
      )
      world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 0.5), rigidBody)
      blocks.push(rigidBody)
    }

    function render() {
      chart.clear_canvas()
      world.step()
      blocks.forEach((block, i) => {
        const position = block.translation()
        const screenX = position.x * scale + chart.width / 2
        const screenY = chart.height - (position.y * scale + chart.height / 2)
        chart.context.fillStyle = d3.schemeCategory10[i % 10]
        chart.context.fillRect(screenX - 25, screenY - 25, 50, 50)
      })
      requestAnimationFrame(render)
    }

    setInterval(spawnBlock, 1000)
    requestAnimationFrame(render)
  })
