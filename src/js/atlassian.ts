import { Chart, _ } from 'chart'

console.log('This message is coming from the frontend atlassian.ts')

function drawNode(list_element, node) {
  if (node.children) {
    list_element.classed('hasChildren', true)

    list_element
      .append('a')
      .text(node.name)
      .attr('href', '#')
      .on('click', (d) => {
        console.log('clicked')
        if (list_element.classed('collapsed')) {
          list_element.classed('collapsed', false)
        } else {
          list_element.classed('collapsed', true)
        }
      })

    const next_level_list = list_element.append('ul')
    node.children.forEach((child) => {
      drawNode(next_level_list.append('li'), child)
    })
  } else {
    list_element.text(node.name)
  }
}

fetch('/backendData')
  .then((d) => d.json())
  .then((d: any) => {
    const list = d3.select('#list')

    d.forEach(function (node) {
      const li = list.append('li')
      drawNode(li, node)
    })
  })
