import { Chart, d3, $ } from './chart'

// This file visualises Cloudflare Speed Test JSON runs gathered by a cron job.
// Data flow:
// - `GET /speedtests` returns an array of filenames
// - each filename is fetched at `GET /cloudflare-speedtest-runs/<filename>`

type LatencyData = {
  sent: number;
  received: number;
  loss: number;
  min_ms: number | null;
  mean_ms: number | null;
  median_ms: number | null;
  p25_ms: number | null;
  p75_ms: number | null;
  max_ms: number | null;
  jitter_ms: number | null;
}

type DataMetadata = {
  bytes: number;
  duration_ms: number;
  mbps: number;
  mean_mbps: number;
  median_mbps: number;
  p25_mbps: number;
  p75_mbps: number;
}

type ColoMetadata = {
  cca2: string;
  city: string;
  iata: string;
  lat: number;
  lon: number;
  region: string;
}

type SpeedtestServer = {
  ip: string;
  port: number;
  hostname: string;
  isp: string;
  location: string;
  country: string;
}

type TurnData = {
  target: string;
  latency: LatencyData;
  out_of_order: number;
  out_of_order_pct: number;
  mos: number | null;
  quality_label: string;
}

type SpeedtestData = {
  version: string;
  timestamp_utc: string;
  base_url: string;
  meas_id: string;
  comments: string | null;
  meta: {
    asOrganization: string;
    asn: number;
    city: string;
    clientIp: string;
    colo: ColoMetadata;
    country: string;
    hostname: string;
    httpProtocol: string;
    latitude: string;
    longitude: string;
    postalCode: string;
    region: string;
    tlsVersion: string;
  };
  server: SpeedtestServer | null;
  idle_latency: LatencyData;
  download: DataMetadata;
  upload: DataMetadata;
  loaded_latency_download: LatencyData;
  loaded_latency_upload: LatencyData;
  turn: TurnData | null;
  experimental_udp: TurnData | null;

  // These top-level fields are present in the CLI JSON output (and are often null).
  ip: string;
  colo: ColoMetadata | null;
  asn: string | number;
  as_org: string;
  interface_name?: string | null;
  network_name?: string | null;
  is_wireless: boolean | null;
  interface_mac: string | null;
  local_ipv4: string | null;
  local_ipv6: string | null;
  external_ipv4: string | null;
  external_ipv6: string | null;
  dns: {
    hostname: string;
    resolution_time_ms: number;
    resolved_ips: string[];
    ipv4_count: number;
    ipv6_count: number;
    dns_servers: string[];
  };
  tls: {
    handshake_time_ms: number;
    protocol_version: string;
    cipher_suite: string;
  };
  ip_comparison: {
    local_ip: string;
    external_ip: string;
    latency_ms: number;
    jitter_ms: number;
    packet_loss_pct: number;
  } | null;
  traceroute: {
    hops: {
      ip: string;
      latency_ms: number;
      jitter_ms: number;
      packet_loss_pct: number;
    }[];
  } | null;
}

type SpeedtestPoint = {
  ts: Date;
  /** Public / WAN identity for colouring (not LAN subnet). */
  external_ip: string;
  /** Local / bound address (`--source`, `local_ipv4` / `local_ipv6`, or `ip_comparison.local_ip`). */
  source_ip: string;
  /** From CLI JSON when present (`--interface`, SSID); often null in exports. */
  interface_label: string | null;
  download_mbps: number;
  upload_mbps: number;
  idle_latency_mean_ms: number | null;
  loaded_latency_download_mean_ms: number | null;
  loaded_latency_upload_mean_ms: number | null;
  loss_idle_pct: number | null;
  file?: string;
}

