"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const lodash_1 = __importDefault(require("lodash"));
const goBoard = {};
const config = {
    sockets: {
        on: [
            {
                name: 'fullGoBoard',
                callback: function (socket, packet, seq) {
                    socket.broadcast.emit('fullGoBoard', packet);
                    lodash_1.default.merge(goBoard, {
                        [packet.name]: packet.data
                    });
                }
            }
        ],
        emit: [
            (socket, seq) => { socket.emit('fullGoBoard', goBoard); }
        ]
    }
};
exports.config = config;
