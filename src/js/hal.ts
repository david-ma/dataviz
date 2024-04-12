// @ts-nocheck

console.log('Hello World')

let midi = null // global MIDIAccess object

globalThis.midiButton = function () {
  console.log('hey we pushed a midi button')
  navigator.permissions.query({ name: 'midi', sysex: true }).then((result) => {
    if (result.state === 'granted') {
      // Access granted.
      console.log('Acceds granted')
    } else if (result.state === 'prompt') {
      // Using API will prompt for permission
      console.log('we should prompt?')
      function onMIDISuccess(midiAccess) {
        console.log('MIDI ready!')
        midi = midiAccess // store in the global (in real usage, would probably keep in an object instance)
        listInputsAndOutputs(midi)
        startLoggingMIDIInput(midi, 0)
      }

      function onMIDIFailure(msg) {
        console.error(`Failed to get MIDI access - ${msg}`)
      }

      navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
    }
    // Permission was denied by user prompt or permission policy
  })
}


function listInputsAndOutputs(midiAccess) {
  for (const entry of midiAccess.inputs) {
    const input = entry[1];
    console.log(
      `Input port [type:'${input.type}']` +
        ` id:'${input.id}'` +
        ` manufacturer:'${input.manufacturer}'` +
        ` name:'${input.name}'` +
        ` version:'${input.version}'`,
    );
  }

  for (const entry of midiAccess.outputs) {
    const output = entry[1];
    console.log(
      `Output port [type:'${output.type}'] id:'${output.id}' manufacturer:'${output.manufacturer}' name:'${output.name}' version:'${output.version}'`,
    );
  }
}


function onMIDIMessage(event) {
  let str = `MIDI message received at timestamp ${event.timeStamp}[${event.data.length} bytes]: `;
  let signal = ''
  for (const character of event.data) {
    str += `0x${character.toString(16)} `;
    signal = `0x${character.toString(16)}`
  }
  if(signal != '0xf8') { // ignore the clock signal 0xf8
    console.log(str);
  }
}


function startLoggingMIDIInput(midiAccess, indexOfPort) {
  midiAccess.inputs.forEach((entry) => {
    entry.onmidimessage = onMIDIMessage;
  });
}








const height = 600,
  width = 960

const screens = d3.select('#screens')

// Screen 1
const svg = screens.append('svg').attrs({
  viewBox: `0 0 ${width} ${height}`,
})

svg.append('rect').attrs({
  x: 0,
  y: 0,
  height: height,
  width: width,
  fill: '#8357a4',
})

const offset = 100

const banner = svg.append('rect').attrs({
  x: offset,
  y: 50,
  height: 100,
  width: width - offset * 2,
  fill: 'white',
})

svg
  .append('text')
  .text('HELLO WORLD')
  .attrs({
    x: width / 2,
    y: 120,
    fill: '#8357a4',
    'font-size': '48px',
    'text-anchor': 'middle',
  })

svg.style('display', 'none')

const screen2 = screens.append('svg').attrs({
  viewBox: `0 0 ${width} ${height}`,
})

screen2.append('rect').attrs({
  x: 0,
  y: 0,
  height: height,
  width: width,
  fill: '#b91321',
})

screen2.append('rect').attrs({
  x: width / 3, // third
  y: height / 4,
  height: height / 3,
  width: width / 3,
  stroke: 'white',
  fill: 'none',
  'stroke-width': 0.5,
})

var lines = []
for (var i = 0; i < 11; i++) {
  var y1 = height / 4
  var y2 = height / 4 + height / 3
  var x = width / 3 + i * (20 - i)

  lines.push({
    x1: x,
    x2: x,
    y1: y1,
    y2: y2,
  })
}
for (var i = 0; i < 11; i++) {
  var y1 = height / 4
  var y2 = height / 4 + height / 3
  var x = width / 3 + i * (20 - i) + 100

  lines.push({
    x1: x,
    x2: x,
    y1: y1,
    y2: y2,
  })
}
for (var i = 0; i < 11; i++) {
  var y1 = height / 4
  var y2 = height / 4 + height / 3
  var x = width / 3 + i * (20 - i) + 200

  lines.push({
    x1: x,
    x2: x,
    y1: y1,
    y2: y2,
  })
}

lines.forEach((line) => {
  screen2.append('line').attrs({
    x1: line.x1,
    y1: line.y1,
    x2: line.x2,
    y2: line.y2,
    stroke: 'white',
    'stroke-width': 0.5,
  })
})

// horizontal lines
var horizontalLines = []
for (var i = 0; i < 11; i++) {
  var x1 = width / 3
  var x2 = (width / 3) * 2
  var y = height / 4 + i * (20 - i)

  horizontalLines.push({
    x1: x1,
    x2: x2,
    y1: y,
    y2: y,
  })
}
for (var i = 0; i < 11; i++) {
  var x1 = width / 3
  var x2 = (width / 3) * 2
  var y = height / 4 + i * (20 - i) + 100

  horizontalLines.push({
    x1: x1,
    x2: x2,
    y1: y,
    y2: y,
  })
}
horizontalLines.forEach((line) => {
  screen2.append('line').attrs({
    x1: line.x1,
    y1: line.y1,
    x2: line.x2,
    y2: line.y2,
    stroke: 'white',
    'stroke-width': 0.5,
  })
})

// 4x4 block of text
var text = []
for (var i = 0; i < 4; i++) {
  text.push([
    '0' + Math.floor(Math.random() * 1000000000),
    '0' + Math.floor(Math.random() * 1000000000),
    '0' + Math.floor(Math.random() * 1000000000),
    '0' + Math.floor(Math.random() * 1000000000),
  ])
}

var textY = (height / 10) * 7
text.forEach((row, i) => {
  console.log('Row', row)
  row.forEach((number, j) => {
    screen2
      .append('text')
      .text(number)
      .attrs({
        x: width / 3 + j * 100,
        y: textY + i * 15,
        fill: 'white',
        'font-size': '10px',
        'text-anchor': 'start',
        // Lucida Console???
        'font-family': 'Lucida Grande, monospace',
        // 'font-family': 'monospace',
      })
  })
})

globalThis.aniamteButton = function () {
  console.log('animate button clicked')
  banner
    .attrs({
      x: width / 2,
      width: 0,
    })
    .transition()
    .duration(1500)
    .attrs({
      x: offset,
      width: width - offset * 2,
    })
}

function randomNumbers(length: number = 10): string {
  return Math.floor(Math.random() * Math.pow(10, length + 5))
    .toString()
    .slice(1, length)
}


// Paperclips per 

const paperclips = screens.append('svg').attrs({
  viewBox: `0 0 ${width} ${height}`,
})

paperclips.append('rect').attrs({
  x: 0,
  y: 0,
  height: height,
  width: width,
  fill: '#8357a4',
})

// Show current paperclips per minute.
// With average paperclips per minute?
// Draw X and Y axes

paperclips.append("line")
  .attrs({
    x1: 100,
    y1: 100,
    x2: 100,
    y2: 500,
    stroke: 'white',
    'stroke-width': 0.5
  })

paperclips.append("line")
  .attrs({
    x1: 100,
    y1: 500,
    x2: 850,
    y2: 500,
    stroke: 'white',
    'stroke-width': 0.5
  })

  d3.axisLeft()
