# Datasaurus Dozen blog post

Date: 2026-09-06

## Goal

Educational post showing Matejka & Fitzmaurice’s Datasaurus Dozen: identical summary stats, thirteen different scatter plots (including Alberto Cairo’s dinosaur).

## Files

| Path | Role |
|------|------|
| `src/views/content/datasaurus-dozen.hbs` | Page copy + grid + stats host |
| `src/js/datasaurus-dozen.ts` | Load CSV, compute stats, draw Chart/d3 scatters |
| `public/dataviz/datasaurus-dozen.csv` | Committed long-form data (`dataset,x,y`) |
| `config/blogposts.ts` | Catalogue entry (`status: hold`) |

## Design notes

- Uses site `Chart` + `d3` from `./chart` (same pattern as wealth / sixseven), not Chart.js-the-library.
- Data lives under `public/dataviz/` so deploy does not depend on the Dropbox-linked `data/` symlink.
- Post starts as `hold` so the homepage stays clean until a preview PNG exists.

## Operator steps

```bash
cd /usr/local/dev/Thalia/websites/dataviz

# Config catalogue is loaded once — restart thalia-develop after blogposts.ts changes
# (Ctrl-C the existing `bun dev`, then:)
bun dev

# open http://127.0.0.1:1337/blog/datasaurus-dozen
# Expect: stats table + 13 scatter panels (dino first). Not the example 404 fallback.

# After visual check, capture homepage thumb (site must be running):
bun run preview:png datasaurus-dozen

# Then flip status to published in config/blogposts.ts
```

## Known gotcha

If `/blog/datasaurus-dozen` shows the example `#404` page with `<title>datasaurus-dozen</title>`, the running process still has a stale `blogposts` import (JS compiled fine; catalogue entry missing). Restart `bun dev`.

## Source

CSV from [OpenIntro `datasaurus`](https://www.openintro.org/data/index.php?data=datasaurus) (Matejka & Fitzmaurice / Cairo).
