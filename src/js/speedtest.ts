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

/** Runs table: insert after legend when present so legend stays above it. */
function ensureSpeedtestTable(): HTMLElement {
  const existing = document.getElementById('speedtest_table')
  if (existing) return existing

  const anchor = document.getElementById('speedtest_legend') ?? document.getElementById('chart')
  if (!anchor) {
    const fallback = document.createElement('div')
    fallback.id = 'speedtest_table'
    document.body.appendChild(fallback)
    return fallback
  }

  const el = document.createElement('div')
  el.id = 'speedtest_table'
  anchor.insertAdjacentElement('afterend', el)
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

const LEGEND_LABEL_STORAGE_PREFIX = 'speedtest:ip-label:'

function getStoredIpLabel(ip: string): string {
  try {
    return localStorage.getItem(LEGEND_LABEL_STORAGE_PREFIX + encodeURIComponent(ip)) ?? ''
  } catch {
    return ''
  }
}

function setStoredIpLabel(ip: string, value: string): void {
  try {
    localStorage.setItem(LEGEND_LABEL_STORAGE_PREFIX + encodeURIComponent(ip), value)
  } catch {
    /* private mode / quota */
  }
}

function bindLegendLabelStorage(legendHost: HTMLElement | null): void {
  if (!legendHost || legendHost.dataset.legendInputBound === '1') return
  legendHost.dataset.legendInputBound = '1'
  legendHost.addEventListener('input', (e) => {
    const t = e.target
    if (!(t instanceof HTMLTextAreaElement)) return
    if (!t.classList.contains('speedtest-legend-label')) return
    const enc = t.getAttribute('data-ip-enc')
    if (!enc) return
    let ip = ''
    try {
      ip = decodeURIComponent(enc)
    } catch {
      return
    }
    setStoredIpLabel(ip, t.value)
  })
}

type LegendRow = {
  ip: string
  col: string
  count: number
  avgDownload: number
  avgUpload: number
}

function renderLegendTable(
  data: SpeedtestPoint[],
  ipColor: (ip: string) => string,
  legendRowsEl: HTMLElement,
): void {
  const byIp = d3.group(data, (d) => d.external_ip)
  const rows: LegendRow[] = Array.from(byIp, ([ip, pts]) => {
    const avgDownload = d3.mean(pts, (p) => p.download_mbps) ?? 0
    const avgUpload = d3.mean(pts, (p) => p.upload_mbps) ?? 0
    return {
      ip,
      col: ipColor(ip),
      count: pts.length,
      avgDownload,
      avgUpload,
    }
  }).sort((a, b) => b.count - a.count)

  const html =
    rows.length === 0
      ? `<tr><td colspan="6" class="text-muted">No series</td></tr>`
      : rows
          .map(({ ip, col, count, avgDownload, avgUpload }) => {
            const ipLabel = ip.length > 56 ? `${ip.slice(0, 54)}…` : ip
            const enc = encodeURIComponent(ip)
            // `col` comes only from the D3 ordinal scale (palette), not user input.
            return `
        <tr>
          <td class="speedtest-legend-colour">
            <span class="speedtest-swatch" aria-hidden="true">
              <span class="speedtest-swatch-dl" style="background-color:${col};border:2px solid ${col};"></span>
              <span class="speedtest-swatch-ul" style="border:2px solid ${col};"></span>
            </span>
          </td>
          <td><code title="${escapeHtml(ip)}">${escapeHtml(ipLabel)}</code></td>
          <td>${count}</td>
          <td>${formatMbps(avgUpload)}</td>
          <td>${formatMbps(avgDownload)}</td>
          <td>
            <textarea class="form-control speedtest-legend-label input-sm" rows="2" data-ip-enc="${escapeHtml(enc)}" placeholder="Notes for this IP…"></textarea>
          </td>
        </tr>
      `
          })
          .join('')

  legendRowsEl.innerHTML = html

  const legendHost :HTMLElement = legendRowsEl.closest('#speedtest_legend') ?? document.getElementById('speedtest_legend')
  bindLegendLabelStorage(legendHost)

  legendRowsEl.querySelectorAll<HTMLTextAreaElement>('textarea.speedtest-legend-label').forEach((ta) => {
    const enc = ta.getAttribute('data-ip-enc')
    if (!enc) return
    try {
      ta.value = getStoredIpLabel(decodeURIComponent(enc))
    } catch {
      ta.value = ''
    }
  })
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

function clampDate(d: Date, lo: Date, hi: Date): Date {
  const t = d.getTime()
  const t0 = lo.getTime()
  const t1 = hi.getTime()
  if (t < t0) return new Date(t0)
  if (t > t1) return new Date(t1)
  return d
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

  const lo = CHART_Y_THRESHOLD_MBPS

  const [tMin, tMax] = d3.extent(data, (d) => d.ts) as [Date, Date]
  const span = Math.max(1, tMax.getTime() - tMin.getTime())
  const padMs = Math.min(span * 0.02, 24 * 60 * 60 * 1000)
  const fullDomain: [Date, Date] = [new Date(tMin.getTime() - padMs), new Date(tMax.getTime() + padMs)]

  /** Fixed reference scale (full time range) — used for brush + zoom rescaleX. */
  const x2 = d3.scaleTime().domain(fullDomain).range([0, chart.innerWidth])
  /** Focus X scale (visible window). */
  const x = x2.copy()

  const CONTEXT_H = 48
  /** Space below the focus x-axis line so tick labels do not overlap the context strip. */
  const CONTEXT_AXIS_GAP = 28
  const CONTEXT_GAP = 8
  const focusInnerH = chart.innerHeight - CONTEXT_H - CONTEXT_GAP - CONTEXT_AXIS_GAP
  const y = d3.scaleLog().base(2).range([focusInnerH, 0])

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
  const spanMs = tMax.getTime() - tMin.getTime()
  const MIN_INIT_MS = 60 * 1000
  let initialD0: Date
  let initialD1: Date = tMax
  if (spanMs <= SEVEN_DAYS_MS) {
    initialD0 = tMin
  } else {
    initialD0 = new Date(tMax.getTime() - SEVEN_DAYS_MS)
  }
  initialD0 = clampDate(initialD0, fullDomain[0], fullDomain[1])
  initialD1 = clampDate(initialD1, fullDomain[0], fullDomain[1])
  if (initialD1.getTime() - initialD0.getTime() < MIN_INIT_MS) {
    initialD0 = fullDomain[0]
    initialD1 = fullDomain[1]
  }
  x.domain([initialD0, initialD1])

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

  renderLegendTable(data, (ip) => ipColor(ip), legendRowsEl)

  chart.ready((c) => {
    const w = c.innerWidth
    const MIN_VISIBLE_MS = 60 * 1000

    const clipId = `speedtest-focus-clip-${Math.random().toString(36).slice(2)}`
    c.plot
      .append('defs')
      .append('clipPath')
      .attr('id', clipId)
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', w)
      .attr('height', focusInnerH)

    c.plot
      .append('g')
      .attr('class', 'axis')
      .call(
        d3
          .axisLeft(y)
          .tickValues(yTickValues)
          .tickFormat((v) => (typeof v === 'number' ? d3.format('.3~s')(v) : String(v))),
      )

    const clipRoot = c.plot.append('g').attr('clip-path', `url(#${clipId})`)

    // Scatter plot: points only (no connecting lines).
    // Filled circle = download, ring = upload.
    const dlDots = clipRoot.append('g').attr('class', 'speedtest-dots speedtest-dots-dl')
    const ulDots = clipRoot.append('g').attr('class', 'speedtest-dots speedtest-dots-ul')

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
      .attr('opacity', 0.4)

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
      .attr('opacity', 0.6)

    const xAxisG = c.plot
      .append('g')
      .attr('class', 'axis speedtest-axis-x-focus')
      .attr('transform', `translate(0,${focusInnerH})`)

    const contextG = c.plot
      .append('g')
      .attr('class', 'speedtest-context')
      .attr('transform', `translate(0,${focusInnerH + CONTEXT_AXIS_GAP + CONTEXT_GAP})`)

    /** Navigator strip: inset plot area (brush + mini scatter share this x range). */
    const ctxPadY = 5
    const ctxAxisW = 36
    const ctxPadR = 6
    const ctxXL = ctxAxisW
    const ctxXR = w - ctxPadR
    const ctxPlotW = ctxXR - ctxXL
    const xMini = d3.scaleTime().domain(fullDomain).range([ctxXL, ctxXR])

    const yMini = d3
      .scaleLog()
      .base(2)
      .domain(y.domain() as [number, number])
      .range([CONTEXT_H - ctxPadY, ctxPadY])

    const yMiniTicks = ticksLog2Mbps(lo, hi).filter((_, i, a) => i === 0 || i === a.length - 1 || i === Math.floor(a.length / 2))

    contextG.append('rect').attr('x', 0).attr('y', 0).attr('width', w).attr('height', CONTEXT_H).attr('fill', '#e9ecef')

    contextG
      .append('rect')
      .attr('x', ctxXL)
      .attr('y', ctxPadY)
      .attr('width', ctxPlotW)
      .attr('height', CONTEXT_H - 2 * ctxPadY)
      .attr('fill', '#fff')
      .attr('stroke', 'rgba(0,0,0,0.12)')
      .attr('rx', 2)
      .attr('ry', 2)

    const ctxClipId = `speedtest-ctx-clip-${Math.random().toString(36).slice(2)}`
    contextG
      .append('defs')
      .append('clipPath')
      .attr('id', ctxClipId)
      .append('rect')
      .attr('x', ctxXL)
      .attr('y', ctxPadY)
      .attr('width', ctxPlotW)
      .attr('height', CONTEXT_H - 2 * ctxPadY)

    const ctxClipG = contextG.append('g').attr('clip-path', `url(#${ctxClipId})`)

    const ctxDl = ctxClipG.append('g').attr('class', 'speedtest-context-dl')
    const ctxUl = ctxClipG.append('g').attr('class', 'speedtest-context-ul')

    ctxDl
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => xMini(d.ts))
      .attr('cy', (d) => yMini(yPlotMbps(d.download_mbps)))
      .attr('r', 1.35)
      .attr('fill', (d) => ipColor(d.external_ip))
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.35)
      .attr('opacity', 0.55)

    ctxUl
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => xMini(d.ts))
      .attr('cy', (d) => yMini(yPlotMbps(d.upload_mbps)))
      .attr('r', 1.2)
      .attr('fill', 'transparent')
      .attr('stroke', (d) => ipColor(d.external_ip))
      .attr('stroke-width', 0.9)
      .attr('opacity', 0.65)

    contextG
      .append('g')
      .attr('class', 'axis speedtest-axis-y-context')
      .attr('transform', `translate(${ctxXL},0)`)
      .call(
        d3
          .axisLeft(yMini)
          .tickValues(yMiniTicks.length ? yMiniTicks : [lo, hi])
          .tickFormat((v) => (typeof v === 'number' ? d3.format('.3~s')(v) : String(v)))
          .tickSize(3),
      )
      .call((g) => g.select('.domain').attr('stroke', 'rgba(0,0,0,0.25)'))
      .call((g) => g.selectAll('.tick text').attr('font-size', '8px').attr('fill', '#495057'))

    const updateScatterX = () => {
      dlDots.selectAll('circle').attr('cx', (d) => x((d as SpeedtestPoint).ts))
      ulDots.selectAll('circle').attr('cx', (d) => x((d as SpeedtestPoint).ts))
      xAxisG.call(d3.axisBottom(x).ticks(6))
    }

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
      .attr('y2', focusInnerH)
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
      if (tx + boxW > w - 4) tx = mx - boxW - 14
      if (ty < 4) ty = my + 14
      if (ty + boxH > focusInnerH - 4) ty = focusInnerH - boxH - 4
      if (tx < 4) tx = 4
      tip.attr('transform', `translate(${tx}, ${ty})`)
    }

    let brushFromZoom = false
    let ignoreNextZoom = false

    const brushG = contextG.append('g').attr('class', 'brush speedtest-brush')

    let overlay!: d3.Selection<SVGRectElement, unknown, SVGGElement, unknown>

    const brush = d3
      .brushX<SVGGElement>()
      .extent([
        [ctxXL, 1],
        [ctxXR, CONTEXT_H - 1],
      ])

    function applyBrushSelection(raw: [number, number]) {
      let s0 = raw[0]
      let s1 = raw[1]
      if (s1 - s0 < 4) return
      let d0 = clampDate(xMini.invert(s0), fullDomain[0], fullDomain[1])
      let d1 = clampDate(xMini.invert(s1), fullDomain[0], fullDomain[1])
      if (d1.getTime() - d0.getTime() < MIN_VISIBLE_MS) {
        const mid = (d0.getTime() + d1.getTime()) / 2
        d0 = new Date(mid - MIN_VISIBLE_MS / 2)
        d1 = new Date(mid + MIN_VISIBLE_MS / 2)
        s0 = xMini(d0)
        s1 = xMini(d1)
        brushFromZoom = true
        brushG.call(brush.move as never, [s0, s1])
      }
      if (d1 <= d0) return
      x.domain([d0, d1])
      updateScatterX()
      const px0 = x2(d0)
      const px1 = x2(d1)
      const spanPx = px1 - px0
      const fullWin = spanPx >= w - 0.5
      ignoreNextZoom = true
      if (fullWin || spanPx < 1e-6) {
        overlay.call(zoom.transform, d3.zoomIdentity)
      } else {
        overlay.call(zoom.transform, d3.zoomIdentity.scale(w / spanPx).translate(-px0, 0))
      }
    }

    function onBrush(event: d3.D3BrushEvent<SVGGElement>) {
      if (brushFromZoom) {
        brushFromZoom = false
        return
      }
      const raw = event.selection as [number, number] | null
      if (!raw) return
      applyBrushSelection(raw)
    }

    function onBrushEnd(event: d3.D3BrushEvent<SVGGElement>) {
      if (brushFromZoom) {
        brushFromZoom = false
        return
      }
      if (event.selection) return
      x.domain(fullDomain)
      updateScatterX()
      ignoreNextZoom = true
      overlay.call(zoom.transform, d3.zoomIdentity)
      brushFromZoom = true
      brushG.call(brush.move as never, [ctxXL, ctxXR])
    }

    brush.on('brush', onBrush).on('end', onBrushEnd)

    function zoomed(event: d3.D3ZoomEvent<SVGRectElement, any>) {
      if (ignoreNextZoom) {
        ignoreNextZoom = false
        return
      }
      const xz = event.transform.rescaleX(x2)
      let d0 = xz.domain()[0] as Date
      let d1 = xz.domain()[1] as Date
      d0 = clampDate(new Date(d0), fullDomain[0], fullDomain[1])
      d1 = clampDate(new Date(d1), fullDomain[0], fullDomain[1])
      if (d1.getTime() - d0.getTime() < MIN_VISIBLE_MS) return
      x.domain([d0, d1])
      updateScatterX()
      brushFromZoom = true
      brushG.call(brush.move as never, [xMini(d0), xMini(d1)])
    }

    const zoom = d3
      .zoom<SVGRectElement, unknown>()
      .scaleExtent([0.08, 128])
      .extent([
        [0, 0],
        [w, focusInnerH],
      ])
      .translateExtent([
        [-w, 0],
        [2 * w, focusInnerH],
      ])
      .on('zoom', zoomed)

    overlay = c.plot
      .append('rect')
      .attr('class', 'speedtest-plot-overlay')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', w)
      .attr('height', focusInnerH)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .call(zoom)
      .on('dblclick.zoom', null)
      .on('dblclick', (event: MouseEvent) => {
        event.preventDefault()
        x.domain(fullDomain)
        updateScatterX()
        ignoreNextZoom = true
        overlay.call(zoom.transform, d3.zoomIdentity)
        brushFromZoom = true
        brushG.call(brush.move as never, [ctxXL, ctxXR])
      })
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

    brushG.call(brush)
    requestAnimationFrame(() => {
      const s0 = xMini(initialD0)
      const s1 = xMini(initialD1)
      const px0 = x2(initialD0)
      const px1 = x2(initialD1)
      brushFromZoom = true
      brushG.call(brush.move as never, [s0, s1])
      ignoreNextZoom = true
      const spanPx = px1 - px0
      if (spanPx < 1e-6) {
        overlay.call(zoom.transform, d3.zoomIdentity)
      } else {
        overlay.call(zoom.transform, d3.zoomIdentity.scale(w / spanPx).translate(-px0, 0))
      }
    })

    updateScatterX()
  })
}

$.when($.ready).then(async function () {
  const description = document.getElementById('description')
  if (description) {
    description.innerHTML = `
      <h2>Cloudflare Speed Test</h2>
      <p>Runs are gathered by cron and loaded from <code>/cloudflare-speedtest-runs/</code>.</p>
      <p class="text-muted" style="font-size:12px;margin-top:8px">
        The chart opens on the latest 7 days of runs. Drag the overview strip below to move the window (the main chart updates as you drag). Scroll on the chart to zoom, drag to pan, double‑click the chart to reset to the full range.
      </p>
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

    const tableEl = ensureSpeedtestTable()
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
