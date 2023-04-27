let request = require('request')

// @ts-ignore
let fs = require('fs')

const base = 'https://www.awesomefoundation.org/en/chapters/melbourne/projects',
  target = ''

const Cookie = require('../config.json').Cookie

const options = {
  url: base + target,
  headers: {
    Cookie,
  },
}
console.log('cookie', Cookie)

request(options, function callback(err, response, html) {
  if (err) {
    console.log(err)
    response.end('error making request' + err)
  }
  console.log(html)

  fs.writeFile('output/test.html', html, function (err) {
    if (err) {
      return console.log(err)
    }
    console.log('The file was saved!')
  })
})

// const driver = makeDriver(options)		//Create driver
// xray.driver(driver)						        //Set driver

// xray('https://www.awesomefoundation.org/en/chapters/melbourne/projects', '.project', [
//   {
//     title: '.title',
//     link: 'a@href',
//     name: '.name',
//     url: '.url',
//     id: '@id',
//   },
// ]).write('output/awesome.json')
