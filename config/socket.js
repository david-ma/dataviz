"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socket = void 0;
let text = "Write here";
const socket = {
    sockets: {
        on: [
            {
                'name': "overwriteText",
                callback: function (packet, db, socket) {
                    text = packet.data;
                    socket.broadcast.emit("text", { data: text });
                }
            }
        ],
        emit: [
            {
                'name': "text",
                'data': { data: text }
            }
        ]
    }
};
exports.socket = socket;
