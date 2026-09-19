import { describe, expect, test } from 'bun:test'
import {
  buildUlamSpiral,
  divisorCount,
  sievePrimes,
} from '../src/js/ulam-spiral-math'

describe('ulam-spiral helpers', () => {
  test('sievePrimes marks small primes correctly', () => {
    const p = sievePrimes(20)
    expect(p[0]).toBe(false)
    expect(p[1]).toBe(false)
    expect(p[2]).toBe(true)
    expect(p[3]).toBe(true)
    expect(p[4]).toBe(false)
    expect(p[17]).toBe(true)
    expect(p[19]).toBe(true)
    expect(p[20]).toBe(false)
  })

  test('buildUlamSpiral(5) places 1 at centre and fills 1..25', () => {
    const cells = buildUlamSpiral(5)
    expect(cells).toHaveLength(25)
    expect(cells[0]).toEqual({ n: 1, x: 0, y: 0 })
    expect(cells[1]).toEqual({ n: 2, x: 1, y: 0 })
    expect(cells[2]).toEqual({ n: 3, x: 1, y: -1 })
    expect(cells[3]).toEqual({ n: 4, x: 0, y: -1 })
    expect(cells[4]).toEqual({ n: 5, x: -1, y: -1 })
    expect(cells[24].n).toBe(25)

    const nums = new Set(cells.map((c) => c.n))
    expect(nums.size).toBe(25)
    for (let i = 1; i <= 25; i++) expect(nums.has(i)).toBe(true)
  })

  test('divisorCount matches known values', () => {
    expect(divisorCount(1)).toBe(1)
    expect(divisorCount(7)).toBe(2)
    expect(divisorCount(12)).toBe(6) // 1,2,3,4,6,12
    expect(divisorCount(36)).toBe(9) // square
  })
})
