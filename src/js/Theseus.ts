import { Chart, decorateTable } from 'chart'
// import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'

console.log('Running example.ts')
console.log('Hello World')

// Let's add a custom extension to Showdown to handle MediaWiki markup.
// Square brackets [[ ]] should become links to wikipedia https://en.wikipedia.org/wiki/
// If there is a pipe | then the text before the pipe should be the link text

// An image like this:
// [[File:Teseo e Arianna, Pompei.jpg|thumb|200px|A [[Fresco]] from [[Pompeii]] depicting Theseus and Ariadne escaping from Crete. According to Plutarch, the Athenians preserved the ship that Theseus used to escape, by replacing the parts one by one as they decayed.]]
// Should become this:
// <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Teseo_e_Arianna%2C_Pompei.jpg/200px-Teseo_e_Arianna%2C_Pompei.jpg" alt="thumb|200px|A Fresco from Pompeii depicting Theseus and Ariadne escaping from Crete. According to Plutarch, the Athenians preserved the ship that Theseus used to escape, by replacing the parts one by one as they decayed.">

// Sections are denoted like this:
// ==History==
// And should become this:
// <h2>History</h2>

// Subheadings look like this:
// {{Short description|Thought experiment about identity over time}} {{About|the thought experiment|the film|Ship of Theseus (film){{!}}''Ship of Theseus'' (film)}} {{Use dmy dates|date=February 2023}}
// And should become this:
// <p><b>Short description:</b> Thought experiment about identity over time</p>

showdown.extension('wiki', function () {
  return [
    {
      type: 'output',
      filter: function (text, converter, options) {
        // find all the links
        // replace them with the appropriate html
        // return the text
        const linkRegex = /\[\[(.*?)\]\]/g
        const matches = text.matchAll(linkRegex)
        for (const match of matches) {
          const link = match[1]
          const parts = link.split('|')
          const linkText = parts[0]
          const linkUrl = parts[1]
          const linkHtml = `<a href="https://en.wikipedia.org/wiki/${linkUrl}">${linkText}</a>`
          text = text.replace(match[0], linkHtml)
        }

        // Find all the images
        // replace them with the appropriate html
        // return the text
        const imageRegex = /\[\[File:(.*?)\]\]/g
        const imageMatches = text.matchAll(imageRegex)
        for (const match of imageMatches) {
          const image = match[1]
          const parts = image.split('|')
          const imageText = parts[0]
          const imageUrl = parts[1]
          const imageHtml = `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/${imageUrl}/200px-${imageUrl}" alt="${imageText}">`
          text = text.replace(match[0], imageHtml)
        }

        // Find all the sections
        // replace them with the appropriate html
        // return the text
        const sectionRegex = /==(.*)==/g
        const sectionMatches = text.matchAll(sectionRegex)
        for (const match of sectionMatches) {
          const section = match[1]
          const sectionHtml = `<h2>${section}</h2>`
          text = text.replace(match[0], sectionHtml)
        }

        return text
      },
    },
  ]
})

var md = new showdown.Converter({
  openLinksInNewWindow: true,
  extensions: ['wiki'],
})

d3.json('/ship_of_theseus_revisions_2.json').then(function (data) {
  console.log('data', data)
  const first = data[0]
  d3.select('#exampleDiv').html(md.makeHtml(first.content))
})

// $.when($.ready).then(function () {
//   const chart = new Chart({ // eslint-disable-line
//     element: 'exampleDiv',
//     margin: 20,
//     width: 800,
//     height: 600,
//     nav: false
//   }).scratchpad((chart :Chart) => {
//     // chart.svg

//   })
// })
