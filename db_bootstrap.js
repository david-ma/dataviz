
const seq = require(`${__dirname}/models/index`);
const Camera = seq.Camera = require(`${__dirname}/models`).Camera;
const Scrape = seq.Scrape = require(`${__dirname}/models`).Scrape;

// rebuild entire database & reload data..?
if(false) {

seq.sequelize.sync({
    // force: true
}).then(function(d){


//  out of date
//     Brand.create({ name: 'Olympus' }).then(function(newBrand){

// // console.log("hey...?", newBrand);

//         Camera.create({
//             name: "OMD",
//             releaseDate: `2012-01-01`,
//             photo: `omd-1.jpg`,
//             brand: newBrand.id
//             // brand_id: newBrand.id
//             // BrandId: newBrand.id
//         }).catch(function(err){
//             console.log(err);
//         }).then( camera => {
//             // console.log(camera);
//             // camera.addBrand(newBrand)
//             // camera.setProperties({Brand: newBrand});

//             // console.log(camera.dataValues);



// // Camera.findAll({
// //     where: {
// //         name: 'OMD'
// //     }
// // }).then(d => console.log("Found camera!", d.dataValues));



//         });


//     }).catch(function(err){
//         console.log(err);
//     });
    
});

}


exports.seq = seq;