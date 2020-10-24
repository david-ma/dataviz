const tokens = require('./config.json')["smugmug"];
var formidable = require('formidable');
var fs = require('fs');
var https = require("https");
var mime = require('mime');
var crypto = require('crypto');
exports.config = {
    services: {
        "test": function (res, req, db, type) {
            res.end("Hello World");
        },
        "uploadPhoto": function (res, req, db, type) {
            const uploadFolder = `${__dirname}/../tmp/`;
            const form = formidable();
            console.log("uploading files to ", uploadFolder);
            form.parse(req, (err, fields, files) => {
                Object.keys(files).forEach((inputfield) => {
                    var file = files[inputfield];
                    var newLocation = uploadFolder + file.name;
                    fs.rename(file.path, newLocation, function (err) {
                        const filetype = mime.getType(newLocation);
                        var data = fs.readFileSync(newLocation);
                        console.log(`data.length is:`, data.length);
                        console.log("Buffer length..?", Buffer.byteLength(data));
                        console.log("Filetype", filetype);
                        // console.log("data is", data);
                        var target_url = "https://upload.smugmug.com/api/v2/node/QdvhkM";
                        var method = "POST";
                        var params = signRequest(method, target_url);
                        // console.log("Authorization", bundleAuthorization(target_url, params));
                        var MD5 = crypto.createHash('md5').update(data).digest("hex");
                        console.log("MD5", MD5);
                        var options = {
                            // host: 'photos.david-ma.net',
                            host: 'upload.smugmug.com',
                            port: 443,
                            // path: '/api/v2/album/jHhcL7',
                            path: '/api/v2/node/QdvhkM',
                            method: method,
                            headers: {
                                'X-Smug-FileName': "blah",
                                'X-Smug-Title': "blahblah",
                                // 'X-Smug-AlbumUri': '/api/v2/album/jHhcL7',
                                'X-Smug-AlbumUri': '/api/v2/node/QdvhkM',
                                'X-Smug-ResponseType': 'JSON',
                                'X-Smug-Version': 'v2',
                                'Content-Type': filetype,
                                'Content-MD5': MD5,
                                'Content-Length': Buffer.byteLength(data),
                                Authorization: bundleAuthorization(target_url, params),
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
                        req.write(data);
                        req.end();
                        res.end("success");
                    });
                });
            });
        },
    }
};
// Useful resources:
// https://oauth.net/core/1.0a/
// https://medium.com/@imashishmathur/0auth-a142656859c6
// https://developer.chrome.com/extensions/examples/extensions/oauth_contacts/chrome_ex_oauthsimple.js
// https://github.com/pH200/hmacsha1-js
function b64_hmac_sha1(k, d, _p, _z) {
    // heavily optimized and compressed version of http://pajhome.org.uk/crypt/md5/sha1.js
    // _p = b64pad, _z = character size; not used here but I left them available just in case
    if (!_p) {
        _p = '=';
    }
    if (!_z) {
        _z = 8;
    }
    function _f(t, b, c, d) { if (t < 20) {
        return (b & c) | ((~b) & d);
    } if (t < 40) {
        return b ^ c ^ d;
    } if (t < 60) {
        return (b & c) | (b & d) | (c & d);
    } return b ^ c ^ d; }
    function _k(t) { return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514; }
    function _s(x, y) { var l = (x & 0xFFFF) + (y & 0xFFFF), m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xFFFF); }
    function _r(n, c) { return (n << c) | (n >>> (32 - c)); }
    function _c(x, l) { x[l >> 5] |= 0x80 << (24 - l % 32); x[((l + 64 >> 9) << 4) + 15] = l; var w = [80], a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e = -1009589776; for (var i = 0; i < x.length; i += 16) {
        var o = a, p = b, q = c, r = d, s = e;
        for (var j = 0; j < 80; j++) {
            if (j < 16) {
                w[j] = x[i + j];
            }
            else {
                w[j] = _r(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
            }
            var t = _s(_s(_r(a, 5), _f(j, b, c, d)), _s(_s(e, w[j]), _k(j)));
            e = d;
            d = c;
            c = _r(b, 30);
            b = a;
            a = t;
        }
        a = _s(a, o);
        b = _s(b, p);
        c = _s(c, q);
        d = _s(d, r);
        e = _s(e, s);
    } return [a, b, c, d, e]; }
    function _b(s) { var b = [], m = (1 << _z) - 1; for (var i = 0; i < s.length * _z; i += _z) {
        b[i >> 5] |= (s.charCodeAt(i / 8) & m) << (32 - _z - i % 32);
    } return b; }
    function _h(k, d) { var b = _b(k); if (b.length > 16) {
        b = _c(b, k.length * _z);
    } var p = [16], o = [16]; for (var i = 0; i < 16; i++) {
        p[i] = b[i] ^ 0x36363636;
        o[i] = b[i] ^ 0x5C5C5C5C;
    } var h = _c(p.concat(_b(d)), 512 + d.length * _z); return _c(o.concat(h), 512 + 160); }
    function _n(b) { var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", s = ''; for (var i = 0; i < b.length * 4; i += 3) {
        var r = (((b[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((b[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) | ((b[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
        for (var j = 0; j < 4; j++) {
            if (i * 8 + j * 6 > b.length * 32) {
                s += _p;
            }
            else {
                s += t.charAt((r >> 6 * (3 - j)) & 0x3F);
            }
        }
    } return s; }
    function _x(k, d) { return _n(_h(k, d)); }
    return _x(k, d);
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
function signRequest(method, target_url) {
    var normalParams = {
        oauth_consumer_key: tokens.consumer_key,
        oauth_nonce: Math.random().toString().replace("0.", ""),
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: Date.now(),
        oauth_token: tokens.oauth_token,
        oauth_version: "1.0"
    };
    var normalized = oauthEscape(expandParams(normalParams));
    normalParams.oauth_signature = b64_hmac_sha1(`${tokens.consumer_secret}&${tokens.oauth_token_secret}`, `${method}&${oauthEscape(target_url)}&${normalized}`);
    return normalParams;
}
