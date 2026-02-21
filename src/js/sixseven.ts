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
  })
  .catch((err) => {
    console.error('Failed to load Twitter data:', err)
  })
