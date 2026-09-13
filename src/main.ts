import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <span class="badge">Homepage in progress</span>
  <h1>Mayank Gupta</h1>
  <p>Blogs, design and experiments — this homepage is being built. For now, here's a recent piece of work.</p>
  <a class="work-card" href="/kanpuriya-chatkara/">
    <span class="swatch">K</span>
    <span class="meta">
      <strong>Kanpuriya Chatkara</strong>
      <span>Animated logo & hero — brand case study</span>
    </span>
  </a>
`
