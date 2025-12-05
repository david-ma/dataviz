# HAL Visualization Dev Mode

## Quick Toggle

**Location:** `/usr/local/dev/Thalia/websites/dataviz/src/js/paperclips/hal-viz.ts`

```typescript
const DEV_MODE = true   // Show all screens regardless of game state
const DEV_MODE = false  // Show screens only when unlocked in game
```

## What Dev Mode Does

When `DEV_MODE = true`, all screens are visible immediately, regardless of game progression:

### Always Visible (No Conditions)
- ✅ Production Monitor (clips, funds, wire, inventory)
- ✅ Phase Indicator (BIZ/MFG)
- ✅ Revenue Chart (if avgRev > 0)
- ✅ World Map (if marketing > 0)

### Conditional → Always Visible in Dev Mode

| Screen | Normal Trigger | Dev Mode |
|--------|---------------|----------|
| **Computational Telemetry** | `trust > 0` | Always shown |
| **Numeric Matrix** | `trust > 0` | Always shown |
| **Quantum Computing** | `operations > 0` | Always shown |
| **Stock Market** | `stocks.length > 0` | Always shown (empty state) |
| **Strategic Modeling** | `yomi > 0` | Always shown |

## Why Use Dev Mode?

### For Development
- ✅ See all screens without playing through game
- ✅ Test visual layouts immediately
- ✅ Debug screen positioning and sizing
- ✅ Verify color schemes and fonts

### For Screenshots
- ✅ Capture all screens at once
- ✅ Show full dashboard capabilities
- ✅ Create documentation images

### For Testing
- ✅ Test screen interactions without game state
- ✅ Verify screen manager registration
- ✅ Check console logs for all screens

## Console Output

With dev mode enabled, you'll see:

```
[HAL-VIZ] Version: v1.0.17-candlestick-charts-20251205-1525
[HAL-VIZ] Dev Mode: true
[HalScreen] Registering screen: hal-production-monitor
[HalScreen] Registering screen: hal-phase-indicator
[HalScreen] Registering screen: hal-computational-telemetry
[HalScreen] Registering screen: hal-numeric-matrix
[HalScreen] Registering screen: hal-quantum-computing
[HAL-VIZ] Stock market screen created
[HAL-VIZ] Stock market: No stocks yet (showing empty state)
[HalScreen] Registering screen: hal-stock-market
[HalScreen] Registering screen: hal-strategic-modeling
```

## Empty State Behavior

When screens are shown in dev mode but have no data:

### Stock Market Screen
- Shows "NO ACTIVE POSITIONS" message
- Displays portfolio stats (all zeros)
- Screen is visible but empty

### Strategic Modeling Screen
- Shows strategy buttons (not functional without game state)
- Tournament grid is empty
- Payoff matrix shows zeros

### Quantum Computing Screen
- Shows waveform with zero amplitude
- Operations count shows 0

### Numeric Matrix Screen
- Shows all metrics as 0
- Labels are visible
- Structure is correct

## Production Mode

When `DEV_MODE = false`, screens appear progressively as you unlock features:

1. **Start** → Production Monitor, Phase Indicator
2. **Buy Wire** → Revenue Chart appears
3. **Unlock Trust** → Computational Telemetry, Numeric Matrix
4. **Unlock Quantum Computing** → Quantum Computing screen
5. **Unlock Investment Engine** → Stock Market screen (when you buy stocks)
6. **Unlock Strategic Modeling** → Strategic Modeling screen

## Switching Modes

### To Enable Dev Mode
1. Open `src/js/paperclips/hal-viz.ts`
2. Change `const DEV_MODE = false` to `const DEV_MODE = true`
3. Run `npx webpack --mode production`
4. Refresh browser

### To Disable Dev Mode
1. Open `src/js/paperclips/hal-viz.ts`
2. Change `const DEV_MODE = true` to `const DEV_MODE = false`
3. Run `npx webpack --mode production`
4. Refresh browser

## Runtime Inspection

Even in production mode, you can inspect screens at runtime:

```javascript
// In browser console
window.halScreens.reportCard()

// Output:
// [HalScreenManager] Registered screens:
//   - hal-production-monitor (visible)
//   - hal-phase-indicator (visible)
//   - hal-computational-telemetry (visible)
//   - hal-numeric-matrix (visible)
//   - hal-quantum-computing (visible)
//   - hal-stock-market (visible)
//   - hal-strategic-modeling (visible)
```

## Best Practices

### During Development
- ✅ Keep `DEV_MODE = true` while working on visualizations
- ✅ Test with real game state before committing
- ✅ Check console for registration messages

### Before Committing
- ✅ Set `DEV_MODE = false` for production
- ✅ Test progressive reveal works correctly
- ✅ Verify no console errors

### For Demos
- ✅ Use `DEV_MODE = true` to show all features
- ✅ Explain which screens are normally hidden
- ✅ Show progression in separate demo

## Troubleshooting

### Screen Not Showing in Dev Mode
1. Check console for registration message
2. Verify screen is instantiated in update loop
3. Check if screen has `display: none` CSS
4. Inspect `window.halScreens.reportCard()`

### Screen Shows Empty in Dev Mode
- This is expected! Screen needs game data to populate
- Check "NO ACTIVE POSITIONS" or similar messages
- Verify screen structure is correct (labels, axes, etc.)

### Dev Mode Not Working
1. Verify `DEV_MODE = true` in source file
2. Rebuild with webpack
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
4. Check console for version number

## Version History

- **v1.0.17** - Added dev mode flag and stock market screen
- **v1.0.15** - Converted all screens to class-based architecture
- **v1.0.13** - Added screen manager and global registry

## Related Files

- `src/js/paperclips/hal-viz.ts` - Main visualization code
- `public/paperclips/STATUS.md` - Development status
- `public/paperclips/CANDLESTICK-IMPLEMENTATION.md` - Stock market details
