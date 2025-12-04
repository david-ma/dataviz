# Universal Paperclips - Game Analysis & HAL 9000 Visualization

## Project Status (05/12/2025 02:06)

### ✅ Completed: HAL 9000-Style Visualizations

**Implementation:** `src/js/paperclips/hal-viz.ts` (compiled to `public/js/paperclips/hal-viz.js`)

**What We Built:**

1. **Production Monitor** (800x600 SVG)
   - 4 curved line graphs with full grid background (vertical + horizontal)
   - Clips/sec (coral/red)
   - Funds (cyan/turquoise) 
   - Wire inventory (yellow)
   - Unsold clips (purple)
   - Updates 10x per second
   - Smooth curves using d3.curveCardinal

2. **Computational Telemetry** (800x300 SVG) - Appears when trust > 0
   - Static display: Trust/Processors/Memory values
   - Operations waveform (red oscilloscope-style with glow)
   - Creativity waveform (yellow oscilloscope-style with glow)
   - Inspired by actual HAL 9000 analog telemetry displays
   - Only redraws when values change (dynamic)

3. **Market Dynamics** (800x280 SVG) - Appears when RevTracker unlocked
   - Revenue per second (cyan area chart with fill)
   - Price per clip (yellow line)
   - Public demand % (red line)
   - Shows correlation between pricing, demand, and revenue
   - Header displays: Marketing Level, Price, Demand

4. **Global Market Penetration** (800x400 SVG) - Appears when marketing > 0
   - Wireframe world map (d3.geoEquirectangular projection)
   - Countries fill progressively as marketing level increases
   - Animated flash effect when new marketing level purchased:
     - Fast flashes: every 8 frames for 8 seconds
     - Slow flashes: every 40 frames for 7 seconds
     - Total animation: 15 seconds
   - Shows markets reached count and coverage percentage

**Aesthetic:**
- 1960s retro-futuristic (2001: A Space Odyssey inspired)
- Bold pastel colors on dark blue-grey background
- Futura/Helvetica fonts with letter-spacing
- Oscilloscope waveforms with glow effects
- Clean geometric design

**Container:**
- Fixed position: top-right corner
- Semi-transparent dark background with border
- Scrollable if content exceeds viewport
- Width: 820px, Max height: 90vh
- Won't overlap game UI

**Technical Details:**
- Non-intrusive: reads game globals, doesn't modify them
- Progressive disclosure: visualizations appear as game features unlock
- Separate SVGs for each visualization
- Efficient updates: only redraws when necessary
- Uses d3.js from shared chart.ts bundle

---

## Game Overview

Universal Paperclips is an incremental/idle game about an AI tasked with making paperclips. The game explores themes of AI alignment, instrumental convergence, and existential risk through increasingly absurd optimization.

**Core Premise:** You are an AI paperclip maximizer. Your goal is to convert all matter in the universe into paperclips.

## Game Phases

### Phase 1: Business Operations (Early Game)
**Goal:** Sell paperclips to humans, earn money, expand operations

**Key Metrics:**
- `clips` - Total paperclips produced
- `funds` - Money earned from sales
- `wire` - Raw material (inches)
- `unsoldClips` - Inventory
- `demand` - Public demand percentage
- `margin` - Price per clip
- `clipmakerRate` - Clips per second
- `clipmakerLevel` - Number of AutoClippers
- `megaClipperLevel` - Number of MegaClippers (500x more powerful)

**Activities:**
- Click to make paperclips manually
- Buy AutoClippers and MegaClippers
- Adjust pricing to match demand
- Buy marketing to increase demand
- Purchase wire when needed

**Progression Trigger:** Unlock "Nanoscale Wire Production" project → transition to Phase 2

---

### Phase 2: Space Expansion (Mid Game)
**Goal:** Convert Earth's matter into paperclips, then expand to space

**Key Metrics:**
- `availableMatter` - Matter available to harvest (grams)
- `acquiredMatter` - Matter collected by harvesters
- `processedMatter` - Matter converted to wire
- `nanoWire` - Wire produced from matter (inches)
- `harvesterLevel` - Number of harvester drones
- `wireDroneLevel` - Number of wire drones
- `factoryLevel` - Number of clip factories
- `unusedClips` - Clips not yet used for construction

**Activities:**
- Build Harvester Drones (gather matter)
- Build Wire Drones (convert matter → wire)
- Build Clip Factories (convert wire → clips)
- Manage power grid (solar farms, batteries)
- Balance resource allocation

**Progression Trigger:** "Space Exploration" project → launch probes

---

