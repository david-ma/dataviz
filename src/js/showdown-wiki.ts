// This is a ShowdownJS extension for Wiki Markup
// By David Ma, for the Ship of Theseus project
//
// MediaWiki Template Documentation:
// - Templates: https://www.mediawiki.org/wiki/Help:Templates
// - Template syntax: {{TemplateName|param1|param2}} or {{TemplateName|name=value}}
// - Common templates: navbox, infobox, sidebar, citation templates
//
// See also:
// - https://www.mediawiki.org/wiki/Parsoid
// - https://www.mediawiki.org/wiki/Markup_spec
// - https://www.mediawiki.org/wiki/Help:Wikitext_examples
// - https://www.mediawiki.org/wiki/Help:Formatting
// - https://www.mediawiki.org/wiki/Help:Links
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
            `<a href="/wiki/${author.value}" title="${author.value}">${author.value}</a>`,
        )
        .join('; ')

      const editors = parameters
        .filter((param) => param.name.startsWith('editor'))
        .map(
          (editor) =>
            `<a href="/wiki/${editor.value}" title="${editor.value}">${editor.value}</a>`,
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
            `<a href="/wiki/${author.value}" title="${author.value}">${author.value}</a>`,
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
        (c) => c.fields[0].value === fields[0].value,
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

// Optional image URL resolver function
// If provided, will be used instead of MD5 calculation
export type ImageUrlResolver = (filename: string, width: number) => string

let imageUrlResolver: ImageUrlResolver | null = null

// Set the image URL resolver (called from Theseus.ts)
export function setImageUrlResolver(resolver: ImageUrlResolver | null) {
  imageUrlResolver = resolver
}

// Export the wiki extension function
export function wiki() {
  return [
    // Handle {{!}} FIRST - this must come before all other templates
    // It's used to escape pipe characters in templates
    {
      type: 'lang',
      regex: /\{\{!\}\}/g,
      replace: function () {
        return '|'
      },
    },

    ...cite,

    // [[File: ]]
    // Display an image
    // Must come BEFORE regular [[links]] to avoid conflicts
    // Example: [[File:Teseo e Arianna, Pompei.jpg|thumb|200px|A [[Fresco]] from [[Pompeii]]]]
    // Wikipedia URL structure: /thumb/{first_char}/{first_two_chars}/{filename}/{width}px-{filename}
    // Note: We need to handle nested [[links]] in captions, so we parse carefully
    {
      type: 'lang',
      regex: /\[\[File:([^\]]+)\]\]/g,
      replace: function (match, allParams) {
        // Parse parameters carefully, handling nested [[links]] in caption
        // We can't just split by | because nested links might contain |
        // Strategy: Find the filename (first part), then look for width pattern, rest is caption
        let filename = ''
        let imgWidth = 200
        let caption = ''
        
        // Find the first | that's not inside [[ ]]
        let bracketDepth = 0
        let parts: string[] = []
        let currentPart = ''
        
        for (let i = 0; i < allParams.length; i++) {
          const char = allParams[i]
          if (char === '[' && i < allParams.length - 1 && allParams[i + 1] === '[') {
            bracketDepth++
            currentPart += char
            i++ // Skip next [
            currentPart += '['
          } else if (char === ']' && i < allParams.length - 1 && allParams[i + 1] === ']') {
            bracketDepth--
            currentPart += char
            i++ // Skip next ]
            currentPart += ']'
          } else if (char === '|' && bracketDepth === 0) {
            parts.push(currentPart.trim())
            currentPart = ''
          } else {
            currentPart += char
          }
        }
        if (currentPart) {
          parts.push(currentPart.trim())
        }
        
        filename = parts[0] || ''
        const link = filename.trim().replace(/\s/g, '_')
        const url = `https://en.wikipedia.org/wiki/File:${encodeURIComponent(link)}`
        
        // Find width (look for "200px" pattern) - skip "thumb" if present
        const widthMatch = parts.find(p => /^\d+px$/.test(p))
        if (widthMatch) {
          imgWidth = parseInt(widthMatch.replace('px', ''), 10)
        }
        
        // Everything after width (or after filename if no width) is the caption
        const widthIndex = widthMatch ? parts.indexOf(widthMatch) : -1
        const captionStartIndex = widthIndex >= 0 ? widthIndex + 1 : (parts[0] === 'thumb' ? 2 : 1)
        caption = parts.slice(captionStartIndex).join('|')
        
        // Use image URL resolver if available, otherwise fall back to MD5 calculation
        let img: string
        if (imageUrlResolver) {
          img = imageUrlResolver(filename, imgWidth)
          if (!img) {
            // Fallback to MD5 if resolver returns empty string
            const hashParts = md5(link).split('/')
            const hashDir1 = hashParts[0] || '0'
            const hashDir2 = hashParts[1] || '00'
            const encodedFilename = encodeURIComponent(link)
            img = `https://upload.wikimedia.org/wikipedia/commons/thumb/${hashDir1}/${hashDir2}/${encodedFilename}/${imgWidth}px-${encodedFilename}`
          }
        } else {
          // Use MD5 calculation as fallback
          const hashParts = md5(link).split('/')
          const hashDir1 = hashParts[0] || '0'
          const hashDir2 = hashParts[1] || '00'
          const encodedFilename = encodeURIComponent(link)
          img = `https://upload.wikimedia.org/wikipedia/commons/thumb/${hashDir1}/${hashDir2}/${encodedFilename}/${imgWidth}px-${encodedFilename}`
        }
        
        // Process caption to convert [[links]] to HTML links
        // We need to do this manually since the caption won't go through the [[link]] handler
        let processedCaption = caption || ''
        if (processedCaption) {
          // Convert [[Link]] or [[Link|Display]] to HTML links
          processedCaption = processedCaption.replace(/\[\[([^\]]+)\]\]/g, function(linkMatch, linkContent) {
            const linkParts = linkContent.split('|')
            const linkTarget = linkParts[0].trim()
            const linkText = linkParts[1] ? linkParts[1].trim() : linkTarget
            const encodedLink = encodeURIComponent(linkTarget.replace(/ /g, '_'))
            return `<a href="https://en.wikipedia.org/wiki/${encodedLink}" title="${linkTarget}">${linkText}</a>`
          })
        }
        
        // Create proper img tag with sensible attributes
        let figureContent = `<figure style="width: ${imgWidth}px;">
  <a href="${url}">
  <img src="${img}" alt="${filename}" style="max-width: 100%; height: auto;" loading="lazy">
  </a>`
        
        if (processedCaption) {
          figureContent += `
  <figcaption>
  ${processedCaption}
  </figcaption>`
        }
        
        figureContent += `
  </figure>`
        
        return figureContent
      },
    },

    // [[ link ]]
    // Used for linking to another wikipedia page
    // Must come AFTER File: links to avoid conflicts
    {
      type: 'lang',
      regex: /\[\[([^\]]+)\]\]/g,
      replace: function (match, content) {
        const parts = content.split('|')
        const link = parts[0].trim()
        const text = parts[1] ? parts[1].trim() : link
        
        // Encode the link for URL
        const encodedLink = encodeURIComponent(link.replace(/ /g, '_'))
        return `<a href="https://en.wikipedia.org/wiki/${encodedLink}">${text}</a>`
      },
    },

    {
      type: 'lang',
      regex: /{{Div col\|colwidth=20em}}([\s\S]+?){{Div col end}}/g,
      replace: function (match, content) {
        // Process the content within the {{Div col...}} template
        // Note: Content will be processed by Showdown in subsequent passes
        // We just wrap it in a div - the markdown inside will be converted separately
        return `<div style="column-width: 20em;">${content.trim()}</div>`
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

    // {{main|Temporal parts}} or {{Main|Temporal parts}}
    // <div role="note" class="hatnote navigation-not-searchable">Main article: <a href="/wiki/Temporal_parts" title="Temporal parts">Temporal parts</a></div>
    // Note: This must come before the generic template handler
    {
      type: 'lang',
      regex: /\{\{[Mm]ain\|([^}]+)\}\}/g,
      replace: function (match, content) {
        // Handle cases where content might contain | characters
        const linkText = content.split('|')[0].trim()
        const linkForUrl = linkText.replace(/ /g, '_')
        return `<div role="note" class="hatnote navigation-not-searchable">Main article: <a href="/wiki/${linkForUrl}" title="${linkText}">${linkText}</a></div>`
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
    // Note: {{!}} should already be converted to | by the first extension handler
    // We match the template content up to the closing }}, handling nested templates carefully
    {
      type: 'lang',
      regex: /{{About\|([^}]+?)}}/g,
      replace: function (match, allParams) {
        // {{!}} should already be converted to | by now, so we can safely split
        const parts = allParams.split('|').map(p => p.trim())
        
        if (parts.length < 3) {
          console.warn('{{About}} template has fewer than 3 parameters:', match)
          return match // Return unchanged if malformed
        }
        
        let content = parts[0] || ''
        let about = parts[1] || ''
        // Take the third parameter (index 2) as the link text
        // If there are more parts, they might be duplicates or variations - take the first one
        let link = parts[2] || parts.slice(2).join('|')
        
        // Clean up the parameters
        content = content.trim()
        about = about.trim()
        link = link.trim()
        
        // Clean up any remaining template syntax (shouldn't happen if {{!}} was processed first)
        link = link.replace(/\{\{!\}\}/g, '|')
        link = link.replace(/\{\{[^}]*\}\}/g, '').trim()
        
        // Clean up italic markup: ''text'' becomes text
        link = link.replace(/''([^']*)''/g, '$1')
        link = link.replace(/''/g, '') // Remove any remaining single quotes
        
        // Remove any trailing artifacts
        link = link.replace(/\}\}+$/, '').trim()
        
        // If link contains a pipe, it might be a duplicate - take the first part before the pipe
        // This handles cases like "Ship of Theseus (film)|Ship of Theseus (film)"
        if (link.includes('|')) {
          const linkParts = link.split('|')
          // Find the part that looks like a title (has parentheses or is the longest)
          link = linkParts.find(p => p.includes('(')) || linkParts[0]
          link = link.trim()
        }
        
        // Extract the main title and any parenthetical (like "(film)")
        // Format: "Ship of Theseus (film)" -> title: "Ship of Theseus", suffix: " (film)"
        const parenMatch = link.match(/^(.+?)\s*(\([^)]+\))$/)
        let linkTitle = link
        let linkSuffix = ''
        
        if (parenMatch) {
          linkTitle = parenMatch[1].trim()
          linkSuffix = ' ' + parenMatch[2] // Keep the space before parentheses
        }
        
        // Encode the link for URL (spaces become underscores in Wikipedia URLs)
        // The URL should include the full title with parentheses
        const linkForUrl = link.replace(/ /g, '_')
        const encodedLink = encodeURIComponent(linkForUrl)
        
        // Format: "This article is about X. For Y, see <i>Title</i> (suffix)."
        // Match Wikipedia's format exactly
        return `<div role="note" class="hatnote navigation-not-searchable">This article is about ${content}. For ${about}, see <a href="/wiki/${encodedLink}" title="${link}"><i>${linkTitle}</i>${linkSuffix}</a>.</div>`
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

    // ''italic text''
    // <i>italic text</i>
    {
      type: 'lang',
      regex: /''([^']+)''/g,
      replace: function (match, content) {
        return `<i>${content}</i>`
      },
    },


    // Handle external links: [url text] or [url]
    {
      type: 'lang',
      regex: /\[(https?:\/\/[^\s\]]+)(?:\s+([^\]]+))?\]/g,
      replace: function (match, url, text) {
        return `<a href="${url}" class="external text" rel="nofollow">${text || url}</a>`
      },
    },

    // Handle ISBN template: {{ISBN|978-4396614669}}
    {
      type: 'lang',
      regex: /\{\{ISBN\|([^}]+)}}/g,
      replace: function (match, isbn) {
        return `<a href="/wiki/Special:BookSources/${isbn}" title="Special:BookSources/${isbn}"><bdi>${isbn}</bdi></a>`
      },
    },

    // {{longcite SEP|title=Material Constitution|url-id=material-constitution|author-last1=Wasserman|author-first1=Ryan|year=2009}}
    // Stanford Encyclopedia of Philosophy citation
    {
      type: 'lang',
      regex: /\{\{longcite SEP(?:\s*\|\s*[^\s=]+=[^|}]+)*\}\}/gi,
      replace: function (match) {
        const fields = match
          .replace(/\{\{/g, '')
          .replace(/\}\}/g, '')
          .split('|')
          .map((field) => field.trim())
          .filter(f => f.includes('='))

        const getField = (name) => {
          const field = fields.find(f => f.startsWith(name + '='))
          return field ? field.split('=').slice(1).join('=').trim() : ''
        }

        const title = getField('title')
        const urlId = getField('url-id')
        const authorLast = getField('author-last1')
        const authorFirst = getField('author-first1')
        const year = getField('year')

        const url = urlId ? `https://plato.stanford.edu/entries/${urlId}/` : ''
        const authorName = authorFirst && authorLast ? `${authorFirst} ${authorLast}` : authorLast || ''

        return `<cite class="citation">${authorName ? `${authorName} ` : ''}(${year || ''}). "${title ? `<a href="${url}" class="external text">${title}</a>` : ''}". <i>Stanford Encyclopedia of Philosophy</i>.</cite>`
      },
    },

    // {{Wikiquote}} or {{wikiquote-inline}} - Link to Wikiquote page
    {
      type: 'lang',
      regex: /\{\{[Ww]ikiquote(?:-inline)?\}\}/gi,
      replace: function () {
        // This would need the article title to generate the link, but we don't have context
        // For now, just remove it silently or render as a comment
        return '<!-- Wikiquote link -->'
      },
    },

    // {{DEFAULTSORT:Ship Of Theseus}} - Category sorting key, should be removed
    {
      type: 'lang',
      regex: /\{\{DEFAULTSORT:([^}]+)\}\}/gi,
      replace: function () {
        return '' // Remove silently
      },
    },

    // Generic template handler - catches any remaining templates
    // This must come LAST after all specific template handlers
    // Handles templates like {{Philosophy-sidebar}}, {{Philosophy sidebar}}, {{Template|param1|param2}}, etc.
    // Note: This uses a non-greedy match to avoid conflicts with nested templates
    {
      type: 'lang',
      regex: /\{\{([A-Za-z0-9_\-\s]+)(?:\|([^}]*?))?\}\}/g,
      replace: function (match, templateName, params) {
        const name = templateName.trim()
        
        // Skip if this looks like it's already been processed or is a known template pattern
        // Check for templates we've already handled specifically
        const knownPatterns = [
          'cite', 'longcite', 'Quote', 'About', 'Short description',
          'main', 'Main', 'sfn', 'Reflist', 'Div col', 'ISBN', 'Use dmy dates',
          'refbegin', 'refend', 'Wikiquote', 'wikiquote', 'DEFAULTSORT'
        ]
        
        // Check if this is a known template that should be handled by a specific handler
        const isKnown = knownPatterns.some(pattern => {
          const nameLower = name.toLowerCase()
          const patternLower = pattern.toLowerCase()
          return nameLower === patternLower || nameLower.includes(patternLower) || patternLower.includes(nameLower)
        })
        
        if (isKnown) {
          return match // Return unchanged, let other handlers process it
        }
        
        // List of templates that should be silently removed (navigation, metadata, etc.)
        // Note: Check for both "Philosophy-sidebar" and "Philosophy sidebar" (with space)
        // DEFAULTSORT is handled explicitly above, but keep it here as a fallback
        const silentTemplates = [
          'Philosophy-sidebar',
          'Philosophy sidebar',
          'Philosophy navigation',
          'navbox',
          'sidebar',
          'infobox',
          'DISPLAYTITLE',
          'Category',
          'Stub',
          'Cleanup',
          'Refimprove',
          'Citation needed',
          'Authority control',
          'Portal',
        ]
        
        // Check if this is a template we should silently remove
        // Use more flexible matching for sidebar templates
        const shouldRemove = silentTemplates.some(t => {
          const templateLower = name.toLowerCase().replace(/[_\s-]/g, '')
          const silentLower = t.toLowerCase().replace(/[_\s-]/g, '')
          return templateLower.includes(silentLower) || silentLower.includes(templateLower)
        })
        
        if (shouldRemove) {
          return '' // Remove silently
        }
        
        // For other unknown templates, render as a comment or placeholder
        // You can change this to render them differently if needed
        return `<!-- Template: ${name}${params ? ' | ' + params : ''} -->`
      },
    },
  ]
}

