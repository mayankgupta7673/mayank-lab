import gsap from 'gsap'
import './style.css'
import { markup } from './markup'
import { createFoodScene, type FoodScene } from './foodScene'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = markup

const hero = document.querySelector<HTMLElement>('#hero')!
const stage = document.querySelector<HTMLElement>('#stage')!
const logoWrap = document.querySelector<HTMLElement>('#logoWrap')!
const foodCanvas = document.querySelector<HTMLCanvasElement>('#foodCanvas')!
const replayBtn = document.querySelector<HTMLButtonElement>('#replayBtn')!
const scrollCue = document.querySelector<HTMLElement>('#scrollCue')!

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches

let scene: FoodScene | null = null
let tl = gsap.timeline({ paused: true })

function buildTimeline() {
  const timeline = gsap.timeline({ paused: true, defaults: { overwrite: 'auto' } })
  if (!scene) return timeline
  const { bowl, fries, momos, garnish } = scene

  gsap.set('#kRevealRect', { attr: { width: 0 } })

  timeline
    .addLabel('fadeIn')
    .from(stage, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 'fadeIn')
    .from(foodCanvas, { opacity: 0, duration: 0.7, ease: 'power2.out' }, 'fadeIn')
    .from(bowl.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.7, ease: 'back.out(1.6)' }, 'fadeIn+=0.1')

    .addLabel('friesArrive', '>-0.1')
    .from(
      fries.map((f) => f.position),
      { y: '+=1.7', x: '+=0.25', duration: 0.85, ease: 'bounce.out', stagger: 0.09 },
      'friesArrive',
    )
    .from(
      fries.map((f) => f.rotation),
      { z: '+=6.3', x: '+=3.4', duration: 0.85, ease: 'power2.out', stagger: 0.09 },
      'friesArrive',
    )

    .addLabel('momosDrop', '>-0.15')
    .from(
      momos.map((m) => m.position),
      { y: '+=1.5', duration: 0.75, ease: 'bounce.out', stagger: 0.14 },
      'momosDrop',
    )
    .from(
      momos.map((m) => m.rotation),
      { y: '+=4.4', duration: 0.75, ease: 'power2.out', stagger: 0.14 },
      'momosDrop',
    )

    .addLabel('merge', '>-0.1')
    .call(() => scene!.startIdle(), [], 'merge')
    .to(bowl.scale, { x: 1.05, y: 1.05, z: 1.05, duration: 0.22, yoyo: true, repeat: 1 }, 'merge+=0.15')

  const shuffled = [...garnish].sort(() => Math.random() - 0.5)
  shuffled.forEach((g, i) => {
    const s = g.userData.restScale as number
    timeline.to(g.scale, { x: s, y: s, z: s, duration: 0.5, ease: 'back.out(2)' }, `merge+=${0.1 + i * 0.045}`)
  })

  timeline
    .addLabel('kForms', '>-0.1')
    .to('#kRevealRect', { attr: { width: 560 }, duration: 0.9, ease: 'power3.inOut' }, 'kForms')
    .from('#logoK', { scale: 0.92, transformOrigin: '0% 100%', duration: 0.9, ease: 'power3.out' }, 'kForms')

    .addLabel('textAppears', '>-0.1')
    .from('#titleWord span', { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out', stagger: 0.035 }, 'textAppears')
    .to('.wordmark__accent .rule', { scaleX: 1, duration: 0.5, ease: 'power2.out' }, 'textAppears+=0.25')
    .from('.wordmark__accent .word', { opacity: 0, y: 8, duration: 0.5 }, 'textAppears+=0.3')
    .fromTo(
      '.wordmark__accent .word',
      { backgroundPosition: '160% 0' },
      { backgroundPosition: '-60% 0', duration: 1.1, ease: 'power2.inOut' },
      'textAppears+=0.35',
    )
    .from('#tagline', { opacity: 0, y: 8, duration: 0.5 }, 'textAppears+=0.45')
    .from('#replayBtn', { opacity: 0, y: 8, duration: 0.5 }, 'textAppears+=0.55')
    .to(scrollCue, { opacity: 1, duration: 0.6 }, 'textAppears+=0.7')

  return timeline
}

function playIntro() {
  scene?.stopIdle()
  tl.kill()
  tl = buildTimeline()
  tl.play(0)
}

async function init() {
  try {
    scene = await createFoodScene(foodCanvas)
    // exposed only so scripts/export-assets.mjs can pose the scene (e.g. hide steam) for still exports
    ;(window as unknown as { __kcScene?: FoodScene }).__kcScene = scene
  } catch (err) {
    console.error('food scene failed to load', err)
    scene = null
  }

  if (reduceMotion) {
    if (scene) {
      scene.garnish.forEach((g) => {
        const s = g.userData.restScale as number
        g.scale.set(s, s, s)
      })
      scene.startIdle()
    }
    gsap.set(['#logoK', '#titleWord span', '.wordmark__accent .word', '#tagline', '#replayBtn'], {
      opacity: 1,
      y: 0,
      scale: 1,
    })
    gsap.set('#kRevealRect', { attr: { width: 560 } })
    gsap.set('.wordmark__accent .rule', { scaleX: 1 })
    gsap.set(scrollCue, { opacity: 1 })
  } else {
    await document.fonts.ready.catch(() => undefined)
    console.log('[timing] about to play', performance.now())
    tl = buildTimeline()
    tl.play(0)
  }
  observer.observe(hero)
}

init()

// --- interactions ---

replayBtn.addEventListener('click', playIntro)
logoWrap.addEventListener('click', playIntro)

if (!reduceMotion) {
  const accentWord = document.querySelector<HTMLElement>('.wordmark__accent .word')!
  document.querySelector('.wordmark')!.addEventListener('mouseenter', () => {
    gsap.fromTo(
      accentWord,
      { backgroundPosition: '160% 0' },
      { backgroundPosition: '-60% 0', duration: 1.1, ease: 'power2.inOut', overwrite: 'auto' },
    )
  })
}

if (!reduceMotion && !isCoarsePointer) {
  let raf = 0
  hero.addEventListener('pointermove', (e) => {
    const rect = hero.getBoundingClientRect()
    const mx = (e.clientX - rect.left) / rect.width - 0.5
    const my = (e.clientY - rect.top) / rect.height - 0.5
    cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      hero.style.setProperty('--mx', mx.toFixed(3))
      hero.style.setProperty('--my', my.toFixed(3))
      scene?.setPointer(mx, my)
    })
  })
  hero.addEventListener('pointerleave', () => {
    hero.style.setProperty('--mx', '0')
    hero.style.setProperty('--my', '0')
    scene?.setPointer(0, 0)
  })
}

// replay the intro when the hero scrolls back into view after having left it
// (observing starts only once the initial intro is underway, so a transient
// intersection dip from layout settling during load can't trigger a false replay)
let hasLeft = false
const observer = new IntersectionObserver(
  ([entry]) => {
    if (!entry.isIntersecting) {
      hasLeft = true
      return
    }
    if (hasLeft && !reduceMotion) {
      playIntro()
      hasLeft = false
    }
  },
  { threshold: 0.6 },
)

// gentle parallax on the bokeh layer while scrolling past the hero
if (!reduceMotion) {
  let ticking = false
  window.addEventListener('scroll', () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const shift = Math.min(window.scrollY * 0.15, 60)
      gsap.set('.bokeh', { y: shift })
      ticking = false
    })
  })
}
