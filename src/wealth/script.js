console.log("script.js");

// This is a script which loads chart.js (compiled from chart.ts)

require.config({
	baseUrl: '/js/vendor',
	// enforceDefine: true,
	paths: {
        // wealth: '/wealth/WorldWealth',
        'datatables.net': "/js/datatables.min",
        chart: "/js/chart",
        'harder': '/wealth/harder'
    },
    shim: {
        // chart: ['d3-selection-multi'],
        // 'd3-selection': ['d3'],
        // 'd3-transition': ['d3'],
        // 'd3-selection-multi': ['d3', 'd3-selection', 'd3-transition'],
        'datatables.net': ['jquery']
    }
});

var d3, Chart, decorateTable;

require(['chart'], function(exports){
    d3 = exports.d3;
    Chart = exports.Chart;
    decorateTable = exports.decorateTable;



    // Test that various parts of d3.js were included properly:
    d3.select("body").styles({
        background: 'green'
    });

    d3.select("div").attrs({abc : 1})

});


console.log("trying to do stuff");

