/**
 * Client asset build for dataviz — replaces webpack.
 *
 * - Bundles TypeScript under src/js/ → dist/js/ (ESM + code splitting; gitignored)
 * - Compiles src/css/chart.scss → dist/css/chart.css
 * - Copies Rapier .wasm next to the JS and rewrites Bun's broken import.meta.url
 *
 * Thalia serves dist before public in production. In development it skips dist
 * .js/.css (on-demand compile path) — use `bun run preview` after a build.
 *
 * Usage:
 *   bun scripts/build-client.ts
 *   bun scripts/build-client.ts --minify
 *   bun scripts/build-client.ts --watch
 */
import { mkdir, readdir, copyFile, readFile, writeFile, stat, unlink, rm } from 'node:fs/promises'
import path from 'node:path'
import { watch } from 'node:fs'
import * as sass from 'sass'

const root = path.resolve(import.meta.dirname, '..')
const srcJs = path.join(root, 'src', 'js')
const outJs = path.join(root, 'dist', 'js')
const chartScss = path.join(root, 'src', 'css', 'chart.scss')
const chartCss = path.join(root, 'dist', 'css', 'chart.css')
const publicJs = path.join(root, 'public', 'js')

const minify = Bun.argv.includes('--minify')
const watchMode = Bun.argv.includes('--watch')

async function listFiles(dir: string, predicate: (name: string) => boolean): Promise<string[]> {
  const out: string[] = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await listFiles(full, predicate)))
    } else if (predicate(entry.name)) {
      out.push(full)
    }
  }
  return out
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

function isTsEntry(name: string) {
  return name.endsWith('.ts') && !name.endsWith('.d.ts') && !name.endsWith('.test.ts')
}

async function compileChartCss() {
  await ensureDir(path.dirname(chartCss))
  const result = sass.compile(chartScss, {
    style: minify ? 'compressed' : 'expanded',
    sourceMap: !minify,
  })
  await writeFile(chartCss, result.css)
  console.log(`css  ${path.relative(root, chartCss)}`)
}

async function copyRapierWasm() {
  const copies: Array<[string, string]> = [
    [
      path.join(root, 'node_modules/@dimforge/rapier3d-compat/rapier_wasm3d_bg.wasm'),
      path.join(outJs, 'rapier_wasm3d_bg.wasm'),
    ],
    [
      path.join(root, 'node_modules/@dimforge/rapier2d-compat/rapier_wasm2d_bg.wasm'),
      path.join(outJs, 'rapier_wasm2d_bg.wasm'),
    ],
  ]
  for (const [from, to] of copies) {
    try {
      await stat(from)
    } catch {
      console.warn(`skip wasm (missing): ${path.relative(root, from)}`)
      continue
    }
    await ensureDir(path.dirname(to))
    await copyFile(from, to)
    console.log(`wasm ${path.relative(root, to)}`)
  }
}

/** Bun currently emits `new URL("….wasm", "<deleted>")` for Rapier — fix to import.meta.url. */
async function fixWasmUrlsInOutdir() {
  const jsFiles = await listFiles(outJs, (name) => name.endsWith('.js'))
  const wasmUrlRe = /new URL\("(rapier_wasm[23]d_bg\.wasm)",\s*"<deleted>"\)/g
  let patched = 0
  for (const file of jsFiles) {
    const before = await readFile(file, 'utf8')
    const after = before.replace(wasmUrlRe, 'new URL("$1", import.meta.url)')
    if (after !== before) {
      await writeFile(file, after)
      patched++
    }
  }
  if (patched) console.log(`fixed Rapier wasm URLs in ${patched} file(s)`)
}

/**
 * Remove leftover webpack/bun builds from public/js so they are not committed and
 * do not shadow the wrong assets. Vendors (*.min.js, vendor/, etc.) stay.
 */
