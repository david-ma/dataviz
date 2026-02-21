import { Chart } from './chart'
import * as d3 from 'd3'

/** Benford's law: expected proportion for leading digit d (1–9) */
function benfordExpected(d: number): number {
  return d >= 1 && d <= 9 ? Math.log10(1 + 1 / d) : 0
}

/** First digit of a positive number (1–9), or null if not applicable */
function firstDigit(n: number): number | null {
  if (n <= 0 || !Number.isFinite(n)) return null
  const s = Math.floor(n).toString()
  const d = parseInt(s[0], 10)
  return d >= 1 ? d : null
}

type TwitterData = {
  Follower_Count: string
  Friend_Count: string
  Status_Count: string
  UserID: string
}

type BenfordRow = {
  digit: number
  observed: number
  expected: number
  observedPct: number
  expectedPct: number
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

d3.tsv('/twitterAnonymized.tdf')
  .then((data) => {
    const rows = data as unknown as TwitterData[]

    const countColumns = ['Follower_Count', 'Friend_Count', 'Status_Count'] as const
    const allFirstDigits: number[] = []

    rows.forEach((row) => {
      countColumns.forEach((col) => {
        const raw = row[col]
        if (raw == null || raw === '') return
        const n = parseFloat(String(raw).replace(/,/g, ''))
        const d = firstDigit(n)
        if (d != null) allFirstDigits.push(d)
      })
    })

    const total = allFirstDigits.length
    const observedCounts = d3.rollup(
      allFirstDigits,
      (v) => v.length,
      (d) => d
    )

    // 10×10 tally: matrix[firstDigit][followingDigit] = count of "first followed by following"
    const digitPairCounts: number[][] = Array.from({ length: 10 }, () => Array(10).fill(0))
    rows.forEach((row) => {
      countColumns.forEach((col) => {
        const raw = row[col]
        if (raw == null || raw === '') return
        const n = parseFloat(String(raw).replace(/,/g, ''))
        if (!Number.isFinite(n) || n <= 0) return
        const s = Math.floor(n).toString()
        for (let i = 0; i < s.length - 1; i++) {
          const a = parseInt(s[i], 10)
          const b = parseInt(s[i + 1], 10)
          if (a >= 0 && a <= 9 && b >= 0 && b <= 9) digitPairCounts[a][b] += 1
        }
      })
    })

    const benfordData: BenfordRow[] = DIGITS.map((digit) => {
      const observed = observedCounts.get(digit) ?? 0
      const expectedPct = benfordExpected(digit)
      const expected = total * expectedPct
      return {
        digit,
        observed,
        expected,
        observedPct: total > 0 ? observed / total : 0,
        expectedPct,
      }
    })

    const chart = new Chart({
      element: 'chart',
      title: "First-digit distribution: Twitter counts vs Benford's law",
      xLabel: 'Leading digit',
      yLabel: 'Proportion',
      width: 960,
      height: 500,
      data: benfordData,
    })

    chart.scratchpad((c) => {
      const plot = c.plot
      const width = c.innerWidth
      const height = c.innerHeight

      const x = d3
        .scaleBand()
        .domain(DIGITS.map(String))
        .range([0, width])
        .paddingInner(0.2)
        .paddingOuter(0.2)

      const yMax = Math.max(
        ...benfordData.map((d) => Math.max(d.observedPct, d.expectedPct)),
        0.35
      )
      const y = d3.scaleLinear().domain([0, yMax]).range([height, 0])

      const barWidth = x.bandwidth() / 2.5

      const xAxis = d3.axisBottom(x).tickFormat((d) => d)
      const yAxis = d3.axisLeft(y).tickFormat(d3.format('.0%'))

      plot
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)

      plot.append('g').attr('class', 'y axis').call(yAxis)

      plot
        .selectAll('.bar-observed')
        .data(benfordData)
        .join('rect')
        .attr('class', 'bar-observed')
        .attr('x', (d) => (x(String(d.digit)) ?? 0) + (x.bandwidth() - barWidth * 2) / 2)
        .attr('y', (d) => y(d.observedPct))
        .attr('width', barWidth)
        .attr('height', (d) => Math.max(0, height - y(d.observedPct)))
        .attr('fill', c.colours[0])

      plot
        .selectAll('.bar-expected')
        .data(benfordData)
        .join('rect')
        .attr('class', 'bar-expected')
        .attr(
          'x',
          (d) =>
            (x(String(d.digit)) ?? 0) + (x.bandwidth() - barWidth * 2) / 2 + barWidth
        )
        .attr('y', (d) => y(d.expectedPct))
        .attr('width', barWidth)
        .attr('height', (d) => Math.max(0, height - y(d.expectedPct)))
        .attr('fill', c.colours[1])

      const legend = plot
        .append('g')
        .attr('class', 'benford-legend')
        .attr('transform', `translate(${width - 160}, 10)`)

      legend
        .append('rect')
        .attr('width', 150)
        .attr('height', 44)
        .attr('fill', 'white')
        .attr('stroke', '#ccc')

      legend
        .append('rect')
        .attr('x', 10)
        .attr('y', 12)
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', c.colours[0])
      legend
        .append('text')
        .attr('x', 30)
        .attr('y', 23)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .text('Observed')

      legend
        .append('rect')
        .attr('x', 10)
        .attr('y', 30)
        .attr('width', 14)
        .attr('height', 14)
        .attr('fill', c.colours[1])
      legend
        .append('text')
        .attr('x', 30)
        .attr('y', 41)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '12px')
        .text("Benford's law")
    })

    // Heatmap: digit i followed by digit j, normalised by row (proportion given leading digit)
    const rowTotals = digitPairCounts.map((row) => row.reduce((a, b) => a + b, 0))
    const heatmapData: { i: number; j: number; count: number; proportion: number; scaleInRow: number }[] = []
    for (let i = 0; i <= 9; i++) {
      const total = rowTotals[i] || 1
      const proportions = digitPairCounts[i].map((c) => c / total)
      const maxInRow = Math.max(...proportions, 1e-9)
      for (let j = 0; j <= 9; j++) {
        const count = digitPairCounts[i][j]
        const proportion = count / total
        heatmapData.push({ i, j, count, proportion, scaleInRow: proportion / maxInRow })
      }
    }

    const heatmapChart = new Chart({
      element: 'chart-heatmap',
      title: 'Digit followed by digit (row-normalised: proportion given leading digit)',
      xLabel: 'Following digit',
      yLabel: 'Leading digit',
      width: 960,
      height: 500,
      data: heatmapData,
    })

    heatmapChart.scratchpad((c) => {
      const plot = c.plot
      const width = c.innerWidth
      const height = c.innerHeight

      const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      const x = d3
        .scaleBand()
        .domain(digits.map(String))
        .range([0, width])
        .padding(0.02)
      const y = d3
        .scaleBand()
        .domain(digits.map(String))
        .range([0, height])
        .padding(0.02)

      const colorScale = d3
        .scaleSequential(d3.interpolateBlues)
        .domain([0, 1])

      plot
        .selectAll('.heatmap-cell')
        .data(heatmapData)
        .join('rect')
        .attr('class', 'heatmap-cell')
        .attr('x', (d) => x(String(d.j)) ?? 0)
        .attr('y', (d) => y(String(d.i)) ?? 0)
        .attr('width', x.bandwidth())
        .attr('height', y.bandwidth())
        .attr('fill', (d) => colorScale(d.scaleInRow))
        .attr('title', (d) => `${d.i}→${d.j}: ${d.count} (${(d.proportion * 100).toFixed(1)}%)`)
        .attr('stroke', (d) => (d.i === 6 && d.j === 7 ? 'black' : 'none'))
        .attr('stroke-width', (d) => (d.i === 6 && d.j === 7 ? 1 : 0))

      plot
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))

      plot.append('g').attr('class', 'y axis').call(d3.axisLeft(y))
    })
  })
  .catch((err) => {
    console.error('Failed to load Twitter data:', err)
  })
