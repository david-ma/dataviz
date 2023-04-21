console.log('Hello world, we are makign a mandala')

type circleInfo = {
  x: number
  y: number
  r: number
  color: string
}

// cubic bezier curve info
type curveInfo = {
  x1: number
  y1: number
  x2: number
  y2: number
  x3: number
  y3: number
  x4: number
  y4: number
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

function calculateCurve(start: coords, end: coords) {
  const x1 = start.x
  const y1 = start.y
  const x4 = end.x
  const y4 = end.y

  const x2 = x1 + 100
  const y2 = y1
  const x3 = x4 - 100
  const y3 = y4

  return {
    x1,
    y1,
    x2,
    y2,
    x3,
    y3,
    x4,
    y4,
  }
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
  const secondCircles: circleInfo[] = calculateCircles(
    layerRadius + 150,
    16,
    center
  )

  circles.forEach((circle, i) => {
    var curve = calculateCurve(circle, secondCircles[i * 2 + 1])

    box
      .append('path')
      .attr(
        'd',
        `M ${curve.x1} ${curve.y1} C ${curve.x2} ${curve.y2} ${curve.x3} ${curve.y3} ${curve.x4} ${curve.y4}`
      )
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('fill', 'none')

    // Magic number. Not great.
    if (i === 0) {
      i = 8
    }

    var curve2 = calculateCurve(circle, secondCircles[i * 2 - 1])
    box
      .append('path')
      .attr(
        'd',
        `M ${curve2.x1} ${curve2.y1} C ${curve2.x2} ${curve2.y2} ${curve2.x3} ${curve2.y3} ${curve2.x4} ${curve2.y4}`
      )
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
  })
}

drawMandala()
