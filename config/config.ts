import { Thalia } from '../../../server/thalia'
import { config as smugmugConfig } from './smugmug'
import { config as awesomeConfig } from './awesome'

import path from 'path'
import http from 'http'
import fs from 'fs'

import mustache from 'mustache'
import _ from 'lodash'
const fsPromise = fs.promises
const formidable = require('formidable')

// These have been set to false because they take an extra second to load and we don't need them if we're not scraping any websites.
let xray, request, tabletojson
let scrapingToolsLoaded = false
if (scrapingToolsLoaded) {
  xray = require('x-ray')()
  request = require('request')
  tabletojson = require('tabletojson')
}

let gitHash :string = (new Date()).getTime().toString() // use the start up time as fallback if a proper git hash is unavailable
try {
  const rawGitHash = fs.readFileSync(path.resolve(__dirname, 'git-commit-version.txt'), 'utf8');
  gitHash = rawGitHash.split('-').pop().trim()
} catch(e){}

// Asynchronous for each, doing a limited number of things at a time.
async function asyncForEach (array, limit, callback) {
  let i = 0

  for (; i < limit; i++) {
    doNextThing(i)
  }

  function doNextThing (index) {
    if (array[index]) {
      callback(array[index], index, array, function done () {
        doNextThing(i++)
      })
    }
  }

  return 1
}

function sanitise (string) {
  return string.replace(/\W+/g, ' ').trim().replace(/\W/g, '_').toLowerCase()
}

// TODO: handle rejection & errors?
async function loadTemplates (template, content = '') {
  return new Promise((resolve) => {
    const promises = []
    const filenames = ['template', 'content']

    // Load the mustache template (outer layer)
    promises.push(
      // fsPromise.readFile(`${__dirname}/../views/${template}`, {
      fsPromise.readFile(path.resolve(__dirname, '..', 'views', template), {
        encoding: 'utf8'
      })
    )

    // Load the mustache content (innermost layer)
    promises.push(
      new Promise((resolve) => {
        if (Array.isArray(content) && content[0]) content = content[0]
        // fsPromise.readFile(`${__dirname}/../views/content/${content}.mustache`, {
        fsPromise.readFile(path.resolve(__dirname, '..', 'views', 'content', content + '.mustache'), {
          encoding: 'utf8'
        }).then(result => {
          try {
            const scriptEx = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/g
            const styleEx = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/g

            const scripts = [...result.matchAll(scriptEx)].map(d => d[0])
            const styles = [...result.matchAll(styleEx)].map(d => d[0])

            resolve({
              content: result.replace(scriptEx, '').replace(styleEx, ''),
              scripts: scripts.join('\n'),
              styles: styles.join('\n')
            })
          } catch (e) {
            resolve({
              content: result
            })
          }
        }).catch((e) => {
          // fsPromise.readFile(`${__dirname}/../views/404.mustache`, {
          fsPromise.readFile(path.resolve(__dirname, '..', 'views', '404.mustache'), {
            encoding: 'utf8'
          }).then(result => {
            resolve(result)
          })
        })
      })
    )

    // Load all the other partials we may need
    // fsPromise.readdir(`${__dirname}/../views/partials/`)
    fsPromise.readdir(path.resolve(__dirname, '..', 'views', 'partials'))
      .then(function (d) {
        d.forEach(function (filename) {
          if (filename.indexOf('.mustache') > 0) {
            filenames.push(filename.split('.mustache')[0])
            promises.push(
              // fsPromise.readFile(`${__dirname}/../views/partials/${filename}`, {
              fsPromise.readFile(path.resolve(__dirname, '..', 'views', 'partials', filename), {
                encoding: 'utf8'
              })
            )
          }
        })

        Promise.all(promises).then(function (array) {
          const results :any = {}
          filenames.forEach((filename, i) => { results[filename] = array[i] })

          if (typeof results.content === 'object') {
            results.scripts = results.content.scripts
            results.styles = results.content.styles
            results.content = results.content.content
          }

          resolve(results)
        })
      })
  })
}

const base = 'https://www.digicamdb.com/'

