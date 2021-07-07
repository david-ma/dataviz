import { Chart, decorateTable, $, d3 } from 'chart'
import 'datatables.net'

import '/pedigreejs/pedigreejs.2.0.0-rc2.min.js'

type pedigreejs = {

}
let pedigreejs = globalThis.pedigreejs



$( document ).ready(function() {
  var parent_width = $('#ped').parent().width();
  var margin = ($(window).width()-parent_width > 10 ? 100 : 30);
  var svg_width = (parent_width > 750 ? (parent_width*8/12 - margin) : parent_width- margin);

  var dataset = [
    {"name": "m11", "display_name": "John",  "sex": "M", "diabetes_diagnosis_age": 55, "top_level": true},
    {"name": "f11", "display_name": "Jane",  "sex": "F", "status": 1, "top_level": true},
    {"name": "m12", "display_name": "Jack", "sex": "M", "top_level": true},
    {"name": "f12", "display_name": "Jill", "sex": "F", "top_level": true},
    {"name": "m21", "display_name": "Jim", "sex": "M", "mother": "f11", "father": "m11", "age": 56},
    {"name": "f21", "display_name": "Jan", "sex": "F", "mother": "f12", "father": "m12", "age": 63},
    {"name": "ch1", "display_name": "Ana", "sex": "F", "mother": "f21", "father": "m21", "proband": true, "age": 25}
  ];
  var opts = {
    'targetDiv': 'ped',
    'btn_target': 'history_ex1',
    'store_type': 'session',
    'width': svg_width,
    'height': 500,
    'symbol_size': 35,
    'edit': true,
    'dataset': dataset,
    'diseases': [
      {'type': 'diabetes', 'colour': '#F68F35'},
    ],
    'DEBUG': (pedigreejs.pedigree_utils.urlParam('debug') === null ? false : true)
  };
  $('#opts').append(JSON.stringify(opts, null, 4));
  var local_dataset = pedigreejs.pedcache.current(opts);
  if (local_dataset !== undefined && local_dataset !== null) {
    opts.dataset = local_dataset;
  }

  opts = pedigreejs.pedigreejs.build(opts);
  $('#history_ex1').css('max-width', svg_width);
  $('#history_ex1').css('margin', 'auto');
});
