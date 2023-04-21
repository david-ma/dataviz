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

// Takes a circleInfo and draws it on the svg
function drawCircle(svg, circle: circleInfo) {
  svg
    .append('circle')
    .attr('cx', circle.x)
    .attr('cy', circle.y)
    .attr('r', circle.r)
    .attr('fill', circle.color)
    .attr('stroke', 'black')
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
    const r = 50
    const color = 'red'

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
    layerRadius = 200

  const box = d3.select('#svg-box').append('svg')

  box
    .attr('width', width)
    .attr('height', height)
    .append('circle')
    .attr('cx', centerX)
    .attr('cy', centerY)
    .attr('r', layerRadius)
    .attr('fill', 'orange')
    .attr('stroke', 'black')

  const circles: circleInfo[] = calculateCircles(layerRadius, 8, {
    x: centerX,
    y: centerY,
  })

  circles.forEach((circle) => {
    drawCircle(box, circle)
  })
}

drawMandala()
