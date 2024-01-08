import { Chart, decorateTable } from 'chart'
// import * as d3 from 'd3'
import $ from 'jquery'
import 'datatables.net'

declare var diff_match_patch: any

type Revision = {
  id: number
  timestamp: string
  user: string
  comment: string
  text?: string
  content: string
  previous?: string
}

console.log('Running example.ts')
console.log('Hello World')

// Let's add a custom extension to Showdown to handle MediaWiki markup.
// Square brackets [[ ]] should become links to wikipedia https://en.wikipedia.org/wiki/
// If there is a pipe | then the text before the pipe should be the link text

// An image like this:
// [[File:Teseo e Arianna, Pompei.jpg|thumb|200px|A [[Fresco]] from [[Pompeii]] depicting Theseus and Ariadne escaping from Crete. According to Plutarch, the Athenians preserved the ship that Theseus used to escape, by replacing the parts one by one as they decayed.]]
// Should become this:
// <figure typeof="mw:File/Thumb"><a href="/wiki/File:Teseo_e_Arianna,_Pompei.jpg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Teseo_e_Arianna%2C_Pompei.jpg/200px-Teseo_e_Arianna%2C_Pompei.jpg" decoding="async" width="200" height="231" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Teseo_e_Arianna%2C_Pompei.jpg/300px-Teseo_e_Arianna%2C_Pompei.jpg 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Teseo_e_Arianna%2C_Pompei.jpg/400px-Teseo_e_Arianna%2C_Pompei.jpg 2x" data-file-width="1902" data-file-height="2200"></a><figcaption>A <a href="/wiki/Fresco" title="Fresco">Fresco</a> from <a href="/wiki/Pompeii" title="Pompeii">Pompeii</a> depicting Theseus and Ariadne escaping from Crete. According to Plutarch, the Athenians preserved the ship that Theseus used to escape, by replacing the parts one by one as they decayed.</figcaption></figure>

// Sections are denoted like this:
// ==History==
// And should become this:
// <h2><span class="mw-headline" id="History">History</span></h2>

// Subheadings look like this:
// {{Short description|Thought experiment about identity over time}} {{About|the thought experiment|the film|Ship of Theseus (film){{!}}''Ship of Theseus'' (film)}} {{Use dmy dates|date=February 2023}}
// And should become this:
// <div role="note" class="hatnote navigation-not-searchable">This article is about the thought experiment. For the film, see <a href="/wiki/Ship_of_Theseus_(film)" title="Ship of Theseus (film)"><i>Ship of Theseus</i> (film)</a>.</div>

// Quotes look like this:
// {{Quote|The ship wherein [[Theseus]] and the youth of Athens returned from Crete had thirty oars, and was preserved by the Athenians down even to the time of [[Demetrius of Phalerum|Demetrius Phalereus]], for they took away the old planks as they decayed, putting in new and stronger timber in their places, insomuch that this ship became a standing example among the philosophers, for the logical question of things that grow; one side holding that the ship remained the same, and the other contending that it was not the same.|Plutarch|''Life of Theseus'' 23.1}}
// And should become this:
// <blockquote class="templatequote"><p>The ship wherein <a href="/wiki/Theseus" title="Theseus">Theseus</a> and the youth of Athens returned from Crete had thirty oars, and was preserved by the Athenians down even to the time of <a href="/wiki/Demetrius_of_Phalerum" title="Demetrius of Phalerum">Demetrius Phalereus</a>, for they took away the old planks as they decayed, putting in new and stronger timber in their places, insomuch that this ship became a standing example among the philosophers, for the logical question of things that grow; one side holding that the ship remained the same, and the other contending that it was not the same.</p><div class="templatequotecite">— <cite>Plutarch, <i>Life of Theseus</i> 23.1</cite></div></blockquote>

// import wiki from './showdown-wiki'
declare var wiki: any

showdown.extension('wiki', wiki)

var md = new showdown.Converter({
  openLinksInNewWindow: true,
  extensions: ['wiki'],
})

var raw = new showdown.Converter({
  openLinksInNewWindow: true,
  // extensions: ['wiki'],
})

// <script src="https://cdnjs.cloudflare.com/ajax/libs/diff-match-patch/20121119/diff_match_patch.js"></script>

