"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const tokens = require('./config.json')["smugmug"];
var formidable = require('formidable');
const fs = require("fs");
const https = require("https");
const mime = require("mime");
const crypto = require("crypto");
var _ = require('lodash');
var config = {
    services: {
        "test": function (res, req, db, type) {
            res.end("Hello World");
        },
        "uploadPhoto": function (res, req, db, type) {
            const uploadFolder = `${__dirname}/../data/tmp/`;
            const form = formidable({
                maxFileSize: 25 * 1024 * 1024
            });
            form.parse(req, (err, fields, files) => {
                if (err) {
                    res.writeHead(413, err.message);
                    res.end(err.message);
                }
                Object.keys(files).forEach((inputfield) => {
                    var file = files[inputfield];
                    var newLocation = uploadFolder + file.name;
                    fs.rename(file.path, newLocation, function (err) {
                        if (err) {
                            console.error(err);
                            res.end(err);
                            return;
                        }
                        const filetype = mime.getType(newLocation);
                        var data = fs.readFileSync(newLocation);
                        console.log(`data.length is:`, data.length);
                        console.log("Buffer length..?", Buffer.byteLength(data));
                        var host = 'api.smugmug.com';
                        var path = '/api/v2/album/jHhcL7!uploadfromuri';
                        var target_url = `https://${host}${path}`;
                        var method = "POST";
                        var MD5 = crypto.createHash('md5').update(data).digest("hex");
                        var payload = JSON.stringify({
                            "ByteCount": Buffer.byteLength(data),
                            "Caption": "",
                            "Hidden": false,
                            "Keywords": null,
                            "MD5Sum": MD5,
                            "Title": "",
                            "Cookie": "cookieGoesHereLol",
                            "FileName": "",
                            "AllowInsecure": false,
                            "Uri": `https://dataviz.david-ma.net/tmp/${file.name}`
                        });
                        var extraParams = {};
                        var params = signRequest(method, target_url, extraParams);
                        console.log("Authorization", bundleAuthorization(target_url, params));
                        console.log("MD5", MD5);
                        var options = {
                            host: host,
                            port: 443,
                            path: path,
                            method: method,
                            headers: {
                                Authorization: bundleAuthorization(target_url, params),
                                'Content-Type': 'application/json',
                                'Content-Length': payload.length,
                                Accept: "application/json; charset=utf-8"
                            }
                        };
                        var req = https.request(options, function (res) {
                            console.log('STATUS: ' + res.statusCode);
                            console.log('HEADERS: ' + JSON.stringify(res.headers));
                            res.setEncoding('utf8');
                            res.on('data', function (chunk) {
                                console.log('BODY: ' + chunk);
                            });
                        });
                        req.on('error', function (e) {
                            console.log('problem with request: ' + e.message);
                            console.log(e);
                        });
                        req.write(payload);
                        req.end();
                        res.end("success");
                    });
                });
            });
        },
    }
};
exports.config = config;
function b64_hmac_sha1(key, data) {
    return crypto.createHmac('sha1', key).update(data).digest('base64');
}
function oauthEscape(string) {
    if (string === undefined) {
        return "";
    }
    if (string instanceof Array) {
        throw ('Array passed to _oauthEscape');
    }
    return encodeURIComponent(string).replace(/\!/g, "%21").
        replace(/\*/g, "%2A").
        replace(/'/g, "%27").
        replace(/\(/g, "%28").
        replace(/\)/g, "%29");
}
;
function bundleAuthorization(url, params) {
    var keys = Object.keys(params);
    var authorization = `OAuth realm="${url}",${keys.map(key => `${key}="${params[key]}"`).join(",")}`;
    return authorization;
}
function expandParams(params) {
    return Object.keys(params).map(key => `${key}=${params[key]}`).join("&");
}
function signRequest(method, target_url, extraParams) {
    var normalParams = {
        oauth_consumer_key: tokens.consumer_key,
        oauth_nonce: Math.random().toString().replace("0.", ""),
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: Date.now(),
        oauth_token: tokens.oauth_token,
        oauth_token_secret: tokens.oauth_token_secret,
        oauth_version: "1.0"
    };
    var normalized = oauthEscape(expandParams(sortParams(_.merge(normalParams, extraParams))));
    normalParams.oauth_signature = b64_hmac_sha1(`${tokens.consumer_secret}&${tokens.oauth_token_secret}`, `${method}&${oauthEscape(target_url)}&${normalized}`);
    return normalParams;
}
function sortParams(object) {
    var keys = Object.keys(object).sort();
    var result = {};
    keys.forEach(function (key) {
        result[key] = object[key];
    });
    console.log(result);
    return result;
}
