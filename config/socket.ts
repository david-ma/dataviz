
let text = "Write here"

import { Thalia } from '../../../server';

const socket :Thalia.sockets = {
    sockets: {
        on: [
            {
                'name': "overwriteText",
                callback: function (socket, packet, seq) {
                    text = packet.data;
                    socket.broadcast.emit("text", { data: text });
                }
            }
        ],
        emit: [
            (socket, db ) => { socket.emit("text", { data: text }); }
        ]
    }
}

export { socket }
