import { d3 } from './chart'
import {
  Block,
  Position,
  RapierChart,
  BlockOptions,
  blockFactory,
  ShapeType,
} from './blocks'

new RapierChart({
  element: 'datavizChart',
  nav: false,
  renderer: 'canvas',
})
  .clear_canvas()
  .scratchpad((chart: RapierChart) => {
    function render() {
      chart.clear_canvas()
      chart.world.step()

      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
  })
