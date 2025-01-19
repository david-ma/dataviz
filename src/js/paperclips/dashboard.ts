import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d-compat'
import { Chart, d3 } from '../chart'

// OBJLoader is not a part of the main three.js library, so we need to import it separately
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'

export class PaperclipLoader {
  private static instance: PaperclipLoader
  private objModel: THREE.Group | null = null
  private materials: MTLLoader.MaterialCreator | null = null
  private readonly modelScale = 0.001

  private constructor() {}

  static getInstance(): PaperclipLoader {
    if (!PaperclipLoader.instance) {
      PaperclipLoader.instance = new PaperclipLoader()
    }
    return PaperclipLoader.instance
  }

  async loadAssets(): Promise<void> {
    const [obj, mtl] = await Promise.all([
      this.loadOBJ('/models/Paperclip/Paperclip.obj'),
      this.loadMTL('/models/Paperclip/Paperclip.mtl'),
    ])
    this.objModel = obj
    this.materials = mtl
  }

  private loadOBJ(path: string): Promise<THREE.Group> {
    return new Promise((resolve, reject) => {
      new OBJLoader().load(path, resolve, undefined, reject)
    })
  }

  private loadMTL(path: string): Promise<MTLLoader.MaterialCreator> {
    return new Promise((resolve, reject) => {
      new MTLLoader().load(path, resolve, undefined, reject)
    })
  }

  createPaperclip(world: RAPIER.World): Paperclip | null {
    if (!this.objModel || !this.materials) return null
    return new Paperclip(this.objModel, this.materials, this.modelScale, world)
  }
}

export class Paperclip {
  public mesh: THREE.Group
  public rigidBody: RAPIER.RigidBody
  private readonly hitbox = { x: 0.242, y: 0.066, z: 0.006 }

  constructor(
    model: THREE.Group,
    materials: MTLLoader.MaterialCreator,
    scale: number,
    world: RAPIER.World
  ) {
    // Create visual mesh
    this.mesh = model.clone()
    this.mesh.scale.setScalar(scale)

    // Random position and rotation
    this.mesh.position.set(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    )
    const rotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
    )
    this.mesh.quaternion.copy(rotation)

    // Apply materials and shadows
    materials.preload()
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material =
          materials.materials[Object.keys(materials.materials)[0]]
        child.material.metalness = 0.8
        child.material.roughness = 0.2
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    // Create physics body
    this.rigidBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.newDynamic()
        .setTranslation(
          this.mesh.position.x,
          this.mesh.position.y,
          this.mesh.position.z
        )
        .setRotation(rotation)
    )

    // Create collider
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(this.hitbox.x, this.hitbox.y, this.hitbox.z),
      this.rigidBody
    )
  }

  update(): void {
    const position = this.rigidBody.translation()
    const rotation = this.rigidBody.rotation()
    this.mesh.position.set(position.x, position.y, position.z)
    this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
  }
}

export class Block {
  public mesh: THREE.Mesh
  public rigidBody: RAPIER.RigidBody
  private readonly size = { x: 0.2, y: 0.2, z: 0.2 }

  constructor(world: RAPIER.World) {
    // Create visual mesh
    const geometry = new THREE.BoxGeometry(
      this.size.x * 2,
      this.size.y * 2,
      this.size.z * 2
    )
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.5,
      roughness: 0.5,
    })
    this.mesh = new THREE.Mesh(geometry, material)

    // Random position and rotation
    this.mesh.position.set(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    )
    const rotation = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
    )
    this.mesh.quaternion.copy(rotation)

    // Enable shadows
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

    // Create physics body
    this.rigidBody = world.createRigidBody(
      RAPIER.RigidBodyDesc.newDynamic()
        .setTranslation(
          this.mesh.position.x,
          this.mesh.position.y,
          this.mesh.position.z
        )
        .setRotation(rotation)
    )

    // Create collider
    world.createCollider(
      RAPIER.ColliderDesc.cuboid(this.size.x, this.size.y, this.size.z),
      this.rigidBody
    )
  }

  update(): void {
    const position = this.rigidBody.translation()
    const rotation = this.rigidBody.rotation()
    this.mesh.position.set(position.x, position.y, position.z)
    this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
  }
}

export class Dashboard {
  private chart: Chart
  private world: RAPIER.World
  private loader: PaperclipLoader

  constructor() {
    console.log('Dashboard constructor')
    // this.chart = new Chart({
    //   nav: false,
    //   renderer: 'three.js',
    // })
  }

  async init() {
    console.log('Dashboard init')
    // Initialize RAPIER WASM
    await RAPIER.init()

    const chart = new Chart({
      nav: false,
      renderer: 'three.js',
    })
      .clear_canvas()
      // this.chart
      .asyncScratchpad(async (chart: Chart) => {
        const width = chart.width,
          height = chart.height
        const renderer = chart.three_renderer

        const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
        // const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10)

        camera.position.z = 1

        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x222222)

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5)
        directionalLight.position.set(5, 5, 5)
        directionalLight.castShadow = true
        directionalLight.shadow.mapSize.width = 2048
        directionalLight.shadow.mapSize.height = 2048
        scene.add(directionalLight)

        const pointLight = new THREE.PointLight(0xffffff, 1, 100)
        pointLight.position.set(0, 2, 2)
        pointLight.castShadow = true
        scene.add(pointLight)

        // Enable shadow rendering
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFSoftShadowMap

        let world = new RAPIER.World(new RAPIER.Vector3(0.0, -9.81, 0.0))
        let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1, 10.0)
        world
          .createCollider(groundColliderDesc)
          .setTranslation({ x: 0, y: -1.0, z: 0 })

        const paperclips = []
        const blocks = []
        const maxPaperclips = 100

        d3.select('#btnMakePaperclip').on('click', () => {
          console.log('Spawning paperclip')
          spawnPaperclip()
        })

        // const interval = setInterval((i) => {
        //   console.log('Spawning paperclip', i)
        //   spawnPaperclip()

        //   if (paperclips.length > maxPaperclips) {
        //     // Safe cleanup of paperclips
        //     const clipsToRemove = [...paperclips]
        //     paperclips.length = 0 // Clear array first

        //     clipsToRemove.forEach((paperclip) => {
        //       scene.remove(paperclip.mesh)
        //       world.removeRigidBody(paperclip.rigidBody)
        //     })

        //     // Spawn new block after cleanup
        //     blocks.push(spawnBlock())
        //   }
        // }, 10)

        const loader = PaperclipLoader.getInstance()
        await loader.loadAssets()

        globalThis.spawnPaperclip = spawnPaperclip

        function spawnPaperclip() {
          const paperclip = loader.createPaperclip(world)
          if (paperclip) {
            scene.add(paperclip.mesh)
            paperclips.push(paperclip)
          }
        }

        function spawnBlock() {
          const block = new Block(world)
          scene.add(block.mesh)
          return block
        }

        renderer.setAnimationLoop(animate)
        function animate(time) {
          world.step()

          // Safe update of remaining objects
          const currentPaperclips = [...paperclips]
          currentPaperclips.forEach((paperclip) => {
            paperclip.update()
          })

          const currentBlocks = [...blocks]
          currentBlocks.forEach((block) => {
            block.update()
          })

          // Orbit camera around origin
          const speed = 0.7
          camera.position.x = 2 * Math.sin((time * speed) / 1000)
          camera.position.z = 2 * Math.cos((time * speed) / 1000)
          camera.lookAt(0, 0, 0)

          renderer.render(scene, camera)
        }
      })
  }
}

// Usage
const dashboard = new Dashboard()
dashboard.init().catch(console.error)
// dashboard
