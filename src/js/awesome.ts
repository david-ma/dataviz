// @ts-nocheck 2551

var md = new showdown.Converter({ openLinksInNewWindow: true })

// @ts-ignore
const socket = io('/dataviz')

/**
 * Todo:
 * sort by votes
 * hide/show project when tab is selected?
 * filter by categories
 * add better categories
 * photos?
 * security???
 */

let initialData = {}
socket.on('allData', (packet) => {
  initialData = packet
  console.log('Receiving initial Data!', initialData)
  window.setTimeout(() => {
    Object.keys(initialData).forEach((key) => {
      const type = key.split('-')[0]
      if (type === 'category') {
        $(`#${key}`).prop('checked', initialData[key])
      } else {
        $(`#${key}`).val(initialData[key])
      }
      if (type === 'signatures') countVotes(key)
    })
  }, 100)
})

socket.on('overwriteText', (packet) => {
  const element = $(`#${packet.name}`)
  const type = packet.name.split('-')[0]

  if (type === 'category') {
    element.prop('checked', packet.data)
  } else {
    const properties = {
      selectionStart: element.prop('selectionStart'),
      selectionEnd: element.prop('selectionEnd'),
    }
    element.val(packet.data)
    if (properties.selectionStart) element.prop(properties)
  }
  if (type === 'signatures') countVotes(packet.name)
})

