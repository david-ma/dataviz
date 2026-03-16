/**
 * @jest-environment jsdom
 */

import { describe, expect, test } from '@jest/globals'

import { camelize } from '../src/js/utils'
import {
  Chart,
  classifyName,
  mapDistance,
  type Coordinates,
  _,
  $,
  d3,
} from '../src/js/chart'

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

describe('classifyName', () => {
  test('replaces slashes, brackets, spaces, ampersand with hyphens', () => {
    expect(classifyName('a/b\\c')).toBe('a-b-c')
    expect(classifyName('Georgia, USA')).toBe('Georgia,-USA') // comma not in regex
  })
  test('produces id-safe strings (no spaces, parens, dots)', () => {
    expect(classifyName('World (region)')).toBe('World--region-')
    expect(classifyName('Apples & Grapes')).toBe('Apples---Grapes')
  })
})

describe('mapDistance', () => {
  test('returns 0 for same point', () => {
    const a: Coordinates = { latitude: -37.8, longitude: 145.0 }
    expect(mapDistance(a, a)).toBe(0)
  })
  test('returns positive distance for Sydney–Melbourne', () => {
    const syd: Coordinates = { latitude: -33.87, longitude: 151.21 }
    const mel: Coordinates = { latitude: -37.81, longitude: 144.96 }
    const d = mapDistance(syd, mel)
    expect(d).toBeGreaterThan(600)
    expect(d).toBeLessThan(750)
  })
})

describe('Chart', () => {
  test('Chart exports', () => {
    expect(Chart).toBeTruthy()
    expect(_).toBeTruthy()
    expect($).toBeTruthy()
    expect(d3).toBeTruthy()

    if ($.fn && $.fn.jquery) {
      expect($.fn.jquery).toBeTruthy()
    }
    expect(_.VERSION).toBeTruthy()
  })

  test('Chart constructor', () => {
    if (typeof document === 'undefined') {
      return
    }

    document.body.innerHTML = '<div id="war_chart"></div>'

    const chart = new Chart({
      element: 'war_chart',
      data: {},
      nav: false,
    })

    expect(chart).toBeTruthy()
    expect(chart.element).toBe('war_chart')
    expect(chart.data).toEqual({})
  })

  test('loading: true shows skeleton and ready() replaces it', () => {
    if (typeof document === 'undefined') {
      return
    }

    document.body.innerHTML = '<div id="loading_chart"></div>'

    const chart = new Chart({
      element: 'loading_chart',
      title: 'Test chart',
      loading: true,
      nav: false,
    })

    const container = document.getElementById('loading_chart')
    expect(container?.querySelector('.chart-loading')).toBeTruthy()
    expect(container?.querySelector('.chart-title')?.textContent).toBe('Test chart')

    chart.ready((c) => {
      c.plot.append('circle').attr('r', 5).attr('cx', 10).attr('cy', 10)
    })

    expect(container?.querySelector('.chart-loading')).toBeFalsy()
    expect(container?.querySelector('.plot circle')).toBeTruthy()
  })
})
