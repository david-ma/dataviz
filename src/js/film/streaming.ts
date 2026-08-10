export type MetricKey = 'subscribers' | 'revenue' | 'originals' | 'awards'

export type StreamingRow = {
  company: string
  year: number
  subscribersMillions?: number | null
  revenueBillions?: number | null
  originalsCount?: number | null
  awards?: number | null
  source?: string
  note?: string
}

export type MergerEvent = {
  acquirer: string
  acquiree: string
  year: number
  note?: string
  source?: string
}

export type CompanySeriesPoint = {
  company: string
  year: number
  value: number
}

export type CompanySeries = {
  company: string
  points: CompanySeriesPoint[]
}

export type StackDatum = {
  year: number
  [company: string]: number
}

export type BuildSeriesResult = {
  companies: string[]
  years: number[]
  stackInput: StackDatum[]
  series: CompanySeries[]
}

const addNumber = (current: number | undefined | null, incoming: number | undefined | null): number => {
  if (typeof current !== 'number') {
    return typeof incoming === 'number' ? incoming : 0
  }

  if (typeof incoming !== 'number') {
    return current
  }

  return current + incoming
}

const resolveCompany = (company: string, year: number, mergers: MergerEvent[]): string => {
  let result = company
  let changed = true

  while (changed) {
    changed = false
    for (const merger of mergers) {
      if (merger.acquiree === result && year >= merger.year) {
        result = merger.acquirer
        changed = true
      }
    }
  }

  return result
}

const sumRowMetrics = (existing: StreamingRow, incoming: StreamingRow): StreamingRow => {
  return {
    company: existing.company,
    year: existing.year,
    subscribersMillions: addNumber(existing.subscribersMillions, incoming.subscribersMillions),
    revenueBillions: addNumber(existing.revenueBillions, incoming.revenueBillions),
    originalsCount: addNumber(existing.originalsCount, incoming.originalsCount),
    awards: addNumber(existing.awards, incoming.awards),
    note: existing.note ?? incoming.note,
    source: existing.source ?? incoming.source,
  }
}

export const applyMergers = (rows: StreamingRow[], mergers: MergerEvent[]): StreamingRow[] => {
  const sortedMergers = [...mergers].sort((a, b) => a.year - b.year)
  const merged: Record<string, StreamingRow> = {}

  rows.forEach((row) => {
    const targetCompany = resolveCompany(row.company, row.year, sortedMergers)
    const key = `${targetCompany}-${row.year}`
    const mappedRow: StreamingRow = {
      ...row,
      company: targetCompany,
    }

    if (merged[key]) {
      merged[key] = sumRowMetrics(merged[key], mappedRow)
    } else {
      merged[key] = {
        company: targetCompany,
        year: row.year,
        subscribersMillions: row.subscribersMillions ?? null,
        revenueBillions: row.revenueBillions ?? null,
        originalsCount: row.originalsCount ?? null,
        awards: row.awards ?? null,
        note: row.note,
        source: row.source,
      }
    }
  })

  return Object.values(merged).sort((a, b) => a.year - b.year)
}

export const metricConfig: Record<
  MetricKey,
  { label: string; unit: string; accessor: (row: StreamingRow) => number | null; format: (value: number) => string }
> = {
  subscribers: {
    label: 'Subscribers (millions)',
    unit: 'M',
    accessor: (row: StreamingRow) => row.subscribersMillions ?? null,
    format: (value: number) => `${value.toFixed(0)}M`,
  },
  revenue: {
    label: 'Revenue (USD billions)',
    unit: 'B',
    accessor: (row: StreamingRow) => row.revenueBillions ?? null,
    format: (value: number) => `$${value.toFixed(1)}B`,
  },
  originals: {
    label: 'Original titles released',
    unit: '',
    accessor: (row: StreamingRow) => row.originalsCount ?? null,
    format: (value: number) => `${value.toFixed(0)} titles`,
  },
  awards: {
    label: 'Major awards (year)',
    unit: '',
    accessor: (row: StreamingRow) => row.awards ?? null,
    format: (value: number) => `${value.toFixed(0)} awards`,
  },
}

