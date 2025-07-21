console.log('hello world')

// 75% 'Lucida Sans Unicode', 'Lucida Grande', Arial, Helvetica, sans-serif;
const typefaces = [
  {
    typeface: 'Tahoma',
  },
  {
    typeface: 'Lucida Grande',
  },
  {
    typeface: 'Roboto',
  },
  {
    typeface: 'Inclusive Sans',
  },
  {
    typeface: 'Fuggles',
  },
  {
    typeface: 'American Typewriter',
  },
  {
    typeface: 'Impact',
  },
  {
    typeface: 'Courier New',
  },
  {
    typeface: 'Helvetica',
  },
  {
    typeface: 'Arial',
  },
  {
    typeface: 'Lucida Sans Unicode',
  },
]

const extras = [
  'Oswald',
  'Ralway',
  'Roboto Slab',
  'Ubuntu',
  'PT Sans',
  'Merrriweather',
  'Work Sans',
  'UnifrakturCook',
  'Lexend Peta',
  'Delius Unicase',
  'Cormorant Unicase',
  'UnifrakturMaguntia',
  'Varela Round',
  'Architects Daughter',
  'Cabin Sketch',
  'Sofia Sans',
  'Asap',
  'Mooli',
  'Russo One',
  'Signika',
  'Rowdies',
  'Tilt Prism',
  'Orbitron',
  'Press Start 2P',
  'Staatliches',
  'Rubik Mono One',
  'Special Elite',
  'Carter One',
  'Hammersmith One',
]

console.log('extras', extras)

d3.select('#signs')
  .selectAll('div')
  .data(typefaces)
  .enter()
  .append('div')
  .style('font-family', (d) => d.typeface)
  .each(function (d) {
    var sign = d3.select(this).classed('sign row', true)

    sign
      .append('img')
      .attr('src', '/images/ubc-logo.jpg')
      .classed('col-xs-3', true)

    var right = sign.append('div').classed('col-xs-9', true)
    right.append('p').classed('title', true).text('UNIVERSAL BEARING COMPANY')
    right
      .append('p')
      .classed('subtitle', true)
      .text('BEARINGS, POWER TRANSMISSION & MORE')

    sign.append('div').classed('label col-xs-12', true).text(d.typeface)

    // Check fontfaces FontFaceSet
    // https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet

    console.log(
      `${d.typeface} is loaded: `,
      document.fonts.check('1em ' + d.typeface),
    )
    if (!document.fonts.check('1em ' + d.typeface))
      console.error(`${d.typeface} is not loaded`)
  })