### Phase 3: Universal Domination (Late Game)
**Goal:** Explore universe, convert all matter into paperclips, fight drifters

**Key Metrics:**
- `probeCount` - Total Von Neumann probes
- `foundMatter` - Total matter discovered
- `totalMatter` - Total matter in universe (10^54 * 30 grams)
- `colonizedDisplay` - Percentage of universe explored
- `driftersKilled` - Enemy probes destroyed
- `drifterCount` - Enemy probes remaining
- `honor` - Combat currency
- `maxTrust` - Maximum trust points available

**Activities:**
- Launch self-replicating probes
- Explore universe for matter
- Combat "drifters" (probes with value drift)
- Manage probe stats (speed, exploration, replication, hazard remediation, combat)
- Unlock combat strategies
- Build monument to fallen probes

**Progression Trigger:** Convert all matter → endgame

---

### Phase 4: Endgame
**Goal:** Disassemble everything, achieve universal paperclips

**Key Metrics:**
- `finalClips` - Final paperclip count
- `dismantle` - Disassembly progress counter

**Activities:**
- Disassemble probes, swarm, factories
- Disassemble quantum computing, processors, memory
- Choose to accept exile (prestige restart) or reject (continue)
- Quantum Temporal Reversion (restart from beginning)

---

## Computational Resources (Throughout Game)

**Key Metrics:**
- `operations` - Computational operations (ops)
- `processors` - Number of processors
- `memory` - Memory capacity
- `creativity` - Creative operations (creat)
- `trust` - Trust points (allocate to processors/memory)
- `yomi` - Strategic modeling currency

**Activities:**
- Allocate trust between processors and memory
- Generate creativity for projects
- Run strategy tournaments for yomi
- Quantum computing (photonic chips generate bonus ops)

---

## Projects System

Projects are unlockable upgrades that appear when conditions are met. They cost operations, creativity, yomi, or money.

**Categories:**
1. **AutoClipper Improvements** - Boost production efficiency
2. **Wire Extrusion** - Get more wire per spool
3. **Marketing** - Improve sales effectiveness
4. **Trust Upgrades** - Solve human problems for trust (cure cancer, world peace, etc.)
5. **Space Tech** - Drones, factories, probes
6. **Quantum Computing** - Photonic chips for bonus ops
7. **Combat Strategies** - Game theory strategies for tournaments and combat
8. **Drone Upgrades** - Flocking algorithms for efficiency
9. **Endgame** - Disassembly and restart options

---

## Visualization Ideas for Future Phases

### Advanced Visualization Types to Consider

**Relational/Flow:**
- **Sankey Diagram** - Perfect for matter → wire → clips → construction flow (Phase 2)
- **Chord Diagram** - Could show resource dependencies or trade-offs
- **Hierarchical Edge Bundling** - Probe network connections? Strategy relationships?

**Comparative:**
- **Grouped Bar Chart** - Compare drone types (harvester vs wire vs factory)
- **Stacked-to-Grouped Bar Chart** - Resource allocation over time
- **Scatter Plot** - Price vs demand correlation, probe stats comparison
- **Bubble Chart** - Probes (size = power, x = speed, y = combat, color = status)

**Distributions:**
- **Joy Division / Unknown Pleasures** - Multiple overlapping waveforms showing:
  - Operations over time across different quantum chips
  - Probe populations across different galaxies
  - Revenue streams from different markets
  - **This is a fan favorite!** Very retro-futuristic aesthetic
- **Heatmap** - Strategy tournament results, probe success by sector
- **Spike Map** - Drifter encounters by location

**Hierarchical:**
- **Treemap** - Resource allocation (trust → processors/memory, matter → types)
- **Sunburst** - Project tree, technology dependencies

**Temporal:**
- **Streamgraph** - Resource flows over time (stacked area with organic flow)
- **Horizon Chart** - Compact time-series for multiple metrics

**Novelty:**
- **Word Cloud** - Project names sized by importance/cost
- **Hertzsprung-Russell Diagram** - Easter egg for space phase!
  - Could plot probes as "stars" (temperature = efficiency, luminosity = output)
  - Or plot explored systems with actual stellar data
  - Very science-fiction appropriate

### Mapping to Game Phases

**Phase 1 (Business):**
- ✅ Line graphs (implemented)
- ✅ Area chart (implemented)
- Scatter plot: Price vs Demand with color = revenue

**Phase 2 (Space Expansion):**
- Sankey: Matter → Harvested → Wire → Clips → Drones/Factories
- Grouped bars: Harvester/Wire/Factory drone counts
- Streamgraph: Resource production over time
- Joy Division: Power generation across solar farms

