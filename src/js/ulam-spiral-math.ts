/**
 * Pure helpers for the Ulam spiral (no DOM / Chart imports).
 */

export type SpiralCell = {
  n: number
  x: number
  y: number
}

/** Sieve of Eratosthenes: primes[i] is true iff i is prime (i ≤ max). */
export function sievePrimes(max: number): boolean[] {
  const primes = new Array(max + 1).fill(true)
  if (max >= 0) primes[0] = false
  if (max >= 1) primes[1] = false
  for (let i = 2; i * i <= max; i++) {
    if (!primes[i]) continue
    for (let j = i * i; j <= max; j += i) {
      primes[j] = false
    }
  }
  return primes
}

/**
 * Square spiral of `side × side` cells (side should be odd so 1 sits in the centre).
 * Coordinates are relative to centre: (0,0) = 1, +x right, +y down (canvas-friendly).
 */
export function buildUlamSpiral(side: number): SpiralCell[] {
  const odd = side % 2 === 1 ? side : side + 1
  const max = odd * odd
  const cells: SpiralCell[] = []

  // right, up, left, down — after placing n, step once for n+1
  const dirs: Array<[number, number]> = [
    [1, 0],
    [0, -1],
    [-1, 0],
    [0, 1],
  ]
  let x = 0
  let y = 0
  let dir = 0
  let legLength = 1
  let stepsOnLeg = 0
  let legsAtThisLength = 0

  for (let n = 1; n <= max; n++) {
    cells.push({ n, x, y })
    if (n === max) break

    x += dirs[dir][0]
    y += dirs[dir][1]
    stepsOnLeg++

    if (stepsOnLeg === legLength) {
      stepsOnLeg = 0
      dir = (dir + 1) % 4
      legsAtThisLength++
      if (legsAtThisLength === 2) {
        legsAtThisLength = 0
        legLength++
      }
    }
  }

  return cells
}

/** Number of positive divisors (1 and n count). */
export function divisorCount(n: number): number {
  if (n <= 1) return n === 1 ? 1 : 0
  let count = 0
  const root = Math.floor(Math.sqrt(n))
  for (let i = 1; i <= root; i++) {
    if (n % i !== 0) continue
    count += i * i === n ? 1 : 2
  }
  return count
}
