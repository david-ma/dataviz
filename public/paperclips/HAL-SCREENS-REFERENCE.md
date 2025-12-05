# HAL 9000 Interface Screens - Reference

Source: ChatGPT analysis of 2001: A Space Odyssey HAL interface panels

## Overall Aesthetic
- Retro-futuristic, 1970s mainframe UI design
- Flat, ultra-clean squares with monochrome vector graphics
- Cool colour palette: blues, purples, teals, with thin white lines
- Grids, telemetry numbers, and mathematical curves
- Clinical, precise, machine-intelligence feel
- All screens perfectly aligned, uniformly square (~720×720px at 4K)
- Symmetry around central HAL eye

---

## Screen 1 (Top-Left): Orbital / Radial Plot

**Type:** Radial/astronomical plot with concentric circles

**Colours:**
- Background: desaturated navy blue
- Lines: thin white or very pale blue
- Accent text: white

**Chart Details:**
- 6-7 concentric circles
- Slanted elliptical shape crossing through center
- Axes labelled with small engineering text
- One highlighted point near outer orbit
- Stylised astrodynamics display

**Aesthetic:** Clean blueprint-like sci-fi technical design

**Potential Use in Paperclips:**
- Space exploration progress (Phase 2)
- Probe deployment visualization
- Solar system resource mapping

---

## Screen 2 (Top-Mid-Left): Numerical Matrix Display

**Type:** Data table / numeric dump

**Colours:**
- Background: bright electric blue
- Text: white

**Chart Details:**
- Two groups: upper table (larger), lower table (smaller)
- 4-6 digit numeric strings
- ~12 rows × ~8 columns
- Horizontal rule separating sections

**Aesthetic:** Computer memory dump or telemetry packet inspector

**Potential Use in Paperclips:**
- Trust/processor/memory stats
- Project costs and requirements
- Strategic modeling calculations
- Quantum computing state

---

## Screen 3 (Top-Mid-Right): 3D Surface Plot (Magenta Grid)

**Type:** 3D parametric surface (saddle curve)

**Colours:**
- Background: deep purple/magenta
- Grid: thin white lines
- Curve/mesh: brighter white
- Axes labels: small white

**Chart Details:**
- Large 3D curve arching upwards then dipping
- Mesh grid gives depth lines in X and Y
- Thin frame border
- Labels: "10/POS" and "10/NEG"

**Aesthetic:** Retro-futuristic mainframe - Tron meets 2001

**Potential Use in Paperclips:**
- Price/demand optimization surface
- Strategic modeling landscape
- Quantum computing probability space
- Combat effectiveness curves

---

## Screen 4 (Top-Right): Multi-Line Oscillation Graph (Teal)

**Type:** Multi-curve time-series oscillations

**Colours:**
- Background: dark teal green
- Graph frame + labels: white
- Curves: bright white

**Chart Details:**
- 3-4 overlaid wiggling curves with varying amplitude
- XY grid with tiny tick marks
- Right-hand vertical label "RELEASE"
- Numbers alongside endpoints

**Aesthetic:** Signal stability / waveform analysis

**Potential Use in Paperclips:**
- Operations/creativity oscillations (already implemented!)
- Market price fluctuations
- Combat power levels
- Probe signal strength

---

## Screen 5 (Bottom-Left): Blueprint Wireframe Surface + Table

**Type:** Mixed numeric table + wireframe plane

**Colours:**
- Background: medium blueprint blue
- Lines: pure white
- Text: white, monospaced

**Chart Details:**
- Numeric block in upper-left (~6×6 grid)
- Wireframe grid resembles landscape surface with curvature
- Clean rectangular border

**Aesthetic:** Hybrid engineering panel - technical, blueprint, industrial CAD

**Potential Use in Paperclips:**
- Matter/wire/clips inventory table
- Resource flow surface
- Factory efficiency landscape
- Drone deployment grid

---

## Screen 6 (Bottom-Mid-Left): "MEM" Label Panel

**Type:** Text-only system identifier

**Colours:**
- Background: deep navy blue
- Text: bold white
- Small header: "PMT: 48-XB"

**Chart Details:**
- Centered large text "MEM"
- Minimalistic blank data tile

**Aesthetic:** Hardware status tile or boot-screen indicator

**Potential Use in Paperclips:**
- Memory allocation display
- Trust level indicator
- Phase identifier
- System status label

---

## Screen 7 (Bottom-Mid-Right): Exponential Decay / Multi-Curve Plot

**Type:** Multi-curve exponential/inverse response graph

**Colours:**
- Background: rich sapphire blue
- Curves + axes + grid: white

