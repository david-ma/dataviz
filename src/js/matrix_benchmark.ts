/**
 * Optional benchmark overlay for matrix variants.
 * Enable with ?benchmark=1 on the page URL.
 *
 * Shows:
 * - FPS (frames per second)
 * - JS heap used (Chrome only; enable with chrome://flags or --enable-precise-memory-info)
 *
 * For full RAM/CPU comparison use Chrome DevTools:
 * - Performance tab: record while matrix runs, compare CPU and frame times.
 * - Memory tab: take heap snapshot or use "Heap snapshot" to compare DOM nodes and heap size.
 */

declare global {
  interface Performance {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
}

export function startMatrixBenchmark(): void {
  const overlay = document.createElement('div')
  overlay.id = 'matrix-benchmark-overlay'
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '8px',
    right: '8px',
    zIndex: '99999',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#0f0',
    background: 'rgba(0,0,0,0.85)',
    padding: '6px 10px',
    borderRadius: '4px',
    pointerEvents: 'none',
  })
  document.body.appendChild(overlay)

  let frameCount = 0
  let lastFpsUpdate = performance.now()
  let lastFps = 0

  function updateOverlay() {
    const now = performance.now()
    const elapsed = (now - lastFpsUpdate) / 1000
    if (elapsed >= 1) {
      lastFps = Math.round(frameCount / elapsed)
      frameCount = 0
      lastFpsUpdate = now
    }

    let text = `FPS: ${lastFps}`
    const mem = (performance as Performance).memory
    if (mem && typeof mem.usedJSHeapSize === 'number') {
      const mb = (mem.usedJSHeapSize / 1048576).toFixed(1)
      text += `  |  Heap: ${mb} MB`
    }
    overlay.textContent = text
  }

  function countFrame() {
    frameCount++
    requestAnimationFrame(countFrame)
  }
  requestAnimationFrame(countFrame)

  setInterval(updateOverlay, 500)
}

export function isBenchmarkEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('benchmark') === '1'
}
