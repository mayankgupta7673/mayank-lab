// One-time setup: npm install -D playwright && npx playwright install chromium
// Usage: node scripts/export-assets.mjs <url> <outDir>   (needs `npm run dev` running)
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const url = process.argv[2] || 'http://localhost:5183/kanpuriya-chatkara/'
const outDir = process.argv[3] || 'export'
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()

async function hideSteam(page) {
  await page.evaluate(() => {
    const scene = window.__kcScene
    scene?.steam.forEach((s) => {
      s.visible = false
    })
  })
  await page.waitForTimeout(120)
}

// 1) transparent logo mark, high-res
{
  const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4800)
  await hideSteam(page)
  await page.evaluate(() => {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
    const bg = document.querySelector('.hero__bg')
    const wordmark = document.querySelector('.wordmark')
    const replay = document.querySelector('.replay-btn')
    ;[bg, wordmark, replay].forEach((el) => el && el.remove())
    document.querySelectorAll('.hero, .hero__stage, #app').forEach((el) => {
      el.style.background = 'transparent'
      el.style.minHeight = '0'
      el.style.height = 'auto'
      el.style.display = 'flex'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'center'
      el.style.padding = '80px'
    })
    const wrap = document.querySelector('.logo-wrap')
    wrap.style.width = '600px'
    wrap.style.margin = '0'
  })
  await page.waitForTimeout(150)
  const wrap = page.locator('.logo-wrap')
  const box = await wrap.boundingBox()
  const pad = { x: box.width * 0.18, y: box.height * 0.28 }
  await page.screenshot({
    path: `${outDir}/kanpuriya-chatkara-logo-mark.png`,
    omitBackground: true,
    clip: {
      x: Math.max(0, box.x - pad.x),
      y: Math.max(0, box.y - pad.y),
      width: box.width + pad.x * 2,
      height: box.height + pad.y,
    },
  })
  await page.close()
}

// 2) full lockup banner, themed background, 1600x900
{
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4800)
  await hideSteam(page)
  await page.evaluate(() => {
    const replay = document.querySelector('.replay-btn')
    replay?.remove()
    document.querySelector('.hero').style.minHeight = '900px'
  })
  await page.screenshot({ path: `${outDir}/kanpuriya-chatkara-banner.png` })
  await page.close()
}

// 3) square social-card version, 1200x1200
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 2 })
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(4800)
  await hideSteam(page)
  await page.evaluate(() => {
    const replay = document.querySelector('.replay-btn')
    replay?.remove()
    document.querySelector('.hero').style.minHeight = '1200px'
  })
  await page.screenshot({ path: `${outDir}/kanpuriya-chatkara-square.png` })
  await page.close()
}

await browser.close()
console.log('exported to', outDir)
