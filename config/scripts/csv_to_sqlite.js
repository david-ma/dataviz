var seq = require('../db_bootstrap').seq;
var csv = require('csv/sync');
let fs = require('fs');
var stuff = fs.readFileSync('data/melbourne_export_all.csv', {
    encoding: 'utf8',
});
const records = csv.parse(stuff, {
    delimiter: ',',
    columns: true,
    skip_empty_lines: true,
});
records.forEach((record) => {
    seq.AwesomeProject.findOne({
        where: {
            id: record.id,
        },
    }).then((d) => {
        if (d) {
            console.log('Found existing record', d.id);
            d.update(record);
        }
        else {
            console.log('Creating new record', record.id);
            seq.AwesomeProject.create(record).catch((error) => {
                console.log('Error', error);
            });
        }
    });
});
