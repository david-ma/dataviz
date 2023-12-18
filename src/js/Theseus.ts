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

showdown.extension('wiki', function () {
  return [
// [[File:Teseo e Arianna, Pompei.jpg|thumb|200px|A [[Fresco]] from [[Pompeii]] depicting Theseus and Ariadne escaping from Crete. According to Plutarch, the Athenians preserved the ship that Theseus used to escape, by replacing the parts one by one as they decayed.]]
// Should become this:
// <figure typeof="mw:File/Thumb"><a href=https://en.wikipedia.org/wiki/File:Teseo_e_Arianna,_Pompei.jpg" class="mw-file-description"><img src="//upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Teseo_e_Arianna%2C_Pompei.jpg/200px-Teseo_e_Arianna%2C_Pompei.jpg" decoding="async" width="200" height="231" class="mw-file-element" srcset="//upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Teseo_e_Arianna%2C_Pompei.jpg/300px-Teseo_e_Arianna%2C_Pompei.jpg 1.5x, //upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Teseo_e_Arianna%2C_Pompei.jpg/400px-Teseo_e_Arianna%2C_Pompei.jpg 2x" data-file-width="1902" data-file-height="2200"></a><figcaption>A <a href="/wiki/Fresco" title="Fresco">Fresco</a> from <a href="/wiki/Pompeii" title="Pompeii">Pompeii</a> depicting Theseus and Ariadne escaping from Crete. According to Plutarch, the Athenians preserved the ship that Theseus used to escape, by replacing the parts one by one as they decayed.</figcaption></figure>
// https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Teseo_e_Arianna%2C_Pompei.jpg/400px-Teseo_e_Arianna%2C_Pompei.jpg
    {
      type: 'lang',
      regex: /\[\[File:([^|]+)\|thumb\|((?:[^\]]|\[\[|]])+)\]\]/g,
      replace: function (match, filename, caption) {
        const parts = filename.split('|')

        console.log("Figure found, parts", parts)
        // const link = parts[0]
        // encode the link, turn spaces into underscores
        const link = parts[0].replace(/\s/g, '_')
        const width = parts[1]
        const height = parts[2]
        const description = parts[3]
        // https://en.wikipedia.org/wiki/File:Teseo_e_Arianna,_Pompei.jpg
        const url = `https://en.wikipedia.org/wiki/File:${link}`

        return url

        // return `\`\`\`${url}\`\`\``
      },
    },


    {
      type: 'lang',
      regex: /\[\[([^\]]+)\]\]/g,
      replace: function (match, content) {
        const parts = content.split('|')
        const link = parts[0]
        const text = parts[1] || link
        return `<a href="https://en.wikipedia.org/wiki/${link}">${text}</a>`
      },
    },

    {
      type: 'lang',
      regex: /==([^=]+)==/g,
      replace: function (match, content) {
        return `<h2><span class="mw-headline" id="${content}">${content}</span></h2>`
      },
    },
    {
      type: 'lang',
      regex: /{{Quote\|([^|]+)\|([^|]+)\|([^|]+)}}/g,
      replace: function (match, content, author, source) {
        return `<blockquote class="templatequote"><p>${content}</p><div class="templatequotecite">— <cite>${author}, <i>${source}</i></cite></div></blockquote>`
      },
    },


    // {{Short description|Thought experiment about identity over time}}
    // <div class="shortdescription nomobile noexcerpt noprint searchaux" style="display:none">Thought experiment about identity over time</div>
    {
      type: 'lang',
      regex: /{{Short description\|([^|]+)}}/g,
      replace: function (match, content) {
        return `<div class="shortdescription nomobile noexcerpt noprint searchaux" style="display:none">${content}</div>`
      },
    },

    // {{About|the thought experiment|the film|Ship of Theseus (film){{!}}''Ship of Theseus'' (film)}} {{Use dmy dates|date=February 2023}}
    // <div role="note" class="hatnote navigation-not-searchable">This article is about the thought experiment. For the film, see <a href="/wiki/Ship_of_Theseus_(film)" title="Ship of Theseus (film)"><i>Ship of Theseus</i> (film)</a>.</div>
    // Be sure to handle this weird syntax: (film){{!}}''Ship of Theseus'' (film)
    {
      type: 'lang',
      regex: /{{About\|([^|]+)\|([^|]+)\|([^|]+)}}/g,
      replace: function (match, content, about, link) {
        return `<div role="note" class="hatnote navigation-not-searchable">This article is about ${content}. For ${about}, see <a href="/wiki/${link}" title="${link}"><i>${link}</i></a>.</div>`
      },
    },

    // Ignore stuff like this:
    // (film){{!}}''Ship of Theseus'' (film)
    // {{Use dmy dates|date=February 2023}}

    {
      type: 'lang',
      regex: /{{Use dmy dates\|date=([^|]+)}}/g,
      replace: function (match, content) {
        return ''
      },
    },

    // '''Ship of Theseus'''
    // <b>Ship of Theseus</b>
    {
      type: 'lang',
      regex: /'''([^']+)'''/g,
      replace: function (match, content) {
        return `<b>${content}</b>`
      },
    },


  ]
})

var md = new showdown.Converter({
  openLinksInNewWindow: true,
  extensions: ['wiki'],
})

var raw = new showdown.Converter({
  openLinksInNewWindow: true,
  // extensions: ['wiki'],
})

d3.json('/ship_of_theseus_revisions_2.json').then(function (data) {
  console.log('data', data)
  const first = data[0]
  d3.select('#raw').html(raw.makeHtml(first.content))
  d3.select('#edited').html(md.makeHtml(first.content))
})