d3.json('/awesome').then(function (data: any) {
  console.log("List of projects recieved", data)

  var project = d3
    .select('#AwesomeStuff')
    .selectAll('div')
    .data(data.projects)
    .enter()
    .append('div')
    .classed('project', true)
    .attr('id', (d: any) => 'project-' + d.id)
    .classed('row', true)
    .each(function (d: any) {
      const tab = d3.select('#tabs').append('li')

      tab
        .append('input')
        .attr('id', 'tab-' + d.id)
        .attrs({
          type: 'radio',
          name: 'tabs',
        })
        .on('click', () => {
          window.location.hash = `#project-${d.id}`
        })

      tab
        .append('label')
        .attr('for', 'tab-' + d.id)
        .text(d.title)
        .append('span')
        .attrs({
          id: `tabVotes-${d.id}`,
        })

      const projectId = 'project-' + d.id

      const project = d3.select(this)
      const header = project.append('div').attr('id', projectId)
      const left = project.append('div').classed('col-xs-6', true)
      const right = project.append('div').classed('col-xs-6', true)

      var leftSide = header.append('div').classed('col-xs-7', true)

      leftSide
        .append('h1')
        .append('a')
        .attr('href', `#${projectId}`)
        .text(d.title)

      leftSide.append('span').text(`Submitted by: ${d.name}`)
      if (d.url) {
        leftSide.append('p').append('a').attr('href', d.url).text(d.url)
      }

      var rightSide = header.append('div').classed('col-xs-5', true)
      rightSide
        .html(
          md.makeHtml(
            `Dinosaur, Social Justice, Sports, Art, Church, Queer, Refugee, Education, Science, Collaboration, Environment, Health, Community, Technology, Feasibility with $1000, Other:`
          )
        )
        .classed('categories', true)
        .style('display', 'none')

      left
        .append('div')
        .classed('photos', true)
        .selectAll('img')
        .data(
          data.photos.filter((photo: any) => photo.awesome_project_id === d.id)
        )
        .enter()
        // .append('b')
        .append('a')
        .attr('href', (d: any) => d.url)
        .attr('target', '_blank')
        // .text(`Image-Link `)
        .append('img')
        .attr('src', (d: any) => d.url)
        .styles({
          width: '135px',
          height: '135px',
          'object-fit': 'contain',
        })

      left.append('h3').text("Here's my idea:")
      left
        .append('div')
        .attr('id', 'description-' + d.id)
        .classed('smaller', (d: any) => d.about_project.length > 1000)
      $('#description-' + d.id).html(md.makeHtml(d.about_project))

      left.append('h3').text('How I will use the money:')

      left
        .append('div')
        .attr('id', 'use-' + d.id)
        .classed('smaller', (d: any) => d.use_for_money.length > 400)
      $('#use-' + d.id).html(md.makeHtml(d.use_for_money))

      left.append('h3').text('A little about me:')
      left
        .append('div')
        .attr('id', 'me-' + d.id)
        .classed('smaller', (d: any) => d.about_me.length > 400)
      $('#me-' + d.id).html(md.makeHtml(d.about_me))

      right.append('h3').text('Awesome Trustee Comments:')
      right
        .append('textarea')
        .classed('comments', true)
        .attrs({
          id: `comments-${d.id}`,
          name: `comments-${d.id}`,
          placeholder: 'Write collaborative comments here',
        })
        .on('keyup', function (d: any) {
          const text = $(this).val()
          socket.emit('overwriteText', {
            id: d.id,
            name: `comments-${d.id}`,
            data: text,
          })
        })
        .text(() => {
          const data = initialData[`comments-${d.id}`]
          if (data) {
            return initialData[`comments-${d.id}`]
          } else {
            return ''
          }
        })

      right
        .append('h3')
        .text('Votes:')
        .append('span')
        .attrs({
          id: `voteCounts-${d.id}`,
        })
      right
        .append('input')
        .classed('signatures', true)
        .attrs({
          id: `signatures-${d.id}`,
          name: `signatures-${d.id}`,
          placeholder:
            'Add comma seperated names to vote. E.g. "Merry, Pippin, Frodo, Sam"',
        })
        .on('keyup', function (d: any) {
          const text = $(this).val()
          socket.emit('overwriteText', {
            id: d.id,
            name: `signatures-${d.id}`,
            data: text,
          })
        })
        .text(() => {
          const data = initialData[`signatures-${d.id}`]
          if (data) {
            return initialData[`signatures-${d.id}`]
          } else {
            return ''
          }
        })
        .on('input', countVotes)

      right.append('h3').text('Applicable Categories:')
      const categories = {
          Dino: "Includes the codeword",
          "Social Justice": "Promotes equality and justice.",
          Art: "Expresses creative endeavors.",
          Education: "Provides learning opportunities.",
          Science: "Involves citizen science or research.",
          Sports: "Engages in amateur sports.",
          Innovation: "Showcases innovative ideas.",
          Sustainability: "Helps the environment.",
          Inclusivity: "Promotes community collaboration.",
          Healthcare: "Focuses on health improvement.",
          Scalability: "This project could start something really big.",
          Viable: "Feasible and achievable.",
          "Big Impact": "Our $1000 will have a big impact.",
        };

      right
        .append('ul')
        .attrs({
          class: 'categoryList row',
        })
        .selectAll('li')
        .data(Object.keys(categories))
        .enter()
        .append('li')
        .attr(
          'id',
          (category) => `categoryLi-${d.id}-${cssSelectorSafe(category)}`
        )
        .each((category) => {
          const li = d3.select(
            `#categoryLi-${d.id}-${cssSelectorSafe(category)}`
          )
          const elementId = `category-${d.id}-${cssSelectorSafe(category)}`

          li.append('input')
            .attrs({
              id: elementId,
              type: 'checkbox',
            })
            .on('input', function () {
              const value = $(`#${elementId}`).is(':checked')
              socket.emit('overwriteText', {
                id: d.id,
                name: elementId,
                data: value,
              })
            })
          li.append('label').text(category).attrs({
            for: elementId,
          })
          li.append('p')
            .classed('categoryDesription', true)
            .text(categories[category])
        })

      right.append('h3').text('Follow up items:')
      right
        .append('textarea')
        .classed('debrief', true)
        .attrs({
          id: `debrief-${d.id}`,
          name: `debrief-${d.id}`,
          placeholder:
            'What other things could be done for this project, besides money? What advice can we give them?',
        })
        .on('keyup', function (d: any) {
          const text = $(this).val()
          socket.emit('overwriteText', {
            id: d.id,
            name: `debrief-${d.id}`,
            data: text,
          })
        })
        .text(() => {
          const data = initialData[`debrief-${d.id}`]
          if (data) {
            return initialData[`debrief-${d.id}`]
          } else {
            return ''
          }
        })

      d3.select('#title h1 a').text('Awesome Foundation Melbourne')

      // print version
      // check querystring for "print"
      if (window.location.search.includes('print')) {
        project.classed('printProject', true)
        d3.select('body').classed('print', true)
        right.remove()
        left.classed('col-xs-12', true)
        left.append('br').classed('page-break', true)
        d3.select('header').remove()
        d3.select('footer').remove()
        d3.select('#mobile_nav').remove()

        d3.select('#tabs').remove()
      }
    })
})

function countVotes(id) {
  let text = ''
  if (typeof id === 'string') {
    text = $(`#${id}`).val() as string
  } else {
    text = $(this).val() as string
    id = d3.select(this).attr('id')
  }

  // let text = $(`#signatures-${d.id}`).val() as string;
  const votes = text ? text.split(',').length : 0
  const ideaID = id.split('-')[1]
  d3.select(`#voteCounts-${ideaID}`).text(` (${votes})`)
  d3.select(`#tabVotes-${ideaID}`).text(` (${votes})`)
}

function cssSelectorSafe(string) {
  return string.toLowerCase().replace(/[ .!$#{}'"`\/\\\[\]]/, '-') // eslint-disable-line
}
