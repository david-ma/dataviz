
const OAUTH_ORIGIN = 'https://api.smugmug.com',
    REQUEST_TOKEN_URL = OAUTH_ORIGIN + '/services/oauth/1.0a/getRequestToken',
    ACCESS_TOKEN_URL = OAUTH_ORIGIN + '/services/oauth/1.0a/getAccessToken',
    AUTHORIZE_URL = OAUTH_ORIGIN + '/services/oauth/1.0a/authorize',

    API_ORIGIN = 'https://api.smugmug.com',

    consumer_key = "KEY-GOES-HERE",
    consumer_secret = "SECRET-GOES-HERE",
    oauth_token = "paste-token-here",
    oauth_token_secret = "paste-token-secret-here",
    oauth_verifier = "paste",
    access_token = 'paste',
    access_token_secret = "paste"


var params :any = {
    Access: "Full",
    Permissions: "Modify",
    oauth_callback: encodeURIComponent("https://dataviz.david-ma.net/smugmug-test.html"),
    oauth_consumer_key: consumer_key,
    oauth_nonce: Math.random().toString().replace("0.",""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Date.now(),
    oauth_token: oauth_token
}
var normalized = encodeURIComponent($.param(params));
var method = "GET";

params.oauth_signature = b64_hmac_sha1(`${consumer_secret}&${oauth_token}`, `${method}&${encodeURIComponent(REQUEST_TOKEN_URL)}&${normalized}`);

// console.log($.param(params));

d3.select("#authorise").attrs({
    href: AUTHORIZE_URL+"?"+$.param(params)
});











var token = "";
var method = "GET";
var requestParams :any = {
    extra: "stuff",
    oauth_callback: encodeURIComponent("https://dataviz.david-ma.net/smugmug-test.html"),
    oauth_consumer_key: consumer_key,
    oauth_nonce: Math.random().toString().replace("0.",""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Date.now()
}
var normalized = encodeURIComponent($.param(requestParams));

requestParams.oauth_signature = b64_hmac_sha1(`${consumer_secret}&${token}`, `${method}&${encodeURIComponent(REQUEST_TOKEN_URL)}&${normalized}`);

console.log("requestParams", requestParams);

// Just click the link and copy paste our tokens back
d3.select("#requestToken").attrs({
    href: REQUEST_TOKEN_URL+"?"+$.param(requestParams)
});


// Doesn't work because of CORS or something..?
// $("#requestToken").on("click", function(d){
//     console.log("requesting token!");
//     $.ajax({
//         method: method,
//         contentType: "x-www-form-urlencoded",
//         headers: requestParams,
//         data: requestParams,
//         url: REQUEST_TOKEN_URL+"?"+$.param(requestParams),
//         complete: function(d){
//             console.log(d);
//         }
//     })

// })







var accessParams :any = {
    // access: "Full",
    APIKey: consumer_key,
    // permissions: "Modify",
    // oauth_callback: encodeURIComponent("https://photos.david-ma.net/api/v2!siteuser"),
    oauth_consumer_key: consumer_key,
    oauth_nonce: Math.random().toString().replace("0.",""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Date.now(),
    oauth_token: oauth_token,
    oauth_verifier: oauth_verifier,
    oauth_version: "1.0a"
}
var normalizedAccess = encodeURIComponent($.param(accessParams));
var method = "GET";

accessParams.oauth_signature = b64_hmac_sha1(`${consumer_secret}&${oauth_token_secret}`,
`${method}&${encodeURIComponent(ACCESS_TOKEN_URL)}&${normalizedAccess}`
);



d3.select("#access").attrs({
    href: ACCESS_TOKEN_URL+"?"+$.param(accessParams)
});















var target_url = "https://photos.david-ma.net/api/v2!siteuser";
target_url = "https://api.smugmug.com/api/v2!authuser";


var normalParams :any = {
    // access: "Full",
    APIKey: consumer_key,
    // permissions: "Modify",
    oauth_callback: encodeURIComponent(target_url),
    oauth_consumer_key: consumer_key,
    oauth_nonce: Math.random().toString().replace("0.",""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Date.now(),
    oauth_token: access_token
}
var normalized = encodeURIComponent($.param(normalParams));
var method = "GET";

normalParams.oauth_signature = b64_hmac_sha1(`${consumer_secret}&${access_token_secret}`,
// `${normalized}`
`${method}&${encodeURIComponent(target_url)}&${normalized}`
);

normalParams.oauth_signature = encodeURIComponent(normalParams.oauth_signature);

console.log(normalParams.oauth_signature);

globalThis.smugmug = smugmug;
function smugmug () {
    console.log(normalParams);
    console.log($.param(normalParams));
    $.ajax({
        method: method,
        url: `${target_url}?${$.param(normalParams)}`,
        // url: `https://api.smugmug.com/api/v2/user/frostickle!nodes?APIKey=${consumer_key}`,
        headers: {
            // Authorization: "OAuth",
            Accept: "application/json; charset=utf-8"
        },
        // data: "data",
        success: function (d) {
            console.log("Success", d);
            console.log("Response", d.Response);
            console.log("Keys: "+Object.keys(d.Response).join(", "));
        },
        error: function(error) {
            console.error(error);
        }
    })
}


// frostickle primary node: SCSW8

globalThis.createFolder = createFolder;
function createFolder () {
    $.ajax({
        method: "POST",
        url: `https://api.smugmug.com/api/v2/folder/frostickle/Thalia/Cats!albums?APIKey=${consumer_key}`,
        headers: {
            Accept: "application/json; charset=utf-8"
        },
        data: {"NiceName": "Big-Cats", "Title": "Big Cats", "Privacy": "Public"},
        success: function (d) {
            console.log("Success", d);
        },
        error: function(error) {
            console.error(error);
        }
    })
}








// https://github.com/pH200/hmacsha1-js
function b64_hmac_sha1(k, d, _p ?, _z ?) {
    // heavily optimized and compressed version of http://pajhome.org.uk/crypt/md5/sha1.js
    // _p = b64pad, _z = character size; not used here but I left them available just in case
    if (!_p) { _p = '='; } if (!_z) { _z = 8; } function _f(t, b, c, d) { if (t < 20) { return (b & c) | ((~b) & d); } if (t < 40) { return b ^ c ^ d; } if (t < 60) { return (b & c) | (b & d) | (c & d); } return b ^ c ^ d; } function _k(t) { return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514; } function _s(x, y) { var l = (x & 0xFFFF) + (y & 0xFFFF), m = (x >> 16) + (y >> 16) + (l >> 16); return (m << 16) | (l & 0xFFFF); } function _r(n, c) { return (n << c) | (n >>> (32 - c)); } function _c(x, l) { x[l >> 5] |= 0x80 << (24 - l % 32); x[((l + 64 >> 9) << 4) + 15] = l; var w = [80], a = 1732584193, b = -271733879, c = -1732584194, d = 271733878, e = -1009589776; for (var i = 0; i < x.length; i += 16) { var o = a, p = b, q = c, r = d, s = e; for (var j = 0; j < 80; j++) { if (j < 16) { w[j] = x[i + j]; } else { w[j] = _r(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1); } var t = _s(_s(_r(a, 5), _f(j, b, c, d)), _s(_s(e, w[j]), _k(j))); e = d; d = c; c = _r(b, 30); b = a; a = t; } a = _s(a, o); b = _s(b, p); c = _s(c, q); d = _s(d, r); e = _s(e, s); } return [a, b, c, d, e]; } function _b(s) { var b = [], m = (1 << _z) - 1; for (var i = 0; i < s.length * _z; i += _z) { b[i >> 5] |= (s.charCodeAt(i / 8) & m) << (32 - _z - i % 32); } return b; } function _h(k, d) { var b = _b(k); if (b.length > 16) { b = _c(b, k.length * _z); } var p = [16], o = [16]; for (var i = 0; i < 16; i++) { p[i] = b[i] ^ 0x36363636; o[i] = b[i] ^ 0x5C5C5C5C; } var h = _c(p.concat(_b(d)), 512 + d.length * _z); return _c(o.concat(h), 512 + 160); } function _n(b) { var t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", s = ''; for (var i = 0; i < b.length * 4; i += 3) { var r = (((b[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((b[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) | ((b[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF); for (var j = 0; j < 4; j++) { if (i * 8 + j * 6 > b.length * 32) { s += _p; } else { s += t.charAt((r >> 6 * (3 - j)) & 0x3F); } } } return s; } function _x(k, d) { return _n(_h(k, d)); } return _x(k, d);
}
