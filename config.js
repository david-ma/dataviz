var http = require("http");
var fs = require('fs');
var xray = require('x-ray')();
var request = require('request');
var tabletojson = require('tabletojson');
var fsPromise = fs.promises;
var mustache = require('mustache');



// Asynchronous for each, doing a limited number of things at a time.
async function asyncForEach(array, limit, callback) {
	let i = 0;

	for(; i < limit; i++ ) {
		doNextThing(i);
	}

	function doNextThing(index) {
		if(array[index]) {
			callback(array[index], index, array, function done(){
				doNextThing(i++);
			});
		}
	}

	return 1;
}

function sanitise(string) {
	return string.replace(/\W+/g, " ").trim().replace(/\W/g, "_").toLowerCase();
}

const base = 'https://david-ma.net/';

exports.config = {
	services: {
		"scrapeAllCameras": function(res, req, db, type) {

			db.Scrape.findAll({
				where: {
					// brand: brand.toLowerCase()
				}
			}).then(function(d){
				var results = d.map(d => d.dataValues);

				if(results.length > 0) {
					// async.mapLimit(results, 20, function(d, loopback){
					asyncForEach(results, 20, function(d, i, array, done) {
						var target = d.link;
						var brand = d.title.split(/(?<=^\S+)\s/)[0].trim();
						var model = d.title.split(/(?<=^\S+)\s/)[1].trim();

						return db.Camera.findAll({
							where: {
								brand: brand,
								model: model
							}
						}).then(function(d){
							if(d.length == 0) {
								console.log(model);
								request.get(base+target, function(err, response, html){
									xray(html, '.table_specs@html').then((d) => {
										if(d) {
	
											d = d.replace(/<span class="yes"><\/span>/g, 'Yes')
												.replace(/<span class="no"><\/span>/g, 'No');
			
											var data = tabletojson.convert(`<table>${d}</table>`)[0];
				
											var camera = data.reduce((obj, detail) => {
												obj[sanitise(detail[0])] = detail[1];
												return obj;
											}, {});
				
											db.Camera.create(camera).catch(e => {});
											done()

										} else {
											console.log("Couldn't do this "+model);
											done()

										}
									}).catch(e => res.end("fail??? " + JSON.stringify(e.message)));
								});
							} else {
								done()
							}
						});
					});
					res.end("Ok!");
				} else {
					res.end("fail");
				}
			});

		},

// Check a random entry, to see what fields the table had.
		"a": function(res, req, db, type){
			var total = 2553;
			var id = Math.floor(Math.random() * total);

			db.Scrape.findOne({
				where: {
					id: id
				}
			}).then(function(d){
				if(d && d.dataValues) {
					console.log(d.dataValues.link);
					var target = d.dataValues.link;
					var title = d.dataValues.title;
					var brand = d.dataValues.brand;

					request.get(base+target, function(err, response, html){
						xray(html, '.table_specs@html').then((d) => {
							// console.log(d);
							d = d.replace(/<span class="yes"><\/span>/g, 'Yes')
							  .replace(/<span class="no"><\/span>/g, 'No');

							var data = tabletojson.convert(`<table>${d}</table>`, {
								stripHtmlFromCells: false,
								stripHtmlFromHeadings: false,
								stripHtml: false
							})[0];

							console.log(data.length);
							// console.log(data);

							data.forEach(function(detail){
								db.Detail.create({
									detail: detail[0].replace(/:$/,""),
									camera: title,
									brand: brand
								})
								// console.log(detail[1]);
								if(detail[1]) {
									console.log(`${sanitise(detail[0])} - ${detail[1]}`);
								}
							});

							var result = data.reduce((obj, detail) => {
								obj[sanitise(detail[0])] = detail[1];
								return obj;
							}, {});

							console.log("result: ",result);
		
							res.end(`${data.length} ${title}`);
						}).catch(e => res.end("fail??? " + JSON.stringify(e.message)));
					});
				} else {
					res.end("fail");
				}
			});
		},
		"c": function(res, req, db, type){
			const target = 'specs/olympus_om-d-e-m5-iii/'

			request.get(base+target, function(err, response, html){
				xray(html, '.table_specs@html').then((d) => {
					var data = tabletojson.convert(`<table>${d}</table>`)[0];

					console.log(data.length);

					res.end("ok");
				}).catch(e => res.end("fail"));
			});
		},
		"scrapeAllBrands": function(res, req, db, type) {
			const brands = ['canon', 'fujifilm', 'leica', 'nikon', 'olympus', 'panasonic', 'pentax', 'ricoh', 'samsung', 'sony', 'zeiss'];

			asyncForEach(brands, 1, function(brand, iterator, brands, done){
				let lastPageReached = false;
				let i = 0;

// the lastPageReached thing doesn't work... because it loops through all 20 requests before the first one finishes.
				while(!lastPageReached && i < 20) {
					i++;
					console.log(`Scrapeing Page ${i} of ${brand}`)
					request.get(`${base}cameras/${brand}/${i}/`, function(err, response, html){
							if(err) {
							return PromiseRejectionEvent(err);
						}
						if (response.statusCode >= 400) {
							return PromiseRejectionEvent(new Error('400 error'));
						}

						xray(html, '.newest_div', [{
							img: 'img@src',
							title: 'a.newest',
							link: 'a.newest@href',
							year: 'span.font_smaller'
						}])
						.then(function(stuff){
							console.log(stuff);
							if(stuff.length == 0) lastPageReached = true;
		
							stuff.forEach(function(camera){
								camera.title = camera.title.trim();
								camera.brand = brand;
								camera.year = camera.year.substr(1,4);
								db.Scrape.create(camera)
									.catch(e => {/* dev/null */});
							})
		
						}).catch(err => console.log("ok error..",err));
					});
				}
				done();
			}).then(function(d){
				console.log("hello? "+d);
				res.end("done?");
			});


		},
		"camera": function(res, req, db, type) {
			const promises = [];
			const brand = type.split("_")[0];
			const model = type.split("_")[1].replace(/-/g, " ");

			promises.push(
				fsPromise.readFile(`${__dirname}/views/camera.mustache`, {
					encoding: 'utf8'
				})
			);

			promises.push(
				db.Camera.findAll({
					attributes: ['brand', 'model', 'year'],
					where: {
						year: {
							[db.Sequelize.Op.gt]: 2010
						}
					}
				})
			);

			promises.push(
				db.Camera.findOne({
					where: {
						brand: brand,
						model: model
					}
				})
			);

			Promise.all(promises).then(function([template, allCameras, data]){
				data.allCameras = JSON.stringify(allCameras.map(d => `${d.brand} ${d.model} (${d.year})`))
				

				// console.log(model.dataValues);

				var output = mustache.render(template, data);
				res.end(output);
			});
		},
		"all-cameras": function(res, req, db, type) {
			// res.end("hello");
			db.Camera.findAll({
				attributes: ['brand', 'model', 'year'],
				where: {
					year: {
						[db.Sequelize.Op.gt]: 2010
					}
				}
			}).then(d => res.end(JSON.stringify(d.map(d => `${d.brand} ${d.model} (${d.year})`))));
		},
		"fetchCamera": function(res, req, db, type){
			console.log("Request for a camera..");
// console.log(db);
			// console.log(db.Camera);
			// console.log(type);

			db.Camera.findOne({
				where: {
					name: type
				}
			}).then(function(d, err){
				console.log(d);
				res.end(JSON.stringify(d));
			}).catch(e => {
				console.log("Error??", e);

				res.end("bad");
			});

			// return 200;
			// res.end("Requesting camera...");
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