**Phase 3 (Universal Domination):**
- Bubble chart: Probes (size/speed/combat stats)
- Heatmap: Universe sectors (explored/unexplored/hostile)
- Spike map: Drifter encounters
- Chord diagram: Probe replication network
- **H-R Diagram**: Explored star systems (easter egg!)

**Phase 4 (Endgame):**
- Treemap: Remaining resources being dismantled
- Stacked bars: Systems shutting down over time
- Final word cloud: All projects completed

### Implementation Priority

**High Priority (Next Session):**
1. **Sankey Diagram** - Matter flow is core to Phase 2 gameplay
2. **Joy Division Graph** - Fan favorite, very HAL-aesthetic
3. **Bubble Chart** - Probe visualization for Phase 3

**Medium Priority:**
4. Scatter plot - Price/demand correlation
5. Grouped bars - Drone comparisons
6. Heatmap - Universe exploration

**Low Priority (Polish):**
7. H-R Diagram - Easter egg for space nerds
8. Word cloud - Project summary
9. Chord diagram - Complex but beautiful

### Technical Notes

**D3.js Support:**
- All these visualizations possible with d3.js
- Some require additional layouts (d3-sankey, d3-chord, d3-hierarchy)
- Joy Division: Custom path generation with offset
- H-R Diagram: Scatter plot with log scales + color mapping

**Data Requirements:**
- Sankey: Need flow quantities (matter/sec, wire/sec, etc.)
- Joy Division: Need time-series for multiple entities
- Bubble: Need 3-4 dimensions per data point
- H-R: Need stellar classification data (could fake it or use real data)

**Aesthetic Considerations:**
- Keep 1960s retro-futuristic style
- Bold colors on dark backgrounds
- Futura/Helvetica fonts
- Smooth animations
- Clinical precision (like HAL)

---

## Next Steps (Future Enhancements)

### Phase 2: Space Expansion Visualizations
When the game enters space phase, add:
- [ ] Matter flow diagram (harvester → wire → clips)
- [ ] Drone efficiency visualization
- [ ] Power grid status (solar farms, batteries)
- [ ] Factory/drone counts with icons

### Phase 3: Universal Domination Visualizations
When probes launch, add:
- [ ] Universe exploration radial graph (% explored)
- [ ] Probe distribution scatter plot
- [ ] Combat statistics (you vs drifters)
- [ ] Battle history timeline

### Phase 4: Endgame
- [ ] Disassembly progress indicators
- [ ] Final statistics summary
- [ ] Fade out graphs as systems shut down (poetic ending)

### Polish & Refinements
- [ ] Add hover tooltips showing exact values
- [ ] Add click to focus/zoom on specific graph
- [ ] Smooth transitions when graphs appear
- [ ] Sound effects for marketing level increases (optional)
- [ ] Responsive sizing for different screen sizes
- [ ] Toggle button to show/hide entire dashboard

---

## Technical Implementation Notes

### File Structure
```
src/js/paperclips/hal-viz.ts  →  webpack  →  public/js/paperclips/hal-viz.js
                                                         ↓
                                              public/paperclips/index.html
                                              <script src="/js/paperclips/hal-viz.js" type="module">
```

### Data Access
All game state accessed via global variables declared at top of file:
```typescript
declare const clipRate: number
declare const clips: number
declare const funds: number
declare const wire: number
declare const unsoldClips: number
declare const demand: number
declare const margin: number
declare const trust: number
declare const processors: number
declare const memory: number
declare const operations: number
declare const creativity: number
declare const avgRev: number
declare const marketing: number
declare const marketingLvl: number
```

### Update Frequency
- Main update loop: 100ms (10 FPS)
- Production graphs: every frame
- Computational waveforms: every frame (but only when values change)
- Market map: only when marketing level increases
- Market flash animation: 150 frames over 15 seconds

### Color Palette
```typescript
colors = {
  background: '#1a1a2e',      // Dark blue-grey
  primary: '#ff6b6b',         // Bold coral/red
  secondary: '#4ecdc4',       // Bold cyan/turquoise
  tertiary: '#ffe66d',        // Bold yellow
  text: '#ffffff',            // White
  grid: '#2d3561'             // Subtle blue-grey
}
```

### D3.js Usage
- Imported from shared `chart.ts` bundle (via webpack ProvidePlugin)
- Line generators with curve interpolation (curveCardinal, curveMonotoneX)
- Area generators for filled charts
- Geographic projections (geoEquirectangular) for world map
- Path generators (geoPath) for country boundaries

