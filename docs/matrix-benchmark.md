# Matrix rain: benchmarking RAM and CPU

Three implementations are available:

| Version | Route | Description |
|--------|--------|-------------|
| **SVG** | `/blog/matrix` | D3 + Chart; one DOM `<text>` per cell (thousands of nodes). |
| **Canvas** | `/blog/matrix_canvas` | Vanilla JS; one `<canvas>`, draw with 2D context. |
| **D3 + Canvas** | `/blog/matrix_d3_canvas` | D3 (selection, `d3.timer`) + Canvas 2D for drawing. |

## In-page overlay (?benchmark=1)

Append `?benchmark=1` to any matrix URL to show a small overlay with:

- **FPS** – frames per second (higher is better).
- **Heap** – JS heap used in MB (Chrome only; may need `--enable-precise-memory-info` or chrome://flags).

Example:  
`/blog/matrix_canvas?benchmark=1`  
`/blog/matrix_d3_canvas?benchmark=1`  
`/blog/matrix?benchmark=1`

Compare the same viewport and let the animation run for 30–60 seconds before reading FPS/heap.

## Chrome DevTools (RAM and CPU)

For more accurate and comparable numbers:

### Memory (RAM)

1. Open Chrome DevTools → **Memory** tab.
2. Take a **Heap snapshot** (or use “Allocation instrumentation…”).
3. Run the matrix for ~30 s, then take another snapshot.
4. Compare **Summary** or **Comparison**: look at “Detached DOM tree” and total heap size.  
   The SVG version will show many more DOM nodes and often higher heap.

### CPU / frame time

1. Open DevTools → **Performance** tab.
2. Click Record, let the matrix run for 10–15 s, stop.
3. In the timeline, check **Main** thread activity and **Frames** (green bars).  
   Lower frame time and fewer long tasks indicate better CPU usage.  
   SVG often has more layout/paint work per frame than canvas.

### Quick comparison

- Open each version in its own tab (same zoom and window size).
- Use **Performance monitor** (DevTools → ⋮ → More tools → Performance monitor) to watch **JS heap size** and **CPU usage** live while switching tabs.

## What to expect

- **SVG**: Most DOM nodes, highest heap, more layout/paint; FPS may drop on large grids.
- **Canvas** and **D3 + Canvas**: One canvas, lower heap, less layout; FPS and CPU should be similar, with canvas-only often slightly lighter (no D3/timer overhead).
