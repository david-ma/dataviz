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

function calculateCurves(
  center: coords,
  left: coords,
  right: coords
): curveInfo[] {
  // Given the coordinates of the top left, top right and center of a petal
  // Generate bezier curves for the petal
  // The petal is a bezier curve with 4 control points

  const harshness = 0.8

  const topCenterX = (left.x + right.x) / 2
  const topCenterY = (left.y + right.y) / 2

  // The mid control point is 60% between the topCenter and center
  const midControlPointX = topCenterX * harshness + center.x * (1 - harshness)
  const midControlPointY = topCenterY * harshness + center.y * (1 - harshness)

  // Find the bottom left corner
  const bottomLeftX = center.x - (topCenterX - left.x)
  const bottomLeftY = center.y - (topCenterY - left.y)

  const leftControlPointX = left.x * harshness + bottomLeftX * (1 - harshness)
  const leftControlPointY = left.y * harshness + bottomLeftY * (1 - harshness)

  // find bottom right corner
  const bottomRightX = center.x - (topCenterX - right.x)
  const bottomRightY = center.y - (topCenterY - right.y)

  const rightControlPointX =
    right.x * harshness + bottomRightX * (1 - harshness)
  const rightControlPointY =
    right.y * harshness + bottomRightY * (1 - harshness)

  // return the curves
  const curves: curveInfo[] = [
    {
      x1: left.x,
      y1: left.y,
      x2: leftControlPointX,
      y2: leftControlPointY,
      x3: midControlPointX,
      y3: midControlPointY,
      x4: center.x,
      y4: center.y,
    },
    {
      x1: center.x,
      y1: center.y,
      x2: midControlPointX,
      y2: midControlPointY,
      x3: rightControlPointX,
      y3: rightControlPointY,
      x4: right.x,
      y4: right.y,
    },
  ]

  return curves
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
    var right = secondCircles[i * 2 + 1]

    // Magic number. Not great.
    if (i === 0) {
      i = 8
    }
    var left = secondCircles[i * 2 - 1]

    var curves = calculateCurves(circle, left, right)

    curves.forEach(function (curve) {
      // drawCircle(box, {
      //   x: curve.x1,
      //   y: curve.y1,
      //   r: 5,
      //   color: 'red',
      // })
      // drawCircle(box, {
      //   x: curve.x2,
      //   y: curve.y2,
      //   r: 5,
      //   color: 'red',
      // })
      // drawCircle(box, {
      //   x: curve.x3,
      //   y: curve.y3,
      //   r: 5,
      //   color: 'red',
      // })
      // drawCircle(box, {
      //   x: curve.x4,
      //   y: curve.y4,
      //   r: 5,
      //   color: 'red',
      // })

      box
        .append('path')
        .attr(
          'd',
          `M ${curve.x1},${curve.y1} C ${curve.x2},${curve.y2} ${curve.x3},${curve.y3} ${curve.x4},${curve.y4}`
        )
        .attr('stroke', 'black')
        .attr('fill', 'none')
    })
  })
}

drawMandala()
