var request = require('request');
var xray = require('./xray_test').xray;
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
