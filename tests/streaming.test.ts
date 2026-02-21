import { expect, test } from 'bun:test'
import {
  applyMergers,
  buildSeries,
  MetricKey,
  StreamingRow,
  MergerEvent,
} from '../src/js/data/streaming'

test('applyMergers combines acquiree into acquirer from merger year', () => {
  const rows: StreamingRow[] = [
    { company: 'Alpha+', year: 2022, subscribersMillions: 10 },
    { company: 'Beta', year: 2022, subscribersMillions: 5 },
    { company: 'Beta', year: 2023, subscribersMillions: 6 },
    { company: 'Alpha+', year: 2023, subscribersMillions: 11 },
  ]

  const events: MergerEvent[] = [
    {
      acquirer: 'Alpha+',
      acquiree: 'Beta',
      year: 2023,
    },
  ]

  const merged = applyMergers(rows, events)
  const lookup = new Map(
    merged.map((row) => [`${row.company}-${row.year}`, row.subscribersMillions])
  )

  expect(lookup.get('Beta-2022')).toBe(5)
  expect(lookup.get('Alpha+-2022')).toBe(10)
  expect(lookup.get('Alpha+-2023')).toBe(17)
  expect(lookup.get('Beta-2023')).toBeUndefined()
})

test('buildSeries outputs stack input for selected metric', () => {
  const rows: StreamingRow[] = [
    {
      company: 'Alpha+',
      year: 2022,
      subscribersMillions: 10,
      revenueBillions: 1,
    },
    { company: 'Beta', year: 2022, subscribersMillions: 5, revenueBillions: 0.4 },
    { company: 'Beta', year: 2023, subscribersMillions: 6, revenueBillions: 0.6 },
  ]

  const events: MergerEvent[] = [
    {
      acquirer: 'Alpha+',
      acquiree: 'Beta',
      year: 2023,
    },
  ]

  const metric: MetricKey = 'subscribers'
  const result = buildSeries(rows, events, metric)

  expect(result.companies).toEqual(['Alpha+', 'Beta'])
  expect(result.years).toEqual([2022, 2023])
  expect(result.stackInput[0]['Alpha+']).toBe(10)
  expect(result.stackInput[0].Beta).toBe(5)
  expect(result.stackInput[1]['Alpha+']).toBe(6) // merged Beta in 2023
  expect(result.stackInput[1].Beta).toBe(0)
})
