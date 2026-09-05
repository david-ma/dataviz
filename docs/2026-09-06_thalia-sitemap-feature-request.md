# Feature request: Thalia sitemap generator (usable for standalone + dataviz)

Date: 2026-09-06  
Target: Thalia framework (`david-ma/Thalia`) — **do not treat this file as a framework patch**; it is a review + FR for upstream.  
Site context: `websites/dataviz` (also the standalone GitHub repo that depends on `thalia`).

## Verdict

The crawler is **real and useful inside the Thalia monorepo**, but it is **not yet an easy, package-level product surface**. For dataviz, published blogposts should be discovered **out of the box** via homepage/`/viz` links — **if** you crawl the right site and force a canonical origin. Seed URLs / `config.sitemap` are **typed but unused**.

## What exists today

| Piece | Location | Role |
|---|---|---|
| Interactive wrapper | `bin/sitemap.ts` → npm bin `thalia-sitemap` | Pick project, show sitemap age, smoke or regenerate |
| Generator | `scripts/generate-sitemaps.ts` | HTTP crawl from homepage; write `sitemap.xml` |
| Canonical origin helper | `scripts/sitemap-project-config.ts` | First “non-dev” entry in `config.domains` → `https://host` |
| Smoke / compare | `scripts/smoke-sitemap.ts`, `compare-sitemap.ts` | Fetch each `<loc>` against a target base |
| Types (aspirational) | `server/types.ts` → `SitemapConfig` on `RawWebsiteConfig` | Documents seed URLs + categories; **generator never reads them** |
| npm scripts (monorepo only) | `package.json` | `sitemap`, `sitemap:generate`, `sitemap:smoke` |

### Intended “happy path” (monorepo)

```bash
# Server must already be serving the site on PORT (default 1337)
cd /usr/local/dev/Thalia
bun run sitemap dataviz --regenerate
# equivalent:
bun scripts/generate-sitemaps.ts --project dataviz
```

Behaviour with `--project <name>`:

1. Crawl `http://localhost:$PORT` (override with `--crawl-base`).
2. Follow same-origin `<a href>` links (cheerio); worker pool + delay; resume via `websites/<project>/tmp/sitemap-halt.csv`.
3. Write **`websites/<project>/public/sitemap.xml`** (only URLs that returned HTTP 200).
4. Rewrite `<loc>` host to canonical origin from `config.domains` when available (override with `--canonical-origin`).

Legacy mode (no `--project`) still crawls and writes under `/tmp/sitemaps/`.

### Mental model check

| Expectation | Reality |
|---|---|
| Starts at homepage | Yes — queues crawl base URL first |
| Inject extra pages via config | **No** — `config.sitemap` is unused; only resume CSV can re-queue known URLs |
| Writes XML to `public/` | Yes, with `--project` |
| Siteindex / categories / lastmod from crawl | **No** — flat `urlset`; lastmod/changefreq/priority fields exist on the in-memory class but are never set |
| Broken-page report | Mentioned in script TODOs; not implemented |

## Is it “easy to use”?

**Inside the Thalia multiplex repo: moderately easy.**  
`bun run sitemap <project>` is a decent interactive entry; non-TTY flags work.

**As a published Thalia package feature: no.**

1. **`thalia-sitemap` hard-requires monorepo layout** (`./websites` in cwd). Standalone sites (including running commands from the dataviz git root) get `Run from Thalia repo root`.
2. **npm `files` omits `scripts/`** while advertising `thalia-sitemap`. Packaged consumers get the wrapper bin but not `generate-sitemaps.ts` / smoke helpers that it spawns. (GitHub installs may still ship a full tree depending on the client; the published contract is still broken.)
3. **No guide** under `docs/guides/` — README only mentions sitemap in the tree diagram.
4. **Multiplex Host**: crawl uses bare `http://localhost:1337` with **no `Host:` header**. Shared `thalia` PM2 may serve the wrong site unless `PROJECT=dataviz` or Host-based routing is somehow default.
5. **Canonical origin heuristic**: `*.david-ma.net` is treated as **dev** and skipped. Dataviz’s real public origin is `https://dataviz.david-ma.net`, and dataviz currently has **no `config.domains`**. Auto-canonical therefore fails; operators must pass `--canonical-origin`.