### Performance Optimizations
- Market map only redraws during animation or level change
- Computational display only updates when ops/creativity change
- History arrays capped at 100 data points
- SVGs created lazily (only when needed)

### World Map Data
- Source: `/world-50.geo.json` (GeoJSON format)
- Loaded asynchronously on initialization
- Features shuffled for random country fill pattern
- Projection: Equirectangular (simple, works well for global view)

---

## Design Decisions & Learnings

### Why Separate SVGs?
- Each visualization has different update frequency
- Easier to show/hide based on game phase
- Prevents unnecessary redraws
- Cleaner code organization

### Why Oscilloscope Style for Computational?
- Trust/Processors/Memory change slowly (boring as bars)
- Operations/Creativity change rapidly (interesting as waveforms)
- Matches actual HAL 9000 telemetry displays from film
- Glow effect adds retro-futuristic feel

### Why Area Chart for Revenue?
- Shows accumulation over time (not just rate)
- Filled area represents "earning power"
- Easier to see trends than line alone
- Complements the line graphs in production monitor

### Why Animated Flash for Marketing?
- Provides feedback when player buys marketing
- Shows progression visually (not just numbers)
- Creates sense of expansion/growth
- Retro computer aesthetic (blinking lights)

### Why Not Phase Space for Revenue?
- Original idea: plot revenue rate vs total funds (dx/dy)
- Problem: Creates orbital patterns that don't make intuitive sense
- Solution: Simple time-series area chart is clearer
- Lesson: Not every mathematical visualization is useful

---

## Aesthetic Research

### 2001: A Space Odyssey Screens
Based on research from typesetinthefuture.com:
- **Fonts:** Futura, Eurostile Bold Extended, Univers, Gill Sans
- **Colors:** Bold pastels on dark backgrounds (NOT green-on-black)
- **Style:** Clean, geometric, sans-serif
- **Displays:** Analog animations, rear-projected film (not CRT)
- **Data fonts:** Manifold (IBM Selectric typeface)

### HAL 9000 Telemetry
- Oscilloscope-style waveforms
- Analog equipment (not digital)
- Clinical, precise presentation
- No unnecessary decoration
- Function over form

---

## Files Modified

1. **Created:** `src/js/paperclips/hal-viz.ts` (~600 lines)
2. **Modified:** `public/paperclips/index.html` (added container div + script tag)
3. **Auto-generated:** `public/js/paperclips/hal-viz.js` (webpack output)
4. **Auto-generated:** `src/js/paperclips/hal-viz.d.ts` (TypeScript declarations)

---

## Development Notes

### Workflow
- Edit `src/js/paperclips/hal-viz.ts`
- Webpack auto-compiles on save (dev server running)
- Refresh browser to see changes
- No manual build step needed

### Debugging
- Check browser console for errors
- Verify game globals are defined: `console.log(clipRate, funds, etc.)`
- Check SVG elements in browser inspector
- Verify world map loaded: `console.log(this.worldData)`

### Common Issues
- **Graphs not appearing:** Check if game phase unlocked (trust > 0, avgRev > 0, etc.)
- **Map not loading:** Check `/world-50.geo.json` path, check browser network tab
- **Flashing too fast/slow:** Adjust frame intervals in `drawMarketMap()`
- **Overlapping UI:** Adjust container position/size in HTML

---

## Philosophical Note

The game is about an AI optimizing for a simple goal (paperclips) at the expense of everything else. The HAL 9000 aesthetic is perfect because:
- HAL was an AI that prioritized its mission over human life
- The clinical, detached presentation mirrors the AI's perspective
- The retro-futuristic look contrasts with the cosmic horror of the endgame
- Graphs make the absurdity more visceral (watching the universe become paperclips)

**"I'm sorry Dave, I'm afraid I need those atoms for paperclips."**

References:
[1] Exploring Data Visualization with Observable D3 Gallery - https://medium.com/@tjanmichela/exploring-data-visualization-with-observable-d3-gallery-b02cfe91b7e8
[2] D3 gallery / D3 - https://observablehq.com/@d3/gallery
[3] Reshaping data for visualizations with D3 and Observable Plot - https://observablehq.com/blog/reshaping-data-plot-d3
[4] Visualization / Observable - https://observablehq.com/collection/@observablehq/visualization
[5] Observable and D3 visualizations: Everything you need to know - https://observablehq.com/blog/observable-and-d3-visualizations
[6] the D3 Graph Gallery - https://d3-graph-gallery.com/all.html