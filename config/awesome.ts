// Transient data store, will need to use a real database in future.

import _ from 'lodash'
import { Thalia } from '../../../server/thalia'

const datastore = {}
var AwesomeMetadata = require('../config/db_bootstrap').seq.AwesomeMetadata
AwesomeMetadata.findAll({}).then((data) => {
  data.reduce((acc, d) => {
    _.merge(acc, d.dataValues.value)
    return acc
  }, datastore)
})

import { Op } from 'sequelize'

const config: Thalia.WebsiteConfig = {
  services: {
    awesome: function (res, req, db) {
      var blob = {
        projects: [],
        photos: [],
      }
      const params = new URLSearchParams(req.url.split('?')[1])

      // Try to get the provided date, otherwise give today's date minus 30 days
      var date = Date.parse(params.get('date'))
        ? new Date(params.get('date'))
        : new Date(new Date().setDate(new Date().getDate() - 25))

      const whitelist = [],
            blacklist = []
        // blacklist = [229432, 231426, 233994, 233860, 234555, 234659, 235745, 236850, 238783]

      // const start = 231394,
      //   end = 234099

      const start = 234100,
            end = 239548;

      // start 231394
      // end 234099

      // blacklist name Diana Hallare

      db.AwesomeProject.findAll({
        limit: 100,
        where: {
          // ID is between start and end
          // And it isn't in the blacklist
          // And it isn't Diana Hallare
          [Op.or]: [
            {
              [Op.and]: [
                {
                  id: {
                    [Op.gte]: start,
                  },
                },
                {
                  id: {
                    [Op.lte]: end,
                  },
                },
                {
                  id: {
                    [Op.notIn]: blacklist,
                  },
                },
                {
                  name: {
                    [Op.notLike]: '%Diana Hallare%',
                  },
                },
              ],
            },
            {
              id: {
                [Op.in]: whitelist,
              },
            },
          ],
        },
      })
        .catch(function (err) {
          console.log('ERROR reading database', err)
          res.end(JSON.stringify(err))
        })
        .then(function (projects) {
          blob.projects = projects

          db.AwesomePhoto.findAll({
            where: {
              awesome_project_id: {
                [Op.in]: projects.map((p) => p.id),
              },
            },
          }).then(function (photos) {
            blob.photos = photos
            res.end(JSON.stringify(blob))
          })
        })
    },
  },
  sockets: {
    on: [
      {
        name: 'overwriteText',
        callback: function (socket, packet, db) {
          console.log('packet', packet)

          db.AwesomeMetadata.findOne({
            where: {
              awesome_project_id: packet.id,
            },
          }).then((metadata) => {
            if (metadata) {
              const data = metadata.dataValues

              _.merge(data.value, {
                [packet.name]: packet.data,
              })

              db.AwesomeMetadata.update(data, {
                where: {
                  awesome_project_id: packet.id,
                },
              })
            } else {
              db.AwesomeMetadata.create({
                awesome_project_id: packet.id,
                value: {
                  [packet.name]: packet.data,
                },
              })
            }
          })

          // eslint-disable-line
          socket.broadcast.emit('overwriteText', packet)
          _.merge(datastore, {
            [packet.name]: packet.data,
          })
        },
      },
    ],
    emit: [
      (socket, seq) => {
        socket.emit('allData', datastore)
      }, // eslint-disable-line
    ],
  },
}

export { config }
