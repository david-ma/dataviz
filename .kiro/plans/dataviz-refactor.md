## Dataviz and Breathe refactor notes

Context
- Reviewed `breathe.ts` breathing polygons sketch and `breathe.mustache` UI. Linked references to keep handy: `/usr/local/dev/Thalia/.cursor/rules/david-coding-style.md`, `/usr/local/dev/scripts/.kiro/product.md`, `/usr/local/dev/scripts/.kiro/tech.md`, `/usr/local/dev/scripts/.kiro/structure.md`.
- Identified UX/logic bugs: tab toggle flips all panes (can leave none selected), invalid `<input>` markup around range sliders (nested divs inside `input`), transitions can be interrupted by slider changes leaving polylines hidden, redundant enter/exit joins.
- Improvement ideas: wrap state into a controller to avoid cross-listener races; use `selection.join` for polyline/polygon updates; reset display/points before restarting animation; migrate shared geometry/color helpers up toward `chart.ts`.

Types cleanup (quick wins)
- In `breathe.ts`: add param types for `modifiedSpeed(i: number)`, `callDraw(i: number)`, `callReverse(i: number)`, `updatePolylines(d: DataPoint, i: number, nodes: SVGPolylineElement[])`, `updatePolygons(d: DataPoint, i: number, nodes: SVGPolygonElement[])`; type `TimingRow` for `calculateTimingData`; type `currentTransition` as `d3.Selection<SVGPolylineElement, DataPoint, HTMLElement, unknown> | null`; type `dataTable` as `DataTables.Api<TimingRow>`.
- In `chart.ts`: low-risk tightening of helpers (`injectStyles(rule: string)`, `log(message: string)`, `sumBySize`, `sumByCount`, `mapDistance`, `deg2rad`), and narrow `projection?: d3.GeoProjection`, `calculate?: (chart: Chart, marker: Coordinates) => Coordinates[]` where known. Leave broad surfaces (`opts`, `data`, selection fields) for a wider refactor to avoid breaking callers.

Testing guidance (AI-friendly, lighter than full Puppeteer)
- Serve the page locally with Bun: `bunx serve ./public` (or project-specific dev script) to expose the built assets.
- Use Playwright’s lean CLI for headless checks and screenshots: `bunx playwright install chromium --with-deps` once, then `bunx playwright codegen http://localhost:3000` or a small script that loads `/breathe`, waits for `.polyline`, and asserts counts/attributes. Playwright is reliable and scriptable; it’s a smaller surface than a custom Puppeteer harness.
- For logic-only checks (geometry, timing), add unit tests with `vitest` + `happy-dom/jsdom` to exercise functions without spinning a browser, then reserve Playwright for DOM/animation smoke tests.

Build + infra simplification
- Current: legacy gulp -> webpack; goal: Bun build. Short term keep webpack stable and trim unused loaders/plugins. Near term: prototype `bun build src/js/breathe.ts --outdir=public/js --sourcemap` and a static serve (`bunx serve public`). Check asset pipeline (CSS/images), mustache handling, and aliases; drop webpack-only shims if not needed.
- Avoid env-specific behavior: dev/prod should differ mainly by minification; no DB gating.

Database stance
- Dataviz should be static: remove drizzle/sequelize/sqlite usage entirely unless we explicitly add an editing feature. Datasets should live as static JSON/TS modules imported at build time.
- Action items: find and delete DB init and `NODE_ENV=production` gates; replace DB reads with static imports; update docs to state “no DB required”. If future in-browser editing is desired, handle via a separate thin API/feature flag, not the base runtime.

