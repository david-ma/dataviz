console.log("Running weapons.ts")

const description = `#Weapons in flags

There are 12 countries in the world with weapons in their flags.`

// @ts-ignore
var md = new showdown.Converter({ openLinksInNewWindow: true });

$("#description").html(md.makeHtml(description))



import { Chart, d3 } from './chart'


const chart = new Chart({
    element: 'chart',
    margin: 20,
    width: 1200,
    height: 600,
    nav: false,
  }).initMap().then((chart: Chart) => {

    chart.loadingAnimation.stop({goto: [0, 0]})
    // console.log("loadingAnimation", chart.loadingAnimation)


    chart.drawMap({
      json: '/world-50.geo.json',
      usa: '/gz_2010_us_040_00_5m.json',
      aus: '/aust.json',
      zoom: 200,
      projection: d3.geoEquirectangular(),
      // projection: d3.geoEqualEarth(),
      markers: [
        {
          longitude: 0,
          latitude: 0,
          type: 'Country',
        }
      ]
    })
  })
