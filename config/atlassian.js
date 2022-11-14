"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
let config = {
    services: {
        hello: function (res, req, db) {
            res.end('Hello world!');
        }
    },
};
exports.config = config;
