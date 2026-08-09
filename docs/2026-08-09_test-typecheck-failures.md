# Problem: `bun test` and `bun typecheck` failing

## 1) What is the problem?

- **`bun typecheck`**: missing re-exports / `drawMap.calculate` typing (fixed).
- **`bun test`**: HTTP smoke tests hard-coded `localhost:1337`, colliding with other projects.

## 2) How is the situation currently being handled?

- Typecheck fixed in `chart.ts` / `weapons.ts`.
- Smoke tests replaced by `test/site.integration.test.ts` using `thalia/testing`
  (`startTestServer` → `get-port-please` random port).
- Legacy DB/Puppeteer suite remains `describe.skip`.
- CI: `.github/workflows/ci.yml` runs typecheck + `bun test`.

## 3) Ideal fix

Ephemeral test server; no dependence on a manually started :1337 process.
DB-backed suites (if revived) gated with `SKIP_SITE_INTEGRATION=1` like spaceforyourmind.

## 4) Status / operator steps

- [x] Typecheck fix
- [x] Ephemeral-port HTTP integration suite
- [x] CI workflow added
- [ ] Operator: push branch so GitHub Actions runs (agent cannot `gh` / push)
- [ ] Optional: `bun install` if lockfile needs refresh after script changes

```bash
bun run typecheck
bun test
# skip HTTP integration:
SKIP_SITE_INTEGRATION=1 bun test
```
