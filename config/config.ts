import { Thalia } from '../../../server/thalia'
import { config as smugmugConfig } from './smugmug'
import { config as awesomeConfig } from './awesome'
import { config as cameraConfig } from './camera'
import { gitHash, loadTemplates } from './utilities'
import { config as atlassianConfig } from './atlassianBackend'

import path from 'path'
import http from 'http'
import fs from 'fs'

import mustache from 'mustache'
import _ from 'lodash'
const fsPromise = fs.promises
import Formidable from 'formidable'


let config :Thalia.WebsiteConfig = {
  services: {
    fridge_images: function(res, req, db) {
      const filter = [".DS_Store", ".gitignore", "david", "grace", "index.html", "printed"]

      fsPromise.readdir(path.resolve(__dirname, '..', 'public', 'fridge', 'images'))
        .then(function(images){
          images = images.filter(d => filter.indexOf(d) === -1)
          res.end(JSON.stringify(images))
        })
    },

    upload: function (res, req) {
      const uploadFolder = 'websites/dataviz/data/campjs/'
      const form = new Formidable.IncomingForm();
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.log('Error uploading!')
          res.writeHead(500)
          res.end(err)
        } else {
          Object.keys(files).forEach((inputfield) => {
            const file = files[inputfield] as Formidable.File
            const newLocation = uploadFolder + file.name

            fs.rename(file.path, newLocation, function (err) {
              if (err) {
                console.log('Error renaming file')
                res.writeHead(500)
                res.end(err)
              } else {
                res.end('success')
              }
            })
          })
        }
      })
    },
    curl: function (incomingResponse, incomingRequest, db, type) { // eslint-disable-line
      // This is just to experimenting with http.request
      // It isn't needed for anything

      const options = {
        host: 'www.github.com',
        port: 80,
        path: '/',
        method: 'GET'
      }

      const req = http.request(options, function (res) {
        console.log('STATUS: ' + res.statusCode)
        console.log('HEADERS: ' + JSON.stringify(res.headers))
        res.setEncoding('utf8')
        res.on('data', function (chunk) {
          console.log('BODY: ' + chunk)
        })
      })

      req.on('error', function (e) {
        console.log('problem with request: ' + e.message)
      })

      req.on('close', function () {
        incomingResponse.end('Uhhh we did a thing')
      })

      // write data to request body
      //    req.write('data\n');
      //    req.write('data\n');
      req.end()
    }
  },
  mustacheIgnore: ['homepage', 'upload_experiment', 'camera', 'blog', '404'],
  controllers: {
    '': function homepage (router) {
      if( !router.db ) {
        router.res.end('Database not connected')
      } else {
        const promises = [loadTemplates('homepage.mustache')]
        Promise.all(promises).then(function ([views]: [any]) {
          const data: any = {
            gitHash: gitHash
          }
          router.db.Blogpost.findAll({
            where: {
              published: true
            },
            order: [['publish_date', 'DESC']]
          }).then((results) => {
            data.blogposts = results.map(d => d.dataValues)

            const output = mustache.render(views.template, data, views)
            router.res.end(output)
          })
        })
      }
    },
    blog: function blogpost (router) {
      if( !router.db ) {
        router.res.end('Database not connected')
      } else {
        const promises = [loadTemplates('blog.mustache', router.path)]
        Promise.all(promises).then(function ([views]: [any]) {
          const data: any = {
            gitHash: gitHash
          }
          router.db.Blogpost.findAll({
            where: {
              published: true
            },
            order: [['publish_date', 'DESC']]
          }).then((results) => {
            data.blogposts = results.map(d => d.dataValues)
            data.blogpost = data.blogposts.filter(d => d.shortname === router.path[0])

            try {
              const shortname = router.path[0]
              data.typescript = `'/js/${shortname}.js'`
            } catch (e) { }

            const output = mustache.render(views.template, data, views)
            router.res.end(output)
          })
        })
      }
    },
    experiment: function (router) {
      const promises = [loadTemplates('upload_experiment.mustache')]
      Promise.all(promises).then(function ([views] :[any]) {
        const data = {
          gitHash: gitHash
        }

        const output = mustache.render(views.template, data, views)
        router.res.end(output)
      })
    },
    stickers: function (router) {
      const promises = [loadTemplates('stickers.mustache')]

      Promise.all(promises).then(function ([views] :[any]) {
        const data = {
          gitHash: gitHash
        }

        const output = mustache.render(views.template, data, views)
        router.res.end(output)
      })
    }
  }
}

if(fs.existsSync(path.resolve(__dirname, 'config.json'))) {
  config = _.merge(config, smugmugConfig)
} else {
  console.warn("config.json not provided, skipping smugmug stuff")
}

config = _.merge(config, awesomeConfig)
config = _.merge(config, cameraConfig)

config = _.merge(config, atlassianConfig)

export { config }
