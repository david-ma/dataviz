console.log("script.js");

// This is a script which loads chart.js (compiled from chart.ts)

require.config({
	// baseUrl: '/js/vendor',
	baseUrl: '/',
	// enforceDefine: true,
	paths: {
        'datatables.net': "/js/datatables.min",


// The vendor stuff does not need to be listed here if we set the
// baseUrl to /js/vendor
// But that breaks importing chart.ts???
// How do we do this??? :(
        "d3": "/js/vendor/d3",
        "d3-selection": "/js/vendor/d3-selection",
        "d3-transition": "/js/vendor/d3-transition",
        "d3-selection-multi": "/js/vendor/d3-selection-multi",
        "jquery": "/js/vendor/jquery",
        "d3-dispatch": "/js/vendor/d3-dispatch",
        "d3-timer": "/js/vendor/d3-timer",
        "d3-interpolate": "/js/vendor/d3-interpolate",
        "d3-color": "/js/vendor/d3-color",
        "d3-ease": "/js/vendor/d3-ease",

        chart: "/js/chart",
        wealth: '/wealth/WorldWealth',
        harder: '/wealth/harder'
    },
    shim: {
        // chart: ['d3-selection-multi'],
        // 'd3-selection': ['d3'],
        // 'd3-transition': ['d3'],
        // 'd3-selection-multi': ['d3', 'd3-selection', 'd3-transition'],
        'datatables.net': ['jquery']
    }
});

let d3, Chart, decorateTable;

require(['chart', 'wealth'], function(exports){
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

