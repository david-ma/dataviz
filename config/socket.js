"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = void 0;
let text = "Write here";
const socket = {
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
            (socket, db) => { socket.emit("text", { data: text }); }
        ]
    }
};
exports.socket = socket;
