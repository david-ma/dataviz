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

  return {
    ts,
    external_ip: getExternalIp(run),
    download_mbps: run.download?.mbps ?? 0,
    upload_mbps: run.upload?.mbps ?? 0,
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

function drawTimeseries(chart: Chart, points: SpeedtestPoint[]): void {
  const data = points
    .filter((p) => Number.isFinite(p.download_mbps) && Number.isFinite(p.upload_mbps))
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
  const y = d3.scaleLinear().range([chart.innerHeight, 0])

  x.domain(d3.extent(data, (d) => d.ts) as [Date, Date])
  const maxY = d3.max(data, (d) => Math.max(d.download_mbps, d.upload_mbps)) ?? 1
  y.domain([0, maxY * 1.1])

  const externalIps = Array.from(new Set(data.map((d) => d.external_ip))).sort()
  const ipColor = d3
    .scaleOrdinal<string, string>()
    .domain(externalIps)
    .range([...IP_LINE_PALETTE, ...d3.schemeTableau10])

  const dl = d3
    .line<SpeedtestPoint>()
    .x((d) => x(d.ts))
    .y((d) => y(d.download_mbps))

  const ul = d3
    .line<SpeedtestPoint>()
    .x((d) => x(d.ts))
    .y((d) => y(d.upload_mbps))

  chart.ready((c) => {
    const byIp = d3.group(data, (d) => d.external_ip)

    for (const ip of externalIps) {
      const col = ipColor(ip)
      const series = (byIp.get(ip) ?? []).slice().sort((a, b) => a.ts.getTime() - b.ts.getTime())
      if (series.length >= 2) {
        c.plot
          .append('path')
          .datum(series)
          .attr('class', 'line')
          .attr('fill', 'none')
          .attr('stroke', col)
          .attr('stroke-width', 2)
          .attr('d', dl)

        c.plot
          .append('path')
          .datum(series)
          .attr('class', 'line')
          .attr('fill', 'none')
          .attr('stroke', col)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '6 4')
          .attr('d', ul)
      } else if (series.length === 1) {
        const p = series[0]
        c.plot
          .append('circle')
          .attr('cx', x(p.ts))
          .attr('cy', y(p.download_mbps))
          .attr('r', 4)
          .attr('fill', col)
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
        c.plot
          .append('circle')
          .attr('cx', x(p.ts))
          .attr('cy', y(p.upload_mbps))
          .attr('r', 4)
          .attr('fill', 'none')
          .attr('stroke', col)
          .attr('stroke-width', 2)
      }
    }

    c.plot
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0,${c.innerHeight})`)
      .call(d3.axisBottom(x).ticks(6))

    c.plot
      .append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(6))

    const legendPad = 10
    const rowH = 18
    const legendW = Math.min(c.innerWidth - 20, 320)
    const legendH = legendPad * 2 + 14 + externalIps.length * rowH

    const legend = c.plot.append('g').attr('transform', 'translate(10,10)')
    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', legendW)
      .attr('height', legendH)
      .attr('fill', 'rgba(255,255,255,0.92)')
      .attr('stroke', 'rgba(0,0,0,0.1)')

    legend
      .append('text')
      .attr('x', legendPad)
      .attr('y', 22)
      .attr('fill', '#333')
      .style('font-size', '12px')
      .style('font-weight', '600')
      .text('Colour = external IP · solid = download · dashed = upload')

    externalIps.forEach((ip, i) => {
      const y0 = 32 + i * rowH
      const col = ipColor(ip)
      legend
        .append('line')
        .attr('x1', legendPad)
        .attr('x2', legendPad + 28)
        .attr('y1', y0)
        .attr('y2', y0)
        .attr('stroke', col)
        .attr('stroke-width', 3)
      legend
        .append('text')
        .attr('x', legendPad + 36)
        .attr('y', y0 + 4)
        .attr('fill', '#333')
        .style('font-size', '11px')
        .text(ip.length > 36 ? `${ip.slice(0, 34)}…` : ip)
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

  const chart = new Chart({
    element: 'chart',
    title: 'Internet speed over time (Mbps)',
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

    drawTimeseries(chart, points)

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
