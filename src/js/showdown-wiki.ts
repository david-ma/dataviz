// This is a ShowdownJS extension for Wiki Markup
// By David Ma, for the Ship of Theseus project
// See:
// - https://www.mediawiki.org/wiki/Parsoid
// - https://www.mediawiki.org/wiki/Markup_spec
// - https://www.mediawiki.org/wiki/Help:Wikitext_examples
// - https://www.mediawiki.org/wiki/Help:Formatting
// - https://www.mediawiki.org/wiki/Help:Links
// - https://www.mediawiki.org/wiki/Help:Templates
// - https://github.com/showdownjs/showdown

const citations = []

const cite = [
  // {{cite web|title = Rebuilt, Preserved, Restored – USS Constitution Across the Centuries| date=13 April 2018 |url = https://ussconstitutionmuseum.org/2018/04/13/rebuilt-preserved-restored-uss-constitution-across-the-centuries/|publisher = USS Constitution Museum|access-date = 8 October 2023}}
  // {{cite web|title = Heroes and Villains|url = http://www.bbc.co.uk/comedy/onlyfools/quotes/quote11.shtml|publisher = BBC|access-date = 16 January 2014}}
  // {{cite web|url=https://www.dir.co.jp/report/column/20160406010798.html|archive-url=https://web.archive.org/web/20210507162638/https://www.dir.co.jp/report/column/20160406010798.html|script-title=ja:常若（とこわか）＝伊勢神宮・式年遷宮にみる和のサステナビリティ|language=ja|publisher=Daiwa Institute of Research Ltd.|date=6 April 2016|archive-date=7 May 2021|access-date=5 November 2022}}Shinnyo Kawai (2013) ''常若の思想 伊勢神宮と日本人''. [[Shodensha]]. {{ISBN|978-4396614669}}
  // {{cite web|title = Rebuilt, Preserved, Restored – USS Constitution Across the Centuries| date=13 April 2018 |url = https://ussconstitutionmuseum.org/2018/04/13/rebuilt-preserved-restored-uss-constitution-across-the-centuries/|publisher = USS Constitution Museum|access-date = 8 October 2023}}
  // {{cite web |author1=Antique and Classic Boat Society |title=Preserved and Restored Boats |date=24 July 2016 |url=https://acbs.org/acbs-boat-classifications-judging-classes/ |access-date=2023-11-01}}
  // {{Cite web|title = The Three Basic Facts of Existence: I. Impermanence (Anicca)|url = http://www.accesstoinsight.org/lib/authors/various/wheel186.html|website = accesstoinsight.org|access-date = 1 November 2015|archive-url = https://web.archive.org/web/20190709094922/https://www.accesstoinsight.org/lib/authors/various/wheel186.html|archive-date = 9 July 2019|url-status = dead}}

  // If we're inside of refbegin, then we should give a longer citation.
  // Otherwise, we should just give a short citation.

  {
    type: 'lang',
    regex: /{{refbegin\|(\d+)em}}([\s\S]*?){{refend}}/gi,
    replace: function (match, colWidth, content) {
      // Process the refbegin template and generate HTML
      content = content.replaceAll('{{cite', '{{longcite')

      return `<div style="column-width: ${colWidth}">${content}</div>`
    },
  },

  {
    type: 'lang',
    regex: /\{\{longcite encyclopedia\s*\|([^}]+)}}/gi,
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
    regex: /\{\{longcite book(?:\s*\|\s*[^\s=]+=[^|}]+)*\}\}/gi,
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
    regex: /\{\{longcite journal(?:\s*\|\s*[^\s=]+=[^|}]+)*\}\}/gi,
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
    regex: /{{cite\s(.*)\s*\|(.*?)}}/gi,
    replace: function (match, type, content) {
      // const citations = window.globalThis.citations

      // console.log('citations', citations)

      const parts = content.split('|').map((field) => field.trim())
      const fields = parts.map((field) => {
        const [name, value] = field.split('=')
        return { name: name.trim(), value: value ? value.trim() : '' }
      })
      // Check if we already have this citation
      const existing = citations.find(
        (c) => c.fields[0].value === fields[0].value
      )
      if (existing) {
        return `<sup id="cite_ref-${existing.id}_1-0" class="reference"><a href="#cite_note-${existing.id}-0">[0]</a></sup>`
      } else {
        const id = citations.length + 1
        // console.log('ID is:', id)
        citations.push({
          id,
          type,
          fields,
        })
        return `<sup id="cite_ref-${id}_1-0" class="reference"><a href="#cite_note-${id}-0">[${id}]</a></sup>`
      }
    },
  },
]

window.globalThis.wiki = function () {
  return [
    ...cite,

    // [[File: ]]
    // Display an image
    {
      type: 'lang',
      regex: /\[\[File:([^|]+)\|thumb\|(\d+)px\|((?:.)+)\]\]/g,
      replace: function (match, filename, width = 100, caption) {
        const parts = filename.split('|')

        const link = parts[0].replace(/\s/g, '_')
        const url = `https://en.wikipedia.org/wiki/File:${link}`
        const hash = md5(link)
        const img = `https://upload.wikimedia.org/wikipedia/commons/thumb/${hash}/${link}/${width}px-${link}`
        return `<figure style="width: ${width}px;">
  <a href="${url}">
  <img src=${img}>
  </a>
  <figcaption>
  ${caption}
  </figcaption>
  </figure>`
      },
    },

    // [[ link ]]
    // Used for linking to another wikipedia page
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

    {
      type: 'lang',
      regex:
        /{{Quote\|((?:[^{}|]+|\{\{(?:[^{}]|{{.*?}})*?\}\}|\[\[(?:[^[\]]|\[\[.*?]])*?\]\]|(?:\|[^{}|]+|\{\{(?:[^{}]|{{.*?}})*?\}\}|\[\[(?:[^[\]]|\[\[.*?]])*?\]\])*)*)}}/gi,
      replace: function (match, content) {
        // console.log('Quote Content', content)

        // Use a simpler regex pattern to extract text, sign, and source
        const parts = content.match(/(.+?)\|(.+?)\|(.+)/)

        if (parts) {
          const [_, text, sign, source] = parts

          // Optionally, you can trim the extracted parts
          const trimmedText = text.trim()
          const trimmedSign = sign.trim()
          const trimmedSource = source.trim()

          // console.log('Quote Parts', {
          //   text: trimmedText,
          //   sign: trimmedSign,
          //   source: trimmedSource,
          // })

          return `<blockquote class="templatequote"><p>${trimmedText}</p><div class="templatequotecite">— <cite>${trimmedSign}, <i>${trimmedSource}</i></cite></div></blockquote>`
        } else {
          // Handle the case where the regex doesn't match as expected
          console.error('Failed to match parts in Quote template')
          return match // Return the original match as fallback
        }
      },
    },

    {
      type: 'lang',
      regex: /{{sfn(\|[^|]+?)+?(\|\d+)?(\|(?=p=|loc=).+?)?}}/g,
      replace: function (match, content) {
        return `<sup id="cite_ref-FOOTNOTE${content}_1-3" class="reference"><a href="#cite_note-FOOTNOTE${content}-1">[1]</a></sup>`
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
}

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
