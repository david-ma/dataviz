console.log("hello world");

import { blah } from './test.js';

console.log(blah);



// import { typestuff } from './harder.js';

require.config({
	baseUrl: '/js/vendor',
	enforceDefine: true,
	paths: {
        // wealth: '/wealth/WorldWealth',
        // 'datatables.net': "/js/datatables.min",
        // chart: "/js/chart",
        'harder': '/wealth/harder'
    },
    shim: {
        // chart: ['d3-selection-multi'],
        // 'd3-selection-multi': ['d3', 'd3-selection', 'd3-transition'],
        // 'datatables.net': ['jquery']
    }
});

require(['harder'], function(harder){
    console.log("okkk");
});

// console.log(typestuff);

