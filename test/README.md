# Dataviz tests

- **`test/`** – Bun unit + site HTTP integration. Run: `bun test` (or `bun run test`).
- **`tests/`** – Extra Bun suites (e.g. `tests/streaming.test.ts`).

## Site HTTP integration

`test/site.integration.test.ts` starts a fresh Thalia server on a random port
(`get-port-please` via `thalia/testing`). It does **not** need MySQL.

Skip with `SKIP_SITE_INTEGRATION=1` when you cannot bind a port.

## chart.ts: what to test

- **Pure helpers** (no DOM): `classifyName`, `mapDistance` – unit tests in `test/chart.test.ts`.
- **Chart constructor and loading**: create a div, `new Chart({ element, loading: true })`, assert skeleton DOM; then `chart.ready(cb)` and assert loading node removed and plot content present.
- **Heavier integration** (decorateTable, full chart methods) would need jQuery + DataTables in jsdom and are not yet covered.

## chart.ts usage (from module JSDoc)

- **Sync:** `new Chart({ element, title, data }).scratchpad((c) => { ... })` when data is already available.
- **Async (no pop-in):** `new Chart({ element, title, loading: true })` (no data); after load, `chart.ready((c) => { ... })`. Data is optional when using `loading: true`.
- Built-in methods: `generalisedLineChart`, `barGraph`, `pieChart`; use `scratchpad()` for custom one-offs.
