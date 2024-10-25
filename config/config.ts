import { Thalia, loadViewsAsPartials, setHandlebarsContent } from 'thalia'
import { config as smugmugConfig } from './smugmug'
import { gitHash } from './utilities'

import path from 'path'
import http from 'http'
import fs from 'fs'

import _ from 'lodash'
const fsPromise = fs.promises
import Formidable from 'formidable'

let config: Thalia.WebsiteConfig = {
  services: {
    fridge_images: function (res, req, db) {
      const basePath = path.resolve(__dirname, '..', 'data', 'fridge')

      // check if az_images, ruby_images and renee_images exist
      if (
        !fs.existsSync(path.resolve(basePath, 'az_images')) ||
        !fs.existsSync(path.resolve(basePath, 'ruby_images')) ||
        !fs.existsSync(path.resolve(basePath, 'renee_images'))
      ) {
        res.end('No images')
        return
      }

      const filter = [
        '.DS_Store',
        '.gitignore',
        'david.png',
        'grace.png',
        'index.html',
        'printed',
      ]

      Promise.all([
        fsPromise.readdir(path.resolve(basePath, 'az_images')),
        fsPromise.readdir(path.resolve(basePath, 'ruby_images')),
        fsPromise.readdir(path.resolve(basePath, 'renee_images')),
      ]).then(function ([az, ruby, renee]) {
        var images = az
          .filter((d) => filter.indexOf(d) === -1)
          .map((d) => 'az_images/' + d)
          .concat(
            ruby
              .filter((d) => filter.indexOf(d) === -1)
              .map((d) => 'ruby_images/' + d)
          )
          .concat(
            renee
              .filter((d) => filter.indexOf(d) === -1)
              .map((d) => 'renee_images/' + d)
          )

        res.end(JSON.stringify(images))
      })
    },
    lims_logs: function (res, req, db) {
      const basePath = path.resolve(
        __dirname,
        '..',
        'data',
        'AGRF',
        'IISLogs'
      )

      if (!fs.existsSync(path.resolve(basePath))) {
        res.end('No data')
        return
      }

      fsPromise
        .readdir(path.resolve(basePath))
        .then((files) => files.filter((d) => d.indexOf('.log.gz') > -1))
        // .then((files) => files.filter((d) => d.indexOf('CAGRF') == -1)) // Non-standard IDs
        .then((files) => files.map((d) => d.replace('.log.gz', '.log')))
        // Limit 368
        .then((files) => files.slice(1103, 2000))

        // Limit 10
        // .then((files) => files.slice(0, 10))
        .then((files) => res.end(JSON.stringify(files)))
    },
    summary_jsons: function (res, req, db) {
      const basePath = path.resolve(
        __dirname,
        '..',
        'data',
        'AGRF',
        'summary_jsons'
      )

      if (!fs.existsSync(path.resolve(basePath))) {
        res.end('No data')
        return
      }

      fsPromise
        .readdir(path.resolve(basePath))
        .then((files) => files.filter((d) => d.indexOf('.json') > -1))
        // .then((files) => files.filter((d) => d.indexOf('CAGRF') == -1)) // Non-standard IDs
        .then((files) => files.map((d) => d.replace('.json.gz', '.json')))
        .then((files) => res.end(JSON.stringify(files)))
    },
    clinical: function (res, req) {
      const basePath = path.resolve(__dirname, '..', 'data', 'AGRF', 'clinical')

      if (!fs.existsSync(path.resolve(basePath))) {
        res.end('No data')
        return
      }

      fsPromise
        .readdir(path.resolve(basePath))
        .then((files) => files.filter((d) => d.indexOf('.json') > -1))
        // .then((files) => files.filter((d) => d.indexOf('CAGRF') == -1)) // Non-standard IDs
        .then((files) => files.map((d) => d.replace('.json.gz', '.json')))
        .then((files) => res.end(JSON.stringify(files)))
    },

    upload: function (res, req) {
      const uploadFolder = 'websites/dataviz/data/campjs/'
      const form = new Formidable.IncomingForm()
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.log('Error uploading!')
          res.writeHead(500)
          res.end(err)
        } else {
          Object.keys(files).forEach((inputfield) => {
            // const file = files[inputfield] as Formidable.File
            const file: any = files[inputfield]
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
    curl: function (incomingResponse, incomingRequest, db, type) {
      // eslint-disable-line
      // This is just to experimenting with http.request
      // It isn't needed for anything

      const options = {
        host: 'www.github.com',
        port: 80,
        path: '/',
        method: 'GET',
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
    },
  },
  mustacheIgnore: ['homepage', 'upload_experiment', 'camera', 'blog', '404'],
  controllers: {
    '': function homepage(router) {
      if (!router.db) {
        router.res.end('Database not connected')
      } else {
        const promises = [new Promise(router.readAllViews)]
        Promise.all(promises).then(function ([views]: [any]) {
          const data: any = {
            gitHash: gitHash,
          }
          router.db.Blogpost.findAll({
            where: {
              published: true,
            },
            order: [['publish_date', 'DESC']],
          }).then((results) => {
            data.blogposts = results.map((d) => d.dataValues)

            const template = router.handlebars.compile(views.homepage)
            loadViewsAsPartials(views, router.handlebars)
            router.res.end(template(data))
          })
        })
      }
    },
    blog: function blogpost(router) {
      if (!router.db) {
        router.res.end('Database not connected')
      } else {
        // const promises = [loadTemplates('blog.mustache', router.path)]
        const promises = [new Promise(router.readAllViews)]
        Promise.all(promises).then(function ([views]: [any]) {
          const data: any = {
            gitHash: gitHash,
          }
          router.db.Blogpost.findAll({
            where: {
              published: true,
            },
            order: [['publish_date', 'DESC']],
          }).then((results) => {
            data.blogposts = results.map((d) => d.dataValues)
            data.blogpost = data.blogposts.filter(
              (d) => d.shortname === router.path[0]
            )

            try {
              const shortname = router.path[0]
              data.typescript = `"/js/${shortname}.js"`
            } catch (e) {}

            const template = router.handlebars.compile(views.blog)
            setHandlebarsContent(views[router.path[0]], router.handlebars).then(
              () => {
                router.handlebars.registerHelper(
                  'parseArray',
                  (array, options) => array.split(',').map(options.fn).join('')
                )

                try {
                  loadViewsAsPartials(views, router.handlebars)
                  router.res.end(template(data))
                } catch (error) {
                  console.log('Error in dataviz/blog')
                  console.log(error)
                  router.res.end('Error loading content:<br>' + error.message)
                }
              },
              (error) => {
                console.log('Error in dataviz/blog')
                console.log(error)
                router.res.end('Error loading content')
              }
            )
          })
        })
      }
    },
  },
}

if (fs.existsSync(path.resolve(__dirname, 'config.json'))) {
  config = _.merge(config, smugmugConfig)
} else {
  console.warn('config.json not provided, skipping smugmug stuff')
}

// import { config as awesomeConfig } from './awesome'
// config = _.merge(config, awesomeConfig)

// import { config as cameraConfig } from './camera'
// config = _.merge(config, cameraConfig)

// import { config as atlassianConfig } from './atlassianBackend'
// config = _.merge(config, atlassianConfig)

export { config }
