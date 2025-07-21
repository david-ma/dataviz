import { Chart, decorateTable, $, d3 } from './chart'
import 'datatables.net'

// import '/pedigreejs/pedigreejs.2.0.0-rc2.min.js'
import './../../public/pedigreejs/pedigreejs.2.0.0-rc2.min.js'

type pedigreejs = {}
type PedigreeOptions = {
  targetDiv: string
  btn_target: string
  width: number
  height: number
  symbol_size: number
  edit: boolean
  diseases: {
    type: string
    colour: string
  }[]
  labels: string[]
  DEBUG: boolean
  dataset?: any
}
let pedigreejs = globalThis.pedigreejs

$(document).ready(function () {
  var parent_width = $('#pedigrees').parent().width()
  var margin = $(window).width() - parent_width > 10 ? 100 : 30
  var svg_width =
    parent_width > 750
      ? (parent_width * 9) / 12 - margin
      : parent_width - margin

  var pedfile =
    'fam1 1 6 7 2 2 0 1 0 0\n' +
    'fam1 2 4 5 1 1 0 0 0 0\n' +
    'fam1 3 2 1 2 1 0 0 0 1\n' +
    'fam1 4 0 0 1 1 0 0 0 0\n' +
    'fam1 5 0 0 2 2 0 0 0 1\n' +
    'fam1 6 0 0 1 1 0 0 0 0\n' +
    'fam1 7 0 0 2 2 0 1 0 1'
  var dataset = pedigreejs.io.readLinkage(pedfile)

  var opts: PedigreeOptions = {
    targetDiv: 'pedigrees',
    btn_target: 'history_ex4',
    width: svg_width,
    height: 400,
    symbol_size: 35,
    edit: true,
    diseases: [{ type: 'diabetes', colour: '#F68F35' }],
    labels: ['famid', 'id', 'alleles'],
    DEBUG: pedigreejs.pedigree_utils.urlParam('debug') === null ? false : true,
  }
  $('#opts').append(JSON.stringify(opts, null, 4))
  var local_dataset = pedigreejs.pedcache.current(opts)
  if (local_dataset !== undefined && local_dataset !== null) {
    opts.dataset = local_dataset
  } else {
    opts.dataset = dataset
  }
  opts = pedigreejs.pedigreejs.build(opts)
  $('#history_ex4').css('max-width', svg_width)
  $('#history_ex4').css('margin', 'auto')

  $('#pedInput').on('change', function (d) {
    console.log('Changing!')
    console.log($(this).val())

    var pedfile = $(this).val()
    opts.dataset = pedigreejs.io.readLinkage(pedfile)
    // opts.dataset = $(this).val();
    // opts = pedigreejs.pedigreejs.build(opts);
    pedigreejs.pedigreejs.rebuild(opts)
  })
  console.log(opts)
})
