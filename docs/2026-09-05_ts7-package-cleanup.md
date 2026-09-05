# Package cleanup + TypeScript 7

Date: 2026-09-05

## Intent

Pin **TypeScript 7.0.2**, refresh remaining deps, and drop packages that nothing imports anymore.

## Removed (unused or obsolete)

| Package | Why |
|---------|-----|
| `amdefine` | No imports |
| `mime` | No imports (Thalia serves types) |
| `http-proxy` | No imports |
| `formidable` | No imports |
| `mustache` | Only `.mustache` filenames; Thalia/Handlebars renders them |
| `socket.io` | No server wiring; only leftover demo script tags |
| `d3-cloud` | Not imported (old paperclips bundles are self-contained) |
| `tabletojson` | No imports |
| `ts-node` | Replaced by Bun |
| `@webgpu/types` | Conflicts with TS 7 DOM WebGPU libs |
| `@types/d3-cloud` | Follows `d3-cloud` removal |

## Kept / bumped

- **Pinned:** `typescript@7.0.2`
- **Majors avoided on purpose:** `jquery` stays on 3.x; `datatables.net` stays on 2.x (3.x / jQuery 4 are breaking)
- **Updated:** Rapier → 0.20, Three → 0.185 (+ matching `@types/three`), `@types/node` → 22.x, `sass`, `axios`, `lodash`, `csv`, etc.
- `@types/jquery` moved to `devDependencies`
- `thalia` still `github:david-ma/Thalia`

## tsconfig

- Already on `moduleResolution: "bundler"` (no `baseUrl`)
- Dropped `@webgpu/types` from `compilerOptions.types`
- Removed dead `ts-node` block from `config/tsconfig.json`

## Operator steps

```bash
cd /usr/local/dev/Thalia/websites/dataviz
bun install
bun run typecheck
bun test
bun run build:dev
```

Expect typecheck to still report many pre-existing `src/` errors under TS 7; that is separate from the dependency cleanup. Rapier 0.20 may need small API fixes in genuary/blocks if the build complains.

## Optional follow-ups

- Delete or rewrite `src/views/content/socket.mustache` / `awesome.mustache` socket script tags
- Modernise scrape scripts off deprecated `request` (not currently a direct dep)
- Chip away at TS 7 typecheck failures, or gate CI until green
