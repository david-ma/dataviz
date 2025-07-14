// Transient data store, will need to use a real database in future.

import _ from 'lodash'
import { Thalia } from '../../../server/thalia'
const goBoard = {}

const config: Thalia.WebsiteConfig = {
  sockets: {
    on: [
      {
        name: 'fullGoBoard',
        callback: function (socket, packet, seq) {
          // eslint-disable-line
          socket.broadcast.emit('fullGoBoard', packet)
          _.merge(goBoard, {
            [packet.name]: packet.data,
          })
        },
      },
    ],
    emit: [
      (socket, seq) => {
        socket.emit('fullGoBoard', goBoard)
      }, // eslint-disable-line
    ],
  },
}

export { config }