## Dataviz: will blogposts appear without seed URLs?

**Likely yes for `status: 'published'`**, without generator changes:

- Homepage and nav render `publishedBlogposts()` with `<a href="/blog/{{shortname}}">`.
- `/viz` also lists the same set.
- Catalogue comment already says published → “homepage / nav / sitemap /viz”.
- As of 2026-09-06: **17 listed / published** posts out of 21 catalogue entries; archived/hold stay off listing surfaces (correct for sitemap).

Caveats before trusting a crawl:

1. Server must be **dataviz** on the crawl base (not another multiplex site).
2. Pass **`--canonical-origin https://dataviz.david-ma.net`** until domains / heuristic are fixed.
3. Commit `public/sitemap.xml` after a clean run (dataviz has none today; peers like `thalia_ubc` / `spaceforyourmind` do).
4. Optional: add `domains` to dataviz config so `--project` can pick a canonical host — but today any sole `.david-ma.net` domain would still be skipped by `isDevDomainHost`.

### Operator commands (no framework change)

```bash
# From Thalia root, with dataviz reachable on :1337
bun scripts/generate-sitemaps.ts --project dataviz \
  --canonical-origin https://dataviz.david-ma.net

# Optional smoke against local or prod
bun scripts/smoke-sitemap.ts \
  --sitemap websites/dataviz/public/sitemap.xml \
  --target http://localhost:1337
```

If multiplex is ambiguous, crawl with an explicit base that already resolves to dataviz, or run a single-site process (`PROJECT=dataviz`).

## Feature request (upstream Thalia)

### P0 — Make the advertised CLI work

1. **Ship sitemap implementation with the package** (add `scripts/generate-sitemaps.ts`, `sitemap-project-config.ts`, `smoke-sitemap*.ts`, `worker-pool.ts`, or move them under `bin/` / a `thalia/sitemap` export included in `files`).
2. **Support standalone project roots**: detect cwd as a site (`config/config.ts` + `public/`), write `public/sitemap.xml`, halt CSV under `tmp/`, without requiring `./websites`.
3. Keep monorepo `bun run sitemap <project>` as a convenience; document both modes.

### P1 — Honour `RawWebsiteConfig.sitemap`

Implement the contract already described in `server/types.ts`:

- Seed / force-include URLs (and optional category metadata) that the crawl may never reach.
- Still crawl from `index` / homepage so link discovery continues.
- Optionally emit siteindex when categories are used (or drop siteindex from the type until implemented).

This unblocks sites whose important URLs are not linked from the homepage (auth gates, orphaned landing pages, API-driven routes). Dataviz does not need this for published posts if the homepage crawl works.

### P1 — Multiplex and canonical origin

1. Accept **`--host` / `Host` header** (or crawl via `https://dataviz.david-ma.net` with care) so multiplex localhost crawls hit the right site.
2. Revisit **`isDevDomainHost`**: either allow an explicit “this is production” domain flag, or stop treating all `*.david-ma.net` as non-canonical when it is the only public hostname.
3. Document that operators can always override with `--canonical-origin`.

### P2 — Quality / docs

1. Populate **`lastmod`** when feasible (HTTP `Last-Modified`, or site-supplied dates from seed config — valuable for dataviz `publish_date`).
2. Finish or drop TODOs: broken-pages report, rate-limit UX, Handlebars-driven sitemap.
3. Add **`docs/guides/sitemap.md`** and link it from `AGENTS.md` / guide index.
4. Unit-test that `config.sitemap` seeds are queued; integration smoke that `--project` writes under `public/`.

## Non-goals for this FR

- Changing dataviz blog routing or catalogue semantics.
- Generating a sitemap in this review pass (operator-run once server + canonical flags are ready).

## Decision log

| Topic | Finding |
|---|---|
| Blogposts need seed URLs? | No for published posts linked from `/` and `/viz` |
| `config.sitemap` injection? | Documented only; not implemented |
| Easy for npm / standalone? | No — monorepo-shaped CLI + scripts not in `files` |
| Dataviz canonical URL | Must pass `--canonical-origin https://dataviz.david-ma.net` today |
