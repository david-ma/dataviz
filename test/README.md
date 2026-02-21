# Dataviz tests

- **`test/`** – Jest + jsdom. Use for chart.ts (DOM-dependent) and utils. Run: `pnpm test`.
- **`tests/`** – Bun. Use for pure data/TS modules (e.g. `tests/streaming.test.ts`). Run: `bun test tests/`.

## chart.ts: what to test

- **Pure helpers** (no DOM): `classifyName`, `mapDistance` – unit tests in `test/chart.test.ts`.
- **Chart constructor and loading**: create a div, `new Chart({ element, loading: true })`, assert skeleton DOM; then `chart.ready(cb)` and assert loading node removed and plot content present.
- **Heavier integration** (decorateTable, full chart methods) would need jQuery + DataTables in jsdom and are not yet covered.

## chart.ts usage (from module JSDoc)

- **Sync:** `new Chart({ element, title, data }).scratchpad((c) => { ... })` when data is already available.
- **Async (no pop-in):** `new Chart({ element, title, loading: true })` (no data); after load, `chart.ready((c) => { ... })`. Data is optional when using `loading: true`.
- Built-in methods: `generalisedLineChart`, `barGraph`, `pieChart`; use `scratchpad()` for custom one-offs.