function safeNumber(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function formatMbps(v: number | null): string {
  if (v === null) return '—'
  if (v >= 100) return `${v.toFixed(0)} Mbps`
  if (v >= 10) return `${v.toFixed(1)} Mbps`
  return `${v.toFixed(2)} Mbps`
}

function formatMs(v: number | null): string {
  if (v === null) return '—'
  if (v >= 1000) return `${(v / 1000).toFixed(2)} s`
  return `${v.toFixed(0)} ms`
}

function getExternalIp(run: SpeedtestData): string {
  const fromComparison = run.ip_comparison?.external_ip?.trim()
  if (fromComparison) return fromComparison
  const v4 = run.external_ipv4?.trim()
  if (v4) return v4
  const v6 = run.external_ipv6?.trim()
  if (v6) return v6
  const clientIp = run.meta?.clientIp?.trim()
  if (clientIp) return clientIp
  const top = typeof run.ip === 'string' ? run.ip.trim() : ''
  if (top) return top
  return 'unknown'
}

function getSourceIp(run: SpeedtestData): string {
  const fromComparison = run.ip_comparison?.local_ip?.trim()
  if (fromComparison) return fromComparison
  const v4 = run.local_ipv4?.trim()
  const v6 = run.local_ipv6?.trim()
  if (v4 && v6) return `${v4} · ${v6}`
  if (v4) return v4
  if (v6) return v6
  return 'unknown'
}

function getInterfaceLabel(run: SpeedtestData): string | null {
  const iface = run.interface_name?.trim()
  const net = run.network_name?.trim()
  if (iface && net && net !== iface) return `${iface} (${net})`
  if (iface) return iface
  if (net) return net
  if (run.is_wireless === true) return 'Wi‑Fi (interface not reported)'
  if (run.is_wireless === false) return 'Ethernet (interface not reported)'
  return null
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function toPoint(run: SpeedtestData, file?: string): SpeedtestPoint | null {
  const ts = new Date(run.timestamp_utc)
  if (Number.isNaN(ts.getTime())) return null

  const download_mbps = run.download?.mbps ?? 0
  const upload_mbps = run.upload?.mbps ?? 0
  if (!Number.isFinite(download_mbps) || !Number.isFinite(upload_mbps)) return null
  // Drop bogus runs (e.g. 0 Mbps upload) that blow up log₂ axes.
  if (download_mbps <= 0 || upload_mbps <= 0) return null

  return {
    ts,
    external_ip: getExternalIp(run),
    source_ip: getSourceIp(run),
    interface_label: getInterfaceLabel(run),
    download_mbps,
    upload_mbps,
    idle_latency_mean_ms: safeNumber(run.idle_latency?.mean_ms),
    loaded_latency_download_mean_ms: safeNumber(run.loaded_latency_download?.mean_ms),
    loaded_latency_upload_mean_ms: safeNumber(run.loaded_latency_upload?.mean_ms),
    loss_idle_pct: safeNumber(run.idle_latency?.loss),
    file,
  }
}

function ensureElementAfterChart(id: string): HTMLElement {
  const existing = document.getElementById(id)
  if (existing) return existing

  const chartEl = document.getElementById('chart')
  if (!chartEl) {
    const fallback = document.createElement('div')
    fallback.id = id
    document.body.appendChild(fallback)
    return fallback
  }

  const el = document.createElement('div')
  el.id = id
  chartEl.insertAdjacentElement('afterend', el)
  return el
}

function getSpeedtestLegendRowsEl(): HTMLElement {
  const rows = document.getElementById('speedtest_legend_rows')
  if (rows) return rows

  // Back-compat: if the dedicated template isn't present, fall back to creating a legend container.
  const fallbackLegend = ensureElementAfterChart('speedtest_legend')
  const tbody = document.createElement('tbody')
  tbody.id = 'speedtest_legend_rows'
  const table = document.createElement('table')
  table.className = 'table table-condensed table-striped speedtest-legend-table'
  table.appendChild(tbody)
  fallbackLegend.appendChild(table)
  return tbody
}

function renderTable(points: SpeedtestPoint[], container: HTMLElement): void {
  const rows = points
    .slice()
    .sort((a, b) => b.ts.getTime() - a.ts.getTime())
    .slice(0, 50)

  const fmt = d3.timeFormat('%Y-%m-%d %H:%M')
  const html = `
    <div class="table-responsive">
      <table class="table table-striped table-condensed" style="margin-top: 20px;">
        <thead>
          <tr>
            <th>Time</th>
            <th>External IP</th>
            <th>Source IP</th>
            <th>Download</th>
            <th>Upload</th>
            <th>Idle latency (mean)</th>
            <th>Loaded latency DL (mean)</th>
            <th>Loaded latency UL (mean)</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map((p) => {
              return `<tr>
                <td>${fmt(p.ts)}</td>
                <td><code>${escapeHtml(p.external_ip)}</code></td>
                <td><code>${escapeHtml(p.source_ip)}</code></td>
                <td>${formatMbps(p.download_mbps)}</td>
                <td>${formatMbps(p.upload_mbps)}</td>
                <td>${formatMs(p.idle_latency_mean_ms)}</td>
                <td>${formatMs(p.loaded_latency_download_mean_ms)}</td>
                <td>${formatMs(p.loaded_latency_upload_mean_ms)}</td>
              </tr>`
            })
            .join('')}
        </tbody>
      </table>
    </div>
  `

  container.innerHTML = html
}

const IP_LINE_PALETTE = [
  '#1b9e77',
  '#d95f02',
  '#7570b3',
  '#e7298a',
  '#66a61e',
  '#e6ab02',
  '#a6761d',
  '#666666',
  '#9edae5',
  '#c7c7c7',
  '#ff9896',
  '#c5b0d5',
  '#dbdb8d',
]

/** Nearest run by timestamp (data must be sorted ascending by `ts`). */
function nearestPointByTime(sorted: SpeedtestPoint[], t: Date): SpeedtestPoint {
  if (sorted.length === 0) throw new Error('nearestPointByTime: empty')
  const bisect = d3.bisector<SpeedtestPoint, Date>((d) => d.ts).left
  const i = bisect(sorted, t, 1, sorted.length - 1)
  const d0 = sorted[i - 1]
  const d1 = sorted[i]
  if (!d0) return d1
  if (!d1) return d0
  return t.getTime() - d0.ts.getTime() > d1.ts.getTime() - t.getTime() ? d1 : d0
}

/** Chart Y-axis: speeds below this are drawn at this value; hover shows measured. */
const CHART_Y_THRESHOLD_MBPS = 1

function yPlotMbps(v: number): number {
  return Math.max(CHART_Y_THRESHOLD_MBPS, v)
}

function quantileSorted(valuesAscending: number[], p: number): number | null {
  if (valuesAscending.length === 0) return null
  const v = d3.quantileSorted(valuesAscending, p)
  return typeof v === 'number' && Number.isFinite(v) ? v : null
}

function renderLegendTable(
  externalIps: string[],
  ipColor: (ip: string) => string,
  legendRowsEl: HTMLElement,
): void {
  const rows = externalIps
    .map((ip) => ({ ip, col: ipColor(ip) }))
    .map(({ ip, col }) => {
      const ipLabel = ip.length > 46 ? `${ip.slice(0, 44)}…` : ip
      return `
        <tr>
          <td style="width: 84px;">
            <div class="speedtest-swatch" style="--speedtest-colour:${escapeHtml(col)}">
              <div class="speedtest-swatch-dl"></div>
              <div class="speedtest-swatch-ul"></div>
            </div>
          </td>
          <td><code title="${escapeHtml(ip)}">${escapeHtml(ipLabel)}</code></td>
        </tr>
      `
    })
    .join('')

  legendRowsEl.innerHTML = rows || `<tr><td colspan="2" class="text-muted">No series</td></tr>`
}

function tooltipSpeedLine(which: 'Download' | 'Upload', mbps: number): string {
  if (mbps < CHART_Y_THRESHOLD_MBPS) {
    return `${which} less than ${CHART_Y_THRESHOLD_MBPS} Mbps (${formatMbps(mbps)} measured)`
  }
  return `${which} ${formatMbps(mbps)}`
}

/** Tick positions at 2^n Mbps between domain bounds (for log₂ Y axis). */
function ticksLog2Mbps(lo: number, hi: number): number[] {
  if (!(lo > 0 && hi > lo)) return [lo]
  const n0 = Math.ceil(Math.log2(lo))
  const n1 = Math.floor(Math.log2(hi))
  const out: number[] = []
  for (let n = n0; n <= n1; n++) {
    const t = Math.pow(2, n)
    if (t >= lo - 1e-12 && t <= hi + 1e-12) out.push(t)
  }
  if (out.length === 0) {
    out.push(lo)
    if (hi > lo) out.push(hi)
  }
  return out
}

/** Do not connect line segments across gaps longer than this (same external IP). */
const MAX_LINE_GAP_MS = 8 * 60 * 60 * 1000 // 8 hours

/**
 * Split a time-ordered series so paths are not drawn across long gaps.
 * Points must be sorted ascending by `ts`.
 */
function splitSeriesByGap(sorted: SpeedtestPoint[], maxGapMs: number): SpeedtestPoint[][] {
  if (sorted.length === 0) return []
  const chunks: SpeedtestPoint[][] = []
  let cur: SpeedtestPoint[] = [sorted[0]]
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].ts.getTime() - sorted[i - 1].ts.getTime()
    if (gap > maxGapMs) {
      chunks.push(cur)
      cur = [sorted[i]]
    } else {
      cur.push(sorted[i])
    }
  }
  chunks.push(cur)
  return chunks
}

