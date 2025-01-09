import { Chart } from './chart'
import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d'

new Chart({
  nav: false,
  renderer: 'three.js',
})
  .clear_canvas()
  .scratchpad((chart: Chart) => {
    const width = chart.width,
      height = chart.height
    const renderer = chart.three_renderer
    renderer.setAnimationLoop(animate)

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
    // const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10)

    camera.position.z = 1

    const scene = new THREE.Scene()

    // const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
    // const material = new THREE.MeshNormalMaterial()

    // const mesh = new THREE.Mesh(geometry, material)
    // scene.add(mesh)

    let world = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0))
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0)
    world
      .createCollider(groundColliderDesc)
      .setTranslation({ x: 0, y: -1.0, z: 0 })

    const blocks = []
    const maxBlocks = 1000
    const interval = setInterval(() => {
      blocks.push(spawnBlock())
      if (blocks.length > maxBlocks) {
        clearInterval(interval)
      }
    }, 10)

    function spawnBlock() {
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
      const material = new THREE.MeshNormalMaterial()

      const rotation = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        )
      )

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.x = Math.random() * 2 - 1
      mesh.position.y = Math.random() * 2 - 1
      mesh.position.z = Math.random() * 2 - 1
      mesh.quaternion.copy(rotation)

      const rigidBody = world.createRigidBody(
        // RAPIER.RigidBodyDesc.newDynamic().setTranslation(mesh.position.x, mesh.position.y, mesh.position.z)
        RAPIER.RigidBodyDesc.newDynamic()
          .setTranslation(mesh.position.x, mesh.position.y, mesh.position.z)
          .setRotation(rotation)
      )
      world.createCollider(RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1), rigidBody)

      scene.add(mesh)
      return {
        mesh,
        rigidBody,
      }
    }

    function animate(time) {
      // mesh.rotation.x = time / 2000
      // mesh.rotation.y = time / 1000

      world.step()
      blocks.forEach((block) => {
        const position = block.rigidBody.translation()
        const rotation = block.rigidBody.rotation()
        block.mesh.position.set(position.x, position.y, position.z)
        block.mesh.quaternion.set(
          rotation.x,
          rotation.y,
          rotation.z,
          rotation.w
        )
      })

      // slowly zoom out camera
      camera.position.z += 0.005
      // max distance camera can zoom out
      if (camera.position.z > 4) {
        camera.position.z = 2
      }

      renderer.render(scene, camera)
    }
  })
