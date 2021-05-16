console.log('running fridge.ts')

function drawFridge() {
  console.log(`Drawing fridge`)

  var svg = d3.select<HTMLElement, any>('#fridge').append('svg')
  var height = 900,
    width = 900

  svg.append('rect').attrs({
    width: width,
    height: height,
  })
}

drawFridge()

$.when($.ready).then(() => {
  console.log(`hey jquery says we're ready`)
})
