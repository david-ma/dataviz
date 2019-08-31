var http = require("http");
var fs = require('fs');

exports.config = {
	data: true,
	services: {
		"upload": function(res, req, db, type){
			const uploadFolder = "websites/dataviz/data/campjs";
try {
			console.log("hey, a request???");

			// var file = new File()
			// file.
			console.log(Object.keys(req));
var buffer = req._readableState.buffer;
console.log(buffer);
// 	console.log(req);
// 	console.log('method', req.method);
	// console.log(req.connection.parser[2]());
			// path, flags: string | number
			// fs.open(uploadFolder+"/test.txt", r);

			// fs.write();
			// fs.read();
    fs.writeFileSync(`${uploadFolder}/aaa.txt`, buffer);

    // fs.writeFileSync(`${uploadFolder}/aaa.txt`, JSON.stringify(req._readableState.buffer));
    // fs.writeFileSync(`${uploadFolder}/bbb.txt`, req._readableState.buffer.head.data);


} catch(e) {
	console.log("error", e);
}
			res.end("lol");


		},
		"curl": function(incomingResponse, incomingRequest, db, type) {

			var options = {
				host: 'www.github.com',
				port: 80,
				path: '/',
				method: 'GET'
			};

			var req = http.request(options, function(res) {
				console.log('STATUS: ' + res.statusCode);
				console.log('HEADERS: ' + JSON.stringify(res.headers));
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
					console.log('BODY: ' + chunk);
				});
			});

			req.on('error', function(e) {
				console.log('problem with request: ' + e.message);
			});

// write data to request body
//			req.write('data\n');
//			req.write('data\n');
			req.end();

		}
	}
};