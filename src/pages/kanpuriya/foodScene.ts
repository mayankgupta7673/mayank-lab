import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export interface FoodScene {
  bowl: THREE.Object3D
  fries: THREE.Object3D[]
  momos: THREE.Object3D[]
  garnish: THREE.Object3D[]
  steam: THREE.Sprite[]
  setPointer: (nx: number, ny: number) => void
  startIdle: () => void
  stopIdle: () => void
  dispose: () => void
}

function makeSoftSprite(colorInner: string, colorOuter: string, hard = 0.35): THREE.Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, colorInner)
  grad.addColorStop(hard, colorOuter)
  grad.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

async function loadGeometry(path: string): Promise<THREE.BufferGeometry> {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(path)
  let geometry: THREE.BufferGeometry | null = null
  gltf.scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && !geometry) geometry = obj.geometry
  })
  if (!geometry) throw new Error(`no mesh found in ${path}`)
  ;(geometry as THREE.BufferGeometry).computeVertexNormals()
  return geometry
}

export async function createFoodScene(canvas: HTMLCanvasElement): Promise<FoodScene> {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()

  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.4

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0.5, 1.25, 2.9)
  camera.lookAt(0.02, 0.15, 0)

  const key = new THREE.DirectionalLight('#ffcf9c', 1.5)
  key.position.set(-3, 5, 4)
  scene.add(key)

  const rimLight = new THREE.DirectionalLight('#ffb870', 0.95)
  rimLight.position.set(3, 2, -4)
  scene.add(rimLight)

  const fill = new THREE.HemisphereLight('#5a4632', '#0c0705', 0.4)
  scene.add(fill)

  const shadowTex = makeSoftSprite('rgba(0,0,0,0.5)', 'rgba(0,0,0,0.25)', 0.3)
  const shadowMat = new THREE.SpriteMaterial({ map: shadowTex, transparent: true, depthWrite: false })
  const shadow = new THREE.Sprite(shadowMat)
  shadow.scale.set(2.4, 0.85, 1)
  shadow.position.set(0, -0.32, 0)
  scene.add(shadow)

  const rig = new THREE.Group()
  scene.add(rig)

  const [bowlGeo, fryGeo, momoGeo, leafGeo] = await Promise.all([
    loadGeometry('/models/bowl.glb'),
    loadGeometry('/models/fries.glb'),
    loadGeometry('/models/momo.glb'),
    loadGeometry('/models/leaf.glb'),
  ])

  // --- bowl ---
  const bowlMat = new THREE.MeshPhysicalMaterial({
    color: '#b5601f',
    roughness: 0.35,
    metalness: 0.5,
    clearcoat: 0.45,
    clearcoatRoughness: 0.3,
  })
  const bowl = new THREE.Mesh(bowlGeo, bowlMat)
  bowl.scale.setScalar(1.0)
  rig.add(bowl)

  // --- fries: clone the single fry model into a served pile ---
  const fryMat = new THREE.MeshStandardMaterial({ color: '#e2a24e', roughness: 0.65, metalness: 0.02 })
  const FRY_SCALE = 0.48
  const frySpecs = [
    { x: -0.5, y: 0.02, z: 0.08, rotZ: 0.85, rotX: 0.15, rotY: 0.3 },
    { x: -0.15, y: -0.02, z: -0.15, rotZ: -0.55, rotX: -0.1, rotY: 1.1 },
    { x: 0.12, y: 0.03, z: 0.22, rotZ: 0.7, rotX: 0.2, rotY: -0.6 },
    { x: 0.45, y: -0.02, z: -0.05, rotZ: -0.9, rotX: -0.15, rotY: 0.8 },
    { x: -0.3, y: -0.04, z: 0.32, rotZ: 1.05, rotX: 0.1, rotY: 2.1 },
    { x: 0.3, y: 0.0, z: 0.28, rotZ: -0.75, rotX: 0.12, rotY: -1.4 },
  ]
  const fries = frySpecs.map((spec) => {
    const wrap = new THREE.Group()
    const mesh = new THREE.Mesh(fryGeo, fryMat)
    mesh.rotation.x = -Math.PI / 2 // align the model's native long axis (Z) to the group's local Y
    wrap.add(mesh)
    wrap.scale.setScalar(FRY_SCALE)
    wrap.position.set(spec.x, spec.y, spec.z)
    wrap.rotation.set(spec.rotX, spec.rotY, spec.rotZ)
    rig.add(wrap)
    return wrap
  })

  // --- momos: clone on top of the fries ---
  const momoMat = new THREE.MeshPhysicalMaterial({
    color: '#f2e4c4',
    roughness: 0.6,
    metalness: 0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.4,
  })
  const MOMO_SCALE = 0.26
  const momoSpecs = [
    { x: -0.38, y: 0.42, z: 0.05, s: 0.95, rotY: 0.4 },
    { x: 0.03, y: 0.5, z: -0.08, s: 1.1, rotY: 2.2 },
    { x: 0.4, y: 0.4, z: 0.1, s: 0.9, rotY: -1.1 },
  ]
  const momos = momoSpecs.map((spec) => {
    const wrap = new THREE.Group()
    const mesh = new THREE.Mesh(momoGeo, momoMat)
    wrap.add(mesh)
    wrap.scale.setScalar(MOMO_SCALE * spec.s)
    wrap.position.set(spec.x, spec.y, spec.z)
    wrap.rotation.y = spec.rotY
    rig.add(wrap)
    return wrap
  })

  // --- leaf garnish ---
  const leafMat = new THREE.MeshStandardMaterial({ color: '#6fae5a', roughness: 0.55, side: THREE.DoubleSide })
  const LEAF_SCALE = 0.15
  const leafSpecs = [
    { x: -0.55, y: 0.18, z: 0.3, s: 1 },
    { x: 0.58, y: 0.12, z: 0.28, s: 0.85 },
    { x: -0.18, y: 0.55, z: -0.35, s: 0.9 },
    { x: 0.2, y: 0.58, z: 0.32, s: 0.75 },
  ]
  const garnish: THREE.Object3D[] = leafSpecs.map((spec) => {
    const wrap = new THREE.Group()
    const mesh = new THREE.Mesh(leafGeo, leafMat)
    mesh.rotation.x = -Math.PI / 2 // lay the leaf's thin axis (Z) flat along world Y
    wrap.add(mesh)
    const restScale = LEAF_SCALE * spec.s
    wrap.userData.restScale = restScale
    wrap.scale.setScalar(0.001)
    wrap.position.set(spec.x, spec.y, spec.z)
    wrap.rotation.y = Math.random() * Math.PI * 2
    rig.add(wrap)
    return wrap
  })

  for (let i = 0; i < 4; i++) {
    const speck = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 6, 6),
      new THREE.MeshStandardMaterial({ color: '#c0432a', roughness: 0.6 }),
    )
    const a = Math.random() * Math.PI * 2
    const r = 0.35 + Math.random() * 0.35
    speck.position.set(Math.cos(a) * r, 0.35 + Math.random() * 0.2, Math.sin(a) * r)
    speck.userData.restScale = 1
    speck.scale.setScalar(0.001)
    rig.add(speck)
    garnish.push(speck)
  }

  const steamTex = makeSoftSprite('rgba(255,255,255,0.9)', 'rgba(240,235,225,0.35)', 0.25)
  const steam: THREE.Sprite[] = []
  for (let i = 0; i < 5; i++) {
    const mat = new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false })
    const sprite = new THREE.Sprite(mat)
    sprite.scale.setScalar(0.5 + Math.random() * 0.2)
    sprite.position.set((Math.random() - 0.5) * 0.6, 0.75 + Math.random() * 0.2, (Math.random() - 0.5) * 0.3)
    sprite.userData.baseY = sprite.position.y
    sprite.userData.speed = 0.25 + Math.random() * 0.25
    sprite.userData.drift = Math.random() * Math.PI * 2
    rig.add(sprite)
    steam.push(sprite)
  }

  let width = 0
  let height = 0
  function resize() {
    const parent = canvas.parentElement
    if (!parent) return
    width = parent.clientWidth
    height = parent.clientHeight
    renderer.setSize(width, height, false)
    camera.aspect = width / Math.max(height, 1)
    camera.updateProjectionMatrix()
  }
  const resizeObserver = new ResizeObserver(resize)
  if (canvas.parentElement) resizeObserver.observe(canvas.parentElement)
  resize()

  let targetRotY = 0
  let targetRotX = 0
  let raf = 0
  let idleOn = false
  const clock = new THREE.Clock()

  function loop() {
    raf = requestAnimationFrame(loop)
    const t = clock.getElapsedTime()

    rig.rotation.y += (targetRotY - rig.rotation.y) * 0.05
    rig.rotation.x += (targetRotX - rig.rotation.x) * 0.05

    if (idleOn) {
      bowl.position.y = Math.sin(t * 0.9) * 0.012
      steam.forEach((s) => {
        const p = s.userData.speed as number
        const drift = s.userData.drift as number
        const baseY = s.userData.baseY as number
        const cycle = (t * p) % 1.0
        s.position.y = baseY + cycle * 0.55
        s.position.x += Math.sin(t * 0.8 + drift) * 0.0015
        const mat = s.material as THREE.SpriteMaterial
        mat.opacity = Math.max(0, 0.45 - cycle * 0.35)
      })
    }

    renderer.render(scene, camera)
  }
  loop()

  return {
    bowl,
    fries,
    momos,
    garnish,
    steam,
    setPointer(nx: number, ny: number) {
      targetRotY = nx * 0.35
      targetRotX = -ny * 0.18
    },
    startIdle() {
      idleOn = true
    },
    stopIdle() {
      idleOn = false
    },
    dispose() {
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Sprite) {
          obj.geometry?.dispose?.()
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => m?.dispose?.())
        }
      })
      renderer.dispose()
    },
  }
}
