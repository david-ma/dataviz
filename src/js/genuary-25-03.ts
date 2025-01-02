import { Chart, decorateTable } from './chart'
// import * as d3 from 'd3'
// import $ from 'jquery'
// import 'datatables.net'

console.log('Running example.ts')

const width = 1080,
      height = 1920

$.when($.ready).then(function () {
  const chart = new Chart({
    // eslint-disable-line
    element: 'exampleDiv',
    margin: 20,
    width,
    height,
    nav: false,
    renderer: 'canvas'
  })
    .scratchpad(function background(chart: Chart) {
      // chart.svg
      //   .append('rect')
      //   .attr('x', 0)
      //   .attr('y', 0)
      //   .attr('width', width)
      //   .attr('height', height)
      //   .attr('fill', '#222')
      chart.context.fillStyle = '#222'
      chart.context.fillRect(0, 0, width, height)
      animate(chart)

    
    })
    // .scratchpad(function drawLines(chart: Chart) {
    //   window.setInterval(() => {
    //     const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
    //     for (let i = 0; i < 100; i++) {
    //       drawLine(chart, color)
    //     }
    //   }, 1000)
    // })
})

let frame = 0
let lastTime = performance.now()

function fpsCounter() {
  const now = performance.now()
  if (frame % 60 === 0) {
    const time_since_last_frame = now - lastTime
    const fps = 1000 / time_since_last_frame
    $("#frame_counter").text(`FPS: ${fps.toFixed(2)}`)
    lastTime = now
  }
}

function animate(chart: Chart) {
  fpsCounter()
  // Clear previous frame
  chart.context.clearRect(0, 0, width, height)
  
  // Draw background
  chart.context.fillStyle = '#222'
  chart.context.fillRect(0, 0, width, height)
  
  // Update animation
  frame++
  
  // Draw animated elements
  chart.context.fillStyle = '#fff'
  chart.context.fillRect(
    Math.sin(frame * 0.05) * 100 + width/2, // x position
    Math.cos(frame * 0.05) * 100 + height/2, // y position
    20, // width 
    20  // height
  )
  
  // Continue animation loop
  // requestAnimationFrame(() => animate(chart))

  setupCanvas(chart)
  requestAnimationFrame((time) => animate2(chart, time))
}

// Start animation
const frameRate = 1000/60  // Target 60fps
const dpr = window.devicePixelRatio || 1
function setupCanvas(chart: Chart) {
  const canvas = chart.canvas
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  chart.context.scale(dpr, dpr)
}

function animate2(chart: Chart, currentTime = 0) {
  // Skip frame if too early
  const elapsed = currentTime - lastTime
  if (elapsed < frameRate) {
    requestAnimationFrame((time) => animate2(chart, time))
    return
  }
  
  lastTime = currentTime
  fpsCounter()
  
  // Clear and draw
  const ctx = chart.context
  ctx.clearRect(0, 0, width, height)
  
  ctx.fillStyle = '#222'
  ctx.fillRect(0, 0, width, height)
  
  // Cache calculations
  const centerX = width/4
  const centerY = height/4
  const position = frame * 0.05
  
  ctx.fillStyle = '#fff'
  ctx.fillRect(
    Math.sin(position) * 100 + centerX,
    Math.cos(position) * 100 + centerY,
    20,
    20
  )
  
  frame++
  requestAnimationFrame((time) => animate2(chart, time))
}

function drawLine(chart: Chart, color = 'white') {
  // chart.context.fillStyle = '#222'
  // chart.context.fillRect(0, 0, width, height)
  // chart.context.beginPath()
  // const randomX = Math.random() * width
  // const randomY = Math.random() * height
  // const randomDistance = Math.random() * 1000
  // chart.context.moveTo(randomX, randomY)
  // chart.context.lineTo(randomX, randomY + randomDistance)
  // chart.context.strokeStyle = color
  // chart.context.stroke()
  // chart.context.closePath()
  // chart.context.stroke()
  // chart.context.fill()

  // const line = chart.svg.append('line')
  // const randomX = Math.random() * width
  // const randomY = Math.random() * height
  // const randomDistance = Math.random() * 1000

  // line
  //   .attr('x1', randomX)
  //   .attr('y1', randomY)
  //   .attr('x2', randomX)
  //   .attr('y2', randomY)
  //   .transition()
  //   .duration(5000)
  //   .attr('y2', randomY + randomDistance)
  //   .attr('stroke', color)
}