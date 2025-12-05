# HAL 9000 Visualizations - Implementation Plan

## Current Setup Analysis

### What Already Exists

1. **Existing TypeScript file**: `src/js/paperclips/dashboard.ts`
   - Already imports Chart class and d3
   - Already loaded in `public/paperclips/index.html` as a module
   - Currently does 3D physics simulation (THREE.js + RAPIER)

2. **Webpack Build System**
   - Automatically compiles all `.ts` files in `src/js/` (including subdirectories)
   - Each file gets `dependOn: 'chart'` - shares d3, jQuery, DataTables
   - Outputs to `dist/js/` with same directory structure
   - Already configured for paperclips subdirectory

3. **Chart.ts Integration**
   - `chart.ts` exports Chart class with d3 bundled
   - All visualization files share the same d3 instance (via webpack ProvidePlugin)
   - Chart class provides helper methods for common patterns

### How It Works

```
src/js/paperclips/dashboard.ts  →  webpack  →  dist/js/paperclips/dashboard.js
                                                         ↓
                                              public/paperclips/index.html
                                              <script src="/js/paperclips/dashboard.js" type="module">
```

**Key insight:** The compiled JS is served from `/js/` (not `/paperclips/`), so the path in HTML is `/js/paperclips/dashboard.js`

---

## Recommended Approach: Separate HAL Visualization Module

### Option 1: New File (Recommended) ✅

**Create:** `src/js/paperclips/hal-viz.ts`