export const buildSeries = (rows: StreamingRow[], mergers: MergerEvent[], metric: MetricKey): BuildSeriesResult => {
  const mergedRows = applyMergers(rows, mergers)
  const companies = Array.from(new Set(mergedRows.map((row) => row.company))).sort()
  const years = Array.from(new Set(mergedRows.map((row) => row.year))).sort((a, b) => a - b)

  const valueByKey: Record<string, number> = {}
  const accessor = metricConfig[metric].accessor

  mergedRows.forEach((row) => {
    const value = accessor(row)
    if (typeof value !== 'number') {
      return
    }
    const key = `${row.company}-${row.year}`
    valueByKey[key] = value
  })

  const stackInput: StackDatum[] = years.map((year) => {
    const entry: StackDatum = { year }
    companies.forEach((company) => {
      const key = `${company}-${year}`
      entry[company] = valueByKey[key] ?? 0
    })
    return entry
  })

  const series: CompanySeries[] = companies.map((company) => {
    const points: CompanySeriesPoint[] = years.map((year) => {
      const key = `${company}-${year}`
      return {
        company,
        year,
        value: valueByKey[key] ?? 0,
      }
    })

    return {
      company,
      points,
    }
  })

  return {
    companies,
    years,
    stackInput,
    series,
  }
}

