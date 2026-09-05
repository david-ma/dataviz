# Homepage grid, listing model, themes, preview PNGs

**Branch:** `bun` · **Date:** 2026-09-05 · **Status:** plan only (no implementation yet)

Production reference: [https://dataviz.david-ma.net/](https://dataviz.david-ma.net/)

---

## Problem

- **Observed:** This branch’s homepage split (`featuredPreviews` + `vizPreviews`) diverges from production’s single card grid. Genuary posts are excluded from the main grid. Preview images under `public/images/` are almost absent locally (4 files; production serves `georgia.png`, `matrix.jpg`, etc.). Layout still uses the custom Bootstrap 3 + `BootstrapXL` wrappers, but the homepage template no longer matches the sidebar + grid composition.
- **Expected:** One large list of published posts as cards; classic sidebar + responsive Bootstrap grid (up to **6** columns on extra-large); light/dark theme toggle; `config/blogposts.ts` as sole listing/publish source; easier PNG preview generation; publish Theseus Wiki + Wordle; keep Statues off the public list; each Genuary day as its own card.
- **Evidence:** Production HTML uses a single `#vizPreviews` row with `col-xl-3 col-lg-4 col-md-6 col-xs-12`, sidebar `col-md-2 col-sm-3`, content `col-sm-9`. Branch `homepage.hbs` adds featured row + filters genuary out of `blogposts`. Controller builds `featuredBlogposts` separately. `public/images/` lacks the card thumbnails production serves.
- **Scope / not in scope:** Homepage + listing/nav behaviour, blogpost status semantics, theme toggle on site chrome, preview PNG workflow. Not: finishing Statues content, Chart upstream, Bootstrap 5 migration of the whole site, full Thalia wrapper adoption.

---

## Current state

- **Current handling:**
  - Canonical metadata already lives in `config/blogposts.ts` + `config/blogpost-types.ts` (`status`, optional `featured`, `tier`).
  - Homepage controller (`config/controllers/blog.ts`) splits `featured` vs non-featured and drops `category === 'Genuary 2025'` from the main grid.
  - `/blog/:shortname` only resolves posts with `status === 'published'` (`isListed`). Non-listed posts 404 even when a content template exists — so “unlisted but reachable by URL” is **not** implemented yet.
  - Layout: site-owned `wrapper.hbs` / `blog.hbs` + `partials/nav.hbs` (BS3 classes). Framework Thalia wrapper is BS5 + themes; dataviz does not use it for these pages.
  - `partials/darkMode.hbs` exists (binary light/dark via `localStorage.theme` + `data-theme`) but is **not** included from `wrapper.hbs` / `blog.hbs`.
  - Thalia ships `theme-boot` / `theme-toggle` (`thalia-theme`, packs + `binary=true`), documented in framework `docs/guides/themes.md`.
  - Preview images: manual; entries point at `images/….png|jpg` (and sometimes `image_url` SmugMug). Local `public/images/` is incomplete vs production.
- **Workarounds:** Hotlink/production assets; SmugMug `image_url` for Theseus; featured row as a stand-in for “important” posts.
- **Cost of inaction:** Broken/empty cards locally; wrong IA vs production; Genuary invisible on homepage; no sustainable publish pipeline for new posts.

---

## Ideal solution

- Single homepage grid of every **listed** post, newest first (or explicit sort key), including each Genuary day.
- Sidebar + main column clearly from Bootstrap grid; at **≥1600px (`col-xl` via BootstrapXL)** show **6** cards per row; then 4 → 3 → 2 → 1 as viewport shrinks; sidebar collapses on xs (existing mobile nav).
- One status model: listed on homepage/nav vs unlisted-but-servable by direct URL vs truly unavailable.
- One command: `bun run preview:png <shortname>` (or all missing) → screenshot live post → write `public/images/<shortname>.png` → entry already references that path (or script prints the `image:` line to paste).
- Theme: first-class light/dark on homepage and blog chrome without fighting viz canvases.

---

## Real solution

- **Chosen approach (proposed):**
  1. **Restore single grid** — rewrite `homepage.hbs` to one `#vizPreviews` row; drop `featured` from homepage rendering (and stop filtering genuary out of the grid). Align card classes to: `col-xl-2 col-lg-3 col-md-4 col-sm-6 col-xs-12` (6 / 4 / 3 / 2 / 1 with current BootstrapXL breakpoints). Keep sidebar/content column classes aligned so `2+10` or `3+9` always sum to 12.
  2. **`blogposts.ts` as source of truth** — controller helpers: `listedPosts()` for homepage/nav/grid; `resolvablePosts()` (listed + unlisted) for `/blog/:id`. Remove homepage dependence on `featured`. Optionally deprecate `featured` or keep only for future editorial use (not layout).
  3. **Publish set (this pass):**
     - **Published / listed:** existing core posts + Theseus Wiki + Wordle + each Genuary day (`genuary-25-*`).
     - **Not listed:** Statues → `hold` (or unlisted) until ready.
     - **Hub page `/blog/genuary`:** decide listed vs unlisted (see interview) — content can remain.
     - **Archived** (`AusIncome`, `sixseven`): stay off homepage unless we explicitly republish AusIncome to match production.
  4. **Unlisted URLs:** extend blog controller to serve posts that have a template when status is in `{published, unlisted|private|hold?}` per decided vocabulary; exclude non-listed from homepage, sidebar lists, and `/viz`.
  5. **Themes:** prefer **binary light/dark** on dataviz chrome. Realistic options (interview): wire Thalia `theme-boot` + `theme-toggle binary=true` into site wrappers and map dataviz SCSS to scheme tokens; **or** include/adapt existing `darkMode.hbs` and keep site CSS variables. Do not force full Thalia theme palette on this site in v1.
  6. **PNG previews:** add an operator-run script (Playwright or Puppeteer — **operator installs** the browser deps; agent does not). Flow: ensure `thalia-develop` is up → navigate `/blog/<shortname>` → wait for canvas/SVG settle → clip main viz → write `public/images/<shortname>.png`. Document restoring existing thumbs from production (`curl` once) so the repo is self-contained again. Keep `image:` in `blogposts.ts` pointing at local public paths; `image_url` optional for OG/SmugMug only.
- **Why not the ideal:** Full Thalia BS5 wrapper rewrite is out of scope; screenshot automation won’t be pixel-perfect for every generative piece without per-post wait hooks; CI won’t run headed browsers by default.
- **Non-goals:** Migrating all pages off BS3; finishing Statues; auto-uploading every PNG to SmugMug; regenerating every historical JPG as PNG.
- **Risks / follow-ups:**
  - Missing images make the grid look “broken” even after layout fix — restore/generate early.
  - Generative/WebGL posts need settle delays or a `?preview=1` hook later.
  - Theme toggle must not break Matrix/header imagery or D3 canvases (toggle chrome colours only first).
  - Status rename may touch tests / CI gates (`isCiStrict`, `isListed`).

---

## Breakpoints (Bootstrap 3 + BootstrapXL)

Site already loads `BootstrapXL.css`: `col-xl-*` applies at **min-width 1600px**.

| Viewport | Intended cards/row | Classes (proposed) |
|----------|--------------------|--------------------|
| ≥1600px (xl) | 6 | `col-xl-2` |
| ≥1200px (lg) | 4 | `col-lg-3` |
| ≥992px (md) | 3 | `col-md-4` |
| ≥768px (sm) | 2 | `col-sm-6` |
| \<768px (xs) | 1 (+ no sidebar) | `col-xs-12` |

Production today: `col-xl-3 col-lg-4 col-md-6 col-xs-12` → 4 / 3 / 2 / 1 (no dedicated sm; md covers 2-col). Proposed adds sm=2 and xl=6.

Sidebar: keep `col-md-2 col-sm-3 col-xs-12 hidden-xs`; main: `col-xs-12 col-sm-9 col-md-10` so columns sum correctly.

---

## Listing / status model (draft)

Reuse existing statuses where possible; clarify “unlisted”:

| Intent | Proposed `status` | Homepage / nav | Direct `/blog/:id` |
|--------|-------------------|----------------|--------------------|
| Public | `published` | yes | yes |
| Shareable WIP / ready but not listed | `unlisted` **or** reuse `private` | no | yes |
| Broken / not for visitors | `hold` | no | yes for author? or 404 — decide |
| Frozen / may break | `archived` | no | optional serve |

**This pass publish flags (intended):**

| shortname | Action |
|-----------|--------|
| `theseus-wiki` | listed (`published`) |
| `wordle` | **add entry** + listed (`published`) — template `wordle.mustache` exists |
| `statues` | **unlist** (`hold` / unlisted) — not ready |
| `genuary-25-*` | each listed; each gets a grid card |
| `genuary` hub | TBD (interview) |
| `featured` field | stop driving layout |

---

## Preview PNG workflow (draft)

1. **Backfill:** Operator pulls existing production thumbs into `public/images/` (one-shot), commit binaries.
2. **Script:** `scripts/capture-preview.ts` (name TBD) — args: shortname(s) or `--missing`.
3. **Operator deps:** install Playwright (or chosen tool) when ready; document exact `bun add -d …` / `bunx playwright install` in this diary.
4. **Convention:** default output `public/images/<shortname>.png`; `blogposts.ts` `image: 'images/<shortname>.png'`.
5. **Optional later:** `?preview=1` query to pause animations / hide chrome for cleaner shots.

---

## Themes (draft)

- Add toggle to homepage + blog chrome (header or sidebar).
- v1: binary light ↔ dark only.
- Map homepage/sidebar/preview borders/backgrounds to CSS variables; leave viz canvases alone unless a post already themes itself.
- Storage key: align with chosen approach (`thalia-theme` vs legacy `theme`) to avoid two competing boot scripts.

---

## Implementation checklist

- [x] Settle interview answers; update decisions table
- [x] Fix homepage template + controller listing (single grid, include genuary cards)
- [x] Fix sidebar/main column classes; card breakpoint classes (6/4/3/2/1)
- [x] Update `blogposts.ts` publish set (Theseus, Wordle, Statues hold, Genuary days, hub hold)
- [x] Controller: serve non-published by URL; lists filtered to `published` only
- [x] Wire Thalia binary theme toggle + chrome SCSS tokens
- [ ] Restore/backfill `public/images/*` from production (operator)
- [x] Add capture script + `preview:png` package script
- [ ] Smoke locally: `/`, `/viz`, Theseus, Wordle, genuary, statues URL, theme toggle
- [x] Update `docs/dataviz-workflow.md`

---

## Decisions (settled 2026-09-05)

| # | Topic | Choice | Notes |
|---|--------|--------|-------|
| Q1 | Theme implementation | **a — Thalia binary toggle** | `theme-boot` + `theme-toggle binary=true` in site wrappers |
| Q2 | Listing rule | **Only `published` is listed** | Any other status → omit from homepage, nav lists, sitemap; still serve `/blog/:id` when template exists |
| Q3 | Genuary / category hubs | **c — no hubs** | Drop genuary hub entry and category hub pages; each post is its own homepage card; simplify sidebar (no Genuary section split) |
| Q4 | Preview capture tool | **Playwright** (default) | Operator installs when ready |
| — | Bootstrap stack | **Keep BS3 + BootstrapXL** | Matches production; no BS5 migration this pass |
| — | Featured split | **Remove from homepage** | Single list |
| — | Statues | **Not listed** (`hold`) | Not ready |
| — | Theseus + Wordle | **List** (`published`) | Publish |
| — | Genuary days | **Each card on grid** | No aggregate hub |

---

## Operator next steps

```bash
# from websites/dataviz — backfill existing thumbs from production
mkdir -p public/images
for f in georgia.png breathe.png wealth.png ausIncome.png matrix.jpg winamp.jpg earthquake.jpg war.jpg; do
  curl -fsSL "https://dataviz.david-ma.net/images/$f" -o "public/images/$f"
done

bun run dev

# Preview capture tooling (when ready)
bun add -d playwright
bunx playwright install chromium
bun run preview:png --missing
```
