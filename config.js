var http = require("http");
var fs = require('fs');
var seq = require(`models/index`)


exports.config = {
	services: {
		"camera": function(res, req, db, type){
			console.log("Request for a camera..");

		},
		"upload": function(res, req, db, type){
			const uploadFolder = "websites/dataviz/data/campjs";
		try {
			console.log("hey, a request???");
			let data = "";

			req.on('data', (chunk) => {
				data += chunk;
			});

			req.on('end', () => {
				// let data = JSON.parse(data);
				// console.log(data);
				// console.log(data.filename);
				// console.log(data.email);

                fs.writeFileSync(`${uploadFolder}/${data.filename}`, data);
			});

			// var file = new File()
			// file.
			//console.log(Object.keys(res));
			//console.log("body", res.body);
// var buffer = req._readableState.buffer;
// console.log(buffer.head.data.toString());
// console.log(buffer);

// console.log(buffer.toString());
//     console.log("buffer", buffer.head.toString());

    // console.log(JSON.stringify(buffer));
	// var aaa = "ggg";



// 	console.log(req);
// 	console.log('method', req.method);
	// console.log(req.connection.parser[2]());
			// path, flags: string | number
			// fs.open(uploadFolder+"/test.txt", r);

			// fs.write();
			// fs.read();

    //fs.writeFileSync(`${uploadFolder}/aaa.txt`, buffer.head.data.toString());

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