**Advantages:**
- Non-intrusive (doesn't touch game code)
- Can coexist with existing dashboard.ts
- Easy to enable/disable
- Clean separation of concerns

**Implementation:**

```typescript
// src/js/paperclips/hal-viz.ts
import { Chart, d3 } from '../chart'

export class HalViz {
  private chart: Chart
  private updateInterval: number
  
  constructor() {
    this.chart = new Chart({
      element: '#hal-dashboard',
      width: 800,
      height: 600,
      renderer: 'svg'
    })
    
    this.init()
  }
  
  init() {
    // Create SVG containers for each graph
    this.createProductionGraph()
    this.createResourceFlow()
    // ... more graphs
    
    // Start update loop
    this.updateInterval = setInterval(() => this.update(), 100)
  }
  
  update() {
    // Read from global game variables
    const clipsPerSec = clipRate  // from globals.js
    const currentFunds = funds
    const wireAmount = wire
    
    // Update graphs with new data
    this.updateProductionGraph(clipsPerSec, currentFunds)
    // ... update other graphs
  }
  
  createProductionGraph() {
    const svg = this.chart.svg
      .append('g')
      .attr('class', 'production-graph')
      .attr('transform', 'translate(50, 50)')
    
    // HAL-style line graph
    // Black background, white/green lines, monospace labels
  }
  
  updateProductionGraph(clipsPerSec: number, funds: number) {
    // Update the graph with new data
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new HalViz()
  })
} else {
  new HalViz()
}
```

**Add to HTML:**

```html
<!-- In public/paperclips/index.html, add before closing </body> -->
<div id="hal-dashboard"></div>
<script src="/js/paperclips/hal-viz.js" type="module"></script>
```

**Build:**
```bash
# From dataviz directory
bun run build  # or npm run build
# Webpack automatically picks up new .ts file
```

---

### Option 2: Extend Existing dashboard.ts

**Modify:** `src/js/paperclips/dashboard.ts`

**Advantages:**
- Already loaded
- No new files

**Disadvantages:**
- Mixes 3D physics with 2D graphs
- Harder to maintain
- Current dashboard.ts is quite complex

**Not recommended** - keep concerns separated.

---

### Option 3: Pure JavaScript in public/ (No TypeScript)

**Create:** `public/paperclips/hal-viz.js`

**Advantages:**
- No build step
- Immediate changes
- Can use d3 from CDN

**Disadvantages:**
- No TypeScript safety
- No chart.ts helpers
- Doesn't match project conventions
- Can't share d3 bundle (larger page load)

**Not recommended** - TypeScript is worth it.

---

## Accessing Game State

### Global Variables Available

All game state is in global scope (from `globals.js` and `main.js`):

```typescript
// Production
declare const clips: number
declare const clipRate: number
declare const wire: number
declare const funds: number
declare const unsoldClips: number

// Space
declare const availableMatter: number
declare const probeCount: number
declare const foundMatter: number
declare const totalMatter: number

// Computational
declare const operations: number
declare const processors: number
declare const memory: number
declare const creativity: number
declare const yomi: number

// Combat
declare const driftersKilled: number
declare const drifterCount: number
declare const honor: number
```

**Usage in TypeScript:**

```typescript
// Option A: Declare globals at top of file
declare const clipRate: number
declare const funds: number

function update() {
  console.log('Clips/sec:', clipRate)
  console.log('Funds:', funds)
}

// Option B: Access via window
function update() {
  const clipRate = (window as any).clipRate
  const funds = (window as any).funds
}

// Option C: Create types file
// src/js/paperclips/game-globals.d.ts
declare global {
  const clipRate: number
  const funds: number
  const wire: number
  // ... all game variables
}
export {}
```

---

## Non-Intrusive Integration Strategy

### 1. Separate Container

Add a new div in `index.html` that doesn't interfere with game layout:

```html
<!-- Add after existing #chart div -->
<div id="hal-dashboard" style="position: fixed; top: 0; right: 0; width: 400px; height: 100vh; background: black; z-index: 1000;">
  <!-- HAL graphs go here -->
</div>
```

Or make it toggleable:

```html
<button id="toggle-hal" style="position: fixed; top: 10px; right: 10px; z-index: 1001;">
  Toggle HAL Dashboard
</button>
<div id="hal-dashboard" style="display: none;">
  <!-- Graphs -->
</div>
```

### 2. Read-Only Access

**Never modify game variables** - only read them:

```typescript
// ✅ Good - read only
const currentClips = clipRate

// ❌ Bad - modifying game state
clipRate = 1000  // Don't do this!
```

### 3. Separate Update Loop

Don't hook into game's main loop - run your own:

```typescript
// Game runs its own loops
// You run separate visualization loop
setInterval(() => {
  updateGraphs()
}, 100)  // 10 FPS is plenty for graphs
```

### 4. Graceful Degradation

Handle missing variables (game might not be loaded yet):

```typescript
function update() {
  if (typeof clipRate === 'undefined') {
    console.log('Game not loaded yet')
    return
  }
  
  updateProductionGraph(clipRate)
}
```

---

## D3.js + SVG Approach

### HAL-Style Aesthetic (Authentic)

Based on reference screens from 2001: A Space Odyssey HAL 9000 interface.

#### Color Palette

**Authentic HAL colors** (from reference tiles):

```typescript
const palette = {
  // Primary backgrounds (solid colors per screen)
  purple: '#532B78',      // Rich purple (NAV screens)
  teal: '#1C6B74',        // Teal-blue (engineering curves)
  navy: '#143962',        // Deep blue (memory/data)
  grey: '#7B7B7B',        // Mid-grey (engineering background)
  darkNavy: '#0A1130',    // Very dark navy (nuclear/critical)
  burgundy: '#6B2424',    // Brick red (strategic/alert)
  violet: '#54336F',      // Violet-purple (waveforms)
  matrixBlue: '#0d2c55',  // Matrix screen blue
  
  // Standard colors
  white: '#FFFFFF',       // Text, lines, labels
  
  // Stock market specific
  green: '#00FF00',       // Profit/bullish
  red: '#FF0000',         // Loss/bearish
  
  // Grid/subtle elements
  gridLight: 'rgba(255,255,255,0.06)',  // Very subtle grid
  gridMedium: 'rgba(255,255,255,0.15)', // Medium grid
  textDim: 'rgba(255,255,255,0.65)',    // Dimmed text
  textBright: 'rgba(255,255,255,0.95)'  // Bright text
}
```

#### Typography

**Two font families:**

```typescript
const fonts = {
  sans: 'Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
  mono: '"Fira Mono", Consolas, "Courier New", monospace'
}
```

**Usage:**
- **Sans-serif** (Inter) - Large titles, phase indicators, big words
- **Monospace** (Fira Mono) - All data, numbers, labels, technical readouts

**Font sizes:**
```typescript
const sizes = {
  bigWord: '64px - 92px',    // Phase indicators (BIZ, NAV, MFG)
  title: '18px',             // Screen titles
  data: '12px',              // Numeric data
  label: '11px',             // Axis labels, small text
  tiny: '10px'               // Footnotes
}
```

#### Visual Style Rules

**1. Solid Background Colors**
- Each screen has ONE solid background color
- No gradients (reference screens use flat colors)
- Choose from palette based on screen purpose:
  - Purple → Navigation/phase
  - Teal → Engineering/production
  - Navy → Memory/computational
  - Dark Navy → Critical systems
  - Burgundy → Strategic/combat
  - Violet → Quantum/waveforms

**2. White-First Design**
- Primary color for ALL text: white
- Primary color for ALL lines: white
- Only use other colors when necessary (profit/loss, alerts)
- Opacity variations for hierarchy:
  - 0.95 → Primary text/lines
  - 0.65 → Secondary labels
  - 0.06 → Grid lines

**3. Grid Lines**
- Very subtle: `rgba(255,255,255,0.06)`
- Thin lines (1px)
- Evenly spaced
- Both horizontal and vertical

**4. Line Graphs**
```typescript
// Authentic HAL line style
svg.append('path')
  .datum(data)
  .attr('fill', 'none')
  .attr('stroke', 'rgba(255,255,255,0.95)')  // White, not colored
  .attr('stroke-width', 1.1)  // Thin lines
  .attr('d', line)
```

**5. Labels and Text**
```typescript
// Small technical labels
svg.append('text')
  .attr('class', 'small-label')
  .attr('font-family', fonts.mono)
  .attr('font-size', '12px')
  .attr('fill', 'rgba(255,255,255,0.9)')
  .text('CLIPS/SEC: 1,234')

// Big phase words
svg.append('text')
  .attr('class', 'big-word')
  .attr('font-family', fonts.sans)
  .attr('font-weight', '700')
  .attr('font-size', '64px')
  .attr('fill', '#FFFFFF')
  .attr('letter-spacing', '8px')
  .attr('text-anchor', 'middle')
  .text('MFG')
```

**6. Curves and Waveforms**
- Smooth curves using `d3.curveMonotoneX` or `d3.curveBasis`
- Multiple overlapping curves OK
- All white (or single accent color)
- Thin stroke-width (1-2px)

**7. Candlestick Charts**
```typescript
// Green = bullish (filled)
// Red = bearish (hollow)
const color = isGreen ? palette.green : palette.red

svg.append('rect')
  .attr('fill', isGreen ? color : 'none')  // Filled or hollow
  .attr('stroke', color)
  .attr('stroke-width', 1)
```

#### Screen Layout Patterns

**Pattern 1: Single Large Word**
```
┌─────────────────┐
│ RTE: 09-EF      │  ← Small label (top-left)
│                 │
│      NAV        │  ← Big word (center)
│                 │
└─────────────────┘
```

**Pattern 2: Multi-Curve Chart**
```
┌─────────────────┐
│ TITLE           │  ← Title (top-left)
│ ┌─────────────┐ │
│ │ ╱╲  ╱╲  ╱╲  │ │  ← Multiple curves
│ │╱  ╲╱  ╲╱  ╲ │ │
│ └─────────────┘ │
│ LABEL: 123.456  │  ← Data label (bottom)
└─────────────────┘
```

**Pattern 3: Numeric Matrix**
```
┌─────────────────┐
│ COMPUTATIONAL   │  ← Section label
│                 │
│ TRUST      100  │  ← Data rows
│ PROCESSORS  12  │
│ MEMORY      8   │
│ OPERATIONS  1.2M│
└─────────────────┘
```

**Pattern 4: Grid of Cells**
```
┌─────┬─────┬─────┐
│ P/L │ STK1│ STK2│  ← 3x2 grid
├─────┼─────┼─────┤
│ STK3│ STK4│ STK5│
└─────┴─────┴─────┘
```

#### Anti-Patterns (Don't Do This)

❌ **Gradients** - Reference screens use solid colors
❌ **Colored text everywhere** - Use white, only color for semantic meaning
❌ **Thick lines** - HAL uses thin lines (1-2px)
❌ **Sans-serif for data** - Use monospace for all numbers
❌ **Busy backgrounds** - Keep backgrounds solid and simple
❌ **Multiple background colors per screen** - One color per screen

#### Example: Authentic HAL Screen

```typescript
// Create screen with solid background
const svg = d3.select('#hal-dashboard')
  .append('svg')
  .attr('width', 360)
  .attr('height', 360)
  .style('background', palette.teal)  // Solid color
  .style('border-radius', '9px')

// Title (white, monospace)
svg.append('text')
  .attr('x', 20)
  .attr('y', 30)
  .attr('fill', 'rgba(255,255,255,0.9)')
  .attr('font-family', fonts.mono)
  .attr('font-size', '12px')
  .text('PRODUCTION RATE')

// Grid lines (very subtle)
const gridLines = d3.range(0, 11).map(i => i * 30)
svg.append('g')
  .selectAll('line')
  .data(gridLines)
  .join('line')
  .attr('x1', d => d)
  .attr('x2', d => d)
  .attr('y1', 50)
  .attr('y2', 340)
  .attr('stroke', 'rgba(255,255,255,0.06)')
  .attr('stroke-width', 1)

// Data curve (white, thin)
const line = d3.line()
  .x((d, i) => xScale(i))
  .y(d => yScale(d))
  .curve(d3.curveMonotoneX)

svg.append('path')
  .datum(data)
  .attr('fill', 'none')
  .attr('stroke', 'rgba(255,255,255,0.95)')
  .attr('stroke-width', 1.1)
  .attr('d', line)

// Current value (white, monospace)
svg.append('text')
  .attr('x', 20)
  .attr('y', 350)
  .attr('fill', 'rgba(255,255,255,0.9)')
  .attr('font-family', fonts.mono)
  .attr('font-size', '12px')
  .text(`CURRENT: ${clipRate.toLocaleString()} /sec`)
```

#### Reference Screens

Study these for authentic HAL aesthetic:
- `/screens/9-tiles.html` - Master reference with 10 different panel types
- `/screens/11-polar-chart-multi-curve-chart.html` - Polar charts and multi-curve overlays

**Key observations:**
- Solid background colors (purple, teal, navy, burgundy, violet)
- White lines and text (with opacity variations)
- Thin lines (1-2px stroke-width)
- Monospace fonts for all data
- Very subtle grids (0.06 opacity)
- Clean, minimal aesthetic
- No gradients or textures

### Data Buffering

Keep history for line graphs:

```typescript
class HalViz {
  private clipHistory: number[] = []
  private maxHistory = 100  // Keep last 100 data points
  
  update() {
    this.clipHistory.push(clipRate)
    if (this.clipHistory.length > this.maxHistory) {
      this.clipHistory.shift()  // Remove oldest
    }
    
    this.updateLineGraph(this.clipHistory)
  }
}
```

---

## Minimal Example

Here's a complete minimal example to get started:

```typescript
// src/js/paperclips/hal-viz.ts
import { d3 } from '../chart'

declare const clipRate: number
declare const funds: number

class HalViz {
  private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>
  private clipHistory: number[] = []
  
  constructor() {
    // Create SVG
    this.svg = d3.select('#hal-dashboard')
      .append('svg')
      .attr('width', 400)
      .attr('height', 200)
      .style('background', '#000')
    
    // Add title
    this.svg.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .attr('fill', '#0f0')
      .attr('font-family', 'monospace')
      .text('CLIPS PER SECOND')
    
    // Start update loop
    setInterval(() => this.update(), 100)
  }
  
  update() {
    if (typeof clipRate === 'undefined') return
    
    this.clipHistory.push(clipRate)
    if (this.clipHistory.length > 50) {
      this.clipHistory.shift()
    }
    
    this.draw()
  }
  
  draw() {
    const xScale = d3.scaleLinear()
      .domain([0, this.clipHistory.length])
      .range([10, 390])
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.clipHistory) || 1])
      .range([180, 40])
    
    const line = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
    
    // Remove old path
    this.svg.selectAll('.line').remove()
    
    // Draw new path
    this.svg.append('path')
      .datum(this.clipHistory)
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', '#0f0')
      .attr('stroke-width', 2)
      .attr('d', line)
  }
}

// Initialize
new HalViz()
```

**Add to HTML:**
```html
<div id="hal-dashboard" style="position: fixed; top: 10px; right: 10px;"></div>
<script src="/js/paperclips/hal-viz.js" type="module"></script>
```

**Build:**
```bash
cd /usr/local/dev/Thalia/websites/dataviz
bun run build
```

**Test:**
Open `http://localhost:1337/paperclips/` and you should see a green line graph in the top-right corner showing clips per second.

---

## Recent Work (2025-12-06)

- Added **Drone Globe Screen** (teal) with spinning/dragging orthographic globe, land + US states, back-side culling, static factories, and steady-velocity drone agents.
- Simplified **Drone Operations Screen** to metrics/bars only (no embedded globe).
- Softened Production Monitor colors per SCREEN-COLORS; neon limited to investment engine profit/loss.
- Extended type coverage for drone globals and screen options; ensured graticule redraws on spin/drag.

## Updated Next Steps

### Space Expansion Phase (Phase 2)
- [ ] Sankey diagram: Matter → Wire → Clips flow
- [ ] Network graph: Factory/drone connections
- [ ] Radial progress: Solar system exploration
- [ ] Bubble chart: Resource distribution across planets
- [ ] Joy Division / streamgraph for solar/battery output (pairs with drone globe)

### Universal Domination Phase (Phase 3)
- [ ] Bubble/heatmap for probes/drifter encounters
- [ ] Combat stats matrix

### Polish
- [ ] Hover tooltips and smoother transitions
- [ ] Toggle dashboard visibility

Cross-links: see `STATUS.md` for milestones, `HAL-SCREENS-REFERENCE.md` for screen inspiration, and `kiro-notes.md` for Observable/D3 references.

---

## Summary

**Recommended approach:**
1. Create `src/js/paperclips/hal-viz.ts` (new file)
2. Import Chart and d3 from `../chart`
3. Read game globals (read-only)
4. Run separate update loop
5. Use SVG + d3 for HAL-style graphs
6. Build with webpack (automatic)
7. Load in HTML as module

**This is non-intrusive because:**
- Separate file (doesn't modify game code)
- Read-only access to game state
- Separate update loop
- Can be toggled on/off
- Easy to remove if needed

**Next steps:**
1. Create minimal example (single line graph)
2. Test it works
3. Add more graphs progressively
4. Refine HAL aesthetic
5. Add interactivity (hover, click)
