// Transient data store, will need to use a real database in future.

import _ from 'lodash'
import { Thalia } from '../../../server/thalia'
const datastore = {}

const config: Thalia.WebsiteConfig = {
  sockets: {
    on: [
      {
        name: 'overwriteText',
        callback: function (socket, packet, seq) {
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
