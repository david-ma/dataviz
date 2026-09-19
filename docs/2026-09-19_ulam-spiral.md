# Ulam Spiral blog post

Date: 2026-09-19

## Goal

Interactive canvas post for Stanisław Ulam’s prime spiral: integers on a square spiral with primes highlighted, so diagonal patterns are visible.

## Files

| Path | Role |
|------|------|
| `src/views/content/ulam-spiral.hbs` | Page copy + controls + chart host |
| `src/js/ulam-spiral-math.ts` | Pure sieve / spiral / divisor helpers |
| `src/js/ulam-spiral.ts` | Chart/canvas UI + controls |
| `test/ulam-spiral.test.ts` | Pure helpers (sieve, spiral coords) |
| `config/blogposts.ts` | Catalogue entry (`status: hold`) |

## Design notes

- Uses site `Chart` with `renderer: 'canvas'` (same pattern as genuary canvas posts).
- No external dataset — numbers and primes are generated in the browser.
- Post starts as `hold` until a preview PNG exists and visual check is done.
- Controls: odd side length, colour mode (primes / rainbow by value / factor count), optional faint composites.

## Operator steps

```bash
cd /usr/local/dev/Thalia/websites/dataviz   # or this checkout

bun install   # if node_modules missing
bun run build:dev
bun dev
# open http://127.0.0.1:1337/blog/ulam-spiral

# After visual check:
bun run preview:png ulam-spiral
# Then flip status to published in config/blogposts.ts
```

## Status

Implemented on branch `cursor/ulam-spiral-ccca`. PR draft. Catalogue `hold` until preview PNG.

Verified locally: `bun test test/ulam-spiral.test.ts`, `bun run typecheck`, `/blog/ulam-spiral` HTTP 200 with canvas spiral + controls.
