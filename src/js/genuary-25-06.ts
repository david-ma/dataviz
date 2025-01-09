import { Chart } from './chart'
import * as THREE from 'three'

new Chart({
  nav: false,
  renderer: 'three.js',
})
  .clear_canvas()
  .scratchpad((chart: Chart) => {
    const width = chart.width,
      height = chart.height

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
    camera.position.z = 1

    const scene = new THREE.Scene()

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
    const material = new THREE.MeshNormalMaterial()

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = chart.three_renderer
    renderer.setAnimationLoop(animate)

    function animate(time) {
      mesh.rotation.x = time / 2000
      mesh.rotation.y = time / 1000

      renderer.render(scene, camera)
    }
  })