// Also export for global use (backwards compatibility)
if (typeof window !== 'undefined') {
  window.globalThis.wiki = wiki
}

// MD5 implementation for Wikimedia Commons image URLs
// Wikipedia uses MD5 hash: first char, then first two chars as directory structure
// This is a compact MD5 implementation based on the standard algorithm
function md5(str: string): string {
  // Convert string to UTF-8 bytes
  const utf8 = []
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i)
    if (c < 0x80) {
      utf8.push(c)
    } else if (c < 0x800) {
      utf8.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f))
    } else {
      utf8.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f))
    }
  }
  
  // MD5 constants
  const s = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21]
  const K = [0xd76aa478,0xe8c7b756,0x242070db,0xc1bdceee,0xf57c0faf,0x4787c62a,0xa8304613,0xfd469501,0x698098d8,0x8b44f7af,0xffff5bb1,0x895cd7be,0x6b901122,0xfd987193,0xa679438e,0x49b40821,0xf61e2562,0xc040b340,0x265e5a51,0xe9b6c7aa,0xd62f105d,0x02441453,0xd8a1e681,0xe7d3fbc8,0x21e1cde6,0xc33707d6,0xf4d50d87,0x455a14ed,0xa9e3e905,0xfcefa3f8,0x676f02d9,0x8d2a4c8a,0xfffa3942,0x8771f681,0x6d9d6122,0xfde5380c,0xa4beea44,0x4bdecfa9,0xf6bb4b60,0xbebfbc70,0x289b7ec6,0xeaa127fa,0xd4ef3085,0x04881d05,0xd9d4d039,0xe6db99e5,0x1fa27cf8,0xc4ac5665,0xf4292244,0x432aff97,0xab9423a7,0xfc93a039,0x655b59c3,0x8f0ccc92,0xffeff47d,0x85845dd1,0x6fa87e4f,0xfe2ce6e0,0xa3014314,0x4e0811a1,0xf7537e82,0xbd3af235,0x2ad7d2bb,0xeb86d391]
  
  // Initialize MD5 buffer
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476
  
  // Pre-processing: add padding
  const msgLen = utf8.length * 8
  utf8.push(0x80)
  while ((utf8.length % 64) !== 56) utf8.push(0x00)
  
  // Append length (little-endian)
  const lenBytes = []
  let len = msgLen
  for (let i = 0; i < 8; i++) {
    lenBytes.push(len & 0xff)
    len >>>= 8
  }
  utf8.push(...lenBytes)
  
  // Process message in 512-bit chunks
  for (let chunk = 0; chunk < utf8.length; chunk += 64) {
    const w = []
    for (let i = 0; i < 16; i++) {
      w[i] = utf8[chunk + i*4] | (utf8[chunk + i*4 + 1] << 8) | 
             (utf8[chunk + i*4 + 2] << 16) | (utf8[chunk + i*4 + 3] << 24)
    }
    
    let a = h0, b = h1, c = h2, d = h3
    
    for (let i = 0; i < 64; i++) {
      let f, g
      if (i < 16) {
        f = (b & c) | ((~b) & d)
        g = i
      } else if (i < 32) {
        f = (d & b) | ((~d) & c)
        g = (5*i + 1) % 16
      } else if (i < 48) {
        f = b ^ c ^ d
        g = (3*i + 5) % 16
      } else {
        f = c ^ (b | (~d))
        g = (7*i) % 16
      }
      
      f = (f + a + K[i] + w[g]) | 0
      a = d
      d = c
      c = b
      b = (b + ((f << s[i]) | (f >>> (32 - s[i])))) | 0
    }
    
    h0 = (h0 + a) | 0
    h1 = (h1 + b) | 0
    h2 = (h2 + c) | 0
    h3 = (h3 + d) | 0
  }
  
  // Convert to hex string
  const hex = [h0, h1, h2, h3].map(h => {
    const str = (h >>> 0).toString(16)
    return '00000000'.substring(str.length) + str
  }).join('')
  
  // Return first char and first two chars for Wikipedia directory structure
  return hex.charAt(0) + '/' + hex.substring(0, 2)
}

function utf8Encode(str: string): string {
  str = str.replace(/\r\n/g, '\n')
  let utftext = ''
  for (let n = 0; n < str.length; n++) {
    const c = str.charCodeAt(n)
    if (c < 128) {
      utftext += String.fromCharCode(c)
    } else if ((c > 127) && (c < 2048)) {
      utftext += String.fromCharCode((c >> 6) | 192)
      utftext += String.fromCharCode((c & 63) | 128)
    } else {
      utftext += String.fromCharCode((c >> 12) | 224)
      utftext += String.fromCharCode(((c >> 6) & 63) | 128)
      utftext += String.fromCharCode((c & 63) | 128)
    }
  }
  return utftext
}

function getFieldValue(fields: string[], fieldName: string): string {
  const field = fields.find((f) => f.startsWith(fieldName))
  return field ? field.split('=')[1]?.trim() || '' : ''
}

// Export types for use elsewhere
export type WikiExtension = ReturnType<typeof wiki>
