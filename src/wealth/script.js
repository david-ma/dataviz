console.log("script.js");

// import { blah } from './test.js';

// console.log(blah);


// import * as foo from './harder.js';
// console.log(foo);



// import { typestuff } from './harder.js';

require.config({
	baseUrl: '/js/vendor',
	// enforceDefine: true,
	paths: {
        // wealth: '/wealth/WorldWealth',
        // 'datatables.net': "/js/datatables.min",
        // chart: "/js/chart",
        'harder': '/wealth/harder'
    },
    shim: {
        // chart: ['d3-selection-multi'],
        // 'd3-selection': ['d3'],
        // 'd3-transition': ['d3'],
        // 'd3-selection-multi': ['d3', 'd3-selection', 'd3-transition'],
        // 'datatables.net': ['jquery']
    }
});

require(["harder"], function(exports){
    var d3 = exports.d3;
    
    d3.select("body").styles({
        background: 'green'
    });


    // console.log(blah);
});

// console.log("We're in script.js");
// define(['harder'], function(){
//     // console.log("okkk");
//     // $(function() {
//     //     d3.select("body").styles({
//     //         background: 'red'
//     //     });
//     //     // $('body').alpha().beta();
//     // });

// });

console.log("trying to do stuff");

// console.log(typestuff);

