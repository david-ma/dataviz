var box = d3.select('#cards')



d3.csv('/cards.csv')
  .then(function (data) {
    box
      .selectAll('div.class')
      .data(data)
      .enter()
      .append('div')
      .attr('class', 'set')
      .html(function (d) {
        return `
          <div class="card ${d.Category}">
              <div class="category">${d.Category}</div>
          </div>
          <div class="card ${d.Category}">
            <div class="prompt">${d.Prompt}</div>
          </div>
        `
      })
  })

