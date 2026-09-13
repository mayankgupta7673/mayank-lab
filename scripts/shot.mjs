import { chromium } from 'playwright'

const url = process.argv[2] || 'http://localhost:5183/kanpuriya-chatkara/'
const out = process.argv[3] || 'shot.png'
const width = Number(process.argv[4] || 1440)
const height = Number(process.argv[5] || 900)
const wait = Number(process.argv[6] || 4500)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); else console.log('[console]', m.text()) })
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(wait)
await page.screenshot({ path: out })
if (errors.length) console.log('ERRORS:', errors)
await browser.close()
console.log('saved', out)
