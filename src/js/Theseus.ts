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

    {
      type: 'lang',
      regex: /{{Div col\|colwidth=20em}}([\s\S]+?){{Div col end}}/g,
      replace: function (match, content) {
        // Process the content within the {{Div col...}} template
        const processedContent = md.makeHtml(content.trim())

        return `<div style="column-width: 20em;">${processedContent}</div>`
      },
    },

    {
      type: 'lang',
      regex: /{{Reflist}}/gi,
      replace: function (match) {
        // Process the Reflist template as needed
        return '<div class="reflist">References will go here.</div>'
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
    // {
    //   type: 'lang',
    //   regex: /{{Quote\|(.+?}?}?)}}/gi,
    //   replace: function (match, content) {
    //     // Find inside the content, the 3 parts
    //     console.log("Quote Content", content)

    //     const text = content.match(/(.+)\|(?:.+)\|(?:.+)/)
    //     const sign = content.match(/(?<=\|)(.+)(?=\|)/)
    //     const source = content.match(/(?:.+)\|(.+)$/)
    //     // return content
    //     console.log("Quote Parts", {
    //       text: text,
    //       sign: sign,
    //       source: source,
    //     })

    //     return `<blockquote class="templatequote"><p>${text[1]}</p><div class="templatequotecite">— <cite>${sign[1]}, <i>${source[1]}</i></cite></div></blockquote>`
    //   },
    // },

    {
      type: 'lang',
      regex:
        /{{Quote\|((?:[^{}|]+|\{\{(?:[^{}]|{{.*?}})*?\}\}|\[\[(?:[^[\]]|\[\[.*?]])*?\]\]|(?:\|[^{}|]+|\{\{(?:[^{}]|{{.*?}})*?\}\}|\[\[(?:[^[\]]|\[\[.*?]])*?\]\])*)*)}}/gi,
      replace: function (match, content) {
        console.log('Quote Content', content)

        // Use a simpler regex pattern to extract text, sign, and source
        const parts = content.match(/(.+?)\|(.+?)\|(.+)/)

        if (parts) {
          const [_, text, sign, source] = parts

          // Optionally, you can trim the extracted parts
          const trimmedText = text.trim()
          const trimmedSign = sign.trim()
          const trimmedSource = source.trim()

          console.log('Quote Parts', {
            text: trimmedText,
            sign: trimmedSign,
            source: trimmedSource,
          })

          return `<blockquote class="templatequote"><p>${trimmedText}</p><div class="templatequotecite">— <cite>${trimmedSign}, <i>${trimmedSource}</i></cite></div></blockquote>`
        } else {
          // Handle the case where the regex doesn't match as expected
          console.error('Failed to match parts in Quote template')
          return match // Return the original match as fallback
        }
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
      regex: /{{Cite web.+?}}/gi,
      replace: function (match, content) {
        return `<sup role="note" class="hatnote navigation-not-searchable">[${content}]</sup>`
      },
    },

    {
      type: 'lang',
      regex: /\{\{cite encyclopedia\s*\|([^}]+)}}/gi,
      replace: function (match, content) {
        const fields = content.split('|').map((field) => field.trim())

        // Extract values for different fields
        const editorLastName = getFieldValue(fields, 'editor-last1')
        const editorFirstName = getFieldValue(fields, 'editor-first1')
        const editorLink = getFieldValue(fields, 'editor-link')
        const title = getFieldValue(fields, 'title')
        const encyclopedia = getFieldValue(fields, 'encyclopedia')
        const year = getFieldValue(fields, 'year')
        const publisher = getFieldValue(fields, 'publisher')
        const isbn = getFieldValue(fields, 'isbn')
        const url = getFieldValue(fields, 'url')
        const accessDate = getFieldValue(fields, 'access-date')
        const language = getFieldValue(fields, 'language')

        // Generate the HTML representation without <li> tags
        const htmlRepresentation = `
          <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1133582631">
          <cite id="CITEREF${editorLastName}${year}" class="citation encyclopaedia cs1">
            <a href="${editorLink}" title="${editorFirstName} ${editorLastName}">${editorLastName}, ${editorFirstName}</a>, ed. (${year}). 
            <a rel="nofollow" class="external text" href="${url}">"${title}"</a> <span class="cs1-format">(Encyclopedia)</span>. 
            <i>${encyclopedia}</i>. ${publisher}; ${year}. 
            <a href="/wiki/ISBN_(identifier)" class="mw-redirect" title="ISBN (identifier)">ISBN</a>&nbsp;
            <a href="/wiki/Special:BookSources/${isbn}" title="Special:BookSources/${isbn}"><bdi>${isbn}</bdi></a>. 
            <span class="language">${language}</span>. 
            <span class="access-date">Accessed ${accessDate}</span>.
          </cite>
          <span title="ctx_ver=Z39.88-2004&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Abook&amp;rft.genre=bookitem&amp;rft.atitle=${title}&amp;rft.btitle=${encyclopedia}&amp;rft.pub=${publisher}&amp;rft.date=${year}&amp;rft.isbn=${isbn}&amp;rft_id=${url}&amp;rft.accessDate=${accessDate}&amp;rfr_id=info%3Asid%2Fen.wikipedia.org%3A${title}" class="Z3988"></span>
        `

        return htmlRepresentation
      },
    },

    {
      type: 'lang',
      regex: /\{\{cite book(?:\s*\|\s*[^\s=]+=[^|}]+)*\}\}/gi,
      replace: function (match) {
        const fields = match
          .replace(/\{\{/g, '')
          .replace(/\}\}/g, '')
          .split('|')
          .map((field) => field.trim())

        // Extract values for different fields
        const parameters = fields.map((field) => {
          const [name, value] = field.split('=')
          return { name: name.trim(), value: value ? value.trim() : '' }
        })

        // Generate HTML representation for a book citation
        const authors = parameters
          .filter((param) => param.name.startsWith('author'))
          .map(
            (author) =>
              `<a href="/wiki/${author.value}" title="${author.value}">${author.value}</a>`
          )
          .join('; ')

        const editors = parameters
          .filter((param) => param.name.startsWith('editor'))
          .map(
            (editor) =>
              `<a href="/wiki/${editor.value}" title="${editor.value}">${editor.value}</a>`
          )
          .join('; ')

        const htmlRepresentation = `
          <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1133582631">
          <cite id="CITEREF${
            parameters.find((param) => param.name === 'author1-last')?.value
          }${
          parameters.find((param) => param.name === 'date')?.value
        }" class="citation book cs1">
            ${authors} (${
          parameters.find((param) => param.name === 'date')?.value
        }). ${
          editors ? `${editors} (eds.). ` : ''
        }<a rel="nofollow" class="external text" href="${
          parameters.find((param) => param.name === 'url')?.value
        }"><i>${
          parameters.find((param) => param.name === 'title')?.value
        }</i></a>. ${
          parameters.find((param) => param.name === 'publisher')?.value
        }. p.&nbsp;${
          parameters.find((param) => param.name === 'pages')?.value
        }. <a href="/wiki/ISBN_(identifier)" class="mw-redirect" title="ISBN (identifier)">ISBN</a>&nbsp;<a href="/wiki/Special:BookSources/${
          parameters.find((param) => param.name === 'isbn')?.value
        }" title="Special:BookSources/${
          parameters.find((param) => param.name === 'isbn')?.value
        }"><bdi>${
          parameters.find((param) => param.name === 'isbn')?.value
        }</bdi></a>.
          </cite>
          <span title="ctx_ver=Z39.88-2004&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Abook&amp;rft.genre=book&amp;rft.btitle=${
            parameters.find((param) => param.name === 'title')?.value
          }&amp;rft.pages=${
          parameters.find((param) => param.name === 'pages')?.value
        }&amp;rft.pub=${
          parameters.find((param) => param.name === 'publisher')?.value
        }&amp;rft.date=${
          parameters.find((param) => param.name === 'date')?.value
        }&amp;rft.isbn=${
          parameters.find((param) => param.name === 'isbn')?.value
        }&amp;rft.aulast=${
          parameters.find((param) => param.name === 'author1-last')?.value
        }&amp;rft.aufirst=${
          parameters.find((param) => param.name === 'author1-first')?.value
        }&amp;rft_id=${
          parameters.find((param) => param.name === 'url')?.value
        }&amp;rfr_id=info%3Asid%2Fen.wikipedia.org%3AShip+of+Theseus" class="Z3988"></span>
        `

        return htmlRepresentation
      },
    },

    {
      type: 'lang',
      regex: /\{\{cite journal(?:\s*\|\s*[^\s=]+=[^|}]+)*\}\}/gi,
      replace: function (match) {
        const fields = match
          .replace(/\{\{/g, '')
          .replace(/\}\}/g, '')
          .split('|')
          .map((field) => field.trim())

        // Extract values for different fields
        const parameters = fields.map((field) => {
          const [name, value] = field.split('=')
          return { name: name.trim(), value: value ? value.trim() : '' }
        })

        // Generate HTML representation for a journal citation
        const authors = parameters
          .filter((param) => param.name.startsWith('author'))
          .map(
            (author) =>
              `<a href="/wiki/${author.value}" title="${author.value}">${author.value}</a>`
          )
          .join('; ')

        const htmlRepresentation = `
          <link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1133582631">
          <cite id="CITEREF${
            parameters.find((param) => param.name === 'last1')?.value
          }${
          parameters.find((param) => param.name === 'year')?.value
        }" class="citation journal cs1">
            ${authors} (${
          parameters.find((param) => param.name === 'year')?.value
        }). <i>${
          parameters.find((param) => param.name === 'title')?.value
        }</i>. ${parameters.find((param) => param.name === 'journal')?.value} ${
          parameters.find((param) => param.name === 'volume')?.value
            ? `${parameters.find((param) => param.name === 'volume')?.value}`
            : ''
        }${
          parameters.find((param) => param.name === 'issue')?.value
            ? `(${parameters.find((param) => param.name === 'issue')?.value})`
            : ''
        }: ${
          parameters.find((param) => param.name === 'pages')?.value
        }. <a href="${
          parameters.find((param) => param.name === 'url')?.value
        }" class="external text">doi:${
          parameters.find((param) => param.name === 'doi')?.value
        }</a>.
          </cite>
          <span title="ctx_ver=Z39.88-2004&amp;rft_val_fmt=info%3Aofi%2Ffmt%3Akev%3Amtx%3Ajournal&amp;rft.genre=article&amp;rft.atitle=${
            parameters.find((param) => param.name === 'title')?.value
          }&amp;rft.jtitle=${
          parameters.find((param) => param.name === 'journal')?.value
        }&amp;rft.date=${
          parameters.find((param) => param.name === 'year')?.value
        }&amp;rft.volume=${
          parameters.find((param) => param.name === 'volume')?.value
        }&amp;rft.issue=${
          parameters.find((param) => param.name === 'issue')?.value
        }&amp;rft.pages=${
          parameters.find((param) => param.name === 'pages')?.value
        }&amp;rft.aulast=${
          parameters.find((param) => param.name === 'last1')?.value
        }&amp;rft.aufirst=${
          parameters.find((param) => param.name === 'first1')?.value
        }&amp;rfr_id=info%3Asid%2Fen.wikipedia.org%3AShip+of+Theseus" class="Z3988"></span>
        `

        return htmlRepresentation
      },
    },

    {
      type: 'lang',
      regex: /{{refbegin\|(\d+)em}}([\s\S]*?){{refend}}/gi,
      replace: function (match, colWidth, content) {
        // Process the refbegin template and generate HTML
        return `<div style="column-width: ${colWidth}">${content}</div>`
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

function getFieldValue(fields, fieldName) {
  const field = fields.find((f) => f.startsWith(fieldName))
  return field ? field.split('=')[1] : ''
}
