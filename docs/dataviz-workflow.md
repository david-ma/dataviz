# Dataviz workflow

Idea → sandbox → publish → lessons → upstream Chart → re-check published.

## Status (`config/blogpost-types.ts`)

| status | Listed on `/viz` | Public `/blog/:id` | CI smoke |
|--------|------------------|--------------------|----------|
| `published` | yes | yes | yes |
| `hold` | no | WIP / soft | skip strict |
| `private` | no | unlisted | skip |
| `archived` | no | may 404 | skip |

`tier: 'core'` marks Chart regression priorities (georgia, earthquake, winamp, matrix, breathe, war).

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
bunx webpack --mode development --config webpack.config.js
# spot-check /blog/georgia /blog/earthquake /blog/winamp /blog/matrix /blog/breathe /blog/war + one genuary
```
