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

import { Chart, _, $, d3 } from '../src/js/chart' // Source code
// import { Chart, hello } from '../dist/js/chart.js' // Development artifact
// import { Chart } from '../public/js/chart' // Production artifact

describe('Test Chart', () => {
  test('Chart exports', () => {
    expect(Chart).toBeTruthy()
    expect(_).toBeTruthy()
    expect($).toBeTruthy()
    expect(d3).toBeTruthy()

    expect($.fn.jquery).toBe('3.7.1')
    expect(_.VERSION).toBe('4.17.21')
  })

  test('Chart constructor', () => {
    document.body.innerHTML = '<div id="war_chart"></div>'

    const chart = new Chart({
      element: 'war_chart',
      data: {},
      nav: false,
    })

    expect(chart).toBeTruthy()
    expect(chart.element).toBe('war_chart')
    expect(chart.data).toEqual({})
    // expect(chart.nav).toBe(false)
  })
})
