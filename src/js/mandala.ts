console.log('Hello world, we are makign a mandala')

type circleInfo = {
  x: number
  y: number
  r: number
  color: string
}



type coords = {
  x: number
  y: number
}

const colors = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3']

// Takes a circleInfo and draws it on the svg
function drawCircle(svg, circle: circleInfo) {
  svg
    .append('circle')
    .attr('cx', circle.x)
    .attr('cy', circle.y)
    .attr('r', circle.r)
    .attr('fill', circle.color)
    .attr('stroke', 'black')
  // .attr('opacity', 0.2)
}

// Calculates the circles for the mandala
function calculateCircles(
  radius: number,
  numCircles: number,
  center: coords
): circleInfo[] {
  const circles: circleInfo[] = []

  // Calculate the circles for the first layer
  for (let i = 0; i < numCircles; i++) {
    const angle = (i / numCircles) * 2 * Math.PI
    const x = Math.cos(angle) * radius + center.x
    const y = Math.sin(angle) * radius + center.y
    const r = 70
    const color = colors[1]

    circles.push({
      x,
      y,
      r,
      color,
    })
  }

  return circles
}

function drawMandala() {
  const height = 1000,
    width = 1000,
    centerY = height / 2,
    centerX = width / 2,
    layerRadius = 200,
    center = { x: centerX, y: centerY }

  const box = d3.select('#svg-box').append('svg')

  box
    .attr('width', width)
    .attr('height', height)
    .append('circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', layerRadius)
    .attr('fill', colors[0])
    // .attr('opacity', 0.2)
    .attr('stroke', 'black')

  const circles: circleInfo[] = calculateCircles(layerRadius, 8, center)

  circles.forEach((circle) => {
    drawCircle(box, circle)
  })

  // Draw petals from the first layer to the second layer
  // Calculate points on second layer
  const secondCircles: circleInfo[] = calculateCircles(layerRadius + 150, 16, center)

  circles.forEach((circle, i) => {
    // Draw a line from the first layer to the second layer

    box.append('line')
      .attr('x1', circle.x)
      .attr('y1', circle.y)
      .attr('x2', secondCircles[i * 2 + 1].x)
      .attr('y2', secondCircles[i * 2 + 1].y)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)

    // Magic number. Not great.
    if(i === 0) { i = 8}

    box.append('line')
      .attr('x1', circle.x)
      .attr('y1', circle.y)
      .attr('x2', secondCircles[i * 2 - 1].x)
      .attr('y2', secondCircles[i * 2 - 1].y)
      .attr('stroke', 'black')
      .attr('stroke-width', 2)

  })

}

drawMandala()
