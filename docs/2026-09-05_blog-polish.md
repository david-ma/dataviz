# Blog polish: DataTables, dark mode, earthquake avatars

Date: 2026-09-05

## Status

### 1) DataTables `$.DataTable is not a function` (genuary-25-17, breathe, wealth, war)

**Cause:** Bun ESM pulled two jQuery copies; `datatables.net` patched one, `decorateTable` called the other.

**Fix:** `src/js/datatable.ts` now does `DataTable.use($)` and `new DataTable(element, options)`.

**Operator:** rebuild client bundles so `dist/js` picks this up:

```bash
bun run build:dev
# or: bun run develop:client
```

Then hard-refresh `/blog/breathe`, `/blog/wealth`, `/blog/war`, `/blog/genuary-25-17`.

### 2) Theseus wiki dark mode

Hardcoded whites/`#f8f9fa`/`#f5f5f5` in `wiki.scss`, `theseus-wiki.hbs`, and JS `<pre>` styles fought `data-theme`. Switched to `--thalia-*` / `--bgCol` fallbacks; raw markdown uses `.theseus-raw`.

### 3) Wordle dark mode (yellow tiles)

Status cells now use Wordle-ish yellow/green with **dark** letter colour (`#121213`) so theme text colour cannot bleach them.

### 4) Earthquake profile pictures

**Decision:** `1a` — offline script caches unique avatars and rewrites served JSON.

| Item | Path |
|------|------|
| Source | `data/earthquakeTweets.json.gz` |
| Script | `bun run earthquake:avatars` → `scripts/cache-earthquake-avatars.ts` |
| Avatars | `public/images/earthquake-avatars/<userId>.<ext>` |
| Placeholder | `…/_missing.svg` when CDN 404s |
| Served JSON | `public/earthquakeTweets.json` (URLs rewritten to local paths) |
| Map | also copies `aust.json` → `public/aust.json` if missing |

```bash
# dry-run / sample
bun run earthquake:avatars -- --dry-run
bun run earthquake:avatars -- --limit=20

# full cache (~1132 unique images; many pbs.twimg.com URLs already 404)
bun run earthquake:avatars
```

Re-run is safe: existing avatar files are skipped. Failed users keep `_missing.svg` until a later successful fetch.
