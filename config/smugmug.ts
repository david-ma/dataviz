import { IncomingMessage, ServerResponse } from 'http'
import { IncomingForm } from 'formidable'
import { Thalia } from '../../../server/thalia'

// const _ = require('lodash')
import _ from 'lodash'
import path from 'path'

const tokens :{
    'consumer_key' : string;
    'consumer_secret' : string;
    'oauth_token' : string;
    'oauth_token_secret': string;
} = require('./config.json').smugmug

const formidable = require('formidable')
import fs = require('fs');
import https = require('https');
import mime = require('mime');
import crypto = require('crypto');

const config :Thalia.WebsiteConfig = {
  services: {
    test: function (res :ServerResponse, req :IncomingMessage) { // eslint-disable-line
      res.end('Hello World')
    },
    uploadPhoto: function (res :ServerResponse, req :IncomingMessage) {
      // const uploadFolder = `${__dirname}/../data/tmp/`
      const uploadFolder = path.resolve(__dirname, '..', 'data', 'tmp')

      const form :IncomingForm = formidable({
        maxFileSize: 25 * 1024 * 1024 // 25 megabytes. Note we're also putting this size limit in nginx.conf
      })
      // console.log("uploading files to ", uploadFolder);

      form.parse(req, (err :Error, fields, files) => {
        if (err) {
          res.writeHead(413, err.message)
          res.end(err.message)
        }

        Object.keys(files).forEach((inputfield) => {
          const file = files[inputfield]
          const newLocation = path.resolve(uploadFolder, file.name)

          fs.rename(file.path, newLocation, function (err) {
            if (err) {
              console.error(err)
              res.end(err)
              return
            }

            const filetype = mime.getType(newLocation) // eslint-disable-line
            const data = fs.readFileSync(newLocation)

            console.log('data.length is:', data.length)
            console.log('Buffer length..?', Buffer.byteLength(data))
            // console.log("Filetype", filetype);
            // console.log("data is", data);

            const host = 'api.smugmug.com'
            // var host = 'api.smugmug.com'
            // var path = '/api/v2/node/QdvhkM'
            // var path = '/api/v2/album/jHhcL7'
            const path = '/api/v2/album/jHhcL7!uploadfromuri'
            // var path = '/api/v2/album/jHhcL7!images'
            const targetUrl = `https://${host}${path}`

            // var targetUrl = "https://upload.smugmug.com/api/v2/node/QdvhkM";
            const method = 'POST'

            const MD5 = crypto.createHash('md5').update(data).digest('hex')

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
            })

            const extraParams = {
              // ByteCount: Buffer.byteLength(data),
              // MD5Sum: MD5
            }
            const params = signRequest(method, targetUrl, extraParams)

            console.log('Authorization', bundleAuthorization(targetUrl, params))

            console.log('MD5', MD5)

            const options = {
              // host: 'photos.david-ma.net',
              // host: 'upload.smugmug.com',
              host: host,
              port: 443,
              // path: '/api/v2/album/jHhcL7',
              // path: '/api/v2/node/QdvhkM',
              path: path,
              method: method,

              headers: {
                Authorization: bundleAuthorization(targetUrl, params),
                // 'Content-Type': filetype,
                // 'X-Smug-AlbumUri': path,
                // 'X-Smug-ResponseType': 'JSON',
                // 'X-Smug-Version': 'v2',

                // 'X-Smug-FileName': "blah",
                // 'X-Smug-Title': "blahblah",
                // 'X-Smug-AlbumUri': '/api/v2/album/jHhcL7',
                // 'X-Smug-AlbumUri': '/api/v2/node/QdvhkM',
                // 'Content-MD5': MD5,
                // host: '122.150.70.136:1337',
                // Connection: "keep-alive",
                'Content-Type': 'application/json',
                'Content-Length': payload.length,
                Accept: 'application/json; charset=utf-8'
              }
            }

            const req = https.request(options, function (res :IncomingMessage) {
              console.log('STATUS: ' + res.statusCode)
              console.log('HEADERS: ' + JSON.stringify(res.headers))

              res.setEncoding('utf8')
              res.on('data', function (chunk) {
                console.log('BODY: ' + chunk)
              })
            })

            req.on('error', function (e) {
              console.log('problem with request: ' + e.message)
              console.log(e)
            })

            req.write(payload)
            req.end()

            res.end('success')
          })
        })
      })
    }
  }
}

// Useful resources:
// https://oauth.net/core/1.0a/
// https://medium.com/@imashishmathur/0auth-a142656859c6
// https://developer.chrome.com/extensions/examples/extensions/oauth_contacts/chrome_ex_oauthsimple.js
// https://github.com/pH200/hmacsha1-js
function b64_hmac_sha1 (key :string, data: string) {  // eslint-disable-line
  return crypto.createHmac('sha1', key).update(data).digest('base64')
}

function oauthEscape (string :string) {
  if (string === undefined) {
    return ''
  }
  if (string as any instanceof Array) {
    throw ('Array passed to _oauthEscape') // eslint-disable-line
  }
  return encodeURIComponent(string).replace(/\!/g, '%21') // eslint-disable-line
    .replace(/\*/g, '%2A')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
};

function bundleAuthorization (url :string, params :object) {
  const keys = Object.keys(params)
  const authorization = `OAuth realm="${url}",${keys.map(key => `${key}="${params[key]}"`).join(',')}`
  return authorization
}

function expandParams (params) {
  return Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
}

function signRequest (method :string, targetUrl :string, extraParams ?:object) {
  const normalParams :any = {
    oauth_consumer_key: tokens.consumer_key,
    oauth_nonce: Math.random().toString().replace('0.', ''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Date.now(),
    oauth_token: tokens.oauth_token,
    oauth_token_secret: tokens.oauth_token_secret,
    oauth_version: '1.0'
  }

  const normalized = oauthEscape(expandParams(sortParams(_.merge(normalParams, extraParams))))

  normalParams.oauth_signature = b64_hmac_sha1(`${tokens.consumer_secret}&${tokens.oauth_token_secret}`,
    `${method}&${oauthEscape(targetUrl)}&${normalized}`
  )
  return normalParams
}

function sortParams (object:object) {
  const keys = Object.keys(object).sort()
  const result = {}
  keys.forEach(function (key) {
    result[key] = object[key]
  })
  console.log(result)
  return result
}

export { config }
