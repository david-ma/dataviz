"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
let datastore = {};
const lodash_1 = __importDefault(require("lodash"));
const config = {
    sockets: {
        on: [
            {
                'name': "overwriteText",
                callback: function (socket, packet, seq) {
                    socket.broadcast.emit("overwriteText", packet);
                    lodash_1.default.merge(datastore, {
                        [packet.name]: packet.data
                    });
                }
            }
        ],
        emit: [
            (socket, db) => { socket.emit("allData", datastore); }
        ]
    }
};
exports.config = config;