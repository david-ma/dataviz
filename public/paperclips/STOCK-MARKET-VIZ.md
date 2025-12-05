# Stock Market Visualization

## Overview
Real-time visualization of the Universal Paperclips investment engine minigame.

## Data Available

### From Game State
```javascript
stocks = [
  {
    id: number,        // Unique stock ID
    symbol: string,    // 1-4 letter ticker (e.g., "AAPL", "GME")
    price: number,     // Current price per share
    amount: number,    // Number of shares owned
    total: number,     // Current total value (price × amount)
    profit: number,    // Cumulative profit/loss
    age: number        // How long held
  }
]
bankroll: number      // Available cash
portTotal: number     // Total portfolio value
investLevel: number   // Investment engine upgrade level
```

### Price Updates
- Prices update every tick (game loop)
- Random walk: `price ± random(price / (4 × riskiness))`
- Gain probability based on `stockGainThreshold` (improves with upgrades)

## Visualization Type: Sparkline Dashboard

### Why Not Candlestick Charts?
**Candlestick charts require OHLC data:**
- Open, High, Low, Close prices per time period
- Game only provides current price per tick
- No concept of trading sessions or time periods

**What we have:**
- Continuous price stream
- No session boundaries
- Stocks bought/sold at any time

### What We Implemented Instead

**Sparkline Dashboard** - Mini line charts for each stock showing:
1. **Stock Symbol** - Ticker (e.g., "AAPL")
2. **Current Price** - Real-time price
3. **Profit/Loss** - Cumulative gain/loss (color-coded)
4. **Price History** - 50-tick sparkline showing price movement
5. **Portfolio Stats** - Cash and total portfolio value

### Visual Design
- **Grid layout** - 4 stocks per row
- **Color coding:**
  - Green (secondary color) = Profitable position
  - Red (tertiary color) = Losing position
  - Cyan (primary color) = Stock symbol
- **Sparklines** - Smooth monotone curves showing price trends
- **Monospace font** - Technical readout style

## Alternative Stock Market Visualizations

### 1. Line Chart (Time Series)
**What it shows:** Price over time for single stock
**Data needed:** Price history (✅ we have this)
**Use case:** Detailed view of one stock's performance
**Implementation:** Similar to our sparklines but larger

### 2. Candlestick Chart
**What it shows:** OHLC data per time period
**Data needed:** Open, High, Low, Close per session (❌ we don't have this)
**Use case:** Traditional stock trading analysis
**Why not:** Game doesn't have session boundaries or OHLC data

### 3. Portfolio Composition (Pie/Donut Chart)
**What it shows:** Percentage of portfolio in each stock
**Data needed:** Stock totals (✅ we have this)
**Use case:** See portfolio diversification
**Implementation:** Could add as secondary visualization

### 4. Profit/Loss Bar Chart
**What it shows:** Cumulative gains/losses per stock
**Data needed:** Profit field (✅ we have this)
**Use case:** Quick comparison of winners vs losers
**Implementation:** Could add as secondary visualization

### 5. Volume Chart
**What it shows:** Number of shares traded over time
**Data needed:** Transaction history (❌ we don't track this)
**Use case:** See trading activity
**Why not:** Game doesn't expose buy/sell events to us

### 6. Moving Average Overlay
**What it shows:** Smoothed price trend
**Data needed:** Price history (✅ we have this)
**Use case:** Identify trends vs noise
**Implementation:** Could add to sparklines

### 7. Bollinger Bands
**What it shows:** Price volatility bands
**Data needed:** Price history + standard deviation (✅ we can calculate)
**Use case:** See if price is at extremes
**Implementation:** Advanced, could add later

### 8. Heatmap
**What it shows:** All stocks' performance at a glance
**Data needed:** Profit/loss per stock (✅ we have this)
**Use case:** Quick overview of portfolio health
**Implementation:** Color-coded grid

## Current Implementation Details

### Update Frequency
- Updates every 100ms (same as main HAL dashboard)
- Tracks last 50 price points per stock
- Automatically cleans up history for sold stocks

### Performance
- Efficient Map-based price history storage
- Only stores active stocks
- Minimal memory footprint (~50 numbers per stock)

### Integration
- Appears when `investLevel > 0` (investment engine unlocked)
- Positioned in HAL dashboard flow
- Registered with `HalScreenManager`
- Accessible via `window.halScreens`

## Future Enhancements

### High Priority
1. **Portfolio Composition Pie Chart** - Show diversification
2. **Total Profit/Loss Trend** - Track overall portfolio performance over time
3. **Moving Average Lines** - Add trend indicators to sparklines

### Medium Priority
4. **Heatmap View** - Color-coded grid of all stocks
5. **Volatility Indicators** - Show which stocks are most volatile
6. **Buy/Sell Signals** - Visual indicators when stocks are bought/sold

### Low Priority
7. **Bollinger Bands** - Advanced technical analysis
8. **Correlation Matrix** - Show which stocks move together
9. **Risk Metrics** - Sharpe ratio, max drawdown, etc.

## Technical Notes

### Why Sparklines?
- **Space efficient** - Show many stocks at once
- **Trend focused** - Easy to see if price is rising/falling
- **Real-time friendly** - Updates smoothly without redrawing entire chart
- **Familiar pattern** - Used in financial dashboards everywhere

### Data Limitations
The game's stock market is intentionally simple:
- No order book or market depth
- No bid/ask spread
- No trading volume
- No market hours or sessions
- Instant execution at current price

This means traditional trading visualizations (candlesticks, volume bars, order flow) don't apply. Our sparkline approach matches the game's simplicity while providing useful visual feedback.

## Comparison to Real Stock Charts

### What Real Trading Platforms Show
- **Candlestick charts** - OHLC data per time period
- **Volume bars** - Trading activity
- **Order book** - Pending buy/sell orders
- **Level 2 data** - Market depth
- **Technical indicators** - RSI, MACD, Bollinger Bands

### What We Can Show
- **Price trends** - Sparklines showing movement
- **Profit/loss** - Cumulative gains/losses
- **Portfolio value** - Total holdings
- **Position size** - Number of shares

### What We Can't Show (Game Limitations)
- ❌ Candlesticks (no OHLC data)
- ❌ Volume (no transaction history)
- ❌ Order book (instant execution)
- ❌ Market depth (no pending orders)
- ❌ Intraday patterns (no time sessions)

## Conclusion

Our sparkline dashboard is the optimal visualization for Universal Paperclips' stock market because:
1. ✅ Matches available data (price stream)
2. ✅ Shows multiple stocks simultaneously
3. ✅ Updates in real-time
4. ✅ Provides actionable information (trends, profit/loss)
5. ✅ Fits HAL 9000 aesthetic (technical readout style)

For a more sophisticated stock market game with OHLC data and trading sessions, candlestick charts would be appropriate. But for this game's simple random-walk price model, sparklines are perfect.
