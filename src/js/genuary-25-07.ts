import { Chart } from './chart'
import * as THREE from 'three'
import RAPIER from '@dimforge/rapier3d'

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

    // Apply materials
    materials.preload()
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material =
          materials.materials[Object.keys(materials.materials)[0]]
      }
    })


    // Enable shadow casting/receiving in Paperclip class
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    // // Make ground receive shadows
    // groundMesh.receiveShadow = true

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

    // Add debug hitbox visualization
    this.addHitboxMesh()
  }

  private addHitboxMesh(): void {
    const hitboxGeometry = new THREE.BoxGeometry(
      this.hitbox.x * 2,
      this.hitbox.y * 2,
      this.hitbox.z * 2
    )
    const hitboxMaterial = new THREE.MeshBasicMaterial({
      color: 'red',
      wireframe: true,
    })
    const hitboxMesh = new THREE.Mesh(hitboxGeometry, hitboxMaterial)
    this.mesh.add(hitboxMesh)
  }

  update(): void {
    const position = this.rigidBody.translation()
    const rotation = this.rigidBody.rotation()
    this.mesh.position.set(position.x, position.y, position.z)
    this.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w)
  }
}

new Chart({
  nav: false,
  renderer: 'three.js',
})
  .clear_canvas()
  .asyncScratchpad(async (chart: Chart) => {
    const width = chart.width,
      height = chart.height
    const renderer = chart.three_renderer
    renderer.setAnimationLoop(animate)

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10)
    // const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10)

    camera.position.z = 1

    const scene = new THREE.Scene()


    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    const pointLight = new THREE.PointLight(0xffffff, 1, 100)
    pointLight.position.set(0, 2, 2)
    scene.add(pointLight)

    // Enable shadow rendering
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap




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
    const maxBlocks = 100000
    const interval = setInterval((i) => {
      console.log("Spawning paperclip", i)
      spawnPaperclip()
      // blocks.push(spawnBlock())
      if (blocks.length > maxBlocks) {
        clearInterval(interval)
      }
    }, 10)
    const loader = PaperclipLoader.getInstance()
    await loader.loadAssets()

    function spawnPaperclip() {
      const paperclip = loader.createPaperclip(world)
      if (paperclip) {
        scene.add(paperclip.mesh)
        blocks.push(paperclip)
      }
    }

    // function animate(time) {
    //   world.step()
    //   blocks.forEach((block) => block.update())
    //   // ...existing camera and render code...
    // }

    // function spawnPaperclip() {
    //   // console.log('Spawning paperclip')
    //   const object = paperclip.clone()
    //   // /models/Paperclip/Paperclip.obj
    //   // /models/Paperclip/Paperclip.mtl
    //   paperclipMaterial.preload()
    //   object.traverse((child) => {
    //     if (child instanceof THREE.Mesh) {
    //       child.material = paperclipMaterial
    //     }
    //   })
    //   object.scale.set(0.001, 0.001, 0.001)
    //   object.position.x = Math.random() * 2 - 1
    //   object.position.y = Math.random() * 2 - 1
    //   object.position.z = Math.random() * 2 - 1

    //   scene.add(object)
    //   // scene.add()
    //   // draw hitbox
    //   const hitbox = new THREE.BoxGeometry(0.242, 0.066, 0.006)
    //   const hitboxMaterial = new THREE.MeshBasicMaterial({
    //     color: 'red',
    //     // color: 0x00ff00,
    //     // transparent: true,
    //     // opacity: 0.5,
    //   })
    //   const hitboxMesh = new THREE.Mesh(hitbox, hitboxMaterial)
    //   // Draw the hitbox in bright red
    //   hitboxMesh.position.x = object.position.x
    //   hitboxMesh.position.y = object.position.y
    //   hitboxMesh.position.z = object.position.z
    //   scene.add(hitboxMesh)

    //   object.add(hitboxMesh)

    //   const rotation = new THREE.Quaternion().setFromEuler(
    //     new THREE.Euler(
    //       Math.random() * Math.PI,
    //       Math.random() * Math.PI,
    //       Math.random() * Math.PI
    //     )
    //   )

    //   const rigidBody = world.createRigidBody(
    //     RAPIER.RigidBodyDesc.newDynamic()
    //       .setTranslation(
    //         object.position.x,
    //         object.position.y,
    //         object.position.z
    //       )
    //       .setRotation(rotation)
    //   )

    //   world.createCollider(RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1), rigidBody)
    //   blocks.push({
    //     mesh: object,
    //     rigidBody,
    //   })
    // }

    // function spawnBlock() {
    //   const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2)
    //   const material = new THREE.MeshNormalMaterial()

    //   const rotation = new THREE.Quaternion().setFromEuler(
    //     new THREE.Euler(
    //       Math.random() * Math.PI,
    //       Math.random() * Math.PI,
    //       Math.random() * Math.PI
    //     )
    //   )

    //   const mesh = new THREE.Mesh(geometry, material)
    //   mesh.position.x = Math.random() * 2 - 1
    //   mesh.position.y = Math.random() * 2 - 1
    //   mesh.position.z = Math.random() * 2 - 1
    //   mesh.quaternion.copy(rotation)

    //   const rigidBody = world.createRigidBody(
    //     // RAPIER.RigidBodyDesc.newDynamic().setTranslation(mesh.position.x, mesh.position.y, mesh.position.z)
    //     RAPIER.RigidBodyDesc.newDynamic()
    //       .setTranslation(mesh.position.x, mesh.position.y, mesh.position.z)
    //       .setRotation(rotation)
    //   )
    //   world.createCollider(RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1), rigidBody)

    //   scene.add(mesh)
    //   return {
    //     mesh,
    //     rigidBody,
    //   }
    // }

    function animate(time) {
      // mesh.rotation.x = time / 2000
      // mesh.rotation.y = time / 1000

        // blocks.forEach((block) => block.update())

      world.step()
      blocks.forEach((block) => {
        block.update()

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
      // camera.position.z += 0.005
      // // max distance camera can zoom out
      // if (camera.position.z > 4) {
      //   camera.position.z = 2
      // }

      // Orbit camera around origin
      camera.position.x = 2 * Math.sin(time / 1000)
      camera.position.z = 2 * Math.cos(time / 1000)
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
  })