**Chart Details:**
- 7-10 distinct curves, starting upper left, descending steeply
- Regular rectangular lattice grid
- Right-hand small inset mini-chart
- Scientific modelling of attenuation/discharge/probability decay

**Aesthetic:** Technical lab notebooks or old-school physics software

**Potential Use in Paperclips:**
- Project completion curves
- Resource depletion rates
- Probe survival probability
- Combat attrition modeling

---

## Screen 8 (Bottom-Right): "FLX" System Tile

**Type:** Text panel

**Colours:**
- Background: vivid cobalt blue
- Text: white
- Smaller heading: "ATA: 48-12"

**Chart Details:**
- Only centered bold "FLX"
- Clean, spacious design

**Aesthetic:** Mode indicator or subsystem status screen

**Potential Use in Paperclips:**
- Current phase indicator
- Strategic mode display
- System flexibility status
- Operational mode label

---

## Design Principles for Implementation

### Color Palette (Authentic HAL)
- Navy blue: `#1a2332` (desaturated)
- Electric blue: `#0066cc`
- Purple/magenta: `#4a1a4a`, `#6a2a6a`
- Teal green: `#1a4a4a`
- Blueprint blue: `#2a4a6a`
- Sapphire blue: `#1a3a6a`
- Cobalt blue: `#2a4acc`
- White lines/text: `#ffffff`, `#f0f0f0`

### Typography
- Monospace fonts (Courier, Consolas, Monaco)
- Small engineering labels (8-10px)
- Bold system identifiers (24-36px)
- Thin, precise line weights (1-2px)

### Layout
- Perfect squares (~720×720px at 4K)
- Thin borders/frames
- Generous padding
- Symmetrical arrangement
- Grid-based alignment

### Animation Style
- Slow, deliberate updates
- No flashy transitions
- Subtle data point additions
- Smooth curve drawing
- Clinical precision

---

## Analysis of Screen Examples (05/12/2025)

### Best Examples for Paperclips Implementation

**🌟 Tier 1 - Immediately Useful:**

