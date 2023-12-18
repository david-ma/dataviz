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
      regex: /\[\[File:([^|]+)\|thumb\|(\d+)px\|((?:.)+)\]\]/g,
      replace: function (match, filename, width, caption) {
        const parts = filename.split('|')

        // console.log('Figure found, parts', parts)
        // console.log('width', width)
        // console.log('caption', caption)
        // const link = parts[0]
        // encode the link, turn spaces into underscores
        const link = parts[0].replace(/\s/g, '_')
        // https://en.wikipedia.org/wiki/File:Teseo_e_Arianna,_Pompei.jpg
        const url = `https://en.wikipedia.org/wiki/File:${link}`
        const hash = md5(link)
        const img = `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash}/${link}/${width}px-${link}`
        return `<figure>
<a href="${url}">
<img src=${img}>
</a>
<figcaption>
${caption}
</figcaption>
</figure>`

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

    // ===Constitution is not identity===
    // <h3><span class="mw-headline" id="Constitution_is_not_identity">Constitution is not identity</span></h3>
    {
      type: 'lang',
      regex: /===([^=]+)===/g,
      replace: function (match, content) {
        return `<h3><span class="mw-headline" id="${content}">${content}</span></h3>`
      },
    },

    {
      type: 'lang',
      regex: /==([^=]+)==/g,
      replace: function (match, content) {
        return `<h2><span class="mw-headline" id="${content}">${content}</span></h2>`
      },
    },

    // {
    //   type: 'lang',
    //   regex: /{{Quote\|([^|]+)\|([^|]+)\|([^|]+)}}/g,
    //   replace: function (match, content, author, source) {
    //     return `<blockquote class="templatequote"><p>${content}</p><div class="templatequotecite">— <cite>${author}, <i>${source}</i></cite></div></blockquote>`
    //   },
    // },

    // {
    //   type: 'lang',
    //   // regex: /{{Quote\|([^|]+)\|([^|]+)\|([^|]+)}}/gi,
    //   regex: /{{Quote(\|.+?)+?}}/gi,
    //   // regex: /{{Quote\|([(?:.+)(?:{{(?:.|\|)+?}})(?:\[\[(?:.|\|)+?]])])+}}/gi,
    //   replace: function (match, text, sign, source) {
    //     console.log("Found a quote", {
    //       text: text,
    //       sign: sign,
    //       source: source,
    //     })

    //     return `<blockquote class="templatequote"><p>${text}</p><div class="templatequotecite">— <cite>${sign}, <i>${source}</i></cite></div></blockquote>`
    //   },
    // }
    {
      type: 'lang',
      regex: /{{Quote\|(.+?}?}?)}}/gi,
      replace: function (match, content) {
        // Find inside the content, the 3 parts
        console.log("Quote Content", content)

        const text = content.match(/(.+)\|(?:.+)\|(?:.+)/)
        const sign = content.match(/(?<=\|)(.+)(?=\|)/)
        const source = content.match(/(?:.+)\|(.+)$/)
        // return content
        console.log("Quote Parts", {
          text: text,
          sign: sign,
          source: source,
        })

        return `<blockquote class="templatequote"><p>${text[1]}</p><div class="templatequotecite">— <cite>${sign[1]}, <i>${source[1]}</i></cite></div></blockquote>`
      },  
    },

    // {{sfn|Wasserman}}
    // <sup id="cite_ref-FOOTNOTEWasserman_1-3" class="reference"><a href="#cite_note-FOOTNOTEWasserman-1">[1]</a></sup>
    // {{sfn|Hobbes|1656}}}}
    // <sup id="cite_ref-FOOTNOTEHobbes1656_3-0" class="reference"><a href="#cite_note-FOOTNOTEHobbes1656-3">[3]</a></sup>
    {
      type: 'lang',
      regex: /{{sfn(\|[^|]+?)+?(\|\d+)?(\|(?=p=|loc=).+?)?}}/g,
      replace: function (match, content) {
        return `<sup id="cite_ref-FOOTNOTE${content}_1-3" class="reference"><a href="#cite_note-FOOTNOTE${content}-1">[1]</a></sup>`
      },
    },
    // TODO: find a way to match the citation numbers?

    // {{Quote|The ship wherein [[Theseus]] and the youth of Athens returned from Crete had thirty oars, and was preserved by the Athenians down even to the time of [[Demetrius of Phalerum|Demetrius Phalereus]], for they took away the old planks as they decayed, putting in new and stronger timber in their places, insomuch that this ship became a standing example among the philosophers, for the logical question of things that grow; one side holding that the ship remained the same, and the other contending that it was not the same.|Plutarch|''Life of Theseus'' 23.1}}
    // <blockquote class="templatequote"><p>The ship wherein <a href="/wiki/Theseus" title="Theseus">Theseus</a> and the youth of Athens returned from Crete had thirty oars, and was preserved by the Athenians down even to the time of <a href="/wiki/Demetrius_of_Phalerum" title="Demetrius of Phalerum">Demetrius Phalereus</a>, for they took away the old planks as they decayed, putting in new and stronger timber in their places, insomuch that this ship became a standing example among the philosophers, for the logical question of things that grow; one side holding that the ship remained the same, and the other contending that it was not the same.</p><div class="templatequotecite">— <cite>Plutarch, <i>Life of Theseus</i> 23.1</cite></div></blockquote>

    // {{Quote|For if that Ship of Theseus (concerning the Difference whereof, made by continual reparation, in taking out the old Planks, and putting in new, the [[sophist]]ers of Athens were wont to dispute) were, after all the Planks were changed, the same Numerical Ship it was at the beginning; and if some Man had kept the Old Planks as they were taken out, and by putting them afterward together in the same order, had again made a Ship of them, this, without doubt, had also been the same Numerical Ship with that which was at the beginnings and so there would have been two Ships Numerically the same, which is absurd… But we must consider by what name anything is called when we inquire concerning the Identity of it… so that a Ship, which signifies Matter so figured, will be the same, as long as the Matter remains the same; but if no part of the Matter is the same, then it is Numerically another Ship; and if part of the Matter remains, and part is changed, then the Ship will be partly the same, and partly not the same.|Hobbes|"Of Identity and Difference"{{sfn|Hobbes|1656}}}}
    // <blockquote class="templatequote"><p>For if that Ship of Theseus (concerning the Difference whereof, made by continual reparation, in taking out the old Planks, and putting in new, the <a href="/wiki/Sophist" title="Sophist">sophisters</a> of Athens were wont to dispute) were, after all the Planks were changed, the same Numerical Ship it was at the beginning; and if some Man had kept the Old Planks as they were taken out, and by putting them afterward together in the same order, had again made a Ship of them, this, without doubt, had also been the same Numerical Ship with that which was at the beginnings and so there would have been two Ships Numerically the same, which is absurd... But we must consider by what name anything is called when we inquire concerning the Identity of it... so that a Ship, which signifies Matter so figured, will be the same, as long as the Matter remains the same; but if no part of the Matter is the same, then it is Numerically another Ship; and if part of the Matter remains, and part is changed, then the Ship will be partly the same, and partly not the same.</p><div class="templatequotecite">— <cite>Hobbes, "Of  Identity  and  Difference"<sup id="cite_ref-FOOTNOTEHobbes1656_3-0" class="reference"><a href="#cite_note-FOOTNOTEHobbes1656-3">[3]</a></sup></cite></div></blockquote>




    // {{Cite web|title = The Three Basic Facts of Existence: I. Impermanence (Anicca)|url = http://www.accesstoinsight.org/lib/authors/various/wheel186.html|website = accesstoinsight.org|access-date = 1 November 2015|archive-url = https://web.archive.org/web/20190709094922/https://www.accesstoinsight.org/lib/authors/various/wheel186.html|archive-date = 9 July 2019|url-status = dead}}
    // <div role="note" class="hatnote navigation-not-searchable">This article is about the thought experiment. For the film, see <a href="/wiki/Ship_of_Theseus_(film)" title="Ship of Theseus (film)"><i>Ship of Theseus</i> (film)</a>.</div>

    // {{cite web|title = Rebuilt, Preserved, Restored – USS Constitution Across the Centuries| date=13 April 2018 |url = https://ussconstitutionmuseum.org/2018/04/13/rebuilt-preserved-restored-uss-constitution-across-the-centuries/|publisher = USS Constitution Museum|access-date = 8 October 2023}}
    {
      type: 'lang',
      regex: /{{Cite (web|journal|book).+?}}/gi,
      replace: function (match, content) {
        return `<sup role="note" class="hatnote navigation-not-searchable">[${content}]</sup>`
      },
    },


    // {{main|Temporal parts}}
    // <div role="note" class="hatnote navigation-not-searchable">Main article: <a href="/wiki/Temporal_parts" title="Temporal parts">Temporal parts</a></div>
    {
      type: 'lang',
      regex: /{{main\|([^|]+)}}/g,
      replace: function (match, content) {
        return `<div role="note" class="hatnote navigation-not-searchable">Main article: <a href="/wiki/${content}" title="${content}">${content}</a></div>`
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

// We need the 1st then 1st & 2nd parts of an md5 hash of filename
// Hardcode it for now.
function md5(str) {
  if (str === 'USS_Constitution_fires_a_17-gun_salute.jpg') {
    return 'e/ed'
  }
  return '1/1c'
}
