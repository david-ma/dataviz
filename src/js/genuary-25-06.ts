import { Chart, d3 } from './chart'
import * as THREE from 'three'

new Chart({
  element: 'datavizChart',
  nav: false,
  // renderer: 'three.js',
  renderer: 'canvas',
})
  .clear_canvas()
  .scratchpad((chart: Chart) => {
    // const width = window.innerWidth,
    //   height = window.innerHeight
    const width = chart.width,
      height = chart.height

    // init

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
    camera.position.z = 1

    const scene = new THREE.Scene()

    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
    const material = new THREE.MeshNormalMaterial()

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    // renderer.setSize(width, height)
    renderer.setSize(chart.width, chart.height)
    renderer.setAnimationLoop(animate)
    // document.body.appendChild( renderer.domElement );
    // #viz
    document.getElementById('datavizChart').appendChild(renderer.domElement)
    // d3.select("#datavizChart").html(renderer.domElement)

    // animation

    function animate(time) {
      mesh.rotation.x = time / 2000
      mesh.rotation.y = time / 1000

      renderer.render(scene, camera)
    }
  })