1. **2-numeric-matrix-panel.html** ⭐⭐⭐⭐⭐
   - Perfect for trust/processors/memory stats
   - Clean monospace telemetry display
   - Click-to-copy rows (great UX)
   - Authentic HAL blue background (#0d2c55)
   - Two-section layout (main + secondary data)
   - **Use for:** Phase 1 computational resources, Phase 2 probe stats

2. **9-tiles.html** ⭐⭐⭐⭐⭐
   - Complete HAL aesthetic showcase
   - 7 different tile types in authentic colors
   - Word panels (NAV, MEM, NUC) - perfect for phase indicators
   - Exponential decay curves (teal) - project progress
   - Upward curves (grey) - resource accumulation
   - Waveforms (purple) - operations/creativity (already implemented!)
   - Convex curve (burgundy) - optimization landscapes
   - **Use as:** Master reference for color palette and layout

3. **1-radial-orbital-plot.html** ⭐⭐⭐⭐
   - Draggable marker on elliptical orbit
   - Concentric circles with angular grid
   - Perfect for space exploration visualization
   - Tooltip shows angle and radius
   - **Use for:** Phase 2 solar system exploration, probe positioning

4. **8-heatmap-grid.html** ⭐⭐⭐⭐
   - 7×7 grid with color intensity
   - Smooth fade-in animation
   - Hover tooltips
   - **Use for:** Phase 2 factory/drone efficiency matrix, Phase 3 universe sectors

**🔧 Tier 2 - Specialized Use:**

5. **7-radar-spider-chart.html** ⭐⭐⭐
   - Pentagon radar chart with 5 axes
   - Good for comparing multiple attributes
   - **Use for:** Probe capabilities (speed/power/accuracy/stamina/focus), strategic modeling dimensions

6. **6-semi-circular-donut-gauge.html** ⭐⭐⭐
   - Half-circle progress gauge
   - Animated fill
   - **Use for:** Project completion percentage, phase progress, trust level

7. **5-dual-curve-mini-line-chart.html** ⭐⭐
   - Two overlaid curves with tooltip
   - Simple time-series
   - **Use for:** Comparing two metrics (already have better version implemented)

**📚 Tier 3 - Reference Only:**

8. **10-hertzprung-russell-diagram.html** ⭐⭐
   - Scatter plot with color-coded points
   - Complex astronomical data visualization
   - Beautiful but too specific for Paperclips
   - **Use for:** Inspiration only - shows how to handle large datasets with color mapping

9. **3-d3-svg-starter.html** ⭐
   - Basic tile template
   - Too simple, already surpassed

10. **4-basic-node-with-connector.html** ⭐
    - Single node with line connector
    - Too basic, but shows edge drawing pattern
    - **Use for:** Building network graphs later

---

## Game Phase Mapping

### Phase 1: Business (Current)
**Already Implemented:**
- ✅ Production Monitor (4 curved lines)
- ✅ Computational Telemetry (waveforms - matches 9-tiles purple panel!)
- ✅ Market Dynamics (area + line charts)
- ✅ Global Market Penetration (world map)

**Should Add:**
- 📊 **Numeric Matrix Panel** (2-numeric-matrix-panel.html)
  - Top section: Trust, Processors, Memory, Operations, Creativity
  - Bottom section: Current project costs/requirements
  - Click row to copy values
  
- 🏷️ **Phase Indicator Panel** (9-tiles NAV/MEM style)
  - Large "BIZ" or "MFG" text
  - Small header: "PHASE: 01"
  - Navy blue background

### Phase 2: Space Expansion
**High Priority:**
- 🌍 **Orbital Plot** (1-radial-orbital-plot.html)
  - Show solar system exploration progress
  - Draggable marker = current focus
  - Concentric circles = planets/orbits
  - Update as you acquire matter from different sources

- 🔥 **Heatmap Grid** (8-heatmap-grid.html)
  - Factory efficiency matrix
  - Drone deployment grid
  - Each cell = factory/drone, color = efficiency
  - Hover shows exact stats

- 📈 **Exponential Curves** (9-tiles teal panel)
  - Matter acquisition rate over time
  - Wire production curves
  - Multiple curves for different sources

- 🎯 **Radar Chart** (7-radar-spider-chart.html)
  - Probe capabilities: Speed, Replication, Hazard Remediation, Combat, Self-Replication
  - Compare different probe designs

### Phase 3: Universal Domination
**High Priority:**
- 🗺️ **Universe Heatmap** (8-heatmap-grid.html)
  - Each cell = universe sector
  - Color = exploration/conversion progress
  - Animate as drifters appear

- 📊 **Combat Statistics Matrix** (2-numeric-matrix-panel.html)
  - Probe counts, drifter encounters
  - Battle win/loss ratios
  - Honor tracking

- 🌐 **Network Graph** (build from 4-basic-node-with-connector.html)
  - Probe communication network
  - Nodes = probe clusters
  - Edges = communication links
  - Animate as network grows

### Phase 4: Endgame
- 🎚️ **Progress Gauge** (6-semi-circular-donut-gauge.html)
  - Universe conversion percentage
  - Large, dramatic display
  - Counts up to 100%

---

## Color Palette from 9-tiles.html (Authentic HAL)

```typescript
const halPalette = {
  purple: "#532B78",      // NAV panel
  teal: "#1C6B74",        // Engineering curves (decay)
  navy: "#143962",        // MEM panel
  grey: "#7B7B7B",        // Engineering curves (upward)
  darknav: "#0A1130",     // NUC panel
  burgundy: "#6B2424",    // Convex curve panel
  violet: "#54336F",      // Waveform panel
  white: "#ffffff",       // Lines and text
  
  // Additional from other screens
  matrixBlue: "#0d2c55",  // Numeric matrix background
  pageBackground: "#0f1112" // Overall page background
}
```

**Key Insight:** Your current palette (#ff6b6b coral, #4ecdc4 cyan, #ffe66d yellow) is too warm and saturated. The authentic HAL palette is cooler, darker, more subdued blues/purples.

---

## Implementation Priority for Paperclips

### Already Implemented ✅
- Screen 4 style: Multi-line oscillations (operations/creativity)
- Partial Screen 5: Numeric tables (stats display)

### High Priority (Phase 1 Polish)
1. Screen 2: Numeric matrix for trust/processors/memory
2. Screen 6/8: Text panels for phase/mode indicators
3. Screen 7: Exponential curves for project progress

### Medium Priority (Phase 2 - Space)
1. Screen 1: Orbital plot for space exploration
2. Screen 5: Wireframe surface for resource distribution
3. Screen 3: 3D surface for optimization landscape

### Future Exploration
- Authentic color palette migration
- Perfect square layouts
- Thin-line aesthetic
- Monospace typography throughout


### Colours:
| Tile # | Colour Name    | Hex Value |
| ------ | -------------- | --------- |
| 1      | Rich purple    | `#532B78` |
| 2      | Teal-blue      | `#1C6B74` |
| 3      | White          | `#FFFFFF` |
| 4      | Deep blue      | `#143962` |
| 5      | Grey           | `#6C6C6C` |
| 6      | Mid-grey       | `#7B7B7B` |
| 7      | Very dark navy | `#0A1130` |
| 8      | White          | `#FFFFFF` |
| 9      | Brick red      | `#6B2424` |
| 10     | Violet-purple  | `#54336F` |

