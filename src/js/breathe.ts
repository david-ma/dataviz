
import { Chart } from 'chart';
import * as d3 from 'd3';
import $ from 'jquery';
// import 'datatables.net';

console.log("Running breathe.ts")

type LineData = {
  start: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  },
  end: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }
}

const speed :number = 2000;
const size :number = 100;

$.when( $.ready ).then(function() {
  const chart = new Chart({
    title: "Breathe In",
    element: 'breatheDiv',
    margin: 40,
    width: 600,
    height: 600,
    nav: false
  }).scratchpad((chart :Chart) => {
    const svg = chart.svg;

    // Put the title on the bottom
    chart.svg.select(".chart-title")
      .attr('transform', `translate(${chart.width / 2},${chart.height - 15})`)

    const original :Array<LineData> = [{
      start: {
        x1: chart.width / 2,
        y1: chart.height * 0.8,
        x2: chart.width / 2,
        y2: chart.height * 0.8
      },
      end: {
        x1: (chart.width / 2) - size,
        y1: chart.height * 0.8,
        x2: (chart.width / 2) + size,
        y2: chart.height * 0.8
      }
    }]

    const triangleHeight = Math.sqrt(3 * size * size)
    console.log(triangleHeight)
    const triangle : Array<LineData> = [{
      start: {
        x1: (chart.width / 2) - size,
        y1: chart.height * 0.8,
        x2: chart.width / 2,
        y2: chart.height * 0.8
      }, 
      end: {
        x1: (chart.width / 2) - size,
        y1: chart.height * 0.8,
        x2: chart.width / 2,
        y2: (chart.height * 0.8) - triangleHeight
      }
    }, {
      start: {
        x1: chart.width / 2,
        y1: chart.height * 0.8,
        x2: (chart.width / 2) + size,
        y2: chart.height * 0.8
      }, 
      end: {
        x1: chart.width / 2,
        y1: (chart.height * 0.8) - triangleHeight,
        x2: (chart.width / 2) + size,
        y2: chart.height * 0.8
      }
    }]

    const square : Array<LineData> = [{
      start: {
        x1: (chart.width / 2) - size,
        y1: chart.height * 0.8,
        x2: chart.width / 2,
        y2: (chart.height * 0.8) - triangleHeight
      },
      end: {
        x1: (chart.width / 2) - size,
        y1: chart.height * 0.8,
        x2: chart.width / 2 - size,
        y2: (chart.height * 0.8) - 2 * size
      }
    }, {
      start: {
        x1: chart.width / 2,
        y1: (chart.height * 0.8) - triangleHeight,
        x2: (chart.width / 2) + size,
        y2: chart.height * 0.8
      },
      end: {
        x1: chart.width / 2 + size,
        y1: (chart.height * 0.8) - 2 * size,
        x2: chart.width / 2 + size,
        y2: chart.height * 0.8
      }
    }, {
      start: {
        x1: chart.width / 2,
        y1: (chart.height * 0.8) - triangleHeight,
        x2: chart.width / 2,
        y2: (chart.height * 0.8) - triangleHeight
      },
      end: {
        x1: chart.width / 2 - size,
        y1: (chart.height * 0.8) - 2 * size,
        x2: chart.width / 2 + size,
        y2: (chart.height * 0.8) - 2 * size
      }
    }]


    svg.selectAll(".originalLine")
    .data(original)
    .enter()
    .append("line")
    .classed("originalLine", true)
    .attrs({
      x1: chart.width / 2,
      y1: chart.height * 0.8,
      x2: chart.width / 2,
      y2: chart.height * 0.8
    }).transition()
    .duration(speed)
    .attrs({
      x1: (chart.width / 2) - size,
      x2: (chart.width / 2) + size
    }).on('end', function(d) {
      svg.selectAll(".triangleLine")
        .data(triangle)
        .enter()
        .append('line')
        .classed("triangleLine", true)
        .attr('x1', d => d.start.x1)
        .attr('y1', d => d.start.y1)
        .attr('x2', d => d.start.x2)
        .attr('y2', d => d.start.y2)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('x1', d => d.end.x1)
        .attr('y1', d => d.end.y1)
        .attr('x2', d => d.end.x2)
        .attr('y2', d => d.end.y2)
        .on('end', function(d){          

          var count = 0;
          svg.selectAll(".squareLine")
            .data(square)
            .enter()
            .append('line')
            .classed("squareLine", true)
            .attr('x1', d => d.start.x1)
            .attr('y1', d => d.start.y1)
            .attr('x2', d => d.start.x2)
            .attr('y2', d => d.start.y2)
            .transition()
            .duration(speed)
            .attr('x1', d => d.end.x1)
            .attr('y1', d => d.end.y1)
            .attr('x2', d => d.end.x2)
            .attr('y2', d => d.end.y2)
            .on('end', () =>{
              count++
              if(count == square.length) {
                callReverse()
              }
            })
        })
    })
  })
})

function callReverse() {
  d3.select(".chart-title").text("Breathe Out")

  reverse(d3.selectAll(".squareLine"))
  .then( () => reverse(d3.selectAll(".triangleLine")) )
  .then( () => reverse(d3.selectAll(".originalLine")) )
  .then(callDraw)

  function reverse(lines : d3.Selection<SVGLineElement, LineData, HTMLElement, any>) {
    return new Promise(function (resolve) {
      lines
      .transition()
      .duration(speed)
      .attr('x1', d => d.start.x1)
      .attr('y1', d => d.start.y1)
      .attr('x2', d => d.start.x2)
      .attr('y2', d => d.start.y2)
      .on("end", () => {
        lines.style("display", 'none');
        resolve()
      })
    })
  }
}

function callDraw() {
  d3.select(".chart-title").text("Breathe In")

  draw(d3.selectAll(".originalLine"))
  .then( () => draw(d3.selectAll(".triangleLine")) )
  .then( () => draw(d3.selectAll(".squareLine")) )
  .then(callReverse)

  function draw(lines : d3.Selection<SVGLineElement, LineData, HTMLElement, any>) {
    return new Promise(function (resolve) {
      lines
      .style("display", 'inherit')
      .transition()
      .duration(speed)
      .attr('x1', d => d.end.x1)
      .attr('y1', d => d.end.y1)
      .attr('x2', d => d.end.x2)
      .attr('y2', d => d.end.y2)
      .on("end", resolve)
    })
  }
}