export const streamingRows: StreamingRow[] = [
  {
    company: 'Netflix',
    year: 2019,
    subscribersMillions: 167,
    revenueBillions: 20.2,
    originalsCount: 371,
    awards: 27,
    source: 'Netflix 2019 annual report; Statista',
  },
  {
    company: 'Netflix',
    year: 2020,
    subscribersMillions: 203,
    revenueBillions: 24.9,
    originalsCount: 373,
    awards: 36,
    source: 'Netflix 2020 annual report; Statista',
  },
  {
    company: 'Netflix',
    year: 2021,
    subscribersMillions: 222,
    revenueBillions: 29.7,
    originalsCount: 403,
    awards: 44,
    source: 'Netflix 2021 annual report; Statista',
  },
  {
    company: 'Netflix',
    year: 2022,
    subscribersMillions: 231,
    revenueBillions: 31.6,
    originalsCount: 452,
    awards: 26,
    source: 'Netflix 2022 annual report; Statista',
  },
  {
    company: 'Netflix',
    year: 2023,
    subscribersMillions: 247,
    revenueBillions: 33.7,
    originalsCount: 365,
    awards: 22,
    source: 'Netflix FY23 earnings; Variety',
  },
  {
    company: 'Netflix',
    year: 2024,
    subscribersMillions: 270,
    revenueBillions: 36.2,
    originalsCount: 340,
    awards: 0,
    note: '2024 revenue/originals rounded forward-looking; awards placeholder until season end',
    source: 'Netflix FY24 guidance; trade press',
  },
  {
    company: 'Disney+',
    year: 2019,
    subscribersMillions: 26,
    revenueBillions: 3.0,
    originalsCount: 16,
    awards: 2,
    source: 'Disney FY19 filings; launch quarter',
  },
  {
    company: 'Disney+',
    year: 2020,
    subscribersMillions: 95,
    revenueBillions: 4.5,
    originalsCount: 32,
    awards: 3,
    source: 'Disney FY20 earnings; Statista',
  },
  {
    company: 'Disney+',
    year: 2021,
    subscribersMillions: 118,
    revenueBillions: 5.2,
    originalsCount: 45,
    awards: 4,
    source: 'Disney FY21 earnings; Statista',
  },
  {
    company: 'Disney+',
    year: 2022,
    subscribersMillions: 164,
    revenueBillions: 7.4,
    originalsCount: 54,
    awards: 6,
    source: 'Disney FY22 earnings; Statista',
  },
  {
    company: 'Disney+',
    year: 2023,
    subscribersMillions: 146,
    revenueBillions: 8.0,
    originalsCount: 48,
    awards: 5,
    source: 'Disney FY23 earnings; company filings',
  },
  {
    company: 'Disney+',
    year: 2024,
    subscribersMillions: 150,
    revenueBillions: 8.6,
    originalsCount: 44,
    awards: 0,
    note: 'Early FY24 run-rate; awards placeholder',
    source: 'Disney FY24 Q2 earnings call',
  },
  {
    company: 'Hulu',
    year: 2019,
    subscribersMillions: 28,
    revenueBillions: 3.5,
    originalsCount: 30,
    awards: 3,
    source: 'Disney FY19; Statista',
  },
  {
    company: 'Hulu',
    year: 2020,
    subscribersMillions: 36,
    revenueBillions: 4.4,
    originalsCount: 35,
    awards: 3,
    source: 'Disney FY20; Statista',
  },
  {
    company: 'Hulu',
    year: 2021,
    subscribersMillions: 42,
    revenueBillions: 4.7,
    originalsCount: 38,
    awards: 4,
    source: 'Disney FY21; Statista',
  },
  {
    company: 'Hulu',
    year: 2022,
    subscribersMillions: 45,
    revenueBillions: 5.3,
    originalsCount: 41,
    awards: 6,
    source: 'Disney FY22; Statista',
  },
  {
    company: 'Hulu',
    year: 2023,
    subscribersMillions: 48,
    revenueBillions: 5.8,
    originalsCount: 40,
    awards: 5,
    source: 'Disney FY23; company filings',
  },
  {
    company: 'Hulu',
    year: 2024,
    subscribersMillions: 50,
    revenueBillions: 6.2,
    originalsCount: 36,
    awards: 0,
    note: 'Rounded estimate pre-integration into Disney bundle',
    source: 'Disney FY24 guidance',
  },
  {
    company: 'Prime Video',
    year: 2019,
    subscribersMillions: 100,
    revenueBillions: 14.0,
    originalsCount: 90,
    awards: 7,
    source: 'Amazon shareholder letter 2020; Statista',
  },
  {
    company: 'Prime Video',
    year: 2020,
    subscribersMillions: 150,
    revenueBillions: 17.6,
    originalsCount: 105,
    awards: 9,
    source: 'Amazon 2020 filings; Statista',
  },
  {
    company: 'Prime Video',
    year: 2021,
    subscribersMillions: 175,
    revenueBillions: 20.6,
    originalsCount: 115,
    awards: 11,
    source: 'Amazon 2021 filings; Statista',
  },
  {
    company: 'Prime Video',
    year: 2022,
    subscribersMillions: 200,
    revenueBillions: 24.0,
    originalsCount: 130,
    awards: 9,
    source: 'Amazon 2022 filings; Statista',
  },
  {
    company: 'Prime Video',
    year: 2023,
    subscribersMillions: 205,
    revenueBillions: 26.4,
    originalsCount: 125,
    awards: 8,
    source: 'Amazon FY23 results; press',
  },
  {
    company: 'Prime Video',
    year: 2024,
    subscribersMillions: 210,
    revenueBillions: 28.1,
    originalsCount: 110,
    awards: 0,
    note: 'Rounded estimate after ads rollout; awards placeholder',
    source: 'Amazon FY24 outlook; press',
  },
  {
    company: 'Max',
    year: 2020,
    subscribersMillions: 38,
    revenueBillions: 6.8,
    originalsCount: 50,
    awards: 8,
    source: 'WarnerMedia 2020 earnings; Statista',
  },
  {
    company: 'Max',
    year: 2021,
    subscribersMillions: 45,
    revenueBillions: 7.4,
    originalsCount: 62,
    awards: 10,
    source: 'WarnerMedia 2021 earnings; Statista',
  },
  {
    company: 'Max',
    year: 2022,
    subscribersMillions: 76,
    revenueBillions: 9.0,
    originalsCount: 70,
    awards: 12,
    source: 'Warner Bros. Discovery 2022 filings; press',
  },
  {
    company: 'Max',
    year: 2023,
    subscribersMillions: 95,
    revenueBillions: 10.2,
    originalsCount: 68,
    awards: 9,
    source: 'Warner Bros. Discovery FY23; press',
  },
  {
    company: 'Max',
    year: 2024,
    subscribersMillions: 99,
    revenueBillions: 10.8,
    originalsCount: 64,
    awards: 0,
    note: 'Rounded FY24 guide; awards placeholder',
    source: 'Warner Bros. Discovery FY24 outlook',
  },
  {
    company: 'Discovery+',
    year: 2021,
    subscribersMillions: 18,
    revenueBillions: 3.0,
    originalsCount: 45,
    awards: 2,
    source: 'Discovery FY21 filings',
  },
  {
    company: 'Discovery+',
    year: 2022,
    subscribersMillions: 22,
    revenueBillions: 3.6,
    originalsCount: 48,
    awards: 2,
    source: 'Discovery FY22 filings',
  },
]

export const mergers: MergerEvent[] = [
  {
    acquirer: 'Max',
    acquiree: 'Discovery+',
    year: 2023,
    note: 'HBO Max rebranded to Max and bundled Discovery+ content',
    source: 'Warner Bros. Discovery 2023 launch announcement',
  },
  {
    acquirer: 'Disney+',
    acquiree: 'Hulu',
    year: 2024,
    note: 'Disney moves to fully acquire Hulu and integrate the bundle',
    source: 'Disney FY24 acquisition filings',
  },
]