d3.json('/ship_of_theseus_revisions.json')
  // .then(function (data: Revision[]) {
  //   // Get just the first 2 paragraphs
  //   // Check if there are any differences
  //   // Ignore if none

  //   var rows: Revision[] = []
  //   var previous = ''

  //   data.forEach(function (row) {
  //     var text = getIntro(row.content)
  //     if (text !== previous) {
  //       row.previous = previous
  //       row.content = text
  //       rows.push(row)
  //       previous = text
  //     }
  //   })

  //   return rows
  // })
  .then(function (data: Revision[]) {
    console.log('data', data)
    const first = data[0]

    d3.select('#main').html(md.makeHtml(first.content))

    var slider = d3
      .select('#slider')
      .append('svg')
      .attr('width', 1800)
      .attr('height', 120)
      .attr('viewBox', [0, 0, 1800, 120])
    slider
      .append('rect')
      .attr('width', 1000)
      .attr('height', 80)
      .attr('fill', 'red')

    slider
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('width', 10)
      .attr('height', 80)
      .attr('fill', (d, i) => {
        return i % 2 === 0 ? 'blue' : 'green'
      })
      .attr('x', (d, i) => i)
      .attr('y', 0)
      .on('mouseover', (d: any, i: any) => {
        // console.log('hey', i)
        // console.log(d)

        //   var diffs = dmp.diff_main(d.previous, d.content)
        //   dmp.diff_cleanupSemantic(diffs)

        //   var content = parseDiffs(diffs)
        //   return md.makeHtml(content)

        var pos = parseInt(i)
        const dmp = new diff_match_patch()
        var diffs = dmp.diff_main(data[pos - 1].content, d.content)
        dmp.diff_cleanupSemantic(diffs)

        var result = parseDiffs(diffs)

        d3.select('#main').html(md.makeHtml(result))

        // d3.select('#main').html(md.makeHtml(d.content))
      })
      .on('mouseout', (d, i) => {
        // d3.select("#main").html(md.makeHtml(first.content))
      })

    // Add an x axis
    var x = d3.scaleLinear().domain([0, data.length]).range([0, 1800])

    slider
      .append('g')
      .attr('transform', 'translate(0, 100)')
      .call(d3.axisBottom(x))

    // d3.select('#raw').html(getIntro(first.content))

    // d3.select('#edited').html(md.makeHtml(first.content))

    // Create a diff_match_patch object
    // const dmp = new diff_match_patch();

    // // Get the differences
    // const diffs = dmp.diff_main(data.content, data.string);

    // var box = d3
    //   .select('#edited')
    //   .selectAll('div.words')
    //   .data(data)
    //   .enter()
    //   .append('div')
    //   .classed('words', true)

    // box.append('div').html((d) => {
    //   var dmp = new diff_match_patch()
    //   var diffs = dmp.diff_main(d.previous, d.content)
    //   dmp.diff_cleanupSemantic(diffs)

    //   var content = parseDiffs(diffs)
    //   return md.makeHtml(content)
    // })

    // box.append('div').html((d) => {
    //   return `${d.timestamp} by ${d.user}`
    // })
  })

function parseDiffs(diffs) {
  // .map(([type, text]) => {
  // return "lol"
  // const className =
  //   type === 0 ? '' : type === 1 ? 'diff-added' : 'diff-removed'
  // return `<span class="diff ${className}">${text}</span>`
  // })
  console.log(diffs)

  var result = ''
  for (var i = 0; i < diffs.length; i++) {
    // var [type, text] = diffs[i]
    var type = diffs[i][0]
    var text = diffs[i][1]

    const className =
      type === 0 ? '' : type === 1 ? 'diff-added' : 'diff-removed'
    result += `<span class="diff ${className}">${text}</span>`
  }

  return result
}

function getIntro(text) {
  const paragraphs = text.split('\n')
  var result = []

  // return the first two paragraphs that don't start with {{ and aren't null
  var looping = true
  paragraphs.forEach((p) => {
    if (p && p.startsWith('==')) {
      looping = false
    }

    if (looping && p && !p.startsWith('{{')) {
      result.push(p)
    }
  })

  return result.join('')
  // return result
}
