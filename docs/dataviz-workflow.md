# Dataviz workflow

Idea → sandbox → publish → lessons → upstream Chart → re-check published.

## Status (`config/blogpost-types.ts`)

| status | Homepage / nav / sitemap /viz | Public `/blog/:id` | CI smoke |
|--------|-------------------------------|--------------------|----------|
| `published` | yes | yes | yes |
| `hold` | no | yes (if template exists) | skip strict |
| `private` | no | yes (if template exists) | skip |
| `archived` | no | yes (if template exists) | skip Chart regression |

Only `status === 'published'` is listed. Any other status is omitted from listing surfaces.

`tier: 'core'` marks Chart regression priorities (georgia, earthquake, winamp, matrix, breathe, war).

Canonical catalogue: `config/blogposts.ts`.

## Homepage grid

Single flat card grid (no featured row, no category hubs). Breakpoints (BS3 + BootstrapXL):

| Viewport | Cards/row |
|----------|-----------|
| ≥1600px (`col-xl-2`) | 6 |
| ≥1200px (`col-lg-3`) | 4 |
| ≥992px (`col-md-4`) | 3 |
| ≥768px (`col-sm-6`) | 2 |
| \<768px (`col-xs-12`) | 1 |

## Themes

Thalia binary light/dark: `theme-boot` + `theme-toggle binary=true` in wrappers/nav. CSS: `/css/thalia-themes.css` plus chrome tokens in `thalia.scss` / `dataviz.scss`.

## Preview PNGs

```bash
# Operator installs once:
bun add -d playwright
bunx playwright install chromium

# Site must be running, then:
bun run preview:png georgia
bun run preview:png --missing
bun run preview:png --all
```

Writes `public/images/<file>` matching each post’s `image` field. Backfill existing production thumbs with curl if needed (see `docs/2026-09-05_homepage-grid-themes.md`).

## Chart modules (upstream-oriented)

| Module | Role |
|--------|------|
| `src/js/chart.ts` | Slim stage: SVG/canvas, margins, `scratchpad` / `ready`, nav/export |
| `src/js/chart-map.ts` | `MapChart` + `mapDistance` / geo types |
| `src/js/chart-extras.ts` | Legacy treemap / `generalisedLineChart` for archived posts |
| `src/js/datatable.ts` | Tables |

New posts: **scratchpad first**. Upstream into `chart.ts` only when a second post needs the same pattern, with a test.

## After Chart changes

```bash
bun run typecheck
bun run test
bun run build:dev   # → dist/js (gitignored)
bun run preview     # production node_env so Thalia serves dist JS
# spot-check /blog/georgia /blog/earthquake /blog/winamp /blog/matrix /blog/breathe /blog/war + one genuary
# Rapier: /blog/genuary-25-06 — see docs/2026-08-10_bun-build.md
```
