console.log('lims.ts')

import { d3, Chart, decorateTable, _ } from './chart'

var lims = d3.json('/lims_logs').then((files: string[]) => {
  console.log(files)

  // files.forEach((file) => {
  //   processLog(file)
  // })

  const visitors = {}
  const hourly_visitors = {
    '00': [],
    '01': [],
    '02': [],
    '03': [],
    '04': [],
    '05': [],
    '06': [],
    '07': [],
    '08': [],
    '09': [],
    10: [],
    11: [],
    12: [],
    13: [],
    14: [],
    15: [],
    16: [],
    17: [],
    18: [],
    19: [],
    20: [],
    21: [],
    22: [],
    23: [],
  }

  const visitors_by_hour_by_type = {
    AGRF: {
      '00': [],
      '01': [],
      '02': [],
      '03': [],
      '04': [],
      '05': [],
      '06': [],
      '07': [],
      '08': [],
      '09': [],
      10: [],
      11: [],
      12: [],
      13: [],
      14: [],
      15: [],
      16: [],
      17: [],
      18: [],
      19: [],
      20: [],
      21: [],
      22: [],
      23: [],
    },
    client: {
      '00': [],
      '01': [],
      '02': [],
      '03': [],
      '04': [],
      '05': [],
      '06': [],
      '07': [],
      '08': [],
      '09': [],
      10: [],
      11: [],
      12: [],
      13: [],
      14: [],
      15: [],
      16: [],
      17: [],
      18: [],
      19: [],
      20: [],
      21: [],
      22: [],
      23: [],
    },
  }

  // Promise.all(files.map((log) => processLog(log))).then((data: any) => {
  d3.json('/AGRF/IISlogs_summary.json').then((data: any) => {
    console.log('Data is:', data)
    d3.select('#preview').html(`<pre>${JSON.stringify(data, null, 2)}</pre>`)

    data.forEach((day) => {
      _.merge(visitors, day.visitors)
      // console.log('Unique visitors', Object.keys(d.visitors).length)

      Object.entries(day.unique_visitors).forEach(([hour, visitors]) => {
        hourly_visitors[hour].push(Object.keys(visitors).length)

        const counter = {
          AGRF: 0,
          client: 0,
        }

        Object.keys(visitors).forEach((visitor) => {
          counter[AGRF_or_client(visitor)]++
        })
        visitors_by_hour_by_type.AGRF[hour].push(counter.AGRF)
        visitors_by_hour_by_type.client[hour].push(counter.client)
      })
    })

    console.log('Visitors', visitors)
    console.log('Length', Object.keys(visitors).length)

    console.log(JSON.stringify(Object.keys(visitors)))

    var hourly_visitors_avg = {}
    var max_visitors = {}

    var hourly_agrf_visitors_avg = {}
    var hourly_client_visitors_avg = {}
    var max_agrf_visitors = {}
    var max_client_visitors = {}

    Object.entries(hourly_visitors).forEach(([hour, visitors]) => {
      hourly_visitors_avg[hour] =
        visitors.reduce((acc, val) => acc + val, 0) / visitors.length

      max_visitors[hour] = Math.max(...visitors)

      hourly_agrf_visitors_avg[hour] =
        visitors_by_hour_by_type.AGRF[hour].reduce((acc, val) => acc + val, 0) /
        visitors_by_hour_by_type.AGRF[hour].length

      hourly_client_visitors_avg[hour] =
        visitors_by_hour_by_type.client[hour].reduce(
          (acc, val) => acc + val,
          0,
        ) / visitors_by_hour_by_type.client[hour].length

      max_agrf_visitors[hour] = Math.max(...visitors_by_hour_by_type.AGRF[hour])
      max_client_visitors[hour] = Math.max(
        ...visitors_by_hour_by_type.client[hour],
      )
    })

    console.log('Hourly visitors', hourly_visitors)
    console.log('Hourly visitors avg', hourly_visitors_avg)
    console.log('Max visitors', max_visitors)
    console.log('Hourly AGRF visitors avg', hourly_agrf_visitors_avg)
    console.log('Hourly client visitors avg', hourly_client_visitors_avg)
    console.log('Max AGRF visitors', max_agrf_visitors)
    console.log('Max client visitors', max_client_visitors)
  })
})

function AGRF_or_client(username) {
  // If it has capitals it's probably a client
  if (username.match(/[A-Z]/)) {
    return 'client'
  } else {
    return 'AGRF'
  }
}

function processLog(log) {
  return new Promise((resolve, reject) => {
    d3.text(`/AGRF/IISlogs/${log}`)
      .then((data) => {
        return new Promise((resolve, reject) => {
          const visits = []
          const visitors = {}
          d3.tsvParseRows(data, function ([line]) {
            if (line.startsWith('#')) {
              return null
            }

            var [
              date,
              time,
              s_ip,
              cs_method,
              cs_uri_stem,
              cs_uri_query,
              s_port,
              cs_username,
              c_ip,
              cs_User_Agent,
              cs_Referer,
              sc_status,
              sc_substatus,
              sc_win32_status,
              time_taken,
            ] = line.split(' ')

            if (cs_username === '-') {
              return null
            }

            visits.push({
              date,
              time,
              s_ip,
              cs_method,
              cs_uri_stem,
              cs_uri_query,
              s_port,
              cs_username,
              c_ip,
              cs_User_Agent,
              cs_Referer,
              sc_status,
              sc_substatus,
              sc_win32_status,
              time_taken,
            })

            visitors[cs_username] = visitors[cs_username] || 0
            visitors[cs_username]++

            return null
          })
          resolve({ visits, visitors })
        })
      })
      .then((data: any) => {
        // Bucket the visits by hour
        var visits = data.visits
        var visitors = data.visitors
        var hours = {}
        var unique_visitors = {}
        visits.forEach((visit) => {
          var [hour] = visit.time.split(':')
          hours[hour] = hours[hour] || 0
          hours[hour]++

          unique_visitors[hour] = unique_visitors[hour] || {}
          unique_visitors[hour][visit.cs_username] = true
        })
        // console.log('Visits by hour', hours)
        // console.log('Unique visitors by hour', unique_visitors)
        // Count
        var unique_visit_count = {}
        Object.entries(unique_visitors).forEach(([hour, visitors]) => {
          unique_visit_count[hour] = Object.keys(visitors).length
        })
        // console.log('Unique visit count by hour', unique_visit_count)
        // console.log('Total unique visitors', Object.keys(data.visitors).length)
        // console.log(Object.keys(data.visitors))

        resolve({
          // visits,
          visitors,
          hours,
          unique_visitors,
          unique_visit_count,
        })
      })
  })
}
