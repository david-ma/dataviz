# Candlestick Chart Implementation

## Overview
Real-time candlestick charts for Universal Paperclips investment engine, using synthetic OHLC data.

## The Problem
Traditional candlestick charts require **OHLC data** (Open, High, Low, Close) per time period, but the game only provides:
- Current price per tick
- No trading sessions
- Continuous price updates

## The Solution: Synthetic OHLC via Bucketing

### Configuration Constants (Easy to Modify)

```typescript
class StockMarketScreen {
  private readonly CANDLE_SIZE = 20    // Ticks per candle (CHANGE THIS)
  private readonly MAX_CANDLES = 30    // Keep last N candles
}
```

**To adjust candle duration:**
- `CANDLE_SIZE = 10` → Faster candles (more volatile looking)
- `CANDLE_SIZE = 20` → Default (good balance)
- `CANDLE_SIZE = 50` → Slower candles (smoother trends)

### How It Works

#### 1. Bucket Prices into Candles
Every `CANDLE_SIZE` ticks, we close the current candle and start a new one:

```typescript
update(data) {
  this.tickCount++
  const shouldCloseCandle = this.tickCount % this.CANDLE_SIZE === 0
  
  data.stocks.forEach(stock => {
    const candle = this.currentCandle.get(stock.id)
    
    // Update OHLC
    candle.high = Math.max(candle.high, stock.price)  // Track max
    candle.low = Math.min(candle.low, stock.price)    // Track min
    candle.close = stock.price                         // Current price
    
    if (shouldCloseCandle) {
      // Save completed candle
      candles.push({ ...candle })
      
      // Start new candle
      this.currentCandle.set(stock.id, {
        open: stock.price,   // New candle opens at current price
        high: stock.price,
        low: stock.price,
        close: stock.price,
        volume: 0
      })
    }
  })
}
```

#### 2. Synthetic Volume
Since the game doesn't expose trading volume, we generate it:

```typescript
// Synthetic volume: jiggle based on price and amount
candle.volume += Math.floor(
  stock.price * 0.1 +                    // Base volume from price
  Math.random() * stock.amount * 0.01    // Random jiggle from shares held
)
```

**Volume formula:**
- Higher priced stocks → higher volume
- More shares held → more volume variation
- Random component adds realistic noise

#### 3. Draw Candlesticks

```typescript
candles.forEach((candle, idx) => {
  const isGreen = candle.close >= candle.open
  const color = isGreen ? green : red
  
  // Wick (high-low line)
  svg.append('line')
    .attr('y1', yScale(candle.high))
    .attr('y2', yScale(candle.low))
  
  // Body (open-close rect)
  svg.append('rect')
    .attr('y', Math.min(yScale(candle.open), yScale(candle.close)))
    .attr('height', Math.abs(yScale(candle.open) - yScale(candle.close)))
    .attr('fill', isGreen ? color : 'none')  // Filled if green, hollow if red
})
```

## Visual Design

### Candlestick Anatomy
```
     |  ← High (wick top)
     |
   ┌───┐
   │   │ ← Body (open to close)
   │   │
   └───┘
     |
     |  ← Low (wick bottom)
```

**Color Coding:**
- **Green (filled)** - Close > Open (price went up)
- **Red (hollow)** - Close < Open (price went down)

### Layout
- **4 stocks per row** - Grid layout
- **30 candles per chart** - ~600 ticks of history (at CANDLE_SIZE=20)
- **Auto-scaling** - Y-axis adjusts to price range
- **Monospace labels** - Technical readout style

## Tuning Parameters

### CANDLE_SIZE (Ticks per Candle)

| Value | Duration @ 100ms | Behavior |
|-------|------------------|----------|
| 10    | 1 second         | Very fast, noisy |
| 20    | 2 seconds        | **Default**, good balance |
| 30    | 3 seconds        | Smoother trends |
| 50    | 5 seconds        | Very smooth, less detail |
| 100   | 10 seconds       | Long-term trends only |

**Recommendation:** Start with 20, adjust based on game speed.

### MAX_CANDLES (History Length)

| Value | Chart Width | Memory |
|-------|-------------|--------|
| 20    | Narrow      | Low    |
| 30    | **Default** | Medium |
| 50    | Wide        | High   |

**Trade-off:** More candles = more history but wider charts.

### Volume Multipliers

```typescript
// Current formula
candle.volume += Math.floor(
  stock.price * 0.1 +              // ← Adjust this (0.05 - 0.2)
  Math.random() * stock.amount * 0.01  // ← Adjust this (0.005 - 0.02)
)
```