function drawTimeseries(chart: Chart, points: SpeedtestPoint[], legendRowsEl: HTMLElement): void {
  const data = points
    .filter(
      (p) =>
        Number.isFinite(p.download_mbps) &&
        Number.isFinite(p.upload_mbps) &&
        p.download_mbps > 0 &&
        p.upload_mbps > 0,
    )
    .slice()
    .sort((a, b) => a.ts.getTime() - b.ts.getTime())

  if (data.length < 2) {
    chart.ready((c) => {
      c.plot
        .append('text')
        .attr('x', c.innerWidth / 2)
        .attr('y', c.innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#6c757d')
        .style('font-size', '16px')
        .text('Not enough speedtest runs to plot yet.')
    })
    return
  }

  const x = d3.scaleTime().range([0, chart.innerWidth])
  const y = d3.scaleLog().base(2).range([chart.innerHeight, 0])

  x.domain(d3.extent(data, (d) => d.ts) as [Date, Date])
  const lo = CHART_Y_THRESHOLD_MBPS

  const yValues = data
    .flatMap((d) => [d.download_mbps, d.upload_mbps])
    .filter((v) => Number.isFinite(v) && v > 0)
    .slice()
    .sort((a, b) => a - b)

  const maxY = d3.max(yValues) ?? 1
  const q95 = quantileSorted(yValues, 0.95)

  // Ignore the highest 5% tail for axis scaling so outliers don't dominate the chart.
  const scaleMax = q95 ?? maxY
  let hi = Math.max(scaleMax * 1.1, lo * 2)
  if (hi <= lo) hi = lo * 2
  hi = Math.pow(2, Math.ceil(Math.log2(hi)))
  y.domain([lo, hi])

  const yTickValues = ticksLog2Mbps(lo, hi)

  const externalIps = Array.from(new Set(data.map((d) => d.external_ip))).sort()
  const ipColor = d3
    .scaleOrdinal<string, string>()
    .domain(externalIps)
    .range([...IP_LINE_PALETTE, ...d3.schemeTableau10])

  renderLegendTable(externalIps, (ip) => ipColor(ip), legendRowsEl)

  chart.ready((c) => {
    // Scatter plot: points only (no connecting lines).
    // Filled circle = download, ring = upload.
    const dlDots = c.plot.append('g').attr('class', 'speedtest-dots speedtest-dots-dl')
    const ulDots = c.plot.append('g').attr('class', 'speedtest-dots speedtest-dots-ul')

    dlDots
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => x(d.ts))
      .attr('cy', (d) => y(yPlotMbps(d.download_mbps)))
      .attr('r', 3.5)
      .attr('fill', (d) => ipColor(d.external_ip))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.8)
      .attr('opacity', 0.9)

    ulDots
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => x(d.ts))
      .attr('cy', (d) => y(yPlotMbps(d.upload_mbps)))
      .attr('r', 3.5)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => ipColor(d.external_ip))
      .attr('stroke-width', 1.6)
      .attr('opacity', 0.95)

    c.plot
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${c.innerHeight})`)
      .call(d3.axisBottom(x).ticks(6))

    c.plot
      .append('g')
      .attr('class', 'axis')
      .call(
        d3
          .axisLeft(y)
          .tickValues(yTickValues)
          .tickFormat((v) => (typeof v === 'number' ? d3.format('.3~s')(v) : String(v))),
      )

    // Hover: nearest run by time + tooltip (see also chart crosshair / focus pattern).
    const fmtTipTime = d3.timeFormat('%Y-%m-%d %H:%M:%S')
    const focus = c.plot
      .append('g')
      .attr('class', 'speedtest-focus')
      .style('pointer-events', 'none')
      .style('display', 'none')

    const focusLine = focus
      .append('line')
      .attr('class', 'speedtest-focus-line')
      .attr('y1', 0)
      .attr('y2', c.innerHeight)
      .attr('stroke', 'rgba(0,0,0,0.35)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 3')

    const focusDl = focus
      .append('circle')
      .attr('r', 5)
      .attr('fill', '#fff')
      .attr('stroke-width', 2)

    const focusUl = focus
      .append('circle')
      .attr('r', 5)
      .attr('fill', 'rgba(255,255,255,0.85)')
      .attr('stroke-width', 2)

    const tip = focus.append('g').attr('class', 'speedtest-tooltip')
    const tipBg = tip
      .append('rect')
      .attr('rx', 4)
      .attr('ry', 4)
      .attr('fill', 'rgba(255,255,255,0.96)')
      .attr('stroke', 'rgba(0,0,0,0.12)')

    const tipLines = tip.append('g').attr('transform', 'translate(8, 18)')

    const updateFocus = (d: SpeedtestPoint, mx: number, my: number) => {
      const col = ipColor(d.external_ip)
      const xd = x(d.ts)
      focusLine.attr('x1', xd).attr('x2', xd)
      focusDl.attr('cx', xd).attr('cy', y(yPlotMbps(d.download_mbps))).attr('stroke', col)
      focusUl.attr('cx', xd).attr('cy', y(yPlotMbps(d.upload_mbps))).attr('stroke', col)

      const lines: string[] = [
        fmtTipTime(d.ts),
        `External ${d.external_ip}`,
        `Source ${d.source_ip}`,
      ]
      if (d.interface_label) lines.push(`Interface ${d.interface_label}`)
      lines.push(
        tooltipSpeedLine('Download', d.download_mbps),
        tooltipSpeedLine('Upload', d.upload_mbps),
      )
      if (d.file) lines.push(d.file)

      tipLines.selectAll('text').remove()
      lines.forEach((line, i) => {
        tipLines
          .append('text')
          .attr('y', i * 15)
          .attr('fill', '#212529')
          .style('font-size', '11px')
          .style('font-family', 'system-ui, sans-serif')
          .text(line)
      })

      const lineH = 15
      const pad = 8
      const boxW = 240
      const boxH = pad * 2 + lines.length * lineH
      tipBg.attr('width', boxW).attr('height', boxH)

      let tx = mx + 14
      let ty = my - boxH - 10
      if (tx + boxW > c.innerWidth - 4) tx = mx - boxW - 14
      if (ty < 4) ty = my + 14
      if (ty + boxH > c.innerHeight - 4) ty = c.innerHeight - boxH - 4
      if (tx < 4) tx = 4
      tip.attr('transform', `translate(${tx}, ${ty})`)
    }

    c.plot
      .append('rect')
      .attr('class', 'speedtest-plot-overlay')
      .attr('width', c.innerWidth)
      .attr('height', c.innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove', function (event: MouseEvent) {
        const [mx, my] = d3.pointer(event, c.plot.node())
        const t = x.invert(mx)
        const d = nearestPointByTime(data, t)
        focus.style('display', null)
        updateFocus(d, mx, my)
      })
      .on('mouseleave', () => {
        focus.style('display', 'none')
      })
  })
}

$.when($.ready).then(async function () {
  const description = document.getElementById('description')
  if (description) {
    description.innerHTML = `
      <h2>Cloudflare Speed Test</h2>
      <p>Runs are gathered by cron and loaded from <code>/cloudflare-speedtest-runs/</code>.</p>
    `
  }

  const legendRowsEl = getSpeedtestLegendRowsEl()

  const chart = new Chart({
    element: 'chart',
    title: 'Internet speed over time (Mbps, log₂ scale)',
    width: 960,
    height: 500,
    margin: { top: 70, right: 40, bottom: 50, left: 60 },
    nav: true,
    loading: true,
  })

  try {
    const files = (await d3.json('/speedtests')) as string[] | null
    const filenames = Array.isArray(files) ? files.filter((f) => typeof f === 'string') : []

    // Keep it bounded (browser + server) while still being useful.
    const MAX_FILES = 500
    const toFetch = filenames.slice().sort().slice(-MAX_FILES)

    const runs = await Promise.all(
      toFetch.map(async (file) => {
        try {
          const run = (await d3.json(`/cloudflare-speedtest-runs/${file}`)) as SpeedtestData
          return { run, file }
        } catch {
          return null
        }
      }),
    )

    const points: SpeedtestPoint[] = runs
      .filter((r): r is { run: SpeedtestData; file: string } => !!r)
      .map(({ run, file }) => toPoint(run, file))
      .filter((p): p is SpeedtestPoint => !!p)

    drawTimeseries(chart, points, legendRowsEl)

    const tableEl = ensureElementAfterChart('speedtest_table')
    renderTable(points, tableEl)
  } catch (e) {
    chart.ready((c) => {
      c.plot
        .append('text')
        .attr('x', c.innerWidth / 2)
        .attr('y', c.innerHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#b02a37')
        .style('font-size', '16px')
        .text('Failed to load speedtest runs.')
    })
    console.error(e)
  }
})
