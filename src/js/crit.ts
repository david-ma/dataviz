var box = d3.select('#cards')

type Printout = {
  Type: 'Prompt' | 'Category'
  Category: string
  Words: string
}

d3.csv('/cards.csv').then(function (data) {
  // Get all printouts
  const printouts: Printout[] = []
  data.forEach(function (d) {
    printouts.push({
      Type: 'Prompt',
      Category: d.Category,
      Words: d.Prompt,
    })
    printouts.push({
      Type: 'Category',
      Category: d.Category,
      Words: d.Category,
    })
  })

  // Sort printouts into sets of 9
  const sets: Printout[][] = []
  let set: Printout[] = []
  printouts.forEach(function (p) {
    set.push(p)
    if (set.length === 9) {
      sets.push(set)
      set = []
    }
  })

  // Render each set
  sets.forEach(function (s) {
    box
      .append('div')
      .attr('class', 'set')
      .selectAll('div.card')
      .data(s)
      .enter()
      .append('div')
      .attr('class', 'card')
      .html(function (d) {
        if (d.Type === 'Category') {
          return `<div class="category">${d.Category}</div>`
        } else {
          return `
            <div class="sideprompt">${d.Words}</div>
            <div class="prompt">${d.Words}</div>
          `
        }
      })
  })

  // box
  //   .selectAll('div.class')
  //   .data(data)
  //   .enter()
  //   .append('div')
  //   .attr('class', 'set')
  //   .html(function (d) {
  //     return `
  //         <div class="card ${d.Category}">
  //             <div class="category">${d.Category}</div>
  //         </div>
  //         <div class="card">
  //           <div class="prompt">${d.Prompt}</div>
  //         </div>
  //       `
  //   })
})