async function scrubPublicBuildArtifacts() {
  const tsEntries = await listFiles(srcJs, isTsEntry)
  const generatedNames = new Set(
    tsEntries.map((abs) => path.relative(srcJs, abs).replace(/\.ts$/, '.js')),
  )

  const scrubbed: string[] = []
  const candidates = await listFiles(publicJs, () => true)
  for (const file of candidates) {
    const rel = path.relative(publicJs, file)
    const base = path.basename(file)
    const remove =
      base.startsWith('chunk-') ||
      base.endsWith('.js.map') ||
      base.endsWith('.LICENSE.txt') ||
      base.startsWith('rapier_wasm') ||
      /^[a-f0-9]{16,}\.wasm$/.test(base) ||
      generatedNames.has(rel)
    if (!remove) continue
    await unlink(file)
    scrubbed.push(rel)
  }

  // Drop empty dirs left under public/js (e.g. paperclips/)
  const maybeEmpty = new Set(
    tsEntries
      .map((abs) => path.dirname(path.relative(srcJs, abs)))
      .filter((d) => d !== '.'),
  )
  for (const relDir of maybeEmpty) {
    const dir = path.join(publicJs, relDir)
    try {
      const left = await readdir(dir)
      if (left.length === 0) await rm(dir, { recursive: true })
    } catch {
      /* missing is fine */
    }
  }

  if (scrubbed.length) {
    console.log(`scrubbed ${scrubbed.length} generated file(s) from public/js (vendors kept)`)
  }
}

async function resetDistJs() {
  await rm(outJs, { recursive: true, force: true })
  await ensureDir(outJs)
}

async function buildJs() {
  const absEntries = (await listFiles(srcJs, isTsEntry)).sort()
  if (!absEntries.length) {
    throw new Error(`No TypeScript entries under ${srcJs}`)
  }

  // Entrypoints relative to src/js so `[dir]/[name]` → dist/js/foo.js (and paperclips/…)
  const entrypoints = absEntries.map((abs) => path.relative(srcJs, abs))
  await ensureDir(outJs)

  const prevCwd = process.cwd()
  process.chdir(srcJs)
  let result: Awaited<ReturnType<typeof Bun.build>>
  try {
    result = await Bun.build({
      entrypoints,
      outdir: outJs,
      target: 'browser',
      format: 'esm',
      splitting: true,
      minify,
      sourcemap: minify ? 'none' : 'linked',
      naming: {
        entry: '[dir]/[name].[ext]',
        chunk: 'chunk-[hash].[ext]',
        asset: '[name]-[hash].[ext]',
      },
    })
  } finally {
    process.chdir(prevCwd)
  }

  if (!result.success) {
    for (const log of result.logs) console.error(log)
    throw new Error('Bun.build failed')
  }

  const byKind = new Map<string, number>()
  for (const out of result.outputs) {
    byKind.set(out.kind, (byKind.get(out.kind) ?? 0) + 1)
  }
  console.log(
    `js   ${entrypoints.length} entries → ${result.outputs.length} outputs in dist/js` +
      ` (${[...byKind.entries()].map(([k, n]) => `${n} ${k}`).join(', ')})` +
      (minify ? ', minified' : ''),
  )
}

async function buildAll() {
  const started = Date.now()
  await resetDistJs()
  await buildJs()
  await copyRapierWasm()
  await fixWasmUrlsInOutdir()
  await compileChartCss()
  await scrubPublicBuildArtifacts()
  console.log(`done in ${Date.now() - started}ms`)
}

let building = false
let pending = false

async function safeBuild() {
  if (building) {
    pending = true
    return
  }
  building = true
  try {
    await buildAll()
  } catch (err) {
    console.error(err)
  } finally {
    building = false
    if (pending) {
      pending = false
      await safeBuild()
    }
  }
}

await safeBuild()

if (watchMode) {
  console.log('watching src/js and src/css/chart.scss → dist/ …')
  const reload = () => {
    void safeBuild()
  }
  watch(srcJs, { recursive: true }, reload)
  watch(path.dirname(chartScss), (_event, filename) => {
    if (!filename || filename === 'chart.scss') reload()
  })
  await new Promise(() => {})
}