**To increase volume variation:**
- Increase random multiplier (0.01 → 0.02)
- Increase price multiplier (0.1 → 0.2)

**To decrease volume noise:**
- Decrease random multiplier (0.01 → 0.005)
- Decrease price multiplier (0.1 → 0.05)

## Data Structures

### Current Candle (In Progress)
```typescript
{
  open: number,    // Price at candle start
  high: number,    // Max price seen
  low: number,     // Min price seen
  close: number,   // Current price
  volume: number   // Accumulated synthetic volume
}
```

### Completed Candles (History)
```typescript
Map<stockId, Array<{
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number
}>>
```

## Performance

### Memory Usage
- **Per stock:** ~30 candles × 5 numbers = 150 numbers
- **5 stocks:** ~750 numbers = ~6KB
- **Negligible** compared to game state

### CPU Usage
- **Per tick:** Update 1 number per stock (close price)
- **Per candle close:** Copy 5 numbers per stock
- **Per draw:** Render ~30 rectangles per stock
- **Minimal** impact on game performance

## Advantages of This Approach

### ✅ Authentic Candlestick Charts
- Real OHLC data structure
- Standard candlestick visualization
- Familiar to anyone who's seen stock charts

### ✅ Configurable Granularity
- Easy to adjust candle duration
- Single constant to change
- No code restructuring needed

### ✅ Automatic Data Management
- Tracks high/low automatically
- Closes candles on schedule
- Cleans up sold stocks

### ✅ Synthetic Volume
- Looks realistic
- Correlates with price and position size
- Adds visual interest

## Limitations

### What We Can't Do
- ❌ **Historical accuracy** - Can't recreate past candles before screen was active
- ❌ **Tick-perfect OHLC** - Only samples at update frequency (100ms)
- ❌ **Real volume** - Game doesn't expose actual trading volume

### What We Accept
- ✅ **Good enough** - Candles accurately represent price movement within bucket
- ✅ **Visually correct** - Charts look like real candlestick charts
- ✅ **Useful** - Shows trends, volatility, and momentum

## Comparison to Real Trading Platforms

### What Real Platforms Have
- **1-minute candles** - Standard minimum
- **Multiple timeframes** - 1m, 5m, 15m, 1h, 1d
- **Real volume** - Actual shares traded
- **Historical data** - Years of past candles

### What We Have
- **20-tick candles** - ~2 seconds at 100ms update rate
- **Single timeframe** - Configurable via CANDLE_SIZE
- **Synthetic volume** - Realistic-looking but artificial
- **Live data only** - No historical reconstruction

### What We Match
- ✅ **Visual appearance** - Looks like real candlestick charts
- ✅ **OHLC structure** - Proper open/high/low/close data
- ✅ **Color coding** - Green up, red down
- ✅ **Trend visibility** - Easy to see price direction

## Future Enhancements

### Easy Additions
1. **Volume bars** - Draw volume histogram below price chart
2. **Moving averages** - Overlay SMA/EMA lines
3. **Grid lines** - Add price level markers
4. **Tooltips** - Show OHLC values on hover

### Medium Complexity
5. **Multiple timeframes** - Switch between 10/20/50 tick candles
6. **Bollinger Bands** - Volatility indicators
7. **RSI indicator** - Momentum oscillator
8. **Zoom/pan** - Interactive chart navigation

### Advanced
9. **Pattern recognition** - Detect doji, hammer, engulfing patterns
10. **Trend lines** - Auto-draw support/resistance
11. **Alerts** - Notify on price breakouts

## Usage Example

```typescript
// In game loop (every 100ms)
stockMarketScreen.update({
  stocks: stocks,        // Current stock array
  bankroll: bankroll,    // Available cash
  portTotal: portTotal   // Total portfolio value
})

// Automatically:
// - Updates current candle OHLC
// - Closes candle every 20 ticks
// - Draws candlestick chart
// - Shows last 30 candles
```

## Conclusion

By bucketing price updates into fixed-size time windows, we create authentic OHLC data that enables traditional candlestick charts. The `CANDLE_SIZE` constant makes it trivial to adjust the time granularity, and synthetic volume adds visual realism.

This approach transforms the game's simple price stream into professional-looking stock charts that would be at home on any trading platform.

**Key insight:** You don't need real trading sessions to make candlestick charts - you just need to bucket continuous data into discrete time periods and track min/max within each bucket.
