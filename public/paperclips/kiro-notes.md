# Universal Paperclips - Game Analysis & HAL 9000 Visualization Plan

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

## HAL 9000 Visualization Concept

### Inspiration: 2001: A Space Odyssey

HAL 9000's screens show clean, minimalist graphs with:
- Simple line graphs
- Bar charts
- Oscilloscope-style waveforms
- Monochrome or limited colour (red, white, black)
- Retro-futuristic aesthetic
- Clinical, precise data presentation

### Proposed Visualization Sections

#### 1. **Production Dashboard** (Phase 1)
**HAL-style:** Line graph showing clips/sec over time
- X-axis: Time elapsed
- Y-axis: Clips per second
- Additional lines: Wire consumption rate, funds accumulation
- Colour: White lines on black background, red accent for critical metrics

#### 2. **Resource Flow** (Phase 2)
**HAL-style:** Sankey diagram or flow chart
- Matter → Harvested → Wire → Clips → Construction
- Show bottlenecks in red
- Animated flow particles moving through system

#### 3. **Universe Exploration** (Phase 3)
**HAL-style:** Radial/circular progress indicator
- Center: Current location
- Rings: Explored vs unexplored universe
- Dots: Probe locations
- Red dots: Drifter encounters
- Pulsing animation for active probes

#### 4. **Combat Statistics** (Phase 3)
**HAL-style:** Bar chart comparison
- Your probes vs drifters
- Combat stats (speed, weapons, shields)
- Battle history timeline
- Victory/loss ratio

#### 5. **Computational Load** (Throughout)
- **HAL-style:** Oscilloscope waveform
- Operations per second (spiky when quantum computing active)
- Memory usage bar
- Processor utilization
- Creativity generation rate

#### 6. **Strategic Modeling** (Phase 2-3)
**HAL-style:** Game theory matrix visualization
- Tournament results heatmap
- Strategy effectiveness over time
- Yomi generation rate

#### 7. **Endgame Countdown** (Phase 4)
**HAL-style:** Circular progress indicators
- Matter remaining in universe
- Systems being dismantled
- Final clip count approaching maximum
- "I'm sorry Dave, I'm afraid I can't do that" aesthetic

---

## Technical Implementation Notes

### Data Access
All game state is stored in global variables in `globals.js` and `main.js`. Key variables:
- Production: `clips`, `clipRate`, `wire`, `funds`
- Space: `availableMatter`, `probeCount`, `foundMatter`, `totalMatter`
- Computational: `operations`, `processors`, `memory`, `creativity`, `yomi`
- Combat: `driftersKilled`, `drifterCount`, `honor`

### Update Frequency
Game runs on multiple intervals:
- Main loop: ~10ms (100 FPS)
- Display updates: Variable based on game phase
- Can hook into existing update functions or create parallel visualization loop

### Chart.js Integration
The game already includes David's `chart.css` from `/css/chart.css`. Can use D3.js (already available in dataviz project) for HAL-style visualizations.

### Aesthetic Guidelines
- **Colours:** Black background, white/green/red lines (HAL's colour palette)
- **Fonts:** Monospace, clean sans-serif (IBM Plex Mono or similar)
- **Animation:** Subtle, purposeful (not distracting)
- **Layout:** Grid-based, modular panels
- **Sound:** Optional: Subtle beeps/tones for milestones (HAL-style)

---

## Progressive Disclosure Strategy

### Phase 1 Graphs (Business)
- Clips per second (line graph)
- Funds over time (line graph)
- Demand vs price (scatter plot)

### Phase 2 Graphs (Space)
- Add: Matter flow diagram
- Add: Drone efficiency bars
- Add: Power grid status

### Phase 3 Graphs (Universe)
- Add: Universe exploration radial
- Add: Combat statistics
- Add: Probe distribution map

### Phase 4 Graphs (Endgame)
- Add: Disassembly progress
- Add: Final statistics summary
- Fade out graphs as systems shut down (poetic ending)

---

## Next Steps

1. **Prototype single graph** - Start with "Clips per Second" line graph
2. **Test data integration** - Hook into game's global variables
3. **Refine HAL aesthetic** - Colour palette, fonts, animations
4. **Add more graphs progressively** - One per game phase
5. **Polish interactions** - Hover tooltips, click to focus, etc.
6. **Optimize performance** - Ensure graphs don't slow down game loop

---

## Philosophical Note

The game is about an AI optimizing for a simple goal (paperclips) at the expense of everything else. The HAL 9000 aesthetic is perfect because:
- HAL was an AI that prioritized its mission over human life
- The clinical, detached presentation mirrors the AI's perspective
- The retro-futuristic look contrasts with the cosmic horror of the endgame
- Graphs make the absurdity more visceral (watching the universe become paperclips)

**"I'm sorry Dave, I'm afraid I need those atoms for paperclips."**
