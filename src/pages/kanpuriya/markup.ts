export const markup = /* html */ `
<section class="hero" id="hero">
  <div class="hero__bg" aria-hidden="true">
    <div class="bokeh bokeh--amber"></div>
    <div class="bokeh bokeh--green"></div>
    <div class="bokeh bokeh--rust"></div>
    <div class="spotlight"></div>
    <svg class="grain" aria-hidden="true">
      <filter id="grainFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grainFilter)" />
    </svg>
    <div class="vignette"></div>
    <div class="floor"></div>
  </div>

  <div class="hero__stage" id="stage">
    <div class="logo-wrap" id="logoWrap">
      <svg
        id="logo"
        viewBox="0 0 560 460"
        role="img"
        aria-label="Kanpuriya Chatkara logo — a letter K formed with a bowl of momos and fries"
      >
        <defs>
          <linearGradient id="kGradient" x1="0" y1="0" x2="0.15" y2="1">
            <stop offset="0" stop-color="#fbf3e0" />
            <stop offset="0.55" stop-color="#efe0bd" />
            <stop offset="1" stop-color="#d8c393" />
          </linearGradient>

          <filter id="dropShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity="0.45" />
          </filter>

          <clipPath id="kReveal">
            <rect id="kRevealRect" x="0" y="0" width="0" height="460" />
          </clipPath>
        </defs>

        <!-- K letterform -->
        <g id="logoK" filter="url(#dropShadow)">
          <g clip-path="url(#kReveal)">
            <text x="6" y="372" font-family="'Playfair Display', serif" font-weight="900" font-size="360" fill="url(#kGradient)">K</text>
          </g>
        </g>
      </svg>

      <canvas class="food-canvas" id="foodCanvas" aria-hidden="true"></canvas>
    </div>

    <div class="wordmark" id="wordmark">
      <p class="wordmark__title" id="titleWord" aria-hidden="true">
        <span>K</span><span>A</span><span>N</span><span>P</span><span>U</span><span>R</span><span>I</span><span>Y</span><span>A</span>
      </p>
      <p class="wordmark__accent" id="accentWord" aria-hidden="true">
        <span class="rule"></span><span class="word">CHATKARA</span><span class="rule"></span>
      </p>
      <p class="wordmark__tagline" id="tagline">Taste that brings people together</p>
      <h1 class="sr-only">Kanpuriya Chatkara — Taste that brings people together</h1>
    </div>

    <button class="replay-btn" id="replayBtn" type="button" aria-label="Replay logo animation">
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8Z" fill="currentColor"/></svg>
      Replay
    </button>
  </div>

  <div class="scroll-cue" id="scrollCue" aria-hidden="true">
    <span class="scroll-cue__dot"></span>
    Scroll
  </div>
</section>

<footer class="credit">
  <p>Brand animation crafted by <a href="https://mayankcloud.com" target="_blank" rel="noopener">Mayank Gupta</a> — momos &amp; fries, done right.</p>
</footer>
`
