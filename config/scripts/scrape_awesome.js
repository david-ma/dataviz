var request = require('request');
var xray = require('./xray_test').xray;
console.log("Scraping stuff from awesome foundation");
const base = 'https://www.awesomefoundation.org/en/chapters/11/projects', target = '?page=1';
const Cookie = require('../config.json').Cookie;
const options = {
    url: base + target,
    headers: {
        Cookie,
    },
};
request(options, function callback(err, response, html) {
    if (err) {
        console.log(err);
        response.end('error making request' + err);
    }
    xray(html);
});
var AwesomeProject = require('../db_bootstrap').seq.AwesomeProject;
var csv = require('csv/sync');
request({
    url: 'https://www.awesomefoundation.org/en/chapters/11/projects.csv?end=&q=&start=2023-04-25',
    headers: { Cookie },
}, function callback(err, response, body) {
    if (err) {
        console.log(err);
        response.end('error making request' + err);
    }
    const records = csv.parse(body, {
        delimiter: ',',
        columns: true,
        skip_empty_lines: true,
    });
    console.log(`Found ${records.length} records in the CSV`);
    records.forEach((record) => {
        AwesomeProject.findOne({
            where: {
                id: record.id,
            },
        }).then((d) => {
            if (d) {
                console.log('Found existing record', d.id);
            }
            else {
                console.log('Creating new record', record.id);
                AwesomeProject.create(record).catch((error) => {
                    console.log('Error', error);
                });
            }
        });
    });
});
