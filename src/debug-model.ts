import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(900, 900)
renderer.setPixelRatio(2)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.outputColorSpace = THREE.SRGBColorSpace
document.querySelector('#app')!.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.background = new THREE.Color('#1a1008')

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
camera.position.set(0, 1.4, 3.2)
camera.lookAt(0, 0, 0)

const key = new THREE.DirectionalLight('#ffcf9c', 2.2)
key.position.set(-2, 3, 2)
scene.add(key)
const rim = new THREE.DirectionalLight('#ffb870', 1.4)
rim.position.set(2, 1, -2)
scene.add(rim)
scene.add(new THREE.HemisphereLight('#5a4632', '#0c0705', 0.6))
scene.add(new THREE.AxesHelper(1))
scene.add(new THREE.GridHelper(3, 6))

const params = new URLSearchParams(location.search)
const file = params.get('file') || 'bowl.glb'
const color = params.get('color') || '#e8d3a8'

const loader = new GLTFLoader()
let model: THREE.Object3D | null = null
loader.load(`/models/${file}`, (gltf) => {
  model = gltf.scene
  model.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.computeVertexNormals()
      obj.material = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.05 })
    }
  })
  scene.add(model)
  ;(window as unknown as { __loaded: boolean }).__loaded = true
})

function animate() {
  requestAnimationFrame(animate)
  if (model) model.rotation.y += 0.006
  renderer.render(scene, camera)
}
animate()
