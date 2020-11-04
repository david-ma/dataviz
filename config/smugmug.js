"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const lodash_1 = __importDefault(require("lodash"));
const path_1 = __importDefault(require("path"));
const tokens = require('./config.json').smugmug;
const formidable = require('formidable');
const fs = require("fs");
const https = require("https");
const mime = require("mime");
const crypto = require("crypto");
const config = {
    services: {
        test: function (res, req) {
            res.end('Hello World');
        },
        uploadPhoto: function (res, req) {
            const uploadFolder = path_1.default.resolve(__dirname, '..', 'data', 'tmp');
            const form = formidable({
                maxFileSize: 25 * 1024 * 1024
            });
            form.parse(req, (err, fields, files) => {
                if (err) {
                    res.writeHead(413, err.message);
                    res.end(err.message);
                }
                Object.keys(files).forEach((inputfield) => {
                    const file = files[inputfield];
                    const newLocation = path_1.default.resolve(uploadFolder, file.name);
                    fs.rename(file.path, newLocation, function (err) {
                        if (err) {
                            console.error(err);
                            res.end(err);
                            return;
                        }
                        const filetype = mime.getType(newLocation);
                        const data = fs.readFileSync(newLocation);
                        console.log('data.length is:', data.length);
                        console.log('Buffer length..?', Buffer.byteLength(data));
                        const host = 'api.smugmug.com';
                        const path = '/api/v2/album/jHhcL7!uploadfromuri';
                        const targetUrl = `https://${host}${path}`;
                        const method = 'POST';
                        const MD5 = crypto.createHash('md5').update(data).digest('hex');
                        const payload = JSON.stringify({
                            ByteCount: Buffer.byteLength(data),
                            Caption: '',
                            Hidden: false,
                            Keywords: null,
                            MD5Sum: MD5,
                            Title: '',
                            Cookie: 'cookieGoesHereLol',
                            FileName: '',
                            AllowInsecure: false,
                            Uri: `https://dataviz.david-ma.net/tmp/${file.name}`
                        });
                        const extraParams = {};
                        const params = signRequest(method, targetUrl, extraParams);
                        console.log('Authorization', bundleAuthorization(targetUrl, params));
                        console.log('MD5', MD5);
                        const options = {
                            host: host,
                            port: 443,
                            path: path,
                            method: method,
                            headers: {
                                Authorization: bundleAuthorization(targetUrl, params),
                                'Content-Type': 'application/json',
                                'Content-Length': payload.length,
                                Accept: 'application/json; charset=utf-8'
                            }
                        };
                        const req = https.request(options, function (res) {
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
                        res.end('success');
                    });
                });
            });
        }
    }
};
exports.config = config;
function b64_hmac_sha1(key, data) {
    return crypto.createHmac('sha1', key).update(data).digest('base64');
}
function oauthEscape(string) {
    if (string === undefined) {
        return '';
    }
    if (string instanceof Array) {
        throw ('Array passed to _oauthEscape');
    }
    return encodeURIComponent(string).replace(/\!/g, '%21')
        .replace(/\*/g, '%2A')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');
}
;
function bundleAuthorization(url, params) {
    const keys = Object.keys(params);
    const authorization = `OAuth realm="${url}",${keys.map(key => `${key}="${params[key]}"`).join(',')}`;
    return authorization;
}
function expandParams(params) {
    return Object.keys(params).map(key => `${key}=${params[key]}`).join('&');
}
function signRequest(method, targetUrl, extraParams) {
    const normalParams = {
        oauth_consumer_key: tokens.consumer_key,
        oauth_nonce: Math.random().toString().replace('0.', ''),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Date.now(),
        oauth_token: tokens.oauth_token,
        oauth_token_secret: tokens.oauth_token_secret,
        oauth_version: '1.0'
    };
    const normalized = oauthEscape(expandParams(sortParams(lodash_1.default.merge(normalParams, extraParams))));
    normalParams.oauth_signature = b64_hmac_sha1(`${tokens.consumer_secret}&${tokens.oauth_token_secret}`, `${method}&${oauthEscape(targetUrl)}&${normalized}`);
    return normalParams;
}
function sortParams(object) {
    const keys = Object.keys(object).sort();
    const result = {};
    keys.forEach(function (key) {
        result[key] = object[key];
    });
    console.log(result);
    return result;
}
