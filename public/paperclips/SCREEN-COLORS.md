# HAL Screen Color Mapping

## Authentic HAL Aesthetic Implementation

Each screen now uses a solid background color from the authentic HAL palette, with white text and lines.

## Screen → Color Mapping

| Screen | Background Color | Hex | Purpose |
|--------|-----------------|-----|---------|
| **Production Monitor** | Teal | `#1C6B74` | Production/Engineering data |
| **Phase Indicator** | Purple | `#532B78` | Navigation/Phase status |
| **Numeric Matrix** | Matrix Blue | `#0d2c55` | Computational resources |
| **Quantum Computing** | Violet | `#54336F` | Quantum/Waveforms |
| **Strategic Modeling** | Burgundy | `#6B2424` | Strategic/Combat systems |
| **Computational Telemetry** | Navy | `#143962` | Memory/Computational data |
| **Market Dynamics** | Grey | `#7B7B7B` | Market/Engineering |
| **Stock Market** | Dark Navy | `#0A1130` | Critical financial systems |

## Color Palette Reference

From 2001: A Space Odyssey HAL 9000 interface reference screens:

```typescript
const palette = {
  purple: '#532B78',      // Rich purple (Tile 1 - NAV)
  teal: '#1C6B74',        // Teal-blue (Tile 2 - Engineering)
  navy: '#143962',        // Deep blue (Tile 4 - MEM)
  grey: '#7B7B7B',        // Mid-grey (Tile 6 - Engineering)
  darkNavy: '#0A1130',    // Very dark navy (Tile 7 - NUC)
  burgundy: '#6B2424',    // Brick red (Tile 9 - Strategic)
  violet: '#54336F',      // Violet-purple (Tile 10 - Waveforms)
  matrixBlue: '#0d2c55',  // Matrix screen blue
  
  white: '#FFFFFF',       // All text and lines
  green: '#00FF00',       // Profit/bullish
  red: '#FF0000',         // Loss/bearish
}
```

## Design Principles

### 1. Solid Backgrounds
- Each screen = ONE solid color
- No gradients
- No textures
- Clean, flat design

### 2. White-First
- All text: white
- All lines: white
- All labels: white
- Only use color for semantic meaning (profit/loss)

### 3. Opacity Variations
```typescript
'rgba(255,255,255,0.95)'  // Primary text/lines
'rgba(255,255,255,0.65)'  // Secondary labels
'rgba(255,255,255,0.06)'  // Grid lines
```

### 4. Typography
- **Monospace** (Fira Mono, Consolas) - All data, numbers, labels
- **Sans-serif** (Inter, Segoe UI) - Large titles, phase words

### 5. Line Weights
- 1-2px for data lines
- 1px for grid lines
- Thin, precise aesthetic

## Screen-Specific Notes

### Production Monitor (Teal)
- 4 line graphs: clips, funds, wire, inventory
- White lines on teal background
- Monospace labels for all data

### Phase Indicator (Purple)
- Large centered word: "BIZ" or "MFG"
- Small label: "PHASE: 01"
- Sans-serif for big word, monospace for label

### Numeric Matrix (Matrix Blue)
- 5 rows of data
- Monospace font throughout
- White text on dark blue

### Quantum Computing (Violet)
- Quantum noise waveform
- White oscilloscope-style line
- Operations count in monospace

### Strategic Modeling (Burgundy)
- Strategy buttons
- Tournament grid
- Payoff matrix
- All white text on burgundy

### Computational Telemetry (Navy)
- Operations and Creativity waveforms
- White lines with glow effect
- Trust/Processors/Memory stats

### Market Dynamics (Grey)
- Revenue (area chart)
- Price (line)
- Demand (line)
- All white lines on grey

### Stock Market (Dark Navy)
- 3x2 grid layout
- Candlestick charts
- Green/red for profit/loss
- White labels

## Visual Hierarchy

### Primary Elements (Bright)
- Data lines: `rgba(255,255,255,0.95)`
- Main labels: `rgba(255,255,255,0.9)`
- Current values: `rgba(255,255,255,0.95)`

### Secondary Elements (Dimmed)
- Axis labels: `rgba(255,255,255,0.65)`
- Grid lines: `rgba(255,255,255,0.06)`
- Background elements: `rgba(255,255,255,0.15)`

### Semantic Colors (Only When Needed)
- Profit/Gain: `#00FF00` (green)
- Loss/Alert: `#FF0000` (red)
- Neutral: `#FFFFFF` (white)

## Comparison to Previous Design

### Before (v1.0.17)
- Mixed background colors
- Colored lines (cyan, yellow, red)
- Inconsistent color usage
- Gradient backgrounds in some screens

### After (v1.0.19)
- Solid background per screen
- White lines everywhere
- Color only for semantic meaning
- Authentic HAL aesthetic

## Implementation

Each screen sets its background in the constructor:

```typescript
class ProductionMonitorScreen extends HalScreen {
  constructor(opts: { container: string; colors: any }) {
    super({
      id: 'hal-production-monitor',
      container: opts.container,
      width: 800,
      height: 600,
      colors: opts.colors
    })
    this.svg.style('background', this.colors.teal)  // Solid color
  }
}
```

All text and lines use white:

```typescript
svg.append('text')
  .attr('fill', this.colors.white)  // or 'rgba(255,255,255,0.9)'
  .attr('font-family', 'Consolas, "Fira Mono", monospace')
  .text('LABEL')

svg.append('path')
  .attr('stroke', 'rgba(255,255,255,0.95)')
  .attr('stroke-width', 1.1)
```

## Future Enhancements

### Potential Additions
- Subtle rounded corners (9px border-radius)
- Box shadows for depth
- Smooth transitions between screens
- Hover effects on interactive elements

### Maintain Principles
- Keep solid backgrounds
- Keep white-first design
- Keep thin lines
- Keep monospace for data

## References

- `/screens/9-tiles.html` - Master reference with 10 panel types
- `/screens/11-polar-chart-multi-curve-chart.html` - Polar and multi-curve examples
- `HAL-SCREENS-REFERENCE.md` - Detailed analysis of reference screens
- `implementation-plan.md` - Updated HAL-Style Aesthetic section

## Version History

- **v1.0.19** - Implemented authentic HAL backgrounds (all screens)
- **v1.0.18** - Added authentic color palette
- **v1.0.17** - Candlestick charts
- **v1.0.15** - Class-based architecture
