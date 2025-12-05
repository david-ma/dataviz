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

