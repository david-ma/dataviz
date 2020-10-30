

let datastore = {};
// Transient data store, will need to use a real database in future.

import _ from 'lodash';
import { Thalia } from '../../../server/thalia';

const config :Thalia.WebsiteConfig = {
    sockets: {
        on: [
            {
                'name': "overwriteText",
                callback: function (socket, packet, seq) {
                    socket.broadcast.emit("overwriteText", packet);
                    _.merge(datastore, {
                        [packet.name] : packet.data
                    });
                }
            }
        ],
        emit: [
            (socket, db ) => { socket.emit("allData", datastore); }
        ]
    }
}

export { config }
