# Review: `deploy-dataviz.yml` fitness

Date: 2026-09-05  
Playbook: `/usr/local/dev/scripts/homelab_cluster/ansible/deploy-dataviz.yml`

## Verdict (updated)

**Rewritten** for Bun 1.4.1, `main`, role-based baseline + `dataviz_deploy`.  
**Multiplex default:** does **not** start a dedicated dataviz PM2 app; reloads shared `thalia` on aang and drops any legacy `dataviz` PM2 process.

## Operator entry

```bash
cd /usr/local/dev/scripts/homelab_cluster
./scripts/run-playbook.sh deploy-dataviz.yml aang
# first-time host baseline:
./scripts/run-playbook.sh deploy-dataviz.yml aang full_deploy=true
# also refresh shared Thalia:
./scripts/run-playbook.sh deploy-dataviz.yml aang deploy_thalia=true
# escape hatch (not used on aang):
./scripts/run-playbook.sh deploy-dataviz.yml aang dataviz_multiplex=false
```

## What the new playbook does

1. **`full_deploy=true`:** roles `asdf_system`, `environment_modules`, `bun_runtime` (1.4.1), `pm2_bun`.
2. **`dataviz_deploy` role:** git `main` → data symlink → `bun install --frozen-lockfile` → `bun run build`.
3. **Multiplex (default):** `pm2 delete dataviz` (legacy) → `pm2 reload thalia` → HTTP check with `Host: dataviz.david-ma.net` on :1337.
4. Optional `deploy_thalia=true` refreshes `{{ dev_dir }}/Thalia` on `main`.

## Intentionally omitted

- Dedicated dataviz PM2 process (unless `dataviz_multiplex=false`)
- `docker compose` / `drizzle-kit push` / `pnpm`