let config :Thalia.WebsiteConfig = {
  services: {
    scrapeAllCameras: function (res, req, db) {
      if (!scrapingToolsLoaded) {
        scrapingToolsLoaded = true
        xray = require('x-ray')()
        request = require('request')
        tabletojson = require('tabletojson')
      }

      db.Scrape.findAll({
        where: {
          // brand: brand.toLowerCase()
        }
      }).then(function (d) {
        const results = d.map(d => d.dataValues)

        if (results.length > 0) {
          // async.mapLimit(results, 20, function(d, loopback){
          asyncForEach(results, 20, function (d, i, array, done) {
            const target = d.link
            const brand = d.title.split(/(?<=^\S+)\s/)[0].trim()
            const model = d.title.split(/(?<=^\S+)\s/)[1].trim()

            return db.Camera.findAll({
              where: {
                brand: brand,
                model: model
              }
            }).then(function (d) {
              if (d.length === 0) {
                console.log(model)
                request.get(base + target, function (err, response, html) {
                  if (err) {
                    console.log(err)
                    res.end('error making request' + err)
                  }
                  xray(html, '.table_specs@html').then((d) => {
                    if (d) {
                      d = d.replace(/<span class="yes"><\/span>/g, 'Yes')
                        .replace(/<span class="no"><\/span>/g, 'No')

                      const data = tabletojson.convert(`<table>${d}</table>`)[0]

                      const camera = data.reduce((obj, detail) => {
                        obj[sanitise(detail[0])] = detail[1]
                        return obj
                      }, {})

                      db.Camera.create(camera)
                      done()
                    } else {
                      console.log("Couldn't do this " + model)
                      done()
                    }
                  }).catch(e => res.end('fail??? ' + JSON.stringify(e.message)))
                })
              } else {
                done()
              }
            })
          })
          res.end('Ok!')
        } else {
          res.end('fail')
        }
      })
    },

    // Todo: fix this one.
    // The on-demand loading of tools isn't really working.
    scrapeAllBrands: function (res, req, db) {
      if (!scrapingToolsLoaded) {
        scrapingToolsLoaded = true
        xray = require('x-ray')()
        request = require('request')
        tabletojson = require('tabletojson')
      }
      const brands = ['canon', 'fujifilm', 'leica', 'nikon', 'olympus', 'panasonic', 'pentax', 'ricoh', 'samsung', 'sony', 'zeiss']

      asyncForEach(brands, 1, function (brand, iterator, brands, done) {
        let lastPageReached = false
        let i = 0

        // TODO: the lastPageReached thing doesn't work... because it loops through all 20 requests before the first one finishes.
        while (!lastPageReached && i < 20) {
          i++
          console.log(`Scrapeing Page ${i} of ${brand}`)
          request.get(`${base}cameras/${brand}/${i}/`, function (err, response, html) {
            if (err) {
              return err
            }
            if (response.statusCode >= 400) {
              return new Error('400 error')
            }

            xray(html, '.newest_div', [{
              img: 'img@src',
              title: 'a.newest',
              link: 'a.newest@href',
              year: 'span.font_smaller'
            }])
              .then(function (stuff) {
                console.log(stuff)
                if (stuff.length === 0) lastPageReached = true

                stuff.forEach(function (camera) {
                  camera.title = camera.title.trim()
                  camera.brand = brand
                  camera.year = camera.year.substr(1, 4)
                  db.Scrape.create(camera)
                })
              }).catch(err => console.log('ok error..', err))
          })
        }
        done()
      }).then(function (d) {
        console.log('hello? ' + d)
        res.end('done?')
      })
    },
    camera: function (res, req, db, type = '') {
      const Op = db.Sequelize.Op
      const promises = []
      const brand = type.indexOf('_') > 0 ? type.split('_')[0] : ''
      const model = type.indexOf('_') > 0 ? type.split('_')[1].replace(/-/g, ' ') : ''

      promises.push(loadTemplates('camera.mustache'))

      // Get the data from the database
      promises.push(
        db.Camera.findAll({
          attributes: ['brand', 'model', 'year'],
          where: {
            year: {
              [Op.gt]: 2010
            }
          }
        })
      )

      promises.push(
        db.Camera.findOne({
          where: {
            brand: brand,
            model: model
          }
        })
      )

      promises.push(
        db.Scrape.findOne({
          where: {
            link: {
              [Op.like]: `%${type}%`
            }
          }
        })
      )

      Promise.all(promises).then(function ([views, allCameras, model, scrape]) {
        if (model) {
          const data = {
            gitHash: gitHash,
            model: model.dataValues,
            scrape: scrape.dataValues,
            cameraData: JSON.stringify(model.dataValues),
            allCameras: JSON.stringify(allCameras.map(d => `${d.brand} ${d.model} (${d.year})`))
          }

          const output = mustache.render(views.template, data, views)
          res.end(output)
        } else {
          res.end('No model found')
        }
      })
    },
    'brand-data': function (res, req, db, type) {
      db.Camera.findAll({
        where: {
          brand: type
        }
      }).then(d => {
        res.end(JSON.stringify(d))
      })
    },
    brand: function (res, req, db, type) {
      const promises = [loadTemplates('brand.mustache')]
      promises.push(db.Camera.findAll({
        where: {
          brand: type
        }
      }))
      promises.push(db.Family.findAll({
        where: {
          brand: type
        }
      }))

      Promise.all(promises).then(function ([views, cameras, familes] :[any, any, any]) {
        const data :any = {
          gitHash: gitHash
        }
        data.cameras = JSON.stringify(cameras)
        data.brand = type
        data.familes = JSON.stringify(familes)

        const output = mustache.render(views.template, data, views)
        res.end(output)
      })
    },
    'all-cameras': function (res, req, db) {
      // res.end("hello");
      db.Camera.findAll({
        attributes: ['brand', 'model', 'year'],
        where: {
          year: {
            [db.Sequelize.Op.gt]: 2010
          }
        }
      }).then(d => res.end(JSON.stringify(d.map(d => `${d.brand} ${d.model} (${d.year})`))))
    },
    fetchCamera: function (res, req, db, type) {
      console.log('Request for a camera..')
      // console.log(db);
      // console.log(db.Camera);
      // console.log(type);

      db.Camera.findOne({
        where: {
          name: type
        }
      }).then(function (d) {
        console.log(d)
        res.end(JSON.stringify(d))
      }).catch(e => {
        console.log('Error??', e)

        res.end('bad')
      })

      // return 200;
      // res.end("Requesting camera...");
    },
    upload: function (res, req) {
      const uploadFolder = 'websites/dataviz/data/campjs/'
      const form = formidable()
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.log('Error uploading!')
          res.writeHead(500)
          res.end(err)
        } else {
          Object.keys(files).forEach((inputfield) => {
            const file = files[inputfield]
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
    },
    blog: function blogpost (router) {
      const promises = [loadTemplates('blog.mustache', router.path)]
      Promise.all(promises).then(function ([views]: [any]) {
        const data: any = {
          gitHash: gitHash
        }
        router.db.Blogpost.findAll({
          where: {
            published: true
          },
          order: [['published', 'DESC']]
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

config = _.merge(config, smugmugConfig, awesomeConfig)

export { config }
