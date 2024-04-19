/**
 * @jest-environment jsdom
 */

import { describe, expect, test } from '@jest/globals'

import { camelize } from '../src/js/utils'

const testCases = [
  {
    input: 'Georgia',
    expected: 'georgia',
  },
  {
    input: 'Georgia, USA',
    expected: 'georgiaUSA',
  },
  {
    input: 'Georgia, USA, 2021',
    expected: 'georgiaUSA2021',
  },
  {
    input: 'Abcjijew.awejfi. aw.efawef. awef',
    expected: 'abcjijewAwejfiAwEfawefAwef',
  },
  {
    input: 'Apples and Grapes (1879–1880).jpg',
    expected: 'applesAndGrapes18791880Jpg',
  }
]

describe('Test camelize', () => {
  testCases.forEach(({ input, expected }) => {
    test(`camelize(${input})`, () => {
      expect(camelize(input)).toBe(expected)
    })
  })
})

// import { Chart, hello } from '../dist/js/chart.js'
import { Chart, hello } from '../src/js/chart'
// import { Chart } from '../public/js/chart'

describe('Test Chart', () => {
  test('Chart', () => {
    // expect(new Chart()).toBeTruthy()
    expect(hello).toBe('world')

  })
})
