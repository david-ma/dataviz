import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { CSV_COLUMNS, statues } from '../scripts/statues-data'

const csvPath = path.resolve(import.meta.dirname, '../public/dataviz/statues.csv')

describe('statues dataset', () => {
  test('has 100+ women and expanded goats', () => {
    const women = statues.filter((s) => s.type.startsWith('woman'))
    const goats = statues.filter((s) => s.type.startsWith('goat'))
    expect(women.length).toBeGreaterThanOrEqual(100)
    expect(goats.length).toBeGreaterThanOrEqual(10)
  })

  test('every row has required fields and finite coordinates', () => {
    for (const row of statues) {
      expect(row.name.length).toBeGreaterThan(0)
      expect(row.type.length).toBeGreaterThan(0)
      expect(row.url.startsWith('http')).toBe(true)
      expect(Number.isFinite(row.lat)).toBe(true)
      expect(Number.isFinite(row.long)).toBe(true)
      expect(row.lat).not.toBe(0)
      expect(row.long).not.toBe(0)
      // UK-ish bounding box (loose, includes NI)
      expect(row.lat).toBeGreaterThan(49)
      expect(row.lat).toBeLessThan(61.5)
      expect(row.long).toBeGreaterThan(-9)
      expect(row.long).toBeLessThan(3)
    }
  })

  test('types are from the allowed set', () => {
    const allowed = new Set([
      'woman',
      'woman_collective',
      'goat',
      'goat_with_figure',
      'goat_heraldic',
      'goat_relief',
    ])
    for (const row of statues) {
      expect(allowed.has(row.type)).toBe(true)
    }
  })

  test('no duplicate name+location pairs', () => {
    const keys = statues.map((s) => `${s.name}||${s.location}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  test('public CSV matches schema header and row count', () => {
    const text = readFileSync(csvPath, 'utf8').trim()
    const lines = text.split('\n')
    expect(lines[0]).toBe(CSV_COLUMNS.join(','))
    expect(lines.length - 1).toBe(statues.length)
  })
})
