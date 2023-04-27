var request = require('request');
var seq = require('../db_bootstrap').seq;
var xray = require('x-ray')();
var fs = require('fs');
const base = 'https://www.awesomefoundation.org/en/chapters/melbourne/projects', target = '';
const Cookie = require('../config.json').Cookie;
const options = {
    url: base + target,
    headers: {
        Cookie,
    },
};
console.log('cookie', Cookie);
request(options, function callback(err, response, html) {
    if (err) {
        console.log(err);
        response.end('error making request' + err);
    }
    console.log(html);
    xray(html, 'article.project@html')
        .then(d => {
        console.log(d);
    });
});
