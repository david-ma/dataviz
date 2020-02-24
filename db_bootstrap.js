
console.log();

const seq = require(`${__dirname}/models/index`);
const Camera = seq.Camera = require(`${__dirname}/models`).Camera;
const Scrape = seq.Scrape = require(`${__dirname}/models`).Scrape;
const Detail = seq.Detail = require(`${__dirname}/models`).Detail;

// rebuild entire database & reload data..?
if(false) {

seq.sequelize.sync({
    // force: true
}).then(function(d){

    Brand.create({ name: 'Olympus' }).then(function(newBrand){

// console.log("hey...?", newBrand);

        Camera.create({
            name: "OMD",
            releaseDate: `2012-01-01`,
            photo: `omd-1.jpg`,
            brand: newBrand.id
            // brand_id: newBrand.id
            // BrandId: newBrand.id
        }).catch(function(err){
            console.log(err);
        }).then( camera => {
            // console.log(camera);
            // camera.addBrand(newBrand)
            // camera.setProperties({Brand: newBrand});

            // console.log(camera.dataValues);



// Camera.findAll({
//     where: {
//         name: 'OMD'
//     }
// }).then(d => console.log("Found camera!", d.dataValues));



        });


    }).catch(function(err){
        console.log(err);
    });
    
});

}
/*
Camera.create({
    name: "700d",
    releaseDate: "2012",
    Brand: {
        name: "Canon"
    }
}, {
    include: [ Brand ]
});
*/

console.log("hey, doing this now:");


// console.log("Sup...?", newBrand.name);


exports.seq = seq;